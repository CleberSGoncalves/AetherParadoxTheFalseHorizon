/**
 * @fileoverview Procedural Web Audio API Synthesizer for Aether Paradox: The False Horizon
 * Complete procedural audio system with ZERO external asset dependencies (Zero 404s).
 * Includes:
 * - FluidCleb Interactive intro harmonic sweep + shimmer chime
 * - Comical & tactile game feel SFX (Jumps, Lands, Pops, Traps, Stars, Victory)
 * - Meta-game SFX (Clicks, Spins, Revives)
 * - Procedural Cybernetic Ambient BGM drone/arpeggiator
 * - Tab visibility lifecycle management (Auto-suspend when hidden/blur, resume on focus)
 * - CrazyGames ad muting compliance
 */

class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isAdMuted = false;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;
    this.bgmPlaying = false;
    this.bgmInterval = null;

    this.initLifecycle();
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();
        this.bgmGain = this.ctx.createGain();

        this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.bgmGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

        this.sfxGain.connect(this.masterGain);
        this.bgmGain.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  initLifecycle() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (this.ctx && this.ctx.state === 'running') {
            this.ctx.suspend().catch(() => {});
          }
        } else {
          if (this.ctx && this.ctx.state === 'suspended' && !this.isMuted && !this.isAdMuted) {
            this.ctx.resume().catch(() => {});
          }
        }
      });

      window.addEventListener('blur', () => {
        if (this.ctx && this.ctx.state === 'running') {
          this.ctx.suspend().catch(() => {});
        }
      });

      window.addEventListener('focus', () => {
        if (this.ctx && this.ctx.state === 'suspended' && !this.isMuted && !this.isAdMuted) {
          this.ctx.resume().catch(() => {});
        }
      });
    }
  }

  setAdMuted(muted) {
    this.isAdMuted = !!muted;
    this.updateGain();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.updateGain();
    return this.isMuted;
  }

  updateGain() {
    if (!this.masterGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    const target = (this.isMuted || this.isAdMuted) ? 0 : 1;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.linearRampToValueAtTime(target, now + 0.05);
  }

  playTone(type, startF, endF, dur, gainMax = 0.25, gainNode = null) {
    if (this.isMuted || this.isAdMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(20, startF), now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endF), now + dur);

      gain.gain.setValueAtTime(gainMax, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      osc.connect(gain);
      gain.connect(gainNode || this.sfxGain || this.ctx.destination);

      osc.start(now);
      osc.stop(now + dur);
    } catch (_) {}
  }

  playNoise(dur, gainMax = 0.15) {
    if (this.isMuted || this.isAdMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const bufferSize = this.ctx.sampleRate * dur;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000;

      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(gainMax, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain || this.ctx.destination);

      whiteNoise.start(now);
    } catch (_) {}
  }

  /**
   * Official FluidCleb Interactive Splash sound:
   * Harmonic cyber sweep + shimmering crystalline chime.
   */
  playFluidClebIntro() {
    this.init();
    if (this.isMuted || this.isAdMuted || !this.ctx) return;

    const notes = [220, 277.18, 329.63, 440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone('sine', freq, freq * 1.5, 0.45, 0.12);
      }, idx * 75);
    });

    // Shimmer chime at fusion time (1.3s)
    setTimeout(() => {
      [880, 1108.73, 1318.51, 1760].forEach((f, i) => {
        setTimeout(() => {
          this.playTone('triangle', f, f * 0.98, 0.6, 0.14);
        }, i * 60);
      });
    }, 1250);
  }

  playJump() {
    // Cybernetic spring jump
    this.playTone('sine', 160, 480, 0.14, 0.22);
  }

  playLand() {
    // Mechanical soft cushion
    this.playTone('triangle', 120, 45, 0.08, 0.18);
  }

  playPopDeath() {
    // Hilarious pitch-drop pop with burst of noise
    this.playTone('sawtooth', 420, 50, 0.16, 0.35);
    this.playNoise(0.09, 0.15);
  }

  playTrapTrigger() {
    // Alert chirp when a hidden trap activates
    this.playTone('square', 450, 280, 0.08, 0.14);
  }

  playStarCollect(starIndex = 0) {
    // Ascending arpeggio with shimmer (C, E, G, High C)
    const pitches = [523.25, 659.25, 783.99, 1046.50];
    const pitch = pitches[Math.min(starIndex, pitches.length - 1)];
    this.playTone('sine', pitch, pitch * 1.2, 0.22, 0.25);
    this.playTone('triangle', pitch * 2, pitch * 2, 0.18, 0.12);
  }

  playVictory() {
    if (this.isMuted || this.isAdMuted) return;
    this.init();
    if (!this.ctx) return;

    // Glorious synthetic fanfare
    const fanfare = [
      { f: 440, d: 0.1 },
      { f: 554.37, d: 0.1 },
      { f: 659.25, d: 0.12 },
      { f: 880, d: 0.35 }
    ];

    fanfare.forEach((note, i) => {
      setTimeout(() => {
        this.playTone('sine', note.f, note.f, note.d, 0.25);
        this.playTone('triangle', note.f * 0.5, note.f * 0.5, note.d, 0.15);
      }, i * 110);
    });
  }

  playClick() {
    this.playTone('sine', 600, 350, 0.04, 0.12);
  }

  playSpinTick() {
    this.playTone('triangle', 380, 180, 0.03, 0.08);
  }

  playRewardFanfare() {
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
      setTimeout(() => this.playTone('sine', f, f, 0.2, 0.2), i * 80);
    });
  }

  playRevive() {
    this.playTone('sine', 180, 680, 0.35, 0.3);
    this.playTone('triangle', 90, 340, 0.4, 0.2);
  }

  startCyberBgm() {
    if (this.bgmPlaying) return;
    this.init();
    if (!this.ctx) return;
    this.bgmPlaying = true;

    // Lo-Fi Cyber Ambient Arpeggiator Loop
    const chords = [
      [130.81, 164.81, 196.00], // C
      [146.83, 174.61, 220.00], // Dm
      [110.00, 130.81, 164.81], // Am
      [123.47, 146.83, 185.00]  // Bdim / G
    ];

    let chordIdx = 0;
    let step = 0;

    const playBgmStep = () => {
      if (!this.bgmPlaying || this.isMuted || this.isAdMuted) return;
      try {
        const chord = chords[chordIdx];
        const freq = chord[step % chord.length] * (step % 2 === 0 ? 1 : 2);
        this.playTone('sine', freq, freq, 0.35, 0.04, this.bgmGain);

        step++;
        if (step >= 8) {
          step = 0;
          chordIdx = (chordIdx + 1) % chords.length;
        }
      } catch (_) {}
    };

    this.bgmInterval = setInterval(playBgmStep, 380);
  }

  stopCyberBgm() {
    this.bgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const sound = new AudioManager();
