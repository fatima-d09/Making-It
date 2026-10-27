import { getMood, moodColor } from "../../game/sim";
import type { MoodEntry } from "../../game/types";
import { useGame } from "../../store/gameStore";
import Modal from "./Modal";

type Row = MoodEntry & { live?: boolean };
const NEED_KEYS = ["energy", "hunger", "fun", "social"] as const;

// a bar per day, built as plain SVG in JSX
export default function MoodModal() {
  const g = useGame((s) => s.game);
  if (!g) return null;

  const today: Row = { day: g.day, mood: getMood(g), energy: Math.round(g.needs.energy), hunger: Math.round(g.needs.hunger), fun: Math.round(g.needs.fun), social: Math.round(g.needs.social), live: true };
  const rows: Row[] = [...g.moodLog.slice(-27), today];
  const W = 560, H = 210, left = 30, bottom = 180, top = 14;
  const slot = (W - left - 10) / Math.max(rows.length, 7);
  const bw = Math.max(6, Math.floor(slot * 0.7));
  const y = (v: number) => bottom - (v / 100) * (bottom - top);

  const done = g.moodLog;
  let stats = null;
  if (done.length) {
    const avg = Math.round(done.reduce((s, r) => s + r.mood, 0) / done.length);
    const best = done.reduce((a, b) => (b.mood > a.mood ? b : a));
    const worst = done.reduce((a, b) => (b.mood < a.mood ? b : a));
    const last7 = done.slice(-7);
    const weakest = NEED_KEYS.map((k) => [k, last7.reduce((s, r) => s + r[k], 0) / last7.length] as const).sort((a, b) => a[1] - b[1])[0];
    stats = (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2">
        <Stat label="Average" value={String(avg)} />
        <Stat label="Best day" value={"Day " + best.day} sub={"mood " + best.mood} />
        <Stat label="Worst day" value={"Day " + worst.day} sub={"mood " + worst.mood} />
        <Stat label="Weakest need" value={weakest[0][0].toUpperCase() + weakest[0].slice(1)} sub={"avg " + Math.round(weakest[1]) + " this week"} />
      </div>
    );
  }

  return (
    <Modal title="Mood tracker" wide dismissable buttons={[{ label: "Close", primary: true }]}>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Mood by day" className="block h-auto w-full min-w-[480px]">
          {[0, 25, 50, 75, 100].map((v) => (
            <g key={v}>
              <line x1={left} x2={W - 6} y1={y(v)} y2={y(v)} stroke="#3a414e" strokeWidth={1} strokeDasharray={v ? "3 3" : undefined} />
              <text x={left - 6} y={y(v) + 4} fill="#a9b1bd" fontSize={11} textAnchor="end" fontFamily="VT323, monospace">{v}</text>
            </g>
          ))}
          {rows.map((r, i) => {
            const x = left + 6 + i * slot;
            const h = Math.max(2, (r.mood / 100) * (bottom - top));
            const c = moodColor(r.mood);
            const showLabel = rows.length <= 14 || i % 2 === 0 || r.live;
            return (
              <g key={r.day + (r.live ? "now" : "")}>
                <rect x={x} y={bottom - h} width={bw} height={h} fill={c} opacity={r.live ? 0.55 : 1} stroke={r.live ? c : undefined} strokeWidth={r.live ? 2 : undefined}>
                  <title>{`Day ${r.day}${r.live ? " (today, so far)" : ""}: mood ${r.mood} · energy ${r.energy} · hunger ${r.hunger} · fun ${r.fun} · social ${r.social}`}</title>
                </rect>
                {showLabel && (
                  <text x={x + bw / 2} y={bottom + 16} fill={r.live ? "#ffd24a" : "#a9b1bd"} fontSize={12} textAnchor="middle" fontFamily="VT323, monospace">
                    {r.live ? "now" : r.day}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      {stats ?? <p className="m-0 text-muted">Your mood gets saved every night when you sleep. Come back after day one.</p>}
      <p className="m-0 text-[12.5px] text-muted">Each bar is your mood at bedtime. Hover a bar to see energy, hunger, fun and social for that day.</p>
    </Modal>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bevel bg-slot px-2.5 py-2">
      <div className="font-display text-xs uppercase tracking-wider text-muted">{label}</div>
      <div className="font-mono text-[26px] leading-none">{value}</div>
      {sub && <div className="text-xs text-muted">{sub}</div>}
    </div>
  );
}
