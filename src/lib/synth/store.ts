import { create } from "zustand";
import { getEngine, type EngineParams } from "./engine";
import {
  clamp,
  DEFAULTS,
  MAX_OCTAVE,
  MIN_OCTAVE,
  type Waveform,
} from "./params";

export type SynthState = EngineParams & {
  armed: boolean;
  octave: number;
  activeNotes: number[];
  arm: () => void;
  setOctave: (octave: number) => void;
  shiftOctave: (delta: number) => void;
  setWaveform: (waveform: Waveform) => void;
  setCutoff: (cutoff: number) => void;
  setResonance: (resonance: number) => void;
  setAttack: (attack: number) => void;
  setDecay: (decay: number) => void;
  setSustain: (sustain: number) => void;
  setRelease: (release: number) => void;
  setVolume: (volume: number) => void;
  noteOn: (midi: number) => void;
  noteOff: (midi: number) => void;
  panic: () => void;
};

function pushParams(partial: Partial<EngineParams>) {
  getEngine().sync(partial);
}

export const useSynth = create<SynthState>((set, get) => ({
  ...DEFAULTS,
  armed: false,
  activeNotes: [],

  arm: () => {
    const ok = getEngine().arm();
    if (ok) {
      pushParams(get());
      set({ armed: true });
    }
  },

  setOctave: (octave) => set({ octave: clamp(octave, MIN_OCTAVE, MAX_OCTAVE) }),
  shiftOctave: (delta) =>
    set({
      octave: clamp(get().octave + delta, MIN_OCTAVE, MAX_OCTAVE),
    }),

  setWaveform: (waveform) => {
    set({ waveform });
    pushParams({ waveform });
  },
  setCutoff: (cutoff) => {
    set({ cutoff });
    pushParams({ cutoff });
  },
  setResonance: (resonance) => {
    set({ resonance });
    pushParams({ resonance });
  },
  setAttack: (attack) => {
    set({ attack });
    pushParams({ attack });
  },
  setDecay: (decay) => {
    set({ decay });
    pushParams({ decay });
  },
  setSustain: (sustain) => {
    set({ sustain });
    pushParams({ sustain });
  },
  setRelease: (release) => {
    set({ release });
    pushParams({ release });
  },
  setVolume: (volume) => {
    set({ volume });
    pushParams({ volume });
  },

  noteOn: (midi) => {
    const { armed, activeNotes } = get();
    if (!armed) return;
    getEngine().noteOn(midi);
    if (!activeNotes.includes(midi)) {
      set({ activeNotes: [...activeNotes, midi] });
    }
  },
  noteOff: (midi) => {
    getEngine().noteOff(midi);
    set({ activeNotes: get().activeNotes.filter((n) => n !== midi) });
  },
  panic: () => {
    getEngine().allNotesOff();
    set({ activeNotes: [] });
  },
}));
