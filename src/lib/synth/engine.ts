import { midiToHz } from "./notes";
import {
  cutoffHz,
  envSeconds,
  resonanceQ,
  volumeGain,
  type Waveform,
} from "./params";

const MAX_VOICES = 10;
const VOICE_PEAK = 0.2;

export type EngineParams = {
  waveform: Waveform;
  cutoff: number;
  resonance: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  volume: number;
};

type Voice = {
  midi: number;
  osc: OscillatorNode;
  filter: BiquadFilterNode;
  gain: GainNode;
  startedAt: number;
  releasing: boolean;
};

class SynthEngine {
  ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  analyser: AnalyserNode | null = null;
  private voices = new Map<number, Voice>();
  private order: number[] = [];
  private params: EngineParams = {
    waveform: "sawtooth",
    cutoff: 0.62,
    resonance: 0.2,
    attack: 0.12,
    decay: 0.28,
    sustain: 0.72,
    release: 0.32,
    volume: 0.62,
  };

  get armed(): boolean {
    return this.ctx !== null && this.ctx.state !== "closed";
  }

  /** Create graph + resume. Must run inside a user-gesture stack. */
  arm(): boolean {
    if (typeof window === "undefined") return false;
    try {
      if (!this.ctx) {
        const Ctx =
          window.AudioContext ||
          (window as Window & { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!Ctx) return false;
        this.ctx = new Ctx({ latencyHint: "interactive" });
        this.buildGraph();
      }
      if (this.ctx.state === "suspended") {
        void this.ctx.resume();
      }
      return true;
    } catch {
      return false;
    }
  }

  resumeIfNeeded(): void {
    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
  }

  sync(params: Partial<EngineParams>): void {
    this.params = { ...this.params, ...params };
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    if (params.volume !== undefined) {
      this.master.gain.setTargetAtTime(volumeGain(params.volume), t, 0.03);
    }
    const cutoff = cutoffHz(this.params.cutoff);
    const q = resonanceQ(this.params.resonance);
    for (const voice of this.voices.values()) {
      if (params.waveform) voice.osc.type = params.waveform;
      if (params.cutoff !== undefined) {
        voice.filter.frequency.setTargetAtTime(cutoff, t, 0.03);
      }
      if (params.resonance !== undefined) {
        voice.filter.Q.setTargetAtTime(q, t, 0.03);
      }
    }
  }

  noteOn(midi: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    this.resumeIfNeeded();

    const existing = this.voices.get(midi);
    if (existing) this.killVoice(existing, 0.02);

    if (this.voices.size >= MAX_VOICES) {
      const oldest = this.order.shift();
      if (oldest !== undefined) {
        const stolen = this.voices.get(oldest);
        if (stolen) this.killVoice(stolen, 0.04);
      }
    }

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = this.params.waveform;
    osc.frequency.setValueAtTime(midiToHz(midi), t);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(cutoffHz(this.params.cutoff), t);
    filter.Q.setValueAtTime(resonanceQ(this.params.resonance), t);

    const attack = Math.max(0.004, envSeconds(this.params.attack));
    const decay = Math.max(0.01, envSeconds(this.params.decay));
    const sustain = VOICE_PEAK * this.params.sustain;

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(VOICE_PEAK, t + attack);
    gain.gain.linearRampToValueAtTime(Math.max(0.0001, sustain), t + attack + decay);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    osc.start(t);

    const voice: Voice = {
      midi,
      osc,
      filter,
      gain,
      startedAt: t,
      releasing: false,
    };
    osc.onended = () => {
      this.disposeVoice(voice);
    };
    this.voices.set(midi, voice);
    this.order = this.order.filter((n) => n !== midi);
    this.order.push(midi);
  }

  noteOff(midi: number): void {
    const voice = this.voices.get(midi);
    if (!voice || !this.ctx) return;
    this.releaseVoice(voice);
  }

  allNotesOff(): void {
    for (const voice of [...this.voices.values()]) {
      this.releaseVoice(voice);
    }
  }

  getWaveform(out: Uint8Array): void {
    this.analyser?.getByteTimeDomainData(
      out as Parameters<AnalyserNode["getByteTimeDomainData"]>[0],
    );
  }

  getByteFrequency(out: Uint8Array): void {
    this.analyser?.getByteFrequencyData(
      out as Parameters<AnalyserNode["getByteFrequencyData"]>[0],
    );
  }

  private buildGraph(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const master = ctx.createGain();
    master.gain.value = volumeGain(this.params.volume);

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -14;
    compressor.knee.value = 10;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.004;
    compressor.release.value = 0.12;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.45;

    master.connect(compressor);
    compressor.connect(analyser);
    analyser.connect(ctx.destination);

    this.master = master;
    this.compressor = compressor;
    this.analyser = analyser;
  }

  private releaseVoice(voice: Voice): void {
    if (voice.releasing || !this.ctx) return;
    voice.releasing = true;
    const t = this.ctx.currentTime;
    const release = Math.max(0.02, envSeconds(this.params.release));
    const g = voice.gain.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(Math.max(g.value, 0.0001), t);
    g.linearRampToValueAtTime(0, t + release);
    try {
      voice.osc.stop(t + release + 0.04);
    } catch {
      this.disposeVoice(voice);
    }
  }

  private killVoice(voice: Voice, fade: number): void {
    if (!this.ctx) return;
    voice.releasing = true;
    const t = this.ctx.currentTime;
    const g = voice.gain.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(Math.max(g.value, 0.0001), t);
    g.linearRampToValueAtTime(0, t + fade);
    try {
      voice.osc.stop(t + fade + 0.02);
    } catch {
      this.disposeVoice(voice);
    }
  }

  private disposeVoice(voice: Voice): void {
    if (this.voices.get(voice.midi) === voice) {
      this.voices.delete(voice.midi);
    }
    this.order = this.order.filter((n) => n !== voice.midi);
    try {
      voice.osc.disconnect();
      voice.filter.disconnect();
      voice.gain.disconnect();
    } catch {
      /* already disconnected */
    }
  }
}

let engine: SynthEngine | null = null;

export function getEngine(): SynthEngine {
  if (!engine) engine = new SynthEngine();
  return engine;
}
