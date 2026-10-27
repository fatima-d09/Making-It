// shared types for the whole game

export type NeedKey = "energy" | "hunger" | "fun" | "social" | "bladder";
export type Needs = Record<NeedKey, number>;

export type PlaceKey = "home" | "work" | "store" | "out" | "shops";
export type WorkScene = "retail" | "office" | "restaurant" | "hospital";
export type SceneId = "home" | "store" | "out" | "street" | "station" | "shops" | WorkScene;
export type Uniform = "retail" | "server" | "scrubs" | "lanyard" | "headset";
export type TraitKey = "social" | "frugal" | "foodie" | "homebody";
export type ShopCat = "home" | "tech" | "clothes";
export type TravelMode = "subway" | "swyft" | "walk";

export interface Look {
  body: string;
  height: string;
  skin: number;
  eyeShape: string;
  eyeColor: number;
  brows: string;
  facialHair: string;
  hairStyle: string;
  hairColor: number;
  top: string;
  topColor: number;
  bottom: string;
  bottomColor: number;
  shoes: string;
  shoeColor: number;
  headwear: string;
  headColor: number;
  eyewear: string;
  ears: string;
  neck: string;
  bag: string;
  accColor: number;
}
export type LookKey = keyof Look;

export type Pay =
  | { type: "hourly"; rate: number }
  | { type: "tipped"; rate: number }
  | { type: "salary"; annual: number }
  | { type: "gig" }
  | { type: "none" };

export interface Job {
  key?: string;
  title: string;
  tag: string;
  place: string;
  x: number;
  y: number;
  scene?: WorkScene;
  uniform?: Uniform;
  remote?: boolean;
  pay: Pay;
  days: number[]; // 0 = Monday
  start: number; // hour the shift starts
  hours: number;
  stability: number; // 0..1, how often your day goes as planned
  physical: number; // energy drain multiplier at work
  perk?: "discount" | "transit" | "meal";
  perkText?: string;
  endsDay?: number;
}

export interface StarterJob extends Job {
  housing: string;
  cash: number;
  meals: number;
  perkText: string;
}

export type MateRole = "roommate" | "partner" | "kid" | "cat";
export interface Mate {
  name: string;
  role: MateRole;
}

export type Tier = "share" | "1br" | "2br" | "3br";
export interface Housing {
  tier: Tier;
  type: string;
  hood: string;
  rent: number;
  x: number; // rough miles from Midtown, +x east
  y: number; // +y north
  sleep: number; // sleep quality multiplier
  mood: number; // mood bonus/penalty
  mates: Mate[];
  full?: boolean; // rent is the whole apartment (split it with a partner)
  listing?: boolean; // shows up when apartment hunting
}

export interface Item {
  cat: ShopCat;
  name: string;
  price: number;
  desc: string;
  wear?: Partial<Look>;
}

export type LogKind = "" | "good" | "bad" | "warn" | "day";
export interface LogEntry {
  day: number;
  time: number;
  text: string;
  kind: LogKind;
}

export interface Invoice {
  amount: number;
  dueDay: number;
  client: string;
  chased: boolean;
}

export interface Gig {
  title: string;
  hours: number;
  pay: number;
}

export interface WeekStats {
  earned: number;
  rent: number;
  food: number;
  transit: number;
  fun: number;
  other: number;
}
export type SpendCat = Exclude<keyof WeekStats, "earned">;

export interface MoodEntry {
  day: number;
  mood: number;
  energy: number;
  hunger: number;
  fun: number;
  social: number;
}

export interface GameState {
  look: Look;
  name: string;
  trait: TraitKey;
  job: Job;
  housing: string;
  mates: Mate[];
  day: number;
  time: number; // minutes since midnight of `day` (can go past 1440 after midnight)
  location: PlaceKey;
  cash: number;
  needs: Needs;
  meals: number;
  items: Record<string, boolean>;
  worn: string[];
  unlimitedUntil: number;
  pendingPay: number;
  invoices: Invoice[];
  gig: Gig | null;
  lookedForGig: number;
  strikes: number;
  worked: Record<number, boolean>;
  cut: Record<number, boolean>;
  longDay: Record<number, boolean>;
  apps: number;
  interview: { day: number; company: string } | null;
  rentDue: number;
  rentLateSince: number | null;
  week: WeekStats;
  moodLog: MoodEntry[];
  log: LogEntry[];
  over: boolean;
  fainted?: boolean;
}

// what the sim can ask the UI to show
export type ModalDesc =
  | { kind: "message"; title: string; text: string }
  | { kind: "offer"; offer: Job; company: string }
  | { kind: "week"; week: WeekStats; weekNo: number }
  | { kind: "gameOver"; title: string; text: string; days: number }
  | { kind: "shop"; cat: ShopCat }
  | { kind: "wardrobe" }
  | { kind: "apartments" }
  | { kind: "mood" }
  | { kind: "go" }
  | { kind: "choose"; labels: string[] }
  | { kind: "confirmNew" };

// side effects the sim collects while it runs (it never touches React directly)
export interface Fx {
  modal(m: ModalDesc): void;
  toast(text: string): void;
}

export type SimFn = (g: GameState, fx: Fx) => void;

export interface TravelOption {
  mode: TravelMode;
  name: string;
  ok: boolean;
  why: string;
  cost: number;
  mins: number;
  surge?: number;
}

export interface SwipeResult {
  screen: string;
  sub: string;
  color: string;
  note: string;
}

export interface TravelPlan {
  dest: PlaceKey;
  mode: TravelMode;
  mins: number;
  cost: number;
  surge?: number;
  event: null | "delay" | "showtime" | "express";
  msg: string;
  swipe?: SwipeResult;
}
