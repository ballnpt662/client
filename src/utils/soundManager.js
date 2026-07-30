// soundManager.js - Web Audio API synthesized sound effects (no external files)

class SoundManager {
  constructor() {
    this.muted = false;
    this._ctx = null;
  }

  _getCtx() {
    if (!this._ctx) {
      try {
        this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        return null;
      }
    }
    if (this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
    return this._ctx;
  }

  _play(notes) {
    if (this.muted) return;
    const ctx = this._getCtx();
    if (!ctx) return;
    let startTime = ctx.currentTime;
    notes.forEach(({ freq, duration, type = 'sine', gain = 0.3, delay = 0 }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime + delay);
      gainNode.gain.setValueAtTime(0, startTime + delay);
      gainNode.gain.linearRampToValueAtTime(gain, startTime + delay + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + delay + duration);
      osc.start(startTime + delay);
      osc.stop(startTime + delay + duration + 0.05);
    });
  }

  // Pleasant bell for turn start
  playTurnStart() {
    this._play([
      { freq: 523, duration: 0.25, type: 'sine', gain: 0.25 },
      { freq: 659, duration: 0.25, type: 'sine', gain: 0.2, delay: 0.18 },
      { freq: 784, duration: 0.4, type: 'sine', gain: 0.22, delay: 0.36 },
    ]);
  }

  // Dramatic tension for challenge
  playChallenge() {
    this._play([
      { freq: 220, duration: 0.12, type: 'sawtooth', gain: 0.35 },
      { freq: 196, duration: 0.12, type: 'sawtooth', gain: 0.35, delay: 0.10 },
      { freq: 174, duration: 0.25, type: 'sawtooth', gain: 0.38, delay: 0.20 },
    ]);
  }

  // Card flip whoosh
  playRevealCard() {
    const ctx = this._getCtx();
    if (!ctx || this.muted) return;
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.15);
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();
  }

  // Sad descending for elimination
  playEliminated() {
    this._play([
      { freq: 392, duration: 0.22, type: 'triangle', gain: 0.3 },
      { freq: 349, duration: 0.22, type: 'triangle', gain: 0.28, delay: 0.20 },
      { freq: 294, duration: 0.22, type: 'triangle', gain: 0.26, delay: 0.40 },
      { freq: 220, duration: 0.45, type: 'triangle', gain: 0.22, delay: 0.60 },
    ]);
  }

  // Triumphant victory fanfare
  playVictory() {
    this._play([
      { freq: 523, duration: 0.15, type: 'square', gain: 0.2 },
      { freq: 659, duration: 0.15, type: 'square', gain: 0.2, delay: 0.14 },
      { freq: 784, duration: 0.15, type: 'square', gain: 0.2, delay: 0.28 },
      { freq: 1047, duration: 0.45, type: 'square', gain: 0.22, delay: 0.42 },
      { freq: 784, duration: 0.15, type: 'sine', gain: 0.25, delay: 0.55 },
      { freq: 1047, duration: 0.6, type: 'sine', gain: 0.28, delay: 0.70 },
    ]);
  }

  // Coin collect chime
  playCoin() {
    this._play([
      { freq: 1046, duration: 0.12, type: 'sine', gain: 0.22 },
      { freq: 1318, duration: 0.18, type: 'sine', gain: 0.18, delay: 0.10 },
    ]);
  }

  toggle() {
    this.muted = !this.muted;
    return this.muted;
  }
}

export const soundManager = new SoundManager();
