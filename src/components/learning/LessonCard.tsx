/**
 * TYPEPLAY — LessonCard
 * ==========================================================================
 * Individual lesson card for the Learn page grid.
 * Shows: number, title, description, difficulty, status badge, lock state.
 * Clickable — navigates to lesson page when available.
 * Keyboard accessible, respects reduced-motion.
 */
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, PlayCircle, Clock } from 'lucide-react';
import type { Lesson, LessonStatus } from '../../types/learning';
import type { LessonProgress } from '../../types/learning';

interface LessonCardProps {
  /** The lesson data. */
  lesson: Lesson;
  /** Current progress for this lesson. */
  progress: LessonProgress;
  /** Whether this is the currently selected/active lesson. */
  isActive?: boolean;
  /** Click handler (alternative to Link navigation). */
  onClick?: (lessonId: string) => void;
}

const DIFFICULTY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  beginner: {
    bg: 'rgba(34, 197, 94, 0.15)',
    text: 'var(--color-success)',
    border: 'var(--color-success)',
  },
  intermediate: {
    bg: 'rgba(59, 130, 246, 0.15)',
    text: 'var(--color-accent)',
    border: 'var(--color-accent)',
  },
  advanced: {
    bg: 'rgba(168, 85, 247, 0.15)',
    text: 'var(--color-accent)',
    border: 'var(--color-accent)',
  },
};

const STATUS_ICONS: Record<LessonStatus, React.ReactNode> = {
  locked: <Lock size={16} aria-hidden="true" />,
  available: <PlayCircle size={16} aria-hidden="true" />,
  'in-progress': <Clock size={16} aria-hidden="true" />,
  completed: <CheckCircle size={16} aria-hidden="true" />,
};

const STATUS_LABELS: Record<LessonStatus, string> = {
  locked: 'Locked',
  available: 'Start',
  'in-progress': 'In Progress',
  completed: 'Completed',
};

function StatusBadge({ status, difficulty }: { status: LessonStatus; difficulty: LessonCardProps['lesson']['difficulty'] }) {
  const style = DIFFICULTY_STYLES[difficulty];
  const Icon = STATUS_ICONS[status];
  const label = STATUS_LABELS[status];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.25rem 0.625rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
      }}
      aria-label={`${label} — ${difficulty} difficulty`}
    >
      {Icon}
      {label}
    </span>
  );
}

export function LessonCard({ lesson, progress, isActive = false, onClick }: LessonCardProps) {
  const navigate = useNavigate();
  const isLocked = progress.status === 'locked';
  const isCompleted = progress.status === 'completed';

  const handleClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(lesson.id);
    } else {
      navigate(`/learn/${lesson.id}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isLocked) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onClick) {
        onClick(lesson.id);
      } else {
        navigate(`/learn/${lesson.id}`);
      }
    }
  };

  return (
    <article
      className="lesson-card"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        padding: 'var(--space-5)',
        backgroundColor: 'var(--color-bg-elevated)',
        border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-lg)',
        transition: 'all 200ms ease',
        cursor: isLocked ? 'not-allowed' : 'pointer',
        opacity: isLocked ? 0.5 : 1,
        boxShadow: isActive ? '0 0 0 1px var(--color-accent), 0 4px 12px rgba(0,0,0,0.15)' : 'none',
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isLocked ? -1 : 0}
      role={isLocked ? 'article' : 'button'}
      aria-disabled={isLocked}
      aria-label={isLocked ? `${lesson.title} — Locked. Complete previous lesson first.` : `${lesson.title} — ${STATUS_LABELS[progress.status]}`}
    >
      {/* Lesson number + status badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              backgroundColor: isCompleted ? 'var(--color-success)' : 'var(--color-accent-muted)',
              color: isCompleted ? 'white' : 'var(--color-accent)',
              fontWeight: 700,
              fontSize: '0.875rem',
              fontFamily: 'var(--font-mono)',
              border: isCompleted ? 'none' : '1px solid var(--color-accent)',
            }}
          >
            {lesson.number}
          </span>
          {isLocked && (
            <Lock
              size={18}
              aria-hidden="true"
              style={{ color: 'var(--color-text-muted)', flexShrink: 0, marginTop: '0.125rem' }}
            />
          )}
        </div>
        <StatusBadge status={progress.status} difficulty={lesson.difficulty} />
      </div>

      {/* Title & description */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <h3
          style={{
            margin: 0,
            fontSize: '1.125rem',
            fontWeight: 600,
            color: isLocked ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
            lineHeight: 1.3,
          }}
        >
          {lesson.title}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          {lesson.description}
        </p>
      </div>

      {/* Progress stats */}
      {progress.attempts > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-mono)',
            paddingTop: 'var(--space-2)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <PlayCircle size={12} aria-hidden="true" />
            {progress.attempts} attempt{progress.attempts !== 1 ? 's' : ''}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {progress.bestAccuracy > 0 && (
              <>
                <span>Best: </span>
                <strong style={{ color: 'var(--color-text-primary)' }}>{progress.bestAccuracy}%</strong>
                <span> accuracy</span>
              </>
            )}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {progress.bestWPM > 0 && (
              <>
                <span>Best: </span>
                <strong style={{ color: 'var(--color-text-primary)' }}>{progress.bestWPM}</strong>
                <span> WPM</span>
              </>
            )}
          </span>
        </div>
      )}

      {/* Completion timestamp */}
      {isCompleted && progress.completedAt && (
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-success)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Completed {new Date(progress.completedAt).toLocaleDateString()}
        </div>
      )}

      {/* Prerequisite notice */}
      {isLocked && lesson.prerequisite && (
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            fontStyle: 'italic',
          }}
        >
          Complete previous lesson to unlock
        </div>
      )}
    </article>
  );
}