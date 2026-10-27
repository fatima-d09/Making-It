// tiny drawing helpers for the scene canvas. the canvas is 640x360 but we draw
// in a 320x180 "world" scaled 2x, so one world pixel = a chunky 2x2 block.
import { isNight } from "../game/utils";

export const gfx = { ctx: null as CanvasRenderingContext2D | null };

const ctx = () => gfx.ctx as CanvasRenderingContext2D;

export function px(x: number, y: number, w: number, h: number, c: string) {
  const c2 = ctx();
  c2.fillStyle = c;
  c2.fillRect(Math.round(x), Math.round(y), w, h);
}

export function ptext(s: string, x: number, y: number, c: string, size = 7, align: CanvasTextAlign = "left") {
  const c2 = ctx();
  c2.font = size + "px 'Pixelify Sans', monospace";
  c2.fillStyle = c;
  c2.textAlign = align;
  c2.textBaseline = "middle";
  c2.fillText(s, x, y);
}

export function skyColors(mins: number): [string, string] {
  const h = (mins / 60) % 24;
  if (h < 5 || h >= 21) return ["#0e1430", "#1b2550"];
  if (h < 7) return ["#7aa2d6", "#f2a65a"];
  if (h < 17) return ["#5aa9f2", "#a9dcff"];
  if (h < 19.5) return ["#7a5aa8", "#f08a4b"];
  return ["#2a2f6b", "#4b3f7a"];
}

export function drawSky(time: number, y0: number, h: number) {
  const sky = skyColors(time);
  px(-40, 0, 800, y0 + h, sky[0]);
  px(-40, y0 + Math.floor(h * 0.55), 800, h, sky[1]);
}

export function drawWindow(time: number, x: number, y: number, w: number, h: number) {
  const sky = skyColors(time);
  const night = isNight(time);
  px(x - 2, y - 2, w + 4, h + 4, "#efe9dc");
  px(x, y, w, Math.floor(h / 2), sky[0]);
  px(x, y + Math.floor(h / 2), w, h - Math.floor(h / 2), sky[1]);
  for (let i = 0; i < w; i += 5) {
    const bh = 4 + ((i * 7 + x) % 9);
    px(x + i, y + h - bh, 4, bh, night ? "#1a1f33" : "#7f93a8");
    if (night && (i + x) % 3 === 0) px(x + i + 1, y + h - bh + 2, 1, 1, "#ffd76a");
  }
  px(x + Math.floor(w / 2), y, 1, h, "#efe9dc");
  px(x, y + Math.floor(h / 2), w, 1, "#efe9dc");
  px(x - 3, y + h + 2, w + 6, 2, "#ddd5c4");
}

export function nightTint(x: number, w: number) {
  const c2 = ctx();
  c2.fillStyle = "rgba(10,15,40,0.28)";
  c2.fillRect(x, 0, w, 180);
}

export function drawBubble(x: number, y: number, text: string) {
  const c2 = ctx();
  c2.font = "7px 'Pixelify Sans', monospace";
  const w = Math.ceil(c2.measureText(text).width) + 8;
  const bx = Math.round(x - w / 2);
  const by = Math.round(y - 13);
  px(bx, by, w, 11, "#111111");
  px(bx + 1, by + 1, w - 2, 9, "#ffffff");
  px(Math.round(x) - 1, by + 10, 3, 2, "#111111");
  px(Math.round(x), by + 10, 1, 1, "#ffffff");
  ptext(text, bx + 4, by + 6, "#111111", 7);
}

export function drawPrompt(t: string) {
  const c2 = ctx();
  c2.font = "8px 'Pixelify Sans', monospace";
  const w = Math.ceil(c2.measureText(t).width) + 14;
  const x = Math.round(160 - w / 2);
  px(x, 158, w, 15, "#111111");
  px(x + 1, 159, w - 2, 13, "#2b313c");
  px(x + 1, 159, w - 2, 1, "#5b6474");
  ptext(t, 160, 166, "#ffd24a", 8, "center");
}

// little heart over your head, colored by mood
export function drawHeart(x: number, y: number, color: string) {
  px(x - 3, y, 2, 1, color); px(x + 1, y, 2, 1, color);
  px(x - 4, y + 1, 8, 2, color);
  px(x - 3, y + 3, 6, 1, color); px(x - 2, y + 4, 4, 1, color); px(x - 1, y + 5, 2, 1, color);
  px(x - 3, y + 1, 1, 1, "#ffffff");
}
