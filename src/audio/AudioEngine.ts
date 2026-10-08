/**
 * TYPEPLAY — AudioEngine
 * ==========================================================================
 * Browser-only singleton that owns lazy Web Audio initialization and routes
 * typing events to the procedural PianoSynth. No AudioContext is constructed
 * on import or page load; callers must invoke unlock() from a user gesture.
 */
import { getPianoKeyNote, type PianoKeyNote } from './keyNoteMap';
import { PianoSynth } from './PianoSynth';

function createAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextConstructor = window.AudioContext;
  return AudioContextConstructor ? new AudioContextConstructor() : null;
}

export class AudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private pianoSynth: PianoSynth | null = null;

  /**
   * Construct/resume the context after a user interaction. Returns false where
   * Web Audio is unsupported or a browser rejects the attempted resume.
   */
  async unlock(): Promise<boolean> {
    if (!this.context) {
      this.context = createAudioContext();
      if (!this.context) return false;

      this.masterGain = this.context.createGain();
      this.masterGain.gain.setValueAtTime(1, this.context.currentTime);
      this.masterGain.connect(this.context.destination);
      this.pianoSynth = new PianoSynth(this.context, this.masterGain);
    }

    if (this.context.state === 'suspended') {
      try {
        await this.context.resume();
      } catch {
        return false;
      }
    }

    return this.context.state === 'running';
  }

  /** True only after a context has been unlocked and is capable of playback. */
  get isReady(): boolean {
    return this.context?.state === 'running' && this.pianoSynth !== null;
  }

  /** Retrieve a key note so the UI can render exactly what the synth plays. */
  getNoteForKey(key: string): PianoKeyNote | null {
    return getPianoKeyNote(key);
  }

  /** Trigger a piano-like sound for a correct typing character. */
  playCorrectKey(key: string, typingSoundVolume: number): void {
    const note = this.getNoteForKey(key);
    if (!note) return;
    this.pianoSynth?.playMidi(note.midi, normaliseVolume(typingSoundVolume));
  }

  /** Trigger an intentionally gentle error cue for an incorrect input. */
  playIncorrectKey(typingSoundVolume: number): void {
    this.pianoSynth?.playIncorrectFeedback(normaliseVolume(typingSoundVolume));
  }

  /** Release browser resources if the application ever needs explicit teardown. */
  async dispose(): Promise<void> {
    if (!this.context) return;
    const context = this.context;
    this.context = null;
    this.masterGain = null;
    this.pianoSynth = null;
    await context.close();
  }
}

function normaliseVolume(value: number): number {
  return Math.min(1, Math.max(0, value / 100));
}

export const audioEngine = new AudioEngine();
