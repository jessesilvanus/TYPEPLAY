import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, useSettingsStore } from './settingsStore';
import { STORAGE_KEYS } from '../types/global';

function resetStore() {
  useSettingsStore.getState().resetSettings();
}

describe('settingsStore', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  it('provides the documented default settings', () => {
    const state = useSettingsStore.getState();

    expect(state).toMatchObject(DEFAULT_SETTINGS);
  });

  it('clamps and rounds both volume controls', () => {
    const { setMusicVolume, setTypingSoundVolume } = useSettingsStore.getState();

    setMusicVolume(120.4);
    setTypingSoundVolume(-4.6);
    expect(useSettingsStore.getState()).toMatchObject({
      musicVolume: 100,
      typingSoundVolume: 0,
    });

    setMusicVolume(42.6);
    setTypingSoundVolume(58.4);
    expect(useSettingsStore.getState()).toMatchObject({
      musicVolume: 43,
      typingSoundVolume: 58,
    });
  });

  it('updates music selection, motion preference, theme, and modification time', () => {
    const initialUpdatedAt = useSettingsStore.getState().updatedAt;
    const { setSelectedMusic, setReducedMotion, setTheme } = useSettingsStore.getState();

    setSelectedMusic('typeplay-default');
    setReducedMotion(true);
    setTheme('light');

    expect(useSettingsStore.getState()).toMatchObject({
      selectedMusic: 'typeplay-default',
      reducedMotion: true,
      theme: 'light',
    });
    expect(Date.parse(useSettingsStore.getState().updatedAt)).toBeGreaterThanOrEqual(Date.parse(initialUpdatedAt));

    useSettingsStore.getState().setSelectedMusic(null);
    expect(useSettingsStore.getState().selectedMusic).toBeNull();
  });

  it('persists data fields without action functions and resets changed preferences', () => {
    useSettingsStore.getState().setMusicVolume(20);
    useSettingsStore.getState().setSelectedMusic('typeplay-default');

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) ?? '{}') as {
      state?: { musicVolume?: number; selectedMusic?: string | null; setMusicVolume?: unknown };
    };
    expect(stored.state).toMatchObject({
      musicVolume: 20,
      selectedMusic: 'typeplay-default',
    });
    expect(stored.state?.setMusicVolume).toBeUndefined();

    useSettingsStore.getState().resetSettings();
    expect(useSettingsStore.getState()).toMatchObject(DEFAULT_SETTINGS);
  });
});
