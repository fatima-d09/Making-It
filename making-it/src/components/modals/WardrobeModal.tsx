import { ITEMS } from "../../data/world";
import { playerLook, toggleWear } from "../../game/sim";
import { runSim, useGame } from "../../store/gameStore";
import { PixelIcon, Portrait } from "../PixelArt";
import Modal from "./Modal";

export default function WardrobeModal() {
  const g = useGame((s) => s.game);
  if (!g) return null;
  const owned = Object.keys(ITEMS).filter((k) => ITEMS[k].wear && g.items[k]);

  return (
    <Modal title="Get dressed" dismissable buttons={[{ label: "Done", primary: true }]}>
      <div className="grid grid-cols-[120px_1fr] items-start gap-3 max-[820px]:grid-cols-1">
        <Portrait look={playerLook(g)} width={120} height={150} scale={3} feetY={138} className="bevel-in h-[150px] w-[120px]" />
        <div className="flex flex-col gap-2">
          {owned.length === 0 && <p className="m-0 text-muted">Your closet is empty. Fulton Mall has clothes.</p>}
          {owned.map((k) => {
            const on = g.worn.includes(k);
            return (
              <div key={k} className="bevel grid grid-cols-[40px_1fr_auto] items-center gap-2.5 bg-slot p-2">
                <PixelIcon kind={k} className="size-10" />
                <div>
                  <div className="font-display font-bold">{ITEMS[k].name}</div>
                  <div className="text-[12.5px] text-muted">{on ? "Wearing it" : "In your closet"}</div>
                </div>
                <button className={"btn " + (on ? "" : "btn-go")} onClick={() => runSim((d) => toggleWear(d, k))}>
                  {on ? "Take off" : "Wear"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
