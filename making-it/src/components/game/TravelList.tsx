import { playTravel } from "../../engine/anim";
import { destinations, milesBetween, placeLabel, placeSub, travelOptions } from "../../game/sim";
import type { PlaceKey, TravelMode } from "../../game/types";
import { fmtDuration, money } from "../../game/utils";
import { useGame } from "../../store/gameStore";

// every place you can go + subway / rideshare / walk for each. used in the Go tab and the G menu
export default function TravelList({ onPick }: { onPick?: () => void }) {
  const g = useGame((s) => s.game);
  const busy = useGame((s) => s.busy);
  if (!g) return null;

  const go = (dest: PlaceKey, mode: TravelMode) => {
    onPick?.();
    playTravel(dest, mode);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {destinations(g).map((dest) => (
        <div key={dest} className="grid gap-1.5 border-t-2 border-dashed border-hi pt-2.5 first:border-t-0 first:pt-0">
          <div className="font-display text-[15px] font-semibold">
            {placeLabel(g, dest)}{" "}
            <span className="font-body text-[12.5px] font-normal text-muted">
              · {placeSub(g, dest)} · {milesBetween(g, g.location, dest).toFixed(1)} mi
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {travelOptions(g, dest).map((o) => {
              let price = o.cost === 0 ? "Free" : money(o.cost);
              if (o.mode === "subway" && o.cost === 0) price = "Unlimited";
              if (o.mode === "swyft" && o.surge && o.surge > 1.15) price += " · " + o.surge + "x";
              return (
                <button key={o.mode} className="act text-xs leading-tight" disabled={!o.ok || g.over || busy} onClick={() => go(dest, o.mode)}>
                  <b className="block font-display text-sm">{o.name}</b>
                  {o.ok ? (
                    <>
                      {price}
                      <br />
                      {fmtDuration(o.mins)}
                    </>
                  ) : (
                    o.why
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
