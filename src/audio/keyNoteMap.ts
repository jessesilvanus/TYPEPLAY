/**
 * TYPEPLAY — Key-to-note mapping
 * ==========================================================================
 * Deterministic physical-key mapping for the procedural piano. It covers the
 * typeable US-QWERTY keys used by TYPEPLAY without coupling audio to React or
 * the typing engine.
 */

export interface PianoKeyNote {
  key: string;
  midi: number;
  name: string;
}

const KEYBOARD_ORDER = [
  '`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=',
  'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\',
  'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'",
  'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', ' ',
] as const;

const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'] as const;
const START_MIDI = 48;

function normaliseKey(key: string): string {
  if (key === ' ') return key;
  return key.toLowerCase();
}

function midiToName(midi: number): string {
  const noteName = NOTE_NAMES[midi % NOTE_NAMES.length];
  const octave = Math.floor(midi / 12) - 1;
  return `${noteName}${octave}`;
}

const KEY_TO_NOTE = new Map<string, PianoKeyNote>(
  KEYBOARD_ORDER.map((key, index) => {
    const midi = START_MIDI + index;
    return [key, { key, midi, name: midiToName(midi) }];
  }),
);

/** Return the piano note assigned to a printable physical typing key. */
export function getPianoKeyNote(key: string): PianoKeyNote | null {
  return KEY_TO_NOTE.get(normaliseKey(key)) ?? null;
}

/** Convert a MIDI note number to frequency in hertz. */
export function midiToFrequency(midi: number): number {
  return 440 * (2 ** ((midi - 69) / 12));
}
