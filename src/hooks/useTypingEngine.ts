/**
 * TYPEPLAY — useTypingEngine Hook
 * ==========================================================================
 * Thin React bridge between the framework-agnostic `TypingEngine` class and
 * the UI. It owns a single engine instance, subscribes to its snapshot
 * stream, and re-renders on change — nothing more. All real logic lives in
 * the engine; this hook just makes it reactive.
 *
 * The hook also exposes a keyboard event handler (`onKeyDown`) that maps DOM
 * KeyboardEvents to engine calls, so a component can attach it directly to a
 * focusable element. Printable chars, space, and backspace are handled; all
 * other keys (arrows, modifiers, etc.) are ignored to keep the user on a
 * linear typing path.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { TypingEngine } from '../engines/TypingEngine';
import type { SessionConfig, SessionSnapshot } from '../types/typing';

export interface UseTypingEngineResult {
  /** Latest session snapshot — re-renders on every engine emission. */
  snapshot: SessionSnapshot | null;
  /** Configure and start a fresh session. */
  configure: (config: SessionConfig) => void;
  /** Reset the engine to idle with no text. */
  reset: () => void;
  /** Manually complete the current session (used by the timer). */
  complete: () => void;
  /**
   * Keyboard event handler. Attach to a focusable element via onKeyDown so
   * the browser's native event drives the engine. Returns true if the event
   * was consumed (so the caller can preventDefault).
   */
  onKeyDown: (event: KeyboardEvent | React.KeyboardEvent) => boolean;
  /** Whether the engine is currently running (active phase). */
  isRunning: boolean;
}

export function useTypingEngine(): UseTypingEngineResult {
  // One engine per hook instance. Ref so it survives re-renders.
  const engineRef = useRef<TypingEngine | null>(null);
  if (engineRef.current === null) {
    engineRef.current = new TypingEngine();
  }

  const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(null);

  // Subscribe once; the engine pushes snapshots to us.
  useEffect(() => {
    const engine = engineRef.current!;
    const unsubscribe = engine.subscribe(setSnapshot);
    return () => {
      unsubscribe();
      // Stop the clock on unmount so the rAF loop doesn't leak.
      engine.destroy();
    };
  }, []);

  const configure = useCallback((config: SessionConfig) => {
    engineRef.current?.configure(config);
  }, []);

  const reset = useCallback(() => {
    engineRef.current?.reset();
  }, []);

  const complete = useCallback(() => {
    engineRef.current?.complete();
  }, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent | React.KeyboardEvent): boolean => {
      const engine = engineRef.current;
      if (!engine) return false;

      const key = event.key;

      // Ignore modifier combos and non-character keys entirely so we never
      // hijack browser shortcuts.
      if (event.ctrlKey || event.metaKey || event.altKey) return false;

      if (key === 'Backspace') {
        const consumed = engine.handleBackspace();
        if (consumed) event.preventDefault();
        return consumed;
      }

      if (key === ' ') {
        const consumed = engine.handleSpace();
        if (consumed) event.preventDefault();
        return consumed;
      }

      // Only single-character printable keys drive the engine.
      if (key.length === 1) {
        const consumed = engine.handleChar(key);
        if (consumed) event.preventDefault();
        return consumed;
      }

      return false;
    },
    [],
  );

  const isRunning = snapshot?.phase === 'active';

  return { snapshot, configure, reset, complete, onKeyDown, isRunning };
}
