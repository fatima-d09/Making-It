// the animation queue. every action is turned into a list of small "steps"
// (walk here, wait with a speech bubble, fade out...) that play one by one.
// the sim only updates when a "call" step (or a fade's midpoint) runs.
import { RIDE_APP } from "../data/constants";
import { applyTravel, placeLabel, planTravel } from "../game/sim";
import type { PlaceKey, SwipeResult, TravelMode, Uniform } from "../game/types";
import { clamp, easeIn, easeOut, money } from "../game/utils";
import { runSim, store } from "../store/gameStore";
import type { ActionDesc } from "./actions";
import { G, enterScene, npcSay, resolveSpot, sceneEntrance, view, type Pose } from "./world";

export interface Step {
  type: "walk" | "wait" | "fade" | "call" | "set" | "hide" | "show" | "swipe" | "train" | "car" | "scroll";
  to?: number | (() => number);
  ms?: number;
  bubble?: string;
  pose?: Pose;
  tv?: boolean;
  steam?: boolean;
  uniform?: Uniform;
  keep?: boolean; // keep the pose after the wait (used right before a fade)
  npcSay?: [string, string];
  text?: string;
  mid?: () => void;
  fn?: () => void;
  result?: SwipeResult;
  phase?: "arrive" | "depart";
  caption?: string;
  // runtime
  t?: number;
  toX?: number;
  midDone?: boolean;
}

const anim = { queue: [] as Step[], cur: null as Step | null, skip: false };

export const isBusy = () => !!anim.cur || anim.queue.length > 0;
export const currentSpeed = () => (anim.skip ? 6 : store.getState().speed);
export const skipAnimation = () => { if (isBusy()) anim.skip = true; };

function syncBusy() {
  const b = isBusy();
  if (store.getState().busy !== b) store.setState({ busy: b });
}
function setCaption(c: string | null) {
  view.caption = c;
}

export function runSteps(steps: Step[]) {
  anim.queue.push(...steps);
  syncBusy();
}

export function resetAnimation() {
  anim.queue = [];
  anim.cur = null;
  anim.skip = false;
  clearActivity();
  view.player.visible = true;
  view.player.bubble = null;
  view.fade = 0;
  syncBusy();
}

export function clearActivity() {
  const p = view.player;
  p.pose = "stand";
  p.uniform = null;
  view.tvOn = false;
  view.steam = false;
}

function beginStep(s: Step) {
  const p = view.player;
  if (s.caption) setCaption(s.caption);
  switch (s.type) {
    case "walk":
      s.toX = typeof s.to === "function" ? s.to() : (s.to ?? p.x);
      break;
    case "wait":
      if (s.bubble) p.bubble = s.bubble;
      if (s.pose) p.pose = s.pose;
      if (s.tv) view.tvOn = true;
      if (s.steam) view.steam = true;
      if (s.uniform) p.uniform = s.uniform;
      if (s.npcSay) npcSay(s.npcSay[0], s.npcSay[1], s.ms ?? 1000);
      break;
    case "fade":
      view.fadeText = s.text ?? "";
      break;
    case "call":
    case "set":
      s.fn?.();
      break;
    case "hide":
      p.visible = false;
      break;
    case "show":
      p.visible = true;
      break;
    case "swipe":
      if (s.result) view.closeup = { t: 0, ms: s.ms ?? 2300, result: s.result };
      break;
    case "train":
      if (s.phase === "arrive") view.train = { x: 340, open: false };
      else view.npcs = view.npcs.filter((n) => !n.commuter); // they got on too
      break;
    case "car":
      if (s.phase === "arrive") view.car = { x: -70 };
      break;
  }
}

function endStep(s: Step) {
  const p = view.player;
  if (s.type === "wait") {
    p.bubble = null;
    if (!s.keep) clearActivity();
  }
  if (s.type === "swipe") view.closeup = null;
  if (s.type === "fade") {
    view.fade = 0;
    view.fadeText = "";
  }
  if (s.type === "walk") p.walking = false;
  if (s.caption) setCaption(null);
}

export function stepAnimation(dt: number) {
  if (!anim.cur) {
    const next = anim.queue.shift();
    if (!next) return;
    anim.cur = next;
    next.t = 0;
    beginStep(next);
  }
  const s = anim.cur;
  const sp = currentSpeed();
  s.t = (s.t ?? 0) + dt * sp;
  const ms = s.ms ?? 1000;
  let done = false;
  switch (s.type) {
    case "walk": {
      const p = view.player;
      const dx = (s.toX ?? p.x) - p.x;
      const move = (58 * dt * sp) / 1000;
      if (Math.abs(dx) <= move) {
        p.x = s.toX ?? p.x;
        done = true;
      } else {
        p.x += Math.sign(dx) * move;
        p.walking = true;
      }
      break;
    }
    case "wait":
      done = s.t >= ms;
      break;
    case "fade": {
      const half = ms / 2;
      if (s.t < half) view.fade = s.t / half;
      else {
        if (!s.midDone) {
          s.midDone = true;
          s.mid?.();
        }
        view.fade = Math.max(0, 1 - (s.t - half) / half);
      }
      done = s.t >= ms;
      break;
    }
    case "swipe":
      if (view.closeup) view.closeup.t = s.t;
      done = s.t >= ms;
      break;
    case "train": {
      const k = clamp(s.t / ms, 0, 1);
      if (view.train) {
        if (s.phase === "arrive") {
          view.train.x = 340 + (-40 - 340) * easeOut(k);
          view.train.open = k >= 1;
        } else {
          view.train.open = false;
          view.train.x = -40 - 1000 * easeIn(k);
        }
      }
      done = s.t >= ms;
      break;
    }
    case "car": {
      const k = clamp(s.t / ms, 0, 1);
      if (view.car) view.car.x = s.phase === "arrive" ? -70 + 166 * easeOut(k) : 96 + 300 * easeIn(k);
      done = s.t >= ms;
      break;
    }
    case "scroll":
      view.scroll += dt * 0.055 * sp;
      view.player.walking = true;
      done = s.t >= ms;
      if (done) view.player.walking = false;
      break;
    default:
      done = true; // instant steps
  }
  if (done) {
    endStep(s);
    anim.cur = null;
    if (!anim.queue.length) anim.skip = false;
    syncBusy();
  }
}

// turn an action into steps: walk somewhere, do the thing, then update the sim
export function playAction(a: ActionDesc) {
  const g = store.getState().game;
  if (!g || isBusy() || g.over || a.disabled) return;
  let steps: Step[] = [];
  if (a.steps) steps = a.steps();
  else {
    if (a.spot) steps.push({ type: "walk", to: () => hotX(a) ?? view.player.x });
    steps.push({ type: "wait", ms: a.ms ?? 1100, bubble: a.bubble, pose: a.pose, tv: a.tv, steam: a.steam, uniform: a.uniform, keep: !!a.fade });
  }
  const finish = () => {
    runSim(a.run);
    clearActivity();
    view.player.visible = true;
    a.after?.();
  };
  if (a.fade) steps.push({ type: "fade", ms: 1600, text: a.fade, mid: finish });
  else steps.push({ type: "call", fn: finish });
  runSteps(steps);
}

// where an action "lives" in the scene (for walking up to it and pressing E)
export function hotX(a: ActionDesc): number | null {
  if (typeof a.spot === "function") return a.spot();
  if (a.spot) return resolveSpot(a.spot);
  return null;
}

export function playTravel(dest: PlaceKey, mode: TravelMode) {
  const g = store.getState().game;
  if (!g || isBusy() || g.over) return;
  const plan = planTravel(g, dest, mode);
  if (!plan) return;
  const steps: Step[] = [];
  steps.push({ type: "walk", to: () => sceneEntrance() });
  steps.push({ type: "hide" });
  const label = mode === "subway" ? "Heading to the train" : mode === "swyft" ? "Calling a " + RIDE_APP : "Walking";
  steps.push({
    type: "fade", ms: 900, text: label,
    mid: () => {
      view.player.x = mode === "subway" ? 16 : mode === "swyft" ? 96 : 160;
      enterScene(mode === "subway" ? "station" : "street");
      view.player.visible = true;
    },
  });
  if (mode === "subway") {
    steps.push({ type: "walk", to: 64, caption: "Walking to the turnstile" });
    steps.push({ type: "swipe", ms: 2300, result: plan.swipe });
    steps.push({ type: "walk", to: 186 });
    if (plan.event === "delay") {
      steps.push({ type: "set", fn: () => (view.delaySign = true) });
      steps.push({ type: "wait", ms: 2300, bubble: "...seriously?", caption: plan.msg });
      steps.push({ type: "set", fn: () => (view.delaySign = false) });
    }
    steps.push({ type: "train", phase: "arrive", ms: 2200, caption: "Train's coming" });
    steps.push({ type: "walk", to: 208 });
    steps.push({ type: "hide" });
    steps.push({ type: "wait", ms: 350 });
    const ride = plan.event === "showtime" ? "SHOWTIME! Dancers in your car" : plan.event === "express" ? "Wait, this train is running express" : "Riding the train";
    steps.push({ type: "train", phase: "depart", ms: 1700, caption: ride });
  } else if (mode === "swyft") {
    steps.push({ type: "wait", ms: 900, bubble: "Requesting...", caption: RIDE_APP + " · " + money(plan.cost) + (plan.surge && plan.surge > 1.15 ? " · " + plan.surge + "x surge" : "") });
    steps.push({ type: "car", phase: "arrive", ms: 1600 });
    steps.push({ type: "walk", to: 122 });
    steps.push({ type: "hide" });
    steps.push({ type: "car", phase: "depart", ms: 1300 });
  } else {
    steps.push({ type: "scroll", ms: 2800, caption: "Walking to " + placeLabel(G(), dest) });
  }
  steps.push({
    type: "fade", ms: 1400, text: placeLabel(g, dest),
    mid: () => {
      runSim((d, fx) => applyTravel(d, fx, plan));
      view.player.visible = true;
    },
  });
  steps.push({ type: "walk", to: () => sceneEntrance() + (G().location === "home" ? -24 : 26) });
  runSteps(steps);
}
