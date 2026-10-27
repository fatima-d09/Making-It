import { useEffect, useRef } from "react";
import { drawHouseIcon, drawIcon, drawPerson } from "../engine/sprites";
import type { Look, Tier, Uniform } from "../game/types";

// small canvas components that reuse the same pixel drawing code as the game scene

export function PixelIcon({ kind, className = "size-8" }: { kind: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current) drawIcon(ref.current, kind);
  }, [kind]);
  return <canvas ref={ref} width={32} height={32} className={className} aria-hidden />;
}

export function HouseIcon({ tier }: { tier: Tier }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current) drawHouseIcon(ref.current, tier);
  }, [tier]);
  return <canvas ref={ref} width={32} height={32} className="size-10" aria-hidden />;
}

interface PortraitProps {
  look: Look;
  width: number;
  height: number;
  scale: number;
  feetY: number;
  uniform?: Uniform | null;
  className?: string;
}

// a person standing on a little floor, used in the Stuff tab and the closet
export function Portrait({ look, width, height, scale, feetY, uniform, className }: PortraitProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#39404e";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#4f3f31";
    ctx.fillRect(0, feetY - 4 * scale, width, height);
    drawPerson(ctx, look, width / 2, feetY, scale, { uniform });
  }, [look, width, height, scale, feetY, uniform]);
  return <canvas ref={ref} width={width} height={height} className={className} aria-hidden />;
}
