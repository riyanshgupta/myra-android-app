/**
 * Continuous Background Wake Word Listener ("Hey Myra")
 * Continually monitors speech in the background and opens the Myra AI screen
 * when "Hey Myra" (or common voice variations) is spoken.
 */

type WakeWordCallback = (detectedPhrase: string) => void;

class WakeWordListenerService {
  private recognition: any = null;
  private isEnabled: boolean = true;
  private isListening: boolean = false;
  private isPaused: boolean = false;
  private hasPermission: boolean = false;
  private permissionError: string | null = null;
  private callbacks: Set<WakeWordCallback> = new Set();
  private statusListeners: Set<(isListening: boolean, isEnabled: boolean, hasPermission: boolean, error: string | null) => void> = new Set();
  private restartTimer: number | null = null;
  private audioContext: AudioContext | null = null;
  private lastTriggerTime: number = 0;
  private micStream: MediaStream | null = null;

  constructor() {
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      const handleUserGesture = () => {
        this.requestMicPermission();
      };
      try {
        window.addEventListener('click', handleUserGesture, { once: true });
        window.addEventListener('keydown', handleUserGesture, { once: true });
      } catch (_) {}
    }
  }

  public subscribe(callback: WakeWordCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  public subscribeStatus(
    listener: (isListening: boolean, isEnabled: boolean, hasPermission: boolean, error: string | null) => void
  ): () => void {
    this.statusListeners.add(listener);
    listener(this.isListening, this.isEnabled, this.hasPermission, this.permissionError);
    return () => this.statusListeners.delete(listener);
  }

  private notifyStatus() {
    this.statusListeners.forEach((fn) =>
      fn(this.isListening, this.isEnabled, this.hasPermission, this.permissionError)
    );
  }

  public async requestMicPermission(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.permissionError = 'Microphone API not supported on this browser';
      this.notifyStatus();
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.micStream = stream;
      this.hasPermission = true;
      this.permissionError = null;
      this.notifyStatus();

      if (this.isEnabled && !this.isPaused) {
        this.start();
      }
      return true;
    } catch (err: any) {
      console.warn('Microphone permission request for wake word listener failed:', err);
      this.hasPermission = false;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.permissionError = 'Mic permission blocked by browser';
      } else {
        this.permissionError = err.message || 'Microphone unavailable';
      }
      this.notifyStatus();
      return false;
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    } else if (!this.isPaused) {
      this.requestMicPermission().then((granted) => {
        if (granted) this.start();
      });
    }
    this.notifyStatus();
  }

  public toggle(): boolean {
    this.setEnabled(!this.isEnabled);
    return this.isEnabled;
  }

  public pause() {
    this.isPaused = true;
    this.stop();
  }

  public resume() {
    this.isPaused = false;
    if (this.isEnabled) {
      setTimeout(() => {
        if (!this.isPaused && this.isEnabled) {
          this.start();
        }
      }, 500);
    }
  }

  public start() {
    if (typeof window === 'undefined') return;
    if (!this.isEnabled || this.isPaused) return;

    const win = window as any;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      this.permissionError = 'SpeechRecognition API not available in this browser';
      this.notifyStatus();
      return;
    }

    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (_) {}
      this.recognition = null;
    }

    try {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        this.isListening = true;
        this.permissionError = null;
        this.notifyStatus();
      };

      rec.onresult = (event: any) => {
        const now = Date.now();
        if (now - this.lastTriggerTime < 3000) return;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const rawTranscript = event.results[i][0].transcript;
          const clean = rawTranscript.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

          // Flexible wake phrase check for all phonetic variations requested
          const isWakeWord =
            clean.includes('hey myra') ||
            clean.includes('hey mira') ||
            clean.includes('hey myara') ||
            clean.includes('hey mayara') ||
            clean.includes('hey mara') ||
            clean.includes('hi mira') ||
            clean.includes('hi myara') ||
            clean.includes('hi mayara') ||
            clean.includes('hi mara') ||
            clean.includes('ok mira') ||
            clean.includes('ok myara') ||
            clean.includes('ok mayara') ||
            clean.includes('ok mara') ||
            clean.includes('okay mira') ||
            clean.includes('okay myara') ||
            clean.includes('okay mayara') ||
            clean.includes('okay mara') ||
            clean.includes('myra') ||
            clean.includes('mira') ||
            clean.includes('myara') ||
            clean.includes('mayara') ||
            clean.includes('mara') ||
            clean.includes('mayra') ||
            clean.includes('meira') ||
            clean.includes('meera') ||
            clean.includes('maura') ||
            clean.includes('my ra') ||
            clean.includes('miah') ||
            (clean.includes('hey') && (clean.includes('m') || clean.includes('ra')));

          if (isWakeWord) {
            this.lastTriggerTime = now;
            this.playWakeChime();
            this.pause();
            this.callbacks.forEach((cb) => cb(rawTranscript));
            break;
          }
        }
      };

      rec.onerror = (err: any) => {
        if (err.error === 'not-allowed') {
          this.hasPermission = false;
          this.permissionError = 'Mic permission blocked';
          this.isListening = false;
          this.notifyStatus();
        } else if (err.error !== 'no-speech' && err.error !== 'aborted') {
          console.warn('Wake word listener status:', err.error);
        }
      };

      rec.onend = () => {
        this.isListening = false;
        this.notifyStatus();

        if (this.isEnabled && !this.isPaused && this.hasPermission) {
          if (this.restartTimer) window.clearTimeout(this.restartTimer);
          this.restartTimer = window.setTimeout(() => {
            if (this.isEnabled && !this.isPaused) {
              this.start();
            }
          }, 500);
        }
      };

      this.recognition = rec;
      rec.start();
    } catch (e) {
      this.isListening = false;
      this.notifyStatus();
    }
  }

  public stop() {
    if (this.restartTimer) {
      window.clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (_) {}
      try {
        this.recognition.abort();
      } catch (_) {}
      this.recognition = null;
    }
    this.isListening = false;
    this.notifyStatus();
  }

  public playWakeChime() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }
      const ctx = this.audioContext;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch (err) {
      // Audio context warning ignored
    }
  }

  public triggerWakeWordSimulated(phrase: string = 'Hey Myra') {
    this.playWakeChime();
    this.pause();
    this.callbacks.forEach((cb) => cb(phrase));
  }
}

export const wakeWordListener = new WakeWordListenerService();
