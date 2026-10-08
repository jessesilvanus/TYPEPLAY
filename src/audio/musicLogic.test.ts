import { describe, expect, it } from 'vitest';
import { getPianoKeyNote, midiToFrequency } from './keyNoteMap';
import { DEFAULT_MUSIC_TRACK_ID, getMusicTrack, MUSIC_TRACKS } from './tracks';

describe('piano key mapping', () => {
  it('maps typeable keys deterministically and normalizes letters', () => {
    expect(getPianoKeyNote('q')).toEqual({ key: 'q', midi: 61, name: 'C♯4' });
    expect(getPianoKeyNote('Q')).toEqual(getPianoKeyNote('q'));
    expect(getPianoKeyNote(' ')).toEqual({ key: ' ', midi: 95, name: 'B6' });
  });

  it('returns null for unsupported keys', () => {
    expect(getPianoKeyNote('Enter')).toBeNull();
    expect(getPianoKeyNote('💡')).toBeNull();
  });

  it('converts MIDI notes to standard frequencies', () => {
    expect(midiToFrequency(69)).toBe(440);
    expect(midiToFrequency(81)).toBe(880);
    expect(midiToFrequency(57)).toBe(220);
  });
});

describe('music catalog', () => {
  it('uses the first available original track as the default', () => {
    expect(DEFAULT_MUSIC_TRACK_ID).toBe('typeplay-default');
    expect(getMusicTrack(DEFAULT_MUSIC_TRACK_ID)).toMatchObject({
      id: 'typeplay-default',
      status: 'available',
    });
  });

  it('contains unique IDs and safely handles unavailable lookups', () => {
    const ids = MUSIC_TRACKS.map((track) => track.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(MUSIC_TRACKS.filter((track) => track.status === 'available')).toHaveLength(1);
    expect(getMusicTrack('morning-keys')).toMatchObject({ status: 'coming-soon' });
    expect(getMusicTrack(null)).toBeNull();
    expect(getMusicTrack('not-a-track')).toBeNull();
  });
});
