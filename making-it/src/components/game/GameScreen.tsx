import Hud from "./Hud";
import SidePanel from "./SidePanel";
import Stage from "./Stage";
import { useKeyboard } from "./useKeyboard";

export default function GameScreen() {
  useKeyboard();
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-2.5">
      <Hud />
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_390px] gap-3 max-[1100px]:grid-cols-[minmax(0,1fr)_330px] max-[820px]:grid-cols-1">
        <Stage />
        <SidePanel />
      </div>
    </section>
  );
}
