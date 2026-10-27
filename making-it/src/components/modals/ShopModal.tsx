import { ITEMS, SHOP_NAMES } from "../../data/world";
import { buyItem, consoleOk } from "../../game/sim";
import type { ShopCat } from "../../game/types";
import { money } from "../../game/utils";
import { runSim, useGame } from "../../store/gameStore";
import { PixelIcon } from "../PixelArt";
import Modal from "./Modal";

export default function ShopModal({ cat }: { cat: ShopCat }) {
  const g = useGame((s) => s.game);
  if (!g) return null;
  const keys = Object.keys(ITEMS).filter((k) => ITEMS[k].cat === cat);
  const note = cat === "clothes" ? "Clothes go on as soon as you buy them. Take them on and off from the Stuff tab." : "Everything gets delivered to your place and shows up in Stuff.";

  return (
    <Modal title={SHOP_NAMES[cat]} dismissable buttons={[{ label: "Done shopping", primary: true }]}>
      <p className="m-0 text-muted">
        {note} You have {money(g.cash)}.
      </p>
      <div className="flex flex-col gap-2">
        {keys.map((k) => {
          const it = ITEMS[k];
          const owned = !!g.items[k];
          const blocked = k === "console" && !consoleOk(g);
          const tooPricey = g.cash < it.price;
          return (
            <div key={k} className="bevel grid grid-cols-[40px_1fr_auto] items-center gap-2.5 bg-slot p-2">
              <PixelIcon kind={k} className="size-10" />
              <div>
                <div className="font-display font-bold">
                  {it.name} · {money(it.price)}
                </div>
                <div className="text-[12.5px] text-muted">{it.desc}</div>
              </div>
              <button className={"btn " + (owned ? "" : "btn-go")} disabled={owned || blocked || tooPricey} onClick={() => runSim((d) => void buyItem(d, k))}>
                {owned ? "Owned" : blocked ? "Need TV" : tooPricey ? "Too pricey" : "Buy"}
              </button>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
