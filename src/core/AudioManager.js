/**
 * AudioManager.js — procedural Web Audio soundscape. No audio files ship.
 *
 * Signal chain:
 *
 *   [ oscillators / noise ] → per-voice gain envelope
 *                                   ↓
 *                      master low-pass  ◄── driven by time dilation
 *                                   ↓        (18 kHz open → 620 Hz in slow-mo)
 *                            master gain
 *                                   ↓
 *                             destination
 *
 * Two rules shape everything here:
 *   1. The context is created lazily on a user gesture (mobile autoplay policy).
 *   2. Audio runs on `ctx.currentTime`, never on game time — so a hit-stop
 *      freezes the world while the impact transient keeps ringing. That gap is
 *      most of the punch.
 */

import { AUDIO, TIME } from '../config.js';

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.filter = null;
    this.noiseBuffer = null;
    this.enabled = true;
    this.unlocked = false;

    this._dilation = 1;
    this._lastImpactAt = -1;

    this._onVisibility = () => {
      if (!this.ctx) return;
      if (document.hidden) this.ctx.suspend?.();
      else this.ctx.resume?.();
    };
    document.addEventListener('visibilitychange', this._onVisibility);
  }

  /** Must be called from inside a user gesture handler. */
  unlock() {
    if (this.unlocked) {
      this.ctx?.resume?.();
      return true;
    }
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) {
      this.enabled = false;
      return false;
    }
    this.ctx = new Ctor();
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = AUDIO.filterOpen;
    this.filter.Q.value = 0.9;

    this.master = this.ctx.createGain();
    this.master.gain.value = AUDIO.masterGain;

    this.filter.connect(this.master);
    this.master.connect(this.ctx.destination);

    this.noiseBuffer = this._buildNoise(1.2);
    this.unlocked = true;
    this.ctx.resume?.();
    return true;
  }

  dispose() {
    document.removeEventListener('visibilitychange', this._onVisibility);
    this.ctx?.close?.();
    this.ctx = null;
    this.unlocked = false;
  }

  get ready() {
    return this.enabled && this.unlocked && this.ctx && this.ctx.state !== 'closed';
  }

  get now() {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  _buildNoise(seconds) {
    const length = Math.floor(this.ctx.sampleRate * seconds);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  /* ---------------------------------------------------------------- *
   * Voice builders
   * ---------------------------------------------------------------- */

  /**
   * A pitched voice with an exponential decay envelope.
   */
  _tone({
    type = 'sine',
    freq = 220,
    freqEnd = null,
    duration = 0.25,
    gain = 0.2,
    attack = 0.004,
    detune = 0,
    delay = 0
  }) {
    if (!this.ready) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = type;
    osc.detune.value = detune;
    osc.frequency.setValueAtTime(Math.max(freq, 1), t0);
    if (freqEnd !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), t0 + duration);
    }

    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0002), t0 + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    osc.connect(env);
    env.connect(this.filter);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
    osc.onended = () => {
      osc.disconnect();
      env.disconnect();
    };
  }

  /**
   * A filtered noise burst — the basis of every crunch, snap and whoosh.
   */
  _noise({
    duration = 0.2,
    gain = 0.25,
    filterType = 'bandpass',
    freq = 800,
    freqEnd = null,
    q = 1.2,
    attack = 0.003,
    delay = 0
  }) {
    if (!this.ready) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;

    const bp = ctx.createBiquadFilter();
    bp.type = filterType;
    bp.frequency.setValueAtTime(Math.max(freq, 20), t0);
    if (freqEnd !== null) {
      bp.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 20), t0 + duration);
    }
    bp.Q.value = q;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0002), t0 + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    src.connect(bp);
    bp.connect(env);
    env.connect(this.filter);
    src.start(t0);
    src.stop(t0 + duration + 0.02);
    src.onended = () => {
      src.disconnect();
      bp.disconnect();
      env.disconnect();
    };
  }

  /* ---------------------------------------------------------------- *
   * Time dilation treatment
   * ---------------------------------------------------------------- */

  /**
   * Glide the master filter and gain toward the current time scale. Called
   * every frame; only touches the graph when the scale actually moved.
   */
  setTimeDilation(scale) {
    if (!this.ready) return;
    if (Math.abs(scale - this._dilation) < 0.01) return;
    this._dilation = scale;

    const span = TIME.normal - TIME.bullet;
    const t = span > 0 ? Math.min(Math.max((scale - TIME.bullet) / span, 0), 1) : 1;
    // Exponential interpolation reads as linear to the ear.
    const cutoff = AUDIO.filterBullet * Math.pow(AUDIO.filterOpen / AUDIO.filterBullet, t);
    const gain = AUDIO.masterGain * (AUDIO.bulletGain + (1 - AUDIO.bulletGain) * t);
    const now = this.now;
    this.filter.frequency.cancelScheduledValues(now);
    this.filter.frequency.setTargetAtTime(cutoff, now, AUDIO.filterGlide);
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(gain, now, AUDIO.filterGlide);
  }

  /* ---------------------------------------------------------------- *
   * Game events
   * ---------------------------------------------------------------- */

  /** Crisp snap as the band lets go. */
  slingshot(power = 1) {
    this._noise({
      duration: 0.16,
      gain: AUDIO.releaseGain * (0.6 + power * 0.6),
      filterType: 'bandpass',
      freq: 900 + power * 700,
      freqEnd: 180,
      q: 1.1
    });
    this._tone({
      type: 'square',
      freq: 520 + power * 240,
      freqEnd: 190,
      duration: 0.1,
      gain: 0.09
    });
  }

  /** Entering / leaving bullet-time. */
  focusEnter() {
    this._tone({ type: 'sine', freq: 480, freqEnd: 150, duration: 0.34, gain: 0.14 });
  }

  focusExit() {
    this._tone({ type: 'sine', freq: 170, freqEnd: 460, duration: 0.2, gain: 0.1 });
  }

  /**
   * Ascending pentatonic note, one degree per unbroken chain hit.
   * @param {number} index 0-based chain index
   */
  chainNote(index = 0) {
    const scale = AUDIO.scale;
    const degree = index % scale.length;
    // The scale has five degrees, so this also implements "octave up every 5".
    const semis = scale[degree] + 12 * Math.floor(index / scale.length);
    const freq = AUDIO.rootHz * Math.pow(2, semis / 12);
    this._tone({
      type: 'triangle',
      freq,
      duration: 0.34,
      gain: AUDIO.chainNoteGain,
      attack: 0.006
    });
    this._tone({
      type: 'sine',
      freq: freq * 2,
      duration: 0.18,
      gain: AUDIO.chainNoteGain * 0.4,
      attack: 0.004
    });
  }

  /** Weight of a cue strike; brightness scales with momentum. */
  impact(intensity = 0.5) {
    // Collapse simultaneous impacts so a six-body break does not clip.
    const now = this.now;
    if (now - this._lastImpactAt < 0.03) return;
    this._lastImpactAt = now;

    const i = Math.min(Math.max(intensity, 0), 1);
    this._noise({
      duration: 0.14 + i * 0.1,
      gain: AUDIO.impactGain * (0.5 + i * 0.8),
      filterType: 'lowpass',
      freq: 1400 + i * 2600,
      freqEnd: 260,
      q: 0.9
    });
    this._tone({
      type: 'sine',
      freq: 140 + i * 90,
      freqEnd: 52,
      duration: 0.2 + i * 0.14,
      gain: 0.22 + i * 0.16
    });
  }

  /** The money sound: sub-bass drop under a noise crack. */
  carom() {
    this._tone({ type: 'sine', freq: 130, freqEnd: 38, duration: 0.42, gain: AUDIO.subGain });
    this._noise({
      duration: 0.2,
      gain: 0.3,
      filterType: 'bandpass',
      freq: 2600,
      freqEnd: 420,
      q: 0.8
    });
    this._tone({ type: 'triangle', freq: 330, freqEnd: 165, duration: 0.24, gain: 0.14 });
  }

  /** Terminal, darker than a carom. */
  wallSplat() {
    this._noise({
      duration: 0.26,
      gain: 0.34,
      filterType: 'lowpass',
      freq: 900,
      freqEnd: 120,
      q: 1.4
    });
    this._tone({ type: 'sine', freq: 96, freqEnd: 34, duration: 0.36, gain: AUDIO.subGain * 0.85 });
  }

  /** A bright fifth stacked on the chain note. */
  backstab() {
    this._tone({ type: 'square', freq: 880, freqEnd: 1320, duration: 0.16, gain: 0.13 });
    this._tone({ type: 'sine', freq: 1320, duration: 0.22, gain: 0.1 });
  }

  rebound(intensity = 0.5) {
    const i = Math.min(Math.max(intensity, 0), 1);
    this._noise({
      duration: 0.09,
      gain: 0.14 + i * 0.14,
      filterType: 'bandpass',
      freq: 1800 + i * 1800,
      freqEnd: 700,
      q: 2.2
    });
  }

  bumper() {
    this._tone({ type: 'square', freq: 660, freqEnd: 1180, duration: 0.13, gain: 0.16 });
    this._tone({ type: 'sine', freq: 1320, duration: 0.1, gain: 0.09 });
  }

  pyre() {
    this._tone({ type: 'sawtooth', freq: 180, freqEnd: 720, duration: 0.3, gain: 0.13 });
  }

  enemyShot() {
    this._tone({ type: 'square', freq: 420, freqEnd: 220, duration: 0.13, gain: 0.1 });
    this._tone({ type: 'square', freq: 300, freqEnd: 150, duration: 0.16, gain: 0.07, delay: 0.05 });
  }

  enemyDeath() {
    this._noise({
      duration: 0.22,
      gain: 0.2,
      filterType: 'bandpass',
      freq: 1800,
      freqEnd: 300,
      q: 0.7
    });
    this._tone({ type: 'triangle', freq: 220, freqEnd: 70, duration: 0.24, gain: 0.14 });
  }

  playerHurt() {
    this._tone({ type: 'square', freq: 150, freqEnd: 62, duration: 0.28, gain: 0.24, detune: -18 });
    this._noise({ duration: 0.14, gain: 0.16, filterType: 'lowpass', freq: 600, q: 1.1 });
  }

  playerDeath() {
    this._tone({ type: 'sawtooth', freq: 220, freqEnd: 28, duration: 1.1, gain: 0.3 });
    this._noise({ duration: 0.9, gain: 0.2, filterType: 'lowpass', freq: 1200, freqEnd: 90, q: 1 });
  }

  /** Sub-bass drop + an ascending root-fifth-octave release. */
  roomClear() {
    this._tone({ type: 'sine', freq: 120, freqEnd: 40, duration: 0.5, gain: AUDIO.subGain });
    const root = AUDIO.rootHz;
    this._tone({ type: 'triangle', freq: root, duration: 0.3, gain: 0.16, delay: 0.02 });
    this._tone({ type: 'triangle', freq: root * 1.5, duration: 0.3, gain: 0.15, delay: 0.11 });
    this._tone({ type: 'triangle', freq: root * 2, duration: 0.45, gain: 0.16, delay: 0.2 });
  }

  /** Warm triad with a slow attack — ceremony. */
  boonPick() {
    const root = AUDIO.rootHz * 1.5;
    for (const [mult, delay] of [
      [1, 0],
      [1.25, 0.05],
      [1.5, 0.1],
      [2, 0.16]
    ]) {
      this._tone({
        type: 'triangle',
        freq: root * mult,
        duration: 0.7,
        gain: 0.13,
        attack: 0.05,
        delay
      });
    }
  }

  doorOpen() {
    this._tone({ type: 'sine', freq: 300, freqEnd: 900, duration: 0.35, gain: 0.14 });
    this._noise({
      duration: 0.3,
      gain: 0.12,
      filterType: 'bandpass',
      freq: 500,
      freqEnd: 2600,
      q: 1.6
    });
  }
}

export default AudioManager;
