// draws one frame of the scene: background, people, foreground, speech bubbles, overlays
import { F } from "../data/constants";
import { getMood, moodColor, playerLook } from "../game/sim";
import type { SceneId } from "../game/types";
import { clamp } from "../game/utils";
import { store } from "../store/gameStore";
import { isBusy } from "./anim";
import { drawBubble, drawHeart, drawPrompt, gfx, ptext } from "./draw";
import { getNear } from "./input";
import { drawOut, drawShops, drawStore, drawStreet } from "./scenes/city";
import { drawHome } from "./scenes/home";
import { drawCloseup, drawStation } from "./scenes/transit";
import { drawHospital, drawOffice, drawRestaurant, drawRetail } from "./scenes/work";
import { drawCat, drawLying, drawPerson, personHeight } from "./sprites";
import { G, homeLayout, isWorkScene, sceneFloor, sceneWidth, view, type Actor, type Player } from "./world";

type Layer = "back" | "front";
const SCENE_DRAW: Record<SceneId, (layer: Layer, now: number) => void> = {
  home: drawHome,
  store: drawStore,
  out: drawOut,
  street: drawStreet,
  station: drawStation,
  shops: drawShops,
  retail: drawRetail,
  office: drawOffice,
  restaurant: drawRestaurant,
  hospital: drawHospital,
};

function isPlayer(a: Actor | Player): a is Player {
  return !("kind" in a);
}

function drawActor(a: Actor | Player, now: number) {
  const ctx = gfx.ctx as CanvasRenderingContext2D;
  const g = G();
  const floor = sceneFloor(view.scene);
  const frame = a.walking ? (Math.floor(now / 140) % 2 ? 1 : 2) : 0;
  const me = isPlayer(a);
  const phase = me ? 0 : a.phase;
  const blink = Math.floor((now + phase) / 110) % 38 === 0;
  if (!me && a.kind === "cat") {
    drawCat(ctx, a.x, floor, a.color ?? "#e0a34a", frame);
    return;
  }
  const lk = me ? playerLook(g) : a.look;
  if (!lk) return;
  const uniform = me ? a.uniform ?? (isWorkScene(view.scene) ? g.job.uniform ?? null : null) : a.uniform ?? null;
  if (a.pose === "sleep") {
    const bed = homeLayout(g).items.find((it) => it.t === "bed");
    if (bed) drawLying(ctx, lk, bed.x + (bed.w ?? 44) - 4, F - 18);
    return;
  }
  if (!me && a.pose === "lie") {
    drawLying(ctx, lk, a.lieX ?? a.x, a.lieY ?? F - 20);
    return;
  }
  drawPerson(ctx, lk, Math.round(a.x), floor, 1, { frame, sit: a.pose === "sit", uniform, blink, kid: !me && a.kid });
}

function actorTop(a: Actor | Player) {
  const floor = sceneFloor(view.scene);
  const me = isPlayer(a);
  if (!me && a.kind === "cat") return floor - 12;
  if (a.pose === "sleep" || a.pose === "lie") return F - 30;
  const lk = me ? playerLook(G()) : a.look;
  return floor - (lk ? personHeight(lk, a.pose === "sit", !me && a.kid) : 30) - 3;
}

export function drawFrame(now: number) {
  const ctx = gfx.ctx;
  if (!ctx) return;
  const g = G();
  const W = sceneWidth(view.scene);
  const p = view.player;
  const target = clamp(p.x - 160, 0, Math.max(0, W - 320));
  view.camX += (target - view.camX) * 0.12;
  if (Math.abs(target - view.camX) < 0.5) view.camX = target;

  ctx.setTransform(2, 0, 0, 2, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, 320, 180);
  ctx.save();
  ctx.translate(-Math.round(view.camX), 0);
  const draw = SCENE_DRAW[view.scene];
  draw("back", now);
  view.npcs.forEach((n) => drawActor(n, now));
  if (p.visible) drawActor(p, now);
  draw("front", now);
  // bubbles + mood heart on top of everything
  view.npcs.forEach((n) => {
    if (n.bubble && now < n.until) drawBubble(n.x, actorTop(n), n.bubble);
  });
  if (p.visible) {
    const top = actorTop(p);
    if (p.bubble) drawBubble(p.x, top, p.bubble);
    else drawHeart(Math.round(p.x), top - 8 + (Math.floor(now / 400) % 2), moodColor(getMood(g)));
  }
  ctx.restore();

  const st = store.getState();
  const near = getNear();
  if (!isBusy() && !st.modals.length && near.length) {
    drawPrompt(near.length === 1 ? "[E] " + near[0].label : "[E] " + near.length + " things to do here");
  } else if (st.toast && now < st.toast.until) drawPrompt(st.toast.text);
  if (view.closeup) drawCloseup();
  if (view.fade > 0) {
    ctx.fillStyle = "rgba(8,10,14," + view.fade.toFixed(3) + ")";
    ctx.fillRect(0, 0, 320, 180);
    if (view.fadeText && view.fade > 0.6) ptext(view.fadeText, 160, 90, "rgba(255,210,74," + view.fade.toFixed(2) + ")", 12, "center");
  }
}
