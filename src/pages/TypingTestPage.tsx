/**
 * TYPEPLAY — TypingTestPage
 * ==========================================================================
 * Dedicated timed typing test experience. Reuses the existing TypingEngine via
 * useTypingEngine and supplies a long original text stream for continuous tests.
 */
import { useEffect, useRef, useState } from 'react';
import { Award, BarChart2, Clock, Gauge, Play, RotateCcw, Target, XCircle } from 'lucide-react';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { InteractiveKeyboard } from '../components/learning/InteractiveKeyboard';
import { getFingerForKey } from '../data/fingerMapping';
import type { CharStatus, SessionConfig, SessionSnapshot } from '../types/typing';
import { useHistoryStore } from '../stores/historyStore';

const DURATION_OPTIONS = [15, 30, 60, 120, 300] as const;
const VISIBLE_WINDOW = 220;

const TEST_SENTENCES = [
  'Focus on steady rhythm and clean movement across every key.',
  'Accurate typing starts with calm hands and a relaxed posture.',
  'Short bursts of practice build speed without sacrificing control.',
  'Read the next word early and let each finger return to home row.',
  'Smooth motion matters more than rushing through the passage.',
  'The best typists stay precise while gradually increasing pace.',
  'Keep your eyes on the screen and trust your muscle memory.',
  'Each correct character adds confidence to the flow of the test.',
  'Mistakes are useful signals when you correct your rhythm quickly.',
  'Consistent practice turns deliberate movement into fluent typing.',
];

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} SEC`;
  const minutes = seconds / 60;
  return `${minutes} MIN`;
}

function buildTestText(durationSeconds: number): string {
  const targetLength = Math.max(6000, durationSeconds * 55);
  const parts: string[] = [];
  let index = 0;

  while (parts.join(' ').length < targetLength) {
    parts.push(TEST_SENTENCES[index % TEST_SENTENCES.length]);
    index++;
  }

  return parts.join(' ');
}

function charColor(status: CharStatus): string {
  switch (status) {
    case 'correct':
      return 'var(--color-text-primary)';
    case 'incorrect':
      return 'var(--color-error)';
    default:
      return 'var(--color-text-muted)';
  }
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ComponentType<{ size?: number; 'aria-hidden'?: boolean | 'true' | 'false'; style?: React.CSSProperties }>;
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <article
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        padding: 'var(--space-5)',
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-muted)' }}>
        <Icon size={16} aria-hidden="true" style={{ color: accent ? 'var(--color-accent)' : 'var(--color-text-muted)' }} />
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
      </div>
      <strong
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: accent ? '2rem' : '1.5rem',
          lineHeight: 1.1,
          color: accent ? 'var(--color-accent)' : 'var(--color-text-primary)',
        }}
      >
        {value}
      </strong>
    </article>
  );
}

function SetupScreen({ selectedDuration, onDurationChange, onStart }: {
  selectedDuration: number;
  onDurationChange: (duration: number) => void;
  onStart: () => void;
}) {
  return (
    <div className="container" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-24)' }}>
      <div style={{ maxWidth: '50rem', margin: '0 auto', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 1rem',
            marginBottom: 'var(--space-4)',
            borderRadius: '999px',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-elevated)',
            color: 'var(--color-accent)',
            fontSize: '0.8125rem',
            fontWeight: 500,
          }}
        >
          <Gauge size={14} aria-hidden="true" />
          TYPEPLAY
        </div>

        <h1
          style={{
            margin: '0 0 var(--space-3) 0',
            fontSize: 'clamp(2.25rem, 6vw, 4rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: 'var(--color-text-primary)',
          }}
        >
          Timed Typing Test
        </h1>
        <p style={{ margin: '0 auto var(--space-12)', maxWidth: '34rem', color: 'var(--color-text-secondary)' }}>
          Choose your duration, start the clock, and type continuously until time reaches zero.
        </p>

        <section aria-labelledby="duration-heading" className="card" style={{ marginBottom: 'var(--space-8)' }}>
          <h2
            id="duration-heading"
            style={{
              margin: '0 0 var(--space-5) 0',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
            }}
          >
            Choose your duration
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(7rem, 1fr))',
              gap: 'var(--space-3)',
            }}
          >
            {DURATION_OPTIONS.map((duration) => {
              const active = duration === selectedDuration;
              return (
                <button
                  key={duration}
                  type="button"
                  className="btn btn-md"
                  aria-pressed={active}
                  onClick={() => onDurationChange(duration)}
                  style={{
                    justifyContent: 'center',
                    padding: 'var(--space-4)',
                    borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
                    backgroundColor: active ? 'var(--color-accent-muted)' : 'var(--color-bg-elevated)',
                    color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                  }}
                >
                  {formatDuration(duration)}
                </button>
              );
            })}
          </div>
        </section>

        <button type="button" className="btn btn-primary btn-lg" onClick={onStart}>
          <Play size={18} aria-hidden="true" />
          Start Test
        </button>
      </div>
    </div>
  );
}

function Caret() {
  return (
    <span
      aria-hidden="true"
      className="animate-pulse-subtle"
      style={{
        display: 'inline-block',
        position: 'absolute',
        left: '-1px',
        top: '0.15em',
        bottom: '0.15em',
        width: '2px',
        backgroundColor: 'var(--color-accent)',
      }}
    />
  );
}

function ActiveTest({ snapshot, onKeyDown, onRestart }: {
  snapshot: SessionSnapshot;
  onKeyDown: (event: KeyboardEvent | React.KeyboardEvent) => boolean;
  onRestart: () => void;
}) {
  const regionRef = useRef<HTMLDivElement>(null);
  const { stats, currentText, charStatuses, currentIndex, remainingSeconds } = snapshot;
  const windowStart = Math.max(0, currentIndex - 35);
  const windowEnd = Math.min(currentText.length, windowStart + VISIBLE_WINDOW);
  const visibleText = currentText.slice(windowStart, windowEnd);
  const targetKey = currentText[currentIndex] ?? null;
  const activeFinger = targetKey ? getFingerForKey(targetKey) : null;
  const progress = Math.min(100, (stats.totalKeystrokes / Math.max(1, currentText.length)) * 100);

  useEffect(() => {
    regionRef.current?.focus();
  }, []);

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(9rem, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-8)',
        }}
      >
        <StatCard icon={Clock} label="Time" value={`${remainingSeconds}s`} accent />
        <StatCard icon={Gauge} label="WPM" value={stats.wpm} accent />
        <StatCard icon={Target} label="Accuracy" value={`${stats.accuracy}%`} />
        <StatCard icon={Award} label="Correct" value={stats.correctChars} />
        <StatCard icon={XCircle} label="Wrong" value={stats.wrongChars} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <div
          aria-label="Test progress"
          style={{
            flex: 1,
            height: '0.5rem',
            overflow: 'hidden',
            borderRadius: '999px',
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: 'var(--color-accent)',
              transition: 'width var(--transition-fast)',
            }}
          />
        </div>
        <button type="button" className="btn btn-ghost btn-md" onClick={onRestart}>
          <RotateCcw size={14} aria-hidden="true" />
          Restart
        </button>
      </div>

      <div
        ref={regionRef}
        tabIndex={0}
        role="textbox"
        aria-label="Timed typing test area. Type the text shown."
        onKeyDown={(event) => onKeyDown(event)}
        onClick={() => regionRef.current?.focus()}
        className="card"
        style={{
          outline: 'none',
          cursor: 'text',
          padding: 'var(--space-8) var(--space-6)',
          marginBottom: 'var(--space-6)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(1rem, 2.3vw, 1.375rem)',
          lineHeight: 1.9,
          letterSpacing: '0.01em',
          overflowWrap: 'break-word',
        }}
      >
        {visibleText.split('').map((char, offset) => {
          const index = windowStart + offset;
          const status = charStatuses[index] ?? 'pending';
          const isCurrent = index === currentIndex;
          return (
            <span
              key={index}
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

      <InteractiveKeyboard
        targetKey={targetKey}
        activeFinger={activeFinger}
        charStatuses={charStatuses}
        currentIndex={currentIndex}
        disabled={snapshot.phase === 'complete'}
      />

      <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
        The timer started with the test. Keep typing until it reaches zero; more text is queued continuously.
      </p>
    </div>
  );
}

function ResultsScreen({ snapshot, duration, onTryAgain, onChangeDuration }: {
  snapshot: SessionSnapshot;
  duration: number;
  onTryAgain: () => void;
  onChangeDuration: () => void;
}) {
  const { stats } = snapshot;

  return (
    <div className="container" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-24)' }}>
      <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }} className="animate-slide-up">
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '4rem',
            height: '4rem',
            marginBottom: 'var(--space-5)',
            borderRadius: '50%',
            backgroundColor: 'var(--color-accent-muted)',
            color: 'var(--color-accent)',
            border: '1px solid var(--color-accent)',
          }}
        >
          <BarChart2 size={28} aria-hidden="true" />
        </div>

        <h1
          style={{
            margin: '0 0 var(--space-2) 0',
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
          }}
        >
          Test Complete
        </h1>
        <p style={{ margin: '0 0 var(--space-10) 0', color: 'var(--color-text-secondary)' }}>
          Final results for a {formatDuration(duration).toLowerCase()} timed test.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-10)',
          }}
        >
          <StatCard icon={Gauge} label="WPM" value={stats.wpm} accent />
          <StatCard icon={Target} label="Accuracy" value={`${stats.accuracy}%`} accent />
          <StatCard icon={Award} label="Correct" value={stats.correctChars} />
          <StatCard icon={XCircle} label="Wrong" value={stats.wrongChars} />
          <StatCard icon={BarChart2} label="Total" value={stats.totalKeystrokes} />
          <StatCard icon={Clock} label="Time" value={`${duration} SEC`} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <button type="button" className="btn btn-primary btn-lg" onClick={onTryAgain}>
            <Play size={18} aria-hidden="true" />
            Try Again
          </button>
          <button type="button" className="btn btn-secondary btn-lg" onClick={onChangeDuration}>
            Change Duration
          </button>
        </div>
      </div>
    </div>
  );
}

type Screen = 'setup' | 'active' | 'results';

export default function TypingTestPage() {
  const { snapshot, configure, reset, onKeyDown } = useTypingEngine();
  const recordAttempt = useHistoryStore((state) => state.recordAttempt);
  // A completed snapshot can render more than once; record it only for the
  // run that produced it, then reset the guard when a new test is configured.
  const hasRecordedCompletion = useRef(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [screen, setScreen] = useState<Screen>('setup');

  const startTest = (duration = selectedDuration) => {
    hasRecordedCompletion.current = false;
    const config: SessionConfig = {
      durationSeconds: duration,
      mode: 'speed',
      text: buildTestText(duration),
    };
    configure(config);
    setScreen('active');
  };

  useEffect(() => {
    if (!snapshot || snapshot.phase !== 'complete' || hasRecordedCompletion.current) return;

    hasRecordedCompletion.current = true;
    const { stats } = snapshot;
    recordAttempt({
      mode: 'timed-test',
      elapsedSeconds: snapshot.elapsedSeconds,
      configuredDurationSeconds: selectedDuration,
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      correctChars: stats.correctChars,
      wrongChars: stats.wrongChars,
      totalKeystrokes: stats.totalKeystrokes,
      missedChars: stats.missedChars,
    });
  }, [recordAttempt, selectedDuration, snapshot]);

  const changeDuration = () => {
    reset();
    setScreen('setup');
  };

  if (screen === 'setup' || !snapshot) {
    return (
      <SetupScreen
        selectedDuration={selectedDuration}
        onDurationChange={setSelectedDuration}
        onStart={() => startTest()}
      />
    );
  }

  if (screen === 'results' || snapshot.phase === 'complete') {
    return (
      <ResultsScreen
        snapshot={snapshot}
        duration={selectedDuration}
        onTryAgain={() => startTest(selectedDuration)}
        onChangeDuration={changeDuration}
      />
    );
  }

  return (
    <ActiveTest
      snapshot={snapshot}
      onKeyDown={onKeyDown}
      onRestart={() => startTest(selectedDuration)}
    />
  );
}
