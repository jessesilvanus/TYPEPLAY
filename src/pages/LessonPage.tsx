/**
 * TYPEPLAY — LessonPage
 * ==========================================================================
 * Active lesson view: finger guide + key guidance + typing region + keyboard.
 * Reuses the existing TypingEngine via useTypingEngine hook.
 * On completion: checks accuracy, shows completion UI, unlocks next lesson.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Info } from 'lucide-react';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { useLearning } from '../hooks/useLearning';
import { InteractiveKeyboard } from '../components/learning/InteractiveKeyboard';
import { FingerGuide } from '../components/learning/FingerGuide';
import { ProgressBar } from '../components/learning/ProgressBar';
import type { SessionConfig, CharStatus } from '../types/typing';
import { getLesson } from '../data/lessons';

const LESSON_DURATION_SECONDS = 60;

interface CompletionData {
  accuracy: number;
  wpm: number;
  passed: boolean;
}

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { lessons, getLessonProgress, isLessonAvailable, startLesson, recordAttempt, completeLesson, getNextLessonFor, getFingerForChar } = useLearning();
  const { snapshot, configure, reset, onKeyDown } = useTypingEngine();

  const lesson = useMemo(() => (lessonId ? getLesson(lessonId) : null), [lessonId]);
  const progress = useMemo(() => (lessonId ? getLessonProgress(lessonId) : null), [lessonId, getLessonProgress]);
  const available = useMemo(() => (lessonId ? isLessonAvailable(lessonId) : false), [lessonId, isLessonAvailable]);
  const nextLesson = useMemo(() => (lessonId ? getNextLessonFor(lessonId) : null), [lessonId, getNextLessonFor]);

  // Derived values (must be before early returns for hook rules)
  const totalChars = lesson?.practiceText.length ?? 0;
  const currentIndex = snapshot?.currentIndex ?? 0;
  const accuracy = snapshot?.stats.accuracy ?? 0;
  const wpm = snapshot?.stats.wpm ?? 0;
  const charStatuses = snapshot?.charStatuses ?? [];
  const isComplete = snapshot?.phase === 'complete';

  // Build the typing display text with character-level status
  const typingDisplay = useMemo(() => {
    if (!snapshot || !lesson) return [];
    const text = lesson.practiceText;
    const statuses = snapshot.charStatuses;
    return text.split('').map((char: string, idx: number) => ({
      char: char === ' ' ? ' ' : char,
      status: statuses[idx] ?? ('pending' as CharStatus),
      isCurrent: idx === snapshot.currentIndex,
    }));
  }, [snapshot, lesson]);

  const [showCompletion, setShowCompletion] = useState<CompletionData | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Auto-start lesson when page loads
  useEffect(() => {
    if (lesson && available && !hasStarted && !showCompletion) {
      startLesson(lesson.id);
      setHasStarted(true);
    }
  }, [lesson, available, hasStarted, showCompletion, startLesson]);

  // Configure engine when lesson is ready
  useEffect(() => {
    if (lesson && hasStarted && !showCompletion) {
      const config: SessionConfig = {
        text: lesson.practiceText,
        durationSeconds: LESSON_DURATION_SECONDS,
        mode: 'learn',
      };
      configure(config);
    }
  }, [lesson, hasStarted, showCompletion, configure]);

  // Handle session completion
  useEffect(() => {
    if (snapshot?.phase === 'complete' && !showCompletion) {
      const acc = snapshot.stats.accuracy;
      const spm = snapshot.stats.wpm;
      const passed = acc >= (lesson?.minimumAccuracy ?? 80);

      setShowCompletion({ accuracy: acc, wpm: spm, passed });

      if (lessonId) {
        if (passed) {
          completeLesson(acc, spm);
        } else {
          recordAttempt(acc, spm);
        }
      }
    }
  }, [snapshot, showCompletion, lesson, lessonId, completeLesson, recordAttempt]);

  // Keyboard handler for typing region
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (showCompletion) return;
      onKeyDown(e);
    },
    [onKeyDown, showCompletion],
  );

  // Get current target character and finger
  const targetKey = useMemo(() => {
    if (!snapshot || snapshot.phase !== 'active') return null;
    if (snapshot.currentIndex >= snapshot.currentText.length) return null;
    return snapshot.currentText[snapshot.currentIndex];
  }, [snapshot]);

  const targetFinger = useMemo(() => {
    if (!targetKey) return null;
    return getFingerForChar(targetKey);
  }, [targetKey, getFingerForChar]);

  // Handle restart
  const handleRestart = () => {
    reset();
    setShowCompletion(null);
    setHasStarted(false);
  };

  // Handle continue to next lesson
  const handleNextLesson = () => {
    if (nextLesson) {
      navigate(`/learn/${nextLesson.id}`);
    } else {
      navigate('/learn');
    }
  };

  // Handle go back
  const handleBack = () => {
    navigate('/learn');
  };

  if (!lesson) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 'var(--space-8)' }}>
        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <p>Lesson not found</p>
          <Link to="/learn" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
            Back to Lessons
          </Link>
        </div>
      </div>
    );
  }

  if (!available && progress?.status === 'locked') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 'var(--space-8)' }}>
        <div style={{ textAlign: 'center', maxWidth: '24rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>&#128274;</div>
          <h2 style={{ margin: '0 0 var(--space-2) 0', color: 'var(--color-text-primary)' }}>Lesson Locked</h2>
          <p style={{ margin: '0 0 var(--space-6) 0', color: 'var(--color-text-secondary)' }}>
            Complete the previous lesson to unlock this one.
          </p>
          <Link to="/learn" className="btn btn-primary">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Lessons
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="lesson-page"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        padding: 'var(--space-4) var(--space-6) var(--space-8)',
      }}
    >
      <div className="container" style={{ maxWidth: '90rem' }}>
        {/* Header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
            paddingBottom: 'var(--space-4)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <button
            onClick={handleBack}
            className="btn btn-ghost"
            style={{ padding: '0.5rem', flexShrink: 0 }}
            aria-label="Back to lessons"
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.25rem 0.625rem',
                marginBottom: '0.25rem',
                borderRadius: '999px',
                backgroundColor: 'var(--color-accent-muted)',
                color: 'var(--color-accent)',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Lesson {lesson.number} of {lessons.length}
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                lineHeight: 1.2,
              }}
            >
              {lesson.title}
            </h1>
          </div>

          {/* Timer display */}
          {snapshot && snapshot.phase === 'active' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                fontFamily: 'var(--font-mono)',
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--color-accent)',
              }}
              aria-live="polite"
              aria-label={`Time remaining: ${Math.ceil(snapshot.remainingSeconds)} seconds`}
            >
              {Math.ceil(snapshot.remainingSeconds)}s
            </div>
          )}
        </header>

        {/* Completion Modal */}
        {showCompletion && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-8)',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(4px)',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="completion-title"
          >
            <div
              style={{
                width: '100%',
                maxWidth: '32rem',
                padding: 'var(--space-8)',
                backgroundColor: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              }}
            >
              <div
                id="completion-title"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '4rem',
                  height: '4rem',
                  margin: '0 auto var(--space-4)',
                  borderRadius: '50%',
                  backgroundColor: showCompletion.passed
                    ? 'rgba(34, 197, 94, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)',
                  color: showCompletion.passed ? 'var(--color-success)' : 'var(--color-error)',
                }}
              >
                {showCompletion.passed ? (
                  <CheckCircle size={24} aria-hidden="true" />
                ) : (
                  <XCircle size={24} aria-hidden="true" />
                )}
              </div>

              <h2
                style={{
                  margin: '0 0 var(--space-2) 0',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: showCompletion.passed ? 'var(--color-success)' : 'var(--color-text-primary)',
                }}
              >
                {showCompletion.passed ? 'Lesson Complete' : 'Almost There'}
              </h2>

              <p style={{ margin: '0 0 var(--space-6) 0', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {showCompletion.passed
                  ? `Great work! You achieved ${showCompletion.accuracy}% accuracy (target: ${lesson.minimumAccuracy}%).`
                  : `You scored ${showCompletion.accuracy}% accuracy. The target is ${lesson.minimumAccuracy}%. Focus on accuracy and try again.`}
              </p>

              {/* Stats */}
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--space-8)',
                  marginBottom: 'var(--space-6)',
                  justifyContent: 'center',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                    {showCompletion.accuracy}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accuracy</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                    {showCompletion.wpm}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>WPM</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', justifyContent: 'center' }}>
                <button
                  onClick={handleRestart}
                  className="btn btn-secondary"
                  style={{ flex: 1, minWidth: '12rem' }}
                >
                  <RotateCcw size={16} aria-hidden="true" />
                  Try Again
                </button>
                {showCompletion.passed && nextLesson && (
                  <button
                    onClick={handleNextLesson}
                    className="btn btn-primary"
                    style={{ flex: 1, minWidth: '12rem' }}
                  >
                    Next Lesson
                    <ArrowLeft size={16} aria-hidden="true" style={{ transform: 'rotate(180deg)' }} />
                  </button>
                )}
                {showCompletion.passed && !nextLesson && (
                  <button
                    onClick={() => navigate('/learn')}
                    className="btn btn-primary"
                    style={{ flex: 1, minWidth: '12rem' }}
                  >
                    Back to Lessons
                  </button>
                )}
                {!showCompletion.passed && (
                  <button
                    onClick={() => navigate('/learn')}
                    className="btn btn-ghost"
                    style={{ flex: 1, minWidth: '12rem' }}
                  >
                    Back to Lessons
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main content grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '260px 1fr',
            gap: 'var(--space-6)',
            alignItems: 'start',
          }}
        >
          {/* Left sidebar: Finger Guide + Lesson Info */}
          <aside style={{ position: 'sticky', top: 'var(--space-6)' }}>
            <FingerGuide
              activeFinger={targetFinger}
              showLabels={true}
              compact={false}
            />

            {/* Lesson info panel */}
            <div
              style={{
                marginTop: 'var(--space-4)',
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <h3 style={{ margin: '0 0 var(--space-3) 0', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
                Focus Keys
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {lesson.keys.map((key: string) => (
                  <kbd
                    key={key}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '2rem',
                      height: '1.75rem',
                      padding: '0 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-bg-deep)',
                      color: 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                    }}
                  >
                    {key === ' ' ? 'SPACE' : key.toUpperCase()}
                  </kbd>
                ))}
              </div>

              <p style={{ margin: 'var(--space-3) 0 0 0', fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                {lesson.description}
              </p>

              <div
                style={{
                  marginTop: 'var(--space-3)',
                  paddingTop: 'var(--space-3)',
                  borderTop: '1px solid var(--color-border)',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Target Accuracy</span>
                  <strong style={{ color: 'var(--color-text-primary)' }}>{lesson.minimumAccuracy}%</strong>
                </div>
              </div>
            </div>
          </aside>

          {/* Right panel: Guidance + Typing area + Keyboard */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Progress Bar */}
            <ProgressBar
              totalChars={totalChars}
              currentIndex={currentIndex}
              accuracy={accuracy}
              wpm={wpm}
              targetKey={targetKey}
              targetFinger={targetFinger}
              charStatuses={charStatuses}
              isComplete={isComplete}
            />

            {/* Instruction hint */}
            {snapshot?.phase === 'active' && !isComplete && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <Info size={14} aria-hidden="true" style={{ flexShrink: 0, color: 'var(--color-accent)' }} />
                <span>Type the highlighted text below. Use the correct finger for each key.</span>
              </div>
            )}

            {/* Typing Region */}
            <div
              style={{
                position: 'relative',
                padding: 'var(--space-6) var(--space-8)',
                backgroundColor: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                minHeight: '10rem',
              }}
            >
              <div
                style={{
                  fontSize: '1.25rem',
                  lineHeight: 2.25,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-muted)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFeatureSettings: '"liga" 0, "calt" 0',
                }}
                aria-live="polite"
                aria-atomic="false"
                aria-label="Practice text"
              >
                {typingDisplay.map(({ char, status, isCurrent }, idx: number) => {
                  let color = 'var(--color-text-muted)';
                  let bg = 'transparent';
                  let fontWeight = 400;

                  if (status === 'correct') {
                    color = 'var(--color-success)';
                    fontWeight = 500;
                  } else if (status === 'incorrect') {
                    color = 'var(--color-error)';
                    fontWeight = 500;
                  }

                  if (isCurrent && !isComplete) {
                    bg = 'var(--color-accent-muted)';
                    color = 'var(--color-accent)';
                    fontWeight = 700;
                  }

                  return (
                    <span
                      key={idx}
                      style={{
                        position: 'relative',
                        color,
                        backgroundColor: bg,
                        borderRadius: '2px',
                        fontWeight,
                        transition: 'all 50ms ease',
                      }}
                    >
                      {char}
                      {isCurrent && !isComplete && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '-2px',
                            left: 0,
                            right: 0,
                            height: '2px',
                            backgroundColor: 'var(--color-accent)',
                            borderRadius: '1px',
                          }}
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  );
                })}
              </div>

              {/* Hidden input for keyboard capture */}
              <input
                type="text"
                style={{
                  position: 'absolute',
                  opacity: 0,
                  pointerEvents: 'none',
                  width: 0,
                  height: 0,
                }}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                spellCheck={false}
                autoFocus={!hasStarted}
                aria-hidden="true"
              />
            </div>

            {/* Interactive Keyboard */}
            <InteractiveKeyboard
              targetKey={targetKey}
              activeFinger={targetFinger}
              charStatuses={charStatuses}
              currentIndex={currentIndex}
              disabled={showCompletion !== null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
