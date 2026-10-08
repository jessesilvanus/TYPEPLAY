/**
 * TYPEPLAY — Learning System Types
 * ==========================================================================
 * Type definitions for the touch-typing learning system: lessons,
 * finger mapping, progress tracking, and lesson status.
 */

/** Standard touch-typing fingers. */
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

/** Hand side. */
export type Hand = 'left' | 'right' | 'both';

/** Keyboard row classification. */
export type KeyRow = 'number' | 'top' | 'home' | 'bottom' | 'space' | 'modifier';

/** A single key-to-finger mapping. */
export interface KeyMapping {
  /** The character this key produces (e.g., 'a', 'A', '1', 'Shift'). */
  key: string;
  /** Which finger presses this key. */
  finger: Finger;
  /** Which hand side. */
  hand: Hand;
  /** Which row the key sits on. */
  row: KeyRow;
  /** Whether Shift is required. */
  shifted?: boolean;
}

/** Lesson difficulty level. */
export type LessonDifficulty = 'beginner' | 'intermediate' | 'advanced';

/** Status of a lesson for a learner. */
export type LessonStatus = 'locked' | 'available' | 'in-progress' | 'completed';

/** A structured touch-typing lesson. */
export interface Lesson {
  /** Stable identifier. */
  id: string;
  /** Display order number (1-9). */
  number: number;
  /** Short human-friendly title. */
  title: string;
  /** Instructional description. */
  description: string;
  /** Difficulty label. */
  difficulty: LessonDifficulty;
  /** Keys introduced or practiced in this lesson. */
  keys: string[];
  /** Which fingers are targeted. */
  fingerTargets: Finger[];
  /** The exact text the learner types. */
  practiceText: string;
  /** Minimum accuracy required to complete (0-100). */
  minimumAccuracy: number;
  /** Lesson that must be completed first, if any. */
  prerequisite?: string;
}

/** Progress record for a single lesson. */
export interface LessonProgress {
  lessonId: string;
  status: LessonStatus;
  attempts: number;
  bestAccuracy: number;
  bestWPM: number;
  /** ISO timestamp when the lesson was completed, if ever. */
  completedAt?: string;
}

/** Storage keys for learning persistence. */
export const STORAGE_KEYS = {
  learning: 'typeplay:learning',
} as const;

/** The entire persisted learning state. */
export interface LearningState {
  /** ID of the lesson currently being practiced, if any. */
  currentLessonId: string | null;
  /** Mapping of lessonId → progress. */
  lessonProgress: Record<string, LessonProgress>;
}
