/**
 * InputManager.js — one-thumb pointer state machine.
 *
 *   IDLE ──pointerdown──► AIMING ──pointerup, pull >= minPull──► RELEASE (launch)
 *     ▲                     │                                       │
 *     │                     └── pointerup, pull < minPull ──► CANCEL │
 *     │                                                             │
 *     └──────────── double tap (two taps < 260 ms) ──► DASH ◄────────┘
 *
 * AIMING IS A FLOATING STICK WITH A TRAILING ANCHOR.
 *
 * Frame-by-frame analysis of Endless Madness shows the pattern plainly: an
 * anchor marker appears wherever the thumb lands, a line is drawn from it to
 * the finger, and the aim follows *that displacement vector*. The ball's
 * position is not an input at all.
 *
 * That is what makes placement stop mattering. An absolute scheme — aim along
 * finger→ball — has to answer "what if the thumb is in front of the ball
 * instead of behind it?", and every answer is a rule the player has to learn,
 * with a 180° flip waiting at the boundary. A relative stick never asks the
 * question: touching down moves nothing, and only movement from your own
 * starting point steers. Behind, in front and on top of the ball all behave
 * identically.
 *
 * Two properties fall out of the geometry:
 *
 *   Gain is 1/R rad per pixel, fixed. An absolute anchor has a lever arm that
 *   collapses to zero as the thumb nears the ball, which is why small movements
 *   used to swing the aim wildly. Here R never changes, so sensitivity is the
 *   same everywhere on screen. Measured gain in Endless Madness was ~0.8°/px,
 *   implying a pivot near 18% of screen width; INPUT.stickRadiusFraction sets
 *   ours in the same range.
 *
 *   The anchor trails. Past R it is dragged along behind the finger, so the
 *   heading eases toward the direction you are *travelling* rather than
 *   snapping to where you are. That is a low-pass filter built out of geometry,
 *   before the explicit smoothing term is applied at all.
 *
 * The manager knows nothing about the player; it emits normalised aim payloads
 * and the game decides what they mean.
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

  /** Stick radius in CSS pixels, scaled to whatever stage this device gives us. */
  get stickRadiusPx() {
    const h = this.element.clientHeight || 900;
    return h * INPUT.stickRadiusFraction;
  }

  get stickDeadzonePx() {
    const h = this.element.clientHeight || 900;
    return h * INPUT.stickDeadzoneFraction;
  }

  /**
   * Recompute the aim from the floating stick.
   * @param {number} now performance.now() timestamp
   */
  _updateAim(now) {
    const aim = this.aim;
    const R = this.stickRadiusPx;
    const dz = this.stickDeadzonePx;

    let dx = this.currentX - this._anchorX;
    let dy = this.currentY - this._anchorY;
    let d = Math.hypot(dx, dy);

    // THE TRAILING ANCHOR.
    //
    // Push past the radius and the anchor is dragged along behind the finger,
    // never letting the stick exceed R. This is what makes a long gesture keep
    // working without ever letting the gain go coarse, and it is also a free
    // low-pass filter: the anchor only moves as much as it has to, so the
    // heading eases toward the direction you are travelling instead of
    // snapping to wherever your thumb happens to be.
    if (d > R && d > 1e-6) {
      const k = (d - R) / d;
      this._anchorX += dx * k;
      this._anchorY += dy * k;
      dx = this.currentX - this._anchorX;
      dy = this.currentY - this._anchorY;
      d = Math.hypot(dx, dy);
    }

    aim.hold = (now - this.startTime) / 1000;
    aim.distPx = Math.hypot(this.currentX - this.startX, this.currentY - this.startY);
    aim.pullLength = d;

    if (d > dz) {
      // Screen-right is +X and screen-down is +Z (the camera's up is (0,0,-1)).
      const inv = 1 / d;
      const sign = INPUT.invertAim ? -1 : 1;
      const targetX = dx * inv * sign;
      const targetZ = dy * inv * sign;

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
    // Inside the dead zone the direction is degenerate, so the last good
    // heading is held: the aim parks instead of spinning under your thumb.

    this._lastAimTime = now;

    aim.dirX = this._dirX;
    aim.dirZ = this._dirZ;

    // Power is the stick's deflection, so distance and direction stay the two
    // independent axes of one polar gesture.
    const raw = Math.min(Math.max((d - dz) / Math.max(R - dz, 1e-4), 0), 1);
    aim.power = Math.pow(raw, PLAYER.pullCurve);
    aim.valid = d >= dz;

    // The drawn band is the shot, not the gesture: it always reads in world
    // units along the launch heading regardless of where the thumb is.
    const pull = aim.power * PLAYER.maxPull;
    aim.pullX = this._dirX * pull;
    aim.pullZ = this._dirZ * pull;

    const world = this.screenToWorld(this.currentX, this.currentY, this._world);
    aim.worldX = world.x;
    aim.worldZ = world.z;

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

    // The stick is BORN WHERE YOU TOUCH, and the heading is deliberately left
    // alone. Touching down therefore cannot move the aim at all — which is the
    // whole reason placement stops mattering. There is no "behind the ball" or
    // "in front of the ball" case to disambiguate, because the ball is not part
    // of the calculation; only your own movement from your own starting point
    // is. Put your thumb wherever it is comfortable and drag.
    this._anchorX = event.clientX;
    this._anchorY = event.clientY;
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

    // --- tap / double tap ---------------------------------------------
    if (aim.distPx <= INPUT.tapMaxTravelPx) {
      const sinceLast = now - this._lastTapTime;
      const travel = Math.hypot(this.currentX - this._lastTapX, this.currentY - this._lastTapY);
      if (sinceLast <= INPUT.doubleTapMs && travel <= INPUT.doubleTapMaxTravelPx) {
        this._lastTapTime = -Infinity;
        // Dash travels *toward* the tapped point, which is the direction the
        // player is already looking at — the opposite of the slingshot.
        this.handlers.onFlick?.({
          ...aim,
          dirX: -aim.dirX,
          dirZ: -aim.dirZ
        });
        return;
      }
      this._lastTapTime = now;
      this._lastTapX = this.currentX;
      this._lastTapY = this.currentY;
      this.handlers.onAimCancel?.();
      return;
    }

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
