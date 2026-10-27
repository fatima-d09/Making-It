import clsx from "clsx";
import { DAY_NAMES } from "../../data/constants";
import { getMood, moodColor, moodWord, placeLabel } from "../../game/sim";
import type { NeedKey } from "../../game/types";
import { fmtTime, money, weekday } from "../../game/utils";
import { pushModal, useGame } from "../../store/gameStore";

const NEEDS: [NeedKey, string][] = [
  ["energy", "Energy"],
  ["hunger", "Hunger"],
  ["fun", "Fun"],
  ["social", "Social"],
  ["bladder", "Bladder"],
];
const STOP_COLORS = { home: "#63c34d", work: "#ff7934", store: "#f2b233", out: "#ff6fb5", shops: "#6cb8ff" };

// the black bar on top: clock, where you are, your needs, mood, money
export default function Hud() {
  const g = useGame((s) => s.game);
  if (!g) return null;
  const mood = getMood(g);
  const recent = [...g.moodLog.slice(-6).map((m) => m.mood), mood];

  return (
    <div className="hud flex-none">
      <div className="[grid-area:clock]">
        <div className="font-display text-[11px] uppercase tracking-widest text-muted">
          {DAY_NAMES[weekday(g.day)]} · Day {g.day}
        </div>
        <div className="whitespace-nowrap font-mono text-[32px] leading-[0.9] text-gold max-[820px]:text-[26px]">{fmtTime(g.time)}</div>
      </div>

      <div className="flex min-w-0 items-center gap-2.5 [grid-area:where]">
        <span className="size-3.5 flex-none" style={{ background: STOP_COLORS[g.location] }} />
        <div className="min-w-0">
          <div className="font-display text-[11px] uppercase tracking-widest text-muted">Now at</div>
          <div className="font-display text-[21px] font-bold leading-tight [overflow-wrap:anywhere]">{placeLabel(g, g.location)}</div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 [grid-area:needs] max-[820px]:gap-2">
        {NEEDS.map(([k, label]) => {
          const v = Math.round(g.needs[k]);
          const color = v > 60 ? "var(--color-grass)" : v > 30 ? "var(--color-warn)" : "var(--color-bad)";
          return (
            <div key={k} className="flex min-w-0 flex-col gap-[3px]">
              <div className="flex items-baseline justify-between font-display text-[12.5px]">
                <span className={clsx(v <= 20 && "text-bad")}>{label}</span>
                <span className="font-mono text-[19px] leading-[0.8]">{v}</span>
              </div>
              <div className="bar">
                <b className="block h-full" style={{ width: v + "%", background: color }} />
              </div>
            </div>
          );
        })}
      </div>

      <button className="bevel grid grid-cols-[auto_auto] items-center gap-x-2.5 bg-slot px-2.5 py-1 text-left hover:bg-slot-hover [grid-area:mood]" onClick={() => pushModal({ kind: "mood" })} title="Open mood tracker (M)">
        <span className="font-display text-[11px] uppercase tracking-widest text-muted">Mood</span>
        <span className="col-start-2 row-span-2 flex h-7 items-end gap-0.5">
          {recent.map((m, i) => (
            <i key={i} className="block w-1.5" style={{ height: Math.max(3, m * 0.28), background: moodColor(m), opacity: i === recent.length - 1 ? 0.6 : 1 }} />
          ))}
        </span>
        <span className="whitespace-nowrap font-display text-base font-bold" style={{ color: moodColor(mood) }}>
          {moodWord(mood)}
        </span>
      </button>

      <div className="text-right [grid-area:cash]">
        <div className="font-display text-[11px] uppercase tracking-widest text-muted">Bank</div>
        <div className={clsx("whitespace-nowrap font-mono text-[32px] leading-[0.9] max-[820px]:text-[26px]", g.cash < 0 ? "text-bad" : "text-grass")}>{money(g.cash)}</div>
      </div>
    </div>
  );
}
