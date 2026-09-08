export type Waveform = "sine" | "square" | "sawtooth" | "triangle";

export const WAVEFORMS: { id: Waveform; label: string }[] = [
  { id: "sine", label: "Sine" },
  { id: "square", label: "Square" },
  { id: "sawtooth", label: "Saw" },
  { id: "triangle", label: "Tri" },
];

export const MIN_OCTAVE = 1;
export const MAX_OCTAVE = 6;
export const DEFAULT_OCTAVE = 3;

export const DEFAULTS = {
  waveform: "sawtooth" as Waveform,
  cutoff: 0.62,
  resonance: 0.2,
  attack: 0.12,
  decay: 0.28,
  sustain: 0.72,
  release: 0.32,
  volume: 0.62,
  octave: DEFAULT_OCTAVE,
};

const CUTOFF_MIN = 80;
const CUTOFF_MAX = 12000;

export function cutoffHz(t: number): number {
  return CUTOFF_MIN * (CUTOFF_MAX / CUTOFF_MIN) ** clamp01(t);
}

export function resonanceQ(t: number): number {
  return 0.5 + clamp01(t) * 16;
}

/** Quadratic map so low knob values stay snappy. Range ~5ms–2.4s. */
export function envSeconds(t: number): number {
  const x = clamp01(t);
  return 0.005 + x * x * 2.4;
}

export function volumeGain(t: number): number {
  const x = clamp01(t);
  return x * x;
}

export function formatHz(t: number): string {
  const hz = cutoffHz(t);
  if (hz >= 1000) return `${(hz / 1000).toFixed(1)}k`;
  return `${Math.round(hz)}`;
}

export function formatQ(t: number): string {
  return resonanceQ(t).toFixed(1);
}

export function formatEnv(t: number): string {
  const s = envSeconds(t);
  if (s < 1) return `${Math.round(s * 1000)}ms`;
  return `${s.toFixed(2)}s`;
}

export function formatPct(t: number): string {
  return `${Math.round(clamp01(t) * 100)}`;
}

export function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
