import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_LEARNING_STATE, useLearningStore } from './learningStore';
import { STORAGE_KEYS } from '../types/global';

function resetStore() {
  useLearningStore.getState().resetProgress();
}

describe('learningStore', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  it('makes Home Row available while its dependent lesson remains locked', () => {
    const state = useLearningStore.getState();

    expect(state.getLessonProgress('home-row')).toMatchObject({
      lessonId: 'home-row',
      status: 'available',
      attempts: 0,
    });
    expect(state.getLessonProgress('left-hand')).toMatchObject({
      lessonId: 'left-hand',
      status: 'locked',
    });
    expect(state.isLessonAvailable('home-row')).toBe(true);
    expect(state.isLessonAvailable('left-hand')).toBe(false);
    expect(state.isLessonAvailable('unknown')).toBe(false);
  });

  it('prevents a locked lesson from starting', () => {
    useLearningStore.getState().startLesson('left-hand');

    expect(useLearningStore.getState()).toMatchObject({
      currentLessonId: null,
      lessonProgress: {},
    });
  });

  it('records attempts, retains the best scores, and caps the attempt history', () => {
    const { startLesson, recordAttempt } = useLearningStore.getState();
    startLesson('home-row');
    recordAttempt('home-row', 88, 40);
    recordAttempt('home-row', 84, 52);

    expect(useLearningStore.getState().getLessonProgress('home-row')).toMatchObject({
      status: 'in-progress',
      attempts: 1,
      bestAccuracy: 88,
      bestWPM: 52,
    });
    expect(useLearningStore.getState().attemptHistory).toHaveLength(2);

    for (let index = 0; index < 20; index += 1) {
      useLearningStore.getState().recordAttempt('home-row', index, index);
    }
    expect(useLearningStore.getState().attemptHistory).toHaveLength(20);
  });

  it('completes Home Row, unlocks Left Hand, and exposes it as the next lesson', () => {
    useLearningStore.getState().startLesson('home-row');
    useLearningStore.getState().completeLesson('home-row', 94, 45);

    const state = useLearningStore.getState();
    expect(state.currentLessonId).toBeNull();
    expect(state.getLessonProgress('home-row')).toMatchObject({
      status: 'completed',
      bestAccuracy: 94,
      bestWPM: 45,
    });
    expect(state.getLessonProgress('home-row').completedAt).toBeDefined();
    expect(state.getLessonProgress('left-hand')).toMatchObject({ status: 'available' });
    expect(state.isLessonAvailable('left-hand')).toBe(true);
    expect(state.getNextLesson('home-row')).toMatchObject({ id: 'left-hand' });
  });

  it('persists progression data and restores the default state on reset', () => {
    useLearningStore.getState().startLesson('home-row');

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.learning) ?? '{}') as {
      state?: { currentLessonId?: string | null; lessonProgress?: unknown; startLesson?: unknown };
    };
    expect(stored.state).toMatchObject({ currentLessonId: 'home-row' });
    expect(stored.state?.lessonProgress).toBeDefined();
    expect(stored.state?.startLesson).toBeUndefined();

    useLearningStore.getState().resetProgress();
    expect(useLearningStore.getState()).toMatchObject(DEFAULT_LEARNING_STATE);
  });
});
