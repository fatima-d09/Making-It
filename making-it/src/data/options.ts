import { CLOTH, EYES, HAIR, SKINS } from "./constants";
import type { Look, LookKey, TraitKey } from "../game/types";

// every customizable thing in the creator. "values" = pick one, "colors" = pick a swatch
export interface OptionDef {
  label: string;
  values?: Record<string, string>;
  colors?: string[];
}

export const OPTIONS: Record<LookKey, OptionDef> = {
  body: { label: "Body type", values: { slim: "Slim", average: "Average", broad: "Broad" } },
  height: { label: "Height", values: { short: "Short", average: "Average", tall: "Tall" } },
  skin: { label: "Skin tone", colors: SKINS },
  eyeShape: { label: "Eyes", values: { round: "Round", wide: "Wide", sleepy: "Sleepy", lashes: "Lashes" } },
  eyeColor: { label: "Eye color", colors: EYES },
  brows: { label: "Brows", values: { soft: "Soft", bold: "Bold", arched: "Arched" } },
  facialHair: { label: "Facial hair", values: { none: "None", stubble: "Stubble", mustache: "Mustache", goatee: "Goatee", beard: "Full beard" } },
  hairStyle: {
    label: "Hairstyle",
    values: { bald: "Bald", buzz: "Buzz cut", short: "Short", fade: "Fade", curls: "Curls", afro: "Afro", twists: "Twists", locs: "Locs", braids: "Braids", long: "Long", bob: "Bob", ponytail: "Ponytail", bun: "Bun", mohawk: "Mohawk", pixie: "Side part" },
  },
  hairColor: { label: "Hair color", colors: HAIR },
  top: { label: "Top", values: { hoodie: "Hoodie", tee: "Tee", buttonup: "Button-up", blazer: "Blazer", sweater: "Sweater", track: "Track jacket", tank: "Tank top", puffer: "Puffer", jersey: "Jersey" } },
  topColor: { label: "Top color", colors: CLOTH },
  bottom: { label: "Bottoms", values: { jeans: "Jeans", slacks: "Slacks", sweats: "Sweatpants", cargo: "Cargos", shorts: "Shorts", skirt: "Skirt" } },
  bottomColor: { label: "Bottoms color", colors: CLOTH },
  shoes: { label: "Shoes", values: { sneakers: "Sneakers", hightops: "High-tops", boots: "Boots", loafers: "Loafers", slides: "Slides" } },
  shoeColor: { label: "Shoe color", colors: CLOTH },
  headwear: { label: "Headwear", values: { none: "None", cap: "Cap", beanie: "Beanie", bucket: "Bucket hat", durag: "Durag", hijab: "Hijab" } },
  headColor: { label: "Headwear color", colors: CLOTH },
  eyewear: { label: "Eyewear", values: { none: "None", glasses: "Glasses", shades: "Sunglasses" } },
  ears: { label: "Ears", values: { none: "None", earrings: "Earrings", headphones: "Headphones" } },
  neck: { label: "Neck", values: { none: "None", chain: "Chain", scarf: "Scarf" } },
  bag: { label: "Bag", values: { none: "None", tote: "Tote", backpack: "Backpack", crossbody: "Crossbody" } },
  accColor: { label: "Scarf & bag color", colors: CLOTH },
};

export const TABS: Record<string, LookKey[]> = {
  Body: ["body", "height", "skin"],
  Face: ["eyeShape", "eyeColor", "brows", "facialHair"],
  Hair: ["hairStyle", "hairColor"],
  Clothes: ["top", "topColor", "bottom", "bottomColor", "shoes", "shoeColor"],
  Extras: ["headwear", "headColor", "eyewear", "ears", "neck", "bag", "accColor"],
};

export const TRAITS: Record<TraitKey, { name: string; desc: string }> = {
  social: { name: "Social butterfly", desc: "Hanging out counts for a lot more, but you get lonely faster." },
  frugal: { name: "Frugal", desc: "Groceries cost 10% less. You also get bored a bit faster." },
  foodie: { name: "Foodie", desc: "Eating out is extra fun. Cooking at home is a little less satisfying." },
  homebody: { name: "Homebody", desc: "Staying in recharges you. You need people less than most." },
};

export const DEFAULT_LOOK: Look = {
  body: "average", height: "average", skin: 3, eyeShape: "round", eyeColor: 0, brows: "soft", facialHair: "none",
  hairStyle: "curls", hairColor: 0, top: "hoodie", topColor: 0, bottom: "jeans", bottomColor: 7, shoes: "sneakers", shoeColor: 5,
  headwear: "none", headColor: 3, eyewear: "none", ears: "none", neck: "none", bag: "none", accColor: 6,
};

// how many different people the creator can make (it's a lot)
export function countCombos(): bigint {
  let n = 1n;
  for (const key of Object.keys(OPTIONS) as LookKey[]) {
    const o = OPTIONS[key];
    n *= BigInt(o.colors ? o.colors.length : Object.keys(o.values ?? {}).length);
  }
  return n;
}
