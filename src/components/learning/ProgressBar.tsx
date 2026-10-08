/**
 * TYPEPLAY — ProgressBar
 * ==========================================================================
 * Lesson progress indicator showing character progress, accuracy, WPM,
 * and current target key/finger. Reusable component for lesson header.
 */
import { useMemo } from 'react';
import { Target, Zap, Clock } from 'lucide-react';
import type { CharStatus } from '../../types/typing';

interface ProgressBarProps {
  /** Total characters in the lesson text. */
  totalChars: number;
  /** Current character index (0-based). */
  currentIndex: number;
  /** Current accuracy percentage (0-100). */
  accuracy: number;
  /** Current WPM. */
  wpm: number;
  /** Current target character. */
  targetKey: string | null;
  /** Current target finger. */
  targetFinger: string | null;
  /** Character statuses array. */
  charStatuses: CharStatus[];
  /** Whether the session is complete. */
  isComplete?: boolean;
  /** Compact mode. */
  compact?: boolean;
}

function MetricItem({ icon: Icon, value, label, color = 'var(--color-text-primary)' }: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  value: string | number;
  label: string;
  color?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color }}>
      <Icon size={14} />
      <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{value}</span>
      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{label}</span>
    </div>
  );
}

function ProgressFill({ progress, color = 'var(--color-accent)' }: { progress: number; color?: string }) {
  return (
    <div
      style={{
        height: '100%',
        width: `${Math.min(100, Math.max(0, progress))}%`,
        backgroundColor: color,
        borderRadius: 'inherit',
        transition: 'width 150ms ease-out',
      }}
    />
  );
}

/** Format finger name for display (e.g., "left-pinky" → "LEFT PINKY"). */
function formatFinger(finger: string): string {
  return finger.replace('-', ' ').toUpperCase();
}

/** Get hand label from finger (e.g., "left-pinky" → "LEFT HAND"). */
function getHandFromFinger(finger: string): string {
  if (finger.startsWith('left-')) return 'LEFT HAND';
  if (finger.startsWith('right-')) return 'RIGHT HAND';
  if (finger === 'thumbs') return 'BOTH THUMBS';
  return '';
}

export function ProgressBar({
  totalChars,
  currentIndex,
  accuracy,
  wpm,
  targetKey,
  targetFinger,
  charStatuses,
  isComplete = false,
  compact = false,
}: ProgressBarProps) {
  const progressPercent = useMemo(() => {
    if (totalChars === 0) return 0;
    return (currentIndex / totalChars) * 100;
  }, [totalChars, currentIndex]);

  const correctCount = useMemo(() =>
    charStatuses.filter((s) => s === 'correct').length,
    [charStatuses],
  );

  const incorrectCount = useMemo(() =>
    charStatuses.filter((s) => s === 'incorrect').length,
    [charStatuses],
  );

  const gap = compact ? 'var(--space-3)' : 'var(--space-5)';
  const padding = compact ? 'var(--space-2) var(--space-3)' : 'var(--space-3) var(--space-4)';
  const fontSize = compact ? '0.75rem' : '0.8125rem';
  const barHeight = compact ? 6 : 8;

  return (
    <div
      className="progress-bar"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        padding: padding,
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
      }}
      role="progressbar"
      aria-valuenow={Math.round(progressPercent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Lesson progress: ${Math.round(progressPercent)}% complete`}
    >
      {/* Main progress bar */}
      <div style={{ width: '100%' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.375rem',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
          }}
        >
          <span>Progress</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
            {currentIndex} / {totalChars} ({Math.round(progressPercent)}%)
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: barHeight,
            backgroundColor: 'var(--color-bg-deep)',
            borderRadius: barHeight / 2,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <ProgressFill progress={progressPercent} />
        </div>
      </div>

      {/* Current target key + finger guidance */}
      {targetKey && !isComplete && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-accent-muted)',
            border: '1px solid var(--color-accent)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              minWidth: '5rem',
            }}
          >
            <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
              CURRENT KEY
            </span>
            <kbd
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '3rem',
                height: '2.5rem',
                padding: '0 0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-bg)',
                border: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '1.125rem',
                fontWeight: 700,
              }}
            >
              {targetKey === ' ' ? 'SPACE' : targetKey.toUpperCase()}
            </kbd>
          </div>

          {targetFinger && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '0.125rem',
                flex: 1,
                borderLeft: '1px solid var(--color-accent)',
                paddingLeft: 'var(--space-4)',
              }}
            >
              <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
                USE
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>
                {formatFinger(targetFinger)}
              </span>
              <span style={{ fontSize: '0.625rem', fontWeight: 500, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
                {getHandFromFinger(targetFinger)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Metrics row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: gap,
          fontSize,
        }}
      >
        <MetricItem icon={Target} value={`${accuracy}%`} label="Accuracy" color={accuracy >= 90 ? 'var(--color-success)' : accuracy >= 75 ? 'var(--color-warning)' : 'var(--color-error)'} />
        <MetricItem icon={Zap} value={wpm} label="WPM" />
        <MetricItem icon={Clock} value={`${correctCount}c / ${incorrectCount}e`} label="Correct / Errors" />

        {isComplete && (
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              color: 'var(--color-success)',
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Complete
          </div>
        )}
      </div>
    </div>
  );
}