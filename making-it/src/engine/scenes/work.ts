// the four workplaces: retail floor, office, restaurant, hospital
import { F, WOOD, WOOD_DK } from "../../data/constants";
import { isNight, shade, srand } from "../../game/utils";
import { ptext, px, skyColors } from "../draw";
import { G, view } from "../world";

const SHIRTS = ["#2d4a7a", "#e87aa5", "#e0b730", "#1c7a4b", "#ece6d8", "#6b4fa0", "#b8402f"];

export function drawRetail(layer: "back" | "front") {
  if (layer === "front") {
    px(250, 126, 58, 24, "#5a4a3a"); px(250, 124, 58, 2, "#3a2f25");
    px(258, 114, 12, 10, "#222222"); px(259, 115, 10, 4, "#63c34d");
    return;
  }
  px(0, 0, 320, 150, "#efe7da");
  px(0, 24, 320, 14, "#c8352b"); ptext("CORNER GOODS · HERALD SQ", 160, 31, "#ffffff", 7, "center");
  for (let x = 20; x < 320; x += 50) { px(x, 0, 2, 10, "#555555"); px(x - 3, 10, 8, 3, "#333333"); }
  px(0, F, 320, 30, "#a77d55"); for (let x = 0; x < 320; x += 14) px(x, F, 1, 30, "#8a6440");
  px(2, 100, 16, 50, "#a8d4e6"); px(2, 100, 16, 2, "#7a8a8f");
  for (const rx of [40, 180]) {
    px(rx, 104, 48, 2, "#777777"); px(rx + 23, 104, 2, 46, "#777777"); px(rx + 14, F - 2, 20, 2, "#777777");
    for (let i = 0; i < 7; i++) { px(rx + 3 + i * 6, 104, 1, 3, "#555555"); px(rx + 1 + i * 6, 107, 5, 16, SHIRTS[(i + rx) % 7]); }
  }
  px(110, F - 16, 52, 3, WOOD); px(112, F - 13, 2, 13, WOOD_DK); px(158, F - 13, 2, 13, WOOD_DK);
  for (let i = 0; i < 4; i++) { px(113 + i * 12, F - 22, 10, 6, SHIRTS[i + 1]); px(113 + i * 12, F - 19, 10, 1, shade(SHIRTS[i + 1], -25)); }
}

export function drawOffice(layer: "back" | "front") {
  if (layer === "front") {
    for (const x of [50, 210]) { px(x + 14, F - 9, 12, 3, "#2f3640"); px(x + 19, F - 6, 2, 5, "#2f3640"); px(x + 15, F - 1, 10, 1, "#2f3640"); }
    return;
  }
  const g = G();
  px(0, 0, 320, 150, "#dde3e8");
  px(0, 0, 320, 16, "#c9d1d8"); for (let x = 30; x < 320; x += 70) px(x, 14, 40, 2, "#ffffff");
  const sky = skyColors(g.time);
  const night = isNight(g.time);
  px(20, 40, 280, 54, sky[0]); px(20, 70, 280, 24, sky[1]);
  const rng = srand(9);
  for (let x = 20; x < 300; x += 10) {
    const h = 14 + Math.floor(rng() * 34);
    px(x, 94 - h, 9, h, night ? "#1a1f33" : "#7f93a8");
    if (night) px(x + 3, 96 - h, 1, 1, "#ffd76a");
  }
  for (let x = 20; x <= 300; x += 40) px(x, 40, 2, 54, "#b8c1c9");
  px(20, 94, 282, 3, "#b8c1c9");
  px(0, F, 320, 30, "#5f6e7e"); for (let x = 0; x < 320; x += 4) px(x, F + ((x / 4) % 2), 1, 1, "#6e7d8d");
  [50, 210].forEach((x, i) => {
    px(x, F - 18, 40, 3, "#e6e6e6"); px(x + 2, F - 15, 2, 15, "#9aa3ab"); px(x + 36, F - 15, 2, 15, "#9aa3ab");
    px(x + 12, F - 32, 16, 11, "#222222"); px(x + 13, F - 31, 14, 9, i === 0 && view.player.pose === "sit" ? "#7fd0ff" : "#3d6a8c"); px(x + 18, F - 21, 4, 3, "#333333");
    px(x + 15, F - 26, 10, 1, "#2f3640");
  });
  px(276, F - 34, 12, 34, "#dfe7ee"); px(277, F - 46, 10, 12, "#8fcff0"); px(279, F - 28, 3, 2, "#4aa3df");
  px(130, F - 10, 8, 10, "#b5643c"); px(131, F - 22, 2, 12, "#3f9a4a"); px(134, F - 26, 2, 16, "#4caf50");
}

export function drawRestaurant(layer: "back" | "front", now: number) {
  if (layer === "front") {
    for (const x of [50, 120, 190]) {
      px(x, F - 16, 32, 3, "#efe9dd"); px(x, F - 13, 32, 7, "#e6dfd0"); px(x + 3, F - 6, 2, 6, WOOD_DK); px(x + 27, F - 6, 2, 6, WOOD_DK);
      px(x + 15, F - 21, 2, 5, "#f5e7b8"); px(x + 15, F - 22, 2, 1, Math.floor(now / 200) % 2 ? "#ffb340" : "#ffd24a");
      px(x + 4, F - 17, 6, 1, "#ffffff"); px(x + 22, F - 17, 6, 1, "#ffffff");
    }
    return;
  }
  px(0, 0, 320, 150, "#7e3b2c"); for (let y = 2; y < 150; y += 6) px(0, y, 320, 1, "#6b3124");
  for (let x = 0; x < 320; x += 4) px(x, 46 + Math.abs((x % 40) - 20) / 4, 1, 1, "#2a2a2a");
  for (let x = 6; x < 320; x += 20) px(x, 48 + Math.abs(((x + 2) % 40) - 20) / 4, 2, 2, Math.floor(now / 400 + x) % 7 ? "#ffd76a" : "#fff3c0");
  px(30, 72, 18, 14, "#e9e2d0"); px(32, 74, 14, 10, "#4f7a9a");
  px(140, 70, 22, 16, "#e9e2d0"); px(142, 72, 18, 12, "#c97a50");
  px(246, 86, 68, 34, "#2a2a2a"); px(250, 90, 60, 26, "#3d3d3d");
  for (let i = 0; i < 4; i++) { px(256 + i * 14, 84, 6, 3, "#e8a33c"); px(255 + i * 14, 110, 8, 2, "#ffffff"); }
  px(244, 118, 72, 4, "#aaaaaa"); px(244, 122, 72, 28, "#4a4a4a");
  for (let x = 0; x < 320; x += 6) px(x, F, 6, 30, (x / 6) % 2 ? "#3b2a22" : "#2e211b");
}

export function drawHospital(layer: "back" | "front", now: number) {
  if (layer === "front") {
    for (const x of [36, 116, 196]) { px(x + 14, F - 21, 26, 7, "#8fb8e0"); px(x + 14, F - 21, 26, 1, "#b5d3f0"); }
    px(250, 124, 64, 26, "#e9f2f1"); px(250, 122, 64, 2, "#7fb8ad"); ptext("NURSES", 282, 136, "#3c6d64", 6, "center");
    px(268, 112, 12, 10, "#222222"); px(269, 113, 10, 6, "#3d6a8c");
    return;
  }
  px(0, 0, 320, 150, "#d7ebe7"); px(0, 110, 320, 4, "#7fb8ad");
  for (let x = 0; x < 320; x += 8) px(x, F, 8, 30, (x / 8) % 2 ? "#c3cfd2" : "#b7c4c7");
  [36, 116, 196].forEach((x, i) => {
    px(x - 6, 52, 52, 2, "#999999");
    for (let k = 0; k < 4; k++) px(x - 6 + k * 3, 54, 2, 70, k % 2 ? "#8fc6de" : "#9fd0e8");
    px(x + 36, 84, 14, 12, "#111111");
    const t = Math.floor(now / 80 + i * 13) % 14;
    for (let k = 0; k < 12; k++) px(x + 37 + k, 90 - (k === t ? 3 : k === t + 1 ? -2 : 0), 1, 1, "#4ae04a");
    px(x + 42, 96, 2, 20, "#888888");
    px(x, F - 14, 42, 4, "#aab0bb"); px(x + 1, F - 10, 2, 10, "#888888"); px(x + 39, F - 10, 2, 10, "#888888");
    px(x + 2, F - 18, 38, 4, "#ffffff"); px(x + 3, F - 21, 9, 3, "#ffffff");
  });
}
