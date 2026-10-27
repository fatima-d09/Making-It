// the life sim itself. every function takes the game state and changes it.
// nothing in here knows about React or the canvas, it just pushes modals/toasts into `fx`.
import { CARD_NAME, DAY_NAMES, LATE_FEE, MOVERS, RIDE_APP, SUBWAY_FARE, TAX_RATE, UNLIMITED_PRICE, UNLIMITED_PRICE_BENEFIT } from "../data/constants";
import { COMPANIES, GIGS, HOUSING, ITEMS, JOBS, OFFERS, STATIONS, UNEMPLOYED } from "../data/world";
import type { Fx, GameState, Gig, Job, Look, LogKind, Mate, MateRole, NeedKey, PlaceKey, SpendCat, TraitKey, TravelMode, TravelOption, TravelPlan, WeekStats } from "./types";
import { clamp, fmtDuration, fmtTime, money, pick, rand, randInt, weekday } from "./utils";

export const freshWeek = (): WeekStats => ({ earned: 0, rent: 0, food: 0, transit: 0, fun: 0, other: 0 });

export function createGame(look: Look, name: string, trait: TraitKey, jobKey: string): GameState {
  const starter = JOBS[jobKey];
  const job: Job = { ...structuredClone(starter), key: jobKey };
  const g: GameState = {
    look: { ...look }, name, trait, job, housing: starter.housing,
    mates: structuredClone(HOUSING[starter.housing].mates),
    day: 1, time: 0, location: "home", cash: starter.cash,
    needs: { energy: 82, hunger: 65, fun: 60, social: 60, bladder: 70 },
    meals: starter.meals, items: {}, worn: [],
    unlimitedUntil: starter.perk === "transit" ? 30 : 0,
    pendingPay: 0, invoices: [], gig: null, lookedForGig: 0,
    strikes: 0, worked: {}, cut: {}, longDay: {},
    apps: 0, interview: null, rentDue: 31, rentLateSince: null,
    week: freshWeek(), moodLog: [], log: [], over: false,
  };
  g.time = wakeTimeFor(g, 1);
  const h = HOUSING[g.housing];
  log(g, "Day one in the city. You wake up in your " + h.type.toLowerCase() + " in " + h.hood + ".", "day");
  log(g, "This month's rent is already paid. Next rent is due on day " + g.rentDue + ".");
  startOfDayNotes(g);
  return g;
}

// ---------- small helpers ----------
export function log(g: GameState, text: string, kind: LogKind = "") {
  g.log.unshift({ day: g.day, time: g.time, text, kind });
  if (g.log.length > 140) g.log.length = 140;
}
export function homeMates(g: GameState): Mate[] {
  return g.mates ?? HOUSING[g.housing].mates ?? [];
}
export const mates = (g: GameState, role: MateRole) => homeMates(g).filter((m) => m.role === role);
export function boost(g: GameState, changes: Partial<Record<NeedKey, number>>) {
  for (const k of Object.keys(changes) as NeedKey[]) g.needs[k] = clamp(g.needs[k] + (changes[k] ?? 0), 0, 100);
}
export function spend(g: GameState, amount: number, cat: SpendCat, force = false): boolean {
  if (!force && g.cash < amount) return false;
  g.cash -= amount;
  g.week[cat] += amount;
  return true;
}
export function earn(g: GameState, amount: number) {
  g.cash += amount;
  g.week.earned += amount;
}
export const hasUnlimited = (g: GameState) => g.unlimitedUntil >= g.day;
export const unlimitedPrice = (g: GameState) => (g.job.perk === "transit" ? UNLIMITED_PRICE_BENEFIT : UNLIMITED_PRICE);
export function rentFor(g: GameState, key: string) {
  const h = HOUSING[key];
  return h.full && mates(g, "partner").length ? Math.round(h.rent / 2) : h.rent;
}
export const myRent = (g: GameState) => rentFor(g, g.housing);
export const rentOwed = (g: GameState) => myRent(g) + (g.rentLateSince != null ? LATE_FEE : 0);

export function playerLook(g: GameState): Look {
  const l = { ...g.look };
  for (const k of g.worn) {
    const wear = ITEMS[k]?.wear;
    if (wear) Object.assign(l, wear);
  }
  return l;
}

export function getMood(g: GameState): number {
  const n = g.needs;
  let m = (n.energy + n.hunger + n.fun + n.social + n.bladder) / 5 + HOUSING[g.housing].mood;
  if (g.items.plant) m += 3;
  if (g.items.poster) m += 2;
  if (g.items.lamp) m += 2;
  if (g.items.speaker) m += 2;
  return clamp(Math.round(m), 0, 100);
}
export const moodWord = (m: number) => (m >= 72 ? "Thriving" : m >= 52 ? "Doing okay" : m >= 32 ? "Stressed" : "Barely holding on");
export const moodColor = (m: number) => (m >= 72 ? "#63c34d" : m >= 52 ? "#6cb8ff" : m >= 32 ? "#f2b233" : "#ee5b45");

// ---------- jobs + pay ----------
export function estWeeklyNet(job: Job): number {
  const p = job.pay;
  if (p.type === "hourly") return p.rate * job.hours * job.days.length * (1 - TAX_RATE);
  if (p.type === "tipped") return (p.rate * (1 - TAX_RATE) + 24) * job.hours * job.days.length;
  if (p.type === "salary") return (p.annual / 52) * (1 - TAX_RATE);
  if (p.type === "gig") return 1150;
  return 0;
}
// rough yearly pay before taxes, used for offers and the 40x rent rule
export function annualGross(job: Job): number {
  const p = job.pay;
  if (p.type === "salary") return p.annual;
  if (p.type === "hourly") return p.rate * job.hours * job.days.length * 52;
  if (p.type === "tipped") return (p.rate + 24) * job.hours * job.days.length * 52;
  if (p.type === "gig") return 60000;
  return 0;
}
export function payLabel(job: Job): string {
  const p = job.pay;
  if (p.type === "hourly") return money(p.rate) + "/hr";
  if (p.type === "tipped") return money(p.rate) + "/hr + tips";
  if (p.type === "salary") return "$" + p.annual / 1000 + "k/yr";
  if (p.type === "gig") return "Per project";
  return "None";
}
export function scheduleLabel(job: Job): string {
  if (!job.days.length) return "—";
  return job.days.map((d) => DAY_NAMES[d]).join(" ") + " · " + fmtTime(job.start * 60).replace(":00", "") + ", " + job.hours + "h";
}
export function isWorkday(g: GameState, day: number): boolean {
  const j = g.job;
  if (!j.days.length) return false;
  if (j.endsDay && day >= j.endsDay) return false;
  return j.days.includes(weekday(day));
}
export function wakeTimeFor(g: GameState, day: number): number {
  if (isWorkday(g, day)) return clamp(g.job.start * 60 - 90, 270, 480);
  return 540;
}

// ---------- time passing ----------
interface TimeOpts {
  work?: boolean;
  walking?: boolean;
  social?: boolean;
  noFaint?: boolean;
}
export function advanceTime(g: GameState, mins: number, fx: Fx | null, opts: TimeOpts = {}) {
  const h = mins / 60;
  const n = g.needs;
  let hungerRate = 5, energyRate = 3.2, funRate = 2.2, socialRate = 1.8;
  if (opts.work) {
    energyRate *= g.job.physical;
    funRate *= 1.6;
    socialRate *= g.job.remote ? 1.7 : 0.5; // remote = nobody to talk to
  }
  if (opts.walking) energyRate *= 1.5;
  if (opts.social) socialRate = 0;
  if (n.hunger < 15) energyRate *= 1.6;
  if (g.trait === "social") socialRate *= 1.5;
  if (g.trait === "homebody") socialRate *= 0.6;
  if (g.trait === "frugal") funRate *= 1.25;
  n.hunger -= hungerRate * h;
  n.energy -= energyRate * h;
  n.fun -= funRate * h;
  n.social -= socialRate * h;
  n.bladder -= 7 * h;
  for (const k of Object.keys(n) as NeedKey[]) n[k] = clamp(n[k], 0, 100);
  g.time += mins;
  if (n.bladder <= 0) accident(g, fx);
  if (n.energy <= 0 && !opts.noFaint) faint(g, fx);
}

function accident(g: GameState, fx: Fx | null) {
  g.needs.bladder = 100;
  boost(g, { fun: -22, social: -10 });
  log(g, "You couldn't find a bathroom in time. Nobody saw. Probably.", "bad");
  fx?.toast("Oops. Use the bathroom before it gets that low.");
}

function faint(g: GameState, fx: Fx | null) {
  const bill = 275;
  spend(g, bill, "other", true);
  g.needs.energy = 30;
  g.needs.hunger = Math.max(g.needs.hunger, 40);
  g.time += 180;
  g.location = "home";
  g.fainted = true;
  log(g, "You pushed too hard and passed out. Urgent care plus a ride home: " + money(bill) + ".", "bad");
  fx?.modal({ kind: "message", title: "You passed out", text: "Your energy hit zero. Three hours at urgent care, " + money(bill) + " bill. Sleep and food matter." });
}

// runs after every action
export function afterAction(g: GameState, fx: Fx) {
  if (g.over) return;
  if (g.time < 26 * 60) return; // before 2am is fine
  if (g.location !== "home") {
    const miles = milesBetween(g, g.location, "home");
    const cost = Math.round(Math.max(15, (6 + miles * 3.4) * 1.5) * 100) / 100;
    spend(g, cost, "transit", true);
    log(g, "It's past 2 AM. You gave up on the train and took a " + RIDE_APP + " home for " + money(cost) + ".", "warn");
    g.location = "home";
  } else log(g, "It's past 2 AM. You fell asleep on the couch.", "warn");
  doSleep(g, fx);
}

// ---------- the day cycle ----------
export function doSleep(g: GameState, fx: Fx) {
  const tomorrow = g.day + 1;
  const wake = wakeTimeFor(g, tomorrow);
  let mins = g.time < 1440 ? 1440 - g.time + wake : wake - (g.time - 1440);
  if (mins < 240) mins = 240;
  const hours = mins / 60;
  const h = HOUSING[g.housing];
  let gain = hours * 11 * h.sleep * (g.items.mattress ? 1.12 : 1);
  let note = "";
  const rm = mates(g, "roommate")[0];
  if (rm && Math.random() < 0.22) {
    gain -= 15;
    note = pick([" " + rm.name + " had people over until 2 AM.", " Someone's alarm went off four times.", " The radiator banged all night."]);
  }
  const kid = mates(g, "kid")[0];
  if (kid && Math.random() < 0.15) {
    gain -= 10;
    note = " " + kid.name + " had a nightmare at 3 AM.";
  }
  // save today's mood before the day flips
  g.moodLog.push({ day: g.day, mood: getMood(g), energy: Math.round(g.needs.energy), hunger: Math.round(g.needs.hunger), fun: Math.round(g.needs.fun), social: Math.round(g.needs.social) });
  if (g.moodLog.length > 90) g.moodLog.shift();

  boost(g, { energy: gain, hunger: -hours * 1.8, social: -hours * 0.4, bladder: -hours * 4 });
  g.time = g.time + mins - 1440;
  g.day = tomorrow;
  log(g, "Slept " + fmtDuration(mins) + "." + note, note ? "warn" : "");
  log(g, DAY_NAMES[weekday(g.day)] + " · Day " + g.day, "day");
  startNewDay(g, fx);
}

function startNewDay(g: GameState, fx: Fx) {
  const d = g.day;
  if (d > 1 && isWorkday(g, d - 1) && !g.worked[d - 1] && !g.cut[d - 1]) {
    g.strikes++;
    log(g, "You missed your shift on " + DAY_NAMES[weekday(d - 1)] + ". Strike " + g.strikes + " of 3.", "bad");
    if (g.strikes >= 3) loseJob(g, fx, "You missed three shifts and got let go.");
  }
  if (weekday(d) === 0 && d > 1) {
    fx.modal({ kind: "week", week: { ...g.week }, weekNo: Math.floor((d - 1) / 7) });
    g.week = freshWeek();
  }
  if (weekday(d) === 4) payday(g);

  // freelance invoices that finally got paid
  g.invoices = g.invoices.filter((inv) => {
    if (d < inv.dueDay) return true;
    if (!inv.chased && Math.random() > g.job.stability + 0.2) {
      inv.dueDay += randInt(5, 12);
      inv.chased = true;
      log(g, "The " + inv.client + ' client says the check is "processing". Payment pushed back.', "warn");
      return true;
    }
    earn(g, inv.amount);
    log(g, "Invoice paid: " + money(inv.amount) + " from " + inv.client + " (after setting aside taxes).", "good");
    return false;
  });

  if (d >= g.rentDue) {
    const owed = rentOwed(g);
    if (g.cash >= owed) {
      spend(g, owed, "rent");
      log(g, "Rent paid: " + money(owed) + ".", "good");
      g.rentDue += 30;
      g.rentLateSince = null;
    } else if (g.rentLateSince == null) {
      g.rentLateSince = d;
      log(g, "Rent is due and you're short. Your landlord added a " + money(LATE_FEE) + " late fee. You have 7 days.", "bad");
      fx.modal({ kind: "message", title: "Rent is late", text: "You owe " + money(rentOwed(g)) + " and have " + money(g.cash) + ". Your landlord gave you 7 days before filing in housing court." });
    } else if (d - g.rentLateSince >= 7) {
      gameOver(g, fx, "Evicted", "You couldn't cover rent within a week of it being due. Your landlord filed in housing court and you had to move out.");
      return;
    }
  }
  if (g.job.endsDay && d >= g.job.endsDay) loseJob(g, fx, 'Your internship wrapped up. They said they\'d "keep you in mind".');
  if (g.interview && d > g.interview.day) {
    log(g, "You missed your interview with " + g.interview.company + ".", "bad");
    g.interview = null;
  }
  if (g.unlimitedUntil && g.unlimitedUntil === d - 1) log(g, "Your 30-day unlimited " + CARD_NAME + " expired. Back to paying per ride.", "warn");
  startOfDayNotes(g);
}

// random stuff rolled every morning
function startOfDayNotes(g: GameState) {
  const d = g.day;
  const j = g.job;
  if (isWorkday(g, d) && Math.random() > j.stability) {
    if (j.pay.type === "hourly" || j.pay.type === "tipped") {
      g.cut[d] = true;
      log(g, "Your manager texted: today's shift is cut. No hours, no pay.", "bad");
    } else {
      g.longDay[d] = true;
      log(g, "Heads up from your boss: big deadline today. Expect to stay 2 hours late.", "warn");
    }
  }
  if (j.pay.type === "gig") {
    if (Math.random() < 0.55) {
      g.gig = makeGig();
      log(g, "New gig request: " + g.gig.title + " (" + money(g.gig.pay) + ", about " + g.gig.hours + "h).", "good");
    } else g.gig = null;
  }
  // recruiters find you sometimes, even if you didn't apply
  if (!g.interview && d > 2 && Math.random() < (g.items.phone ? 0.07 : 0.035)) {
    g.interview = { day: d + 1, company: pick(COMPANIES) };
    log(g, "A recruiter messaged you out of nowhere: " + g.interview.company + " wants to meet tomorrow, 10 AM to 5 PM, at the office tower on the Lower East Side.", "good");
  }
  if (g.apps > 0 && !g.interview && Math.random() < Math.min(0.45, g.apps * (g.items.phone ? 0.065 : 0.05))) {
    g.interview = { day: d + 1, company: pick(COMPANIES) };
    g.apps = Math.max(0, g.apps - 5);
    log(g, "Email: " + g.interview.company + " wants to interview you tomorrow, 10 AM to 5 PM, at the office tower on the Lower East Side.", "good");
  }

  // the people (and cat) you live with
  const rm = mates(g, "roommate")[0];
  const partner = mates(g, "partner")[0];
  const cat = mates(g, "cat")[0];
  const kid = mates(g, "kid")[0];
  if (rm) {
    if (d % 10 === 5) {
      spend(g, 45, "other", true);
      log(g, rm.name + " sent a payment request: utilities, $45. Paid.", "warn");
    }
    const r = Math.random();
    if (r < 0.12 && g.meals > 0 && d > 1) {
      g.meals--;
      boost(g, { fun: -4 });
      log(g, rm.name + " ate your leftovers. Again.", "warn");
    } else if (r < 0.22 && d > 1) {
      boost(g, { hunger: 15, social: 6 });
      log(g, rm.name + " made too much pasta and gave you a bowl.", "good");
    }
  }
  if (partner && d > 1 && Math.random() < 0.18) {
    boost(g, { hunger: 20, social: 8 });
    log(g, partner.name + " made breakfast.", "good");
  }
  if (kid && d > 1 && Math.random() < 0.15) {
    boost(g, { fun: 6 });
    log(g, kid.name + " drew you a picture of the subway. It's on the fridge now.", "good");
  }
  if (cat) {
    if (weekday(d) === 0 && d > 1) {
      spend(g, 18, "other", true);
      log(g, "Bought cat food for " + cat.name + ": $18.");
    }
    if (Math.random() < 0.1 && g.items.plant) {
      boost(g, { fun: -3 });
      log(g, cat.name + " knocked your plant off the windowsill.", "warn");
    }
  }
  if (isWorkday(g, d) && !g.cut[d]) log(g, "You work today at " + fmtTime(j.start * 60) + (j.remote ? " (from home)." : ", " + j.place + "."));
}

function makeGig(): Gig {
  const hours = randInt(3, 7);
  return { title: pick(GIGS), hours, pay: Math.round((hours * rand(55, 95)) / 5) * 5 };
}

function payday(g: GameState) {
  const p = g.job.pay;
  let gross = 0;
  if (p.type === "salary") gross = p.annual / 52;
  else if (p.type === "hourly" || p.type === "tipped") {
    gross = g.pendingPay;
    g.pendingPay = 0;
  }
  if (gross > 0) {
    const net = gross * (1 - TAX_RATE);
    earn(g, net);
    log(g, "Payday. " + money(net) + " direct deposit (" + money(gross) + " before taxes).", "good");
  }
}

function loseJob(g: GameState, fx: Fx, reason: string) {
  if (g.pendingPay > 0) {
    const net = g.pendingPay * (1 - TAX_RATE);
    earn(g, net);
    log(g, "Final paycheck: " + money(net) + ".");
    g.pendingPay = 0;
  }
  g.job = structuredClone(UNEMPLOYED);
  g.strikes = 0;
  if (g.location === "work") g.location = "out";
  log(g, reason, "bad");
  fx.modal({ kind: "message", title: "Job's over", text: reason + " You can apply for jobs from home. Interviews happen at the office tower on the Lower East Side." });
}

function gameOver(g: GameState, fx: Fx, title: string, text: string) {
  g.over = true;
  log(g, text, "bad");
  fx.modal({ kind: "gameOver", title, text, days: g.day });
}

// recruiters mostly reach out with something better than what you have
export function pickOffer(g: GameState): Job {
  const cur = annualGross(g.job);
  const better = OFFERS.filter((o) => annualGross(o) > cur * 1.05 && o.title !== g.job.title);
  return structuredClone(pick(better.length ? better : OFFERS));
}

export function acceptOffer(g: GameState, offer: Job) {
  if (g.pendingPay > 0) {
    earn(g, g.pendingPay * (1 - TAX_RATE));
    g.pendingPay = 0;
  }
  g.job = { ...structuredClone(offer), key: "offer" };
  g.strikes = 0;
  g.apps = 0;
  boost(g, { fun: 25 });
  log(g, "You accepted! You're now a " + offer.title + ". You start next workday.", "good");
  if (annualGross(offer) >= 40 * 2300 && mates(g, "roommate").length) log(g, "With this salary you could afford your own place. Try Apartment hunt at home.", "good");
}

// ---------- getting around ----------
export function placeXY(g: GameState, key: PlaceKey) {
  const h = HOUSING[g.housing];
  if (key === "home") return { x: h.x, y: h.y };
  if (key === "store") return { x: h.x + 0.9, y: h.y + 0.5 };
  if (key === "work") return { x: g.job.x, y: g.job.y };
  if (key === "shops") return { x: 1.5, y: -4.5 };
  return { x: 0.6, y: -3.1 }; // lower east side
}
export function milesBetween(g: GameState, a: PlaceKey, b: PlaceKey) {
  const p = placeXY(g, a);
  const q = placeXY(g, b);
  return Math.hypot(p.x - q.x, p.y - q.y);
}
export function placeLabel(g: GameState, key: PlaceKey): string {
  return { home: "Home", work: g.job.place, store: "Grocery store", shops: "Fulton Mall", out: "Lower East Side" }[key];
}
export function placeSub(g: GameState, key: PlaceKey): string {
  return { home: HOUSING[g.housing].hood, work: "Work", store: "Fresh Market", shops: "Home goods, tech, clothes", out: "Out in the city" }[key];
}
export const hasWorkplace = (g: GameState) => !g.job.remote && g.job.pay.type !== "none";
export function destinations(g: GameState): PlaceKey[] {
  const all: PlaceKey[] = ["home", "work", "store", "shops", "out"];
  return all.filter((k) => k !== g.location && (k !== "work" || hasWorkplace(g)));
}
export function isRushHour(g: GameState) {
  const h = Math.floor(g.time / 60) % 24;
  return (h >= 7 && h < 10) || (h >= 17 && h < 19);
}
function surge(g: GameState) {
  const h = Math.floor(g.time / 60) % 24;
  let s = isRushHour(g) ? 1.6 : h >= 22 || h < 4 ? 1.35 : 1;
  s += ((g.day * 31 + h * 17) % 10) / 30; // stays the same for the whole hour
  return Math.round(s * 10) / 10;
}

export function travelOptions(g: GameState, dest: PlaceKey): TravelOption[] {
  const miles = milesBetween(g, g.location, dest);
  const lateNight = Math.floor(g.time / 60) % 24 < 5;
  const subwayOk = miles >= 0.8;
  const s = surge(g);
  const rideCost = Math.round(Math.max(15, (6 + miles * 3.4) * s) * 100) / 100;
  return [
    { mode: "subway", name: "Subway", ok: subwayOk && (hasUnlimited(g) || g.cash >= SUBWAY_FARE), why: !subwayOk ? "Too close" : "Can't afford fare", cost: hasUnlimited(g) ? 0 : SUBWAY_FARE, mins: Math.round(14 + miles * 4.2 + (lateNight ? 12 : 0)) },
    { mode: "swyft", name: RIDE_APP, ok: g.cash >= rideCost, why: "Can't afford", cost: rideCost, surge: s, mins: Math.round(6 + miles * (isRushHour(g) ? 5.6 : 3.4)) },
    { mode: "walk", name: "Walk", ok: miles <= 2.5, why: "Too far", cost: 0, mins: Math.max(5, Math.round(miles * 19)) },
  ];
}

// decide what happens on the trip up front, so the animation can show it
export function planTravel(g: GameState, dest: PlaceKey, mode: TravelMode): TravelPlan | null {
  const o = travelOptions(g, dest).find((x) => x.mode === mode);
  if (!o || !o.ok) return null;
  const plan: TravelPlan = { dest, mode, mins: o.mins, cost: o.cost, surge: o.surge, event: null, msg: "" };
  if (mode === "subway") {
    const roll = Math.random();
    if (roll < 0.18) {
      const delay = randInt(15, 35);
      plan.mins += delay;
      plan.event = "delay";
      plan.msg = "Signal problems at " + pick(STATIONS) + ". Your train sat for " + delay + " minutes.";
    } else if (roll < 0.26) {
      plan.event = "showtime";
      plan.msg = "Showtime dancers hit your car. Honestly, pretty good.";
    } else if (roll < 0.31) {
      plan.mins += 12;
      plan.event = "express";
      plan.msg = "Your local went express and skipped your stop.";
    } else plan.msg = "Took the subway" + (hasUnlimited(g) ? " on your unlimited " + CARD_NAME + "." : " (" + money(o.cost) + ").");
    plan.swipe = hasUnlimited(g)
      ? { screen: "GO", sub: "UNLIMITED", color: "#59e05c", note: "Unlimited · " + (g.unlimitedUntil - g.day + 1) + " days left" }
      : { screen: "GO", sub: "$3.00", color: "#59e05c", note: money(SUBWAY_FARE) + " charged · bank " + money(g.cash - SUBWAY_FARE) };
  } else if (mode === "swyft") {
    plan.msg = "Took a " + RIDE_APP + " for " + money(o.cost) + (o.surge && o.surge > 1.15 ? " (" + o.surge + "x surge)." : ".");
    if (isRushHour(g) && Math.random() < 0.3) {
      plan.mins += 10;
      plan.msg += " Sat in traffic on the bridge.";
    }
  } else plan.msg = "Walked.";
  return plan;
}

export function applyTravel(g: GameState, fx: Fx, plan: TravelPlan) {
  if (plan.mode === "subway") {
    if (plan.cost > 0) spend(g, plan.cost, "transit", true);
    if (plan.event === "delay") boost(g, { fun: -6 });
    if (plan.event === "showtime") boost(g, { fun: 6 });
    if (g.items.headphones) boost(g, { fun: 3 });
  } else if (plan.mode === "swyft") {
    spend(g, plan.cost, "transit", true);
    boost(g, { fun: 3 });
  } else boost(g, { fun: 2 });
  g.fainted = false;
  advanceTime(g, plan.mins, fx, { walking: plan.mode === "walk" });
  if (!g.fainted) g.location = plan.dest; // if you fainted on the way you're already home
  log(g, plan.msg + " Arrived at " + placeLabel(g, g.location) + " after " + fmtDuration(plan.mins) + ".", plan.event === "delay" ? "warn" : "");
  afterAction(g, fx);
}

export function buyUnlimited(g: GameState) {
  const price = unlimitedPrice(g);
  if (hasUnlimited(g) || !spend(g, price, "transit")) return;
  g.unlimitedUntil = g.day + 29;
  log(g, "Bought a 30-day unlimited " + CARD_NAME + " for " + money(price) + ".");
}

// ---------- stuff you own ----------
export function wearItem(g: GameState, k: string) {
  const fields = Object.keys(ITEMS[k].wear ?? {});
  // take off anything that uses the same slot (two tops at once doesn't work)
  g.worn = g.worn.filter((w) => !Object.keys(ITEMS[w].wear ?? {}).some((f) => fields.includes(f)));
  g.worn.push(k);
}
export function takeOff(g: GameState, k: string) {
  g.worn = g.worn.filter((w) => w !== k);
}
export function toggleWear(g: GameState, k: string) {
  if (g.worn.includes(k)) {
    takeOff(g, k);
    log(g, "Took off the " + ITEMS[k].name.toLowerCase() + ".");
  } else {
    wearItem(g, k);
    log(g, "Put on the " + ITEMS[k].name.toLowerCase() + ".");
  }
}
export const consoleOk = (g: GameState) => HOUSING[g.housing].tier !== "share" || !!g.items.tv;

export function buyItem(g: GameState, k: string): boolean {
  const it = ITEMS[k];
  if (g.items[k] || !spend(g, it.price, it.cat === "clothes" ? "fun" : "other")) return false;
  g.items[k] = true;
  if (it.wear) {
    wearItem(g, k);
    boost(g, { fun: 8 });
    log(g, "Bought the " + it.name.toLowerCase() + " for " + money(it.price) + " and put it on. New fit.", "good");
  } else log(g, "Bought a " + it.name.toLowerCase() + " for " + money(it.price) + ". It's at your place now.", "good");
  return true;
}

// ---------- moving ----------
export interface ListingInfo {
  key: string;
  share: number;
  need: number;
  upfront: number;
  why: string;
}
export function listings(g: GameState): ListingInfo[] {
  const income = annualGross(g.job);
  const kid = mates(g, "kid")[0];
  const hasPartner = mates(g, "partner").length > 0;
  return Object.keys(HOUSING)
    .filter((k) => HOUSING[k].listing && k !== g.housing)
    .map((key) => {
      const h = HOUSING[key];
      const share = rentFor(g, key);
      const need = share * 40;
      const upfront = share * 2 + MOVERS;
      let why = "";
      if (kid && h.tier !== "3br") why = "Not enough room for " + kid.name;
      else if (hasPartner && h.tier === "share") why = "Not with a partner";
      else if (income < need) why = "Need " + money(need).replace(".00", "") + "/yr income";
      else if (g.cash < upfront) why = "Need " + money(upfront).replace(".00", "") + " upfront";
      return { key, share, need, upfront, why };
    });
}

export function moveTo(g: GameState, fx: Fx, key: string) {
  const info = listings(g).find((l) => l.key === key);
  if (!info || info.why) return;
  const h = HOUSING[key];
  const oldShare = myRent(g);
  spend(g, info.upfront, "rent");
  const back = Math.max(0, oldShare - randInt(0, 3) * 50);
  earn(g, back);
  const leftBehind = mates(g, "roommate").map((m) => m.name);
  g.mates = homeMates(g).filter((m) => m.role !== "roommate").concat(structuredClone(h.mates));
  g.housing = key;
  g.rentDue = g.day + 30;
  g.rentLateSince = null;
  g.location = "home";
  boost(g, { fun: 18 });
  log(g, "Moved into a " + h.type.toLowerCase() + " in " + h.hood + ". Paid " + money(info.upfront) + " to move in." + (leftBehind.length ? " " + leftBehind[0] + " cried a little. You did too." : ""), "good");
  log(g, "Your old landlord returned " + money(back) + " of your security deposit.");
  fx.modal({ kind: "message", title: "New place!", text: "Welcome to your " + h.type.toLowerCase() + " in " + h.hood + ". Rent is " + money(info.share) + "/mo, next due on day " + g.rentDue + ". Everything you own came with you." });
}

export function loadFixups(g: GameState): GameState {
  g.items ??= {};
  g.moodLog ??= [];
  g.worn ??= [];
  g.needs.bladder ??= 80;
  g.mates ??= structuredClone(HOUSING[g.housing].mates);
  return g;
}

