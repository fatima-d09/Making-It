// everything you can do where you're standing, plus how each one animates
import { FOOD_APP } from "../data/constants";
import { ITEMS, WORK_LINES, WORK_ROUTE } from "../data/world";
import * as A from "../game/activities";
import { isWorkday, mates, payLabel, wakeTimeFor } from "../game/sim";
import type { GameState, SimFn, Uniform } from "../game/types";
import { fmtTime, lookFromSeed, money, pick } from "../game/utils";
import type { Step } from "./anim";
import { findNpc, isWorkScene, makeNpc, nearNpcX, npcX, spotX, view, type Pose } from "./world";

export interface ActionDesc {
  label: string;
  detail: string;
  run: SimFn;
  disabled?: boolean;
  main?: boolean; // highlighted (like "work your shift")
  spot?: string | (() => number | null); // where it happens in the scene
  pose?: Pose;
  bubble?: string;
  ms?: number;
  tv?: boolean;
  steam?: boolean;
  uniform?: Uniform;
  fade?: string; // fade to black with this text (for long things like sleep)
  steps?: () => Step[]; // custom animation instead of walk + wait
  after?: () => void;
}

const groceryDiscount = (g: GameState) => (g.job.perk === "discount" ? 0.9 : 1) * (g.trait === "frugal" ? 0.9 : 1);
const hasCouch = () => view.spots.couch != null;

export function getActions(g: GameState): ActionDesc[] {
  const a: ActionDesc[] = [];
  const here = g.location;
  const j = g.job;
  const t = g.time;
  const d = g.day;

  // ---- work ----
  const workSpot = j.remote ? "home" : "work";
  if (here === workSpot && isWorkday(g, d)) {
    const startMin = j.start * 60;
    const hours = j.hours + (g.longDay[d] ? 2 : 0);
    let why = "";
    if (g.worked[d]) why = "Already worked today";
    else if (g.cut[d]) why = "Shift was cut";
    else if (t < startMin - 60) why = "Starts at " + fmtTime(startMin);
    else if (t > startMin + 90) why = "Too late, you missed it";
    const act: ActionDesc = {
      label: j.remote ? "Log on and work" : "Work your shift",
      detail: why || hours + "h · " + payLabel(j) + (t > startMin + 15 ? " · you're late" : ""),
      disabled: !!why, main: !why, run: A.doWorkShift, fade: hours + " hours later",
    };
    if (j.remote) Object.assign(act, { spot: "desk", pose: "sit", uniform: "headset", bubble: pick(["Thanks for reaching out!", "Ticket closed", "Let me check on that"]), ms: 1500 });
    else {
      act.steps = workSteps;
      act.spot = j.scene ? WORK_ROUTE[j.scene][0] : undefined;
    }
    a.push(act);
  }

  // ---- home ----
  if (here === "home") {
    const couch = hasCouch() ? "couch" : "desk";
    if (j.pay.type === "gig") {
      if (g.gig) a.push({ label: "Work on: " + g.gig.title, detail: g.gig.hours + "h · invoice " + money(g.gig.pay), main: true, run: A.doGig, spot: "desk", pose: "sit", bubble: "Pen tool...", ms: 1400, fade: g.gig.hours + " hours later" });
      a.push({ label: "Hunt for gigs", detail: g.lookedForGig === d ? "Already looked today" : "1h · email old clients", disabled: g.lookedForGig === d || !!g.gig, run: A.doLookForGig, spot: "desk", pose: "sit", bubble: "Any work?", ms: 1200 });
    }
    a.push({ label: "Apply to full-time jobs", detail: "1h 30m · tiring but it adds up", run: A.doApply, spot: "desk", pose: "sit", bubble: "Submit x3", ms: 1400 });
    a.push({ label: "Cook a meal", detail: g.meals > 0 ? (g.items.airfryer ? "25m" : "45m") + " · " + g.meals + " meals in the fridge" : "Fridge is empty", disabled: g.meals <= 0, run: A.doCook, spot: "stove", steam: true, bubble: "sizzle", ms: 1700 });
    a.push({ label: "Order " + FOOD_APP, detail: money(31) + " with fees · 50m", disabled: g.cash < 31, run: A.doDelivery, steps: deliverySteps, spot: "door" });
    if (g.items.coffee) a.push({ label: "Make coffee", detail: "10m · energy boost", run: A.doCoffee, spot: "coffee", bubble: "brewing...", ms: 1100 });

    const tooEarly = t < 20 * 60 && g.needs.energy > 35;
    a.push({ label: "Go to sleep", detail: tooEarly ? "Not tired yet" : "Until " + fmtTime(wakeTimeFor(g, d + 1)), disabled: tooEarly, run: A.doSleepAction, spot: "bed", pose: "sleep", bubble: "Zzz", ms: 1300, fade: "Good morning", after: () => (view.player.x = spotX("bed") + 30) });
    a.push({ label: "Take a nap", detail: "1h · a little energy", run: A.doNap, spot: "bed", pose: "sleep", bubble: "zz", ms: 1500 });
    if (Object.keys(ITEMS).some((k) => ITEMS[k].wear && g.items[k])) a.push({ label: "Get dressed", detail: "Pick what to wear", run: A.getDressed, spot: "bed", bubble: "hmm...", ms: 700 });
    a.push({ label: hasCouch() || g.items.tv ? "Stream something" : "Watch on your laptop", detail: "2h · free", run: A.doStream, spot: couch, pose: "sit", tv: true, bubble: "one more ep", ms: 1700 });
    if (g.items.console && (hasCouch() || g.items.tv)) a.push({ label: "Play video games", detail: "2h · free", run: A.doGames, spot: couch, pose: "sit", tv: true, bubble: "GG", ms: 1700 });
    if (g.items.bookshelf) a.push({
      label: "Read a book", detail: "1h · calm", run: A.doRead, spot: "bookshelf",
      steps: () => [
        { type: "walk", to: () => spotX("bookshelf") },
        { type: "wait", ms: 500, bubble: "this one" },
        { type: "walk", to: () => spotX(hasCouch() ? "couch" : "bed") },
        { type: "wait", ms: 1500, pose: "sit", bubble: "..." },
      ],
    });
    a.push({ label: "Call a friend", detail: "30m · free", run: A.doCall, bubble: "Hey!! miss you", ms: 1400 });
    a.push({ label: "Use the bathroom", detail: "5m", spot: "bath", bubble: "...", ms: 900, run: A.doBathroom("home"), main: g.needs.bladder < 25 });
    a.push({ label: "Take a shower", detail: "20m · feel human again", spot: "bath", bubble: "la la la", steam: true, ms: 1300, run: A.doShower });
    a.push({ label: "Apartment hunt", detail: "1h · look at listings", spot: "desk", pose: "sit", bubble: "scrolling listings", ms: 1200, run: A.apartmentHunt });

    // the people you live with
    const rm = mates(g, "roommate")[0], partner = mates(g, "partner")[0], kid = mates(g, "kid")[0], cat = mates(g, "cat")[0];
    if (rm) {
      a.push({ label: "Chat with " + rm.name, detail: "30m · roommate catch-up", spot: () => npcX(rm.name), run: A.doChat(rm.name, 12, 4, 30), steps: () => chatSteps(rm.name, ["How was work?", "lol yes"], ["Long day", "Rent is wild"]) });
      a.push({ label: "Cook with " + rm.name, detail: g.meals > 0 ? "1h · uses 1 meal" : "Fridge is empty", disabled: g.meals <= 0, spot: "stove", run: A.doCookTogether(rm.name), steps: () => cookTogetherSteps(rm.name) });
      a.push({ label: "Split a " + FOOD_APP + " with " + rm.name, detail: money(17) + " · 50m", disabled: g.cash < 17, spot: "door", run: A.doSplitDelivery, steps: deliverySteps });
    }
    if (partner) {
      a.push({ label: "Hang out with " + partner.name, detail: "1h · couch time", spot: () => npcX(partner.name), run: A.doChat(partner.name, 22, 10, 60), steps: () => couchSteps(partner.name) });
      a.push({ label: "Cook dinner with " + partner.name, detail: g.meals > 0 ? "1h · uses 1 meal" : "Fridge is empty", disabled: g.meals <= 0, spot: "stove", run: A.doCookTogether(partner.name), steps: () => cookTogetherSteps(partner.name) });
    }
    if (kid) a.push({ label: "Play with " + kid.name, detail: "45m · fun but tiring", spot: () => npcX(kid.name), run: A.doPlayKid, steps: () => chatSteps(kid.name, ["Tag, you're it!", "Rawr!"], ["Again!", "hehe"]) });
    if (cat) a.push({ label: "Play with " + cat.name, detail: "15m · cat therapy", spot: () => npcX(cat.name), run: A.doPlayCat, steps: () => chatSteps(cat.name, ["pspsps", "who's a good cat"], ["mrrp", "..."]) });
  }

  // ---- grocery store ----
  if (here === "store") {
    const disc = groceryDiscount(g);
    const small = Math.round(52 * disc * 100) / 100;
    const big = Math.round(98 * disc * 100) / 100;
    a.push({ label: "Quick grocery run", detail: money(small) + " · 10 meals · 30m", disabled: g.cash < small, spot: "produce", run: A.doGroceries(small, 10, 30), steps: () => grocerySteps(small) });
    a.push({ label: "Full weekly shop", detail: money(big) + " · 18 meals · 1h", disabled: g.cash < big, spot: "shelves", run: A.doGroceries(big, 18, 60), steps: () => grocerySteps(big) });
  }

  // ---- the mall ----
  if (here === "shops") {
    a.push({ label: "Browse home goods", detail: "Plants, lamps, furniture", spot: "home", bubble: "ooh a lamp", ms: 900, run: A.browse("home") });
    a.push({ label: "Browse electronics", detail: "TVs, phones, headphones", spot: "tech", bubble: "so many TVs", ms: 900, run: A.browse("tech") });
    a.push({ label: "Browse clothes", detail: "New fits, hats, shoes", spot: "clothes", bubble: "does this fit?", ms: 900, run: A.browse("clothes") });
  }

  // ---- anywhere outside ----
  if (here !== "home") {
    const counter = () => (view.scene === "out" ? spotX("deli") : view.scene === "store" || view.scene === "shops" ? spotX("checkout") : null);
    a.push({ label: "Iced coffee", detail: money(5.5) + " · 10m · energy boost", disabled: g.cash < 5.5, spot: counter, bubble: "large iced, oat milk", ms: 1100, run: A.doIcedCoffee });
    if (g.items.phone) a.push({ label: "Apply from your phone", detail: "30m · sneak in a couple", run: A.doPhoneApply, bubble: "Easy Apply x2", ms: 1100 });
    if (isWorkScene(view.scene) || view.scene === "shops") a.push({ label: "Use the restroom", detail: "5m · free", spot: "entrance", bubble: "...", ms: 900, run: A.doBathroom("public"), main: g.needs.bladder < 25 });
    if (here === "out") a.push({ label: "Buy a drink to use the bathroom", detail: money(4) + " · 10m · NYC rules", disabled: g.cash < 4, spot: "restaurant", bubble: "can I use your restroom?", ms: 1100, run: A.doBathroom("out"), main: g.needs.bladder < 25 });
    a.push({ label: "Bacon egg & cheese", detail: money(7.5) + " · 10m", disabled: g.cash < 7.5, run: A.doBodega, steps: bodegaSteps, spot: counter });
  }

  // ---- lower east side ----
  if (here === "out") {
    if (g.interview && g.interview.day === d) {
      const okTime = t >= 600 && t <= 1020;
      a.push({ label: "Interview at " + g.interview.company, detail: okTime ? "1h 30m · your mood helps" : "Only 10 AM to 5 PM", disabled: !okTime, main: okTime, spot: "office", run: A.doInterview, steps: () => goInsideSteps("office", "Wish me luck"), fade: "Interviewing..." });
    }
    a.push({ label: "Dinner at the noodle bar", detail: money(52) + " with tip · 2h", disabled: g.cash < 52, spot: "restaurant", run: A.doDinner, steps: () => goInsideSteps("restaurant", "Table for one"), fade: "2 hours later" });
    a.push({ label: "Drinks with friends", detail: money(38) + " · 3h", disabled: g.cash < 38, spot: "bar", run: A.doHangout, steps: hangoutSteps, fade: "3 hours later" });
    a.push({ label: "Walk through the park", detail: "1h 30m · free", run: A.doPark, spot: "park", bubble: "nice out", ms: 1400, fade: "90 minutes later" });
  }
  return a;
}

// ---------- custom animations ----------
function workSteps(): Step[] {
  if (!isWorkScene(view.scene)) return [];
  const scene = view.scene as keyof typeof WORK_ROUTE;
  const route = WORK_ROUTE[scene];
  const lines = WORK_LINES[scene];
  const out: Step[] = [];
  route.forEach((spot, i) => {
    out.push({ type: "walk", to: () => spotX(spot) });
    out.push({ type: "wait", ms: 900, bubble: lines[i % lines.length], pose: scene === "office" && spot === "desk" ? "sit" : undefined, keep: i === route.length - 1 });
  });
  return out;
}

function chatSteps(name: string, mine: string[], theirs: string[]): Step[] {
  const n = findNpc(name);
  if (!n) return [{ type: "wait", ms: 800, bubble: mine[0] }];
  return [
    { type: "set", fn: () => { n.hold = true; n.target = n.x; } },
    { type: "walk", to: () => nearNpcX(n) },
    { type: "wait", ms: 1000, bubble: mine[0] },
    { type: "wait", ms: 1000, npcSay: [name, theirs[0]] },
    { type: "wait", ms: 900, bubble: mine[1] ?? "haha" },
    { type: "wait", ms: 900, npcSay: [name, theirs[1] ?? "lol"] },
    { type: "set", fn: () => { n.hold = false; } },
  ];
}

function cookTogetherSteps(name: string): Step[] {
  const n = findNpc(name);
  const stove = spotX("stove");
  const steps: Step[] = [];
  if (n) steps.push({ type: "set", fn: () => { n.hold = true; n.target = stove + 14; } });
  steps.push({ type: "walk", to: stove });
  steps.push({ type: "wait", ms: 1200, steam: true, bubble: "pass the salt", keep: true });
  if (n) steps.push({ type: "wait", ms: 1100, steam: true, npcSay: [name, "smells good!"], keep: true });
  if (n) steps.push({ type: "set", fn: () => { n.hold = false; } });
  return steps;
}

function couchSteps(name: string): Step[] {
  const n = findNpc(name);
  const couch = spotX("couch");
  const steps: Step[] = [];
  if (n) steps.push({ type: "set", fn: () => { n.hold = true; n.target = couch + 12; } });
  steps.push({ type: "walk", to: couch - 8 });
  if (n) steps.push({ type: "set", fn: () => { n.pose = "sit"; n.x = couch + 12; n.target = couch + 12; } });
  steps.push({ type: "wait", ms: 1300, pose: "sit", tv: true, bubble: "this show tho", keep: true });
  if (n) steps.push({ type: "wait", ms: 1200, pose: "sit", tv: true, npcSay: [name, "one more?"], keep: true });
  if (n) steps.push({ type: "set", fn: () => { n.pose = "stand"; n.hold = false; } });
  return steps;
}

function deliverySteps(): Step[] {
  return [
    { type: "walk", to: () => spotX("door") - 4 },
    { type: "wait", ms: 900, bubble: "ordering..." },
    { type: "set", fn: () => view.npcs.push(makeNpc({ name: "courier", look: { ...lookFromSeed("courier"), headwear: "cap", bag: "backpack", headColor: 3, accColor: 3 }, x: spotX("door") + 2, isStatic: true })) },
    { type: "wait", ms: 1000, npcSay: ["courier", FOOD_APP + "!"] },
    { type: "wait", ms: 700, bubble: "thank you!" },
    { type: "set", fn: () => (view.npcs = view.npcs.filter((n) => n.name !== "courier")) },
  ];
}

function grocerySteps(cost: number): Step[] {
  return [
    { type: "walk", to: () => spotX("produce") },
    { type: "wait", ms: 700, bubble: "avocados $2??" },
    { type: "walk", to: () => spotX("shelves") },
    { type: "wait", ms: 700, bubble: "oat milk..." },
    { type: "walk", to: () => spotX("checkout") },
    { type: "wait", ms: 1000, npcSay: ["cashier", money(cost)] },
    { type: "wait", ms: 600, bubble: "bag please" },
  ];
}

function bodegaSteps(): Step[] {
  if (view.scene === "out") return [{ type: "walk", to: () => spotX("deli") }, { type: "hide" }, { type: "wait", ms: 800 }, { type: "show" }, { type: "wait", ms: 900, bubble: "salt pepper ketchup" }];
  if (view.scene === "store" || view.scene === "shops") return [{ type: "walk", to: () => spotX("checkout") }, { type: "wait", ms: 900, bubble: "BEC please" }];
  return [{ type: "wait", ms: 1000, bubble: "BEC break" }];
}

function goInsideSteps(spot: string, line: string): Step[] {
  return [{ type: "walk", to: () => spotX(spot) }, { type: "wait", ms: 800, bubble: line, keep: true }, { type: "hide" }];
}

function hangoutSteps(): Step[] {
  const bar = spotX("bar");
  return [
    { type: "walk", to: bar - 14 },
    {
      type: "set",
      fn: () => {
        view.npcs.push(makeNpc({ name: "friend1", look: lookFromSeed("friendA"), x: bar + 4, isStatic: true }));
        view.npcs.push(makeNpc({ name: "friend2", look: lookFromSeed("friendB"), x: bar + 20, isStatic: true }));
      },
    },
    { type: "wait", ms: 900, npcSay: ["friend1", "FINALLY"] },
    { type: "wait", ms: 900, bubble: "I know I know" },
    { type: "wait", ms: 1000, npcSay: ["friend2", "first round's on me"], keep: true },
    { type: "set", fn: () => (view.npcs = view.npcs.filter((n) => !n.name.startsWith("friend"))) },
  ];
}

