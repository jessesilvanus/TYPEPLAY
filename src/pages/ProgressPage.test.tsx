import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProgressPage from './ProgressPage';
import { useHistoryStore, type HistoryAttempt } from '../stores/historyStore';
import { useLearningStore } from '../stores/learningStore';

const completedAttempt: HistoryAttempt = {
  id: 'test-practice-attempt',
  timestamp: '2025-01-02T12:34:00.000Z',
  mode: 'practice',
  elapsedSeconds: 90,
  configuredDurationSeconds: 120,
  wpm: 52,
  accuracy: 96.5,
  correctChars: 390,
  wrongChars: 2,
  totalKeystrokes: 405,
  missedChars: 0,
};

function renderPage() {
  return render(
    <MemoryRouter>
      <ProgressPage />
    </MemoryRouter>,
  );
}

describe('ProgressPage session history', () => {
  beforeEach(() => {
    localStorage.clear();
    useHistoryStore.getState().clearHistory();
    useLearningStore.getState().resetProgress();
  });

  afterEach(() => {
    cleanup();
    useHistoryStore.getState().clearHistory();
    useLearningStore.getState().resetProgress();
  });

  it('shows the useful empty-history state without hiding learning progress', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Your session history will appear here' })).not.toBeNull();
    expect(screen.getByRole('link', { name: 'Start Practice' }).getAttribute('href')).toBe('/practice');
    expect(screen.getByRole('link', { name: 'Take a Timed Test' }).getAttribute('href')).toBe('/test');
    expect(screen.getByRole('heading', { name: 'Learning progress' })).not.toBeNull();
    expect(screen.queryByRole('heading', { name: 'Recent attempts' })).toBeNull();
  });

  it('summarizes saved session metrics and renders a recent attempt', () => {
    useHistoryStore.setState({
      attempts: [
        completedAttempt,
        {
          ...completedAttempt,
          id: 'test-timed-attempt',
          timestamp: '2025-01-01T12:34:00.000Z',
          mode: 'timed-test',
          elapsedSeconds: 30,
          wpm: 40,
          accuracy: 91.5,
          correctChars: 100,
        },
      ],
    });

    renderPage();

    expect(screen.getAllByText('2 saved attempts')).toHaveLength(1);
    const statistics = screen.getByRole('list', { name: 'Session history statistics' });
    expect(statistics.textContent).toContain('Completed Sessions');
    expect(statistics.textContent).toContain('46');
    expect(statistics.textContent).toContain('94%');
    expect(screen.getByRole('heading', { name: 'Recent performance' })).not.toBeNull();
    expect(screen.getByRole('img', { name: 'Line chart showing recent WPM and accuracy' })).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'Recent attempts' })).not.toBeNull();
    const recentAttempts = screen.getByRole('list', { name: 'Recent practice and timed test attempts' });
    expect(recentAttempts.textContent).toContain('Practice');
    expect(recentAttempts.textContent).toContain('Timed Test');
    expect(recentAttempts.textContent).toContain('52');
    expect(recentAttempts.textContent).toContain('96.5%');
  });
});
