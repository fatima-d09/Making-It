// pixel people, cats and little item icons. everything is drawn with fillRect.
import { CLOTH, EYES, HAIR, SKINS, WOOD } from "../data/constants";
import type { Look, Tier, Uniform } from "../game/types";
import { mix, shade } from "../game/utils";

type R = (x: number, y: number, w: number, h: number, c: string) => void;

export interface PersonOpts {
  frame?: number; // 0 standing, 1/2 walking
  sit?: boolean;
  uniform?: Uniform | null;
  blink?: boolean;
  kid?: boolean;
}

// draws a front-facing blocky person. (ox, oy) = feet position, u = size of one "pixel"
export function drawPerson(ctx: CanvasRenderingContext2D, lk: Look, ox: number, oy: number, u: number, o: PersonOpts = {}) {
  const R: R = (x, y, w, h, c) => {
    ctx.fillStyle = c;
    ctx.fillRect(Math.round(ox + x * u), Math.round(oy + y * u), w * u, h * u);
  };
  const skin = SKINS[lk.skin] ?? SKINS[3];
  const hairC = HAIR[lk.hairColor] ?? HAIR[0];
  const eyeC = EYES[lk.eyeColor] ?? EYES[0];
  const accC = CLOTH[lk.accColor] ?? CLOTH[6];
  const headC = CLOTH[lk.headColor] ?? CLOTH[3];
  let top = lk.top, topC = CLOTH[lk.topColor] ?? CLOTH[0];
  let bot = lk.bottom, botC = CLOTH[lk.bottomColor] ?? CLOTH[0];
  let shoes = lk.shoes, shoeC = CLOTH[lk.shoeColor] ?? CLOTH[5];
  const uni = o.uniform;
  if (uni === "scrubs") { top = "scrubs"; topC = "#3aa79a"; bot = "slacks"; botC = "#3aa79a"; shoes = "sneakers"; shoeC = "#f2f2f2"; }
  else if (uni === "server") { top = "tee"; topC = "#1d1f24"; bot = "slacks"; botC = "#1d1f24"; shoes = "loafers"; shoeC = "#1d1f24"; }
  else if (uni === "retail") { top = "polo"; topC = "#c8352b"; bot = "slacks"; botC = "#b59a6a"; }

  const kid = !!o.kid;
  const L = o.sit ? 6 : kid ? 5 : ({ short: 8, average: 10, tall: 12 } as Record<string, number>)[lk.height] ?? 10;
  const TH = kid ? 8 : 11; // torso height
  const W = kid ? 8 : ({ slim: 8, average: 10, broad: 12 } as Record<string, number>)[lk.body] ?? 10;
  const hw = W / 2;
  const legW = W >= 12 ? 5 : 4;
  const frame = o.frame ?? 0;
  const legTop = -2 - L;
  const tT = legTop - TH; // torso top
  const H = tT - 10; // head top
  const swing = frame === 1 ? 1 : frame === 2 ? -1 : 0;
  const hijab = lk.headwear === "hijab";

  // ---- behind the body ----
  if (hijab) R(-7, H - 2, 14, 19, headC);
  else hairBack(R, lk.hairStyle, hairC, H);
  if (lk.bag === "backpack") R(-hw - 1, tT + 1, W + 2, 9, accC);

  // ---- legs + shoes ----
  const leg = (x: number, lift: number) => {
    const len = L - lift;
    const bare = bot === "shorts" || bot === "skirt";
    R(x, legTop, legW, len, bare ? skin : botC);
    if (bot === "shorts") R(x, legTop, legW, 4, botC);
    if (bot === "cargo") R(x === 0 ? legW - 2 : x, legTop + 3, 2, 3, shade(botC, -28));
    if (bot === "sweats") R(x, legTop + len - 1, legW, 1, shade(botC, 22));
    if (bot === "slacks") R(x + (x === 0 ? 1 : legW - 2), legTop + 1, 1, Math.max(1, len - 2), shade(botC, -16));
    if (bot === "jeans") R(x + (x === 0 ? legW - 1 : 0), legTop, 1, len, shade(botC, 18));
    const sy = -2 - lift;
    if (shoes === "sneakers") { R(x, sy, legW, 2, shoeC); R(x, sy + 1, legW, 1, "#f1f1f1"); }
    else if (shoes === "hightops") { R(x, sy - 1, legW, 3, shoeC); R(x, sy + 1, legW, 1, "#f1f1f1"); R(x + 1, sy - 1, 1, 1, "#f1f1f1"); }
    else if (shoes === "boots") { R(x, sy - 2, legW, 4, shoeC); R(x, sy + 1, legW, 1, shade(shoeC, -40)); }
    else if (shoes === "loafers") { R(x, sy + 1, legW, 1, shade(shoeC, -10)); R(x, sy, legW, 1, bare ? skin : botC); R(x + 1, sy + 1, 2, 1, shade(shoeC, 25)); }
    else { R(x, sy, legW, 2, skin); R(x, sy, legW, 1, shoeC); }
  };
  leg(-legW, frame === 1 ? 1 : 0);
  leg(0, frame === 2 ? 1 : 0);
  if (bot === "skirt") { R(-hw - 1, legTop, W + 2, 5, botC); R(-hw - 1, legTop + 4, W + 2, 1, shade(botC, -22)); }

  // ---- arms ----
  const sleeve = ({ tee: "short", polo: "short", scrubs: "short", jersey: "short", tank: "none" } as Record<string, string>)[top] ?? "long";
  const armW = top === "puffer" ? 4 : 3;
  const arm = (x: number, dy: number) => {
    const y0 = tT + 1 + dy;
    const armLen = TH - 3;
    if (sleeve === "long") R(x, y0, armW, armLen, topC);
    else if (sleeve === "short") { R(x, y0, armW, 4, topC); R(x, y0 + 4, armW, armLen - 4, skin); }
    else R(x, y0, armW, armLen, skin);
    if (sleeve === "long") R(x, y0 + armLen - 1, armW, 1, shade(topC, -24));
    if (top === "track") R(x + (x < 0 ? 0 : armW - 1), y0, 1, armLen - 1, "#f4f4f4");
    R(x, y0 + armLen, armW, 2, shade(skin, -6)); // hands
  };
  arm(-hw - armW, swing);
  arm(hw, -swing);

  // ---- torso ----
  if (top === "tank") { R(-hw, tT, W, TH, skin); R(-hw + 1, tT + 2, W - 2, TH - 2, topC); R(-hw + 1, tT, 1, 2, topC); R(hw - 2, tT, 1, 2, topC); }
  else if (top === "puffer") { R(-hw - 1, tT - 1, W + 2, TH + 1, topC); for (let y = tT + 2; y < tT + TH; y += 3) R(-hw - 1, y, W + 2, 1, shade(topC, -24)); R(-1, tT - 1, 1, TH + 1, shade(topC, 30)); }
  else R(-hw, tT, W, TH, topC);
  if (top !== "tank" && top !== "puffer") R(-hw, tT + TH - 1, W, 1, shade(topC, -16));
  if (top === "tee") R(-2, tT, 4, 1, skin);
  if (top === "polo") { R(-3, tT, 6, 1, shade(topC, 34)); R(-1, tT + 1, 1, 3, shade(topC, -28)); }
  if (top === "scrubs") { R(-2, tT, 4, 1, skin); R(-1, tT + 1, 2, 1, skin); R(-hw + 1, tT + 3, 3, 2, shade(topC, -16)); }
  if (top === "jersey") { R(-2, tT, 4, 1, skin); R(-hw, tT, 1, TH, "#f2f2f2"); R(hw - 1, tT, 1, TH, "#f2f2f2"); R(-2, tT + 3, 1, 5, "#f2f2f2"); R(0, tT + 3, 3, 1, "#f2f2f2"); R(2, tT + 4, 1, 4, "#f2f2f2"); }
  if (top === "hoodie") { R(-hw + 1, tT, W - 2, 2, shade(topC, -26)); R(-2, tT + 2, 1, 3, "#eeeeee"); R(1, tT + 2, 1, 3, "#eeeeee"); R(-hw + 2, tT + TH - 4, W - 4, 3, shade(topC, -16)); }
  if (top === "buttonup") { R(-3, tT, 2, 1, shade(topC, 38)); R(1, tT, 2, 1, shade(topC, 38)); for (let y = tT + 2; y < tT + TH - 1; y += 3) R(-1, y, 1, 1, shade(topC, -40)); }
  if (top === "blazer") { R(-2, tT, 4, TH, "#ece8df"); R(-3, tT, 1, 6, shade(topC, -26)); R(2, tT, 1, 6, shade(topC, -26)); }
  if (top === "sweater") { R(-hw, tT + 4, W, 2, shade(topC, 36)); R(-2, tT, 4, 1, shade(topC, -22)); }
  if (top === "track") R(-1, tT, 1, TH, "#e6e6e6");

  // ---- uniform bits ----
  if (uni === "retail") R(hw - 3, tT + 3, 2, 1, "#ffffff");
  if (uni === "server") { R(-hw, tT + 6, W, 9, "#f1f1f1"); R(-hw + 1, tT, 1, 6, "#f1f1f1"); R(hw - 2, tT, 1, 6, "#f1f1f1"); }
  if (uni === "lanyard") { R(-2, tT, 1, 5, "#2d6cdf"); R(1, tT, 1, 5, "#2d6cdf"); R(-2, tT + 5, 4, 3, "#f4f4f4"); }
  if (uni === "scrubs") { R(-3, tT, 1, 4, "#2a2a2a"); R(2, tT, 1, 4, "#2a2a2a"); R(-3, tT + 4, 6, 1, "#2a2a2a"); R(-1, tT + 5, 2, 2, "#b8c2c8"); R(hw - 3, tT + 2, 2, 3, "#ffffff"); }

  // ---- neck + bags ----
  if (lk.neck === "chain") { R(-2, tT + 1, 4, 1, "#f2c94c"); R(-1, tT + 2, 2, 1, "#f2c94c"); }
  if (lk.neck === "scarf") { R(-hw, tT - 1, W, 3, accC); R(hw - 3, tT + 2, 2, 5, accC); R(-hw, tT, W, 1, shade(accC, 25)); }
  if (lk.bag === "backpack") { R(-hw + 1, tT, 1, 8, shade(accC, -28)); R(hw - 2, tT, 1, 8, shade(accC, -28)); }
  if (lk.bag === "tote") { R(hw - 1, tT, 1, 7, shade(accC, -24)); R(hw, tT + 6, 4, 6, accC); }
  if (lk.bag === "crossbody") { for (let i = 0; i < 8; i++) R(Math.round(hw - 1 - (i * (W - 1)) / 7), tT + i, 1, 1, shade(accC, -30)); R(-hw - 2, tT + 7, 4, 3, accC); }

  // ---- head + face ----
  R(-5, H, 10, 10, skin);
  R(-5, H + 9, 10, 1, shade(skin, -14));
  if (!hijab) { R(-6, H + 4, 1, 2, skin); R(5, H + 4, 1, 2, skin); }
  const ey = H + 4;
  const browC = lk.hairStyle === "bald" ? shade(skin, -70) : hairC;
  if (o.blink) { R(-3, ey + 1, 2, 1, shade(skin, -55)); R(1, ey + 1, 2, 1, shade(skin, -55)); }
  else if (lk.eyeShape === "sleepy") { R(-3, ey, 2, 1, shade(skin, -26)); R(1, ey, 2, 1, shade(skin, -26)); R(-3, ey + 1, 2, 1, eyeC); R(1, ey + 1, 2, 1, eyeC); }
  else if (lk.eyeShape === "wide") { R(-3, ey - 1, 2, 3, "#ffffff"); R(1, ey - 1, 2, 3, "#ffffff"); R(-2, ey, 1, 2, eyeC); R(1, ey, 1, 2, eyeC); }
  else {
    R(-3, ey, 2, 2, "#ffffff"); R(1, ey, 2, 2, "#ffffff"); R(-2, ey, 1, 2, eyeC); R(1, ey, 1, 2, eyeC);
    if (lk.eyeShape === "lashes") { R(-4, ey, 1, 1, "#1b1b1b"); R(3, ey, 1, 1, "#1b1b1b"); }
  }
  if (lk.brows === "bold") { R(-4, ey - 2, 3, 1, browC); R(1, ey - 2, 3, 1, browC); }
  else if (lk.brows === "arched") { R(-4, ey - 1, 1, 1, browC); R(-3, ey - 2, 2, 1, browC); R(1, ey - 2, 2, 1, browC); R(3, ey - 1, 1, 1, browC); }
  else { R(-3, ey - 2, 2, 1, browC); R(1, ey - 2, 2, 1, browC); }
  R(-1, H + 6, 1, 2, shade(skin, -18));
  R(-2, H + 8, 4, 1, shade(skin, -48));
  if (!kid) {
    const stub = mix(skin, hairC, 0.35);
    if (lk.facialHair === "stubble") { R(-5, H + 7, 3, 3, stub); R(2, H + 7, 3, 3, stub); R(-2, H + 9, 4, 1, stub); }
    if (lk.facialHair === "mustache") R(-3, H + 7, 6, 1, hairC);
    if (lk.facialHair === "goatee") { R(-2, H + 7, 4, 1, hairC); R(-1, H + 9, 2, 2, hairC); }
    if (lk.facialHair === "beard") { R(-5, H + 6, 1, 4, hairC); R(4, H + 6, 1, 4, hairC); R(-5, H + 8, 10, 3, hairC); R(-3, H + 7, 6, 1, hairC); R(-2, H + 8, 4, 1, shade(skin, -48)); }
  }

  // ---- hair, hats, glasses ----
  if (!hijab) hairFront(R, lk.hairStyle, hairC, H, skin);
  headwearFront(R, lk.headwear, headC, H);
  if (lk.eyewear === "glasses") {
    const g = "#222222";
    R(-4, ey - 1, 4, 1, g); R(-4, ey + 2, 4, 1, g); R(-4, ey - 1, 1, 4, g); R(-1, ey - 1, 1, 4, g);
    R(0, ey - 1, 4, 1, g); R(0, ey + 2, 4, 1, g); R(0, ey - 1, 1, 4, g); R(3, ey - 1, 1, 4, g);
  }
  if (lk.eyewear === "shades") { R(-4, ey - 1, 4, 3, "#111111"); R(0, ey - 1, 4, 3, "#111111"); R(-3, ey - 1, 1, 1, "#6a7a8a"); R(1, ey - 1, 1, 1, "#6a7a8a"); }
  if (lk.ears === "earrings" && !hijab) { R(-6, H + 6, 1, 2, "#f2c94c"); R(5, H + 6, 1, 2, "#f2c94c"); }
  if (lk.ears === "headphones" || uni === "headset") { R(-6, H - 2, 12, 1, "#222222"); R(-7, H + 3, 2, 4, "#2b2b2b"); R(5, H + 3, 2, 4, "#2b2b2b"); }
  if (uni === "headset") { R(-6, H + 7, 4, 1, "#222222"); R(-3, H + 7, 1, 1, "#e0443a"); }
}

function hairBack(R: R, style: string, c: string, H: number) {
  if (style === "long") R(-6, H + 2, 12, 16, c);
  else if (style === "bob") R(-6, H + 2, 12, 9, c);
  else if (style === "afro") { R(-8, H - 5, 16, 13, c); R(-9, H - 2, 1, 8, c); R(8, H - 2, 1, 8, c); R(-6, H - 6, 12, 1, c); }
  else if (style === "locs") { for (let i = 0; i < 6; i++) R(-6 + i * 2, H + 3, 1, 13 + (i % 2) * 3, c); }
}

function hairFront(R: R, style: string, c: string, H: number, skin: string) {
  const dk = shade(c, -24);
  switch (style) {
    case "bald": R(-3, H, 2, 1, shade(skin, 24)); break;
    case "buzz": { const b = mix(skin, c, 0.65); R(-5, H, 10, 2, b); R(-5, H + 2, 1, 2, b); R(4, H + 2, 1, 2, b); break; }
    case "short": R(-5, H - 1, 10, 3, c); R(-5, H + 2, 1, 3, c); R(4, H + 2, 1, 3, c); R(-4, H + 2, 3, 1, c); break;
    case "fade": { const b = mix(skin, c, 0.5); R(-5, H - 1, 10, 3, c); R(-5, H + 2, 1, 4, b); R(4, H + 2, 1, 4, b); R(-5, H - 1, 10, 1, dk); break; }
    case "curls": R(-6, H - 2, 12, 4, c); for (let x = -6; x < 6; x += 2) R(x, H - 3, 1, 1, c); R(-6, H + 2, 1, 3, c); R(5, H + 2, 1, 3, c); for (let x = -5; x < 6; x += 3) R(x, H - 1, 1, 1, dk); break;
    case "afro": R(-6, H - 1, 12, 2, c); break;
    case "twists": R(-5, H - 1, 10, 3, c); for (let x = -5; x < 5; x += 2) R(x, H - 3, 1, 2, c); R(-5, H + 2, 1, 2, c); R(4, H + 2, 1, 2, c); break;
    case "locs": R(-6, H - 1, 12, 3, c); R(-6, H + 2, 1, 11, c); R(5, H + 2, 1, 11, c); R(-4, H + 2, 1, 1, c); break;
    case "braids":
      R(-5, H - 1, 10, 3, c); R(-1, H - 1, 1, 3, shade(skin, -12));
      for (let y = H + 2; y < H + 17; y += 2) { R(-7, y, 2, 1, c); R(-7, y + 1, 2, 1, dk); R(5, y, 2, 1, c); R(5, y + 1, 2, 1, dk); }
      break;
    case "long": R(-5, H - 1, 10, 3, c); R(-6, H + 1, 2, 13, c); R(4, H + 1, 2, 13, c); R(-1, H - 1, 1, 2, dk); break;
    case "bob": R(-6, H - 1, 12, 3, c); R(-6, H + 2, 2, 7, c); R(4, H + 2, 2, 7, c); R(-4, H + 2, 8, 1, c); break;
    case "ponytail": R(-5, H - 1, 10, 3, c); R(-5, H + 2, 1, 2, c); R(4, H + 2, 1, 2, c); R(5, H + 1, 2, 10, c); R(5, H + 1, 2, 1, "#e0525a"); break;
    case "bun": R(-5, H - 1, 10, 3, c); R(-5, H + 2, 1, 2, c); R(4, H + 2, 1, 2, c); R(-2, H - 4, 4, 3, c); R(-2, H - 4, 4, 1, dk); break;
    case "mohawk": R(-5, H, 10, 1, mix(skin, c, 0.5)); R(-1, H - 5, 2, 6, c); break;
    case "pixie": R(-5, H - 1, 10, 3, c); R(-5, H + 2, 5, 2, c); R(4, H + 2, 1, 2, c); R(-5, H + 4, 2, 1, c); break;
  }
}

function headwearFront(R: R, kind: string, c: string, H: number) {
  if (kind === "cap") { R(-6, H - 2, 12, 4, c); R(-3, H - 1, 6, 2, shade(c, 18)); R(-6, H + 2, 12, 1, shade(c, -32)); R(-1, H - 3, 2, 1, shade(c, -15)); }
  else if (kind === "beanie") { R(-6, H - 3, 12, 6, c); for (let x = -5; x < 6; x += 2) R(x, H - 3, 1, 4, shade(c, -10)); R(-6, H + 1, 12, 2, shade(c, -22)); R(-1, H - 5, 2, 2, "#f2f2f2"); }
  else if (kind === "bucket") { R(-5, H - 2, 10, 4, c); R(-8, H + 2, 16, 1, shade(c, -18)); }
  else if (kind === "durag") { R(-5, H - 1, 10, 4, c); R(-3, H, 2, 1, shade(c, 38)); R(5, H + 3, 1, 7, c); R(6, H + 5, 1, 6, shade(c, -16)); }
  else if (kind === "hijab") { R(-6, H - 2, 12, 4, c); R(-6, H + 2, 2, 9, c); R(4, H + 2, 2, 9, c); R(-5, H + 10, 10, 2, c); R(-4, H - 1, 3, 1, shade(c, 26)); }
}

// lying down (sleeping / hospital beds). footX/y = where the feet end up
export function drawLying(ctx: CanvasRenderingContext2D, lk: Look, footX: number, y: number) {
  ctx.save();
  ctx.translate(footX, y);
  ctx.rotate(-Math.PI / 2);
  drawPerson(ctx, lk, 0, 0, 1, { blink: true });
  ctx.restore();
}

export function drawCat(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, frame: number) {
  const R: R = (a, b, w, h, c) => {
    ctx.fillStyle = c;
    ctx.fillRect(Math.round(x + a), y + b, w, h);
  };
  const dk = shade(color, -40);
  R(-5, -6, 10, 4, color); R(-5, -6, 10, 1, dk);
  R(3, -10, 5, 5, color); R(3, -11, 1, 1, color); R(7, -11, 1, 1, color);
  R(4, -8, 1, 1, "#1b1b1b"); R(6, -8, 1, 1, "#1b1b1b");
  R(-7, -10 + (frame === 1 ? 1 : 0), 1, 5, color); R(-6, -6, 1, 1, color);
  R(-4, -2, 1, 2 - (frame === 1 ? 1 : 0), color); R(-2, -2, 1, 2, color); R(2, -2, 1, 2, color); R(4, -2, 1, 2 - (frame === 2 ? 1 : 0), color);
}

export function personHeight(lk: Look, sit?: boolean, kid?: boolean) {
  const L = sit ? 6 : kid ? 5 : ({ short: 8, average: 10, tall: 12 } as Record<string, number>)[lk.height] ?? 10;
  return 2 + L + (kid ? 8 : 11) + 10;
}

// ---------- 16x16 icons for the inventory + shop ----------
export function drawIcon(canvas: HTMLCanvasElement, kind: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const u = canvas.width / 16;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const R: R = (x, y, w, h, c) => {
    ctx.fillStyle = c;
    ctx.fillRect(x * u, y * u, w * u, h * u);
  };
  switch (kind) {
    case "pass": R(1, 4, 14, 9, "#1d8a6e"); R(1, 5, 14, 2, "#1b1b1b"); R(1, 11, 14, 1, "#f08a24"); R(3, 8, 6, 1, "#ffffff"); R(3, 10, 4, 1, "#bfe8dc"); R(12, 8, 2, 2, "#ffd24a"); break;
    case "meals": R(3, 6, 10, 9, "#c9a46a"); R(3, 6, 10, 1, "#a8854d"); R(5, 3, 2, 3, "#4caf50"); R(8, 2, 2, 4, "#3f9a4a"); R(10, 1, 2, 5, "#e0b36a"); break;
    case "plant": R(5, 10, 6, 5, "#b5643c"); R(4, 9, 8, 1, "#c97a50"); R(7, 3, 2, 7, "#4caf50"); R(4, 5, 3, 2, "#3f9a4a"); R(9, 4, 3, 2, "#3f9a4a"); R(3, 7, 2, 2, "#4caf50"); R(11, 7, 2, 2, "#4caf50"); break;
    case "coffee": R(4, 3, 7, 11, "#222222"); R(5, 9, 5, 4, "#6b3b1e"); R(11, 6, 2, 4, "#444444"); R(5, 4, 2, 1, "#e0443a"); break;
    case "bookshelf": {
      R(2, 1, 12, 14, WOOD);
      const cs = ["#c0504d", "#4f81bd", "#9bbb59", "#e0b730", "#8064a2"];
      for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) R(3 + i * 2, 2 + r * 5, 1, 4, cs[(i + r) % 5]);
      break;
    }
    case "tv": R(1, 3, 14, 9, "#151515"); R(2, 4, 12, 7, "#4aa3df"); R(2, 4, 12, 2, "#7cc4f2"); R(6, 12, 4, 2, "#333333"); break;
    case "console": R(2, 6, 12, 6, "#2a2a2a"); R(4, 8, 3, 1, "#dddddd"); R(5, 7, 1, 3, "#dddddd"); R(10, 8, 1, 1, "#ee4444"); R(12, 9, 1, 1, "#44aaee"); break;
    case "mattress": R(1, 7, 14, 6, "#f1efe8"); R(1, 10, 14, 1, "#d9d5ca"); R(2, 5, 4, 2, "#ffffff"); R(1, 13, 14, 1, "#b9b4a8"); break;
    case "poster": R(2, 1, 12, 14, "#1d1d1d"); R(3, 2, 10, 12, "#f08a24"); R(3, 8, 10, 6, "#6b4fa0"); R(9, 4, 3, 3, "#ffd24a"); R(4, 10, 2, 4, "#1d1d1d"); R(7, 9, 2, 5, "#1d1d1d"); break;
    case "lamp": R(4, 2, 8, 5, "#f2d9a0"); R(7, 7, 2, 7, "#555555"); R(5, 14, 6, 1, "#333333"); break;
    case "airfryer": R(3, 4, 10, 10, "#2a2a2a"); R(5, 6, 6, 3, "#7a6a5a"); R(11, 11, 1, 1, "#e0443a"); R(4, 14, 8, 1, "#111111"); break;
    case "speaker": R(4, 2, 8, 12, "#333333"); R(6, 4, 4, 4, "#111111"); R(6, 9, 4, 4, "#111111"); R(7, 5, 2, 2, "#666666"); break;
    case "headphones": R(3, 3, 10, 2, "#222222"); R(2, 4, 2, 3, "#222222"); R(12, 4, 2, 3, "#222222"); R(1, 7, 4, 6, "#2b2b2b"); R(11, 7, 4, 6, "#2b2b2b"); break;
    case "phone": R(5, 1, 7, 14, "#1d1f24"); R(6, 2, 5, 11, "#6cb8ff"); R(6, 2, 5, 3, "#b07ad9"); R(8, 13, 1, 1, "#555555"); break;
    case "puffer":
    case "blazer":
    case "jersey": {
      const c = ({ puffer: "#1d1f24", blazer: "#3a3f46", jersey: "#2d4a7a" } as Record<string, string>)[kind];
      R(3, 3, 10, 11, c); R(1, 3, 3, 6, c); R(12, 3, 3, 6, c); R(6, 3, 4, 1, shade(c, -30));
      if (kind === "puffer") { R(3, 6, 10, 1, "#3a3d44"); R(3, 9, 10, 1, "#3a3d44"); R(3, 12, 10, 1, "#3a3d44"); }
      if (kind === "blazer") { R(6, 3, 4, 11, "#ece8df"); R(6, 3, 1, 5, "#22262b"); R(9, 3, 1, 5, "#22262b"); }
      if (kind === "jersey") { R(6, 6, 1, 5, "#ffffff"); R(8, 6, 3, 1, "#ffffff"); R(10, 7, 1, 4, "#ffffff"); }
      break;
    }
    case "sneakers": R(2, 8, 9, 4, "#f1f1f1"); R(8, 6, 3, 3, "#f1f1f1"); R(2, 11, 12, 2, "#ffffff"); R(3, 9, 4, 1, "#cccccc"); R(2, 13, 12, 1, "#999999"); break;
    case "cargos": R(4, 2, 8, 3, "#3a3f46"); R(4, 5, 3, 10, "#3a3f46"); R(9, 5, 3, 10, "#3a3f46"); R(4, 8, 2, 3, "#22262b"); R(10, 8, 2, 3, "#22262b"); break;
    case "bucket": R(4, 5, 8, 5, "#e0b730"); R(1, 10, 14, 2, "#c29a1a"); break;
    case "shades": R(1, 6, 6, 4, "#111111"); R(9, 6, 6, 4, "#111111"); R(7, 7, 2, 1, "#111111"); R(2, 7, 1, 1, "#6a7a8a"); R(10, 7, 1, 1, "#6a7a8a"); break;
    case "chain": R(3, 4, 1, 5, "#f2c94c"); R(12, 4, 1, 5, "#f2c94c"); R(4, 9, 1, 2, "#f2c94c"); R(11, 9, 1, 2, "#f2c94c"); R(5, 11, 6, 1, "#f2c94c"); R(7, 12, 2, 2, "#f2c94c"); break;
    case "tote": R(4, 6, 8, 8, "#ece6d8"); R(5, 2, 1, 4, "#bdb3a0"); R(10, 2, 1, 4, "#bdb3a0"); R(5, 2, 6, 1, "#bdb3a0"); R(6, 9, 4, 2, "#2d4a7a"); break;
  }
}

export function drawHouseIcon(canvas: HTMLCanvasElement, tier: Tier) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const u = canvas.width / 16;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const R: R = (x, y, w, h, c) => {
    ctx.fillStyle = c;
    ctx.fillRect(x * u, y * u, w * u, h * u);
  };
  const floors = { share: 2, "1br": 3, "2br": 4, "3br": 5 }[tier];
  R(3, 15 - floors * 3, 10, floors * 3, "#8b4c3b");
  R(2, 15 - floors * 3, 12, 1, "#5a3027");
  for (let f = 0; f < floors; f++) {
    R(5, 16 - floors * 3 + f * 3, 2, 2, "#f6d06b");
    R(9, 16 - floors * 3 + f * 3, 2, 2, f % 2 ? "#9fc6e8" : "#f6d06b");
  }
}
