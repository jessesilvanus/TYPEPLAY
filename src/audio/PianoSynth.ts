/**
 * TYPEPLAY — PianoSynth
 * ==========================================================================
 * Lightweight, procedural piano-like voice generator. Each note uses a small
 * group of oscillators with a click-free gain envelope, then disconnects every
 * node after the release phase so rapid typing does not retain audio nodes.
 */
import { midiToFrequency } from './keyNoteMap';

const ATTACK_SECONDS = 0.008;
const RELEASE_SECONDS = 1.15;
const MIN_GAIN = 0.0001;

interface PartialDefinition {
  ratio: number;
  gain: number;
  type: OscillatorType;
}

const PIANO_PARTIALS: readonly PartialDefinition[] = [
  { ratio: 1, gain: 1, type: 'triangle' },
  { ratio: 2, gain: 0.36, type: 'sine' },
  { ratio: 3, gain: 0.12, type: 'sine' },
  { ratio: 4.01, gain: 0.05, type: 'sine' },
] as const;

/** Create short, mellow piano-like notes in an existing audio context. */
export class PianoSynth {
  private readonly context: AudioContext;
  private readonly destination: GainNode;

  constructor(context: AudioContext, destination: GainNode) {
    this.context = context;
    this.destination = destination;
  }

  /**
   * Play a note, using a short percussive attack and an exponential decay.
   * Volume is normalized from 0–1 by AudioEngine.
   */
  playMidi(midi: number, volume: number): void {
    if (volume <= 0 || this.context.state !== 'running') return;

    const now = this.context.currentTime;
    const duration = RELEASE_SECONDS + ATTACK_SECONDS + 0.08;
    const voiceGain = this.context.createGain();
    const peakGain = Math.min(0.17, Math.max(MIN_GAIN, volume * 0.17));

    voiceGain.gain.setValueAtTime(MIN_GAIN, now);
    voiceGain.gain.exponentialRampToValueAtTime(peakGain, now + ATTACK_SECONDS);
    voiceGain.gain.exponentialRampToValueAtTime(MIN_GAIN, now + RELEASE_SECONDS);
    voiceGain.connect(this.destination);

    const oscillators = PIANO_PARTIALS.map((partial) => {
      const oscillator = this.context.createOscillator();
      const partialGain = this.context.createGain();
      const frequency = midiToFrequency(midi) * partial.ratio;

      oscillator.type = partial.type;
      oscillator.frequency.setValueAtTime(frequency, now);
      partialGain.gain.setValueAtTime(partial.gain, now);
      oscillator.connect(partialGain);
      partialGain.connect(voiceGain);
      oscillator.start(now);
      oscillator.stop(now + duration);

      oscillator.addEventListener('ended', () => {
        oscillator.disconnect();
        partialGain.disconnect();
      }, { once: true });

      return oscillator;
    });

    const cleanupTime = Math.ceil(duration * 1000) + 50;
    window.setTimeout(() => {
      voiceGain.disconnect();
      oscillators.forEach((oscillator) => oscillator.disconnect());
    }, cleanupTime);
  }

  /** A deliberately quiet, non-musical cue for an incorrect character. */
  playIncorrectFeedback(volume: number): void {
    if (volume <= 0 || this.context.state !== 'running') return;

    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const feedbackGain = Math.min(0.018, Math.max(MIN_GAIN, volume * 0.018));

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(145, now);
    oscillator.frequency.exponentialRampToValueAtTime(115, now + 0.06);
    gain.gain.setValueAtTime(MIN_GAIN, now);
    gain.gain.exponentialRampToValueAtTime(feedbackGain, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(MIN_GAIN, now + 0.07);

    oscillator.connect(gain);
    gain.connect(this.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.09);
    oscillator.addEventListener('ended', () => {
      oscillator.disconnect();
      gain.disconnect();
    }, { once: true });
  }
}
