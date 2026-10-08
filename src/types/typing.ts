/**
 * TYPEPLAY — Typing Domain Types
 * ==========================================================================
 * Core definitions for the typing engine and session state.
 */

/** The current status of an individual character within a session. */
export type CharStatus = 'pending' | 'correct' | 'incorrect' | 'skipped';

/** The phase of a typing practice session. */
export type SessionPhase = 'idle' | 'active' | 'complete';

/** Configuration for a new session, chosen on the setup screen. */
export interface SessionConfig {
  durationSeconds: number;
  mode: 'speed' | 'accuracy' | 'learn' | 'relaxed';
  text: string;
}

/** Real-time statistics emitted by the typing engine. */
export interface SessionStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  wrongChars: number;
  backspaces: number;
  totalKeystrokes: number;
  missedChars: number; // Chars that were skipped if engine logic allowed
  wordsTyped: number;
}

/** The snapshot of the session provided to the UI for rendering. */
export interface SessionSnapshot {
  phase: SessionPhase;
  stats: SessionStats;
  elapsedSeconds: number;
  remainingSeconds: number;
  currentText: string;
  charStatuses: CharStatus[];
  currentIndex: number;
}
