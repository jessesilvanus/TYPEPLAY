/**
 * TYPEPLAY — HomePageBackground
 * ==========================================================================
 * Premium ambient background for the homepage.
 *
 * 5-layer cinematic visual system:
 *   1. Deep atmospheric base (large blurred gold/amber light fields)
 *   2. Flowing light ribbons (slow sound-wave motion)
 *   3. Perspective keyboard grid (subtle, breathing)
 *   4. Rhythm / sound visualizer (elegant waveform pulse)
 *   5. Central hero aura (gold glow behind title)
 *
 * Plus a few subtle particles and mouse parallax (depth via multi-speed).
 * Purely presentational — no business logic. Respects prefers-reduced-motion.
 */

import { useEffect, useMemo, useRef, useState } from 'react';

interface HomePageBackgroundProps {
  /** Additional className for the root element. */
  className?: string;
  /** Whether to enable mouse parallax (default: true on desktop). */
  enableParallax?: boolean;
  /** Whether to enable ambient particles (default: true on desktop). */
  enableParticles?: boolean;
}

interface Particle {
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

export function HomePageBackground({
  className = '',
  enableParallax = true,
  enableParticles = true,
}: HomePageBackgroundProps) {
  // Lazy initialization from media query and window width
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [isLaptop, setIsLaptop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768 && window.innerWidth < 1280;
    }
    return false;
  });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>(() => {
    if (typeof window !== 'undefined' && enableParticles && window.innerWidth >= 768) {
      const newParticles: Particle[] = [];
      const count = 20;
      for (let i = 0; i < count; i++) {
        newParticles.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 20,
          duration: 15 + Math.random() * 20,
          size: 1.5 + Math.random() * 2.5,
          opacity: 0.06 + Math.random() * 0.1,
        });
      }
      return newParticles;
    }
    return [];
  });
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const animationFrameRef = useRef<number | null>(null);

  // Detect reduced motion and viewport changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);

    const checkViewport = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsLaptop(w >= 768 && w < 1280);
    };
    window.addEventListener('resize', checkViewport);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('resize', checkViewport);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Track whether particles have been initialized
  const particlesInitializedRef = useRef(false);

  useEffect(() => {
    if (enableParticles && !isMobile && !particlesInitializedRef.current) {
      const newParticles: Particle[] = [];
      const count = 20;
      for (let i = 0; i < count; i++) {
        newParticles.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 20,
          duration: 15 + Math.random() * 20,
          size: 1.5 + Math.random() * 2.5,
          opacity: 0.06 + Math.random() * 0.1,
        });
      }
      particlesInitializedRef.current = true;
      setParticles(newParticles);
    } else if (!enableParticles || isMobile) {
      particlesInitializedRef.current = false;
    }
  }, [enableParticles, isMobile]);

  // Mouse parallax handler — multi-depth via different multipliers
  useEffect(() => {
    if (prefersReducedMotion || !enableParallax || isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = document.documentElement.getBoundingClientRect();
      mouseRef.current.x = e.clientX / rect.width;
      mouseRef.current.y = e.clientY / rect.height;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const animate = () => {
      const targetX = mouseRef.current.x - 0.5;
      const targetY = mouseRef.current.y - 0.5;

      setParallax(prev => {
        const nextX = prev.x + (targetX - prev.x) * 0.03;
        const nextY = prev.y + (targetY - prev.y) * 0.03;
        return (Math.abs(nextX - prev.x) < 0.0001 && Math.abs(nextY - prev.y) < 0.0001)
          ? prev
          : { x: nextX, y: nextY };
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [prefersReducedMotion, enableParallax, isMobile]);

  // ===== Multi-depth parallax transforms =====
  // Far background: 1-2px
  const glow1Transform = useMemo(() =>
    prefersReducedMotion || !enableParallax
      ? 'translate(0, 0)'
      : `translate(${parallax.x * 12}px, ${parallax.y * 8}px)`,
    [parallax, prefersReducedMotion, enableParallax]
  );

  const glow2Transform = useMemo(() =>
    prefersReducedMotion || !enableParallax
      ? 'translate(0, 0)'
      : `translate(${parallax.x * -10}px, ${parallax.y * -14}px)`,
    [parallax, prefersReducedMotion, enableParallax]
  );

  const glow3Transform = useMemo(() =>
    prefersReducedMotion || !enableParallax
      ? 'translate(0, 0)'
      : `translate(${parallax.x * 6}px, ${parallax.y * 5}px)`,
    [parallax, prefersReducedMotion, enableParallax]
  );

  // Middle layer: 3-5px
  const ribbonTransform = useMemo(() =>
    prefersReducedMotion || !enableParallax
      ? 'translate(0, 0)'
      : `translate(${parallax.x * 25}px, ${parallax.y * 18}px)`,
    [parallax, prefersReducedMotion, enableParallax]
  );

  const gridTransform = useMemo(() =>
    prefersReducedMotion || !enableParallax
      ? 'translate(0, 0)'
      : `translate(${parallax.x * 20}px, ${parallax.y * 15}px)`,
    [parallax, prefersReducedMotion, enableParallax]
  );

  const rhythmTransform = useMemo(() =>
    prefersReducedMotion || !enableParallax
      ? 'translate(0, 0)'
      : `translate(${parallax.x * 22}px, ${parallax.y * 16}px)`,
    [parallax, prefersReducedMotion, enableParallax]
  );

  // Foreground decorative: 5-10px
  const auraTransform = useMemo(() =>
    prefersReducedMotion || !enableParallax
      ? 'translate(0, 0)'
      : `translate(${parallax.x * 35}px, ${parallax.y * 28}px)`,
    [parallax, prefersReducedMotion, enableParallax]
  );

  const particlesTransform = useMemo(() =>
    prefersReducedMotion || !enableParallax
      ? 'translate(0, 0)'
      : `translate(${parallax.x * 40}px, ${parallax.y * 32}px)`,
    [parallax, prefersReducedMotion, enableParallax]
  );

  return (
    <div
      className={`homepage-background ${className}`}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      {/* ======== LAYER 1 — DEEP ATMOSPHERIC BASE ======== */}
      <div
        className="bg-base"
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 130% 90% at 50% 110%, #141416 0%, #0a0a0b 55%, #060607 100%),
            linear-gradient(180deg, #0c0c0d 0%, #080809 50%, #050506 100%)
          `,
        }}
      />

      {/* Large cinematic light fields — gold/amber primary */}
      {/* Upper-center warm gold sun */}
      <div
        className="bg-glow glow-primary"
        style={{
          position: 'absolute',
          top: '5%',
          left: '50%',
          width: '90vw',
          height: '90vw',
          maxWidth: '1100px',
          maxHeight: '1100px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(234, 179, 8, 0.14) 0%, rgba(234, 179, 8, 0.05) 35%, transparent 65%)',
          filter: 'blur(140px)',
          transform: `translate(-50%, 0) ${glow1Transform}`,
          willChange: 'transform',
          animation: prefersReducedMotion ? 'none' : 'glow-primary 28s ease-in-out infinite',
        }}
      />

      {/* Upper-left amber glow */}
      <div
        className="bg-glow glow-amber-left"
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '55vw',
          height: '55vw',
          maxWidth: '700px',
          maxHeight: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(250, 204, 21, 0.1) 0%, rgba(234, 179, 8, 0.04) 40%, transparent 70%)',
          filter: 'blur(130px)',
          transform: glow2Transform,
          willChange: 'transform',
          animation: prefersReducedMotion ? 'none' : 'glow-amber-left 32s ease-in-out infinite',
        }}
      />

      {/* Lower-right gold glow */}
      <div
        className="bg-glow glow-gold-right"
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-15%',
          width: '60vw',
          height: '60vw',
          maxWidth: '800px',
          maxHeight: '800px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(234, 179, 8, 0.08) 0%, rgba(250, 204, 21, 0.03) 45%, transparent 70%)',
          filter: 'blur(150px)',
          transform: glow3Transform,
          willChange: 'transform',
          animation: prefersReducedMotion ? 'none' : 'glow-gold-right 36s ease-in-out infinite',
        }}
      />

      {/* ======== LAYER 2 — FLOWING LIGHT RIBBONS ======== */}
      {!isLaptop && (
        <div
          className="bg-ribbons"
          style={{
            position: 'absolute',
            inset: '-20%',
            transform: ribbonTransform,
            willChange: 'transform',
            opacity: 0.5,
            maskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, black 0%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, black 0%, transparent 100%)',
          }}
        >
          {/* Ribbon 1 — gold, sweeping */}
          <div
            style={{
              position: 'absolute',
              left: '-10%',
              right: '-10%',
              top: '30%',
              height: '200px',
              background: 'linear-gradient(90deg, transparent, rgba(234, 179, 8, 0.06), transparent)',
              filter: 'blur(40px)',
              borderRadius: '50%',
              transform: 'rotate(-8deg)',
              animation: prefersReducedMotion ? 'none' : 'ribbon-sweep-1 18s ease-in-out infinite',
            }}
          />
          {/* Ribbon 2 — amber, opposite phase */}
          <div
            style={{
              position: 'absolute',
              left: '-10%',
              right: '-10%',
              top: '48%',
              height: '160px',
              background: 'linear-gradient(90deg, transparent, rgba(250, 204, 21, 0.05), transparent)',
              filter: 'blur(50px)',
              borderRadius: '50%',
              transform: 'rotate(5deg)',
              animation: prefersReducedMotion ? 'none' : 'ribbon-sweep-2 22s ease-in-out infinite',
            }}
          />
          {/* Ribbon 3 — subtle white/gray */}
          <div
            style={{
              position: 'absolute',
              left: '-10%',
              right: '-10%',
              top: '62%',
              height: '120px',
              background: 'linear-gradient(90deg, transparent, rgba(200, 200, 210, 0.03), transparent)',
              filter: 'blur(60px)',
              borderRadius: '50%',
              transform: 'rotate(-3deg)',
              animation: prefersReducedMotion ? 'none' : 'ribbon-sweep-3 26s ease-in-out infinite',
            }}
          />
        </div>
      )}

      {/* ======== LAYER 3 — PERSPECTIVE KEYBOARD GRID ======== */}
      <div
        className="bg-keyboard-grid"
        style={{
          position: 'absolute',
          inset: '-30% -10%',
          transform: `perspective(800px) rotateX(55deg) ${gridTransform}`,
          transformOrigin: 'center 70%',
          willChange: 'transform',
          opacity: isMobile ? 0.15 : 0.4,
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 0%, transparent 100%)',
          animation: prefersReducedMotion ? 'none' : 'grid-breathe 24s ease-in-out infinite',
        }}
      >
        {[...Array(8)].map((_, row) => (
          <div
            key={row}
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '14px',
              marginBottom: '14px',
            }}
          >
            {[...Array(14)].map((_, col) => (
              <div
                key={col}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  background: 'rgba(234, 179, 8, 0.025)',
                  border: '1px solid rgba(234, 179, 8, 0.03)',
                  boxShadow: 'inset 0 0 8px rgba(234, 179, 8, 0.01)',
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* ======== LAYER 4 — RHYTHM / SOUND VISUALIZER ======== */}
      <div
        className="bg-rhythm"
        style={{
          position: 'absolute',
          inset: '-5%',
          transform: rhythmTransform,
          willChange: 'transform',
          opacity: isMobile ? 0.2 : 0.45,
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 50%, black 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 50%, black 0%, transparent 100%)',
        }}
      >
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '8%',
              right: '8%',
              height: '1.5px',
              top: `${6 + i * 5.5}%`,
              background: 'linear-gradient(90deg, transparent, rgba(234, 179, 8, 0.07), transparent)',
              borderRadius: '1px',
              animation: prefersReducedMotion
                ? 'none'
                : `rhythm-wave-${i % 4} ${14 + i * 1.2}s ease-in-out infinite`,
              transformOrigin: 'center',
            }}
          />
        ))}
      </div>

      {/* ======== LAYER 5 — CENTRAL HERO AURA ======== */}
      <div
        className="bg-hero-aura"
        style={{
          position: 'absolute',
          top: '22%',
          left: '50%',
          width: '70vw',
          height: '70vw',
          maxWidth: '900px',
          maxHeight: '900px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(234, 179, 8, 0.08) 0%, rgba(250, 204, 21, 0.03) 30%, transparent 60%)',
          filter: 'blur(100px)',
          transform: `translate(-50%, -50%) ${auraTransform}`,
          willChange: 'transform',
          animation: prefersReducedMotion ? 'none' : 'aura-pulse 14s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* ======== SUBTLE PARTICLES ======== */}
      {enableParticles && !isMobile && !prefersReducedMotion && particles.length > 0 && (
        <div
          className="bg-particles"
          style={{
            position: 'absolute',
            inset: 0,
            transform: particlesTransform,
            willChange: 'transform',
            pointerEvents: 'none',
          }}
        >
          {particles.map((p, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(250, 204, 21, 0.9) 0%, rgba(234, 179, 8, 0.3) 60%, transparent 100%)',
                opacity: p.opacity,
                animation: `particle-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
                willChange: 'transform, opacity',
              }}
            />
          ))}
        </div>
      )}

      {/* ======== VIGNETTE / DEPTH OVERLAY ======== */}
      <div
        className="bg-vignette"
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(
              ellipse 110% 90% at 50% 40%,
              transparent 0%,
              transparent 45%,
              rgba(3, 3, 4, 0.4) 75%,
              rgba(3, 3, 4, 0.7) 100%
            ),
            linear-gradient(
              180deg,
              rgba(3, 3, 4, 0.25) 0%,
              transparent 25%,
              transparent 65%,
              rgba(3, 3, 4, 0.3) 100%
            )
          `,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
