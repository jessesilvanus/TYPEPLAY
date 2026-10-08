/**
 * TYPEPLAY — Typing Engine
 * ==========================================================================
 * Framework-agnostic core typing engine. This class owns ALL the typing
 * business logic: character validation, cursor movement, miss tracking,
 * metric computation, and session lifecycle.
 *
 * Architecture rules (enforced):
 *   - This module MUST NOT import React or any React-adjacent library.
 *   - It is a plain TypeScript class, fully testable in isolation.
 *   - The UI binds to it via a thin React hook (see src/hooks/useTypingEngine.ts).
 *
 * Typing model:
 *   - The target text is an array of characters, each with a status.
 *   - A cursor points at the next expected character (currentIndex).
 *   - On a correct keystroke, that char becomes 'correct' and the cursor
 *     advances; on an incorrect keystroke it becomes 'incorrect' but the
 *     cursor still advances (standard monkeytype-style flow), so the user
 *     can keep moving forward even after a typo.
 *   - Backspace decrements the cursor and re-opens the previous char to
 *     'pending' if it was 'incorrect' (typos are erasable), but does NOT
 *     un-mark a previously correct char — fixing should be optional, not
 *     allowed to inflate accuracy. We DO clear the char status to pending
 *     so it can be retyped; correctness counters are recalculated.
 *
 * Metric tracking:
 *   - We keep a running set of raw counters and derive SessionStats from them
 *     using the pure helpers in utils/typingMetrics.ts.
 *   - WPM and accuracy use the documented formulas exactly.
 *   - correct/wrong counts drift as the user retypes chars, so we recompute
 *     from the authoritative charStatuses array on every change rather than
 *     only incrementing. This keeps derived stats always consistent with the
 *     visible state.
 */

import type {
  CharStatus,
  SessionConfig,
  SessionPhase,
  SessionSnapshot,
  SessionStats,
} from '../types/typing';
import {
  createSessionStats,
  calculateWPM,
  calculateAccuracy,
  calculateWordsTyped,
} from '../utils/typingMetrics';

/** Listener invoked whenever the engine's snapshot changes. */
export type EngineListener = (snapshot: SessionSnapshot) => void;

/** Default session length in seconds when none is configured. */
const DEFAULT_DURATION_SECONDS = 30;

export class TypingEngine {
  private text: string;
  private charStatuses: CharStatus[];
  private currentIndex: number;

  private correctChars: number;
  private wrongChars: number;
  private backspaces: number;
  private totalKeystrokes: number;
  private missedChars: number;

  private phase: SessionPhase;
  private durationSeconds: number;

  private startTime: number | null;
  private elapsedSeconds: number;

  private listeners: Set<EngineListener>;
  private rafId: number | null;
  private lastTickSeconds: number;

  constructor() {
    this.text = '';
    this.charStatuses = [];
    this.currentIndex = 0;

    this.correctChars = 0;
    this.wrongChars = 0;
    this.backspaces = 0;
    this.totalKeystrokes = 0;
    this.missedChars = 0;

    this.phase = 'idle';
    this.durationSeconds = DEFAULT_DURATION_SECONDS;

    this.startTime = null;
    this.elapsedSeconds = 0;

    this.listeners = new Set();
    this.rafId = null;
    this.lastTickSeconds = 0;
  }

  /* ----------------------------------------------------------------------
   * Lifecycle
   * ---------------------------------------------------------------------- */

  /**
   * Initialise a fresh session with the given config. Resets all state,
   * stops any running clock, and emits the initial idle snapshot.
   */
  configure(config: SessionConfig): void {
    this.stopClock();

    this.text = config.text;
    this.charStatuses = new Array<CharStatus>(this.text.length).fill('pending');
    this.currentIndex = 0;

    this.correctChars = 0;
    this.wrongChars = 0;
    this.backspaces = 0;
    this.totalKeystrokes = 0;
    this.missedChars = 0;

    this.phase = 'idle';
    this.durationSeconds = config.durationSeconds > 0 ? config.durationSeconds : DEFAULT_DURATION_SECONDS;

    this.startTime = null;
    this.elapsedSeconds = 0;
    this.lastTickSeconds = 0;

    this.emit();
  }

  /** Reset the engine back to a fresh idle state with no text. */
  reset(): void {
    this.stopClock();
    this.text = '';
    this.charStatuses = [];
    this.currentIndex = 0;
    this.correctChars = 0;
    this.wrongChars = 0;
    this.backspaces = 0;
    this.totalKeystrokes = 0;
    this.missedChars = 0;
    this.phase = 'idle';
    this.startTime = null;
    this.elapsedSeconds = 0;
    this.lastTickSeconds = 0;
    this.emit();
  }

  /* ----------------------------------------------------------------------
   * Keystroke handling
   * ---------------------------------------------------------------------- */

  /**
   * Process a single typed character. Returns true if the keystroke was
   * consumed (i.e. the session is active and the cursor had somewhere to go).
   */
  handleChar(char: string): boolean {
    if (this.phase === 'complete') return false;
    if (this.currentIndex >= this.text.length) return false;

    if (this.phase === 'idle') this.startClock();

    this.totalKeystrokes += 1;
    const expected = this.text[this.currentIndex];
    const isCorrect = char === expected;

    this.charStatuses[this.currentIndex] = isCorrect ? 'correct' : 'incorrect';
    this.currentIndex += 1;

    // Recompute derived correctness counts from the authoritative array so
    // they can never drift from what is rendered.
    this.recomputeCounts();

    this.emit();
    return true;
  }

  /**
   * Process a backspace. Moves the cursor back one position and re-opens the
   * previous character to 'pending' so it can be retyped. Does nothing at the
   * start of the text or after the session completes.
   */
  handleBackspace(): boolean {
    if (this.phase === 'complete') return false;
    if (this.currentIndex <= 0) return false;

    this.currentIndex -= 1;
    this.backspaces += 1;
    this.totalKeystrokes += 1;

    // Re-open the char for retyping.
    this.charStatuses[this.currentIndex] = 'pending';
    this.recomputeCounts();

    this.emit();
    return true;
  }

  /**
   * Handle a whitespace keystroke (space bar). Equivalent to handleChar(' ')
   * but singled out so the hook can map keyboard events cleanly.
   */
  handleSpace(): boolean {
    return this.handleChar(' ');
  }

  /* ----------------------------------------------------------------------
   * Timing
   * ---------------------------------------------------------------------- */

  /** Begin the real-time clock. Called once, on the first keystroke. */
  private startClock(): void {
    if (this.startTime !== null) return;
    this.startTime = performance.now();
    this.phase = 'active';
    this.loop();
  }

  /** requestAnimationFrame loop that tracks elapsed time and completion. */
  private loop = (): void => {
    if (this.startTime === null) return;
    const elapsedMs = performance.now() - this.startTime;
    this.elapsedSeconds = elapsedMs / 1000;

    // Emit at most ~10x/sec to avoid flooding React renders.
    const wholeSecond = Math.floor(this.elapsedSeconds);
    if (wholeSecond !== this.lastTickSeconds) {
      this.lastTickSeconds = wholeSecond;
      this.emit();
    }

    if (this.elapsedSeconds >= this.durationSeconds) {
      this.complete();
      return;
    }
    this.rafId = requestAnimationFrame(this.loop);
  };

  /** Stop the animation-frame loop. */
  private stopClock(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /** Force the session into the complete phase (used by timer + manual stop). */
  complete(): void {
    this.stopClock();
    if (this.startTime !== null) {
      this.elapsedSeconds = (performance.now() - this.startTime) / 1000;
    }
    this.phase = 'complete';
    this.emit();
  }

  /** Update elapsed time from an external source (e.g. Phase 3 timer). */
  setElapsedSeconds(seconds: number): void {
    this.elapsedSeconds = seconds;
    if (this.phase === 'active' && this.elapsedSeconds >= this.durationSeconds) {
      this.complete();
    } else {
      this.emit();
    }
  }

  /* ----------------------------------------------------------------------
   * Derived state
   * ---------------------------------------------------------------------- */

  /**
   * Recompute correct/wrong counts straight from the charStatuses array.
   * This is the single source of truth for accuracy math — never rely on
   * increment/decrement alone, since retyping and backspacing mutate the
   * array underneath a naive counter.
   */
  private recomputeCounts(): void {
    let correct = 0;
    let wrong = 0;
    let missed = 0;
    for (const status of this.charStatuses) {
      if (status === 'correct') correct += 1;
      else if (status === 'incorrect') wrong += 1;
      else if (status === 'skipped') missed += 1;
    }
    this.correctChars = correct;
    this.wrongChars = wrong;
    this.missedChars = missed;
  }

  /** Build the immutable snapshot handed to listeners and the React layer. */
  getSnapshot(): SessionSnapshot {
    const stats: SessionStats = createSessionStats({
      correctChars: this.correctChars,
      wrongChars: this.wrongChars,
      backspaces: this.backspaces,
      totalKeystrokes: this.totalKeystrokes,
      missedChars: this.missedChars,
      elapsedSeconds: this.elapsedSeconds,
    });

    return {
      phase: this.phase,
      stats,
      elapsedSeconds: Math.floor(this.elapsedSeconds),
      remainingSeconds: Math.max(0, Math.ceil(this.durationSeconds - this.elapsedSeconds)),
      currentText: this.text,
      charStatuses: [...this.charStatuses],
      currentIndex: this.currentIndex,
    };
  }

  /* ----------------------------------------------------------------------
   * Observable/subscription model
   * ---------------------------------------------------------------------- */

  /** Subscribe to snapshot changes. Returns an unsubscribe function. */
  subscribe(listener: EngineListener): () => void {
    this.listeners.add(listener);
    // Immediately deliver current state to new subscribers.
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Notify all listeners with the latest snapshot. */
  private emit(): void {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  /* ----------------------------------------------------------------------
   * Cleanup
   * ---------------------------------------------------------------------- */

  /** Tear down the engine: stop the clock and drop all listeners. */
  destroy(): void {
    this.stopClock();
    this.listeners.clear();
  }
}

/**
 * Standalone helpers re-exported for convenience (e.g. results pages that
 * only need metric math without instantiating an engine).
 */
export { calculateWPM, calculateAccuracy, calculateWordsTyped };
