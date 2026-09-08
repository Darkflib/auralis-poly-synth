import { useSynth } from "@/lib/synth/store";

export function ArmGate() {
  const armed = useSynth((s) => s.armed);
  const arm = useSynth((s) => s.arm);

  if (armed) return null;

  return (
    <button
      type="button"
      autoFocus
      onPointerDown={(e) => {
        e.preventDefault();
        arm();
      }}
      onClick={() => arm()}
      onKeyDown={(e) => {
        if (e.key === "Tab") return;
        e.preventDefault();
        arm();
      }}
      className="arm-gate fixed inset-0 z-30 flex items-center justify-center p-6"
    >
      <span className="flex max-w-sm flex-col items-center gap-5 text-center">
        <span className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          Auralis
        </span>
        <span className="max-w-[16rem] text-sm leading-relaxed text-muted text-pretty">
          Analog-voiced poly synth. Arm the engine to start — browsers keep
          audio silent until you do.
        </span>
        <span className="inline-flex h-11 items-center rounded-lg bg-fg px-5 text-sm font-medium text-bg">
          Arm engine
        </span>
        <span className="font-mono text-2xs tracking-[0.18em] text-muted uppercase">
          Click anywhere or press a key
        </span>
      </span>
    </button>
  );
}
