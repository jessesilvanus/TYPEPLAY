/**
 * TYPEPLAY — PracticePage
 * ==========================================================================
 * The Phase 2 practice surface. Implements the full session flow:
 *   1. Setup: choose a passage and a duration, then begin.
 *   2. Active: a focusable typing region renders the passage character by
 *      character with correct/incorrect/pending colouring, a live WPM +
 *      accuracy + countdown readout, and backspace support.
 *   3. Complete: a results card showing final WPM, accuracy, correct/wrong
 *      counts, and a "Try again" action.
 *
 * All typing logic is delegated to the `useTypingEngine` hook + engine. This
 * component only renders state and forwards keystrokes. It is keyboard
 * accessible by design: the typing region is a real focusable element that
 * captures key events at the document level while active.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, RotateCcw, Clock, Gauge, Target, ChevronRight } from 'lucide-react';
import { useTypingEngine } from '../hooks/useTypingEngine';
import {
  PASSAGES,
  getPassage,
  type Passage,
  type PassageDifficulty,
} from '../data/passages';
import type { SessionConfig } from '../types/typing';
import { useHistoryStore } from '../stores/historyStore';

/** Available session durations (seconds). */
const DURATION_OPTIONS = [15, 30, 60, 120] as const;

/** Per-difficulty accent colours (advisory only). */
const DIFFICULTY_LABELS: Record<PassageDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

/* --------------------------------------------------------------------------
 * Setup screen
 * -------------------------------------------------------------------------- */

interface SetupScreenProps {
  onStart: (config: SessionConfig) => void;
}

function SetupScreen({ onStart }: SetupScreenProps) {
  const [passageId, setPassageId] = useState<string>(PASSAGES[0].id);
  const [duration, setDuration] = useState<number>(30);

  const passage = useMemo(() => getPassage(passageId), [passageId]);

  return (
    <div className="container" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-24)' }}>
      <div style={{ maxWidth: '46rem', margin: '0 auto' }}>
        <h1
          style={{
            margin: '0 0 var(--space-2) 0',
            fontSize: '2rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          Start Practice
        </h1>
        <p style={{ margin: '0 0 var(--space-12) 0', color: 'var(--color-text-secondary)' }}>
          Pick a passage and a duration. Accuracy first, speed follows.
        </p>

        {/* Duration */}
        <div style={{ marginBottom: 'var(--space-10)' }}>
          <p
            style={{
              margin: '0 0 var(--space-3) 0',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
            }}
          >
            Duration
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {DURATION_OPTIONS.map((seconds) => {
              const active = seconds === duration;
              return (
                <button
                  key={seconds}
                  type="button"
                  onClick={() => setDuration(seconds)}
                  aria-pressed={active}
                  className="btn btn-md"
                  style={{
                    backgroundColor: active ? 'var(--color-accent-muted)' : 'transparent',
                    color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
                  }}
                >
                  <Clock size={14} aria-hidden="true" />
                  {seconds}s
                </button>
              );
            })}
          </div>
        </div>

        {/* Passage picker */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <p
            style={{
              margin: '0 0 var(--space-3) 0',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
            }}
          >
            Passage
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
              gap: 'var(--space-3)',
            }}
          >
            {PASSAGES.map((p) => (
              <PassageOption
                key={p.id}
                passage={p}
                active={p.id === passageId}
                onSelect={() => setPassageId(p.id)}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="card" style={{ marginBottom: 'var(--space-10)' }}>
          <p
            style={{
              margin: '0 0 var(--space-2) 0',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
            }}
          >
            Preview
          </p>
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9375rem',
              lineHeight: 1.7,
              color: 'var(--color-text-secondary)',
            }}
          >
            {passage.text}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={() =>
            onStart({
              durationSeconds: duration,
              mode: 'speed',
              text: passage.text,
            })
          }
        >
          <Play size={18} aria-hidden="true" />
          Begin Session
        </button>
      </div>
    </div>
  );
}

interface PassageOptionProps {
  passage: Passage;
  active: boolean;
  onSelect: () => void;
}

function PassageOption({ passage, active, onSelect }: PassageOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className="card"
      style={{
        cursor: 'pointer',
        textAlign: 'left',
        padding: 'var(--space-4)',
        borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
        backgroundColor: active ? 'var(--color-accent-muted)' : 'var(--color-bg-card)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-2)',
        }}
      >
        <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{passage.title}</span>
        {active && <ChevronRight size={16} style={{ color: 'var(--color-accent)' }} aria-hidden="true" />}
      </div>
      <span
        style={{
          fontSize: '0.75rem',
          color: 'var(--color-text-muted)',
        }}
      >
        {DIFFICULTY_LABELS[passage.difficulty]}
      </span>
    </button>
  );
}

/* --------------------------------------------------------------------------
 * Active typing view
 * -------------------------------------------------------------------------- */

interface ActiveViewProps {
  snapshot: import('../types/typing').SessionSnapshot;
  onKeyDown: (event: KeyboardEvent | React.KeyboardEvent) => boolean;
  onRestart: () => void;
}

function charColor(status: import('../types/typing').CharStatus): string {
  switch (status) {
    case 'correct':
      return 'var(--color-text-primary)';
    case 'incorrect':
      return 'var(--color-error)';
    default:
      return 'var(--color-text-muted)';
  }
}

function ActiveView({ snapshot, onKeyDown, onRestart }: ActiveViewProps) {
  const regionRef = useRef<HTMLDivElement>(null);
  const { stats, remainingSeconds, currentText, charStatuses, currentIndex } = snapshot;

  // Focus the typing region whenever the active view mounts so keystrokes
  // are captured immediately, without requiring a click.
  useEffect(() => {
    regionRef.current?.focus();
  }, []);

  return (
    <div className="container" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-24)' }}>
      {/* Live stats bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-10)',
        }}
      >
        <StatChip icon={<Gauge size={16} aria-hidden="true" />} label="WPM" value={String(stats.wpm)} />
        <StatChip icon={<Target size={16} aria-hidden="true" />} label="Accuracy" value={`${stats.accuracy}%`} />
        <StatChip icon={<Clock size={16} aria-hidden="true" />} label="Time" value={`${remainingSeconds}s`} />
        <button type="button" className="btn btn-ghost btn-md" onClick={onRestart} style={{ marginLeft: 'auto' }}>
          <RotateCcw size={14} aria-hidden="true" />
          Restart
        </button>
      </div>

      {/* Typing region — focusable, captures keydown */}
      <div
        ref={regionRef}
        tabIndex={0}
        role="textbox"
        aria-label="Typing practice area. Type the text shown."
        onKeyDown={(e) => {
          onKeyDown(e);
        }}
        onClick={() => regionRef.current?.focus()}
        className="card"
        style={{
          outline: 'none',
          cursor: 'text',
          padding: 'var(--space-8) var(--space-6)',
          fontFamily: 'var(--font-mono)',
          fontSize: '1.25rem',
          lineHeight: 1.9,
          letterSpacing: '0.01em',
        }}
      >
        {currentText.split('').map((char, i) => {
          const status = charStatuses[i];
          const isCurrent = i === currentIndex;
          return (
            <span
              key={i}
              style={{
                color: charColor(status),
                backgroundColor: isCurrent ? 'var(--color-accent-muted)' : 'transparent',
                borderRadius: '2px',
                borderBottom: status === 'incorrect' ? '2px solid var(--color-error)' : 'none',
                whiteSpace: 'pre-wrap',
                position: 'relative',
              }}
            >
              {isCurrent && <Caret />}
              {char}
            </span>
          );
        })}
      </div>

      <p style={{ marginTop: 'var(--space-4)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
        Type the text above. Backspace fixes typos. The timer starts on your first keystroke.
      </p>
    </div>
  );
}

/** A blinking caret indicator rendered ahead of the current character. */
function Caret() {
  return (
    <span
      aria-hidden="true"
      className="animate-pulse-subtle"
      style={{
        display: 'inline-block',
        position: 'absolute',
        left: '-1px',
        top: 0,
        bottom: 0,
        width: '2px',
        backgroundColor: 'var(--color-accent)',
      }}
    />
  );
}

/* --------------------------------------------------------------------------
 * Results view
 * -------------------------------------------------------------------------- */

interface ResultsViewProps {
  snapshot: import('../types/typing').SessionSnapshot;
  onRestart: () => void;
  onBackToSetup: () => void;
}

function ResultsView({ snapshot, onRestart, onBackToSetup }: ResultsViewProps) {
  const { stats, elapsedSeconds } = snapshot;

  return (
    <div className="container" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-24)' }}>
      <div style={{ maxWidth: '42rem', margin: '0 auto' }} className="animate-slide-up">
        <h1
          style={{
            margin: '0 0 var(--space-2) 0',
            fontSize: '2rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          Session Complete
        </h1>
        <p style={{ margin: '0 0 var(--space-10) 0', color: 'var(--color-text-secondary)' }}>
          {elapsedSeconds} seconds of focused typing.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-10)',
          }}
        >
          <ResultCard label="WPM" value={String(stats.wpm)} highlight />
          <ResultCard label="Accuracy" value={`${stats.accuracy}%`} highlight />
          <ResultCard label="Correct" value={String(stats.correctChars)} />
          <ResultCard label="Wrong" value={String(stats.wrongChars)} />
          <ResultCard label="Backspaces" value={String(stats.backspaces)} />
          <ResultCard label="Words" value={String(stats.wordsTyped)} />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <button type="button" className="btn btn-primary btn-lg" onClick={onRestart}>
            <Play size={18} aria-hidden="true" />
            Try Again
          </button>
          <button type="button" className="btn btn-secondary btn-lg" onClick={onBackToSetup}>
            New Passage
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <p
        style={{
          margin: '0 0 var(--space-2) 0',
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: highlight ? '2.25rem' : '1.5rem',
          fontWeight: 700,
          color: highlight ? 'var(--color-accent)' : 'var(--color-text-primary)',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </p>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Shared stat chip
 * -------------------------------------------------------------------------- */

function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: '0.5rem 0.875rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-elevated)',
      }}
    >
      <span style={{ color: 'var(--color-accent)', display: 'inline-flex' }}>{icon}</span>
      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{label}</span>
      <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{value}</span>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Page controller
 * -------------------------------------------------------------------------- */

type Screen = 'setup' | 'active' | 'results';

export default function PracticePage() {
  const { snapshot, configure, reset, onKeyDown } = useTypingEngine();
  const recordAttempt = useHistoryStore((state) => state.recordAttempt);
  // This guard is reset only for a newly configured run, ensuring a completed
  // engine snapshot persists once even if React renders the result repeatedly.
  const hasRecordedCompletion = useRef(false);
  // `screen` tracks the user's intent (choosing vs. typing). Session
  // completion is derived directly from `snapshot.phase` during render, so
  // results appear immediately when the engine finishes — no effect needed.
  const [screen, setScreen] = useState<Screen>('setup');
  const [lastConfig, setLastConfig] = useState<SessionConfig | null>(null);

  const startSession = (config: SessionConfig) => {
    hasRecordedCompletion.current = false;
    setLastConfig(config);
    configure(config);
    setScreen('active');
  };

  const restart = () => {
    if (lastConfig) {
      hasRecordedCompletion.current = false;
      configure(lastConfig);
      setScreen('active');
    }
  };

  useEffect(() => {
    if (!snapshot || snapshot.phase !== 'complete' || !lastConfig || hasRecordedCompletion.current) return;

    hasRecordedCompletion.current = true;
    const { stats } = snapshot;
    recordAttempt({
      mode: 'practice',
      elapsedSeconds: snapshot.elapsedSeconds,
      configuredDurationSeconds: lastConfig.durationSeconds,
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      correctChars: stats.correctChars,
      wrongChars: stats.wrongChars,
      totalKeystrokes: stats.totalKeystrokes,
      missedChars: stats.missedChars,
    });
  }, [lastConfig, recordAttempt, snapshot]);

  const backToSetup = () => {
    reset();
    setScreen('setup');
  };

  if (screen === 'setup' || !snapshot) {
    return <SetupScreen onStart={startSession} />;
  }

  if (screen === 'results' || snapshot.phase === 'complete') {
    return <ResultsView snapshot={snapshot} onRestart={restart} onBackToSetup={backToSetup} />;
  }

  return <ActiveView snapshot={snapshot} onKeyDown={onKeyDown} onRestart={restart} />;
}
