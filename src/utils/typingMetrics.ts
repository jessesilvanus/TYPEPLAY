/**
 * TYPEPLAY — Typing Metric Calculations
 * ==========================================================================
 * Pure, framework-agnostic metric computation helpers.
 *
 * These functions implement the exact formulas specified in the project design:
 *   WPM = (correct characters / 5) / elapsed minutes
 *   Accuracy = (correct keystrokes / total attempted keystrokes) × 100
 *
 * All functions are stateless and easily testable.
 */

import type { SessionStats } from '../types/typing';

/** Number of characters that constitute one "word" for WPM purposes. */
const CHARS_PER_WORD = 5;

/**
 * Calculates Words Per Minute (WPM).
 *
 * Formula: (correct characters / 5) / (elapsed seconds / 60)
 *        = correct characters * 60 / (5 * elapsed seconds)
 *        = correct characters * 12 / elapsed seconds
 *
 * @param correctChars - Number of correctly typed characters
 * @param elapsedSeconds - Time elapsed in seconds (must be > 0)
 * @returns WPM rounded to 1 decimal place, or 0 if elapsedSeconds <= 0
 */
export function calculateWPM(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const wpm = (correctChars * 12) / elapsedSeconds;
  return Math.round(wpm * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculates typing accuracy as a percentage.
 *
 * Formula: (correct keystrokes / total attempted keystrokes) × 100
 *
 * @param correctChars - Number of correctly typed characters
 * @param totalKeystrokes - Total keystrokes attempted (correct + incorrect)
 * @returns Accuracy percentage rounded to 1 decimal place, or 100 if no keystrokes
 */
export function calculateAccuracy(correctChars: number, totalKeystrokes: number): number {
  if (totalKeystrokes <= 0) return 100;
  const accuracy = (correctChars / totalKeystrokes) * 100;
  return Math.round(accuracy * 10) / 10;
}

/**
 * Calculates the number of words typed.
 *
 * Formula: correct characters / 5
 *
 * @param correctChars - Number of correctly typed characters
 * @returns Number of words (can be fractional, rounded to 1 decimal)
 */
export function calculateWordsTyped(correctChars: number): number {
  return Math.round((correctChars / CHARS_PER_WORD) * 10) / 10;
}

/**
 * Creates a complete SessionStats object from raw counters.
 *
 * @param params - Raw typing session counters
 * @returns Fully populated SessionStats with computed metrics
 */
export function createSessionStats(params: {
  correctChars: number;
  wrongChars: number;
  backspaces: number;
  totalKeystrokes: number;
  missedChars: number;
  elapsedSeconds: number;
}): SessionStats {
  const wpm = calculateWPM(params.correctChars, params.elapsedSeconds);
  const accuracy = calculateAccuracy(params.correctChars, params.totalKeystrokes);
  const wordsTyped = calculateWordsTyped(params.correctChars);

  return {
    wpm,
    accuracy,
    correctChars: params.correctChars,
    wrongChars: params.wrongChars,
    backspaces: params.backspaces,
    totalKeystrokes: params.totalKeystrokes,
    missedChars: params.missedChars,
    wordsTyped,
  };
}

/**
 * Updates a SessionStats object with new keystroke data.
 *
 * @param current - Existing stats
 * @param isCorrect - Whether the new keystroke was correct
 * @param isBackspace - Whether the new keystroke was a backspace
 * @param elapsedSeconds - Current elapsed time
 * @returns Updated SessionStats
 */
export function updateSessionStats(
  current: SessionStats,
  isCorrect: boolean,
  isBackspace: boolean,
  elapsedSeconds: number
): SessionStats {
  const newCorrectChars = current.correctChars + (isCorrect && !isBackspace ? 1 : 0);
  const newWrongChars = current.wrongChars + (!isCorrect && !isBackspace ? 1 : 0);
  const newBackspaces = current.backspaces + (isBackspace ? 1 : 0);
  const newTotalKeystrokes = current.totalKeystrokes + 1;

  return createSessionStats({
    correctChars: newCorrectChars,
    wrongChars: newWrongChars,
    backspaces: newBackspaces,
    totalKeystrokes: newTotalKeystrokes,
    missedChars: current.missedChars,
    elapsedSeconds,
  });
}

/**
 * Calculates consistency score based on WPM variance over time.
 * This is a placeholder for Phase 9 (adaptive learning) but defined
 * here so the engine can track raw timing data.
 *
 * @param wpmSamples - Array of WPM measurements taken at regular intervals
 * @returns Consistency score 0-100 (100 = perfectly consistent)
 */
export function calculateConsistency(wpmSamples: number[]): number {
  if (wpmSamples.length < 2) return 100;

  const mean = wpmSamples.reduce((sum, wpm) => sum + wpm, 0) / wpmSamples.length;
  const variance = wpmSamples.reduce((sum, wpm) => sum + Math.pow(wpm - mean, 2), 0) / wpmSamples.length;
  const stdDev = Math.sqrt(variance);

  // Convert to 0-100 scale: lower stdDev = higher consistency
  // Using a heuristic: 10 WPM stdDev ≈ 50% consistency
  const consistency = Math.max(0, 100 - (stdDev / 10) * 50);
  return Math.round(consistency * 10) / 10;
}

/**
 * Determines the current session phase based on elapsed time and config.
 *
 * @param elapsedSeconds - Time elapsed since session start
 * @param durationSeconds - Configured session duration
 * @param hasStarted - Whether any keystroke has occurred
 * @returns The current SessionPhase
 */
export function getSessionPhase(
  elapsedSeconds: number,
  durationSeconds: number,
  hasStarted: boolean
): 'idle' | 'active' | 'complete' {
  if (!hasStarted) return 'idle';
  if (elapsedSeconds >= durationSeconds) return 'complete';
  return 'active';
}