/**
 * TYPEPLAY — Session History Store
 * ==========================================================================
 * Persistent records for completed Practice and Timed Test sessions. The store
 * deliberately receives only final engine metrics, never live keystrokes.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../types/global';

export const MAX_HISTORY_ATTEMPTS = 200;

export type HistoryMode = 'practice' | 'timed-test';

export interface HistoryAttempt {
  id: string;
  timestamp: string;
  mode: HistoryMode;
  elapsedSeconds: number;
  configuredDurationSeconds: number;
  wpm: number;
  accuracy: number;
  correctChars: number;
  wrongChars: number;
  totalKeystrokes: number;
  missedChars: number;
  lessonId?: string;
}

export type HistoryAttemptInput = Omit<HistoryAttempt, 'id' | 'timestamp'>;

interface HistoryActions {
  recordAttempt: (attempt: HistoryAttemptInput) => void;
  clearHistory: () => void;
}

interface HistoryStore extends HistoryActions {
  attempts: HistoryAttempt[];
}

const DEFAULT_HISTORY_STATE: Pick<HistoryStore, 'attempts'> = {
  attempts: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isValidTimestamp(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && Number.isFinite(Date.parse(value));
}

/**
 * Normalise untrusted localStorage data before it becomes application state.
 * Invalid records are ignored rather than letting one bad saved entry break the
 * dashboard. `lessonId` remains optional for forward-compatible history.
 */
function normalizeAttempt(value: unknown): HistoryAttempt | null {
  if (!isRecord(value)) return null;

  const { id, timestamp, mode, elapsedSeconds, configuredDurationSeconds, wpm, accuracy, correctChars, wrongChars, totalKeystrokes, missedChars, lessonId } = value;

  if (
    typeof id !== 'string' ||
    id.trim().length === 0 ||
    !isValidTimestamp(timestamp) ||
    (mode !== 'practice' && mode !== 'timed-test') ||
    !isNonNegativeNumber(elapsedSeconds) ||
    !isNonNegativeNumber(configuredDurationSeconds) ||
    configuredDurationSeconds === 0 ||
    !isNonNegativeNumber(wpm) ||
    !isNonNegativeNumber(accuracy) ||
    accuracy > 100 ||
    !isNonNegativeNumber(correctChars) ||
    !isNonNegativeNumber(wrongChars) ||
    !isNonNegativeNumber(totalKeystrokes) ||
    !isNonNegativeNumber(missedChars)
  ) {
    return null;
  }

  return {
    id,
    timestamp,
    mode,
    elapsedSeconds: Math.floor(elapsedSeconds),
    configuredDurationSeconds: Math.floor(configuredDurationSeconds),
    wpm: Math.round(wpm),
    accuracy: Math.round(accuracy * 10) / 10,
    correctChars: Math.floor(correctChars),
    wrongChars: Math.floor(wrongChars),
    totalKeystrokes: Math.floor(totalKeystrokes),
    missedChars: Math.floor(missedChars),
    ...(typeof lessonId === 'string' && lessonId.trim().length > 0 ? { lessonId } : {}),
  };
}

function sanitizeAttempts(value: unknown): HistoryAttempt[] {
  if (!Array.isArray(value)) return [];

  return value
    .map(normalizeAttempt)
    .filter((attempt): attempt is HistoryAttempt => attempt !== null)
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    .slice(0, MAX_HISTORY_ATTEMPTS);
}

function createAttemptId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      ...DEFAULT_HISTORY_STATE,

      recordAttempt: (input) =>
        set((state) => {
          const attempt = normalizeAttempt({
            ...input,
            id: createAttemptId(),
            timestamp: new Date().toISOString(),
          });

          if (!attempt) return state;

          return {
            attempts: [attempt, ...state.attempts].slice(0, MAX_HISTORY_ATTEMPTS),
          };
        }),

      clearHistory: () => set(DEFAULT_HISTORY_STATE),
    }),
    {
      name: STORAGE_KEYS.history,
      partialize: (state) => ({ attempts: state.attempts }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        attempts: sanitizeAttempts(isRecord(persistedState) ? persistedState.attempts : undefined),
      }),
    },
  ),
);
