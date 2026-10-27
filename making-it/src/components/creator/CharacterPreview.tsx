import { useEffect, useRef } from "react";
import { drawPerson } from "../../engine/sprites";
import type { Look, Uniform } from "../../game/types";

// the big blinking character on the left of the creator
export default function CharacterPreview({ look, uniform }: { look: Look; uniform: Uniform | null }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const latest = useRef({ look, uniform });
  latest.current = { look, uniform };

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const draw = (now: number) => {
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = "#39404e";
      ctx.fillRect(0, 0, 240, 300);
      ctx.fillStyle = "#333a47";
      for (let x = 0; x < 240; x += 24) ctx.fillRect(x, 0, 2, 244);
      for (let x = 0; x < 240; x += 24) {
        for (let y = 244; y < 300; y += 14) {
          ctx.fillStyle = ((x + y) / 2) % 4 ? "#5c4a3a" : "#4f3f31";
          ctx.fillRect(x + ((y / 14) % 2 ? 12 : 0), y, 22, 12);
        }
      }
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(66, 274, 108, 8);
      const blink = Math.floor(now / 110) % 30 === 0;
      drawPerson(ctx, latest.current.look, 120, 276, 6, { blink, uniform: latest.current.uniform });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} width={240} height={300} className="bevel-in h-[300px] w-[240px] max-w-full" aria-label="Your character" />;
}
