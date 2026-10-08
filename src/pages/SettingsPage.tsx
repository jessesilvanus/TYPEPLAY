/**
 * TYPEPLAY — SettingsPage
 * ==========================================================================
 * Persistent application preferences for future music/audio features and the
 * current display experience. All values are owned by the shared Zustand
 * settings store; this page intentionally keeps no duplicate settings state.
 */
import { Monitor, Moon, Music2, RotateCcw, SlidersHorizontal, Sun, Volume2, VolumeX } from 'lucide-react';
import { DEFAULT_MUSIC_TRACK_ID } from '../audio/tracks';
import { useSettingsStore } from '../stores/settingsStore';
import type { ThemePreference } from '../types/global';

const THEME_OPTIONS: Array<{
  value: ThemePreference;
  label: string;
  icon: typeof Moon;
  description: string;
}> = [
  { value: 'dark', label: 'Dark', icon: Moon, description: 'TYPEPLAY’s current premium dark palette' },
  { value: 'light', label: 'Light', icon: Sun, description: 'Saved for the light palette when available' },
  { value: 'system', label: 'System', icon: Monitor, description: 'Follow your device preference when available' },
];

function SectionHeading({ icon: Icon, title, description }: {
  icon: typeof SlidersHorizontal;
  title: string;
  description: string;
}) {
  return (
    <header style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
      <span
        aria-hidden="true"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: '0 0 auto',
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-accent)',
          backgroundColor: 'var(--color-accent-muted)',
        }}
      >
        <Icon size={18} />
      </span>
      <div>
        <h2 style={{ margin: 0, fontSize: '1.125rem', letterSpacing: '-0.01em' }}>{title}</h2>
        <p style={{ margin: 'var(--space-1) 0 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          {description}
        </p>
      </div>
    </header>
  );
}

function ToggleButton({ enabled, onToggle, label, description, icon: Icon }: {
  enabled: boolean;
  onToggle: () => void;
  label: string;
  description: string;
  icon: typeof Music2;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-4)',
        paddingBottom: 'var(--space-5)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        <Icon size={18} aria-hidden="true" style={{ flex: '0 0 auto', marginTop: '0.125rem', color: 'var(--color-accent)' }} />
        <div>
          <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
          <p style={{ margin: 'var(--space-1) 0 0', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
            {description}
          </p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`${label}: ${enabled ? 'on' : 'off'}`}
        onClick={onToggle}
        style={{
          position: 'relative',
          flex: '0 0 auto',
          width: '3rem',
          height: '1.75rem',
          padding: 0,
          border: '1px solid',
          borderColor: enabled ? 'var(--color-accent)' : 'var(--color-border-hover)',
          borderRadius: '999px',
          backgroundColor: enabled ? 'var(--color-accent)' : 'var(--color-bg)',
          cursor: 'pointer',
          transition: 'background-color var(--transition-fast), border-color var(--transition-fast)',
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
            transition: 'left var(--transition-fast), background-color var(--transition-fast)',
          }}
        />
      </button>
    </div>
  );
}

function VolumeControl({ id, label, value, onChange, description, muted }: {
  id: string;
  label: string;
  value: number;
  onChange: (volume: number) => void;
  description: string;
  muted: boolean;
}) {
  const VolumeIcon = muted ? VolumeX : Volume2;

  return (
    <div style={{ paddingTop: 'var(--space-5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
        <label htmlFor={id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 600 }}>
          <VolumeIcon size={17} aria-hidden="true" style={{ color: muted ? 'var(--color-text-muted)' : 'var(--color-accent)' }} />
          {label}
        </label>
        <output htmlFor={id} style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 700 }}>
          {value}%
        </output>
      </div>
      <p id={`${id}-description`} style={{ margin: '0 0 var(--space-3)', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
        {description}
      </p>
      <input
        id={id}
        type="range"
        min="0"
        max="100"
        step="1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-describedby={`${id}-description`}
        style={{ width: '100%', accentColor: 'var(--color-accent)', cursor: 'pointer' }}
      />
    </div>
  );
}

export default function SettingsPage() {
  const musicVolume = useSettingsStore((state) => state.musicVolume);
  const typingSoundVolume = useSettingsStore((state) => state.typingSoundVolume);
  const selectedMusic = useSettingsStore((state) => state.selectedMusic);
  const reducedMotion = useSettingsStore((state) => state.reducedMotion);
  const theme = useSettingsStore((state) => state.theme);
  const setMusicVolume = useSettingsStore((state) => state.setMusicVolume);
  const setTypingSoundVolume = useSettingsStore((state) => state.setTypingSoundVolume);
  const setSelectedMusic = useSettingsStore((state) => state.setSelectedMusic);
  const setReducedMotion = useSettingsStore((state) => state.setReducedMotion);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const resetSettings = useSettingsStore((state) => state.resetSettings);
  const musicEnabled = selectedMusic !== null;

  return (
    <div className="container" style={{ maxWidth: '64rem', paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-24)' }}>
      <header style={{ maxWidth: '42rem', marginBottom: 'var(--space-10)' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '0.375rem 0.75rem',
            marginBottom: 'var(--space-4)',
            border: '1px solid var(--color-border)',
            borderRadius: '999px',
            color: 'var(--color-accent)',
            backgroundColor: 'var(--color-bg-elevated)',
            fontSize: '0.8125rem',
            fontWeight: 600,
          }}
        >
          <SlidersHorizontal size={14} aria-hidden="true" />
          PREFERENCES
        </div>
        <h1 style={{ margin: '0 0 var(--space-3)', fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', lineHeight: 1.05, letterSpacing: '-0.03em' }}>
          Settings
        </h1>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '1.0625rem', lineHeight: 1.7 }}>
          Shape your TYPEPLAY experience. Changes are saved automatically on this device.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 28rem), 1fr))', gap: 'var(--space-6)' }}>
        <section className="card" aria-labelledby="audio-settings-heading">
          <SectionHeading
            icon={Music2}
            title="Audio"
            description="Choose how TYPEPLAY’s future music and key sounds should feel."
          />
          <div>
            <ToggleButton
              enabled={musicEnabled}
              onToggle={() => setSelectedMusic(musicEnabled ? null : DEFAULT_MUSIC_TRACK_ID)}
              label="Music playback"
              description={musicEnabled ? 'Music is enabled for upcoming TYPEPLAY music modes.' : 'Music playback is muted.'}
              icon={Music2}
            />
            <VolumeControl
              id="music-volume"
              label="Music volume"
              value={musicVolume}
              onChange={setMusicVolume}
              description="Controls the level for original music tracks when they are available."
              muted={!musicEnabled || musicVolume === 0}
            />
            <VolumeControl
              id="typing-sound-volume"
              label="Typing sound volume"
              value={typingSoundVolume}
              onChange={setTypingSoundVolume}
              description="Set this to 0% to keep key sounds muted."
              muted={typingSoundVolume === 0}
            />
          </div>
        </section>

        <section className="card" aria-labelledby="appearance-settings-heading">
          <SectionHeading
            icon={Monitor}
            title="Appearance & motion"
            description="Control visual motion and save your preferred display theme."
          />
          <ToggleButton
            enabled={reducedMotion}
            onToggle={() => setReducedMotion(!reducedMotion)}
            label="Reduce motion"
            description="Minimizes optional interface motion. Your device accessibility preference is also respected."
            icon={Monitor}
          />

          <fieldset style={{ margin: 'var(--space-5) 0 0', padding: 0, border: 0 }}>
            <legend style={{ marginBottom: 'var(--space-3)', fontWeight: 600 }}>Theme preference</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 'var(--space-2)' }}>
              {THEME_OPTIONS.map(({ value, label, icon: Icon, description }) => {
                const active = theme === value;
                return (
                  <button
                    key={value}
                    type="button"
                    className="btn btn-md"
                    aria-pressed={active}
                    aria-label={`${label}: ${description}`}
                    onClick={() => setTheme(value)}
                    style={{
                      flexDirection: 'column',
                      gap: 'var(--space-1)',
                      minHeight: '5.5rem',
                      padding: 'var(--space-3)',
                      whiteSpace: 'normal',
                      backgroundColor: active ? 'var(--color-accent-muted)' : 'var(--color-bg-elevated)',
                      color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                      borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
                    }}
                  >
                    <Icon size={17} aria-hidden="true" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
            <p style={{ margin: 'var(--space-3) 0 0', color: 'var(--color-text-muted)', fontSize: '0.75rem', lineHeight: 1.5 }}>
              TYPEPLAY currently uses its dark palette. Your selection is saved as the app’s theme preference.
            </p>
          </fieldset>
        </section>
      </div>

      <section
        aria-labelledby="settings-reset-heading"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-6)',
          padding: 'var(--space-5) var(--space-6)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-bg-elevated)',
        }}
      >
        <div>
          <h2 id="settings-reset-heading" style={{ margin: 0, fontSize: '0.9375rem' }}>Restore defaults</h2>
          <p style={{ margin: 'var(--space-1) 0 0', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
            Restore audio and display preferences to their default values.
          </p>
        </div>
        <button type="button" className="btn btn-secondary btn-md" onClick={resetSettings}>
          <RotateCcw size={15} aria-hidden="true" />
          Reset settings
        </button>
      </section>

      <p style={{ margin: 'var(--space-5) 0 0', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
        Preferences are stored locally in this browser. No account or server is required.
      </p>
    </div>
  );
}
