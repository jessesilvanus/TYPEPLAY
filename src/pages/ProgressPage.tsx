/**
 * TYPEPLAY — ProgressPage
 * ==========================================================================
 * A combined dashboard for persistent Practice/Test session history and the
 * existing lesson curriculum. Session metrics are derived from final engine
 * snapshots saved by the history store; lesson progress remains independent.
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Target, TrendingUp, Award, Clock, Lock, BarChart2 } from 'lucide-react';
import { useLearning } from '../hooks/useLearning';
import { LessonCard } from '../components/learning/LessonCard';
import { useHistoryStore, type HistoryAttempt } from '../stores/historyStore';

function StatCard({
  icon: Icon,
  value,
  label,
  color = 'var(--color-accent)',
}: {
  icon: React.ComponentType<{ size?: number }>;
  value: string | number;
  label: string;
  color?: string;
}) {
  return (
    <article
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        padding: 'var(--space-5)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: `${color}33`,
          color,
          margin: '0 auto',
        }}
      >
        <Icon size={20} aria-hidden="true" />
      </div>
      <div
        style={{
          fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-primary)',
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: '0.8125rem',
          color: 'var(--color-text-secondary)',
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </article>
  );
}

function formatElapsedTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}

function formatAttemptDate(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Saved attempt';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function modeLabel(mode: HistoryAttempt['mode']): string {
  return mode === 'practice' ? 'Practice' : 'Timed Test';
}

function HistoryChart({ attempts }: { attempts: HistoryAttempt[] }) {
  const data = attempts.slice(0, 12).reverse();
  const width = 640;
  const height = 218;
  const padding = { top: 18, right: 20, bottom: 34, left: 38 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const maxWpm = Math.max(20, ...data.map((attempt) => attempt.wpm));
  const pointX = (index: number) => padding.left + (data.length === 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth);
  const wpmY = (value: number) => padding.top + innerHeight - (value / maxWpm) * innerHeight;
  const accuracyY = (value: number) => padding.top + innerHeight - (value / 100) * innerHeight;
  const toPath = (valueForAttempt: (attempt: HistoryAttempt) => number, yForValue: (value: number) => number) =>
    data.map((attempt, index) => `${index === 0 ? 'M' : 'L'} ${pointX(index)} ${yForValue(valueForAttempt(attempt))}`).join(' ');

  return (
    <section className="card" aria-labelledby="history-chart-heading" style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        <div>
          <h2 id="history-chart-heading" style={{ margin: 0, fontSize: '1.125rem' }}>Recent performance</h2>
          <p style={{ margin: 'var(--space-1) 0 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            WPM and accuracy across your last {data.length} completed {data.length === 1 ? 'session' : 'sessions'}.
          </p>
        </div>
        <div aria-label="Chart legend" style={{ display: 'flex', gap: 'var(--space-4)', color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}><i aria-hidden="true" style={{ width: '0.625rem', height: '0.625rem', borderRadius: '50%', backgroundColor: 'var(--color-accent)' }} /> WPM</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}><i aria-hidden="true" style={{ width: '0.625rem', height: '0.625rem', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} /> Accuracy</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Line chart showing recent WPM and accuracy" style={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible' }}>
        {[0, 0.5, 1].map((fraction) => {
          const y = padding.top + innerHeight * fraction;
          return <line key={fraction} x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="var(--color-border)" strokeWidth="1" />;
        })}
        <text x="0" y={padding.top + 4} fill="var(--color-text-muted)" fontSize="11">{maxWpm}</text>
        <text x="0" y={padding.top + innerHeight + 4} fill="var(--color-text-muted)" fontSize="11">0</text>
        <text x={width - padding.right} y={padding.top + 4} textAnchor="end" fill="var(--color-text-muted)" fontSize="11">100%</text>
        <path d={toPath((attempt) => attempt.wpm, wpmY)} fill="none" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d={toPath((attempt) => attempt.accuracy, accuracyY)} fill="none" stroke="var(--color-success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((attempt, index) => (
          <g key={attempt.id}>
            <circle cx={pointX(index)} cy={wpmY(attempt.wpm)} r="4" fill="var(--color-accent)" />
            <circle cx={pointX(index)} cy={accuracyY(attempt.accuracy)} r="4" fill="var(--color-success)" />
            <text x={pointX(index)} y={height - 8} textAnchor="middle" fill="var(--color-text-muted)" fontSize="10">{index + 1}</text>
          </g>
        ))}
      </svg>
      <p style={{ margin: 'var(--space-3) 0 0', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
        Oldest to newest · WPM uses the left scale; accuracy uses the percentage scale.
      </p>
    </section>
  );
}

function RecentAttempts({ attempts }: { attempts: HistoryAttempt[] }) {
  return (
    <section aria-labelledby="recent-attempts-heading" className="card" style={{ marginBottom: 'var(--space-12)', padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--color-border)' }}>
        <h2 id="recent-attempts-heading" style={{ margin: 0, fontSize: '1.125rem' }}>Recent attempts</h2>
        <p style={{ margin: 'var(--space-1) 0 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Final results are saved automatically when a session finishes.
        </p>
      </div>
      <div role="list" aria-label="Recent practice and timed test attempts">
        {attempts.slice(0, 6).map((attempt, index) => (
          <article
            key={attempt.id}
            role="listitem"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(8rem, 1.5fr) repeat(3, minmax(4.5rem, 0.75fr))',
              alignItems: 'center',
              gap: 'var(--space-4)',
              padding: 'var(--space-4) var(--space-6)',
              borderBottom: index === Math.min(attempts.length, 6) - 1 ? 'none' : '1px solid var(--color-border)',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <strong style={{ display: 'block', fontSize: '0.9375rem' }}>{modeLabel(attempt.mode)}</strong>
              <span style={{ display: 'block', marginTop: '0.125rem', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                {formatAttemptDate(attempt.timestamp)} · {formatElapsedTime(attempt.elapsedSeconds)}
              </span>
            </div>
            <AttemptMetric label="WPM" value={attempt.wpm} accent />
            <AttemptMetric label="Accuracy" value={`${attempt.accuracy}%`} />
            <AttemptMetric label="Correct" value={attempt.correctChars} />
          </article>
        ))}
      </div>
    </section>
  );
}

function AttemptMetric({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div style={{ minWidth: 0, textAlign: 'right' }}>
      <span style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
      <strong style={{ display: 'block', marginTop: '0.125rem', color: accent ? 'var(--color-accent)' : 'var(--color-text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.9375rem' }}>{value}</strong>
    </div>
  );
}

function EmptyHistory() {
  return (
    <section className="card" aria-labelledby="empty-history-heading" style={{ marginBottom: 'var(--space-12)', padding: 'var(--space-10)', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '3.5rem', height: '3.5rem', borderRadius: '50%', backgroundColor: 'var(--color-accent-muted)', color: 'var(--color-accent)', marginBottom: 'var(--space-4)' }}>
        <BarChart2 size={24} aria-hidden="true" />
      </div>
      <h2 id="empty-history-heading" style={{ margin: '0 0 var(--space-2)', fontSize: '1.25rem' }}>Your session history will appear here</h2>
      <p style={{ maxWidth: '34rem', margin: '0 auto var(--space-6)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
        Complete a Practice session or Timed Test to save your WPM, accuracy, and typing totals on this device.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <Link to="/practice" className="btn btn-primary btn-md">Start Practice</Link>
        <Link to="/test" className="btn btn-secondary btn-md">Take a Timed Test</Link>
      </div>
    </section>
  );
}

export default function ProgressPage() {
  const { lessons, allProgress, getLessonProgress } = useLearning();
  const attempts = useHistoryStore((state) => state.attempts);

  const lessonStats = useMemo(() => {
    let completed = 0;
    let available = 0;
    let locked = 0;
    let totalAttempts = 0;
    let bestOverallAccuracy = 0;
    let bestOverallWPM = 0;

    lessons.forEach((lesson) => {
      const progress = allProgress[lesson.id] ?? getLessonProgress(lesson.id);
      if (progress.status === 'completed') completed++;
      else if (progress.status === 'available' || progress.status === 'in-progress') available++;
      else locked++;

      totalAttempts += progress.attempts;
      bestOverallAccuracy = Math.max(bestOverallAccuracy, progress.bestAccuracy);
      bestOverallWPM = Math.max(bestOverallWPM, progress.bestWPM);
    });

    return { completed, available, locked, totalAttempts, bestOverallAccuracy, bestOverallWPM };
  }, [lessons, allProgress, getLessonProgress]);

  const historyStats = useMemo(() => {
    const totalElapsedSeconds = attempts.reduce((total, attempt) => total + attempt.elapsedSeconds, 0);
    const totalWpm = attempts.reduce((total, attempt) => total + attempt.wpm, 0);
    const totalAccuracy = attempts.reduce((total, attempt) => total + attempt.accuracy, 0);
    const bestWpm = attempts.reduce((best, attempt) => Math.max(best, attempt.wpm), 0);
    const bestAccuracy = attempts.reduce((best, attempt) => Math.max(best, attempt.accuracy), 0);

    return {
      totalElapsedSeconds,
      averageWpm: attempts.length > 0 ? Math.round(totalWpm / attempts.length) : 0,
      averageAccuracy: attempts.length > 0 ? Math.round((totalAccuracy / attempts.length) * 10) / 10 : 0,
      bestWpm,
      bestAccuracy,
    };
  }, [attempts]);

  const hasLessonProgress = lessonStats.totalAttempts > 0;
  const hasHistory = attempts.length > 0;

  return (
    <div className="progress-page" style={{ minHeight: '100vh', padding: 'var(--space-8) var(--space-6) var(--space-16)', backgroundColor: 'var(--color-bg)' }}>
      <div className="container" style={{ maxWidth: '80rem' }}>
        <header style={{ textAlign: 'center', marginBottom: 'var(--space-12)', paddingTop: 'var(--space-4)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 1rem', marginBottom: 'var(--space-4)', borderRadius: '999px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-accent)', fontSize: '0.8125rem', fontWeight: 500 }}>
            <BarChart2 size={14} aria-hidden="true" />
            Progress Dashboard
          </div>
          <h1 style={{ margin: '0 0 var(--space-4)', fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>Your Progress</h1>
          <p style={{ margin: '0 auto', maxWidth: '42rem', fontSize: '1.125rem', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
            Track completed practice and timed sessions alongside your touch-typing curriculum.
          </p>
        </header>

        <section aria-labelledby="session-stats-heading" style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
            <div>
              <h2 id="session-stats-heading" style={{ margin: 0, fontSize: '1.25rem' }}>Session history</h2>
              <p style={{ margin: 'var(--space-1) 0 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Your completed Practice and Timed Test results.</p>
            </div>
            {hasHistory && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>{attempts.length} saved {attempts.length === 1 ? 'attempt' : 'attempts'}</span>}
          </div>
          {hasHistory && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-4)' }} role="list" aria-label="Session history statistics">
              <StatCard icon={BarChart2} value={attempts.length} label="Completed Sessions" color="var(--color-accent)" />
              <StatCard icon={TrendingUp} value={historyStats.averageWpm} label="Average WPM" color="var(--color-warning)" />
              <StatCard icon={Target} value={`${historyStats.averageAccuracy}%`} label="Average Accuracy" color="var(--color-success)" />
              <StatCard icon={Award} value={historyStats.bestWpm} label="Best WPM" color="var(--color-accent)" />
              <StatCard icon={Clock} value={formatElapsedTime(historyStats.totalElapsedSeconds)} label="Time Typed" color="var(--color-text-secondary)" />
            </div>
          )}
        </section>

        {hasHistory ? <><HistoryChart attempts={attempts} /><RecentAttempts attempts={attempts} /></> : <EmptyHistory />}

        <section aria-labelledby="learning-stats-heading" style={{ marginBottom: 'var(--space-12)' }}>
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <h2 id="learning-stats-heading" style={{ margin: 0, fontSize: '1.25rem' }}>Learning progress</h2>
            <p style={{ margin: 'var(--space-1) 0 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Structured lessons stay on their own progression path.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-4)' }} role="list" aria-label="Learning progress statistics">
            <StatCard icon={Award} value={lessonStats.completed} label="Lessons Completed" color="var(--color-success)" />
            <StatCard icon={Target} value={lessonStats.available} label="Available Now" color="var(--color-accent)" />
            <StatCard icon={Lock} value={lessonStats.locked} label="Still Locked" color="var(--color-text-muted)" />
            <StatCard icon={Clock} value={lessonStats.totalAttempts} label="Lesson Attempts" color="var(--color-accent)" />
            <StatCard icon={Target} value={lessonStats.bestOverallAccuracy > 0 ? `${lessonStats.bestOverallAccuracy}%` : '—'} label="Best Lesson Accuracy" color="var(--color-success)" />
            <StatCard icon={TrendingUp} value={lessonStats.bestOverallWPM > 0 ? lessonStats.bestOverallWPM : '—'} label="Best Lesson WPM" color="var(--color-warning)" />
          </div>
        </section>

        <section aria-labelledby="lessons-heading">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
            <h2 id="lessons-heading" style={{ margin: 0, fontSize: '1.25rem' }}>Lesson progression</h2>
            {!hasLessonProgress && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>Lesson 1 is ready when you are.</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(22rem, 1fr))', gap: 'var(--space-5)' }} role="list" aria-label="Typing lessons">
            {lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} progress={allProgress[lesson.id] ?? getLessonProgress(lesson.id)} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
