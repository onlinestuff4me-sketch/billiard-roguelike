/**
 * InputManager.js — one-thumb pointer state machine.
 *
 *   IDLE ──pointerdown──► AIMING ──pointerup──► RELEASE (launch)
 *     ▲                                              │
 *     └──────────────────────────────────────────────┘
 *
 * THE AIM IS A VIRTUAL CURSOR: YOU POINT AT THINGS.
 *
 * Touch anywhere and the ball aims *at* your finger. Drag and the heading
 * follows. That is the entire control.
 *
 * Two earlier schemes were tried and both asked too much of the player. Pulling
 * back like a slingshot inverted the gesture — you aimed away from your target
 * — and bundled a power axis into the same drag, so every stroke answered two
 * questions when only one of them was ever interesting. A relative stick fixed
 * the inversion but made placement meaningless, which is its own kind of
 * confusion: tapping directly at a target did nothing.
 *
 * Pointing has neither problem. There is no behind-the-ball or in-front-of-the-
 * ball case to disambiguate, because "toward my finger" is the same rule from
 * every side; the 180° flip that made the old absolute scheme unpredictable
 * only existed because the aim ran *away* from the touch.
 *
 * Sensitivity is handled by INPUT.minAimRadius. Angular gain is 1/distance, so
 * a cursor allowed right against the ball would swing the aim through tens of
 * degrees per pixel. Holding the cursor out to a minimum radius caps that
 * without changing the heading the player asked for, and a short exponential
 * filter takes out the remaining tremor.
 *
 * The manager knows nothing about the player beyond an anchor position; it
 * emits normalised aim payloads and the game decides what they mean.
 */

import { INPUT, PLAYER, ARENA, RENDER } from '../config.js';

const STATE = {
  IDLE: 'idle',
  AIMING: 'aiming'
};

export class InputManager {
  /**
   * @param {HTMLElement} element the stage element that receives pointer events
   * @param {object} handlers
   * @param {() => {x:number,z:number}} handlers.getAnchor ball position to aim from
   * @param {() => void} [handlers.onAimStart]
   * @param {(aim: object) => void} [handlers.onAimUpdate]
   * @param {() => void} [handlers.onAimCancel]
   * @param {(aim: object) => void} [handlers.onRelease]
   * @param {(aim: object) => void} [handlers.onFlick] double-tap dash
   * @param {() => boolean} [handlers.isEnabled]
   * @param {import('three').OrthographicCamera} [handlers.camera]
   */
  constructor(element, handlers = {}) {
    this.element = element;
    this.handlers = handlers;
    this.camera = handlers.camera || null;

    this.state = STATE.IDLE;
    this.pointerId = null;
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.startTime = 0;
    this.holdTime = 0;

    /** Smoothed heading, kept between frames so tremor cannot reach the aim. */
    this._dirX = 0;
    this._dirZ = -1;
    this._lastAimTime = 0;
    this._hasHeading = false;

    /** Floating stick origin, in client pixels. Trails the finger past R. */
    this._anchorX = 0;
    this._anchorY = 0;

    /** Double-tap bookkeeping. */
    this._lastTapTime = -Infinity;
    this._lastTapX = 0;
    this._lastTapY = 0;

    this.aim = this._makeAim();
    this._world = { x: 0, z: 0 };

    this._onDown = this._handleDown.bind(this);
    this._onMove = this._handleMove.bind(this);
    this._onUp = this._handleUp.bind(this);
    this._onCancel = this._handleCancel.bind(this);
    this._onContext = (e) => e.preventDefault();

    element.addEventListener('pointerdown', this._onDown, { passive: false });
    element.addEventListener('pointermove', this._onMove, { passive: false });
    element.addEventListener('pointerup', this._onUp, { passive: false });
    element.addEventListener('pointercancel', this._onCancel, { passive: false });
    element.addEventListener('lostpointercapture', this._onCancel, { passive: false });
    element.addEventListener('contextmenu', this._onContext);
    // Belt and braces for older mobile browsers that still scroll on touchmove.
    element.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  }

  dispose() {
    const el = this.element;
    el.removeEventListener('pointerdown', this._onDown);
    el.removeEventListener('pointermove', this._onMove);
    el.removeEventListener('pointerup', this._onUp);
    el.removeEventListener('pointercancel', this._onCancel);
    el.removeEventListener('lostpointercapture', this._onCancel);
    el.removeEventListener('contextmenu', this._onContext);
  }

  /* ---------------------------------------------------------------- *
   * Helpers
   * ---------------------------------------------------------------- */

  _makeAim() {
    return {
      /** Launch direction (unit, world XZ). */
      dirX: 0,
      dirZ: -1,
      /** Pull vector in world units, pointing along the launch direction. */
      pullX: 0,
      pullZ: 0,
      /** 0..1 power ramp after the response curve. */
      power: 0,
      /** Distance from the anchor to the finger, in world units. */
      pullLength: 0,
      /** Raw travel from the touch-down point, in CSS pixels (tap detection). */
      distPx: 0,
      /** Pointer position projected onto the table. */
      worldX: 0,
      worldZ: 0,
      /** Seconds the pointer has been held. */
      hold: 0,
      valid: false
    };
  }

  get enabled() {
    return this.handlers.isEnabled ? this.handlers.isEnabled() : true;
  }

  get isAiming() {
    return this.state === STATE.AIMING;
  }

  /** Project a client-space point onto the table plane (world XZ). */
  screenToWorld(clientX, clientY, out = { x: 0, z: 0 }) {
    const rect = this.element.getBoundingClientRect();
    const nx = rect.width > 0 ? ((clientX - rect.left) / rect.width) * 2 - 1 : 0;
    const ny = rect.height > 0 ? ((clientY - rect.top) / rect.height) * 2 - 1 : 0;
    const zoom = this.camera ? this.camera.zoom || 1 : 1;
    const viewHeight = RENDER.viewHeight / zoom;
    const viewWidth = viewHeight * ARENA.aspect;
    // Screen-down maps to +Z because the camera's up vector is (0, 0, -1).
    out.x = nx * (viewWidth / 2);
    out.z = ny * (viewHeight / 2);
    return out;
  }

  /** Anchor the aim rotates about — the cue ball. */
  _anchor() {
    return this.handlers.getAnchor?.() || { x: 0, z: 0 };
  }

  /**
   * Recompute the aim from the virtual cursor.
   * @param {number} now performance.now() timestamp
   */
  _updateAim(now) {
    const aim = this.aim;
    const ball = this._anchor();
    const finger = this.screenToWorld(this.currentX, this.currentY, this._world);

    aim.hold = (now - this.startTime) / 1000;
    aim.distPx = Math.hypot(this.currentX - this.startX, this.currentY - this.startY);

    // The cursor is simply where your finger is, and the ball points AT it.
    let cx = finger.x - ball.x;
    let cz = finger.z - ball.z;
    let dist = Math.hypot(cx, cz);

    if (dist > 1e-4) {
      // Hold the cursor out to a minimum radius. Gain is 1/distance, so a
      // cursor allowed right up against the ball would swing the aim through
      // tens of degrees for a pixel of movement — the old twitchiness. Pushing
      // it out preserves the heading you asked for and caps the sensitivity.
      if (dist < INPUT.minAimRadius) {
        const k = INPUT.minAimRadius / dist;
        cx *= k;
        cz *= k;
        dist = INPUT.minAimRadius;
      }

      const inv = 1 / dist;
      const sign = INPUT.invertAim ? -1 : 1;
      const targetX = cx * inv * sign;
      const targetZ = cz * inv * sign;

      if (!this._hasHeading) {
        this._dirX = targetX;
        this._dirZ = targetZ;
        this._hasHeading = true;
      } else {
        // Blend the unit vectors rather than the angles: no wraparound seam.
        const dt = Math.max(0, (now - this._lastAimTime) / 1000);
        const alpha = 1 - Math.exp(-dt / INPUT.aimSmoothing);
        this._dirX += (targetX - this._dirX) * alpha;
        this._dirZ += (targetZ - this._dirZ) * alpha;
        const len = Math.hypot(this._dirX, this._dirZ);
        if (len > 1e-6) {
          this._dirX /= len;
          this._dirZ /= len;
        } else {
          this._dirX = targetX;
          this._dirZ = targetZ;
        }
      }
    }
    // A finger exactly on the ball gives no direction at all, so the last good
    // heading is held rather than allowed to spin.

    this._lastAimTime = now;
    aim.dirX = this._dirX;
    aim.dirZ = this._dirZ;
    aim.pullLength = dist;

    // No power: every launch is the same speed, so the gesture means one thing.
    aim.power = 1;
    aim.valid = true;
    aim.pullX = 0;
    aim.pullZ = 0;
    aim.worldX = finger.x;
    aim.worldZ = finger.z;

    return aim;
  }

  /* ---------------------------------------------------------------- *
   * Pointer events
   * ---------------------------------------------------------------- */

  _handleDown(event) {
    if (this.pointerId !== null) return; // ignore additional fingers
    if (!this.enabled) return;
    event.preventDefault();

    this.pointerId = event.pointerId;
    if (this.element.setPointerCapture) {
      try {
        this.element.setPointerCapture(event.pointerId);
      } catch {
        /* Safari can throw on synthetic pointers; capture is an optimisation. */
      }
    }

    this.startX = this.currentX = event.clientX;
    this.startY = this.currentY = event.clientY;
    this.startTime = performance.now();
    this.holdTime = 0;
    this.state = STATE.AIMING;

    // Snap to the touch: wherever you put your finger is immediately where the
    // ball is pointing, with no swing in from the previous shot's heading.
    this._hasHeading = false;
    this._lastAimTime = this.startTime;
    this._updateAim(this.startTime);

    this.handlers.onAimStart?.(this.aim);
    this.handlers.onAimUpdate?.(this.aim);
  }

  _handleMove(event) {
    if (event.pointerId !== this.pointerId) return;
    event.preventDefault();
    this.currentX = event.clientX;
    this.currentY = event.clientY;
    const aim = this._updateAim(performance.now());
    if (this.state === STATE.AIMING) this.handlers.onAimUpdate?.(aim);
  }

  _handleUp(event) {
    if (event.pointerId !== this.pointerId) return;
    event.preventDefault();
    this.currentX = event.clientX;
    this.currentY = event.clientY;

    const now = performance.now();
    const aim = this._updateAim(now);
    this._release(event.pointerId);

    // Every release fires, tap or drag alike. A tap that silently did nothing
    // was the single most confusing thing about the old control: it looked
    // identical to a shot that had simply failed. One gesture, one outcome.
    if (aim.valid) this.handlers.onRelease?.(aim);
    else this.handlers.onAimCancel?.();
  }

  _handleCancel(event) {
    if (event.pointerId !== this.pointerId) return;
    this._release(event.pointerId);
    this.handlers.onAimCancel?.();
  }

  _release(pointerId) {
    if (this.element.releasePointerCapture && this.element.hasPointerCapture?.(pointerId)) {
      try {
        this.element.releasePointerCapture(pointerId);
      } catch {
        /* no-op */
      }
    }
    this.pointerId = null;
    this.state = STATE.IDLE;
    this.holdTime = 0;
  }

  /** Force-cancel any in-flight aim (used when a modal opens or the run ends). */
  cancel() {
    if (this.pointerId === null && this.state === STATE.IDLE) return;
    if (this.pointerId !== null) this._release(this.pointerId);
    this.state = STATE.IDLE;
    this.handlers.onAimCancel?.();
  }

  /** Called once per frame with the real delta; keeps hold time authoritative. */
  update(rawDt) {
    if (this.state !== STATE.IDLE) {
      this.holdTime += rawDt;
      this.aim.hold = this.holdTime;
    }
  }

  /**
   * Re-derive the aim against the anchor's *current* position.
   *
   * The ball can move under a held thumb — it is still rolling, or a rebound
   * carried it — so a stationary finger would otherwise keep aiming at where
   * the ball used to be. The game calls this after the simulation step so the
   * preview is drawn from the position the ball actually ended the frame at.
   *
   * @returns {object|null} the refreshed aim, or null when not aiming
   */
  refresh() {
    if (this.state === STATE.IDLE || this.pointerId === null) return null;
    const aim = this._updateAim(performance.now());
    aim.hold = this.holdTime;
    return aim;
  }
}

export { STATE as INPUT_STATE };
export default InputManager;
