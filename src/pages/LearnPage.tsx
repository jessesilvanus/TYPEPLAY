/**
 * TYPEPLAY — LearnPage
 * ==========================================================================
 * Main learning hub: grid of 9 lesson cards with progress tracking.
 * Navigates to /learn/:lessonId for individual lesson practice.
 */
import { GraduationCap, Target, TrendingUp } from 'lucide-react';
import { useLearning } from '../hooks/useLearning';
import { LessonCard } from '../components/learning/LessonCard';

export default function LearnPage() {
  const { lessons, getLessonProgress } = useLearning();

  return (
    <div
      className="learn-page"
      style={{
        minHeight: '100vh',
        padding: 'var(--space-8) var(--space-6) var(--space-16)',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <div className="container" style={{ maxWidth: '80rem' }}>
        {/* Hero section */}
        <header
          style={{
            textAlign: 'center',
            marginBottom: 'var(--space-12)',
            paddingTop: 'var(--space-4)',
          }}
        >
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
            <GraduationCap size={14} aria-hidden="true" />
            Touch Typing Curriculum
          </div>

          <h1
            style={{
              margin: '0 0 var(--space-4) 0',
              fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
            }}
          >
            Learn to Type
          </h1>

          <p
            style={{
              margin: '0 auto',
              maxWidth: '42rem',
              fontSize: '1.125rem',
              lineHeight: 1.6,
              color: 'var(--color-text-secondary)',
            }}
          >
            A structured 9-lesson path from home row to fluent typing.
            Each lesson builds on the last — master the fundamentals, then speed.
          </p>

          {/* Quick stats */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-6)',
              marginTop: 'var(--space-8)',
              paddingTop: 'var(--space-6)',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)' }}>
              <GraduationCap size={18} aria-hidden="true" style={{ color: 'var(--color-accent)' }} />
              <span>{lessons.length} Lessons</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)' }}>
              <Target size={18} aria-hidden="true" style={{ color: 'var(--color-success)' }} />
              <span>Accuracy-First</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)' }}>
              <TrendingUp size={18} aria-hidden="true" style={{ color: 'var(--color-warning)' }} />
              <span>Progressive Difficulty</span>
            </div>
          </div>
        </header>

        {/* Lesson grid */}
        <section aria-labelledby="lessons-heading">
          <h2 id="lessons-heading" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }}>
            Lessons
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(28rem, 1fr))',
              gap: 'var(--space-5)',
            }}
            role="list"
            aria-label="Typing lessons"
          >
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                progress={getLessonProgress(lesson.id)}
              />
            ))}
          </div>
        </section>

        {/* Footer guidance */}
        <footer
          style={{
            marginTop: 'var(--space-12)',
            paddingTop: 'var(--space-6)',
            borderTop: '1px solid var(--color-border)',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            fontSize: '0.875rem',
          }}
        >
          <p style={{ margin: '0 0 var(--space-2) 0' }}>
            <strong style={{ color: 'var(--color-text-secondary)' }}>How it works:</strong>{' '}
            Click an available lesson to start. Type the shown text — accuracy matters more than speed.
          </p>
          <p style={{ margin: 0 }}>
            Complete a lesson with the target accuracy to unlock the next one. Your progress saves automatically.
          </p>
        </footer>
      </div>
    </div>
  );
}