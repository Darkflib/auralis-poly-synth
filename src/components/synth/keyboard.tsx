import { useCallback, useEffect, useRef } from "react";
import {
  BLACK_OFFSETS,
  CODE_TO_OFFSET,
  isBlackOffset,
  KEY_COUNT,
  midiFromOctave,
  OFFSET_TO_LABEL,
  WHITE_COUNT,
  WHITE_NAMES,
  WHITE_PC,
  whiteIndexBeforeBlack,
} from "@/lib/synth/notes";
import { useSynth } from "@/lib/synth/store";
import { cn } from "@/lib/utils";

function midiFromEl(el: EventTarget | null): number | null {
  if (!(el instanceof Element)) return null;
  const node = el.closest("[data-midi]");
  if (!node) return null;
  const raw = node.getAttribute("data-midi");
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function Keyboard() {
  const octave = useSynth((s) => s.octave);
  const activeNotes = useSynth((s) => s.activeNotes);
  const noteOn = useSynth((s) => s.noteOn);
  const noteOff = useSynth((s) => s.noteOff);
  const shiftOctave = useSynth((s) => s.shiftOctave);
  const panic = useSynth((s) => s.panic);

  const heldCodes = useRef(new Set<string>());
  const pointers = useRef(new Map<number, number>());
  const octaveRef = useRef(octave);
  octaveRef.current = octave;

  const press = useCallback(
    (midi: number) => {
      const state = useSynth.getState();
      if (!state.armed) state.arm();
      if (!useSynth.getState().armed) return;
      noteOn(midi);
    },
    [noteOn],
  );
  const release = useCallback(
    (midi: number) => {
      noteOff(midi);
    },
    [noteOff],
  );

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
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
      if (offset === undefined) return;
      e.preventDefault();
      if (e.repeat || heldCodes.current.has(e.code)) return;
      heldCodes.current.add(e.code);
      press(midiFromOctave(octaveRef.current, offset));
    };
    const onUp = (e: KeyboardEvent) => {
      const offset = CODE_TO_OFFSET[e.code];
      if (offset === undefined) return;
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
  }, [panic, press, release, shiftOctave]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const midi = midiFromEl(e.target);
    if (midi === null) return;
    e.preventDefault();
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, midi);
    press(midi);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const midi = midiFromEl(el);
    const prev = pointers.current.get(e.pointerId);
    if (midi === null || midi === prev) return;
    if (prev !== undefined) release(prev);
    pointers.current.set(e.pointerId, midi);
    press(midi);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const midi = pointers.current.get(e.pointerId);
    pointers.current.delete(e.pointerId);
    if (midi !== undefined) release(midi);
  };

  const whites: { offset: number; midi: number }[] = [];
  for (let i = 0; i < KEY_COUNT; i++) {
    if (!isBlackOffset(i)) {
      whites.push({ offset: i, midi: midiFromOctave(octave, i) });
    }
  }

  return (
    <div
      className="keyboard-board relative isolate overflow-x-auto"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="group"
      aria-label="Piano keyboard"
    >
      <div className="keyboard-keys">
        {whites.map((key) => {
          const on = activeNotes.includes(key.midi);
          const pc = key.offset % 12;
          const name = WHITE_NAMES[WHITE_PC.indexOf(pc as (typeof WHITE_PC)[number])] ?? "C";
          const oct = octave + Math.floor(key.offset / 12);
          return (
            <button
              key={`w-${key.offset}`}
              type="button"
              data-midi={key.midi}
              tabIndex={-1}
              aria-label={`${name}${oct}`}
              aria-pressed={on}
              className={cn("key-white", on && "is-on")}
            >
              <span className="key-letter">{OFFSET_TO_LABEL[key.offset]}</span>
              <span className="key-name">
                {name}
                {pc === 0 ? oct : ""}
              </span>
            </button>
          );
        })}
        {BLACK_OFFSETS.map((offset) => {
          const midi = midiFromOctave(octave, offset);
          const on = activeNotes.includes(midi);
          const whiteIdx = whiteIndexBeforeBlack(offset);
          const left = ((whiteIdx + 1) / WHITE_COUNT) * 100;
          return (
            <button
              key={`b-${offset}`}
              type="button"
              data-midi={midi}
              tabIndex={-1}
              aria-label={`Sharp ${offset}`}
              aria-pressed={on}
              className={cn("key-black", on && "is-on")}
              style={{ left: `${left}%` }}
            >
              <span className="key-letter">{OFFSET_TO_LABEL[offset]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
