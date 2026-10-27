// outdoor + shopping scenes: grocery store, lower east side, the street, the mall
import { F, WOOD, WOOD_DK } from "../../data/constants";
import { isNight, srand } from "../../game/utils";
import { drawSky, nightTint, ptext, px } from "../draw";
import { G, view } from "../world";

const SHIRTS = ["#2d4a7a", "#e87aa5", "#e0b730", "#1c7a4b", "#ece6d8", "#6b4fa0", "#b8402f", "#1d1f24"];

export function drawStore(layer: "back" | "front") {
  if (layer === "front") {
    px(244, 126, 64, 24, "#6b6e75"); px(244, 124, 64, 2, "#8a8d94"); px(244, 125, 30, 1, "#222222");
    px(250, 132, 20, 2, "#5a5d63");
    return;
  }
  px(0, 0, 320, 150, "#eef1e6");
  px(0, 0, 320, 30, "#cfd4c8");
  for (let x = 30; x < 320; x += 60) px(x, 28, 30, 2, "#ffffff");
  px(0, 36, 320, 16, "#2f7d4f");
  ptext("FRESH MARKET", 160, 44, "#ffffff", 10, "center");
  for (let i = 0; i < 320; i += 8) px(i, F, 8, 30, (i / 8) % 2 ? "#d9d6cc" : "#cfcbbf");
  px(2, 102, 18, 48, "#a8d4e6"); px(2, 102, 18, 2, "#7a8a8f"); px(10, 102, 1, 48, "#7a8a8f");
  const fruit = ["#d9382f", "#f08a24", "#63c34d", "#e0b730"];
  for (let c = 0; c < 3; c++) {
    const cx = 28 + c * 18;
    px(cx, F - 16, 16, 16, "#a0703c"); px(cx, F - 16, 16, 2, "#7a5228");
    for (let i = 0; i < 6; i++) px(cx + 1 + (i % 3) * 5, F - 19 + Math.floor(i / 3) * 3, 4, 3, fruit[(c + i) % 4]);
  }
  const rng = srand(42);
  for (const sx of [92, 150]) {
    px(sx, F - 56, 48, 56, "#bfc4c9");
    for (let r = 0; r < 4; r++) {
      px(sx, F - 56 + r * 14 + 12, 48, 2, "#8f959b");
      for (let i = 0; i < 8; i++) px(sx + 2 + i * 6, F - 56 + r * 14 + 3, 4, 9, ["#d9382f", "#4f81bd", "#e0b730", "#9bbb59", "#ffffff", "#8064a2"][Math.floor(rng() * 6)]);
    }
  }
  px(206, F - 58, 32, 58, "#dfe8ee"); px(208, F - 55, 13, 50, "#9fd7f2"); px(223, F - 55, 13, 50, "#9fd7f2");
  px(210, F - 50, 3, 30, "#c9ecff");
  px(268, 112, 12, 10, "#222222"); px(269, 113, 10, 4, "#63c34d");
}

export function drawOut(layer: "back" | "front", now: number) {
  if (layer === "front") return;
  const g = G();
  const night = isNight(g.time);
  drawSky(g.time, 0, 60);
  // deli
  px(0, 24, 96, 120, "#b85c3a"); for (let y = 28; y < 144; y += 6) px(0, y, 96, 1, "#a04f31");
  px(10, 76, 76, 12, "#111111"); ptext("DELI GROCERY", 48, 82, "#ffd24a", 7, "center");
  for (let i = 0; i < 76; i += 8) px(10 + i, 90, 4, 8, i % 16 ? "#2f7d4f" : "#ffffff");
  px(14, 104, 30, 32, night ? "#f6d06b" : "#a8d4e6"); px(52, 102, 20, 42, "#3a2a22");
  px(20, 40, 14, 20, "#e9e2d0"); px(56, 40, 14, 20, "#e9e2d0");
  // noodle spot
  px(96, 30, 104, 114, "#6a3b2e");
  px(106, 70, 84, 12, "#111111"); ptext("NOODLE BAR", 148, 76, "#ee5b45", 8, "center");
  px(106, 90, 54, 40, night ? "#f2c47a" : "#c8a77a"); px(116, 116, 24, 3, "#3a2a22"); px(126, 104, 6, 6, "#ffffff");
  px(168, 96, 20, 48, "#2a1d17");
  // office tower (interviews)
  px(200, 0, 80, 144, "#5f7f9a");
  for (let y = 6; y < 100; y += 10) for (let x = 204; x < 276; x += 9) px(x, y, 6, 7, night && (x + y) % 3 === 0 ? "#f6d06b" : "#9fc6e8");
  px(226, 108, 28, 36, "#2a3a48"); px(239, 108, 2, 36, "#8fb0c8"); px(214, 100, 52, 4, "#3e5568");
  // bar
  px(280, 40, 70, 104, "#2b2b38");
  ptext("BAR", 315, 74, Math.floor(now / 700) % 6 === 0 ? "#7a3a5a" : "#ff6fb5", 14, "center");
  px(300, 100, 30, 44, "#14141c"); px(286, 96, 58, 2, "#ff6fb5");
  // park
  px(350, 60, 130, 84, "#3f7f3a");
  [366, 410, 452].forEach((tx, i) => {
    px(tx, 92, 5, 52, "#5b3a22");
    px(tx - 12, 64 + (i % 2) * 6, 30, 30, i % 2 ? "#3f9a4a" : "#4caf50");
    px(tx - 6, 58 + (i % 2) * 6, 18, 8, "#5cc160");
  });
  px(350, 128, 130, 2, "#1d1d1d"); for (let i = 352; i < 480; i += 6) px(i, 122, 1, 22, "#1d1d1d");
  px(408, 136, 30, 3, WOOD); px(410, 139, 2, 5, "#333333"); px(434, 139, 2, 5, "#333333");
  drawSidewalk(-40, 560, 0);
  px(84, 136, 9, 9, "#1d1d1d"); px(88, 134, 7, 7, "#2a2a2a"); px(86, 136, 2, 1, "#5a5a5a"); // trash bags
  px(196, 96, 2, 48, "#2a2a2a"); px(192, 94, 10, 3, "#2a2a2a"); px(194, 97, 6, 2, night ? "#ffe9a0" : "#d0d0d0");
  if (night) nightTint(-40, 560);
}

function drawSidewalk(x0: number, w: number, offset: number) {
  px(x0, 144, w, 14, "#b8b4ac");
  for (let x = -offset; x < x0 + w; x += 24) px(x, 144, 1, 14, "#a29d94");
  px(x0, 158, w, 3, "#8d8a84");
  px(x0, 161, w, 19, "#3b3d42");
  for (let x = -(offset % 30); x < x0 + w; x += 30) px(x, 171, 14, 1, "#e0c64a");
}

// rideshare pickup + walking. the buildings scroll by while you walk
export function drawStreet(layer: "back" | "front") {
  if (layer === "front") {
    if (view.car) drawCar(view.car.x, 175);
    return;
  }
  const g = G();
  const night = isNight(g.time);
  drawSky(g.time, 0, 60);
  const off = view.scroll % 80;
  const base = Math.floor(view.scroll / 80);
  for (let i = -1; i < 6; i++) {
    const bx = i * 80 - off;
    const type = (((i + base) % 4) + 4) % 4;
    if (type === 0) {
      // brownstone with a stoop
      px(bx, 30, 80, 114, "#7a4b3a"); px(bx, 30, 80, 4, "#5a3428");
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) px(bx + 10 + c * 24, 42 + r * 26, 12, 16, night && (r + c + i) % 2 ? "#f6d06b" : "#9fc6e8");
      px(bx + 30, 114, 20, 30, "#4a2c20");
      for (let s = 0; s < 4; s++) px(bx + 26 - s * 3, 132 + s * 3, 28 + s * 6, 3, "#8a5a46");
    } else if (type === 1) {
      // walk-up with a fire escape
      px(bx, 20, 80, 124, "#9a5a42"); for (let y = 24; y < 144; y += 6) px(bx, y, 80, 1, "#86503b");
      for (let r = 0; r < 4; r++) {
        px(bx + 12, 30 + r * 26, 12, 16, night && r % 2 ? "#f6d06b" : "#9fc6e8"); px(bx + 52, 30 + r * 26, 12, 16, "#9fc6e8");
        px(bx + 6, 48 + r * 26, 64, 2, "#1d1d1d"); px(bx + 6 + (r % 2) * 50, 30 + r * 26, 2, 20, "#1d1d1d");
      }
    } else if (type === 2) {
      // bodega
      px(bx, 50, 80, 94, "#3a5f8a"); px(bx + 6, 84, 68, 8, "#ffd24a"); ptext("BODEGA", bx + 40, 88, "#1d1d1d", 7, "center");
      for (let s = 0; s < 68; s += 8) px(bx + 6 + s, 94, 4, 6, s % 16 ? "#ee5b45" : "#ffffff");
      px(bx + 8, 104, 30, 30, night ? "#f6d06b" : "#a8d4e6"); px(bx + 48, 104, 18, 40, "#1d2a3a");
    } else {
      // newer glass building
      px(bx, 0, 80, 144, "#6d8aa3");
      for (let y = 6; y < 130; y += 9) px(bx + 4, y, 72, 6, night && (y + i) % 4 === 0 ? "#f6d06b" : "#a9cbe6");
    }
  }
  drawSidewalk(-40, 400, view.scroll);
  if (night) nightTint(-40, 400);
}

export function drawCar(x: number, y: number) {
  px(x + 10, y - 22, 34, 9, "#1d1f24");
  px(x + 13, y - 20, 12, 6, "#9fd0ee"); px(x + 28, y - 20, 13, 6, "#9fd0ee");
  px(x, y - 14, 56, 10, "#24272d"); px(x, y - 14, 56, 1, "#4a4f58");
  px(x + 54, y - 12, 2, 2, "#ffe9a0"); px(x, y - 12, 2, 2, "#e0443a");
  px(x + 7, y - 6, 10, 6, "#111111"); px(x + 39, y - 6, 10, 6, "#111111"); px(x + 10, y - 4, 4, 2, "#8a8f98"); px(x + 42, y - 4, 4, 2, "#8a8f98");
  px(x + 20, y - 26, 14, 4, "#b8f23c"); px(x + 21, y - 25, 12, 2, "#1d1f24");
  px(x + 29, y - 11, 6, 3, "#b8f23c");
}

export function drawShops(layer: "back" | "front", now: number) {
  if (layer === "front") {
    px(410, 126, 68, 24, "#5a4a6a"); px(410, 124, 68, 2, "#3a2f45");
    px(426, 114, 12, 10, "#222222"); px(427, 115, 10, 4, "#63c34d");
    px(446, 118, 10, 6, "#ffffff"); px(447, 119, 8, 1, "#6b4fa0");
    return;
  }
  px(0, 0, 480, 150, "#ece6f2");
  px(0, 0, 480, 22, "#d6cfe0"); for (let x = 20; x < 480; x += 60) px(x, 20, 34, 2, "#ffffff");
  px(0, 26, 480, 14, "#6b4fa0"); ptext("FULTON MALL · THE EVERYTHING STORE", 240, 33, "#ffffff", 8, "center");
  for (let x = 0; x < 480; x += 10) px(x, F, 10, 30, (x / 10) % 2 ? "#d8d2c4" : "#cdc6b6");
  px(2, 100, 16, 50, "#a8d4e6"); px(2, 100, 16, 2, "#7a8a8f"); px(10, 100, 1, 50, "#7a8a8f");
  ([["HOME", 72], ["TECH", 205], ["CLOTHES", 336]] as const).forEach(([label, x]) => {
    px(x - 1, 40, 2, 10, "#555555"); px(x - 24, 50, 48, 12, "#222222"); ptext(label, x, 56, "#ffd24a", 7, "center");
  });
  // home goods: a display living room
  px(28, F, 96, 2, "#b0413e");
  px(36, F - 24, 50, 11, "#3f6a8a"); px(38, F - 13, 46, 6, "#4f7a9a"); px(34, F - 18, 4, 18, "#456f8f"); px(84, F - 18, 4, 18, "#456f8f");
  px(96, F - 34, 1, 34, "#555555"); px(93, F - 40, 8, 6, "#f2d9a0");
  px(106, F - 40, 22, 40, WOOD);
  for (let r = 0; r < 3; r++) {
    px(107, F - 39 + r * 13 + 12, 20, 1, WOOD_DK);
    px(109, F - 39 + r * 13 + 4, 5, 8, "#b5643c"); px(110, F - 39 + r * 13 + 1, 3, 4, "#4caf50");
    px(118, F - 39 + r * 13 + 6, 6, 6, ["#e0b730", "#f2f2f2", "#6fa8dc"][r]);
  }
  px(36, 70, 22, 18, "#1d1d1d"); px(38, 72, 18, 14, "#f08a24");
  // tech: a wall of TVs
  px(150, 66, 112, 56, "#2a2a2a");
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) px(154 + c * 27, 70 + r * 26, 23, 22, ["#4aa3df", "#e0745a", "#63c34d", "#b07ad9"][(c + r + Math.floor(now / 700)) % 4]);
  px(168, F - 16, 74, 3, WOOD); px(170, F - 13, 2, 13, WOOD_DK); px(238, F - 13, 2, 13, WOOD_DK);
  px(176, F - 20, 12, 4, "#222222"); px(196, F - 24, 8, 8, "#333333"); px(214, F - 22, 10, 2, "#222222"); px(213, F - 20, 2, 4, "#222222"); px(222, F - 20, 2, 4, "#222222");
  // clothes: racks, shoe wall, mirror
  px(282, 74, 90, 2, "#999999");
  for (let i = 0; i < 9; i++) { px(284 + i * 10, 68, 7, 4, ["#f1f1f1", "#1d1f24", "#b8402f"][i % 3]); px(284 + i * 10, 71, 7, 1, "#ffffff"); }
  for (const rx of [280, 326]) {
    px(rx, 104, 40, 2, "#777777"); px(rx + 19, 104, 2, 46, "#777777"); px(rx + 11, F - 2, 18, 2, "#777777");
    for (let i = 0; i < 6; i++) { px(rx + 3 + i * 6, 104, 1, 3, "#555555"); px(rx + 1 + i * 6, 107, 5, 16, SHIRTS[(i + rx) % 8]); }
  }
  px(376, 88, 16, 60, "#bfbfbf"); px(378, 90, 12, 56, "#cfe8f2"); px(380, 94, 3, 30, "#e8f6fb");
}
