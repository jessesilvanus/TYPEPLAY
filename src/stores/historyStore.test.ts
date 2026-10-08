import { beforeEach, describe, expect, it } from 'vitest';
import { MAX_HISTORY_ATTEMPTS, useHistoryStore } from './historyStore';
import { STORAGE_KEYS } from '../types/global';

const attempt = (overrides = {}) => ({
  mode: 'practice' as const,
  elapsedSeconds: 30,
  configuredDurationSeconds: 30,
  wpm: 48,
  accuracy: 96.4,
  correctChars: 120,
  wrongChars: 4,
  totalKeystrokes: 125,
  missedChars: 0,
  ...overrides,
});

function resetStore() {
  useHistoryStore.getState().clearHistory();
}

describe('historyStore', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  it('starts with no saved attempts', () => {
    expect(useHistoryStore.getState().attempts).toEqual([]);
  });

  it('saves a normalized completed attempt with an ID and timestamp', () => {
    useHistoryStore.getState().recordAttempt(attempt({
      elapsedSeconds: 30.8,
      configuredDurationSeconds: 60.9,
      wpm: 48.7,
      accuracy: 96.44,
      correctChars: 120.8,
      wrongChars: 4.9,
      totalKeystrokes: 125.6,
    }));

    const [saved] = useHistoryStore.getState().attempts;
    expect(saved).toMatchObject({
      mode: 'practice',
      elapsedSeconds: 30,
      configuredDurationSeconds: 60,
      wpm: 49,
      accuracy: 96.4,
      correctChars: 120,
      wrongChars: 4,
      totalKeystrokes: 125,
      missedChars: 0,
    });
    expect(saved.id).not.toBe('');
    expect(Number.isNaN(Date.parse(saved.timestamp))).toBe(false);
  });

  it('adds new attempts first and gives each record a unique ID', () => {
    useHistoryStore.getState().recordAttempt(attempt({ mode: 'practice', wpm: 40 }));
    useHistoryStore.getState().recordAttempt(attempt({ mode: 'timed-test', wpm: 70 }));

    const [latest, earlier] = useHistoryStore.getState().attempts;
    expect(latest).toMatchObject({ mode: 'timed-test', wpm: 70 });
    expect(earlier).toMatchObject({ mode: 'practice', wpm: 40 });
    expect(latest.id).not.toBe(earlier.id);
  });

  it('caps persisted history at the configured maximum', () => {
    for (let index = 0; index < MAX_HISTORY_ATTEMPTS + 1; index += 1) {
      useHistoryStore.getState().recordAttempt(attempt({ wpm: index }));
    }

    const saved = useHistoryStore.getState().attempts;
    expect(saved).toHaveLength(MAX_HISTORY_ATTEMPTS);
    expect(saved[0].wpm).toBe(MAX_HISTORY_ATTEMPTS);
    expect(saved.at(-1)?.wpm).toBe(1);
  });

  it('rejects invalid input and clears saved history explicitly', () => {
    useHistoryStore.getState().recordAttempt(attempt({ accuracy: 101 }));
    expect(useHistoryStore.getState().attempts).toEqual([]);

    useHistoryStore.getState().recordAttempt(attempt());
    useHistoryStore.getState().clearHistory();
    expect(useHistoryStore.getState().attempts).toEqual([]);
  });

  it('persists only the history data shape', () => {
    useHistoryStore.getState().recordAttempt(attempt());

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.history) ?? '{}') as {
      state?: { attempts?: unknown[]; recordAttempt?: unknown };
    };

    expect(stored.state?.attempts).toHaveLength(1);
    expect(stored.state?.recordAttempt).toBeUndefined();
  });

  it('sanitizes malformed persisted history during hydration', async () => {
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify({
      state: {
        attempts: [
          {
            id: 'valid-later',
            timestamp: '2025-01-02T00:00:00.000Z',
            mode: 'timed-test',
            elapsedSeconds: 60,
            configuredDurationSeconds: 60,
            wpm: 44.9,
            accuracy: 98.44,
            correctChars: 220,
            wrongChars: 2,
            totalKeystrokes: 225,
            missedChars: 0,
          },
          {
            id: '',
            timestamp: 'not-a-date',
            mode: 'other',
          },
          {
            id: 'valid-earlier',
            timestamp: '2025-01-01T00:00:00.000Z',
            mode: 'practice',
            elapsedSeconds: 30,
            configuredDurationSeconds: 30,
            wpm: 30,
            accuracy: 90,
            correctChars: 75,
            wrongChars: 8,
            totalKeystrokes: 83,
            missedChars: 0,
            lessonId: 'home-row',
          },
        ],
      },
      version: 0,
    }));

    await useHistoryStore.persist.rehydrate();

    expect(useHistoryStore.getState().attempts).toEqual([
      expect.objectContaining({
        id: 'valid-later',
        wpm: 45,
        accuracy: 98.4,
      }),
      expect.objectContaining({
        id: 'valid-earlier',
        lessonId: 'home-row',
      }),
    ]);
  });
});
