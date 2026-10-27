import { F, WOOD, WOOD_DK } from "../../data/constants";
import type { LayoutItem, Room } from "../../data/layouts";
import { mates } from "../../game/sim";
import { isNight, shade, srand } from "../../game/utils";
import { drawWindow, gfx, ptext, px } from "../draw";
import { G, homeLayout, view } from "../world";

export const tvColor = (now: number) => ["#4aa3df", "#e0745a", "#63c34d", "#b07ad9"][Math.floor(now / 600) % 4];

function roomLabel(r: Room) {
  const g = G();
  if (r.name === "Kid's room") return mates(g, "kid").length ? mates(g, "kid")[0].name + "'s room" : "Guest room";
  if (r.name === "2nd bedroom" && !mates(g, "partner").length) return "Office";
  return r.name;
}

function drawFloor(x: number, w: number, kind: Room["floor"]) {
  if (kind === "wood") {
    px(x, F, w, 6, "#9a6a40");
    for (let i = x; i < x + w; i += 12) px(i, F, 1, 6, "#7d5432");
    px(x, F + 3, w, 1, "#8a5d38");
  } else if (kind === "tile") {
    for (let i = 0; i < w; i += 6) px(x + i, F, 6, 6, (i / 6) % 2 ? "#e8e2d4" : "#3b3b3b");
  } else {
    for (let i = 0; i < w; i += 4) px(x + i, F, 4, 6, (i / 4) % 2 ? "#ffffff" : "#d8e6e6");
  }
}

export function drawHome(layer: "back" | "front", now: number) {
  const g = G();
  const lay = homeLayout(g);
  const W = lay.width;
  if (layer === "front") {
    lay.items.forEach((it) => drawHomeItem(it, "front", now));
    return;
  }
  const night = isNight(g.time);
  // building facade + upstairs neighbors
  px(-40, 0, W + 80, 72, "#8b4c3b");
  for (let y = 4; y < 64; y += 6) px(-40, y, W + 80, 1, "#7a4133");
  for (let x = 12; x < W; x += 44) {
    px(x, 18, 18, 28, "#e9e2d0");
    px(x + 2, 20, 14, 24, night ? ((x * 7) % 3 ? "#f6d06b" : "#2a3550") : "#9fc6e8");
    px(x + 8, 20, 1, 24, "#e9e2d0");
    px(x - 1, 46, 20, 2, "#d3cab4");
  }
  px(-40, 64, W + 80, 8, "#5a3027");
  for (const r of lay.rooms) {
    px(r.x, 72, r.w, 78, r.wall);
    for (let x = r.x + 3; x < r.x + r.w; x += 8) px(x, 76, 1, 70, shade(r.wall, -10));
    px(r.x, 146, r.w, 4, shade(r.wall, -45));
    drawFloor(r.x, r.w, r.floor);
    ptext(roomLabel(r), r.x + 6, 80, shade(r.wall, -80), 6);
  }
  lay.rooms.forEach((r, i) => { if (i > 0) px(r.x - 2, 72, 4, 42, "#4a3a33"); });
  px(-4, 72, 4, 84, "#4a3a33");
  px(W, 72, 4, 84, "#4a3a33");
  px(0, 72, W, 3, "#3e312b");
  px(-40, 156, W + 80, 24, "#3b2a24");
  for (let x = -40; x < W + 40; x += 10) px(x + ((x / 10) % 2 ? 5 : 0), 162, 1, 18, "#2e201b");
  lay.items.forEach((it) => drawHomeItem(it, "back", now));
  drawHomeExtras(now);
}

function drawHomeItem(it: LayoutItem, layer: "back" | "front", now: number) {
  const g = G();
  const items = g.items;
  if (it.need && !items[it.need]) return;
  const x = it.x;
  const back = layer === "back";
  const w = it.w ?? 16;
  switch (it.t) {
    case "window":
      if (back) drawWindow(g.time, x, 92, w, 26);
      break;
    case "plant":
      if (back) {
        const b = it.base ?? F;
        px(x, b - 8, 8, 8, "#b5643c"); px(x - 1, b - 9, 10, 2, "#c97a50");
        px(x + 1, b - 16, 2, 7, "#3f9a4a"); px(x + 4, b - 19, 2, 10, "#4caf50"); px(x - 2, b - 13, 3, 2, "#3f9a4a"); px(x + 7, b - 15, 3, 2, "#4caf50"); px(x + 2, b - 21, 2, 2, "#5cc160");
      }
      break;
    case "bed": {
      const good = !!items.mattress;
      const c = it.c ?? "#3f6fb0";
      const sleeping = view.player.pose === "sleep";
      if (back) {
        px(x, F - 28, 4, 28, WOOD_DK); if (good) px(x + 1, F - 26, 2, 2, "#c9a46a");
        px(x, F - 10, w, 8, WOOD); px(x + 1, F - 2, 2, 2, WOOD_DK); px(x + w - 3, F - 2, 2, 2, WOOD_DK);
        px(x + 2, F - (good ? 16 : 14), w - 4, good ? 6 : 4, "#f3f1ea");
        px(x + 5, F - (good ? 19 : 17), 9, 3, "#ffffff");
        if (!sleeping) { px(x + 15, F - (good ? 17 : 15), w - 18, good ? 7 : 5, c); px(x + 15, F - (good ? 17 : 15), 2, good ? 7 : 5, shade(c, 30)); }
      } else if (sleeping) {
        px(x + 15, F - 20, w - 17, 9, c); px(x + 15, F - 20, 2, 9, shade(c, 30));
      }
      break;
    }
    case "kidbed":
      if (back) {
        px(x, F - 18, 3, 18, "#f2f2f2"); px(x, F - 8, w, 6, "#f2f2f2"); px(x + 2, F - 11, w - 4, 3, "#ffffff");
        px(x + 3, F - 13, 7, 2, "#ffffff"); px(x + 11, F - 12, w - 13, 4, "#e86a9a"); px(x + 14, F - 11, 2, 2, "#ffd24a");
      }
      break;
    case "toys":
      if (back) { px(x, F - 4, 4, 4, "#e0443a"); px(x + 5, F - 4, 4, 4, "#4aa3df"); px(x + 2, F - 8, 4, 4, "#ffd24a"); px(x + 10, F - 3, 4, 3, "#63c34d"); }
      break;
    case "desk": {
      const cx = x + Math.floor(w / 2);
      if (back) {
        px(x, F - 18, w, 3, WOOD); px(x + 1, F - 15, 2, 15, WOOD_DK); px(x + w - 3, F - 15, 2, 15, WOOD_DK);
        if (it.share && items.tv) {
          px(cx - 9, F - 33, 18, 13, "#151515"); px(cx - 8, F - 32, 16, 11, view.tvOn ? tvColor(now) : "#24303d"); px(cx - 2, F - 20, 4, 2, "#333333");
        } else if (it.other) {
          px(cx - 7, F - 30, 14, 10, "#222222"); px(cx - 6, F - 29, 12, 8, "#3d6a8c"); px(cx - 1, F - 20, 2, 2, "#333333");
        } else {
          const active = view.player.pose === "sit" && Math.abs(view.player.x - cx) < 4;
          px(cx - 6, F - 19, 12, 1, "#cccccc"); px(cx - 5, F - 26, 10, 7, "#9aa1aa"); px(cx - 4, F - 25, 8, 5, active ? "#7fd0ff" : "#3d4a5c");
        }
        if (it.share && items.console) px(x + 2, F - 21, 7, 3, "#222222");
        px(x + w - 8, F - 22, 3, 4, "#e9e2d0"); // mug
        px(cx - 5, F - 25, 2, 14, "#2f3640"); px(cx + 3, F - 25, 2, 14, "#2f3640"); // chair back
      } else {
        px(cx - 6, F - 9, 12, 3, "#2f3640"); px(cx - 1, F - 6, 2, 5, "#2f3640"); px(cx - 5, F - 1, 10, 1, "#2f3640");
      }
      break;
    }
    case "fridge":
      if (back) {
        px(x, F - 46, 18, 46, "#dfe4e8"); px(x, F - 46, 18, 1, "#f4f7f9"); px(x, F - 30, 18, 1, "#b8bfc6");
        px(x + 15, F - 42, 1, 8, "#9aa3ab"); px(x + 15, F - 26, 1, 10, "#9aa3ab");
        px(x + 3, F - 40, 2, 2, "#ee5b45"); px(x + 7, F - 37, 2, 2, "#4aa3df");
        // the grocery note shows how many meals you have
        px(x + 2, F - 25, 11, 8, "#ffffff");
        const shown = Math.min(g.meals, 12);
        for (let i = 0; i < shown; i++) px(x + 3 + (i % 6) * 2, F - 24 + Math.floor(i / 6) * 3, 1, 2, ["#63c34d", "#ee5b45", "#f2b233"][i % 3]);
        if (g.meals === 0) px(x + 4, F - 22, 7, 1, "#ee5b45");
      }
      break;
    case "counter":
      if (back) {
        const s = it.stove ?? x;
        px(x, F - 56, w, 14, "#e9e1cc"); for (let i = x; i < x + w; i += 13) px(i, F - 56, 1, 14, "#cfc4aa");
        px(x, F - 20, w, 20, "#e9e1cc"); for (let i = x; i < x + w; i += 13) px(i, F - 18, 1, 18, "#cfc4aa");
        px(x, F - 22, w, 2, "#a89f8d");
        px(s, F - 22, 22, 22, "#e6e6e6"); px(s + 3, F - 23, 6, 1, "#333333"); px(s + 13, F - 23, 6, 1, "#333333");
        px(s + 4, F - 15, 14, 7, "#2a2a2a"); px(s + 3, F - 20, 2, 1, "#555555"); px(s + 8, F - 20, 2, 1, "#555555"); px(s + 13, F - 20, 2, 1, "#555555");
        px(s, F - 46, 22, 4, "#bbbbbb");
        if (view.steam) {
          const t = Math.floor(now / 120);
          for (let i = 0; i < 4; i++) px(s + 4 + ((t + i * 3) % 14), F - 26 - ((t * 2 + i * 5) % 14), 2, 2, "rgba(255,255,255,0.75)");
          px(s + 3, F - 25, 7, 2, "#3a3a3a");
        }
        if (g.meals >= 10) { px(x + w - 12, F - 31, 9, 9, "#c9a46a"); px(x + w - 10, F - 34, 2, 3, "#4caf50"); px(x + w - 7, F - 35, 2, 4, "#e0b36a"); }
      }
      break;
    case "coffee":
      if (back) { px(x, F - 31, 7, 9, "#1f1f1f"); px(x + 1, F - 26, 5, 3, "#6b3b1e"); px(x + 1, F - 30, 2, 1, "#e0443a"); }
      break;
    case "table":
      if (back) { px(x - 3, F - 22, 2, 22, WOOD_DK); px(x + w + 1, F - 22, 2, 22, WOOD_DK); }
      else { px(x, F - 15, w, 3, WOOD); px(x + 2, F - 12, 2, 12, WOOD_DK); px(x + w - 4, F - 12, 2, 12, WOOD_DK); px(x + 10, F - 17, 8, 2, "#ffffff"); }
      break;
    case "couch": {
      const c = it.c ?? "#4f7a9a";
      if (back) { px(x, F - 24, w, 11, shade(c, -18)); px(x + Math.floor(w / 2), F - 23, 1, 9, shade(c, -32)); }
      else {
        px(x + 3, F - 13, w - 6, 6, c); px(x + 3, F - 13, w - 6, 1, shade(c, 22));
        px(x, F - 18, 4, 16, shade(c, -8)); px(x + w - 4, F - 18, 4, 16, shade(c, -8));
        px(x + 2, F - 7, w - 4, 5, shade(c, -22)); px(x + 2, F - 2, 2, 2, WOOD_DK); px(x + w - 4, F - 2, 2, 2, WOOD_DK);
      }
      break;
    }
    case "tv":
      if (back) {
        px(x, F - 12, 30, 12, WOOD); px(x + 2, F - 10, 12, 8, WOOD_DK); px(x + 16, F - 10, 12, 8, WOOD_DK);
        const screen = view.tvOn ? tvColor(now) : "#24303d";
        if (items.tv) { px(x - 3, F - 37, 36, 23, "#111111"); px(x - 2, F - 36, 34, 21, screen); }
        else { px(x + 5, F - 28, 20, 14, "#151515"); px(x + 6, F - 27, 18, 12, screen); }
        if (items.console) { px(x + 3, F - 9, 9, 3, "#222222"); px(x + 4, F - 8, 1, 1, "#4ae04a"); }
      }
      break;
    case "bookshelf":
      if (back) {
        px(x, F - 42, 16, 42, WOOD);
        const rng = srand(x + 7);
        for (let r = 0; r < 4; r++) {
          px(x + 1, F - 41 + r * 10 + 9, 14, 1, WOOD_DK);
          for (let b = 0; b < 6; b++) px(x + 2 + b * 2, F - 41 + r * 10 + 2, 1, 7, ["#c0504d", "#4f81bd", "#9bbb59", "#e0b730", "#8064a2", "#f2f2f2"][Math.floor(rng() * 6)]);
        }
      }
      break;
    case "radiator":
      if (back) { px(x, F - 14, 12, 12, "#d8d0c0"); for (let i = 0; i < 4; i++) px(x + 1 + i * 3, F - 13, 1, 10, "#b9b09f"); px(x + 11, F - 3, 3, 1, "#8a8070"); }
      break;
    case "toilet":
      if (back) { px(x + 5, F - 20, 6, 8, "#f4f4f4"); px(x, F - 12, 11, 5, "#f4f4f4"); px(x + 2, F - 7, 6, 7, "#e6e6e6"); }
      break;
    case "sink":
      if (back) { px(x + 1, F - 40, 9, 12, "#bfe3f0"); px(x, F - 41, 11, 1, "#99aaaa"); px(x, F - 18, 11, 4, "#f4f4f4"); px(x + 4, F - 14, 3, 14, "#e6e6e6"); px(x + 5, F - 21, 1, 3, "#9aa3ab"); }
      break;
    case "tub":
      if (back) { px(x, F - 52, 32, 1, "#9aa3ab"); px(x + 20, F - 51, 12, 38, "#8fd3e8"); for (let i = 0; i < 3; i++) px(x + 22 + i * 4, F - 51, 1, 38, "#76c1d8"); px(x, F - 12, 30, 12, "#f4f4f4"); px(x, F - 12, 30, 1, "#ffffff"); }
      break;
    case "rug":
      if (back) { const c = it.c ?? "#b0413e"; px(x, F, w, 2, c); px(x + 2, F, w - 4, 1, shade(c, 30)); }
      break;
    case "door":
      if (back) {
        px(x - 2, F - 40, 20, 40, "#4a3a33");
        px(x, F - 38, 16, 38, "#6e4a2f"); px(x + 3, F - 34, 10, 12, "#5f3f27"); px(x + 3, F - 19, 10, 14, "#5f3f27");
        px(x + 12, F - 20, 2, 2, "#d4b04c");
        px(x + 12, F - 25, 2, 1, "#c9c9c9"); px(x + 12, F - 28, 2, 1, "#c9c9c9"); px(x + 12, F - 31, 2, 1, "#c9c9c9"); // three locks, it's new york
      }
      break;
  }
}

// stuff you bought that doesn't have a fixed spot in the layout
function drawHomeExtras(now: number) {
  const g = G();
  const lay = homeLayout(g);
  const items = g.items;
  const night = isNight(g.time);
  const find = (t: string) => lay.items.find((it) => it.t === t && !it.other);
  const bed = find("bed"), fridge = find("fridge"), couch = find("couch"), desk = find("desk"), tv = find("tv");
  const ctx = gfx.ctx as CanvasRenderingContext2D;
  if (items.poster && bed) {
    const x = bed.x + (bed.w ?? 44) - 2;
    px(x, 84, 20, 20, "#1d1d1d"); px(x + 2, 86, 16, 16, "#f08a24"); px(x + 2, 94, 16, 8, "#6b4fa0");
    px(x + 11, 88, 4, 4, "#ffd24a"); px(x + 3, 96, 3, 6, "#1d1d1d"); px(x + 7, 94, 3, 8, "#1d1d1d"); px(x + 12, 97, 4, 5, "#1d1d1d");
  }
  if (items.lamp) {
    if (couch) {
      const x = couch.x - 8;
      if (night) { ctx.fillStyle = "rgba(255,214,120,0.16)"; ctx.fillRect(x - 16, F - 54, 40, 54); }
      px(x + 3, F - 34, 1, 34, "#555555"); px(x, F - 40, 8, 6, "#f2d9a0"); px(x + 1, F - 1, 6, 1, "#333333");
    } else if (desk) {
      const x = desk.x + 2;
      if (night) { ctx.fillStyle = "rgba(255,214,120,0.10)"; ctx.fillRect(x - 8, F - 36, 22, 18); }
      px(x + 2, F - 28, 1, 10, "#555555"); px(x, F - 31, 6, 3, "#f2d9a0"); px(x + 1, F - 19, 4, 1, "#333333");
    }
  }
  if (items.airfryer && fridge) { px(fridge.x + 4, F - 54, 10, 8, "#2a2a2a"); px(fridge.x + 6, F - 52, 6, 3, "#7a6a5a"); px(fridge.x + 12, F - 49, 1, 1, "#e0443a"); }
  if (items.speaker) {
    const sx = tv ? tv.x + 31 : desk ? desk.x + (desk.w ?? 36) - 16 : null;
    const sy = tv ? F - 10 : F - 25;
    if (sx != null) {
      px(sx, sy, 6, 9, "#333333"); px(sx + 2, sy + 2, 2, 2, "#111111"); px(sx + 2, sy + 5, 2, 3, "#111111");
      if (view.tvOn || view.steam) { const t = Math.floor(now / 200) % 8; px(sx + 2 + (t % 3), sy - 3 - t, 2, 2, "#ffd24a"); }
    }
  }
}
