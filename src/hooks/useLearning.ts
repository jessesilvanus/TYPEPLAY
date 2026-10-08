/**
 * TYPEPLAY — useLearning Hook
 * ==========================================================================
 * React hook that wraps the learning store with convenient derived state
 * and actions for components. Keeps UI in sync with persisted progress.
 */
import { useMemo } from 'react';
import { useLearningStore } from '../stores/learningStore';
import type { Lesson, LessonProgress, Finger } from '../types/learning';
import { LESSONS, getLesson } from '../data/lessons';

export interface UseLearningResult {
  /** All lessons in order. */
  lessons: Lesson[];
  /** The currently active lesson (if any). */
  currentLesson: Lesson | null;
  /** Progress for the current lesson. */
  currentProgress: LessonProgress | null;
  /** Progress map for all lessons. */
  allProgress: Record<string, LessonProgress>;
  /** Whether a specific lesson is available to start. */
  isLessonAvailable: (lessonId: string) => boolean;
  /** Get progress for a specific lesson. */
  getLessonProgress: (lessonId: string) => LessonProgress;
  /** Start a lesson (sets it as current, updates status). */
  startLesson: (lessonId: string) => void;
  /** Record an attempt result (called after typing session). */
  recordAttempt: (accuracy: number, wpm: number) => void;
  /** Complete the current lesson (if meets threshold). */
  completeLesson: (accuracy: number, wpm: number) => void;
  /** Get the next lesson after the current one (uses store's currentLessonId). */
  getNextLesson: () => Lesson | null;
  /** Get the next lesson after a specific lesson ID. */
  getNextLessonFor: (lessonId: string) => Lesson | null;
  /** Get the finger assigned to a character. */
  getFingerForChar: (char: string) => Finger | null;
  /** Reset all progress. */
  resetProgress: () => void;
}

export function useLearning(): UseLearningResult {
  const {
    currentLessonId,
    lessonProgress,
    startLesson,
    recordAttempt,
    completeLesson,
    getLessonProgress,
    isLessonAvailable,
    getNextLesson: storeGetNextLesson,
    getFingerForChar,
    resetProgress,
  } = useLearningStore();

  const currentLesson = useMemo(
    () => (currentLessonId ? getLesson(currentLessonId) ?? null : null),
    [currentLessonId],
  );

  const currentProgress = useMemo(
    () => (currentLessonId ? lessonProgress[currentLessonId] ?? null : null),
    [currentLessonId, lessonProgress],
  );

  const allProgress = useMemo(() => lessonProgress, [lessonProgress]);

  const handleStartLesson = (lessonId: string) => {
    startLesson(lessonId);
  };

  const handleRecordAttempt = (accuracy: number, wpm: number) => {
    if (currentLessonId) {
      recordAttempt(currentLessonId, accuracy, wpm);
    }
  };

  const handleCompleteLesson = (accuracy: number, wpm: number) => {
    if (currentLessonId) {
      completeLesson(currentLessonId, accuracy, wpm);
    }
  };

  const handleGetNextLesson = () => {
    if (!currentLessonId) return null;
    return storeGetNextLesson(currentLessonId);
  };

  const handleGetNextLessonFor = (lessonId: string) => {
    return storeGetNextLesson(lessonId);
  };

  return {
    lessons: LESSONS,
    currentLesson,
    currentProgress,
    allProgress,
    isLessonAvailable,
    getLessonProgress,
    startLesson: handleStartLesson,
    recordAttempt: handleRecordAttempt,
    completeLesson: handleCompleteLesson,
    getNextLesson: handleGetNextLesson,
    getNextLessonFor: handleGetNextLessonFor,
    getFingerForChar,
    resetProgress,
  };
}