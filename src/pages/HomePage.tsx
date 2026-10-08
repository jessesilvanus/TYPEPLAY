/**
 * TYPEPLAY — HomePage
 * ==========================================================================
 * Landing page. Phase 1 communication goals:
 *   - brand identity (TYPEPLAY)
 *   - core promise: "Learn to type. Play the keys."
 *   - clear primary action: Start Practice (disabled placeholder — real
 *     session flow arrives in Phase 2 when the typing engine exists)
 *   - clear secondary action: Learn Typing (placeholder route)
 *   - premium, dark, spacious, minimal
 *
 * Everything is keyboard accessible (real links/buttons) and motion is kept
 * subtle, respecting prefers-reduced-motion via the global CSS rule.
 */
import { Play, GraduationCap, Music, Keyboard, Gauge } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * Primary call to action — now wired to the Phase 2 practice surface. A real
 * link so it is keyboard reachable and deep-linkable.
 */
function StartPracticeButton() {
  return (
    <Link to="/practice" className="btn btn-primary btn-lg" aria-label="Start a typing practice session">
      <Play size={18} aria-hidden="true" />
      Start Practice
    </Link>
  );
}

/** Secondary action — a real link to the (future) lessons area. */
function LearnTypingButton() {
  return (
    <Link
      to="/learn"
      className="btn btn-secondary btn-lg"
      aria-label="Learn touch typing with structured lessons"
    >
      <GraduationCap size={18} aria-hidden="true" />
      Learn Typing
    </Link>
  );
}

/** A single feature chip — icon + label. Purely presentational. */
interface FeatureProps {
  icon: React.ReactNode;
  label: string;
}

function Feature({ icon, label }: FeatureProps) {
  return (
    <li
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        listStyle: 'none',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-accent-muted)',
          color: 'var(--color-accent)',
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{label}</span>
    </li>
  );
}

// Simple lerp utility (avoids Three.js dependency)
const lerp = (start: number, end: number, alpha: number) => start + (end - start) * alpha;

/**
 * Cursor-reactive background component.
 * Uses CSS variables + requestAnimationFrame for smooth, performant animations
 * without triggering React re-renders on every mouse move.
 */
function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const cursorRef = useRef({ x: 0.5, y: 0.5 });
  const targetRef = useRef({ x: 0.5, y: 0.5 });
  const trailRef = useRef<{ x: number; y: number }[]>([]);
  const clickRipplesRef = useRef<{ x: number; y: number; start: number }[]>([]);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 767px)');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Reset on mount
    cursorRef.current = { x: 0.5, y: 0.5 };
    targetRef.current = { x: 0.5, y: 0.5 };
    trailRef.current = [];
    clickRipplesRef.current = [];

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion || isMobile) return;
      const rect = container.getBoundingClientRect();
      targetRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };

    const handleClick = (e: MouseEvent) => {
      if (prefersReducedMotion || isMobile) return;
      const rect = container.getBoundingClientRect();
      clickRipplesRef.current.push({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
        start: performance.now(),
      });
    };

    const handleResize = () => {
      // Trail reset on resize to avoid stale positions
      trailRef.current = [];
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    // Animation loop - runs independently of React renders
    const animate = () => {
      if (!containerRef.current) return;

      const now = performance.now();

      // Smooth cursor interpolation (lerp)
      if (!prefersReducedMotion && !isMobile) {
        cursorRef.current.x = lerp(cursorRef.current.x, targetRef.current.x, 0.1);
        cursorRef.current.y = lerp(cursorRef.current.y, targetRef.current.y, 0.1);

        // Update trail
        trailRef.current.push({ x: cursorRef.current.x, y: cursorRef.current.y });
        if (trailRef.current.length > 20) {
          trailRef.current.shift();
        }
      }

      // Update CSS variables for cursor glow
      const style = container.style;
      style.setProperty('--cursor-x', `${cursorRef.current.x * 100}%`);
      style.setProperty('--cursor-y', `${cursorRef.current.y * 100}%`);

      // Clean up old ripples
      clickRipplesRef.current = clickRipplesRef.current.filter(r => now - r.start < 900);

      // Update ripple CSS variables
      if (clickRipplesRef.current.length > 0) {
        const latest = clickRipplesRef.current[clickRipplesRef.current.length - 1];
        style.setProperty('--ripple-x', `${latest.x * 100}%`);
        style.setProperty('--ripple-y', `${latest.y * 100}%`);
        const progress = Math.min((now - latest.start) / 800, 1);
        style.setProperty('--ripple-progress', progress.toString());
        style.setProperty('--ripple-opacity', (1 - progress).toString());
      } else {
        style.setProperty('--ripple-opacity', '0');
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [prefersReducedMotion, isMobile]);

  return (
    <div
      ref={containerRef}
      className="hero-background"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {/* Layer 1: Near-black base */}
      <div className="bg-base" />

      {/* Layer 2: Static atmospheric glow behind hero */}
      <div className="bg-static-glow" />

      {/* Layer 3: Cursor-controlled soft light (CSS radial gradient via variables) */}
      <div className="bg-cursor-glow" />

      {/* Layer 4: Subtle waveform/ripple from cursor movement */}
      <div className="bg-waveform" />

      {/* Layer 5: Vignette */}
      <div className="bg-vignette" />

      {/* Click ripple (CSS-based) */}
      <div className="bg-click-ripple" />
    </div>
  );
}

export default function HomePage() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      {/* Cursor-reactive Background */}
      <HeroBackground />

      {/* Hero */}
      <section
        className="container"
        style={{
          position: 'relative',
          textAlign: 'center',
          paddingTop: 'var(--space-24)',
          paddingBottom: 'var(--space-20)',
          zIndex: 1,
        }}
      >
        <div
          className="animate-hero-badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 0.875rem',
            marginBottom: 'var(--space-6)',
            borderRadius: '999px',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-elevated)',
            color: 'var(--color-text-secondary)',
            fontSize: '0.8125rem',
          }}
        >
          <Music size={14} aria-hidden="true" />
          Typing trainer with a musical identity
        </div>

        <h1
          className="animate-hero-title"
          style={{
            margin: '0 0 var(--space-4) 0',
            fontSize: 'clamp(2.75rem, 6vw, 4.5rem)',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: 'var(--color-text-primary)',
            textWrap: 'balance',
          }}
        >
          TYPE<span style={{ color: 'var(--color-accent)' }}>PLAY</span>
        </h1>

        <p
          className="animate-hero-description"
          style={{
            margin: '0 auto var(--space-10) auto',
            maxWidth: '34rem',
            fontSize: '1.25rem',
            fontWeight: 400,
            lineHeight: 1.5,
            color: 'var(--color-text-secondary)',
            textWrap: 'balance',
          }}
        >
          Learn to type. Play the keys. A premium touch-typing practice built
          for real physical keyboards.
        </p>

        {/* Primary actions */}
        <div
          className="animate-hero-buttons"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: 'var(--space-3)',
          }}
        >
          <StartPracticeButton />
          <LearnTypingButton />
        </div>

        <p
          style={{
            margin: 0,
            fontSize: '0.8125rem',
            color: 'var(--color-text-muted)',
          }}
        >
          Choose a passage, pick a duration, and type. Accuracy first.
        </p>
      </section>

      {/* Philosophy + features */}
      <section
        className="container animate-hero-features"
        style={{
          position: 'relative',
          zIndex: 1,
          paddingTop: 'var(--space-12)',
          paddingBottom: 'var(--space-24)',
        }}
      >
        <p
          style={{
            textAlign: 'center',
            margin: '0 auto var(--space-10) auto',
            maxWidth: '36rem',
            fontSize: '1.0625rem',
            color: 'var(--color-text-secondary)',
            textWrap: 'balance',
          }}
        >
          The philosophy is simple:{' '}
          <strong style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
            Accuracy &rarr; Technique &rarr; Speed
          </strong>
          . Education always matters more than effects.
        </p>

        <ul
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
            gap: 'var(--space-4)',
            margin: 0,
            padding: 0,
          }}
        >
          <Feature
            icon={<Keyboard size={20} aria-hidden="true" />}
            label="Real physical keyboard input"
          />
          <Feature
            icon={<Gauge size={20} aria-hidden="true" />}
            label="WMP, accuracy & consistency tracking"
          />
          <Feature
            icon={<GraduationCap size={20} aria-hidden="true" />}
            label="Progressive touch-typing lessons"
          />
          <Feature
            icon={<Music size={20} aria-hidden="true" />}
            label="Music that responds to your typing"
          />
        </ul>
      </section>
    </div>
  );
}
