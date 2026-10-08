/**
 * TYPEPLAY — MusicPage
 * ==========================================================================
 * Music / Play mode pairs the existing TypingEngine with original procedural
 * piano feedback. This page owns only presentation and user interactions;
 * typing validation, progression, metrics, and session timing remain in the
 * shared engine hook.
 */
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { CheckCircle2, CircleStop, Headphones, Music2, Play, RotateCcw, SlidersHorizontal, Volume2, VolumeX } from 'lucide-react';
import { audioEngine } from '../audio/AudioEngine';
import { DEFAULT_MUSIC_TRACK_ID, MUSIC_TRACKS } from '../audio/tracks';
import { InteractiveKeyboard } from '../components/learning/InteractiveKeyboard';
import { getFingerForKey } from '../data/fingerMapping';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { useSettingsStore } from '../stores/settingsStore';
import type { CharStatus, SessionConfig, SessionSnapshot } from '../types/typing';

const SESSION_DURATION_SECONDS = 120;
const VISIBLE_WINDOW = 300;
const MUSIC_PASSAGE_SENTENCES = [
  'Let each accurate key become a calm note in your typing rhythm.',
  'Keep your hands relaxed and let steady movement shape the melody.',
  'A clear focus turns each small keystroke into a confident phrase.',
  'Listen for the gentle pattern while accuracy guides every word.',
  'Return to home row and allow the next note to arrive naturally.',
  'Smooth deliberate practice creates a sound that belongs to you.',
];

interface NoteFeedback {
  key: string;
  note: string;
  correct: boolean;
}

function buildMusicPassage(): string {
  const parts: string[] = [];
  while (parts.join(' ').length < 2400) {
    parts.push(MUSIC_PASSAGE_SENTENCES[parts.length % MUSIC_PASSAGE_SENTENCES.length]);
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

function Caret() {
  return (
    <span
      aria-hidden="true"
      className="animate-pulse-subtle"
      style={{
        display: 'inline-block',
        position: 'absolute',
        top: '0.14em',
        bottom: '0.14em',
        left: '-1px',
        width: '2px',
        backgroundColor: 'var(--color-accent)',
      }}
    />
  );
}

function Toggle({ enabled, onClick }: { enabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={`Typing piano sounds: ${enabled ? 'on' : 'off'}`}
      onClick={onClick}
      style={{
        position: 'relative',
        width: '3rem',
        height: '1.75rem',
        padding: 0,
        border: '1px solid',
        borderColor: enabled ? 'var(--color-accent)' : 'var(--color-border-hover)',
        borderRadius: '999px',
        backgroundColor: enabled ? 'var(--color-accent)' : 'var(--color-bg)',
        cursor: 'pointer',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '0.1875rem',
          left: enabled ? '1.5rem' : '0.1875rem',
          width: '1.25rem',
          height: '1.25rem',
          borderRadius: '50%',
          backgroundColor: enabled ? 'var(--color-text-inverse)' : 'var(--color-text-muted)',
          transition: 'left var(--transition-fast)',
        }}
      />
    </button>
  );
}

function RangeControl({ id, label, value, onChange, disabled = false }: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div style={{ opacity: disabled ? 0.55 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
        <label htmlFor={id} style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{label}</label>
        <output htmlFor={id} style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700 }}>
          {value}%
        </output>
      </div>
      <input
        id={id}
        type="range"
        min="0"
        max="100"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ width: '100%', accentColor: 'var(--color-accent)', cursor: disabled ? 'not-allowed' : 'pointer' }}
      />
    </div>
  );
}

function AudioControls({ audioReady, soundEnabled }: { audioReady: boolean; soundEnabled: boolean }) {
  const selectedMusic = useSettingsStore((state) => state.selectedMusic);
  const musicVolume = useSettingsStore((state) => state.musicVolume);
  const typingSoundVolume = useSettingsStore((state) => state.typingSoundVolume);
  const setSelectedMusic = useSettingsStore((state) => state.setSelectedMusic);
  const setMusicVolume = useSettingsStore((state) => state.setMusicVolume);
  const setTypingSoundVolume = useSettingsStore((state) => state.setTypingSoundVolume);

  const toggleSound = () => {
    if (soundEnabled) {
      setSelectedMusic(null);
      return;
    }

    setSelectedMusic(DEFAULT_MUSIC_TRACK_ID);
    void audioEngine.unlock();
  };

  return (
    <aside className="card" aria-labelledby="music-controls-heading" style={{ alignSelf: 'start' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <div>
          <h2 id="music-controls-heading" style={{ margin: 0, fontSize: '1.0625rem' }}>Sound controls</h2>
          <p style={{ margin: 'var(--space-1) 0 0', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
            Saved to your TYPEPLAY preferences.
          </p>
        </div>
        {soundEnabled ? <Volume2 size={19} aria-hidden="true" style={{ color: 'var(--color-accent)' }} /> : <VolumeX size={19} aria-hidden="true" style={{ color: 'var(--color-text-muted)' }} />}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', paddingBottom: 'var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
        <div>
          <p style={{ margin: 0, fontWeight: 600 }}>Piano feedback</p>
          <p style={{ margin: 'var(--space-1) 0 0', color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>
            {soundEnabled ? (audioReady ? 'Ready after your interaction.' : 'Arms on your next interaction.') : 'Muted'}
          </p>
        </div>
        <Toggle enabled={soundEnabled} onClick={toggleSound} />
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-5)', paddingTop: 'var(--space-5)' }}>
        <RangeControl id="music-page-typing-volume" label="Typing piano" value={typingSoundVolume} onChange={setTypingSoundVolume} disabled={!soundEnabled} />
        <RangeControl id="music-page-track-volume" label="Future track level" value={musicVolume} onChange={setMusicVolume} disabled={!soundEnabled} />
      </div>

      <p style={{ margin: 'var(--space-5) 0 0', color: 'var(--color-text-muted)', fontSize: '0.75rem', lineHeight: 1.55 }}>
        No audio plays until you press Start, type, or enable sound. Track level is saved now for future original tracks.
      </p>
      {selectedMusic && selectedMusic !== DEFAULT_MUSIC_TRACK_ID && (
        <p style={{ margin: 'var(--space-3) 0 0', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
          Your saved track will be available when its original arrangement is released.
        </p>
      )}
    </aside>
  );
}

function TrackShelf({ soundEnabled }: { soundEnabled: boolean }) {
  const selectedMusic = useSettingsStore((state) => state.selectedMusic);
  const setSelectedMusic = useSettingsStore((state) => state.setSelectedMusic);

  return (
    <section className="card" aria-labelledby="track-shelf-heading">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        <Music2 size={19} aria-hidden="true" style={{ color: 'var(--color-accent)', marginTop: '0.125rem' }} />
        <div>
          <h2 id="track-shelf-heading" style={{ margin: 0, fontSize: '1.0625rem' }}>Original track shelf</h2>
          <p style={{ margin: 'var(--space-1) 0 0', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
            The piano mode is ready now; this catalog is structured for future original TYPEPLAY tracks.
          </p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(11rem, 1fr))', gap: 'var(--space-3)' }}>
        {MUSIC_TRACKS.map((track) => {
          const active = soundEnabled && selectedMusic === track.id;
          const available = track.status === 'available';
          return (
            <button
              key={track.id}
              type="button"
              className="btn"
              disabled={!available}
              aria-pressed={active}
              onClick={() => setSelectedMusic(track.id)}
              style={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                minHeight: '6.5rem',
                padding: 'var(--space-4)',
                textAlign: 'left',
                whiteSpace: 'normal',
                backgroundColor: active ? 'var(--color-accent-muted)' : 'var(--color-bg-elevated)',
                borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
                color: active ? 'var(--color-accent)' : 'var(--color-text-primary)',
              }}
            >
              <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{track.title}</span>
              <span style={{ color: active ? 'var(--color-accent)' : 'var(--color-text-muted)', fontSize: '0.6875rem', lineHeight: 1.45 }}>
                {available ? track.description : 'COMING SOON'}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function MusicSetup({ onStart, audioReady, soundEnabled }: {
  onStart: () => void;
  audioReady: boolean;
  soundEnabled: boolean;
}) {
  return (
    <div className="container" style={{ maxWidth: '78rem', paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-24)' }}>
      <header style={{ maxWidth: '46rem', marginBottom: 'var(--space-10)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: '0.375rem 0.75rem', marginBottom: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: '999px', backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-accent)', fontSize: '0.8125rem', fontWeight: 600 }}>
          <Headphones size={14} aria-hidden="true" />
          TYPEPLAY PLAY MODE
        </div>
        <h1 style={{ margin: '0 0 var(--space-3)', fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', lineHeight: 1.04, letterSpacing: '-0.035em' }}>
          Type a melody.
        </h1>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '1.0625rem', lineHeight: 1.7 }}>
          Turn accurate typing into a sequence of warm, original piano notes. Begin when you are ready—nothing plays on page load.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.55fr) minmax(17rem, 0.8fr)', gap: 'var(--space-6)', alignItems: 'start', marginBottom: 'var(--space-6)' }}>
        <section className="card" aria-labelledby="music-start-heading">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '2.5rem', height: '2.5rem', flex: '0 0 auto', borderRadius: 'var(--radius-md)', color: 'var(--color-accent)', backgroundColor: 'var(--color-accent-muted)' }}>
              <Play size={18} aria-hidden="true" />
            </span>
            <div>
              <h2 id="music-start-heading" style={{ margin: 0, fontSize: '1.125rem' }}>Typing Piano Session</h2>
              <p style={{ margin: 'var(--space-1) 0 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                A two-minute open typing session with live WPM and accuracy feedback.
              </p>
            </div>
          </div>
          <ul style={{ display: 'grid', gap: 'var(--space-3)', margin: '0 0 var(--space-8)', padding: 0, listStyle: 'none', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            <li style={{ display: 'flex', gap: 'var(--space-2)' }}><CheckCircle2 size={16} aria-hidden="true" style={{ color: 'var(--color-success)', flex: '0 0 auto', marginTop: '0.2rem' }} />Correct characters play their mapped piano note.</li>
            <li style={{ display: 'flex', gap: 'var(--space-2)' }}><CheckCircle2 size={16} aria-hidden="true" style={{ color: 'var(--color-success)', flex: '0 0 auto', marginTop: '0.2rem' }} />Incorrect input receives only a quiet, optional cue.</li>
            <li style={{ display: 'flex', gap: 'var(--space-2)' }}><CheckCircle2 size={16} aria-hidden="true" style={{ color: 'var(--color-success)', flex: '0 0 auto', marginTop: '0.2rem' }} />Audio remains silent until you interact.</li>
          </ul>
          <button type="button" className="btn btn-primary btn-lg" onClick={onStart}>
            <Play size={18} aria-hidden="true" />
            Start Play Session
          </button>
        </section>
        <AudioControls audioReady={audioReady} soundEnabled={soundEnabled} />
      </div>

      <TrackShelf soundEnabled={soundEnabled} />
    </div>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="card" style={{ padding: 'var(--space-4)', minWidth: 0 }}>
      <p style={{ margin: '0 0 var(--space-1)', color: 'var(--color-text-muted)', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</p>
      <strong style={{ color: accent ? 'var(--color-accent)' : 'var(--color-text-primary)', fontFamily: 'var(--font-mono)', fontSize: '1.375rem', lineHeight: 1.1 }}>{value}</strong>
    </div>
  );
}

function ActiveMusicSession({ snapshot, onKeyDown, onStop, feedback, audioReady, soundEnabled }: {
  snapshot: SessionSnapshot;
  onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
  onStop: () => void;
  feedback: NoteFeedback | null;
  audioReady: boolean;
  soundEnabled: boolean;
}) {
  const regionRef = useRef<HTMLDivElement>(null);
  const { stats, currentText, charStatuses, currentIndex, remainingSeconds } = snapshot;
  const windowStart = Math.max(0, currentIndex - 36);
  const windowEnd = Math.min(currentText.length, windowStart + VISIBLE_WINDOW);
  const targetKey = currentText[currentIndex] ?? null;
  const activeFinger = targetKey ? getFingerForKey(targetKey) : null;

  useEffect(() => {
    regionRef.current?.focus();
  }, []);

  return (
    <div className="container" style={{ maxWidth: '78rem', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(8rem, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <Stat label="Time" value={`${remainingSeconds}s`} accent />
        <Stat label="WPM" value={stats.wpm} accent />
        <Stat label="Accuracy" value={`${stats.accuracy}%`} />
        <Stat label="Correct" value={stats.correctChars} />
        <button type="button" className="btn btn-secondary" onClick={onStop} style={{ minHeight: '4.5rem' }}>
          <CircleStop size={17} aria-hidden="true" />
          Finish session
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.55fr) minmax(17rem, 0.8fr)', gap: 'var(--space-6)', alignItems: 'start', marginBottom: 'var(--space-6)' }}>
        <div
          ref={regionRef}
          tabIndex={0}
          role="textbox"
          aria-label="Music typing area. Type the text shown to play piano notes."
          onKeyDown={onKeyDown}
          onClick={() => regionRef.current?.focus()}
          className="card"
          style={{ outline: 'none', cursor: 'text', minHeight: '15rem', padding: 'var(--space-8) var(--space-6)', fontFamily: 'var(--font-mono)', fontSize: 'clamp(1rem, 2.2vw, 1.25rem)', lineHeight: 1.9, letterSpacing: '0.01em', overflowWrap: 'break-word' }}
        >
          {currentText.slice(windowStart, windowEnd).split('').map((char, offset) => {
            const index = windowStart + offset;
            const status = charStatuses[index] ?? 'pending';
            const isCurrent = index === currentIndex;
            return (
              <span key={index} style={{ position: 'relative', color: charColor(status), backgroundColor: isCurrent ? 'var(--color-accent-muted)' : 'transparent', borderBottom: status === 'incorrect' ? '2px solid var(--color-error)' : 'none', borderRadius: '2px', whiteSpace: 'pre-wrap' }}>
                {isCurrent && <Caret />}
                {char}
              </span>
            );
          })}
        </div>

        <aside className="card" aria-live="polite">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', color: 'var(--color-accent)' }}>
            <SlidersHorizontal size={17} aria-hidden="true" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Live feedback</span>
          </div>
          <p style={{ margin: '0 0 var(--space-1)', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>Current target</p>
          <strong style={{ display: 'block', marginBottom: 'var(--space-5)', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', fontSize: '2rem', lineHeight: 1 }}>
            {targetKey === ' ' ? 'SPACE' : targetKey?.toUpperCase() ?? '—'}
          </strong>
          <p style={{ margin: '0 0 var(--space-1)', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>Last note</p>
          <strong style={{ display: 'block', marginBottom: 'var(--space-3)', fontFamily: 'var(--font-mono)', fontSize: '1.5rem', color: feedback?.correct ? 'var(--color-success)' : feedback ? 'var(--color-error)' : 'var(--color-text-primary)' }}>
            {feedback ? `${feedback.key} · ${feedback.note}` : 'Waiting'}
          </strong>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.75rem', lineHeight: 1.55 }}>
            {!soundEnabled ? 'Sound is off. Turn it on in the control panel before your next key.' : audioReady ? 'Piano is ready. Type the highlighted character.' : 'The piano will arm after your next typing interaction.'}
          </p>
        </aside>
      </div>

      <InteractiveKeyboard
        targetKey={targetKey}
        activeFinger={activeFinger}
        charStatuses={charStatuses}
        currentIndex={currentIndex}
        disabled={snapshot.phase === 'complete'}
      />
      <p style={{ margin: 'var(--space-4) 0 0', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
        Type in the passage area. The timer starts on your first character; music only responds to correct typing when sound is enabled.
      </p>
    </div>
  );
}

function Results({ snapshot, onPlayAgain, onExit }: { snapshot: SessionSnapshot; onPlayAgain: () => void; onExit: () => void }) {
  const { stats, elapsedSeconds } = snapshot;
  return (
    <div className="container" style={{ maxWidth: '52rem', paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-24)', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '4rem', height: '4rem', marginBottom: 'var(--space-5)', border: '1px solid var(--color-accent)', borderRadius: '50%', color: 'var(--color-accent)', backgroundColor: 'var(--color-accent-muted)' }}>
        <Music2 size={27} aria-hidden="true" />
      </div>
      <h1 style={{ margin: '0 0 var(--space-3)', fontSize: 'clamp(2rem, 5vw, 3.25rem)', letterSpacing: '-0.03em' }}>Session complete</h1>
      <p style={{ margin: '0 0 var(--space-10)', color: 'var(--color-text-secondary)' }}>You played for {elapsedSeconds} seconds. Keep the rhythm steady and accuracy will follow.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(9rem, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-10)', textAlign: 'left' }}>
        <Stat label="WPM" value={stats.wpm} accent />
        <Stat label="Accuracy" value={`${stats.accuracy}%`} accent />
        <Stat label="Correct" value={stats.correctChars} />
        <Stat label="Wrong" value={stats.wrongChars} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <button type="button" className="btn btn-primary btn-lg" onClick={onPlayAgain}><RotateCcw size={17} aria-hidden="true" />Play again</button>
        <button type="button" className="btn btn-secondary btn-lg" onClick={onExit}>Change controls</button>
      </div>
    </div>
  );
}

type MusicScreen = 'setup' | 'active';

export default function MusicPage() {
  const { snapshot, configure, reset, complete, onKeyDown } = useTypingEngine();
  const selectedMusic = useSettingsStore((state) => state.selectedMusic);
  const typingSoundVolume = useSettingsStore((state) => state.typingSoundVolume);
  const [screen, setScreen] = useState<MusicScreen>('setup');
  const [feedback, setFeedback] = useState<NoteFeedback | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const soundEnabled = selectedMusic !== null;

  const startSession = () => {
    const config: SessionConfig = {
      durationSeconds: SESSION_DURATION_SECONDS,
      mode: 'relaxed',
      text: buildMusicPassage(),
    };

    setFeedback(null);
    configure(config);
    setScreen('active');

    if (soundEnabled && typingSoundVolume > 0) {
      void audioEngine.unlock().then(setAudioReady);
    }
  };

  const handleTypingKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const typedKey = event.key === ' ' ? ' ' : event.key;
    const expectedKey = snapshot?.currentText[snapshot.currentIndex] ?? '';
    const printableKey = typedKey.length === 1;
    const consumed = onKeyDown(event);

    if (!consumed || !printableKey) return;

    const correct = typedKey === expectedKey;
    const note = audioEngine.getNoteForKey(typedKey);
    setFeedback({
      key: typedKey === ' ' ? 'SPACE' : typedKey.toUpperCase(),
      note: note?.name ?? '—',
      correct,
    });

    if (!soundEnabled || typingSoundVolume === 0) return;

    void audioEngine.unlock().then((unlocked) => {
      setAudioReady(unlocked);
      if (!unlocked) return;
      if (correct) audioEngine.playCorrectKey(typedKey, typingSoundVolume);
      else audioEngine.playIncorrectKey(typingSoundVolume);
    });
  };

  const exitToSetup = () => {
    reset();
    setFeedback(null);
    setScreen('setup');
  };

  if (screen === 'setup' || !snapshot) {
    return <MusicSetup onStart={startSession} audioReady={audioReady} soundEnabled={soundEnabled} />;
  }

  if (snapshot.phase === 'complete') {
    return <Results snapshot={snapshot} onPlayAgain={startSession} onExit={exitToSetup} />;
  }

  return (
    <ActiveMusicSession
      snapshot={snapshot}
      onKeyDown={handleTypingKeyDown}
      onStop={complete}
      feedback={feedback}
      audioReady={audioReady}
      soundEnabled={soundEnabled}
    />
  );
}
