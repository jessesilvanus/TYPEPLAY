/**
 * TYPEPLAY — Practice Passages
 * ==========================================================================
 * Curated text passages used as typing material in Phase 2. These are plain
 * strings keyed by an id so later phases (lessons, adaptive learning) can
 * extend the system without touching the engine interface.
 *
 * Design notes:
 *   - Passages are real, readable English — never random word salad.
 *   - Punctuation is included so users practice real-world typing.
 *   - Difficulty labels here are advisory only; the typing engine itself
 *     treats all text identically and stays mode-agnostic.
 */

export type PassageDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Passage {
  /** Stable identifier for selection and history. */
  id: string;
  /** Short human label shown in the UI. */
  title: string;
  /** Advisory difficulty — does not change engine behaviour. */
  difficulty: PassageDifficulty;
  /** The text the user types. */
  text: string;
}

export const PASSAGES: Passage[] = [
  {
    id: 'first-light',
    title: 'First Light',
    difficulty: 'beginner',
    text: 'The early morning sun cast a gentle glow across the quiet room. Slowly, the day began to wake up.',
  },
  {
    id: 'steady-hands',
    title: 'Steady Hands',
    difficulty: 'beginner',
    text: 'Place your fingers on the home row and breathe. Type each letter with care, and let the rhythm come to you.',
  },
  {
    id: 'old-roads',
    title: 'Old Roads',
    difficulty: 'intermediate',
    text: 'The old road wound through the hills, past farms and forests, until it reached the sea. Travelers walked it for centuries.',
  },
  {
    id: 'the-workshop',
    title: 'The Workshop',
    difficulty: 'intermediate',
    text: 'In the workshop, every tool had its place: the hammer on the wall, the saw beside the bench, and the chisels in a row.',
  },
  {
    id: 'music-and-motion',
    title: 'Music and Motion',
    difficulty: 'advanced',
    text: "Music is not merely sound; it is motion shaped by intention. Each note, each rest, carries weight — together they form a language older than words.",
  },
  {
    id: 'the-quick-fox',
    title: 'The Quick Fox',
    difficulty: 'advanced',
    text: 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. Sphinx of black quartz, judge my vow.',
  },
];

/** Default passage used when none is explicitly chosen. */
export const DEFAULT_PASSAGE_ID = 'first-light';

/** Looks up a passage by id, falling back to the default passage. */
export function getPassage(id: string | null | undefined): Passage {
  if (id) {
    const found = PASSAGES.find((p) => p.id === id);
    if (found) return found;
  }
  const fallback = PASSAGES.find((p) => p.id === DEFAULT_PASSAGE_ID);
  return fallback ?? PASSAGES[0];
}

/** Returns passages filtered by difficulty. */
export function getPassagesByDifficulty(difficulty: PassageDifficulty): Passage[] {
  return PASSAGES.filter((p) => p.difficulty === difficulty);
}
