import { describe, expect, it } from 'vitest';
import {
  calculateAccuracy,
  calculateConsistency,
  calculateWordsTyped,
  calculateWPM,
  createSessionStats,
  getSessionPhase,
  updateSessionStats,
} from './typingMetrics';

describe('typing metrics', () => {
  it('calculates WPM from correct characters and elapsed seconds', () => {
    expect(calculateWPM(25, 30)).toBe(10);
    expect(calculateWPM(7, 13)).toBe(6.5);
    expect(calculateWPM(1, 7)).toBe(1.7);
  });

  it('returns zero WPM when no positive time has elapsed', () => {
    expect(calculateWPM(10, 0)).toBe(0);
    expect(calculateWPM(10, -1)).toBe(0);
  });

  it('calculates accuracy with one-decimal rounding and a safe empty default', () => {
    expect(calculateAccuracy(2, 3)).toBe(66.7);
    expect(calculateAccuracy(0, 0)).toBe(100);
    expect(calculateAccuracy(10, -1)).toBe(100);
  });

  it('calculates fractional words typed', () => {
    expect(calculateWordsTyped(7)).toBe(1.4);
    expect(calculateWordsTyped(0)).toBe(0);
  });

  it('creates a full stats object from raw session counters', () => {
    expect(createSessionStats({
      correctChars: 9,
      wrongChars: 2,
      backspaces: 1,
      totalKeystrokes: 12,
      missedChars: 3,
      elapsedSeconds: 18,
    })).toEqual({
      wpm: 6,
      accuracy: 75,
      correctChars: 9,
      wrongChars: 2,
      backspaces: 1,
      totalKeystrokes: 12,
      missedChars: 3,
      wordsTyped: 1.8,
    });
  });

  it('updates stats for correct, incorrect, and backspace keystrokes', () => {
    const initial = createSessionStats({
      correctChars: 1,
      wrongChars: 1,
      backspaces: 0,
      totalKeystrokes: 2,
      missedChars: 0,
      elapsedSeconds: 10,
    });

    const correct = updateSessionStats(initial, true, false, 12);
    const incorrect = updateSessionStats(correct, false, false, 15);
    const backspace = updateSessionStats(incorrect, false, true, 18);

    expect(correct).toMatchObject({
      correctChars: 2,
      wrongChars: 1,
      backspaces: 0,
      totalKeystrokes: 3,
      accuracy: 66.7,
      wpm: 2,
    });
    expect(incorrect).toMatchObject({
      correctChars: 2,
      wrongChars: 2,
      totalKeystrokes: 4,
      accuracy: 50,
      wpm: 1.6,
    });
    expect(backspace).toMatchObject({
      correctChars: 2,
      wrongChars: 2,
      backspaces: 1,
      totalKeystrokes: 5,
      accuracy: 40,
      wpm: 1.3,
    });
  });

  it('calculates consistency at the expected extremes and phase boundaries', () => {
    expect(calculateConsistency([])).toBe(100);
    expect(calculateConsistency([42])).toBe(100);
    expect(calculateConsistency([30, 30, 30])).toBe(100);
    expect(calculateConsistency([0, 20])).toBe(50);
    expect(calculateConsistency([0, 100])).toBe(0);

    expect(getSessionPhase(0, 30, false)).toBe('idle');
    expect(getSessionPhase(29.9, 30, true)).toBe('active');
    expect(getSessionPhase(30, 30, true)).toBe('complete');
  });
});
