import clsx from "clsx";

interface Props {
  selected: boolean;
  onSelect: () => void;
  tag: string;
  title: string;
  pay: string;
  takeHome: string;
  stability: number;
  physical: number;
  home: string;
  rent: string;
  perk: string;
}

function Meter({ value }: { value: number }) {
  const on = Math.round(Math.max(0, Math.min(1, value)) * 5);
  return (
    <span className="inline-flex gap-0.5 align-middle" aria-label={on + " of 5"}>
      {[0, 1, 2, 3, 4].map((i) => (
        <i key={i} className={clsx("block size-[9px]", i < on ? "bg-grass" : "bg-lo")} />
      ))}
    </span>
  );
}

export default function JobCard(p: Props) {
  return (
    <button
      onClick={p.onSelect}
      aria-pressed={p.selected}
      className={clsx("bevel flex min-w-0 flex-col gap-1.5 bg-slot p-2.5 text-left", p.selected && "outline-3 -outline-offset-1 outline-gold")}
    >
      <span className="font-display text-xs uppercase tracking-wide text-grass">{p.tag}</span>
      <span className="font-display text-base font-bold leading-tight">{p.title}</span>
      <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-0.5 text-[13px]">
        <dt className="text-muted">Pay</dt><dd className="m-0">{p.pay}</dd>
        <dt className="text-muted">Take-home</dt><dd className="m-0">{p.takeHome}</dd>
        <dt className="text-muted">Stability</dt><dd className="m-0"><Meter value={p.stability} /></dd>
        <dt className="text-muted">Physical</dt><dd className="m-0"><Meter value={p.physical} /></dd>
        <dt className="text-muted">Home</dt><dd className="m-0">{p.home}</dd>
        <dt className="text-muted">Rent</dt><dd className="m-0">{p.rent}</dd>
      </dl>
      <span className="border-t-2 border-dashed border-hi pt-1.5 text-[12.5px] text-muted">{p.perk}</span>
    </button>
  );
}
