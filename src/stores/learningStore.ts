/**
 * TYPEPLAY — Learning Store
 * ==========================================================================
 * Zustand store that owns all persisted learning progress state.
 *
 * Follows the same pattern as settingsStore: create() + persist middleware,
 * with partialize to persist only data fields.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS, type Lesson, type LessonProgress, type LessonStatus, type LearningState, type Finger } from '../types/learning';
import { LESSONS, getLesson } from '../data/lessons';
import { getFingerForKey } from '../data/fingerMapping';

export interface Attempt {
  lessonId: string;
  accuracy: number;
  wpm: number;
  timestamp: string;
}

export interface LearningStateExtended extends LearningState {
  attemptHistory: Attempt[];
}

export const DEFAULT_LEARNING_STATE: LearningStateExtended = {
  currentLessonId: null,
  lessonProgress: {},
  attemptHistory: [],
};

function nowISO(): string {
  return new Date().toISOString();
}

function initialProgress(lessonId: string): LessonProgress {
  const lesson = getLesson(lessonId);
  const initialStatus: LessonStatus = lesson && !lesson.prerequisite ? 'available' : 'locked';
  return {
    lessonId,
    status: initialStatus,
    attempts: 0,
    bestAccuracy: 0,
    bestWPM: 0,
  };
}

function isLessonAvailable(lessonId: string, progress: Record<string, LessonProgress>): boolean {
  const lesson = getLesson(lessonId);
  if (!lesson) return false;
  if (!lesson.prerequisite) return true;
  const prereqProgress = progress[lesson.prerequisite];
  return prereqProgress?.status === 'completed';
}

function updateLessonStatuses(progress: Record<string, LessonProgress>): Record<string, LessonProgress> {
  const updated = { ...progress };
  LESSONS.forEach((lesson) => {
    const current = updated[lesson.id] ?? initialProgress(lesson.id);
    if (current.status === 'locked' && isLessonAvailable(lesson.id, progress)) {
      updated[lesson.id] = { ...current, status: 'available' };
    }
  });
  return updated;
}

interface LearningActions {
  startLesson: (lessonId: string) => void;
  recordAttempt: (lessonId: string, accuracy: number, wpm: number) => void;
  completeLesson: (lessonId: string, accuracy: number, wpm: number) => void;
  resetProgress: () => void;
  getLessonProgress: (lessonId: string) => LessonProgress;
  isLessonAvailable: (lessonId: string) => boolean;
  getNextLesson: (currentId: string) => Lesson | null;
  getCurrentLesson: () => Lesson | null;
  getFingerForChar: (char: string) => Finger | null;
}

type LearningStore = LearningStateExtended & LearningActions;

export const useLearningStore = create<LearningStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_LEARNING_STATE,

      startLesson: (lessonId) =>
        set((state) => {
          const lesson = getLesson(lessonId);
          if (!lesson || !isLessonAvailable(lessonId, state.lessonProgress)) return state;

          const currentProgress = state.lessonProgress[lessonId] ?? initialProgress(lessonId);
          return {
            currentLessonId: lessonId,
            lessonProgress: {
              ...state.lessonProgress,
              [lessonId]: { ...currentProgress, status: 'in-progress', attempts: currentProgress.attempts + 1 },
            },
          };
        }),

      recordAttempt: (lessonId, accuracy, wpm) =>
        set((state) => {
          const currentProgress = state.lessonProgress[lessonId] ?? initialProgress(lessonId);
          const lesson = getLesson(lessonId);
          if (!lesson) return state;

          const newBestAccuracy = Math.max(currentProgress.bestAccuracy, accuracy);
          const newBestWPM = Math.max(currentProgress.bestWPM, wpm);

          const updatedProgress = {
            ...state.lessonProgress,
            [lessonId]: {
              ...currentProgress,
              bestAccuracy: newBestAccuracy,
              bestWPM: newBestWPM,
            },
          };

          return {
            lessonProgress: updateLessonStatuses(updatedProgress),
            attemptHistory: [{ lessonId, accuracy, wpm, timestamp: nowISO() }, ...state.attemptHistory].slice(0, 20),
          };
        }),

      completeLesson: (lessonId, accuracy, wpm) =>
        set((state) => {
          const lesson = getLesson(lessonId);
          if (!lesson) return state;

          const currentProgress = state.lessonProgress[lessonId] ?? initialProgress(lessonId);
          const updatedProgress: Record<string, LessonProgress> = {
            ...state.lessonProgress,
            [lessonId]: {
              ...currentProgress,
              status: 'completed' as const,
              bestAccuracy: Math.max(currentProgress.bestAccuracy, accuracy),
              bestWPM: Math.max(currentProgress.bestWPM, wpm),
              completedAt: currentProgress.completedAt ?? nowISO(),
            },
          };

          return {
            lessonProgress: updateLessonStatuses(updatedProgress),
            attemptHistory: [{ lessonId, accuracy, wpm, timestamp: nowISO() }, ...state.attemptHistory].slice(0, 20),
            currentLessonId: state.currentLessonId === lessonId ? null : state.currentLessonId,
          };
        }),

      resetProgress: () => set(() => ({ ...DEFAULT_LEARNING_STATE })),

      getLessonProgress: (lessonId) => get().lessonProgress[lessonId] ?? initialProgress(lessonId),
      isLessonAvailable: (lessonId) => isLessonAvailable(lessonId, get().lessonProgress),
      getNextLesson: (currentId) => {
        const state = get();
        const currentLesson = getLesson(currentId);
        if (!currentLesson || state.lessonProgress[currentId]?.status !== 'completed') return null;
        return LESSONS.find((l) => l.number === currentLesson.number + 1) ?? null;
      },
      getCurrentLesson: () => (get().currentLessonId ? getLesson(get().currentLessonId!) ?? null : null),
      getFingerForChar: (char) => getFingerForKey(char),
    }),
    {
      name: STORAGE_KEYS.learning,
      partialize: (state) => ({
        currentLessonId: state.currentLessonId,
        lessonProgress: state.lessonProgress,
        attemptHistory: state.attemptHistory,
      }),
    },
  ),
);