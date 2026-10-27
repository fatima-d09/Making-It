import type { Tier } from "../game/types";

// apartment layouts. items get drawn in order, "spot" marks where you walk to
export interface Room {
  x: number;
  w: number;
  name: string;
  wall: string;
  floor: "wood" | "tile" | "tile2";
}
export interface LayoutItem {
  t: string;
  x: number;
  w?: number;
  c?: string;
  spot?: string;
  need?: string; // only shows up if you own this item
  base?: number;
  stove?: number;
  share?: boolean; // desk in a shared room (tv sits on it)
  other?: boolean; // someone else's desk
}
export interface HomeLayout {
  width: number;
  rooms: Room[];
  items: LayoutItem[];
  zones: { mate?: [number, number]; cat?: [number, number]; kid?: [number, number] };
}

const ONE_BR_BASE: LayoutItem[] = [
  { t: "window", x: 76, w: 22 },
  { t: "bed", x: 4, w: 44, c: "#3f6fb0", spot: "bed" },
  { t: "radiator", x: 50 },
  { t: "desk", x: 66, w: 36, spot: "desk" },
  { t: "toilet", x: 118, spot: "bath" },
  { t: "sink", x: 150 },
  { t: "window", x: 196, w: 26 },
  { t: "rug", x: 176, w: 74, c: "#b0413e" },
  { t: "couch", x: 178, w: 52, c: "#4f7a9a", spot: "couch" },
  { t: "plant", x: 236, need: "plant" },
  { t: "tv", x: 254, spot: "tv" },
  { t: "bookshelf", x: 298, need: "bookshelf", spot: "bookshelf" },
  { t: "fridge", x: 324, spot: "fridge" },
  { t: "counter", x: 344, w: 52, stove: 352, spot: "stove" },
  { t: "coffee", x: 386, need: "coffee", spot: "coffee" },
  { t: "door", x: 406, spot: "door" },
];

export const HOME_LAYOUTS: Record<Tier, HomeLayout> = {
  share: {
    width: 330,
    rooms: [
      { x: 0, w: 110, name: "Your room", wall: "#6f8fc0", floor: "wood" },
      { x: 110, w: 150, name: "Kitchen", wall: "#d8c07a", floor: "tile" },
      { x: 260, w: 70, name: "Bath", wall: "#8ccfc3", floor: "tile2" },
    ],
    items: [
      { t: "window", x: 20, w: 22 },
      { t: "plant", x: 27, base: 121, need: "plant" },
      { t: "bed", x: 4, w: 44, c: "#c0504d", spot: "bed" },
      { t: "bookshelf", x: 50, need: "bookshelf", spot: "bookshelf" },
      { t: "desk", x: 68, w: 36, spot: "desk", share: true },
      { t: "fridge", x: 114, spot: "fridge" },
      { t: "counter", x: 134, w: 50, stove: 140, spot: "stove" },
      { t: "coffee", x: 174, need: "coffee", spot: "coffee" },
      { t: "window", x: 196, w: 20 },
      { t: "table", x: 192, w: 30, spot: "table" },
      { t: "door", x: 238, spot: "door" },
      { t: "radiator", x: 264 },
      { t: "toilet", x: 284, spot: "bath" },
      { t: "sink", x: 308 },
    ],
    zones: { mate: [140, 228] },
  },
  "1br": {
    width: 430,
    rooms: [
      { x: 0, w: 110, name: "Bedroom", wall: "#7c6aa8", floor: "wood" },
      { x: 110, w: 60, name: "Bath", wall: "#8ccfc3", floor: "tile2" },
      { x: 170, w: 150, name: "Living room", wall: "#c9a46c", floor: "wood" },
      { x: 320, w: 110, name: "Kitchen", wall: "#9cc48a", floor: "tile" },
    ],
    items: ONE_BR_BASE,
    zones: { mate: [180, 410], cat: [180, 316] },
  },
  "2br": {
    width: 520,
    rooms: [
      { x: 0, w: 110, name: "Bedroom", wall: "#7c6aa8", floor: "wood" },
      { x: 110, w: 60, name: "Bath", wall: "#8ccfc3", floor: "tile2" },
      { x: 170, w: 150, name: "Living room", wall: "#c9a46c", floor: "wood" },
      { x: 320, w: 110, name: "Kitchen", wall: "#9cc48a", floor: "tile" },
      { x: 430, w: 90, name: "2nd bedroom", wall: "#d98c6a", floor: "wood" },
    ],
    items: [
      ...ONE_BR_BASE.map((it) => (it.t === "rug" ? { ...it, c: "#2f6b4f" } : it.t === "couch" ? { ...it, c: "#9a5a4f" } : it)),
      { t: "window", x: 470, w: 22 },
      { t: "desk", x: 444, w: 36, other: true },
      { t: "radiator", x: 494 },
    ],
    zones: { mate: [180, 500] },
  },
  "3br": {
    width: 660,
    rooms: [
      { x: 0, w: 120, name: "Bedroom", wall: "#7c6aa8", floor: "wood" },
      { x: 120, w: 60, name: "Bath", wall: "#8ccfc3", floor: "tile2" },
      { x: 180, w: 170, name: "Living room", wall: "#c9a46c", floor: "wood" },
      { x: 350, w: 120, name: "Kitchen", wall: "#9cc48a", floor: "tile" },
      { x: 470, w: 100, name: "Kid's room", wall: "#f0b4c8", floor: "wood" },
      { x: 570, w: 90, name: "Bath 2", wall: "#a9c7ef", floor: "tile2" },
    ],
    items: [
      { t: "window", x: 84, w: 22 },
      { t: "bed", x: 4, w: 54, c: "#3f6fb0", spot: "bed" },
      { t: "radiator", x: 60 },
      { t: "desk", x: 76, w: 36, spot: "desk" },
      { t: "toilet", x: 128, spot: "bath" },
      { t: "sink", x: 158 },
      { t: "window", x: 214, w: 26 },
      { t: "rug", x: 186, w: 84, c: "#3d5f8f" },
      { t: "couch", x: 188, w: 58, c: "#6b8f4f", spot: "couch" },
      { t: "plant", x: 252, need: "plant" },
      { t: "tv", x: 268, spot: "tv" },
      { t: "bookshelf", x: 326, need: "bookshelf", spot: "bookshelf" },
      { t: "fridge", x: 354, spot: "fridge" },
      { t: "counter", x: 374, w: 52, stove: 382, spot: "stove" },
      { t: "coffee", x: 416, need: "coffee", spot: "coffee" },
      { t: "door", x: 448, spot: "door" },
      { t: "window", x: 530, w: 20 },
      { t: "kidbed", x: 478, w: 32, spot: "kidbed" },
      { t: "toys", x: 516 },
      { t: "tub", x: 580 },
      { t: "sink", x: 630 },
    ],
    zones: { mate: [190, 460], kid: [478, 562] },
  },
};

// fixed walk-to spots for every non-home scene
export const STATIC_SPOTS: Record<string, Record<string, number>> = {
  shops: { entrance: 14, home: 72, tech: 205, clothes: 336, checkout: 420 },
  store: { entrance: 14, produce: 56, shelves: 120, aisle: 176, checkout: 234 },
  out: { entrance: 16, deli: 62, restaurant: 150, office: 240, bar: 316, park: 420 },
  station: { stairs: 16, turnstile: 66, platform: 186, door: 208 },
  street: { curb: 122 },
  retail: { entrance: 14, w1: 34, w2: 104, w3: 172, register: 238 },
  office: { entrance: 14, desk: 70, w2: 118, w3: 270 },
  restaurant: { entrance: 14, w1: 44, w2: 114, w3: 184, kitchen: 262 },
  hospital: { entrance: 14, w1: 84, w2: 164, w3: 244 },
};

export function itemWidth(it: LayoutItem): number {
  if (it.w) return it.w;
  const widths: Record<string, number> = { fridge: 18, coffee: 7, door: 16, toilet: 10, bookshelf: 16, plant: 8, tv: 30, sink: 10, radiator: 12, tub: 30, toys: 14 };
  return widths[it.t] ?? 16;
}
