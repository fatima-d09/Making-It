// what each action actually does to your life. all of these are SimFns: (g, fx) => void
import { FOOD_APP, FREELANCE_SETASIDE } from "../data/constants";
import { GIGS, HOUSING } from "../data/world";
import type { Fx, GameState, ShopCat } from "./types";
import { advanceTime, afterAction, boost, doSleep, earn, getMood, log, mates, pickOffer, spend } from "./sim";
import { isNight, money, pick, rand, randInt, weekday } from "./utils";

export function doWorkShift(g: GameState, fx: Fx) {
  const j = g.job;
  const d = g.day;
  const startMin = j.start * 60;
  const late = g.time - startMin;
  if (g.time < startMin) advanceTime(g, startMin - g.time, fx, { noFaint: true });
  if (late > 15) {
    boost(g, { fun: -6 });
    log(g, "You clocked in " + late + " minutes late. Your manager noticed.", "warn");
  }
  const hours = j.hours + (g.longDay[d] ? 2 : 0);
  advanceTime(g, hours * 60, fx, { work: true });
  g.worked[d] = true;
  if (j.perk === "meal") boost(g, { hunger: 40 });
  let msg = "Finished a " + hours + "-hour " + (j.remote ? "workday" : "shift at " + j.place) + ".";
  if (j.pay.type === "hourly") {
    g.pendingPay += j.pay.rate * hours;
    msg += " Earned " + money(j.pay.rate * hours) + " before tax, paid Friday.";
  } else if (j.pay.type === "tipped") {
    g.pendingPay += j.pay.rate * hours;
    let tipRate = rand(16, 32);
    if (weekday(d) === 4 || weekday(d) === 5) tipRate *= 1.35; // fri/sat nights are better
    const tips = Math.round(tipRate * hours);
    earn(g, tips);
    msg += " Walked out with " + money(tips) + " in tips.";
  }
  log(g, msg, "good");
  const r = Math.random();
  if (j.key === "doctor" && r < 0.25) {
    boost(g, { fun: -8, energy: -6 });
    log(g, "Rough one. Two admissions at once and no time to sit down.", "warn");
  }
  if (j.key === "server" && r < 0.2) {
    boost(g, { fun: -6 });
    log(g, "A table of eight split the check eight ways and tipped 10%.", "warn");
  }
  if ((j.key === "retail_ft" || j.key === "retail_pt") && r < 0.2) {
    boost(g, { fun: -5 });
    log(g, "A customer asked for your manager over a coupon from 2019.", "warn");
  }
  if (j.key === "remote_cs" && r < 0.2) {
    boost(g, { social: -5 });
    log(g, "Six back-to-back video calls and you still didn't talk to a real friend.", "warn");
  }
  if (j.key === "gov" && r < 0.15) {
    boost(g, { fun: 4 });
    log(g, "Someone brought bagels to the office. Small win.", "good");
  }
  afterAction(g, fx);
}

export function doGig(g: GameState, fx: Fx) {
  const gig = g.gig;
  if (!gig) return;
  advanceTime(g, gig.hours * 60, fx, { work: true });
  const amount = gig.pay * (1 - FREELANCE_SETASIDE);
  g.invoices.push({ amount, dueDay: g.day + randInt(7, 21), client: gig.title.split(" for ")[1] ?? gig.title, chased: false });
  log(g, 'Delivered "' + gig.title + '" and sent an invoice for ' + money(gig.pay) + ". Net 15... hopefully.", "good");
  g.gig = null;
  afterAction(g, fx);
}

export function doLookForGig(g: GameState, fx: Fx) {
  advanceTime(g, 60, fx);
  g.lookedForGig = g.day;
  if (Math.random() < 0.5) {
    const hours = randInt(3, 7);
    g.gig = { title: pick(GIGS), hours, pay: Math.round((hours * rand(55, 95)) / 5) * 5 };
    log(g, "An old client got back to you: " + g.gig.title + " for " + money(g.gig.pay) + ".", "good");
  } else {
    boost(g, { fun: -4 });
    log(g, "You sent a bunch of emails. Nobody wrote back yet.");
  }
  afterAction(g, fx);
}

export function doApply(g: GameState, fx: Fx) {
  advanceTime(g, 90, fx);
  const n = randInt(2, 4);
  g.apps += n;
  boost(g, { fun: -6 });
  log(g, "Sent " + n + " job applications. " + g.apps + " out there right now.");
  afterAction(g, fx);
}

export function doPhoneApply(g: GameState, fx: Fx) {
  advanceTime(g, 30, fx);
  const n = randInt(1, 2);
  g.apps += n;
  boost(g, { fun: -2 });
  log(g, "Sent " + n + " applications from your phone. " + g.apps + " out there.");
  afterAction(g, fx);
}

export function doInterview(g: GameState, fx: Fx) {
  if (!g.interview) return;
  advanceTime(g, 90, fx);
  const chance = 0.3 + getMood(g) / 220 + (g.worn.includes("blazer") ? 0.12 : 0);
  const company = g.interview.company;
  g.interview = null;
  if (Math.random() < chance) {
    log(g, "The interview went well. They made you an offer.", "good");
    fx.modal({ kind: "offer", offer: pickOffer(g), company });
  } else {
    boost(g, { fun: -10 });
    log(g, 'The interview felt off. Two days later: "we\'ve decided to move forward with other candidates".', "bad");
  }
  afterAction(g, fx);
}

// ---- food ----
export function doCook(g: GameState, fx: Fx) {
  advanceTime(g, g.items.airfryer ? 25 : 45, fx);
  g.meals--;
  if (g.trait === "foodie") boost(g, { hunger: 36, fun: -1 });
  else boost(g, { hunger: 42, fun: 2 });
  log(g, "Cooked at home. " + g.meals + " meals left.");
  afterAction(g, fx);
}
export function doCookTogether(name: string) {
  return (g: GameState, fx: Fx) => {
    advanceTime(g, 60, fx, { social: true });
    g.meals--;
    boost(g, { hunger: 42, social: 14, fun: 6 });
    log(g, "Cooked dinner with " + name + ". " + g.meals + " meals left.", "good");
    afterAction(g, fx);
  };
}
export function doDelivery(g: GameState, fx: Fx) {
  spend(g, 31, "food");
  advanceTime(g, 50, fx);
  boost(g, { hunger: 48, fun: g.trait === "foodie" ? 10 : 4 });
  log(g, "Ordered " + FOOD_APP + ". " + money(31) + " for one meal after fees and tip.");
  afterAction(g, fx);
}
export function doSplitDelivery(g: GameState, fx: Fx) {
  spend(g, 17, "food");
  advanceTime(g, 50, fx, { social: true });
  boost(g, { hunger: 45, social: 6, fun: 4 });
  log(g, "Split a " + FOOD_APP + " order with " + (mates(g, "roommate")[0]?.name ?? "your roommate") + ". " + money(17) + " each.");
  afterAction(g, fx);
}
export function doGroceries(cost: number, meals: number, mins: number) {
  return (g: GameState, fx: Fx) => {
    spend(g, cost, "food");
    advanceTime(g, mins, fx);
    g.meals += meals;
    log(g, "Bought groceries for " + money(cost) + ". " + g.meals + " meals at home now." + (g.job.perk === "discount" ? " (employee discount)" : ""));
    afterAction(g, fx);
  };
}
export function doBodega(g: GameState, fx: Fx) {
  spend(g, 7.5, "food");
  advanceTime(g, 10, fx);
  boost(g, { hunger: 28, fun: 3 });
  log(g, "Bacon egg and cheese. Salt pepper ketchup.");
  afterAction(g, fx);
}
export function doIcedCoffee(g: GameState, fx: Fx) {
  spend(g, 5.5, "food");
  advanceTime(g, 10, fx);
  boost(g, { energy: 10, fun: 3, bladder: -14 });
  log(g, "Iced coffee, even though it's " + (isNight(g.time) ? "night" : "freezing") + ". Classic.");
  afterAction(g, fx);
}
export function doCoffee(g: GameState, fx: Fx) {
  advanceTime(g, 10, fx);
  boost(g, { energy: 12, fun: 2, bladder: -12 });
  log(g, "Made coffee at home instead of buying a $6 latte.");
  afterAction(g, fx);
}

// ---- going out ----
export function doDinner(g: GameState, fx: Fx) {
  spend(g, 52, "fun");
  advanceTime(g, 120, fx, { social: true });
  boost(g, { hunger: 60, fun: g.trait === "foodie" ? 30 : 18, social: 10 });
  log(g, "Dinner at the noodle bar. " + money(52) + " with tip.");
  afterAction(g, fx);
}
export function doHangout(g: GameState, fx: Fx) {
  spend(g, 38, "fun");
  advanceTime(g, 180, fx, { social: true });
  boost(g, { social: 38 * (g.trait === "social" ? 1.6 : 1), fun: 24 });
  log(g, "Drinks with friends. You needed that.", "good");
  afterAction(g, fx);
}
export function doPark(g: GameState, fx: Fx) {
  advanceTime(g, 90, fx, { walking: true });
  boost(g, { fun: 14 });
  log(g, "Walked through the park. Free, and it helped.");
  afterAction(g, fx);
}

// ---- at home ----
export function doStream(g: GameState, fx: Fx) {
  advanceTime(g, 120, fx);
  const big = g.items.tv ? 6 : 0;
  boost(g, { fun: (g.trait === "homebody" ? 22 : 13) + big, energy: g.trait === "homebody" ? 6 : 0, social: -3 });
  log(g, "Streamed a couple of episodes.");
  afterAction(g, fx);
}
export function doGames(g: GameState, fx: Fx) {
  advanceTime(g, 120, fx);
  boost(g, { fun: 20, social: 2 });
  log(g, "Played video games online with friends.");
  afterAction(g, fx);
}
export function doRead(g: GameState, fx: Fx) {
  advanceTime(g, 60, fx);
  boost(g, { fun: 10, energy: 4 });
  log(g, "Read for an hour. Phone stayed in the other room.");
  afterAction(g, fx);
}
export function doCall(g: GameState, fx: Fx) {
  advanceTime(g, 30, fx, { social: true });
  boost(g, { social: g.trait === "social" ? 18 : 12 });
  log(g, "Called a friend back home.");
  afterAction(g, fx);
}
export function doChat(name: string, social: number, fun: number, mins: number) {
  return (g: GameState, fx: Fx) => {
    advanceTime(g, mins, fx, { social: true });
    boost(g, { social: social * (g.trait === "social" ? 1.3 : 1), fun });
    log(g, "Spent time with " + name + ".");
    afterAction(g, fx);
  };
}
export function doPlayKid(g: GameState, fx: Fx) {
  advanceTime(g, 45, fx, { social: true });
  boost(g, { fun: 12, social: 8, energy: -6 });
  log(g, "Played with " + (mates(g, "kid")[0]?.name ?? "the kid") + ". You are now a dinosaur, apparently.");
  afterAction(g, fx);
}
export function doPlayCat(g: GameState, fx: Fx) {
  advanceTime(g, 15, fx);
  boost(g, { fun: 8 });
  log(g, (mates(g, "cat")[0]?.name ?? "The cat") + " chased the string for four seconds, then left.");
  afterAction(g, fx);
}
export function doNap(g: GameState, fx: Fx) {
  advanceTime(g, 60, fx, { noFaint: true });
  boost(g, { energy: 14 * HOUSING[g.housing].sleep, hunger: -2 });
  log(g, "Took a nap.");
  afterAction(g, fx);
}
export function doSleepAction(g: GameState, fx: Fx) {
  doSleep(g, fx);
  afterAction(g, fx);
}
export function doBathroom(where: "home" | "public" | "out") {
  return (g: GameState, fx: Fx) => {
    let mins = 5;
    const rm = mates(g, "roommate")[0];
    if (where === "home" && rm && Math.random() < 0.25) {
      mins += 10;
      log(g, rm.name + " was in the shower. You waited 10 minutes.", "warn");
    }
    if (where === "out") {
      spend(g, 4, "food");
      mins = 10;
    }
    advanceTime(g, mins, fx);
    g.needs.bladder = 100;
    log(g, where === "out" ? "Bought a seltzer so they'd let you use the bathroom." : "Used the bathroom.");
    afterAction(g, fx);
  };
}
export function doShower(g: GameState, fx: Fx) {
  advanceTime(g, 20, fx);
  boost(g, { energy: 6, fun: 5 });
  log(g, "Took a shower.");
  afterAction(g, fx);
}

// ---- things that open a screen ----
export function browse(cat: ShopCat) {
  return (g: GameState, fx: Fx) => {
    advanceTime(g, 20, fx);
    afterAction(g, fx);
    if (!g.over) fx.modal({ kind: "shop", cat });
  };
}
export function apartmentHunt(g: GameState, fx: Fx) {
  advanceTime(g, 60, fx);
  afterAction(g, fx);
  if (!g.over) fx.modal({ kind: "apartments" });
}
export function getDressed(_g: GameState, fx: Fx) {
  fx.modal({ kind: "wardrobe" });
}

