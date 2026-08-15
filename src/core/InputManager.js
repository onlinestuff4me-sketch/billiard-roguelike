/**
 * InputManager.js — one-thumb pointer state machine.
 *
 *   IDLE ──pointerdown──► AIMING ──pointerup, pull >= minPull──► RELEASE (launch)
 *     ▲                     │                                       │
 *     │                     └── pointerup, pull < minPull ──► CANCEL │
 *     │                                                             │
 *     └──────────── double tap (two taps < 260 ms) ──► DASH ◄────────┘
 *
 * AIMING IS ANCHORED AT THE BALL.
 *
 * The launch direction is the vector from your finger to the cue ball, not the
 * delta from wherever you first touched down. This is the model 8 Ball Pool
 * uses — the cue rotates about the cue ball while you drag anywhere on the
 * table — and the reason is angular resolution, not fidelity.
 *
 * With a drag-delta anchor the lever arm *starts at zero*: the first pixels of
 * movement swing the heading through tens of degrees, so the aim can never
 * settle. Anchored at the ball, the lever arm is your distance from it. Moving
 * your finger one unit sideways at six units out turns the shot by ~9°; the
 * same motion at one unit out turns it by ~45°. Pulling further therefore buys
 * finer control precisely when a shot deserves it, and power (radial distance)
 * and heading (angle) become independent axes of one polar gesture instead of
 * fighting over the same pixels.
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
   * @param {() => {x:number,z:number}} handlers.getAnchor world position to aim about
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

  /** Anchor to rotate the aim about — the cue ball. */
  _anchor() {
    return this.handlers.getAnchor?.() || { x: 0, z: 0 };
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

  /**
   * Recompute the aim from the anchor and the live finger position.
   * @param {number} now performance.now() timestamp
   * @param {boolean} snap skip smoothing (used on touch-down)
   */
  _updateAim(now, snap = false) {
    const aim = this.aim;
    const anchor = this._anchor();
    const finger = this.screenToWorld(this.currentX, this.currentY, this._world);

    aim.worldX = finger.x;
    aim.worldZ = finger.z;
    aim.hold = (now - this.startTime) / 1000;
    aim.distPx = Math.hypot(this.currentX - this.startX, this.currentY - this.startY);

    // Vector from the finger to the ball IS the launch direction: pull back,
    // fire forward. Its length is the draw of the slingshot.
    const toBallX = anchor.x - finger.x;
    const toBallZ = anchor.z - finger.z;
    const pullLength = Math.hypot(toBallX, toBallZ);
    aim.pullLength = pullLength;

    if (pullLength > INPUT.aimDeadRadius) {
      const inv = 1 / pullLength;
      let targetX = toBallX * inv;
      let targetZ = toBallZ * inv;
      if (!INPUT.invertAim) {
        targetX = -targetX;
        targetZ = -targetZ;
      }

      if (snap || !this._hasHeading) {
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
    // Inside the dead radius the heading is degenerate, so the last good one is
    // held: the aim line parks instead of spinning under your thumb.

    this._lastAimTime = now;

    aim.dirX = this._dirX;
    aim.dirZ = this._dirZ;

    const clamped = Math.min(pullLength, PLAYER.maxPull);
    aim.pullX = this._dirX * clamped;
    aim.pullZ = this._dirZ * clamped;

    // Power ramps from zero at the minimum draw, so the shortest legal shot is
    // a genuine soft tap rather than a jump to some arbitrary floor.
    const span = Math.max(PLAYER.maxPull - PLAYER.minPull, 1e-4);
    const raw = Math.min(Math.max((clamped - PLAYER.minPull) / span, 0), 1);
    aim.power = Math.pow(raw, PLAYER.pullCurve);
    aim.valid = pullLength >= PLAYER.minPull;

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

    // Snap on touch-down: the aim should already point where you put your thumb,
    // with no visible swing in from the previous shot's heading.
    this._updateAim(this.startTime, true);

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
