// scene state that lives outside React: where the player is standing, the npcs,
// the camera, walk-to spots. the render loop reads this every frame.
import { F, SIDEWALK } from "../data/constants";
import { HOME_LAYOUTS, STATIC_SPOTS, itemWidth } from "../data/layouts";
import { HOUSING } from "../data/world";
import { homeMates } from "../game/sim";
import type { GameState, Look, PlaceKey, SceneId, SwipeResult, Uniform } from "../game/types";
import { clamp, lookFromSeed, rand } from "../game/utils";
import { store } from "../store/gameStore";

export type Pose = "stand" | "sit" | "sleep" | "lie";

export interface Actor {
  name: string;
  kind: "person" | "cat";
  look?: Look;
  x: number;
  target: number | null;
  zone: [number, number];
  pose: Pose;
  nextMove: number;
  hold: boolean;
  bubble: string | null;
  until: number;
  phase: number;
  walking: boolean;
  isStatic?: boolean;
  uniform?: Uniform | null;
  kid?: boolean;
  color?: string;
  lieX?: number;
  lieY?: number;
  commuter?: boolean;
}

export interface Player {
  x: number;
  visible: boolean;
  pose: Pose;
  bubble: string | null;
  walking: boolean;
  keyWalking: boolean;
  uniform: Uniform | null;
}

export const view = {
  scene: "home" as SceneId,
  sceneKey: "",
  camX: 0,
  spots: {} as Record<string, number>,
  npcs: [] as Actor[],
  player: { x: 60, visible: true, pose: "stand", bubble: null, walking: false, keyWalking: false, uniform: null } as Player,
  fade: 0,
  fadeText: "",
  closeup: null as null | { t: number; ms: number; result: SwipeResult },
  train: null as null | { x: number; open: boolean },
  car: null as null | { x: number },
  scroll: 0,
  tvOn: false,
  steam: false,
  delaySign: false,
  caption: null as string | null,
};

// the game as of right now (the canvas only ever reads it)
export const G = () => store.getState().game as GameState;

export const homeLayout = (g: GameState = G()) => HOME_LAYOUTS[HOUSING[g.housing].tier];
export const isWorkScene = (id: SceneId) => id === "retail" || id === "office" || id === "restaurant" || id === "hospital";

export function sceneFor(g: GameState, loc: PlaceKey): SceneId {
  if (loc === "work") return g.job.scene ?? "office";
  return loc;
}
export function sceneWidth(id: SceneId) {
  if (id === "home") return homeLayout().width;
  if (id === "out" || id === "shops") return 480;
  return 320;
}
export const sceneFloor = (id: SceneId) => (id === "out" || id === "street" ? SIDEWALK : F);

function buildSpots(id: SceneId): Record<string, number> {
  if (id !== "home") return { ...STATIC_SPOTS[id] };
  const g = G();
  const s: Record<string, number> = {};
  for (const it of homeLayout(g).items) {
    if (!it.spot) continue;
    if (it.need && !g.items[it.need]) continue;
    s[it.spot] = it.t === "counter" && it.stove != null ? it.stove + 11 : it.x + itemWidth(it) / 2;
  }
  return s;
}
export const rebuildSpots = () => (view.spots = buildSpots(view.scene));

export function resolveSpot(name: string): number | null {
  const s = view.spots;
  if (s[name] != null) return s[name];
  // fallbacks for apartments that don't have everything
  if (name === "couch") return s.desk ?? null;
  if (name === "tv" || name === "bookshelf") return s.couch ?? s.desk ?? null;
  if (name === "coffee") return s.stove ?? null;
  return null;
}
export const spotX = (name: string) => resolveSpot(name) ?? view.player.x;
export function sceneEntrance(): number {
  if (view.scene === "home") return view.spots.door ?? 20;
  return view.spots.entrance ?? 16;
}

// ---------- npcs ----------
function makeNpc(o: Partial<Actor> & { name: string }): Actor {
  return { kind: "person", x: 100, target: null, zone: [20, 300], pose: "stand", nextMove: 0, hold: false, bubble: null, until: 0, phase: Math.random() * 3000, walking: false, ...o };
}
export { makeNpc };

function makeNpcs(id: SceneId): Actor[] {
  const g = G();
  const list: Actor[] = [];
  if (id === "home") {
    const lay = homeLayout(g);
    const mateZone = lay.zones.mate ?? [40, 200];
    for (const m of homeMates(g)) {
      if (m.role === "cat") {
        const z = lay.zones.cat ?? mateZone;
        list.push(makeNpc({ name: m.name, kind: "cat", x: z[0] + 40, zone: z, color: "#e0a34a" }));
      } else if (m.role === "kid") {
        const z = lay.zones.kid ?? mateZone;
        list.push(makeNpc({ name: m.name, look: lookFromSeed(m.name + "kid"), kid: true, x: z[0] + 30, zone: z }));
      } else list.push(makeNpc({ name: m.name, look: lookFromSeed(m.name), x: mateZone[0] + 30, zone: mateZone }));
    }
  } else if (id === "store") {
    list.push(makeNpc({ name: "cashier", look: lookFromSeed("cashier9"), x: 286, isStatic: true, uniform: "retail" }));
    list.push(makeNpc({ name: "shopper", look: lookFromSeed("shopper" + g.day), x: 160, zone: [30, 210] }));
  } else if (id === "shops") {
    list.push(makeNpc({ name: "cashier", look: lookFromSeed("mallcashier"), x: 458, isStatic: true, uniform: "lanyard" }));
    list.push(makeNpc({ name: "shopper1", look: lookFromSeed("mall" + g.day), x: 150, zone: [30, 400] }));
    list.push(makeNpc({ name: "shopper2", look: lookFromSeed("mall2" + g.day), x: 320, zone: [30, 400] }));
  } else if (id === "out") {
    list.push(makeNpc({ name: "walker1", look: lookFromSeed("walk" + g.day), x: 200, zone: [20, 470] }));
    list.push(makeNpc({ name: "walker2", look: lookFromSeed("walk2" + g.day), x: 380, zone: [20, 470] }));
  } else if (id === "station") {
    list.push(makeNpc({ name: "c1", look: lookFromSeed("com" + g.time), x: 240, zone: [110, 300], commuter: true }));
    list.push(makeNpc({ name: "c2", look: lookFromSeed("com2" + g.time), x: 280, zone: [110, 300], commuter: true }));
  } else if (id === "retail") {
    list.push(makeNpc({ name: "coworker", look: lookFromSeed("retailco"), x: 288, isStatic: true, uniform: "retail" }));
    list.push(makeNpc({ name: "customer", look: lookFromSeed("cust" + g.day), x: 140, zone: [30, 220] }));
  } else if (id === "office") {
    list.push(makeNpc({ name: "coworker", look: lookFromSeed("officeco"), x: 230, isStatic: true, pose: "sit", uniform: "lanyard" }));
    list.push(makeNpc({ name: "boss", look: lookFromSeed("boss1"), x: 200, zone: [100, 300], uniform: "lanyard" }));
  } else if (id === "restaurant") {
    [50, 120, 190].forEach((x, i) => {
      list.push(makeNpc({ name: "diner" + i, look: lookFromSeed("dinerA" + i + g.day), x: x + 7, isStatic: true, pose: "sit" }));
      list.push(makeNpc({ name: "dinerb" + i, look: lookFromSeed("dinerB" + i + g.day), x: x + 25, isStatic: true, pose: "sit" }));
    });
  } else if (id === "hospital") {
    [36, 116, 196].forEach((x, i) => {
      list.push(makeNpc({ name: "patient" + i, look: lookFromSeed("pt" + i + g.day), x: x + 20, isStatic: true, pose: "lie", lieX: x + 38, lieY: F - 20 }));
    });
    list.push(makeNpc({ name: "nurse", look: lookFromSeed("nurse7"), x: 290, isStatic: true, uniform: "scrubs" }));
  }
  return list;
}

export const findNpc = (name: string) => view.npcs.find((n) => n.name === name);
export const npcX = (name: string) => findNpc(name)?.x ?? null;
export function nearNpcX(n: Actor) {
  const left = n.x - 14;
  return left > 8 ? left : n.x + 14;
}

export function npcSay(name: string, text: string, ms: number) {
  const n = findNpc(name);
  if (!n) return;
  n.bubble = text;
  n.until = performance.now() + ms / store.getState().speed;
}

export function updateNpcs(dt: number, now: number, speed: number) {
  for (const n of view.npcs) {
    if (n.isStatic) continue;
    if (n.target != null && Math.abs(n.target - n.x) > 0.5) {
      const step = ((n.kind === "cat" ? 32 : 26) * dt * speed) / 1000;
      n.x += Math.sign(n.target - n.x) * Math.min(step, Math.abs(n.target - n.x));
      n.walking = true;
    } else {
      n.walking = false;
      if (!n.hold && now > n.nextMove) {
        n.target = rand(n.zone[0], n.zone[1]);
        n.nextMove = now + rand(2500, 6500) / speed;
      }
    }
  }
}

export function snapCamera() {
  view.camX = clamp(view.player.x - 160, 0, Math.max(0, sceneWidth(view.scene) - 320));
}

export function enterScene(id: SceneId) {
  view.scene = id;
  const g = G();
  view.sceneKey = id + "|" + g.housing;
  view.spots = buildSpots(id);
  view.npcs = makeNpcs(id);
  view.train = null;
  view.car = null;
  view.closeup = null;
  view.scroll = 0;
  view.delaySign = false;
  snapCamera();
}

// make the scene match where the game says you are (after travel, moving, loading a save...)
export function syncScene(force = false) {
  const g = store.getState().game;
  if (!g) return;
  const id = sceneFor(g, g.location);
  const key = id + "|" + g.housing;
  if (force || view.sceneKey !== key) {
    enterScene(id);
    view.player.x = id === "home" && force ? spotX("bed") + 30 : sceneEntrance();
    snapCamera();
  } else rebuildSpots(); // furniture may have changed
}
