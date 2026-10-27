import type { Housing, Item, Job, ShopCat, StarterJob, WorkScene } from "../game/types";

// where you live. x/y are rough miles from Midtown. tier picks the apartment layout
export const HOUSING: Record<string, Housing> = {
  bushwick_share: { tier: "share", type: "Room in a 4-person share", hood: "Bushwick", rent: 1050, x: 4.5, y: -4, sleep: 0.85, mood: -4, mates: [{ name: "Dev", role: "roommate" }] },
  ridgewood_share: { tier: "share", type: "Room with 1 roommate", hood: "Ridgewood", rent: 1350, x: 6, y: -3.4, sleep: 0.92, mood: -2, mates: [{ name: "Kayla", role: "roommate" }] },
  heights_share: { tier: "share", type: "Room in a 3-person share", hood: "Washington Heights", rent: 1200, x: -1, y: 6.5, sleep: 0.9, mood: -3, mates: [{ name: "Luis", role: "roommate" }] },
  astoria_share: { tier: "share", type: "Room with 1 roommate", hood: "Astoria", rent: 1400, x: 3, y: 1.6, sleep: 0.92, mood: -2, mates: [{ name: "Nikos", role: "roommate" }] },
  crown_1br: { tier: "1br", type: "1 bedroom", hood: "Crown Heights", rent: 2050, x: 3.5, y: -6, sleep: 1.0, mood: 2, mates: [{ name: "Biscuit", role: "cat" }] },
  hospital_1br: { tier: "1br", type: "1 bedroom", hood: "Kips Bay", rent: 1600, x: 1.1, y: -1.4, sleep: 1.0, mood: 1, mates: [] },
  bronx_2br: { tier: "2br", type: "2 bedroom", hood: "Kingsbridge, Bronx", rent: 1450, x: 0.5, y: 9, sleep: 1.05, mood: 4, mates: [{ name: "Sam", role: "partner" }] },
  bayridge_3br: { tier: "3br", type: "3 bed / 2 bath", hood: "Bay Ridge", rent: 2300, x: -1, y: -10, sleep: 1.12, mood: 8, mates: [{ name: "Alex", role: "partner" }, { name: "Mia", role: "kid" }] },
  // places you can move into later
  bedstuy_share: { tier: "share", type: "Room with 1 roommate", hood: "Bed-Stuy", rent: 1300, x: 3.5, y: -4.8, sleep: 0.92, mood: -1, listing: true, mates: [{ name: "Tasha", role: "roommate" }] },
  astoria_1br: { tier: "1br", type: "1 bedroom", hood: "Astoria", rent: 2350, x: 3, y: 1.6, sleep: 1.0, mood: 3, full: true, listing: true, mates: [] },
  ues_1br: { tier: "1br", type: "1 bedroom, elevator", hood: "Upper East Side", rent: 2900, x: 1, y: 2.5, sleep: 1.03, mood: 4, full: true, listing: true, mates: [] },
  lic_2br: { tier: "2br", type: "2 bedroom, doorman", hood: "Long Island City", rent: 3700, x: 2, y: 0.6, sleep: 1.08, mood: 6, full: true, listing: true, mates: [] },
  slope_3br: { tier: "3br", type: "3 bed / 2 bath", hood: "Park Slope", rent: 5200, x: 1.5, y: -6, sleep: 1.15, mood: 10, full: true, listing: true, mates: [] },
};

export const JOBS: Record<string, StarterJob> = {
  retail_ft: {
    title: "Retail associate", tag: "Retail · full-time", place: "Herald Square", x: -0.3, y: -0.3, scene: "retail", uniform: "retail",
    pay: { type: "hourly", rate: 17.5 }, days: [0, 1, 3, 4, 5], start: 10, hours: 8, stability: 0.95, physical: 1.4,
    housing: "ridgewood_share", cash: 1700, meals: 6, perk: "discount", perkText: "10% employee discount on groceries.",
  },
  retail_pt: {
    title: "Retail associate", tag: "Retail · part-time", place: "Herald Square", x: -0.3, y: -0.3, scene: "retail", uniform: "retail",
    pay: { type: "hourly", rate: 17.5 }, days: [2, 3, 4, 5], start: 12, hours: 6, stability: 0.78, physical: 1.4,
    housing: "bushwick_share", cash: 950, meals: 5, perk: "discount", perkText: "Shifts get cut a lot. Hard mode.",
  },
  intern: {
    title: "Marketing intern", tag: "Recent grad", place: "Flatiron", x: 0, y: -1, scene: "office", uniform: "lanyard",
    pay: { type: "hourly", rate: 20 }, days: [0, 1, 2, 3, 4], start: 10, hours: 6, stability: 0.9, physical: 0.9,
    housing: "heights_share", cash: 1400, meals: 4, endsDay: 57, perkText: "Internship ends after 8 weeks. Land a full-time offer first.",
  },
  gov: {
    title: "City agency analyst", tag: "City government", place: "Civic Center", x: -0.4, y: -3.6, scene: "office", uniform: "lanyard",
    pay: { type: "salary", annual: 62000 }, days: [0, 1, 2, 3, 4], start: 9, hours: 7, stability: 1.0, physical: 1.0,
    housing: "bronx_2br", cash: 3200, meals: 8, perk: "transit", perkText: "Pre-tax commuter benefit: the unlimited card costs $92.",
  },
  freelancer: {
    title: "Freelance designer", tag: "Freelancer", place: "Home", x: 0, y: 0, remote: true,
    pay: { type: "gig" }, days: [], start: 0, hours: 0, stability: 0.55, physical: 0.8,
    housing: "crown_1br", cash: 4200, meals: 6, perkText: "Pick your gigs. Clients pay when they feel like it.",
  },
  server: {
    title: "Server", tag: "Restaurant", place: "West Village", x: -1, y: -2.6, scene: "restaurant", uniform: "server",
    pay: { type: "tipped", rate: 10.65 }, days: [2, 3, 4, 5, 6], start: 16, hours: 7, stability: 0.85, physical: 1.6,
    housing: "astoria_share", cash: 1100, meals: 3, perk: "meal", perkText: "Staff meal every shift. Tips come home in cash.",
  },
  doctor: {
    title: "Resident physician", tag: "Medicine · PGY-1", place: "East Side hospital", x: 1, y: -1, scene: "hospital", uniform: "scrubs",
    pay: { type: "salary", annual: 78000 }, days: [0, 1, 2, 3, 4, 5], start: 6, hours: 12, stability: 1.0, physical: 1.75,
    housing: "hospital_1br", cash: 2400, meals: 3, perk: "meal", perkText: "Six 12-hour days a week, in scrubs. Cafeteria feeds you on shift.",
  },
  remote_cs: {
    title: "Customer success manager", tag: "Remote", place: "Home", x: 0, y: 0, remote: true, uniform: "headset",
    pay: { type: "salary", annual: 68000 }, days: [0, 1, 2, 3, 4], start: 9, hours: 8, stability: 0.92, physical: 0.7,
    housing: "bayridge_3br", cash: 5200, meals: 10, perkText: "No commute. No coworkers either, so loneliness builds faster.",
  },
};

// jobs you can get offered after an interview
export const OFFERS: Job[] = [
  { title: "Junior data analyst", tag: "Full-time", place: "Midtown", x: 0, y: 0.4, scene: "office", uniform: "lanyard", pay: { type: "salary", annual: 70000 }, days: [0, 1, 2, 3, 4], start: 9, hours: 8, stability: 0.97, physical: 0.9 },
  { title: "Operations coordinator", tag: "Full-time", place: "Long Island City", x: 2, y: 0.8, scene: "office", uniform: "lanyard", pay: { type: "salary", annual: 58000 }, days: [0, 1, 2, 3, 4], start: 9, hours: 8, stability: 0.95, physical: 1.0 },
  { title: "Assistant store manager", tag: "Full-time", place: "Union Square", x: 0, y: -1.6, scene: "retail", uniform: "retail", pay: { type: "salary", annual: 54000 }, days: [0, 1, 3, 4, 5], start: 9, hours: 9, stability: 0.93, physical: 1.3, perk: "discount" },
  { title: "Restaurant manager", tag: "Full-time", place: "Chelsea", x: -0.8, y: -1.2, scene: "restaurant", uniform: "lanyard", pay: { type: "salary", annual: 72000 }, days: [1, 2, 3, 4, 5], start: 11, hours: 9, stability: 0.94, physical: 1.3 },
  { title: "Project manager, city agency", tag: "City government", place: "Civic Center", x: -0.4, y: -3.6, scene: "office", uniform: "lanyard", pay: { type: "salary", annual: 84000 }, days: [0, 1, 2, 3, 4], start: 9, hours: 7, stability: 1.0, physical: 1.0, perk: "transit" },
  { title: "Senior customer success manager", tag: "Remote", place: "Home", x: 0, y: 0, remote: true, uniform: "headset", pay: { type: "salary", annual: 92000 }, days: [0, 1, 2, 3, 4], start: 9, hours: 8, stability: 0.93, physical: 0.7 },
  { title: "Product designer", tag: "Full-time", place: "Flatiron", x: 0, y: -1, scene: "office", uniform: "lanyard", pay: { type: "salary", annual: 98000 }, days: [0, 1, 2, 3, 4], start: 10, hours: 8, stability: 0.92, physical: 0.9 },
  { title: "Account executive", tag: "Sales", place: "Midtown", x: 0, y: 0.4, scene: "office", uniform: "lanyard", pay: { type: "salary", annual: 110000 }, days: [0, 1, 2, 3, 4], start: 8, hours: 9, stability: 0.85, physical: 1.0 },
];

export const UNEMPLOYED: Job = { title: "Unemployed", tag: "Job hunting", place: "Home", x: 0, y: 0, remote: true, pay: { type: "none" }, days: [], start: 0, hours: 0, stability: 0, physical: 1 };

export const COMPANIES = ["a fintech startup", "a logistics company in LIC", "a retail chain's HQ", "a nonprofit", "an ad agency in SoHo"];
export const GIGS = ["Logo for a Bed-Stuy coffee shop", "Menu redesign for a Thai spot", "Graphics for a gym", "Pitch deck for a startup", "Wedding invites", "Poster for a Bushwick show", "Mockup for a dentist"];
export const STATIONS = ["Jay St", "Atlantic Av", "Queensboro Plaza", "59 St", "Broadway Junction", "Court Sq", "125 St", "Canal St"];

export const ITEMS: Record<string, Item> = {
  // home goods
  plant: { cat: "home", name: "Pothos plant", price: 28, desc: "Mood +3 every day. Very hard to kill." },
  poster: { cat: "home", name: "Framed poster", price: 35, desc: "Hangs over your bed. Mood +2." },
  lamp: { cat: "home", name: "Warm lamp", price: 45, desc: "Cozy light at night. Mood +2." },
  coffee: { cat: "home", name: "Coffee maker", price: 65, desc: "Unlocks Make coffee: cheap energy." },
  airfryer: { cat: "home", name: "Air fryer", price: 90, desc: "Cooking takes 25 minutes instead of 45." },
  bookshelf: { cat: "home", name: "Bookshelf + books", price: 140, desc: "Unlocks Read a book. Fun and a little rest." },
  mattress: { cat: "home", name: "Memory foam mattress", price: 480, desc: "You sleep 12% better every night." },
  // electronics
  speaker: { cat: "tech", name: "Bluetooth speaker", price: 80, desc: "Music around the apartment. Mood +2." },
  headphones: { cat: "tech", name: "Noise-canceling headphones", price: 150, desc: "Subway rides are more fun. You wear them, too.", wear: { ears: "headphones" } },
  tv: { cat: "tech", name: "Big TV", price: 340, desc: "Streaming is more fun. In a shared room it goes on your desk." },
  console: { cat: "tech", name: "Game console", price: 450, desc: "Unlocks Play video games. Needs a TV if you live in a share." },
  phone: { cat: "tech", name: "New phone", price: 899, desc: "Apply to jobs from anywhere, and recruiters find you twice as often." },
  // clothes: wearing one changes how you look
  tote: { cat: "clothes", name: "Canvas tote", price: 25, desc: "Every New Yorker owns twelve.", wear: { bag: "tote", accColor: 5 } },
  bucket: { cat: "clothes", name: "Bucket hat", price: 35, desc: "Summer in Queens energy.", wear: { headwear: "bucket", headColor: 6 } },
  shades: { cat: "clothes", name: "Sunglasses", price: 40, desc: "Mysterious on the L train.", wear: { eyewear: "shades" } },
  cargos: { cat: "clothes", name: "Cargo pants", price: 70, desc: "Pockets for days.", wear: { bottom: "cargo", bottomColor: 4 } },
  jersey: { cat: "clothes", name: "Team jersey", price: 90, desc: "Game day ready.", wear: { top: "jersey", topColor: 0 } },
  sneakers: { cat: "clothes", name: "White high-tops", price: 130, desc: "Do not step on them.", wear: { shoes: "hightops", shoeColor: 5 } },
  puffer: { cat: "clothes", name: "Black puffer jacket", price: 160, desc: "The official NYC winter uniform.", wear: { top: "puffer", topColor: 11 } },
  blazer: { cat: "clothes", name: "Interview blazer", price: 190, desc: "Better odds at job interviews while you wear it.", wear: { top: "blazer", topColor: 4 } },
  chain: { cat: "clothes", name: "Gold chain", price: 220, desc: "A little shine.", wear: { neck: "chain" } },
};

export const SHOP_NAMES: Record<ShopCat, string> = { home: "Home goods", tech: "Electronics", clothes: "Clothes" };

export const WORK_ROUTE: Record<WorkScene, string[]> = {
  retail: ["w1", "w2", "w3", "register"],
  office: ["desk", "w2", "w3", "desk"],
  restaurant: ["w1", "w2", "w3", "kitchen"],
  hospital: ["w1", "w2", "w3"],
};
export const WORK_LINES: Record<WorkScene, string[]> = {
  retail: ["Need a size?", "Fitting room 3!", "Folding...", "Next guest!"],
  office: ["Per my last email", "Quick sync?", "Spreadsheets...", "Shipping it"],
  restaurant: ["Specials tonight?", "Table 6 up!", "Behind!", "Order in"],
  hospital: ["Pain 1 to 10?", "Vitals look ok", "Page cardiology"],
};
