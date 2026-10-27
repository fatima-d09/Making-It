// starts/stops the requestAnimationFrame loop that runs the scene
import { onAfterSim, store } from "../store/gameStore";
import { currentSpeed, resetAnimation, stepAnimation } from "./anim";
import { gfx } from "./draw";
import { updateKeyWalk, updateNearby } from "./input";
import { drawFrame } from "./render";
import { isWorkScene, syncScene, updateNpcs, view } from "./world";
import { HOUSING } from "../data/world";
import { homeMates } from "../game/sim";
import { isNight } from "../game/utils";

// whenever the sim changes, make sure the scene still matches (travel, moving, buying furniture)
onAfterSim(() => syncScene());

function defaultCaption(): string {
  const g = store.getState().game;
  if (!g) return "";
  const h = HOUSING[g.housing];
  if (view.scene === "home") {
    const who = homeMates(g).map((m) => m.name).join(" and ");
    return h.type + " · " + h.hood + (who ? " · " + who + " is home" : "");
  }
  if (view.scene === "store") return "Fresh Market · " + g.meals + " meals in your fridge";
  if (view.scene === "out") return "Lower East Side · " + (isNight(g.time) ? "night out" : "daytime");
  if (view.scene === "shops") return "Fulton Mall · home goods, electronics, clothes";
  if (isWorkScene(view.scene)) return g.job.place + " · " + g.job.title;
  return "";
}

export function startEngine(canvas: HTMLCanvasElement) {
  gfx.ctx = canvas.getContext("2d");
  resetAnimation();
  syncScene(true);
  let last = performance.now();
  let raf = 0;
  const frame = (now: number) => {
    const dt = Math.min(64, now - last);
    last = now;
    if (store.getState().game) {
      stepAnimation(dt);
      updateKeyWalk(dt);
      updateNpcs(dt, now, currentSpeed());
      updateNearby();
      drawFrame(now);
      const cap = view.caption ?? defaultCaption();
      if (cap !== store.getState().caption) store.setState({ caption: cap });
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf);
    gfx.ctx = null;
  };
}
