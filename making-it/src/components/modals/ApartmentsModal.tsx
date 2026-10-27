import { HOUSING } from "../../data/world";
import { annualGross, listings, mates, moveTo } from "../../game/sim";
import { money, moneyRound } from "../../game/utils";
import { closeModal, runSim, useGame } from "../../store/gameStore";
import { HouseIcon } from "../PixelArt";
import Modal from "./Modal";

export default function ApartmentsModal() {
  const g = useGame((s) => s.game);
  if (!g) return null;
  const partner = mates(g, "partner")[0];

  return (
    <Modal title="Apartment hunt" wide dismissable buttons={[{ label: "Stay put" }]}>
      <p className="m-0 text-muted">
        Landlords want your yearly income to be at least 40x the monthly rent. You make about {moneyRound(annualGross(g.job))}/yr and have {money(g.cash)} in the bank.
      </p>
      <div className="flex flex-col gap-2">
        {listings(g).map((l) => {
          const h = HOUSING[l.key];
          const who = h.mates.length ? "lives with " + h.mates[0].name : "just you" + (partner ? " and " + partner.name : "");
          return (
            <div key={l.key} className="bevel grid grid-cols-[40px_1fr_auto] items-center gap-2.5 bg-slot p-2 max-[560px]:grid-cols-[40px_1fr]">
              <HouseIcon tier={h.tier} />
              <div>
                <div className="font-display font-bold">
                  {h.type} · {h.hood}
                </div>
                <div className="text-[12.5px] text-muted">
                  {moneyRound(l.share)}/mo{h.full && partner ? " (your half)" : ""} · {who}
                  <br />
                  Move-in: first month + deposit + movers = {moneyRound(l.upfront)}. No broker fee.
                </div>
              </div>
              <button
                className={"btn max-[560px]:col-span-2 " + (l.why ? "" : "btn-go")}
                disabled={!!l.why}
                onClick={() => {
                  closeModal();
                  runSim((d, fx) => moveTo(d, fx, l.key));
                }}
              >
                {l.why || "Move here"}
              </button>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
