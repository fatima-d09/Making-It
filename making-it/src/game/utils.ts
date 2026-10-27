import { OPTIONS } from "../data/options";
import type { Look, LookKey } from "./types";

export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export const randInt = (a: number, b: number) => Math.floor(rand(a, b + 1));
export const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
export const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
export const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
export const moneyRound = (n: number) => money(n).replace(/\.\d\d$/, "");
export const weekday = (day: number) => (day - 1) % 7;
export const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);
export const isNight = (mins: number) => { const h = (mins / 60) % 24; return h < 6 || h >= 19.5; };
export const easeIn = (k: number) => k * k * k;

export function fmtTime(mins: number): string {
  const m = Math.floor(mins) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return (h % 12 === 0 ? 12 : h % 12) + ":" + String(mm).padStart(2, "0") + " " + (h >= 12 ? "PM" : "AM");
}

export function fmtDuration(mins: number): string {
  mins = Math.round(mins);
  if (mins < 60) return mins + "m";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? h + "h " + m + "m" : h + "h";
}

// seeded random so npcs look the same every time
export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
export function srand(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// color helpers for shading pixel art
function hexToRgb(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("");
}
export function shade(h: string, amt: number): string {
  const c = hexToRgb(h);
  return rgbToHex(c[0] + amt, c[1] + amt, c[2] + amt);
}
export function mix(a: string, b: string, t: number): string {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return rgbToHex(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t);
}

const OPTIONAL_EXTRAS: LookKey[] = ["headwear", "eyewear", "ears", "neck", "bag", "facialHair"];

export function randomLook(rng: () => number = Math.random): Look {
  const out: Record<string, string | number> = {};
  for (const key of Object.keys(OPTIONS) as LookKey[]) {
    const o = OPTIONS[key];
    if (o.colors) {
      out[key] = Math.floor(rng() * o.colors.length);
      continue;
    }
    const keys = Object.keys(o.values ?? {});
    // extras are "none" a lot of the time, otherwise everyone looks like a christmas tree
    if (OPTIONAL_EXTRAS.includes(key) && rng() < 0.55) out[key] = "none";
    else out[key] = keys[Math.floor(rng() * keys.length)];
  }
  return out as unknown as Look;
}

export const lookFromSeed = (seed: string) => randomLook(srand(hashStr(seed)));
