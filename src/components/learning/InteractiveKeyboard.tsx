/**
 * TYPEPLAY — InteractiveKeyboard
 * ==========================================================================
 * Visual QWERTY keyboard with per-key and per-finger highlighting.
 * Pure CSS — no Three.js. Keyboard accessible, respects reduced-motion.
 *
 * Props:
 *   - targetKey: The character currently expected (highlights that key gold)
 *   - activeFinger: The finger currently in focus (highlights all its keys)
 *   - charStatuses: Map of character index to status for recent keys typed
 */
import { useMemo, type KeyboardEvent, type CSSProperties } from 'react';
import { KEYBOARD_ROWS, getKeyDisplayLabel, getFingerForKey, type Finger, type KeyboardRow } from '../../data/fingerMapping';
import type { CharStatus } from '../../types/typing';

interface InteractiveKeyboardProps {
  /** The character the user should type next. */
  targetKey: string | null;
  /** The finger that should press the target key (for finger guide sync). */
  activeFinger: Finger | null;
  /** Recent character statuses for correctness coloring. */
  charStatuses: CharStatus[];
  /** Current index in the text (for status lookup). */
  currentIndex: number;
  /** Optional click handler for keys. */
  onKeyClick?: (key: string) => void;
  /** Optional keyboard handler (for focusable interaction). */
  onKeyDown?: (event: KeyboardEvent) => void;
  /** Disable all interactions (for display-only mode). */
  disabled?: boolean;
}

const KEY_STYLES: Record<string, CSSProperties> = {
  base: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '2.75rem',
    height: '2.75rem',
    padding: '0 0.375rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.8125rem',
    fontWeight: 500,
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-text-secondary)',
    backgroundColor: 'var(--color-bg-deep)',
    border: '1px solid var(--color-border)',
    cursor: 'default',
    userSelect: 'none',
    transition: 'all 120ms ease',
    boxSizing: 'border-box',
  },
  wide: {
    minWidth: '4rem',
  },
  wider: {
    minWidth: '5.5rem',
  },
  widest: {
    minWidth: '14rem',
  },
  target: {
    borderColor: 'var(--color-accent)',
    backgroundColor: 'var(--color-accent)',
    boxShadow: '0 0 12px rgba(212, 175, 55, 0.4), 0 0 0 3px rgba(212, 175, 55, 0.2)',
    color: 'var(--color-bg)',
    fontWeight: 700,
    fontSize: '0.9375rem',
    zIndex: 2,
    transform: 'scale(1.05)',
  },
  fingerHighlight: {
    borderColor: 'var(--color-accent)',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    color: 'var(--color-accent)',
  },
  correct: {
    borderColor: 'var(--color-success)',
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    color: 'var(--color-success)',
  },
  incorrect: {
    borderColor: 'var(--color-error)',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    color: 'var(--color-error)',
  },
  disabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
  },
};

function KeyButton({
  keyLabel,
  keyChar,
  isTarget,
  isFingerHighlight,
  status,
  onClick,
  disabled,
}: {
  keyLabel: string;
  keyChar: string;
  isTarget: boolean;
  isFingerHighlight: boolean;
  status: CharStatus | null;
  onClick?: (key: string) => void;
  disabled?: boolean;
}) {
  const styles = useMemo(() => {
    const base = { ...KEY_STYLES.base };
    if (keyLabel === 'SPACE') Object.assign(base, KEY_STYLES.widest);
    else if (['BACKSPACE', 'ENTER', 'SHIFT', 'CAPS', 'TAB'].includes(keyLabel)) Object.assign(base, KEY_STYLES.wider);
    else if (keyLabel.length > 1) Object.assign(base, KEY_STYLES.wide);

    if (isTarget) Object.assign(base, KEY_STYLES.target);
    else if (isFingerHighlight) Object.assign(base, KEY_STYLES.fingerHighlight);

    if (status === 'correct') Object.assign(base, KEY_STYLES.correct);
    else if (status === 'incorrect') Object.assign(base, KEY_STYLES.incorrect);

    if (disabled) Object.assign(base, KEY_STYLES.disabled);

    return base;
  }, [keyLabel, isTarget, isFingerHighlight, status, disabled]);

  const handleClick = () => {
    if (!disabled && onClick) onClick(keyChar);
  };

  return (
    <button
      type="button"
      style={styles}
      onClick={handleClick}
      disabled={Boolean(disabled)}
      aria-label={isTarget ? `${keyLabel} — press this key` : keyLabel}
      title={keyLabel}
    >
      {keyLabel}
    </button>
  );
}

function RowWrapper({ children, style }: { children: React.ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        justifyContent: 'center',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function InteractiveKeyboard({
  targetKey,
  activeFinger,
  charStatuses: _charStatuses,
  currentIndex: _currentIndex,
  onKeyClick,
  onKeyDown,
  disabled = false,
}: InteractiveKeyboardProps) {

  // Determine which finger each key belongs to
  const keyToFinger = useMemo(() => {
    const map = new Map<string, Finger | null>();
    KEYBOARD_ROWS.flat().forEach((key) => {
      if (key === ' ') {
        map.set(key, 'thumbs');
      } else if (key === 'Shift' || key === 'Control' || key === 'Alt' || key === 'Tab' || key === 'CapsLock' || key === 'Enter' || key === 'Backspace') {
        map.set(key, null);
      } else {
        const finger = getFingerForKey(key);
        map.set(key, finger);
      }
    });
    return map;
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (disabled) return;
    if (onKeyDown) onKeyDown(e);
  };

  return (
    <div
      className="interactive-keyboard"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.375rem',
        padding: 'var(--space-4) var(--space-5)',
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '100%',
        overflowX: 'auto',
      }}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="application"
      aria-disabled={Boolean(disabled)}
      aria-label="Interactive typing keyboard"
    >
      {KEYBOARD_ROWS.map((row: KeyboardRow, rowIndex) => (
        <RowWrapper key={rowIndex}>
          {row.map((key) => {
            const keyChar = key === ' ' ? ' ' : key.toLowerCase();
            const displayLabel = getKeyDisplayLabel(key);
            const isTarget = Boolean(targetKey && keyChar === targetKey.toLowerCase());
            const keyFinger = keyToFinger.get(key) ?? null;
            const isFingerHighlight = Boolean(activeFinger && keyFinger === activeFinger && !isTarget);

            let status: CharStatus | null = null;

            return (
              <KeyButton
                key={key}
                keyLabel={displayLabel}
                keyChar={keyChar}
                isTarget={isTarget}
                isFingerHighlight={isFingerHighlight}
                status={status}
                onClick={onKeyClick}
                disabled={Boolean(disabled)}
              />
            );
          })}
        </RowWrapper>
      ))}
    </div>
  );
}
