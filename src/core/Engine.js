/**
 * Engine.js — the game's clock and camera-feel authority.
 *
 * Owns three things nobody else is allowed to touch:
 *   1. Time dilation (real time 1.0 ⇄ bullet-time 0.20) with asymmetric blending.
 *   2. Hit-stop — a hard freeze of the simulation measured in *real* time.
 *   3. Camera impulse shake + zoom punch.
 *
 * `update(rawDt)` returns the scaled delta the rest of the game simulates with.
 * While frozen (hit-stop or pause) it returns `dt === 0`, which every system
 * treats as "skip simulation, keep rendering" — audio deliberately keeps running.
 */

import { TIME, FEEL } from '../config.js';

export class Engine {
  /**
   * @param {import('three').OrthographicCamera} camera
   * @param {{ reducedMotion?: boolean }} [options]
   */
  constructor(camera, options = {}) {
    this.camera = camera;
    this.basePosition = camera.position.clone();
    this.reducedMotion = Boolean(options.reducedMotion);

    /** Current and target simulation speed. */
    this.timeScale = TIME.normal;
    this.targetScale = TIME.normal;

    /** Real-time seconds left of hit-stop. */
    this.hitStopRemaining = 0;
    this.paused = false;

    /** Camera shake state. */
    this.shakeAmplitude = 0;
    this.shakePhase = Math.random() * 100;

    /** Ortho zoom punch state. */
    this.zoom = 1;

    /** Clocks. */
    this.elapsed = 0; // scaled seconds
    this.realElapsed = 0; // wall-clock seconds

    this._lastAppliedZoom = 1;
  }

  /* ---------------------------------------------------------------- *
   * Time dilation
   * ---------------------------------------------------------------- */

  /** Drop into (or out of) bullet-time. */
  setBulletTime(active) {
    this.targetScale = active ? TIME.bullet : TIME.normal;
  }

  /** Force a specific scale (used by the room-clear beat). */
  setTimeScale(scale) {
    this.targetScale = scale;
  }

  get inBulletTime() {
    return this.targetScale < TIME.normal - 1e-3;
  }

  /* ---------------------------------------------------------------- *
   * Freeze frames
   * ---------------------------------------------------------------- */

  /**
   * Freeze the simulation for `duration` real seconds. Overlapping calls take
   * the longest remaining freeze rather than stacking, so a 6-body carom does
   * not lock the game up.
   */
  hitStop(duration = TIME.hitStop) {
    this.hitStopRemaining = Math.max(this.hitStopRemaining, duration);
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  get frozen() {
    return this.paused || this.hitStopRemaining > 0;
  }

  /* ---------------------------------------------------------------- *
   * Camera feel
   * ---------------------------------------------------------------- */

  /**
   * Add a shake impulse. Callers pass raw collision momentum; the mapping to
   * screen amplitude lives here so every impact speaks the same language.
   */
  shake(momentum) {
    if (this.reducedMotion) return;
    const impulse = Math.min(momentum * FEEL.shake.scale, FEEL.shake.max);
    this.shakeAmplitude = Math.min(this.shakeAmplitude + impulse, FEEL.shake.max);
  }

  /** Momentary ortho-zoom compression, released over ~170 ms. */
  zoomPunch(amount = FEEL.zoomPunch) {
    if (this.reducedMotion) return;
    this.zoom = Math.min(this.zoom + amount, 1 + FEEL.zoomPunch * 3);
  }

  _updateFeel(rawDt) {
    // Shake decays exponentially and is applied as a pure positional offset —
    // rotating the camera would break the player's read on aim angles.
    let offsetX = 0;
    let offsetZ = 0;
    if (this.shakeAmplitude > 0.0005) {
      this.shakePhase += rawDt * FEEL.shake.frequency;
      this.shakeAmplitude *= Math.exp(-FEEL.shake.decay * rawDt);
      const a = this.shakeAmplitude;
      offsetX = Math.sin(this.shakePhase * 1.0) * a;
      offsetZ = Math.cos(this.shakePhase * 1.37 + 1.1) * a;
    } else {
      this.shakeAmplitude = 0;
    }
    this.camera.position.set(
      this.basePosition.x + offsetX,
      this.basePosition.y,
      this.basePosition.z + offsetZ
    );

    if (Math.abs(this.zoom - 1) > 0.0004) {
      this.zoom += (1 - this.zoom) * (1 - Math.exp(-FEEL.zoomDecay * rawDt));
    } else {
      this.zoom = 1;
    }
    if (Math.abs(this.zoom - this._lastAppliedZoom) > 0.0002) {
      this.camera.zoom = this.zoom;
      this.camera.updateProjectionMatrix();
      this._lastAppliedZoom = this.zoom;
    }
  }

  /* ---------------------------------------------------------------- *
   * Frame tick
   * ---------------------------------------------------------------- */

  /**
   * @param {number} rawDtSeconds unclamped wall-clock delta
   * @returns {{ dt: number, rawDt: number, frozen: boolean }}
   */
  update(rawDtSeconds) {
    const rawDt = Math.min(Math.max(rawDtSeconds, 0), TIME.maxFrameDt);
    this.realElapsed += rawDt;

    // Camera feel runs on real time so a hit-stop still shakes — that contrast
    // between a frozen world and a moving camera is most of the punch.
    this._updateFeel(rawDt);

    if (this.paused) {
      return { dt: 0, rawDt, frozen: true };
    }

    if (this.hitStopRemaining > 0) {
      this.hitStopRemaining -= rawDt;
      return { dt: 0, rawDt, frozen: true };
    }

    // Asymmetric blend: snap into slow-mo, ease back out like a released spring.
    if (this.timeScale !== this.targetScale) {
      const tau = this.targetScale < this.timeScale ? TIME.dilateIn : TIME.dilateOut;
      const k = 1 - Math.exp(-rawDt / Math.max(tau, 1e-4));
      this.timeScale += (this.targetScale - this.timeScale) * k;
      if (Math.abs(this.timeScale - this.targetScale) < 0.003) {
        this.timeScale = this.targetScale;
      }
    }

    const dt = rawDt * this.timeScale;
    this.elapsed += dt;
    return { dt, rawDt, frozen: false };
  }
}

export default Engine;
