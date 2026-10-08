/**
 * TYPEPLAY — FingerGuide
 * ==========================================================================
 * Clean 2D educational finger visualization for touch typing.
 * Shows both hands with labeled fingers. Highlights active finger.
 * Pure CSS/SVG — no Three.js. Accessible, respects reduced-motion.
 */
import { useMemo } from 'react';
import { getFingerLabel, type Finger } from '../../data/fingerMapping';

const FINGER_ORDER: Finger[] = [
  'left-pinky', 'left-ring', 'left-middle', 'left-index',
  'right-index', 'right-middle', 'right-ring', 'right-pinky',
  'thumbs',
];

interface FingerGuideProps {
  activeFinger: Finger | null;
  showLabels?: boolean;
  compact?: boolean;
  hand?: 'left' | 'right' | 'both';
}

function FingerIndicator({
  isActive,
  label,
  x = 0,
}: {
  isActive: boolean;
  label: string;
  x?: number;
}) {
  const color = isActive ? 'var(--color-accent)' : 'var(--color-text-muted)';
  const bg = isActive ? 'rgba(212, 175, 55, 0.15)' : 'transparent';

  return (
    <g transform={`translate(${x}, 0)`} style={{ transition: 'transform 150ms ease' }}>
      <rect x="0" y="8" width="28" height="52" rx="14" fill={bg} stroke={color} strokeWidth={isActive ? 2.5 : 1} style={{ transition: 'all 150ms ease' }} />
      <ellipse cx="14" cy="8" rx="14" ry="8" fill={bg} stroke={color} strokeWidth={isActive ? 2.5 : 1} />
      {label && (
        <text x="14" y="70" textAnchor="middle" fill={color} fontSize="10" fontWeight={isActive ? 700 : 400} fontFamily="var(--font-mono)" style={{ userSelect: 'none', transition: 'all 150ms ease' }}>
          {label}
        </text>
      )}
    </g>
  );
}

function ThumbIndicator({ isActive, label }: { isActive: boolean; label: string }) {
  const color = isActive ? 'var(--color-accent)' : 'var(--color-text-muted)';
  const bg = isActive ? 'rgba(212, 175, 55, 0.15)' : 'transparent';

  return (
    <g transform={`translate(0, ${isActive ? -1 : 0})`} style={{ transition: 'transform 150ms ease' }}>
      <ellipse cx="50" cy="100" rx="28" ry="14" fill={bg} stroke={color} strokeWidth={isActive ? 2.5 : 1} />
      {label && (
        <text x="50" y="126" textAnchor="middle" fill={color} fontSize="10" fontWeight={isActive ? 700 : 400} fontFamily="var(--font-mono)" style={{ userSelect: 'none', transition: 'all 150ms ease' }}>
          {label}
        </text>
      )}
    </g>
  );
}

export function FingerGuide({ activeFinger, showLabels = true, compact = false }: FingerGuideProps) {
  const fingerLabels = useMemo(() => {
    if (!showLabels) return {} as Record<Finger, string>;
    const labels: Record<Finger, string> = {} as any;
    FINGER_ORDER.forEach((f) => { labels[f] = getFingerLabel(f); });
    return labels;
  }, [showLabels]);

  return (
    <div style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }} role="img" aria-label="Finger placement guide">
      <svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: 'auto', maxHeight: compact ? '120px' : '180px', display: 'block' }}>
        <g transform="translate(4, 4)">
          <FingerIndicator isActive={activeFinger === 'left-pinky'} label={fingerLabels['left-pinky']} />
          <FingerIndicator isActive={activeFinger === 'left-ring'} label={fingerLabels['left-ring']} x={34} />
          <FingerIndicator isActive={activeFinger === 'left-middle'} label={fingerLabels['left-middle']} x={68} />
          <FingerIndicator isActive={activeFinger === 'left-index'} label={fingerLabels['left-index']} x={102} />
        </g>
        <g transform="translate(170, 4)">
          <FingerIndicator isActive={activeFinger === 'right-index'} label={fingerLabels['right-index']} />
          <FingerIndicator isActive={activeFinger === 'right-middle'} label={fingerLabels['right-middle']} x={34} />
          <FingerIndicator isActive={activeFinger === 'right-ring'} label={fingerLabels['right-ring']} x={68} />
          <FingerIndicator isActive={activeFinger === 'right-pinky'} label={fingerLabels['right-pinky']} x={102} />
        </g>
        <g transform="translate(4, 84)">
          <ThumbIndicator isActive={activeFinger === 'thumbs'} label={fingerLabels['thumbs']} />
        </g>
        {showLabels && (
          <>
            <text x="18" y="4" textAnchor="middle" fill="var(--color-text-muted)" fontSize="11" fontWeight={500} fontFamily="var(--font-mono)" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>LEFT HAND</text>
            <text x="184" y="4" textAnchor="middle" fill="var(--color-text-muted)" fontSize="11" fontWeight={500} fontFamily="var(--font-mono)" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>RIGHT HAND</text>
          </>
        )}
      </svg>
    </div>
  );
}