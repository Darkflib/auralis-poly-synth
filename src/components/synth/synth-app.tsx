import { Minus, Plus } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { getEngine } from "@/lib/synth/engine";
import {
  formatEnv,
  formatHz,
  formatPct,
  formatQ,
  MAX_OCTAVE,
  MIN_OCTAVE,
} from "@/lib/synth/params";
import { useSynth } from "@/lib/synth/store";
import { Button } from "@/components/ui/button";
import { ArmGate } from "./arm-gate";
import { Keyboard } from "./keyboard";
import { Knob } from "./knob";
import { LevelMeter } from "./level-meter";
import { Oscilloscope } from "./oscilloscope";
import { WaveformSelect } from "./waveform-select";

export function SynthApp() {
  const armed = useSynth((s) => s.armed);
  const octave = useSynth((s) => s.octave);
  const waveform = useSynth((s) => s.waveform);
  const cutoff = useSynth((s) => s.cutoff);
  const resonance = useSynth((s) => s.resonance);
  const attack = useSynth((s) => s.attack);
  const decay = useSynth((s) => s.decay);
  const sustain = useSynth((s) => s.sustain);
  const release = useSynth((s) => s.release);
  const volume = useSynth((s) => s.volume);
  const shiftOctave = useSynth((s) => s.shiftOctave);
  const setWaveform = useSynth((s) => s.setWaveform);
  const setCutoff = useSynth((s) => s.setCutoff);
  const setResonance = useSynth((s) => s.setResonance);
  const setAttack = useSynth((s) => s.setAttack);
  const setDecay = useSynth((s) => s.setDecay);
  const setSustain = useSynth((s) => s.setSustain);
  const setRelease = useSynth((s) => s.setRelease);
  const setVolume = useSynth((s) => s.setVolume);

  useEffect(() => {
    const resume = () => getEngine().resumeIfNeeded();
    const onVis = () => {
      if (document.visibilityState === "visible") resume();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", resume);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", resume);
    };
  }, []);

  return (
    <main className="flex min-h-dvh flex-col bg-bg text-fg">
      <div className="mx-auto flex w-full max-w-[68rem] flex-1 flex-col justify-center px-3 py-4 sm:px-6 sm:py-8">
        <section className="chassis relative flex flex-col gap-5 p-4 sm:gap-6 sm:p-6">
          <ArmGate />

          <header className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-2xs tracking-[0.22em] text-muted uppercase">
                Poly synth
              </p>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
                Auralis
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                <span
                  className={armed ? "led led-on" : "led"}
                  aria-hidden="true"
                />
                <span className="font-mono text-2xs tracking-[0.16em] text-muted uppercase">
                  {armed ? "Armed" : "Standby"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-2xs tracking-[0.16em] text-muted uppercase">
                  Oct
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-9"
                  aria-label="Octave down"
                  disabled={!armed || octave <= MIN_OCTAVE}
                  onClick={() => shiftOctave(-1)}
                >
                  <Minus className="size-4" />
                </Button>
                <span className="w-6 text-center font-mono text-sm tabular-nums">
                  {octave}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-9"
                  aria-label="Octave up"
                  disabled={!armed || octave >= MAX_OCTAVE}
                  onClick={() => shiftOctave(1)}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          </header>

          <div className="grid gap-5 lg:grid-cols-[1fr_18rem] lg:items-start">
            <div className="flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-[8.5rem_1fr]">
                <WaveformSelect
                  value={waveform}
                  onChange={setWaveform}
                  disabled={!armed}
                />
                <div className="flex flex-col gap-4">
                  <ControlGroup title="Filter">
                    <Knob
                      label="Cutoff"
                      value={cutoff}
                      onChange={setCutoff}
                      display={formatHz(cutoff)}
                      defaultValue={0.62}
                      disabled={!armed}
                    />
                    <Knob
                      label="Reso"
                      value={resonance}
                      onChange={setResonance}
                      display={formatQ(resonance)}
                      defaultValue={0.2}
                      disabled={!armed}
                    />
                  </ControlGroup>
                  <ControlGroup title="Envelope">
                    <Knob
                      label="Atk"
                      value={attack}
                      onChange={setAttack}
                      display={formatEnv(attack)}
                      defaultValue={0.12}
                      disabled={!armed}
                    />
                    <Knob
                      label="Dec"
                      value={decay}
                      onChange={setDecay}
                      display={formatEnv(decay)}
                      defaultValue={0.28}
                      disabled={!armed}
                    />
                    <Knob
                      label="Sus"
                      value={sustain}
                      onChange={setSustain}
                      display={formatPct(sustain)}
                      defaultValue={0.72}
                      disabled={!armed}
                    />
                    <Knob
                      label="Rel"
                      value={release}
                      onChange={setRelease}
                      display={formatEnv(release)}
                      defaultValue={0.32}
                      disabled={!armed}
                    />
                  </ControlGroup>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="min-w-0 flex-1">
                <span className="mb-2 block font-mono text-2xs font-medium tracking-[0.16em] text-muted uppercase">
                  Scope
                </span>
                <Oscilloscope armed={armed} />
              </div>
              <div className="flex flex-col items-center gap-3">
                <Knob
                  label="Vol"
                  value={volume}
                  onChange={setVolume}
                  display={formatPct(volume)}
                  defaultValue={0.62}
                  disabled={!armed}
                />
                <LevelMeter armed={armed} />
              </div>
            </div>
          </div>

          <Keyboard />

          <p className="text-center font-mono text-2xs leading-relaxed tracking-[0.08em] text-muted uppercase">
            Z–M lower · Q–I upper · [ ] octave · Esc silence
          </p>
        </section>
      </div>
    </main>
  );
}

function ControlGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-2xs font-medium tracking-[0.16em] text-muted uppercase">
        {title}
      </span>
      <div className="flex flex-wrap items-start gap-3 sm:gap-4">{children}</div>
    </div>
  );
}
