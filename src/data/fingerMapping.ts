/**
 * TYPEPLAY — Finger Mapping
 * ==========================================================================
 * Centralized QWERTY keyboard finger-to-key mapping for standard touch typing.
 * This is the single source of truth for which finger presses which key.
 *
 * All key guidance, keyboard highlighting, and finger visualization derive
 * from this mapping. Do not hard-code finger information elsewhere.
 */

import type { Hand, KeyMapping } from '../types/learning';

export type Finger =
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky'
  | 'thumbs';

/**
 * Complete mapping of every typeable key to its assigned finger, hand, and row.
 * Includes both unshifted and shifted variants where they differ.
 */
export const KEY_MAPPINGS: KeyMapping[] = [
  /* ----------------------------------------------------------------------
   * NUMBER ROW (digits + symbols)
   * ---------------------------------------------------------------------- */
  { key: '`', finger: 'left-pinky', hand: 'left', row: 'number' },
  { key: '~', finger: 'left-pinky', hand: 'left', row: 'number', shifted: true },

  { key: '1', finger: 'left-pinky', hand: 'left', row: 'number' },
  { key: '!', finger: 'left-pinky', hand: 'left', row: 'number', shifted: true },

  { key: '2', finger: 'left-ring', hand: 'left', row: 'number' },
  { key: '@', finger: 'left-ring', hand: 'left', row: 'number', shifted: true },

  { key: '3', finger: 'left-middle', hand: 'left', row: 'number' },
  { key: '#', finger: 'left-middle', hand: 'left', row: 'number', shifted: true },

  { key: '4', finger: 'left-index', hand: 'left', row: 'number' },
  { key: '$', finger: 'left-index', hand: 'left', row: 'number', shifted: true },

  { key: '5', finger: 'left-index', hand: 'left', row: 'number' },
  { key: '%', finger: 'left-index', hand: 'left', row: 'number', shifted: true },

  { key: '6', finger: 'right-index', hand: 'right', row: 'number' },
  { key: '^', finger: 'right-index', hand: 'right', row: 'number', shifted: true },

  { key: '7', finger: 'right-index', hand: 'right', row: 'number' },
  { key: '&', finger: 'right-index', hand: 'right', row: 'number', shifted: true },

  { key: '8', finger: 'right-middle', hand: 'right', row: 'number' },
  { key: '*', finger: 'right-middle', hand: 'right', row: 'number', shifted: true },

  { key: '9', finger: 'right-ring', hand: 'right', row: 'number' },
  { key: '(', finger: 'right-ring', hand: 'right', row: 'number', shifted: true },

  { key: '0', finger: 'right-pinky', hand: 'right', row: 'number' },
  { key: ')', finger: 'right-pinky', hand: 'right', row: 'number', shifted: true },

  { key: '-', finger: 'right-pinky', hand: 'right', row: 'number' },
  { key: '_', finger: 'right-pinky', hand: 'right', row: 'number', shifted: true },

  { key: '=', finger: 'right-pinky', hand: 'right', row: 'number' },
  { key: '+', finger: 'right-pinky', hand: 'right', row: 'number', shifted: true },

  /* ----------------------------------------------------------------------
   * TOP ROW (QWERTYUIOP)
   * ---------------------------------------------------------------------- */
  { key: 'q', finger: 'left-pinky', hand: 'left', row: 'top' },
  { key: 'Q', finger: 'left-pinky', hand: 'left', row: 'top', shifted: true },

  { key: 'w', finger: 'left-ring', hand: 'left', row: 'top' },
  { key: 'W', finger: 'left-ring', hand: 'left', row: 'top', shifted: true },

  { key: 'e', finger: 'left-middle', hand: 'left', row: 'top' },
  { key: 'E', finger: 'left-middle', hand: 'left', row: 'top', shifted: true },

  { key: 'r', finger: 'left-index', hand: 'left', row: 'top' },
  { key: 'R', finger: 'left-index', hand: 'left', row: 'top', shifted: true },

  { key: 't', finger: 'left-index', hand: 'left', row: 'top' },
  { key: 'T', finger: 'left-index', hand: 'left', row: 'top', shifted: true },

  { key: 'y', finger: 'right-index', hand: 'right', row: 'top' },
  { key: 'Y', finger: 'right-index', hand: 'right', row: 'top', shifted: true },

  { key: 'u', finger: 'right-index', hand: 'right', row: 'top' },
  { key: 'U', finger: 'right-index', hand: 'right', row: 'top', shifted: true },

  { key: 'i', finger: 'right-middle', hand: 'right', row: 'top' },
  { key: 'I', finger: 'right-middle', hand: 'right', row: 'top', shifted: true },

  { key: 'o', finger: 'right-ring', hand: 'right', row: 'top' },
  { key: 'O', finger: 'right-ring', hand: 'right', row: 'top', shifted: true },

  { key: 'p', finger: 'right-pinky', hand: 'right', row: 'top' },
  { key: 'P', finger: 'right-pinky', hand: 'right', row: 'top', shifted: true },

  { key: '[', finger: 'right-pinky', hand: 'right', row: 'top' },
  { key: '{', finger: 'right-pinky', hand: 'right', row: 'top', shifted: true },

  { key: ']', finger: 'right-pinky', hand: 'right', row: 'top' },
  { key: '}', finger: 'right-pinky', hand: 'right', row: 'top', shifted: true },

  { key: '\\', finger: 'right-pinky', hand: 'right', row: 'top' },
  { key: '|', finger: 'right-pinky', hand: 'right', row: 'top', shifted: true },

  /* ----------------------------------------------------------------------
   * HOME ROW (ASDFGHJKL;)
   * ---------------------------------------------------------------------- */
  { key: 'a', finger: 'left-pinky', hand: 'left', row: 'home' },
  { key: 'A', finger: 'left-pinky', hand: 'left', row: 'home', shifted: true },

  { key: 's', finger: 'left-ring', hand: 'left', row: 'home' },
  { key: 'S', finger: 'left-ring', hand: 'left', row: 'home', shifted: true },

  { key: 'd', finger: 'left-middle', hand: 'left', row: 'home' },
  { key: 'D', finger: 'left-middle', hand: 'left', row: 'home', shifted: true },

  { key: 'f', finger: 'left-index', hand: 'left', row: 'home' },
  { key: 'F', finger: 'left-index', hand: 'left', row: 'home', shifted: true },

  { key: 'g', finger: 'left-index', hand: 'left', row: 'home' },
  { key: 'G', finger: 'left-index', hand: 'left', row: 'home', shifted: true },

  { key: 'h', finger: 'right-index', hand: 'right', row: 'home' },
  { key: 'H', finger: 'right-index', hand: 'right', row: 'home', shifted: true },

  { key: 'j', finger: 'right-index', hand: 'right', row: 'home' },
  { key: 'J', finger: 'right-index', hand: 'right', row: 'home', shifted: true },

  { key: 'k', finger: 'right-middle', hand: 'right', row: 'home' },
  { key: 'K', finger: 'right-middle', hand: 'right', row: 'home', shifted: true },

  { key: 'l', finger: 'right-ring', hand: 'right', row: 'home' },
  { key: 'L', finger: 'right-ring', hand: 'right', row: 'home', shifted: true },

  { key: ';', finger: 'right-pinky', hand: 'right', row: 'home' },
  { key: ':', finger: 'right-pinky', hand: 'right', row: 'home', shifted: true },

  { key: "'", finger: 'right-pinky', hand: 'right', row: 'home' },
  { key: '"', finger: 'right-pinky', hand: 'right', row: 'home', shifted: true },

  /* ----------------------------------------------------------------------
   * BOTTOM ROW (ZXCVBNM,./)
   * ---------------------------------------------------------------------- */
  { key: 'z', finger: 'left-pinky', hand: 'left', row: 'bottom' },
  { key: 'Z', finger: 'left-pinky', hand: 'left', row: 'bottom', shifted: true },

  { key: 'x', finger: 'left-ring', hand: 'left', row: 'bottom' },
  { key: 'X', finger: 'left-ring', hand: 'left', row: 'bottom', shifted: true },

  { key: 'c', finger: 'left-middle', hand: 'left', row: 'bottom' },
  { key: 'C', finger: 'left-middle', hand: 'left', row: 'bottom', shifted: true },

  { key: 'v', finger: 'left-index', hand: 'left', row: 'bottom' },
  { key: 'V', finger: 'left-index', hand: 'left', row: 'bottom', shifted: true },

  { key: 'b', finger: 'left-index', hand: 'left', row: 'bottom' },
  { key: 'B', finger: 'left-index', hand: 'left', row: 'bottom', shifted: true },

  { key: 'n', finger: 'right-index', hand: 'right', row: 'bottom' },
  { key: 'N', finger: 'right-index', hand: 'right', row: 'bottom', shifted: true },

  { key: 'm', finger: 'right-index', hand: 'right', row: 'bottom' },
  { key: 'M', finger: 'right-index', hand: 'right', row: 'bottom', shifted: true },

  { key: ',', finger: 'right-middle', hand: 'right', row: 'bottom' },
  { key: '<', finger: 'right-middle', hand: 'right', row: 'bottom', shifted: true },

  { key: '.', finger: 'right-ring', hand: 'right', row: 'bottom' },
  { key: '>', finger: 'right-ring', hand: 'right', row: 'bottom', shifted: true },

  { key: '/', finger: 'right-pinky', hand: 'right', row: 'bottom' },
  { key: '?', finger: 'right-pinky', hand: 'right', row: 'bottom', shifted: true },

  /* ----------------------------------------------------------------------
   * SPACE ROW
   * ---------------------------------------------------------------------- */
  { key: ' ', finger: 'thumbs', hand: 'both', row: 'space' },

  /* ----------------------------------------------------------------------
   * MODIFIER KEYS (for reference — not typically typed in exercises)
   * ---------------------------------------------------------------------- */
  { key: 'Shift', finger: 'left-pinky', hand: 'left', row: 'modifier' },
  { key: 'Shift', finger: 'right-pinky', hand: 'right', row: 'modifier' },
  { key: 'Control', finger: 'left-pinky', hand: 'left', row: 'modifier' },
  { key: 'Alt', finger: 'thumbs', hand: 'both', row: 'modifier' },
  { key: 'Tab', finger: 'left-pinky', hand: 'left', row: 'modifier' },
  { key: 'CapsLock', finger: 'left-pinky', hand: 'left', row: 'modifier' },
  { key: 'Enter', finger: 'right-pinky', hand: 'right', row: 'modifier' },
  { key: 'Backspace', finger: 'right-pinky', hand: 'right', row: 'modifier' },
];

/* ----------------------------------------------------------------------
 * Helper functions
 * ---------------------------------------------------------------------- */

/**
 * Look up the finger assigned to a specific character.
 * Handles both lowercase and uppercase by checking shifted mappings.
 */
export function getFingerForKey(char: string): Finger | null {
  if (!char) return null;

  // First try exact match
  const exact = KEY_MAPPINGS.find((m) => m.key === char);
  if (exact) return exact.finger;

  // Fallback: try case-insensitive for letters
  const lower = char.toLowerCase();
  const ciMatch = KEY_MAPPINGS.find(
    (m) => m.key.toLowerCase() === lower && !m.shifted,
  );
  if (ciMatch) return ciMatch.finger;

  return null;
}

/**
 * Get all keys assigned to a specific finger.
 * Returns the base (unshifted) keys only.
 */
export function getKeysForFinger(finger: Finger): string[] {
  return KEY_MAPPINGS.filter((m) => m.finger === finger && !m.shifted)
    .map((m) => m.key);
}

/**
 * Get all keys for a specific hand.
 */
export function getKeysForHand(hand: Hand): string[] {
  if (hand === 'both') {
    return KEY_MAPPINGS.filter((m) => !m.shifted).map((m) => m.key);
  }
  return KEY_MAPPINGS.filter((m) => m.hand === hand && !m.shifted)
    .map((m) => m.key);
}

/**
 * Get the display label for a finger (e.g., "LEFT INDEX").
 */
export function getFingerLabel(finger: Finger): string {
  const labels: Record<Finger, string> = {
    'left-pinky': 'LEFT PINKY',
    'left-ring': 'LEFT RING',
    'left-middle': 'LEFT MIDDLE',
    'left-index': 'LEFT INDEX',
    'right-index': 'RIGHT INDEX',
    'right-middle': 'RIGHT MIDDLE',
    'right-ring': 'RIGHT RING',
    'right-pinky': 'RIGHT PINKY',
    thumbs: 'THUMBS',
  };
  return labels[finger];
}

/**
 * Get the hand side for a finger.
 */
export function getHandForFinger(finger: Finger): 'left' | 'right' | 'both' {
  if (finger === 'thumbs') return 'both';
  if (finger.startsWith('left-')) return 'left';
  return 'right';
}

/**
 * Get all fingers for a given hand side.
 */
export function getFingersForHand(hand: 'left' | 'right'): Finger[] {
  if (hand === 'left') {
    return ['left-pinky', 'left-ring', 'left-middle', 'left-index'];
  }
  return ['right-index', 'right-middle', 'right-ring', 'right-pinky'];
}

/**
 * Keyboard row definitions for rendering the InteractiveKeyboard.
 * Each row is an array of key labels (what to render on the keycap).
 */
export const KEYBOARD_ROWS = [
  // Number row
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  // Top row (QWERTY)
  ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  // Home row
  ['CapsLock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
  // Bottom row
  ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
  // Space row
  ['Control', 'Alt', ' ', 'Alt', 'Control'],
] as const;

/**
 * Type for keyboard row arrays.
 */
export type KeyboardRow = (typeof KEYBOARD_ROWS)[number];

/**
 * Get the display label for a key (used on keycaps).
 * Special keys get abbreviated labels.
 */
export function getKeyDisplayLabel(key: string): string {
  const labels: Record<string, string> = {
    ' ': 'SPACE',
    'Backspace': 'BACKSPACE',
    'Enter': 'ENTER',
    'Shift': 'SHIFT',
    'Control': 'CTRL',
    'Alt': 'ALT',
    'Tab': 'TAB',
    'CapsLock': 'CAPS',
    '`': '`',
  };
  return labels[key] ?? key.toUpperCase();
}