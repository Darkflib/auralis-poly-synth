import { useEffect, useRef } from "react";
import { getEngine } from "@/lib/synth/engine";

const SAMPLES = 160;

export function Oscilloscope({ armed }: { armed: boolean }) {
  const lineRef = useRef<SVGPolylineElement>(null);
  const frameRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    const line = lineRef.current;
    const frame = frameRef.current;
    if (!line || !frame) return;
    const data = new Uint8Array(2048);
    let raf = 0;

    const draw = () => {
      raf = requestAnimationFrame(draw);
      const width = frame.width.baseVal.value || 320;
      const height = frame.height.baseVal.value || 112;
      if (!armed) {
        line.setAttribute(
          "points",
          `0,${height / 2} ${width},${height / 2}`,
        );
        return;
      }
      const engine = getEngine();
      if (!engine.analyser) return;
      engine.getWaveform(data);
      const mid = height / 2;
      const amp = height * 0.42;
      const step = Math.max(1, Math.floor(data.length / SAMPLES));
      const slice = width / (SAMPLES - 1);
      const pts: string[] = [];
      for (let i = 0; i < SAMPLES; i++) {
        const v = data[i * step] / 128 - 1;
        pts.push(`${(i * slice).toFixed(1)},${(mid + v * amp).toFixed(1)}`);
      }
      line.setAttribute("points", pts.join(" "));
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [armed]);

  return (
    <div className="scope-well relative h-28 overflow-hidden rounded-xl sm:h-32">
      <svg
        className="size-full"
        viewBox="0 0 320 112"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <rect ref={frameRef} width="320" height="112" fill="none" />
        <line
          x1="0"
          y1="56"
          x2="320"
          y2="56"
          stroke="rgba(236,236,232,0.08)"
          strokeWidth="1"
        />
        <polyline
          ref={lineRef}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
          points="0,56 320,56"
        />
      </svg>
      {!armed && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-2xs tracking-[0.2em] text-muted uppercase">
          Standby
        </span>
      )}
    </div>
  );
}
