import { useEffect, useRef } from "react";
import { getEngine } from "@/lib/synth/engine";

const SEGMENTS = 12;

export function LevelMeter({ armed }: { armed: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const peakHold = useRef(0);
  const peakDecay = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const cells = [...track.querySelectorAll<HTMLElement>("[data-seg]")];
    const data = new Uint8Array(2048);
    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      let rms = 0;
      if (armed) {
        const engine = getEngine();
        if (engine.analyser) {
          engine.getWaveform(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128;
            sum += v * v;
          }
          rms = Math.sqrt(sum / data.length);
        }
      }
      const level = Math.min(1, rms * 3.2);
      if (level > peakHold.current) {
        peakHold.current = level;
        peakDecay.current = 24;
      } else if (peakDecay.current > 0) {
        peakDecay.current -= 1;
      } else {
        peakHold.current = Math.max(0, peakHold.current - 0.012);
      }
      const lit = Math.round(level * SEGMENTS);
      const peakSeg = Math.round(peakHold.current * SEGMENTS) - 1;
      cells.forEach((cell, i) => {
        const on = i < lit;
        const peak = i === peakSeg;
        cell.dataset.on = on || peak ? "1" : "0";
        cell.dataset.peak = peak && !on ? "1" : "0";
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [armed]);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="font-mono text-2xs font-medium tracking-[0.16em] text-muted uppercase">
        Lvl
      </span>
      <div
        ref={trackRef}
        className="flex h-28 w-4 flex-col-reverse gap-0.5 sm:h-32"
        aria-hidden="true"
      >
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <div
            key={i}
            data-seg
            data-on="0"
            className="meter-seg min-h-0 flex-1 rounded-[1px]"
          />
        ))}
      </div>
    </div>
  );
}
