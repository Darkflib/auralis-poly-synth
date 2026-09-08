import { useCallback, useEffect, useId, useRef } from "react";
import { clamp01 } from "@/lib/synth/params";
import { cn } from "@/lib/utils";

type KnobProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  display: string;
  defaultValue?: number;
  disabled?: boolean;
};

const ANGLE_MIN = -135;
const ANGLE_MAX = 135;

export function Knob({
  label,
  value,
  onChange,
  display,
  defaultValue = 0.5,
  disabled = false,
}: KnobProps) {
  const id = useId();
  const drag = useRef<{ startY: number; start: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const angle = ANGLE_MIN + clamp01(value) * (ANGLE_MAX - ANGLE_MIN);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      drag.current = { startY: e.clientY, start: value };
    },
    [disabled, value],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag.current) return;
      const dy = drag.current.startY - e.clientY;
      onChange(clamp01(drag.current.start + dy / 130));
    },
    [onChange],
  );

  const onPointerUp = useCallback(() => {
    drag.current = null;
  }, []);

  const onDoubleClick = useCallback(() => {
    if (!disabled) onChange(defaultValue);
  }, [defaultValue, disabled, onChange]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      const step = e.shiftKey ? 0.08 : 0.02;
      if (e.key === "ArrowUp" || e.key === "ArrowRight") {
        e.preventDefault();
        onChange(clamp01(value + step));
      } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
        e.preventDefault();
        onChange(clamp01(value - step));
      } else if (e.key === "Home") {
        e.preventDefault();
        onChange(0);
      } else if (e.key === "End") {
        e.preventDefault();
        onChange(1);
      }
    },
    [disabled, onChange, value],
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (disabled) return;
      e.preventDefault();
      const dir = e.deltaY > 0 ? -1 : 1;
      onChange(clamp01(value + dir * 0.025));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [disabled, onChange, value]);

  return (
    <div className="flex w-16 flex-col items-center gap-1.5 sm:w-[4.5rem]">
      <span
        id={id}
        className="font-mono text-2xs font-medium tracking-[0.16em] text-muted uppercase"
      >
        {label}
      </span>
      <div
        ref={rootRef}
        role="slider"
        aria-labelledby={id}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
        aria-valuetext={display}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={onDoubleClick}
        onKeyDown={onKeyDown}
        className={cn(
          "relative size-14 touch-none sm:size-16",
          disabled ? "cursor-default opacity-50" : "cursor-ns-resize",
        )}
      >
        <svg viewBox="0 0 80 80" className="size-full" aria-hidden="true">
          {Array.from({ length: 11 }, (_, i) => {
            const a = ((ANGLE_MIN + (i / 10) * (ANGLE_MAX - ANGLE_MIN)) * Math.PI) / 180;
            const x1 = 40 + Math.cos(a) * 34;
            const y1 = 40 + Math.sin(a) * 34;
            const x2 = 40 + Math.cos(a) * 38;
            const y2 = 40 + Math.sin(a) * 38;
            const lit = i / 10 <= value + 0.001;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={lit ? "var(--color-accent)" : "var(--color-tick)"}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            );
          })}
          <circle cx="40" cy="40" r="26" fill="var(--color-knob)" />
          <circle
            cx="40"
            cy="40"
            r="26"
            fill="none"
            stroke="var(--color-knob-ring)"
            strokeWidth="1"
          />
          <circle cx="40" cy="28" r="7" fill="var(--color-knob-sheen)" />
          <g transform={`rotate(${angle} 40 40)`}>
            <line
              x1="40"
              y1="22"
              x2="40"
              y2="34"
              stroke="var(--color-fg)"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>
      <span className="font-mono text-[0.6875rem] tabular-nums text-fg">
        {display}
      </span>
    </div>
  );
}
