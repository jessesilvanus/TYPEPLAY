import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TypingEngine } from './TypingEngine';

const sessionConfig = {
  durationSeconds: 30,
  mode: 'speed' as const,
  text: 'ab',
};

describe('TypingEngine', () => {
  let engine: TypingEngine;

  beforeEach(() => {
    engine = new TypingEngine();
    vi.spyOn(performance, 'now').mockReturnValue(1_000);
  });

  it('starts with an empty idle snapshot', () => {
    expect(engine.getSnapshot()).toMatchObject({
      phase: 'idle',
      currentText: '',
      charStatuses: [],
      currentIndex: 0,
      elapsedSeconds: 0,
      stats: {
        correctChars: 0,
        wrongChars: 0,
        backspaces: 0,
        totalKeystrokes: 0,
        accuracy: 100,
        wpm: 0,
      },
    });
  });

  it('configures a fresh session and emits its initial snapshot', () => {
    const listener = vi.fn();
    engine.subscribe(listener);

    engine.configure(sessionConfig);

    expect(engine.getSnapshot()).toMatchObject({
      phase: 'idle',
      currentText: 'ab',
      charStatuses: ['pending', 'pending'],
      currentIndex: 0,
      remainingSeconds: 30,
    });
    expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({
      currentText: 'ab',
      phase: 'idle',
    }));
  });

  it('tracks correct input, linear cursor movement, and whitespace input', () => {
    engine.configure({ ...sessionConfig, text: 'a ' });

    expect(engine.handleChar('a')).toBe(true);
    expect(engine.handleSpace()).toBe(true);

    expect(engine.getSnapshot()).toMatchObject({
      phase: 'active',
      currentIndex: 2,
      charStatuses: ['correct', 'correct'],
      stats: {
        correctChars: 2,
        wrongChars: 0,
        totalKeystrokes: 2,
        accuracy: 100,
      },
    });
  });

  it('tracks incorrect characters while advancing the cursor', () => {
    engine.configure(sessionConfig);

    expect(engine.handleChar('x')).toBe(true);

    expect(engine.getSnapshot()).toMatchObject({
      currentIndex: 1,
      charStatuses: ['incorrect', 'pending'],
      stats: {
        correctChars: 0,
        wrongChars: 1,
        totalKeystrokes: 1,
        accuracy: 0,
      },
    });
  });

  it('reopens the previous character and recomputes counts after backspace', () => {
    engine.configure(sessionConfig);
    engine.handleChar('a');
    engine.handleChar('x');

    expect(engine.handleBackspace()).toBe(true);

    expect(engine.getSnapshot()).toMatchObject({
      currentIndex: 1,
      charStatuses: ['correct', 'pending'],
      stats: {
        correctChars: 1,
        wrongChars: 0,
        backspaces: 1,
        totalKeystrokes: 3,
        accuracy: 33.3,
      },
    });
  });

  it('does not consume backspace at the start or input past the text end', () => {
    engine.configure({ ...sessionConfig, text: 'a' });

    expect(engine.handleBackspace()).toBe(false);
    expect(engine.handleChar('a')).toBe(true);
    expect(engine.handleChar('x')).toBe(false);

    expect(engine.getSnapshot()).toMatchObject({
      phase: 'active',
      currentIndex: 1,
      stats: { totalKeystrokes: 1 },
    });
  });

  it('completes manually using the real elapsed time', () => {
    engine.configure(sessionConfig);
    engine.handleChar('a');
    vi.mocked(performance.now).mockReturnValue(3_500);

    engine.complete();

    expect(engine.getSnapshot()).toMatchObject({
      phase: 'complete',
      elapsedSeconds: 2,
      remainingSeconds: 28,
    });
    expect(engine.handleChar('b')).toBe(false);
    expect(engine.handleBackspace()).toBe(false);
  });

  it('completes through the public elapsed-time API once active', () => {
    engine.configure({ ...sessionConfig, durationSeconds: 5 });
    engine.handleChar('a');

    engine.setElapsedSeconds(5);

    expect(engine.getSnapshot()).toMatchObject({
      phase: 'complete',
      elapsedSeconds: 0,
      remainingSeconds: 5,
    });
  });

  it('resets and reconfigures without retaining prior session state', () => {
    engine.configure(sessionConfig);
    engine.handleChar('a');
    engine.reset();

    expect(engine.getSnapshot()).toMatchObject({
      phase: 'idle',
      currentText: '',
      charStatuses: [],
      currentIndex: 0,
      stats: { totalKeystrokes: 0 },
    });

    engine.configure({ ...sessionConfig, text: 'new' });

    expect(engine.getSnapshot()).toMatchObject({
      currentText: 'new',
      charStatuses: ['pending', 'pending', 'pending'],
      currentIndex: 0,
      stats: { totalKeystrokes: 0 },
    });
  });

  it('does not start a session for empty text', () => {
    engine.configure({ ...sessionConfig, text: '' });

    expect(engine.handleChar('a')).toBe(false);
    expect(engine.getSnapshot()).toMatchObject({
      phase: 'idle',
      currentIndex: 0,
      stats: { totalKeystrokes: 0 },
    });
  });
});
