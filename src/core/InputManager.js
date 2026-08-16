/**
 * InputManager.js — one-thumb pointer state machine.
 *
 *   IDLE ──pointerdown──► AIMING ──pointerup──► RELEASE (launch)
 *     ▲                                              │
 *     └──────────────────────────────────────────────┘
 *
 * A COMPASS NEEDLE: ACQUIRED CONTEXTUALLY, THEN STEERED.
 *
 * The aim persists between shots — 12 o'clock on the first, and afterwards
 * whichever way the ball was last travelling. Touching refines that heading
 * rather than replacing it:
 *
 *   Touch IN FRONT of the heading  → the line snaps to run ball → thumb.
 *   Touch BEHIND the heading       → the line keeps pointing forward, away
 *                                    from the thumb.
 *
 * The second case is the reason this exists. Aiming purely by pointing put the
 * thumb directly on the forward path, covering the stretch of table the player
 * was trying to read — unusable on a phone. Touching behind the ball now means
 * "hold it from here and keep looking ahead", and the whole shot stays visible.
 *
 * From there, steering is one-dimensional and identical in both cases: thumb
 * right rotates the needle clockwise, thumb left counter-clockwise. Because
 * rotation is *travel*, not position, gain is uniform everywhere on screen and
 * the thumb never has to be anywhere in particular. Vertical travel is free,
 * which is what lets power be a hold rather than a pull.
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

    /**
     * The persistent heading. Starts at 12 o'clock (screen-up is -Z) and is
     * re-seeded to the ball's travel direction whenever a launch settles, so
     * the needle always begins where the last shot left you looking.
     */
    this._dirX = 0;
    this._dirZ = -1;
    /** Un-smoothed steering target; _dir eases toward it. */
    this._targetX = 0;
    this._targetZ = -1;
    this._lastAimTime = 0;
    this._hasHeading = true;
    /** Last x used for rotation, so steering measures travel, not position. */
    this._lastRotX = 0;

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

  /** Seed the persistent heading (the game calls this when the ball settles). */
  setHeading(x, z) {
    const len = Math.hypot(x, z);
    if (len < 1e-6) return;
    this._dirX = x / len;
    this._dirZ = z / len;
  }

  get heading() {
    return { x: this._dirX, z: this._dirZ };
  }

  /**
   * Acquire a bearing from where the thumb landed.
   *
   * Screen-right is +X and screen-down is +Z, so "in front" is simply a
   * positive dot product against the heading the needle already carries.
   */
  _acquire() {
    const ball = this._anchor();
    const finger = this.screenToWorld(this.currentX, this.currentY, this._world);
    const vx = finger.x - ball.x;
    const vz = finger.z - ball.z;
    const dist = Math.hypot(vx, vz);
    // Too close to the ball to mean anything: keep the needle where it is.
    if (dist < INPUT.minAimRadius) return;

    const dot = (vx / dist) * this._dirX + (vz / dist) * this._dirZ;
    if (dot > INPUT.frontDot) {
      // In front: the line runs from the ball out to the thumb.
      this._dirX = vx / dist;
      this._dirZ = vz / dist;
    }
    // Behind: the needle is left alone, so the line keeps pointing forward and
    // away from the thumb. This is what keeps the forward path unobscured —
    // hold the ball from below and the whole shot stays visible.
  }

  /**
   * Recompute the aim.
   * @param {number} now performance.now() timestamp
   */
  _updateAim(now) {
    const aim = this.aim;
    const dt = Math.max(0, (now - this._lastAimTime) / 1000);

    // --- steering: horizontal thumb travel rotates the needle -----------
    // Screen-up is -Z and screen-right is +X, so the on-screen angle
    // atan2(z, x) *increases* clockwise. Rightward travel therefore adds.
    const dxPx = this.currentX - this._lastRotX;
    this._lastRotX = this.currentX;
    if (dxPx !== 0) {
      const theta = dxPx * INPUT.rotateGainPerPx;
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      const nx = this._dirX * c - this._dirZ * s;
      const nz = this._dirX * s + this._dirZ * c;
      this._targetX = nx;
      this._targetZ = nz;
    }

    // Ease toward the target so tremor never reaches the drawn line.
    const alpha = 1 - Math.exp(-dt / INPUT.aimSmoothing);
    this._dirX += (this._targetX - this._dirX) * alpha;
    this._dirZ += (this._targetZ - this._dirZ) * alpha;
    const len = Math.hypot(this._dirX, this._dirZ) || 1;
    this._dirX /= len;
    this._dirZ /= len;

    this._lastAimTime = now;

    // --- power: hold to charge -----------------------------------------
    const hold = (now - this.startTime) / 1000;
    const t = Math.min(hold / PLAYER.chargeTime, 1);
    aim.power = PLAYER.minPower + (1 - PLAYER.minPower) * t;
    aim.charge = t;

    aim.hold = hold;
    aim.distPx = Math.hypot(this.currentX - this.startX, this.currentY - this.startY);
    aim.dirX = this._dirX;
    aim.dirZ = this._dirZ;
    aim.pullLength = 0;
    aim.pullX = 0;
    aim.pullZ = 0;
    aim.valid = true;

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

    // Acquire from the touch, then steer from there.
    this._lastRotX = event.clientX;
    this._lastAimTime = this.startTime;
    this._acquire();
    this._targetX = this._dirX;
    this._targetZ = this._dirZ;
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
