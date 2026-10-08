/**
 * TYPEPLAY — Settings Store
 * ==========================================================================
 * Zustand store that owns all persisted application settings.
 *
 * Phase 1 establishes the store, its default values, and the persistence
 * mechanism (localStorage via the `persist` middleware). The setters here
 * are deliberately minimal — they store raw values only, holding no
 * business logic. As later phases add real audio/music systems, the
 * components that consume these settings will apply the values.
 *
 * Architecture rule: stores are the bridge between framework-agnostic
 * engines and the React UI. This store does not import any engine yet
 * because no engine exists this early.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS, type Settings, type ThemePreference } from '../types/global';

/** Default settings applied on first run and used as fallback for missing keys. */
export const DEFAULT_SETTINGS: Settings = {
  musicVolume: 70,
  typingSoundVolume: 60,
  selectedMusic: null,
  reducedMotion: false,
  theme: 'dark',
  updatedAt: new Date(0).toISOString(),
};

/** Bound-clamp helper so volume values always stay within 0–100. */
function clampVolume(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

/** Returns the current ISO timestamp — centralised so every setter stays consistent. */
function nowISO(): string {
  return new Date().toISOString();
}

interface SettingsActions {
  setMusicVolume: (volume: number) => void;
  setTypingSoundVolume: (volume: number) => void;
  setSelectedMusic: (trackId: string | null) => void;
  setReducedMotion: (reduced: boolean) => void;
  setTheme: (theme: ThemePreference) => void;
  resetSettings: () => void;
}

type SettingsStore = Settings & SettingsActions;

/**
 * Detect the OS-level reduced-motion preference. Used only as an initial
 * sensible default for users who have never touched the setting themselves.
 */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      reducedMotion: prefersReducedMotion(),

      setMusicVolume: (volume) =>
        set(() => ({
          musicVolume: clampVolume(volume),
          updatedAt: nowISO(),
        })),

      setTypingSoundVolume: (volume) =>
        set(() => ({
          typingSoundVolume: clampVolume(volume),
          updatedAt: nowISO(),
        })),

      setSelectedMusic: (trackId) =>
        set(() => ({
          selectedMusic: trackId,
          updatedAt: nowISO(),
        })),

      setReducedMotion: (reduced) =>
        set(() => ({
          reducedMotion: reduced,
          updatedAt: nowISO(),
        })),

      setTheme: (theme) =>
        set(() => ({
          theme,
          updatedAt: nowISO(),
        })),

      resetSettings: () =>
        set(() => ({
          ...DEFAULT_SETTINGS,
          reducedMotion: prefersReducedMotion(),
        })),
    }),
    {
      name: STORAGE_KEYS.settings,
      // Only the data fields (not the action functions) should be persisted.
      partialize: (state) => ({
        musicVolume: state.musicVolume,
        typingSoundVolume: state.typingSoundVolume,
        selectedMusic: state.selectedMusic,
        reducedMotion: state.reducedMotion,
        theme: state.theme,
        updatedAt: state.updatedAt,
      }),
    },
  ),
);
