export const WHITE_PC = [0, 2, 4, 5, 7, 9, 11] as const;
export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
export const WHITE_NAMES = ["C", "D", "E", "F", "G", "A", "B"] as const;

/** Two octaves plus the top C — 25 keys, 15 white. */
export const KEY_COUNT = 25;
export const WHITE_COUNT = 15;

/** Chromatic offsets of black keys on the 25-key board. */
export const BLACK_OFFSETS = [1, 3, 6, 8, 10, 13, 15, 18, 20, 22] as const;

/**
 * Computer-keyboard map, Ableton/GarageBand style.
 * Lower row = current octave, upper row = octave + 1, I = top C.
 */
export const CODE_TO_OFFSET: Record<string, number> = {
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
  KeyI: 24,
};

export const OFFSET_TO_LABEL: Record<number, string> = {
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
  24: "I",
};

export function midiFromOctave(octave: number, offset: number): number {
  return (octave + 1) * 12 + offset;
}

export function midiToHz(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function isBlackOffset(offset: number): boolean {
  const pc = offset % 12;
  return pc === 1 || pc === 3 || pc === 6 || pc === 8 || pc === 10;
}

/** White-key index (0–14) that a black key sits after. */
export function whiteIndexBeforeBlack(blackOffset: number): number {
  let whites = 0;
  for (let i = 0; i < blackOffset; i++) {
    if (!isBlackOffset(i)) whites += 1;
  }
  return whites - 1;
}
