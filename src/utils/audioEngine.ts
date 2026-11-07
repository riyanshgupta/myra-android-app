/**
 * Web Audio Synthesizer & Stream Player for Myra Intelligent Audio OS
 * Provides generative synthwave/ambient audio playback and live stream audio element.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timer: number | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private currentBpm = 118;
  private step = 0;
  private audioElement: HTMLAudioElement | null = null;
  private audioStreamUrl: string | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 0.35;

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;

      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setAudioStreamUrl(url: string) {
    this.audioStreamUrl = url;
    if (typeof window !== 'undefined') {
      if (!this.audioElement) {
        this.audioElement = new Audio();
        this.audioElement.crossOrigin = 'anonymous';
        (this.audioElement as any).referrerPolicy = 'no-referrer';
        this.audioElement.onerror = (e) => {
          console.warn('Audio element error during playback:', e);
          this.pause();
        };
      }
      this.audioElement.src = url;
      if (this.isPlaying) {
        this.audioElement.play().catch((err) => {
          console.warn('Audio play failed:', err);
          this.pause();
        });
      }
    }
  }

  public play() {
    this.initContext();
    this.isPlaying = true;

    if (this.audioStreamUrl && this.audioElement) {
      this.audioElement.play().catch((err) => {
        console.warn('Failed to play stream:', err);
        this.pause();
      });
    }
  }

  public pause() {
    this.isPlaying = false;
    if (this.audioElement) {
      this.audioElement.pause();
    }
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  public setVolume(val: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
    }
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, val));
    }
  }

  private triggerStep() {
    if (!this.ctx || !this.gainNode) return;
    const now = this.ctx.currentTime;
    const s = this.step % 16;
    this.step++;

    const bassNotes = [130.81, 155.56, 174.61, 196.0, 233.08];
    const padChords = [
      [261.63, 311.13, 392.0],
      [233.08, 293.66, 349.23],
      [207.65, 261.63, 311.13],
      [196.0, 246.94, 293.66]
    ];

    if (s % 2 === 0) {
      const noteIdx = Math.floor(s / 4) % bassNotes.length;
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(120, now + 0.18);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(bassNotes[noteIdx] / 2, now);

      noteGain.gain.setValueAtTime(0.25, now);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.gainNode);

      osc.start(now);
      osc.stop(now + 0.22);
    }

    if (s % 8 === 0) {
      const chordIdx = Math.floor(s / 8) % padChords.length;
      const chord = padChords[chordIdx];

      chord.forEach((freq) => {
        if (!this.ctx || !this.gainNode) return;
        const osc = this.ctx.createOscillator();
        const chordGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);

        chordGain.gain.setValueAtTime(0.01, now);
        chordGain.gain.linearRampToValueAtTime(0.06, now + 0.4);
        chordGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(filter);
        filter.connect(chordGain);
        chordGain.connect(this.gainNode);

        osc.start(now);
        osc.stop(now + 1.3);
      });
    }

    if (s % 4 === 2) {
      const leadNotes = [523.25, 622.25, 783.99, 932.33, 1046.5];
      const leadFreq = leadNotes[(s * 3) % leadNotes.length];
      const osc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(leadFreq, now);

      leadGain.gain.setValueAtTime(0.08, now);
      leadGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc.connect(leadGain);
      leadGain.connect(this.gainNode);

      osc.start(now);
      osc.stop(now + 0.42);
    }
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(16);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }
}

export const audioEngine = new AudioEngine();
