import { useEffect, useRef, type PointerEvent } from "react";
import { skipAnimation } from "../../engine/anim";
import { interact, keys, openGoMenu } from "../../engine/input";
import { startEngine } from "../../engine/loop";
import { store, useGame } from "../../store/gameStore";

// the pixel scene. React just mounts the canvas, the engine loop does the drawing.
export default function Stage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const caption = useGame((s) => s.caption);
  const speed = useGame((s) => s.speed);

  useEffect(() => {
    if (!canvasRef.current) return;
    return startEngine(canvasRef.current);
  }, []);

  const hold = (dir: number) => ({
    onPointerDown: (e: PointerEvent) => {
      e.preventDefault();
      keys.touch = dir;
    },
    onPointerUp: () => (keys.touch = 0),
    onPointerLeave: () => (keys.touch = 0),
    onPointerCancel: () => (keys.touch = 0),
  });

  return (
    <div className="panel min-h-0 gap-2 p-2">
      <canvas
        ref={canvasRef}
        width={640}
        height={360}
        onClick={skipAnimation}
        aria-label="Game scene"
        className="bevel-in min-h-0 w-full flex-1 cursor-pointer bg-[#0b0d11] object-contain max-[820px]:aspect-video max-[820px]:h-auto max-[820px]:flex-none"
      />
      <div className="flex flex-none flex-wrap items-center gap-2.5 max-[820px]:justify-between">
        <div className="flex gap-1.5">
          <button className="btn min-w-11 touch-manipulation select-none text-base" aria-label="Walk left" {...hold(-1)}>◀</button>
          <button className="btn min-w-11 touch-manipulation select-none text-base" aria-label="Walk right" {...hold(1)}>▶</button>
          <button className="btn btn-go" onClick={interact}>Use <kbd>E</kbd></button>
          <button className="btn" onClick={openGoMenu}>Go <kbd>G</kbd></button>
        </div>
        <span className="min-w-0 flex-1 font-display text-[15px] max-[820px]:order-3 max-[820px]:basis-full">{caption}</span>
        <button className="btn" onClick={() => store.setState({ speed: speed === 1 ? 2 : speed === 2 ? 4 : 1 })}>
          Speed {speed}x
        </button>
      </div>
    </div>
  );
}
