// the subway platform, the train, and the card-swipe closeup
import { CARD_NAME, F, SKINS, WOOD } from "../../data/constants";
import { hasUnlimited } from "../../game/sim";
import { clamp, easeOut } from "../../game/utils";
import { gfx, ptext, px } from "../draw";
import { G, view } from "../world";

export function drawStation(layer: "back" | "front", now: number) {
  if (layer === "front") return;
  px(0, 0, 320, 150, "#e9e4d6");
  for (let x = 0; x < 320; x += 8) px(x, 0, 1, 150, "#d6cfbd");
  for (let y = 0; y < 150; y += 6) px(0, y, 320, 1, "#d6cfbd");
  px(0, 34, 320, 7, "#2f7d5b"); px(0, 36, 320, 1, "#6fbf98");
  px(118, 12, 84, 16, "#111111"); ptext("TRAINS ⟵ ⟶", 160, 20, "#ffffff", 8, "center");
  px(222, 52, 76, 12, "#111111");
  const msg = view.delaySign ? (Math.floor(now / 500) % 2 ? "DELAYS" : "") : "NEXT TRAIN 1 MIN";
  ptext(msg, 260, 58, "#ffb340", 6, "center");
  px(0, 140, 320, 10, "#4a4a4a");
  if (view.train) drawTrain(view.train.x, view.train.open);
  // steel columns
  for (const c of [36, 104, 214, 300]) { px(c, 0, 6, 150, "#3b5a7a"); px(c, 0, 1, 150, "#5d7fa0"); px(c - 2, 40, 10, 3, "#2f4a66"); }
  // platform + yellow edge strip
  px(0, F, 320, 30, "#8d8f93"); px(0, F, 320, 3, "#f2c230");
  for (let x = 0; x < 320; x += 4) px(x, F + 1, 2, 1, "#d9a91c");
  for (let x = 0; x < 320; x += 20) px(x, F + 3, 1, 27, "#7c7e82");
  // stairs
  for (let s = 0; s < 8; s++) px(0, 96 + s * 7, 34 - s * 4, 7, s % 2 ? "#b8b4ac" : "#a29d94");
  px(0, 94, 36, 2, "#555555");
  // turnstile
  px(60, F - 30, 12, 30, "#9aa1aa"); px(60, F - 30, 12, 2, "#c3c8ce"); px(62, F - 26, 8, 3, "#1d1d1d");
  px(64, F - 25, 4, 1, view.closeup ? "#59e05c" : "#2a7a2c");
  px(72, F - 20, 10, 2, "#c3c8ce");
  px(230, F - 12, 34, 3, WOOD); px(232, F - 9, 2, 9, "#333333"); px(260, F - 9, 2, 9, "#333333");
}

function drawTrain(tx: number, open: boolean) {
  for (let c = 0; c < 3; c++) {
    const x = tx + c * 304;
    px(x, 94, 300, 4, "#9aa0a7");
    px(x, 98, 300, 50, "#c4c9cf");
    px(x, 130, 300, 3, "#e2560e");
    [10, 64, 98, 164, 198, 262].forEach((o, i) => {
      px(x + o, 104, 24, 14, "#2a3440");
      px(x + o + 5, 110, 4, 5, SKINS[(i + c) % 8]); px(x + o + 15, 111, 4, 5, SKINS[(i + c + 3) % 8]);
    });
    for (const d of [40, 140, 240]) {
      if (open) px(x + d, 100, 16, 46, "#1b1f24");
      else { px(x + d, 100, 16, 46, "#aeb4bb"); px(x + d + 7, 100, 2, 46, "#8a9098"); px(x + d + 3, 106, 3, 10, "#2a3440"); px(x + d + 10, 106, 3, 10, "#2a3440"); }
    }
    px(x + 300, 104, 4, 40, "#555555");
  }
  px(tx + 2, 100, 8, 8, "#111111"); ptext("K", tx + 6, 104, "#ffd24a", 7, "center");
  px(tx, 140, 3, 3, "#ffe9a0");
}

// swiping your card, drawn big over the scene (screen coordinates, not world)
export function drawCloseup() {
  const cu = view.closeup;
  if (!cu) return;
  const ctx = gfx.ctx as CanvasRenderingContext2D;
  const p = cu.t / cu.ms;
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, 320, 180);
  px(66, 18, 188, 144, "#11141a"); px(68, 20, 184, 140, "#2a2f37");
  ptext("Swiping your " + CARD_NAME, 160, 30, "#ffffff", 8, "center");
  px(100, 50, 120, 82, "#9aa1aa"); px(100, 50, 120, 4, "#c3c8ce"); px(100, 128, 120, 4, "#7d848c");
  px(116, 58, 88, 18, "#0b0f0b");
  const swiped = p >= 0.6;
  if (!swiped) ptext("SWIPE CARD", 160, 67, "#8bd17c", 8, "center");
  else { ptext(cu.result.screen, 140, 67, cu.result.color, 11, "center"); ptext(cu.result.sub, 186, 67, cu.result.color, 6, "center"); }
  px(196, 112, 8, 8, swiped ? "#59e05c" : "#3a3a3a");
  // card slides left to right through the slot
  const k = clamp((p - 0.12) / 0.45, 0, 1);
  const cx = 70 + easeOut(k) * 124;
  px(cx, 72, 58, 36, "#1d8a6e"); px(cx, 72, 58, 2, "#2fb08e");
  px(cx, 76, 58, 6, "#1b1b1b"); px(cx, 77, 58, 1, "#3a3a3a"); // magnetic stripe
  px(cx + 50, 72, 8, 2, "#0b0d11"); px(cx + 56, 74, 2, 2, "#0b0d11"); // clipped corner
  px(cx, 100, 58, 3, "#f08a24");
  ctx.save();
  ctx.beginPath();
  ctx.rect(cx, 72, 58, 36);
  ctx.clip();
  ptext(CARD_NAME, cx + 4, 88, "#ffffff", 8);
  ptext(hasUnlimited(G()) ? "30-DAY UNLTD" : "PAY-PER-RIDE", cx + 4, 96, "#bfe8dc", 5);
  ptext("➜", cx + 50, 90, "#ffd24a", 7);
  ctx.restore();
  px(92, 100, 136, 4, "#1d1d1d");
  px(92, 102, 136, 3, "#7d848c");
  if (swiped) ptext(cu.result.note, 160, 146, "#ffd24a", 7, "center");
}
