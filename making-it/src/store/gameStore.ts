import { SAVE_KEY } from "../data/constants";
import { createGame, loadFixups } from "../game/sim";
import type { Fx, GameState, Look, ModalDesc, SimFn, TraitKey } from "../game/types";
import { createStore } from "./createStore";

export type Tab = "do" | "go" | "stuff" | "log";
export type ModalItem = ModalDesc & { id: number };

interface AppState {
  game: GameState | null;
  modals: ModalItem[];
  busy: boolean; // an animation is playing, so buttons are locked
  near: string[]; // labels of the actions next to the player
  caption: string;
  tab: Tab;
  speed: number;
  toast: { text: string; until: number } | null;
}

export const store = createStore<AppState>({
  game: null,
  modals: [],
  busy: false,
  near: [],
  caption: "",
  tab: "do",
  speed: typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches ? 4 : 1,
  toast: null,
});
export const useGame = store.useStore;

let modalId = 1;
export function pushModal(m: ModalDesc) {
  store.setState((s) => ({ modals: [...s.modals, { ...m, id: modalId++ }] }));
}
export function closeModal() {
  store.setState((s) => ({ modals: s.modals.slice(1) }));
}
export function showToast(text: string, ms = 4000) {
  store.setState({ toast: { text, until: performance.now() + ms } });
}

// the engine wants to know whenever the game changes (to swap scenes, rebuild spots, etc)
const afterSimHooks: Array<() => void> = [];
export const onAfterSim = (fn: () => void) => afterSimHooks.push(fn);

// run a piece of sim code on a copy of the game, then save it.
// the sim mutates the copy freely, React just sees a brand new object.
export function runSim(fn: SimFn) {
  const cur = store.getState().game;
  if (!cur) return;
  const draft = structuredClone(cur);
  const modals: ModalDesc[] = [];
  let toast: string | null = null;
  const fx: Fx = { modal: (m) => modals.push(m), toast: (t) => (toast = t) };
  fn(draft, fx);
  store.setState({ game: draft });
  modals.forEach(pushModal);
  if (toast) showToast(toast);
  saveGame(draft);
  afterSimHooks.forEach((h) => h());
}

export function startGame(look: Look, name: string, trait: TraitKey, jobKey: string) {
  const g = createGame(look, name, trait, jobKey);
  store.setState({ game: g, modals: [], tab: "do", near: [], busy: false });
  saveGame(g);
  showToast("← → to walk · E to use things · G to go somewhere", 7000);
  afterSimHooks.forEach((h) => h());
}

export function continueGame(g: GameState) {
  store.setState({ game: loadFixups(g), modals: [], tab: "do", near: [], busy: false });
  afterSimHooks.forEach((h) => h());
}

export function quitGame() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* storage blocked */
  }
  store.setState({ game: null, modals: [], busy: false, near: [] });
}

export function saveGame(g: GameState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(g));
  } catch {
    /* storage blocked, oh well */
  }
}

export function loadSave(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const g = JSON.parse(raw) as GameState;
    if (!g || !g.needs || g.over) return null;
    return g;
  } catch {
    return null;
  }
}
