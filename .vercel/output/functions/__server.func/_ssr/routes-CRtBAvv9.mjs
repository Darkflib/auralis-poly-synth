import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Plus, r as Minus } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CRtBAvv9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var WHITE_PC = [
	0,
	2,
	4,
	5,
	7,
	9,
	11
];
var WHITE_NAMES = [
	"C",
	"D",
	"E",
	"F",
	"G",
	"A",
	"B"
];
/** Chromatic offsets of black keys on the 25-key board. */
var BLACK_OFFSETS = [
	1,
	3,
	6,
	8,
	10,
	13,
	15,
	18,
	20,
	22
];
/**
* Computer-keyboard map, Ableton/GarageBand style.
* Lower row = current octave, upper row = octave + 1, I = top C.
*/
var CODE_TO_OFFSET = {
	KeyZ: 0,
	KeyS: 1,
	KeyX: 2,
	KeyD: 3,
	KeyC: 4,
	KeyV: 5,
	KeyG: 6,
	KeyB: 7,
	KeyH: 8,
	KeyN: 9,
	KeyJ: 10,
	KeyM: 11,
	KeyQ: 12,
	Digit2: 13,
	KeyW: 14,
	Digit3: 15,
	KeyE: 16,
	KeyR: 17,
	Digit5: 18,
	KeyT: 19,
	Digit6: 20,
	KeyY: 21,
	Digit7: 22,
	KeyU: 23,
	KeyI: 24
};
var OFFSET_TO_LABEL = {
	0: "Z",
	1: "S",
	2: "X",
	3: "D",
	4: "C",
	5: "V",
	6: "G",
	7: "B",
	8: "H",
	9: "N",
	10: "J",
	11: "M",
	12: "Q",
	13: "2",
	14: "W",
	15: "3",
	16: "E",
	17: "R",
	18: "5",
	19: "T",
	20: "6",
	21: "Y",
	22: "7",
	23: "U",
	24: "I"
};
function midiFromOctave(octave, offset) {
	return (octave + 1) * 12 + offset;
}
function midiToHz(midi) {
	return 440 * 2 ** ((midi - 69) / 12);
}
function isBlackOffset(offset) {
	const pc = offset % 12;
	return pc === 1 || pc === 3 || pc === 6 || pc === 8 || pc === 10;
}
/** White-key index (0–14) that a black key sits after. */
function whiteIndexBeforeBlack(blackOffset) {
	let whites = 0;
	for (let i = 0; i < blackOffset; i++) if (!isBlackOffset(i)) whites += 1;
	return whites - 1;
}
var WAVEFORMS = [
	{
		id: "sine",
		label: "Sine"
	},
	{
		id: "square",
		label: "Square"
	},
	{
		id: "sawtooth",
		label: "Saw"
	},
	{
		id: "triangle",
		label: "Tri"
	}
];
var DEFAULTS = {
	waveform: "sawtooth",
	cutoff: .62,
	resonance: .2,
	attack: .12,
	decay: .28,
	sustain: .72,
	release: .32,
	volume: .62,
	octave: 3
};
var CUTOFF_MIN = 80;
var CUTOFF_MAX = 12e3;
function cutoffHz(t) {
	return CUTOFF_MIN * (CUTOFF_MAX / CUTOFF_MIN) ** clamp01(t);
}
function resonanceQ(t) {
	return .5 + clamp01(t) * 16;
}
/** Quadratic map so low knob values stay snappy. Range ~5ms–2.4s. */
function envSeconds(t) {
	const x = clamp01(t);
	return .005 + x * x * 2.4;
}
function volumeGain(t) {
	const x = clamp01(t);
	return x * x;
}
function formatHz(t) {
	const hz = cutoffHz(t);
	if (hz >= 1e3) return `${(hz / 1e3).toFixed(1)}k`;
	return `${Math.round(hz)}`;
}
function formatQ(t) {
	return resonanceQ(t).toFixed(1);
}
function formatEnv(t) {
	const s = envSeconds(t);
	if (s < 1) return `${Math.round(s * 1e3)}ms`;
	return `${s.toFixed(2)}s`;
}
function formatPct(t) {
	return `${Math.round(clamp01(t) * 100)}`;
}
function clamp01(n) {
	return Math.min(1, Math.max(0, n));
}
function clamp(n, min, max) {
	return Math.min(max, Math.max(min, n));
}
var MAX_VOICES = 10;
var VOICE_PEAK = .2;
var SynthEngine = class {
	ctx = null;
	master = null;
	compressor = null;
	analyser = null;
	voices = /* @__PURE__ */ new Map();
	order = [];
	params = {
		waveform: "sawtooth",
		cutoff: .62,
		resonance: .2,
		attack: .12,
		decay: .28,
		sustain: .72,
		release: .32,
		volume: .62
	};
	get armed() {
		return this.ctx !== null && this.ctx.state !== "closed";
	}
	/** Create graph + resume. Must run inside a user-gesture stack. */
	arm() {
		if (typeof window === "undefined") return false;
		try {
			if (!this.ctx) {
				const Ctx = window.AudioContext || window.webkitAudioContext;
				if (!Ctx) return false;
				this.ctx = new Ctx({ latencyHint: "interactive" });
				this.buildGraph();
			}
			if (this.ctx.state === "suspended") this.ctx.resume();
			return true;
		} catch {
			return false;
		}
	}
	resumeIfNeeded() {
		if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
	}
	sync(params) {
		this.params = {
			...this.params,
			...params
		};
		const ctx = this.ctx;
		if (!ctx || !this.master) return;
		const t = ctx.currentTime;
		if (params.volume !== void 0) this.master.gain.setTargetAtTime(volumeGain(params.volume), t, .03);
		const cutoff = cutoffHz(this.params.cutoff);
		const q = resonanceQ(this.params.resonance);
		for (const voice of this.voices.values()) {
			if (params.waveform) voice.osc.type = params.waveform;
			if (params.cutoff !== void 0) voice.filter.frequency.setTargetAtTime(cutoff, t, .03);
			if (params.resonance !== void 0) voice.filter.Q.setTargetAtTime(q, t, .03);
		}
	}
	noteOn(midi) {
		const ctx = this.ctx;
		if (!ctx || !this.master) return;
		this.resumeIfNeeded();
		const existing = this.voices.get(midi);
		if (existing) this.killVoice(existing, .02);
		if (this.voices.size >= MAX_VOICES) {
			const oldest = this.order.shift();
			if (oldest !== void 0) {
				const stolen = this.voices.get(oldest);
				if (stolen) this.killVoice(stolen, .04);
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
		const attack = Math.max(.004, envSeconds(this.params.attack));
		const decay = Math.max(.01, envSeconds(this.params.decay));
		const sustain = VOICE_PEAK * this.params.sustain;
		gain.gain.setValueAtTime(0, t);
		gain.gain.linearRampToValueAtTime(VOICE_PEAK, t + attack);
		gain.gain.linearRampToValueAtTime(Math.max(1e-4, sustain), t + attack + decay);
		osc.connect(filter);
		filter.connect(gain);
		gain.connect(this.master);
		osc.start(t);
		const voice = {
			midi,
			osc,
			filter,
			gain,
			startedAt: t,
			releasing: false
		};
		osc.onended = () => {
			this.disposeVoice(voice);
		};
		this.voices.set(midi, voice);
		this.order = this.order.filter((n) => n !== midi);
		this.order.push(midi);
	}
	noteOff(midi) {
		const voice = this.voices.get(midi);
		if (!voice || !this.ctx) return;
		this.releaseVoice(voice);
	}
	allNotesOff() {
		for (const voice of [...this.voices.values()]) this.releaseVoice(voice);
	}
	getWaveform(out) {
		this.analyser?.getByteTimeDomainData(out);
	}
	getByteFrequency(out) {
		this.analyser?.getByteFrequencyData(out);
	}
	buildGraph() {
		const ctx = this.ctx;
		if (!ctx) return;
		const master = ctx.createGain();
		master.gain.value = volumeGain(this.params.volume);
		const compressor = ctx.createDynamicsCompressor();
		compressor.threshold.value = -14;
		compressor.knee.value = 10;
		compressor.ratio.value = 4;
		compressor.attack.value = .004;
		compressor.release.value = .12;
		const analyser = ctx.createAnalyser();
		analyser.fftSize = 2048;
		analyser.smoothingTimeConstant = .45;
		master.connect(compressor);
		compressor.connect(analyser);
		analyser.connect(ctx.destination);
		this.master = master;
		this.compressor = compressor;
		this.analyser = analyser;
	}
	releaseVoice(voice) {
		if (voice.releasing || !this.ctx) return;
		voice.releasing = true;
		const t = this.ctx.currentTime;
		const release = Math.max(.02, envSeconds(this.params.release));
		const g = voice.gain.gain;
		g.cancelScheduledValues(t);
		g.setValueAtTime(Math.max(g.value, 1e-4), t);
		g.linearRampToValueAtTime(0, t + release);
		try {
			voice.osc.stop(t + release + .04);
		} catch {
			this.disposeVoice(voice);
		}
	}
	killVoice(voice, fade) {
		if (!this.ctx) return;
		voice.releasing = true;
		const t = this.ctx.currentTime;
		const g = voice.gain.gain;
		g.cancelScheduledValues(t);
		g.setValueAtTime(Math.max(g.value, 1e-4), t);
		g.linearRampToValueAtTime(0, t + fade);
		try {
			voice.osc.stop(t + fade + .02);
		} catch {
			this.disposeVoice(voice);
		}
	}
	disposeVoice(voice) {
		if (this.voices.get(voice.midi) === voice) this.voices.delete(voice.midi);
		this.order = this.order.filter((n) => n !== voice.midi);
		try {
			voice.osc.disconnect();
			voice.filter.disconnect();
			voice.gain.disconnect();
		} catch {}
	}
};
var engine = null;
function getEngine() {
	if (!engine) engine = new SynthEngine();
	return engine;
}
function pushParams(partial) {
	getEngine().sync(partial);
}
var useSynth = create((set, get) => ({
	...DEFAULTS,
	armed: false,
	activeNotes: [],
	arm: () => {
		if (getEngine().arm()) {
			pushParams(get());
			set({ armed: true });
		}
	},
	setOctave: (octave) => set({ octave: clamp(octave, 1, 6) }),
	shiftOctave: (delta) => set({ octave: clamp(get().octave + delta, 1, 6) }),
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
		if (!activeNotes.includes(midi)) set({ activeNotes: [...activeNotes, midi] });
	},
	noteOff: (midi) => {
		getEngine().noteOff(midi);
		set({ activeNotes: get().activeNotes.filter((n) => n !== midi) });
	},
	panic: () => {
		getEngine().allNotesOff();
		set({ activeNotes: [] });
	}
}));
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap select-none outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40 transition-[scale,background-color,color,opacity] duration-150 ease-out active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			solid: "bg-fg text-bg hover:bg-fg/90",
			ghost: "bg-transparent text-fg hover:bg-fg/8",
			outline: "bg-transparent text-fg shadow-[0_0_0_1px_rgba(236,236,232,0.14)] hover:bg-fg/6",
			accent: "bg-accent text-bg hover:bg-accent/90"
		},
		size: {
			sm: "h-9 rounded-md px-3 text-sm",
			md: "h-10 rounded-lg px-4 text-sm",
			icon: "size-10 rounded-lg"
		}
	},
	defaultVariants: {
		variant: "outline",
		size: "md"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function ArmGate() {
	const armed = useSynth((s) => s.armed);
	const arm = useSynth((s) => s.arm);
	if (armed) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		autoFocus: true,
		onPointerDown: (e) => {
			e.preventDefault();
			arm();
		},
		onClick: () => arm(),
		onKeyDown: (e) => {
			if (e.key === "Tab") return;
			e.preventDefault();
			arm();
		},
		className: "arm-gate fixed inset-0 z-30 flex items-center justify-center p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex max-w-sm flex-col items-center gap-5 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl",
					children: "Auralis"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "max-w-[16rem] text-sm leading-relaxed text-muted text-pretty",
					children: "Analog-voiced poly synth. Arm the engine to start — browsers keep audio silent until you do."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "inline-flex h-11 items-center rounded-lg bg-fg px-5 text-sm font-medium text-bg",
					children: "Arm engine"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-2xs tracking-[0.18em] text-muted uppercase",
					children: "Click anywhere or press a key"
				})
			]
		})
	});
}
function midiFromEl(el) {
	if (!(el instanceof Element)) return null;
	const node = el.closest("[data-midi]");
	if (!node) return null;
	const raw = node.getAttribute("data-midi");
	if (!raw) return null;
	const n = Number(raw);
	return Number.isFinite(n) ? n : null;
}
function Keyboard() {
	const octave = useSynth((s) => s.octave);
	const activeNotes = useSynth((s) => s.activeNotes);
	const noteOn = useSynth((s) => s.noteOn);
	const noteOff = useSynth((s) => s.noteOff);
	const shiftOctave = useSynth((s) => s.shiftOctave);
	const panic = useSynth((s) => s.panic);
	const heldCodes = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const pointers = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const octaveRef = (0, import_react.useRef)(octave);
	octaveRef.current = octave;
	const press = (0, import_react.useCallback)((midi) => {
		const state = useSynth.getState();
		if (!state.armed) state.arm();
		if (!useSynth.getState().armed) return;
		noteOn(midi);
	}, [noteOn]);
	const release = (0, import_react.useCallback)((midi) => {
		noteOff(midi);
	}, [noteOff]);
	(0, import_react.useEffect)(() => {
		const onDown = (e) => {
			if (e.metaKey || e.ctrlKey || e.altKey) return;
			const target = e.target;
			if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
			if (e.code === "BracketLeft") {
				e.preventDefault();
				shiftOctave(-1);
				return;
			}
			if (e.code === "BracketRight") {
				e.preventDefault();
				shiftOctave(1);
				return;
			}
			if (e.code === "Escape") {
				panic();
				return;
			}
			const offset = CODE_TO_OFFSET[e.code];
			if (offset === void 0) return;
			e.preventDefault();
			if (e.repeat || heldCodes.current.has(e.code)) return;
			heldCodes.current.add(e.code);
			press(midiFromOctave(octaveRef.current, offset));
		};
		const onUp = (e) => {
			const offset = CODE_TO_OFFSET[e.code];
			if (offset === void 0) return;
			heldCodes.current.delete(e.code);
			release(midiFromOctave(octaveRef.current, offset));
		};
		const onBlur = () => {
			heldCodes.current.clear();
			panic();
		};
		window.addEventListener("keydown", onDown);
		window.addEventListener("keyup", onUp);
		window.addEventListener("blur", onBlur);
		return () => {
			window.removeEventListener("keydown", onDown);
			window.removeEventListener("keyup", onUp);
			window.removeEventListener("blur", onBlur);
		};
	}, [
		panic,
		press,
		release,
		shiftOctave
	]);
	const onPointerDown = (e) => {
		const midi = midiFromEl(e.target);
		if (midi === null) return;
		e.preventDefault();
		e.currentTarget.setPointerCapture(e.pointerId);
		pointers.current.set(e.pointerId, midi);
		press(midi);
	};
	const onPointerMove = (e) => {
		if (!pointers.current.has(e.pointerId)) return;
		const midi = midiFromEl(document.elementFromPoint(e.clientX, e.clientY));
		const prev = pointers.current.get(e.pointerId);
		if (midi === null || midi === prev) return;
		if (prev !== void 0) release(prev);
		pointers.current.set(e.pointerId, midi);
		press(midi);
	};
	const onPointerUp = (e) => {
		const midi = pointers.current.get(e.pointerId);
		pointers.current.delete(e.pointerId);
		if (midi !== void 0) release(midi);
	};
	const whites = [];
	for (let i = 0; i < 25; i++) if (!isBlackOffset(i)) whites.push({
		offset: i,
		midi: midiFromOctave(octave, i)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "keyboard-board relative isolate overflow-x-auto",
		onPointerDown,
		onPointerMove,
		onPointerUp,
		onPointerCancel: onPointerUp,
		role: "group",
		"aria-label": "Piano keyboard",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "keyboard-keys",
			children: [whites.map((key) => {
				const on = activeNotes.includes(key.midi);
				const pc = key.offset % 12;
				const name = WHITE_NAMES[WHITE_PC.indexOf(pc)] ?? "C";
				const oct = octave + Math.floor(key.offset / 12);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"data-midi": key.midi,
					tabIndex: -1,
					"aria-label": `${name}${oct}`,
					"aria-pressed": on,
					className: cn("key-white", on && "is-on"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "key-letter",
						children: OFFSET_TO_LABEL[key.offset]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "key-name",
						children: [name, pc === 0 ? oct : ""]
					})]
				}, `w-${key.offset}`);
			}), BLACK_OFFSETS.map((offset) => {
				const midi = midiFromOctave(octave, offset);
				const on = activeNotes.includes(midi);
				const left = (whiteIndexBeforeBlack(offset) + 1) / 15 * 100;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"data-midi": midi,
					tabIndex: -1,
					"aria-label": `Sharp ${offset}`,
					"aria-pressed": on,
					className: cn("key-black", on && "is-on"),
					style: { left: `${left}%` },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "key-letter",
						children: OFFSET_TO_LABEL[offset]
					})
				}, `b-${offset}`);
			})]
		})
	});
}
var ANGLE_MIN = -135;
function Knob({ label, value, onChange, display, defaultValue = .5, disabled = false }) {
	const id = (0, import_react.useId)();
	const drag = (0, import_react.useRef)(null);
	const rootRef = (0, import_react.useRef)(null);
	const angle = ANGLE_MIN + clamp01(value) * 270;
	const onPointerDown = (0, import_react.useCallback)((e) => {
		if (disabled) return;
		e.preventDefault();
		e.currentTarget.setPointerCapture(e.pointerId);
		drag.current = {
			startY: e.clientY,
			start: value
		};
	}, [disabled, value]);
	const onPointerMove = (0, import_react.useCallback)((e) => {
		if (!drag.current) return;
		const dy = drag.current.startY - e.clientY;
		onChange(clamp01(drag.current.start + dy / 130));
	}, [onChange]);
	const onPointerUp = (0, import_react.useCallback)(() => {
		drag.current = null;
	}, []);
	const onDoubleClick = (0, import_react.useCallback)(() => {
		if (!disabled) onChange(defaultValue);
	}, [
		defaultValue,
		disabled,
		onChange
	]);
	const onKeyDown = (0, import_react.useCallback)((e) => {
		if (disabled) return;
		const step = e.shiftKey ? .08 : .02;
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
	}, [
		disabled,
		onChange,
		value
	]);
	(0, import_react.useEffect)(() => {
		const el = rootRef.current;
		if (!el) return;
		const onWheel = (e) => {
			if (disabled) return;
			e.preventDefault();
			onChange(clamp01(value + (e.deltaY > 0 ? -1 : 1) * .025));
		};
		el.addEventListener("wheel", onWheel, { passive: false });
		return () => el.removeEventListener("wheel", onWheel);
	}, [
		disabled,
		onChange,
		value
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex w-16 flex-col items-center gap-1.5 sm:w-[4.5rem]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				id,
				className: "font-mono text-2xs font-medium tracking-[0.16em] text-muted uppercase",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: rootRef,
				role: "slider",
				"aria-labelledby": id,
				"aria-valuemin": 0,
				"aria-valuemax": 100,
				"aria-valuenow": Math.round(value * 100),
				"aria-valuetext": display,
				"aria-disabled": disabled,
				tabIndex: disabled ? -1 : 0,
				onPointerDown,
				onPointerMove,
				onPointerUp,
				onPointerCancel: onPointerUp,
				onDoubleClick,
				onKeyDown,
				className: cn("relative size-14 touch-none sm:size-16", disabled ? "cursor-default opacity-50" : "cursor-ns-resize"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					viewBox: "0 0 80 80",
					className: "size-full",
					"aria-hidden": "true",
					children: [
						Array.from({ length: 11 }, (_, i) => {
							const a = (ANGLE_MIN + i / 10 * 270) * Math.PI / 180;
							const x1 = 40 + Math.cos(a) * 34;
							const y1 = 40 + Math.sin(a) * 34;
							const x2 = 40 + Math.cos(a) * 38;
							const y2 = 40 + Math.sin(a) * 38;
							const lit = i / 10 <= value + .001;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1,
								y1,
								x2,
								y2,
								stroke: lit ? "var(--color-accent)" : "var(--color-tick)",
								strokeWidth: "1.5",
								strokeLinecap: "round"
							}, i);
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "40",
							cy: "40",
							r: "26",
							fill: "var(--color-knob)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "40",
							cy: "40",
							r: "26",
							fill: "none",
							stroke: "var(--color-knob-ring)",
							strokeWidth: "1"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "40",
							cy: "28",
							r: "7",
							fill: "var(--color-knob-sheen)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
							transform: `rotate(${angle} 40 40)`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: "40",
								y1: "22",
								x2: "40",
								y2: "34",
								stroke: "var(--color-fg)",
								strokeWidth: "2.4",
								strokeLinecap: "round"
							})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-[0.6875rem] tabular-nums text-fg",
				children: display
			})
		]
	});
}
var SEGMENTS = 12;
function LevelMeter({ armed }) {
	const trackRef = (0, import_react.useRef)(null);
	const peakHold = (0, import_react.useRef)(0);
	const peakDecay = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		const track = trackRef.current;
		if (!track) return;
		const cells = [...track.querySelectorAll("[data-seg]")];
		const data = /* @__PURE__ */ new Uint8Array(2048);
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
			} else if (peakDecay.current > 0) peakDecay.current -= 1;
			else peakHold.current = Math.max(0, peakHold.current - .012);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-2xs font-medium tracking-[0.16em] text-muted uppercase",
			children: "Lvl"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: trackRef,
			className: "flex h-28 w-4 flex-col-reverse gap-0.5 sm:h-32",
			"aria-hidden": "true",
			children: Array.from({ length: SEGMENTS }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-seg": true,
				"data-on": "0",
				className: "meter-seg min-h-0 flex-1 rounded-[1px]"
			}, i))
		})]
	});
}
var SAMPLES = 160;
function Oscilloscope({ armed }) {
	const lineRef = (0, import_react.useRef)(null);
	const frameRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const line = lineRef.current;
		const frame = frameRef.current;
		if (!line || !frame) return;
		const data = /* @__PURE__ */ new Uint8Array(2048);
		let raf = 0;
		const draw = () => {
			raf = requestAnimationFrame(draw);
			const width = frame.width.baseVal.value || 320;
			const height = frame.height.baseVal.value || 112;
			if (!armed) {
				line.setAttribute("points", `0,${height / 2} ${width},${height / 2}`);
				return;
			}
			const engine = getEngine();
			if (!engine.analyser) return;
			engine.getWaveform(data);
			const mid = height / 2;
			const amp = height * .42;
			const step = Math.max(1, Math.floor(data.length / SAMPLES));
			const slice = width / 159;
			const pts = [];
			for (let i = 0; i < SAMPLES; i++) {
				const v = data[i * step] / 128 - 1;
				pts.push(`${(i * slice).toFixed(1)},${(mid + v * amp).toFixed(1)}`);
			}
			line.setAttribute("points", pts.join(" "));
		};
		raf = requestAnimationFrame(draw);
		return () => cancelAnimationFrame(raf);
	}, [armed]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "scope-well relative h-28 overflow-hidden rounded-xl sm:h-32",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			className: "size-full",
			viewBox: "0 0 320 112",
			preserveAspectRatio: "none",
			"aria-hidden": "true",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					ref: frameRef,
					width: "320",
					height: "112",
					fill: "none"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "0",
					y1: "56",
					x2: "320",
					y2: "56",
					stroke: "rgba(236,236,232,0.08)",
					strokeWidth: "1"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
					ref: lineRef,
					fill: "none",
					stroke: "var(--color-accent)",
					strokeWidth: "1.6",
					strokeLinejoin: "round",
					strokeLinecap: "round",
					points: "0,56 320,56"
				})
			]
		}), !armed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-2xs tracking-[0.2em] text-muted uppercase",
			children: "Standby"
		})]
	});
}
var PATHS = {
	sine: "M2 12 C6 12 8 4 12 4 C16 4 16 20 20 20 C24 20 26 12 30 12",
	square: "M2 20 V4 H16 V20 H30",
	sawtooth: "M2 20 L16 4 V20 L30 4",
	triangle: "M2 20 L10 4 L22 20 L30 8"
};
function WaveformSelect({ value, onChange, disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "radiogroup",
		"aria-label": "Waveform",
		className: "flex flex-col gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-2xs font-medium tracking-[0.16em] text-muted uppercase",
			children: "Wave"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-4 gap-1.5 sm:grid-cols-2 sm:gap-2",
			children: WAVEFORMS.map((w) => {
				const on = w.id === value;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					role: "radio",
					"aria-checked": on,
					disabled,
					onClick: () => onChange(w.id),
					className: cn("wave-btn", "focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:outline-none", on && "is-on"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
						viewBox: "0 0 32 24",
						className: "h-5 w-8",
						fill: "none",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: PATHS[w.id],
							stroke: "currentColor",
							strokeWidth: "1.8",
							strokeLinecap: "round",
							strokeLinejoin: "round"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-2xs tracking-[0.12em] uppercase",
						children: w.label
					})]
				}, w.id);
			})
		})]
	});
}
function SynthApp() {
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
	(0, import_react.useEffect)(() => {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-dvh flex-col bg-bg text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto flex w-full max-w-[68rem] flex-1 flex-col justify-center px-3 py-4 sm:px-6 sm:py-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "chassis relative flex flex-col gap-5 p-4 sm:gap-6 sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArmGate, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "flex flex-wrap items-end justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-2xs tracking-[0.22em] text-muted uppercase",
								children: "Poly synth"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl",
								children: "Auralis"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: armed ? "led led-on" : "led",
									"aria-hidden": "true"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-2xs tracking-[0.16em] text-muted uppercase",
									children: armed ? "Armed" : "Standby"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-2xs tracking-[0.16em] text-muted uppercase",
										children: "Oct"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "outline",
										size: "icon",
										className: "size-9",
										"aria-label": "Octave down",
										disabled: !armed || octave <= 1,
										onClick: () => shiftOctave(-1),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-4" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-6 text-center font-mono text-sm tabular-nums",
										children: octave
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "outline",
										size: "icon",
										className: "size-9",
										"aria-label": "Octave up",
										disabled: !armed || octave >= 6,
										onClick: () => shiftOctave(1),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
									})
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-5 lg:grid-cols-[1fr_18rem] lg:items-start",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-col gap-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-5 sm:grid-cols-[8.5rem_1fr]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WaveformSelect, {
									value: waveform,
									onChange: setWaveform,
									disabled: !armed
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ControlGroup, {
										title: "Filter",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Knob, {
											label: "Cutoff",
											value: cutoff,
											onChange: setCutoff,
											display: formatHz(cutoff),
											defaultValue: .62,
											disabled: !armed
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Knob, {
											label: "Reso",
											value: resonance,
											onChange: setResonance,
											display: formatQ(resonance),
											defaultValue: .2,
											disabled: !armed
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ControlGroup, {
										title: "Envelope",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Knob, {
												label: "Atk",
												value: attack,
												onChange: setAttack,
												display: formatEnv(attack),
												defaultValue: .12,
												disabled: !armed
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Knob, {
												label: "Dec",
												value: decay,
												onChange: setDecay,
												display: formatEnv(decay),
												defaultValue: .28,
												disabled: !armed
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Knob, {
												label: "Sus",
												value: sustain,
												onChange: setSustain,
												display: formatPct(sustain),
												defaultValue: .72,
												disabled: !armed
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Knob, {
												label: "Rel",
												value: release,
												onChange: setRelease,
												display: formatEnv(release),
												defaultValue: .32,
												disabled: !armed
											})
										]
									})]
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mb-2 block font-mono text-2xs font-medium tracking-[0.16em] text-muted uppercase",
									children: "Scope"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Oscilloscope, { armed })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Knob, {
									label: "Vol",
									value: volume,
									onChange: setVolume,
									display: formatPct(volume),
									defaultValue: .62,
									disabled: !armed
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelMeter, { armed })]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keyboard, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center font-mono text-2xs leading-relaxed tracking-[0.08em] text-muted uppercase",
						children: "Z–M lower · Q–I upper · [ ] octave · Esc silence"
					})
				]
			})
		})
	});
}
function ControlGroup({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-2xs font-medium tracking-[0.16em] text-muted uppercase",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap items-start gap-3 sm:gap-4",
			children
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SynthApp, {});
}
//#endregion
export { Home as component };
