import clsx from "clsx";
import { useEffect } from "react";
import Creator from "./components/creator/Creator";
import GameScreen from "./components/game/GameScreen";
import ModalHost from "./components/modals/ModalHost";
import { pushModal, useGame } from "./store/gameStore";

export default function App() {
  const playing = useGame((s) => s.game !== null);

  useEffect(() => {
    document.body.classList.toggle("playing", playing);
  }, [playing]);

  return (
    <div className={clsx("mx-auto flex flex-col gap-3", playing ? "h-full max-w-[1560px] max-[820px]:h-auto" : "max-w-[1320px]")}>
      <header className="flex flex-none flex-wrap items-center justify-between gap-3">
        <h1 className="m-0 flex items-center gap-2.5 font-display text-3xl font-bold leading-none max-[820px]:text-2xl">
          <span className="size-[22px] bg-grass shadow-[inset_-4px_-4px_0_var(--color-grass-dk),inset_4px_4px_0_#9be786]" />
          Making It
          <small className="text-[13px] font-normal text-muted max-[820px]:hidden">a New York life sim</small>
        </h1>
        {playing && (
          <button className="btn" onClick={() => pushModal({ kind: "confirmNew" })}>
            New game
          </button>
        )}
      </header>
      {playing ? <GameScreen /> : <Creator />}
      <ModalHost />
    </div>
  );
}
