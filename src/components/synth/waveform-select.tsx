import { WAVEFORMS, type Waveform } from "@/lib/synth/params";
import { cn } from "@/lib/utils";

const PATHS: Record<Waveform, string> = {
  sine: "M2 12 C6 12 8 4 12 4 C16 4 16 20 20 20 C24 20 26 12 30 12",
  square: "M2 20 V4 H16 V20 H30",
  sawtooth: "M2 20 L16 4 V20 L30 4",
  triangle: "M2 20 L10 4 L22 20 L30 8",
};

type Props = {
  value: Waveform;
  onChange: (w: Waveform) => void;
  disabled?: boolean;
};

export function WaveformSelect({ value, onChange, disabled }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label="Waveform"
      className="flex flex-col gap-2"
    >
      <span className="font-mono text-2xs font-medium tracking-[0.16em] text-muted uppercase">
        Wave
      </span>
      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-2 sm:gap-2">
        {WAVEFORMS.map((w) => {
          const on = w.id === value;
          return (
            <button
              key={w.id}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={disabled}
              onClick={() => onChange(w.id)}
              className={cn(
                "wave-btn",
                "focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:outline-none",
                on && "is-on",
              )}
            >
              <svg
                viewBox="0 0 32 24"
                className="h-5 w-8"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d={PATHS[w.id]}
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-mono text-2xs tracking-[0.12em] uppercase">
                {w.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
