import { useMemo, useState } from "react";
import { DEFAULT_LOOK, OPTIONS, TABS, TRAITS, countCombos } from "../../data/options";
import { HOUSING, JOBS } from "../../data/world";
import { estWeeklyNet, payLabel } from "../../game/sim";
import type { Look, LookKey, TraitKey } from "../../game/types";
import { money, moneyRound, randomLook } from "../../game/utils";
import { continueGame, loadSave, startGame } from "../../store/gameStore";
import CharacterPreview from "./CharacterPreview";
import JobCard from "./JobCard";

export default function Creator() {
  const [look, setLook] = useState<Look>(DEFAULT_LOOK);
  const [name, setName] = useState("");
  const [trait, setTrait] = useState<TraitKey>("social");
  const [jobKey, setJobKey] = useState("retail_ft");
  const [tab, setTab] = useState("Body");
  const [showUniform, setShowUniform] = useState(false);
  const [nameError, setNameError] = useState(false);
  const saved = useMemo(() => loadSave(), []);
  const combos = useMemo(() => countCombos().toLocaleString("en-US"), []);

  const setOption = (key: LookKey, value: string | number) => setLook((l) => ({ ...l, [key]: value }));

  function start() {
    if (!name.trim()) {
      setNameError(true);
      document.getElementById("name-input")?.focus();
      return;
    }
    startGame(look, name.trim(), trait, jobKey);
  }

  return (
    <section className="grid grid-cols-[300px_minmax(0,1fr)] items-start gap-4 max-[820px]:grid-cols-1">
      <div className="panel sticky top-3.5 items-center text-center max-[820px]:static">
        <CharacterPreview look={look} uniform={showUniform ? JOBS[jobKey].uniform ?? null : null} />
        <div className="font-display text-[26px] font-bold leading-none">{name.trim() || "Your name"}</div>
        <div className="text-[13px] text-muted">
          {TRAITS[trait].name} · {JOBS[jobKey].title}
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          <button className="btn" onClick={() => setLook(randomLook())}>Randomize</button>
          <button className="chip" aria-pressed={showUniform} onClick={() => setShowUniform((v) => !v)}>Work outfit</button>
        </div>
        <div className="font-mono text-[17px] text-gold">{combos} possible looks</div>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <div className="panel">
          <StepHead n={1} title="Make your person" />
          <label className="flex flex-col gap-1.5">
            <span className="font-display text-xs uppercase tracking-wider text-muted">Name</span>
            <input
              id="name-input"
              className="bevel-in max-w-[260px] bg-lo px-2.5 py-1.5 font-display text-base text-ink"
              maxLength={16}
              placeholder="Type your name"
              autoComplete="off"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) setNameError(false);
              }}
            />
            {nameError && <span className="font-display text-[13px] text-bad">Give your person a name first.</span>}
          </label>
          <div className="flex flex-wrap gap-1.5" role="tablist">
            {Object.keys(TABS).map((t) => (
              <button key={t} role="tab" aria-selected={t === tab} onClick={() => setTab(t)} className={t === tab ? "bevel bg-slot px-3 py-1 font-display text-gold" : "bevel-in bg-lo px-3 py-1 font-display"}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {TABS[tab].map((key) => (
              <OptionField key={key} optionKey={key} value={look[key]} onChange={(v) => setOption(key, v)} />
            ))}
          </div>
        </div>

        <div className="panel">
          <StepHead n={2} title="Personality" />
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(TRAITS) as TraitKey[]).map((k) => (
              <button key={k} className="chip" aria-pressed={trait === k} onClick={() => setTrait(k)}>
                {TRAITS[k].name}
              </button>
            ))}
          </div>
          <p className="m-0 text-[13.5px] text-muted">{TRAITS[trait].desc}</p>
        </div>

        <div className="panel">
          <StepHead n={3} title="Starter job" />
          <p className="m-0 text-[13.5px] text-muted">Your job sets your pay, schedule, commute, work outfit and where you can afford to live.</p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-2.5">
            {Object.entries(JOBS).map(([key, j]) => (
              <JobCard
                key={key}
                selected={jobKey === key}
                onSelect={() => setJobKey(key)}
                tag={j.tag}
                title={j.title}
                pay={payLabel(j)}
                takeHome={"~" + moneyRound(estWeeklyNet(j)) + "/wk"}
                stability={j.stability}
                physical={(j.physical - 0.5) / 1.3}
                home={HOUSING[j.housing].type + ", " + HOUSING[j.housing].hood}
                rent={money(HOUSING[j.housing].rent).replace(".00", "") + "/mo"}
                perk={j.perkText}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button className="btn btn-go px-5 py-2.5 text-[17px]" onClick={start}>Move to New York</button>
          {saved && (
            <button className="btn px-5 py-2.5 text-[17px]" onClick={() => continueGame(saved)}>
              Continue as {saved.name} (day {saved.day})
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function StepHead({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-baseline gap-2.5">
      <span className="font-mono text-[22px] text-grass">{n}</span>
      <h2 className="m-0 font-display text-2xl font-bold">{title}</h2>
    </div>
  );
}

function OptionField({ optionKey, value, onChange }: { optionKey: LookKey; value: string | number; onChange: (v: string | number) => void }) {
  const o = OPTIONS[optionKey];
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-display text-xs uppercase tracking-wider text-muted">{o.label}</span>
      <div className="flex flex-wrap gap-1.5">
        {o.colors
          ? o.colors.map((c, i) => (
              <button key={c} className="swatch" style={{ background: c }} aria-label={o.label + " " + (i + 1)} aria-pressed={value === i} onClick={() => onChange(i)} />
            ))
          : Object.entries(o.values ?? {}).map(([v, label]) => (
              <button key={v} className="chip" aria-pressed={value === v} onClick={() => onChange(v)}>
                {label}
              </button>
            ))}
      </div>
    </div>
  );
}
