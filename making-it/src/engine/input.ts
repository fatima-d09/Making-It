// walking with the keyboard + "press E to use what's next to you"
import type { GameState } from "../game/types";
import { pushModal, store } from "../store/gameStore";
import { getActions, type ActionDesc } from "./actions";
import { hotX, isBusy, playAction } from "./anim";
import { clamp } from "../game/utils";
import { sceneEntrance, sceneWidth, view } from "./world";

export const keys = { left: false, right: false, touch: 0 };

export interface NearSpot {
  x: number;
  label: string;
  exit?: boolean;
}

let near: NearSpot[] = [];
let nearKey = "";
let cache: { g: GameState | null; scene: string; actions: ActionDesc[] } = { g: null, scene: "", actions: [] };

export const getNear = () => near;

// the action list depends on the game + which scene is loaded, so cache it per change
export function currentActions(): ActionDesc[] {
  const g = store.getState().game;
  if (!g) return [];
  const key = view.sceneKey + "|" + Object.keys(view.spots).length;
  if (cache.g !== g || cache.scene !== key) cache = { g, scene: key, actions: getActions(g) };
  return cache.actions;
}

export function updateKeyWalk(dt: number) {
  const p = view.player;
  const st = store.getState();
  const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0) + keys.touch;
  const blocked = !dir || isBusy() || st.modals.length > 0 || !st.game || st.game.over || !p.visible || p.pose !== "stand";
  if (blocked) {
    if (p.keyWalking) {
      p.walking = false;
      p.keyWalking = false;
    }
    return;
  }
  p.x = clamp(p.x + (Math.sign(dir) * 62 * dt * st.speed) / 1000, 6, sceneWidth(view.scene) - 6);
  p.walking = true;
  p.keyWalking = true;
}

export function updateNearby() {
  const p = view.player;
  let group: NearSpot[] = [];
  if (p.visible && !isBusy() && p.pose === "stand") {
    const list: NearSpot[] = [];
    for (const a of currentActions()) {
      if (a.disabled) continue;
      const x = hotX(a);
      if (x != null) list.push({ x, label: a.label });
    }
    list.push({ x: sceneEntrance(), exit: true, label: "Leave · go somewhere" });
    let best: NearSpot | null = null;
    for (const h of list) {
      const d = Math.abs(h.x - p.x);
      if (d < 16 && (!best || d < Math.abs(best.x - p.x))) best = h;
    }
    if (best) {
      const b = best;
      group = list.filter((h) => Math.abs(h.x - b.x) < 5);
    }
  }
  const key = group.map((h) => h.label).join("|");
  if (key === nearKey) return;
  nearKey = key;
  near = group;
  store.setState({ near: group.filter((h) => !h.exit).map((h) => h.label) });
}

export function pickNearAction(label: string) {
  if (label === "Leave · go somewhere") return openGoMenu();
  const a = currentActions().find((x) => x.label === label);
  if (a) playAction(a);
}

export function interact() {
  const g = store.getState().game;
  if (!g || isBusy() || g.over) return;
  if (!near.length) {
    store.setState({ toast: { text: "Walk up to something to use it", until: performance.now() + 1800 } });
    return;
  }
  if (near.length === 1) return pickNearAction(near[0].label);
  pushModal({ kind: "choose", labels: near.map((n) => n.label) });
}

export function openGoMenu() {
  const g = store.getState().game;
  if (!g || isBusy() || g.over) return;
  pushModal({ kind: "go" });
}
