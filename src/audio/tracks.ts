/**
 * TYPEPLAY — Music track catalog
 * ==========================================================================
 * Metadata-only catalog for original/procedural tracks. Track selection stays
 * decoupled from playback so future synth-backed compositions can be added
 * without changing the typing-sound engine or settings persistence.
 */

export interface MusicTrack {
  id: string;
  title: string;
  description: string;
  status: 'available' | 'coming-soon';
}

export const MUSIC_TRACKS: readonly MusicTrack[] = [
  {
    id: 'typeplay-default',
    title: 'Typing Piano',
    description: 'Responsive original piano tones mapped to your keyboard.',
    status: 'available',
  },
  { id: 'morning-keys', title: 'Morning Keys', description: 'Original track in development.', status: 'coming-soon' },
  { id: 'golden-rhythm', title: 'Golden Rhythm', description: 'Original track in development.', status: 'coming-soon' },
  { id: 'focus-flow', title: 'Focus Flow', description: 'Original track in development.', status: 'coming-soon' },
  { id: 'night-practice', title: 'Night Practice', description: 'Original track in development.', status: 'coming-soon' },
  { id: 'home-row-horizon', title: 'Home Row Horizon', description: 'Original track in development.', status: 'coming-soon' },
  { id: 'steady-hands', title: 'Steady Hands', description: 'Original track in development.', status: 'coming-soon' },
  { id: 'quiet-speed', title: 'Quiet Speed', description: 'Original track in development.', status: 'coming-soon' },
  { id: 'clear-keys', title: 'Clear Keys', description: 'Original track in development.', status: 'coming-soon' },
  { id: 'final-passage', title: 'Final Passage', description: 'Original track in development.', status: 'coming-soon' },
] as const;

export const DEFAULT_MUSIC_TRACK_ID = MUSIC_TRACKS[0].id;

export function getMusicTrack(trackId: string | null): MusicTrack | null {
  if (!trackId) return null;
  return MUSIC_TRACKS.find((track) => track.id === trackId) ?? null;
}
