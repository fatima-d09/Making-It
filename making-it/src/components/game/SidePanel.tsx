import clsx from "clsx";
import { CARD_NAME, SUBWAY_FARE } from "../../data/constants";
import { HOUSING, ITEMS } from "../../data/world";
import { TRAITS } from "../../data/options";
import { playAction } from "../../engine/anim";
import { currentActions } from "../../engine/input";
import { buyUnlimited, hasUnlimited, myRent, placeLabel, playerLook, rentOwed, toggleWear, unlimitedPrice } from "../../game/sim";
import type { GameState } from "../../game/types";
import { fmtTime, money, weekday } from "../../game/utils";
import { pushModal, runSim, store, useGame, type Tab } from "../../store/gameStore";
import { PixelIcon, Portrait } from "../PixelArt";
import TravelList from "./TravelList";

const TABS: [Tab, string][] = [
  ["do", "Do"],
  ["go", "Go"],
  ["stuff", "Stuff"],
  ["log", "Log"],
];

export default function SidePanel() {
  const tab = useGame((s) => s.tab);
  return (
    <div className="panel min-h-0 gap-0 p-0">
      <div className="grid flex-none grid-cols-4" role="tablist">
        {TABS.map(([key, label], i) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => store.setState({ tab: key })}
            className={clsx("flex items-center justify-center gap-1.5 border-b-3 px-1 py-2.5 font-display text-[15px] font-semibold", tab === key ? "border-panel bg-panel text-gold" : "border-lo bg-lo text-muted")}
          >
            {label} <kbd className="text-[13px]">{i + 1}</kbd>
          </button>
        ))}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 max-[820px]:max-h-[70vh]">
        {tab === "do" && <DoTab />}
        {tab === "go" && <TravelList />}
        {tab === "stuff" && <StuffTab />}
        {tab === "log" && <LogTab />}
      </div>
    </div>
  );
}

function DoTab() {
  const g = useGame((s) => s.game);
  const busy = useGame((s) => s.busy);
  const near = useGame((s) => s.near);
  useGame((s) => s.caption); // re-render when the scene changes
  if (!g) return null;
  const actions = currentActions();
  return (
    <>
      <h3 className="m-0 font-display text-lg font-bold">At {g.location === "home" ? "home" : placeLabel(g, g.location)}</h3>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(165px,1fr))] gap-1.5">
        {actions.map((a) => (
          <button key={a.label} className={clsx("act", a.main && "main", near.includes(a.label) && "near")} disabled={a.disabled || g.over || busy} onClick={() => playAction(a)}>
            <span className="font-display text-sm font-semibold leading-tight">{a.label}</span>
            <span className={clsx("text-xs", a.disabled ? "text-[#ffb2a6]" : a.main ? "text-[#d9f5cf]" : "text-muted")}>{a.detail}</span>
          </button>
        ))}
      </div>
      <p className="m-0 text-[12.5px] leading-loose text-muted">
        <kbd>←</kbd> <kbd>→</kbd> or <kbd>A</kbd> <kbd>D</kbd> walk · <kbd>E</kbd> use what's next to you · <kbd>G</kbd> go somewhere · <kbd>M</kbd> mood tracker
      </p>
    </>
  );
}

function StuffTab() {
  const g = useGame((s) => s.game);
  const busy = useGame((s) => s.busy);
  if (!g) return null;
  const housing = HOUSING[g.housing];
  const owned = Object.keys(ITEMS).filter((k) => g.items[k]);
  const hasClothes = owned.some((k) => ITEMS[k].wear);
  const days = g.unlimitedUntil - g.day + 1;
  const slots: ({ icon: string; title: string; count?: string; wearable?: boolean; worn?: boolean } | null)[] = [
    { icon: "pass", title: CARD_NAME + (hasUnlimited(g) ? ": unlimited, " + days + " days left" : ": pay per ride, " + money(SUBWAY_FARE)), count: hasUnlimited(g) ? days + "d" : undefined },
    { icon: "meals", title: "Meals at home: " + g.meals, count: String(g.meals) },
    ...owned.map((k) => ({ icon: k, title: ITEMS[k].name, wearable: !!ITEMS[k].wear, worn: g.worn.includes(k) })),
  ];
  while (slots.length < 12 || slots.length % 6) slots.push(null);
  const price = unlimitedPrice(g);

  return (
    <>
      <div className="grid grid-cols-[72px_1fr] items-center gap-3">
        <Portrait look={playerLook(g)} width={72} height={96} scale={2} feetY={90} className="bevel-in h-24 w-[72px]" />
        <div className="min-w-0">
          <div className="font-display text-[22px] font-bold leading-none">{g.name}</div>
          <div className="text-[12.5px] leading-snug text-muted">{g.job.title} · {TRAITS[g.trait].name}</div>
          <div className="text-[12.5px] leading-snug text-muted">{housing.type}, {housing.hood}</div>
        </div>
      </div>

      <h3 className="m-0 font-display text-lg font-bold">Your stuff</h3>
      <div className="grid grid-cols-6 gap-1">
        {slots.map((s, i) =>
          s ? (
            <button
              key={s.icon}
              className={clsx("slot", s.wearable ? "cursor-pointer hover:bg-[#2c323d]" : "cursor-default", s.worn && "bevel-go")}
              title={s.title + (s.wearable ? (s.worn ? " · click to take off" : " · click to wear") : "")}
              onClick={() => s.wearable && runSim((d) => toggleWear(d, s.icon))}
            >
              <PixelIcon kind={s.icon} className="h-3/4 w-3/4" />
              {s.count && <span className="absolute -bottom-0.5 right-0.5 font-mono text-[17px] text-white [text-shadow:2px_2px_0_#000]">{s.count}</span>}
            </button>
          ) : (
            <div key={"empty" + i} className="slot" />
          ),
        )}
      </div>
      <p className="m-0 text-[12.5px] text-muted">
        {g.worn.length
          ? "Wearing: " + g.worn.map((k) => ITEMS[k].name.toLowerCase()).join(", ") + ". Click a clothing slot to take it off or put it back on."
          : "Buy clothes, furniture and tech at Fulton Mall. Click clothes here to put them on or take them off."}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {hasClothes && <button className="btn" onClick={() => pushModal({ kind: "wardrobe" })}>Change outfit</button>}
        <button className="btn" disabled={hasUnlimited(g) || g.cash < price || g.over || busy} onClick={() => runSim(buyUnlimited)}>
          {hasUnlimited(g) ? "Unlimited " + CARD_NAME + " active" : "Buy 30-day unlimited · " + money(price)}
        </button>
      </div>

      <h3 className="m-0 font-display text-lg font-bold">Bills</h3>
      <Bills g={g} />
    </>
  );
}

function Bills({ g }: { g: GameState }) {
  const rows: [string, string, string?][] = [];
  const rent = myRent(g);
  const daysToRent = g.rentDue - g.day;
  if (g.rentLateSince != null) rows.push(["Rent", money(rentOwed(g)) + " LATE · " + (7 - (g.day - g.rentLateSince)) + "d left", "bad"]);
  else rows.push(["Rent " + money(rent), daysToRent <= 0 ? "Due today" : "Due in " + daysToRent + " days", daysToRent <= 5 && g.cash < rent ? "bad" : ""]);
  const p = g.job.pay.type;
  if (p === "salary" || p === "hourly" || p === "tipped") {
    const toFri = (4 - weekday(g.day) + 7) % 7;
    rows.push(["Next payday", toFri === 0 ? "Today" : "Fri (" + toFri + "d)"]);
  }
  if (g.pendingPay > 0) rows.push(["Earned, not paid yet", money(g.pendingPay) + " gross"]);
  if (g.invoices.length) rows.push(["Unpaid invoices", g.invoices.length + " · " + money(g.invoices.reduce((s, i) => s + i.amount, 0))]);
  if (g.job.endsDay) rows.push(["Internship ends", "In " + (g.job.endsDay - g.day) + " days", g.job.endsDay - g.day < 14 ? "bad" : ""]);
  if (g.apps) rows.push(["Applications out", String(g.apps)]);
  if (g.interview) rows.push(["Interview", "Day " + g.interview.day, "good"]);
  if (g.strikes) rows.push(["Missed shifts", g.strikes + " of 3", "bad"]);
  return (
    <dl className="m-0 grid grid-cols-[1fr_auto] gap-x-2.5 gap-y-1.5 text-[13px]">
      {rows.map(([k, v, tone]) => (
        <div key={k} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className={clsx("m-0 text-right", tone === "bad" && "font-bold text-bad", tone === "good" && "text-grass")}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function LogTab() {
  const log = useGame((s) => s.game?.log ?? []);
  return (
    <ul className="m-0 flex list-none flex-col p-0">
      {log.slice(0, 90).map((e, i) =>
        e.kind === "day" ? (
          <li key={i} className="pt-1 font-display text-[15px] font-bold text-gold">{e.text}</li>
        ) : (
          <li key={i} className="grid grid-cols-[58px_1fr] gap-2 border-b-2 border-[#232831] py-1.5 text-[13px]">
            <span className="font-mono text-base leading-tight text-muted">{fmtTime(e.time)}</span>
            <span className={clsx(e.kind === "good" && "text-[#9be786]", e.kind === "bad" && "text-[#ff9a8a]", e.kind === "warn" && "text-[#ffd47a]")}>{e.text}</span>
          </li>
        ),
      )}
    </ul>
  );
}
