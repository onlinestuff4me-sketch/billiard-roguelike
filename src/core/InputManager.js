/**
 * InputManager.js — one-thumb pointer state machine.
 *
 *   IDLE ──pointerdown──► AIMING ──pointerup──► RELEASE (launch)
 *     ▲                                              │
 *     └──────────────────────────────────────────────┘
 *
 * YOUR THUMB IS THE BUTT OF A CUE THAT RUNS THROUGH THE BALL.
 *
 * Time freezes on touch and the line is drawn from the thumb, through the ball,
 * and out the far side. The shot direction is simply `ball - thumb`. Put the
 * thumb below the ball and the shot goes up; slide it right and the far end
 * swings left, exactly as a real cue does when the butt is moved.
 *
 * Drawing back *along that axis* loads the shot: the distance from thumb to
 * ball is the draw, and the draw is the power. Pulling straight away therefore
 * adds power without touching the angle, which is the motion a player already
 * makes at a table.
 *
 * The metaphor solves the occlusion problem for free, which is what defeated
 * every earlier scheme. The cue is always behind the ball relative to the shot,
 * so the thumb is never on the stretch of table the shot will cross — the
 * player is looking down the cue at their own target.
 *
 * Sensitivity is bounded the way a real cue bounds it: angular gain is 1/draw,
 * and a committed shot is drawn well back, so the lever arm is longest exactly
 * when accuracy matters most. A short exponential filter removes tremor.
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

    /** Last tap, for double-tap dash detection. */
    this._lastTapTime = -Infinity;
    this._lastTapX = 0;
    this._lastTapY = 0;

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
    /** Thumb bearing around the ball last frame; steering applies the delta. */
    this._lastBearing = null;

    /** Double-tap bookkeeping. */
    this._lastTapTime = -Infinity;
    this._lastTapX = 0;
    this._lastTapY = 0;

    this.aim = this._makeAim();
    this._world = { x: 0, z: 0 };
    /** Where the floating pad is seated for this gesture, in world units. */
    this._pad = null;

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
   * The point the cue pivots about, in world units.
   *
   * On a floating pad that is wherever the thumb went down (see INPUT.floatingPad);
   * otherwise it is the ball itself, which is the older ball-anchored scheme.
   */
  _pivot() {
    if (INPUT.floatingPad && this._pad) return this._pad;
    return this._anchor();
  }

  /**
   * SEAT THE PAD SO THE HEADING SURVIVES THE FIRST NUDGE.
   *
   * A pad centred exactly on the touch point has no direction at zero draw, so
   * the aim can only snap somewhere the moment the thumb leaves the dead zone —
   * and on a table where a pot is worth one to three degrees, a snap is the
   * difference between adjusting a shot and starting again.
   *
   * The fix costs nothing: on the frame the drag first clears the dead zone,
   * put the pad where the CURRENT heading and the CURRENT thumb position agree,
   * which is thumb + heading x draw. The aim does not move at all, and from
   * there the pad is absolute — point it and the cue points with it. The pad
   * ends up at most a dead zone away from where the thumb landed.
   */
  _seatPad(clientX, clientY, dist) {
    // Screen space: the pad is a control, sized in thumb-reach.
    this._pad = {
      x: clientX + this._dirX * dist,
      y: clientY + this._dirZ * dist
    };
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

  /** The cue: thumb position, and the shot vector running through the pivot. */
  _cue() {
    const finger = this.screenToWorld(this.currentX, this.currentY, this._world);

    if (INPUT.floatingPad) {
      // Before the pad is seated the travel is measured from the touch point,
      // so the dead zone means what it says; the heading is held meanwhile.
      if (!this._pad) {
        const raw = Math.hypot(this.startX - this.currentX, this.startY - this.currentY);
        if (raw <= INPUT.padDeadZonePx) {
          return { finger, draw: 0, ratio: 0, vx: 0, vz: 0, seated: false };
        }
        this._seatPad(this.currentX, this.currentY, raw);
      }
      const pad = this._pad;
      // Screen +x is world +x; screen +y is world +z (the camera's up is -Z).
      const vx = pad.x - this.currentX;
      const vz = pad.y - this.currentY;
      const px = Math.hypot(vx, vz);
      const ratio = Math.min(px / INPUT.padRadiusPx, 1);
      // Report the draw in world units anyway, so the cue shaft behind the ball
      // is the same length it would have been under the ball-anchored scheme.
      const draw = INPUT.minDraw + (INPUT.maxDraw - INPUT.minDraw) * ratio;
      return { finger, draw, ratio, vx, vz, seated: true, pad, px };
    }

    const ball = this._anchor();
    // Thumb → ball, continued out the far side. This IS the shot direction.
    const vx = ball.x - finger.x;
    const vz = ball.z - finger.z;
    return { finger, draw: Math.hypot(vx, vz), vx, vz, seated: true };
  }

  /**
   * Recompute the aim.
   * @param {number} now performance.now() timestamp
   */
  _updateAim(now) {
    const aim = this.aim;
    const dt = Math.max(0, (now - this._lastAimTime) / 1000);

    // --- the cue line: thumb → through the ball → outward -----------------
    // The shot direction is just `ball − thumb`, so sliding the butt right
    // swings the far end left, the way a real cue does. Nothing is
    // accumulated: the line is wherever the cue currently points, which is
    // what makes re-aiming feel like picking the stick up and putting it down.
    const cue = this._cue();
    if (cue.draw > INPUT.minAimRadius) {
      const inv = 1 / cue.draw;
      this._targetX = cue.vx * inv;
      this._targetZ = cue.vz * inv;
    }
    // Thumb effectively on top of the ball: no axis to speak of, so the last
    // good heading is held rather than allowed to spin.

    // Ease toward the target so tremor never reaches the drawn line.
    const alpha = 1 - Math.exp(-dt / INPUT.aimSmoothing);
    this._dirX += (this._targetX - this._dirX) * alpha;
    this._dirZ += (this._targetZ - this._dirZ) * alpha;
    const len = Math.hypot(this._dirX, this._dirZ) || 1;
    this._dirX /= len;
    this._dirZ /= len;

    this._lastAimTime = now;

    // --- power: the draw -------------------------------------------------
    // How far the cue is pulled back along its own axis. Drawing straight away
    // from the ball loads the shot without touching the angle at all, which is
    // exactly the motion a player already makes at a real table.
    const span = Math.max(INPUT.maxDraw - INPUT.minDraw, 1e-4);
    const t =
      cue.ratio !== undefined
        ? cue.ratio
        : Math.min(Math.max((cue.draw - INPUT.minDraw) / span, 0), 1);
    aim.power = PLAYER.minPower + (1 - PLAYER.minPower) * t;
    aim.charge = t;

    aim.hold = (now - this.startTime) / 1000;
    aim.distPx = Math.hypot(this.currentX - this.startX, this.currentY - this.startY);
    aim.dirX = this._dirX;
    aim.dirZ = this._dirZ;
    aim.pullLength = cue.draw;
    // Where the butt of the cue sits, so the shaft can be drawn behind the ball.
    // On a floating pad the thumb is somewhere else entirely, so the shaft is
    // placed by the shot instead: back down the line from the ball, by the draw.
    if (INPUT.floatingPad) {
      const ball = this._anchor();
      aim.cueX = ball.x - this._dirX * cue.draw;
      aim.cueZ = ball.z - this._dirZ * cue.draw;
    } else {
      aim.cueX = cue.finger.x;
      aim.cueZ = cue.finger.z;
    }
    // The pad's own geometry, in CLIENT pixels — it is a control, not a thing
    // on the table, so it never goes through the camera.
    aim.pad = cue.pad
      ? {
          x: cue.pad.x,
          y: cue.pad.y,
          knobX: this.currentX,
          knobY: this.currentY,
          radius: INPUT.padRadiusPx,
          power: cue.ratio ?? 0
        }
      : null;
    aim.pullX = 0;
    aim.pullZ = 0;
    aim.valid = true;
    aim.worldX = cue.finger.x;
    aim.worldZ = cue.finger.z;
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

    // A fresh gesture gets a fresh pad. It is seated on the first movement out
    // of the dead zone, not here, so that touching down never moves the aim.
    this._pad = null;

    // Placing the cue defines the line at once — no easing in from the last
    // shot's heading, because you are putting a stick down, not nudging one.
    this._lastAimTime = this.startTime;
    const cue = this._cue();
    if (cue.seated && cue.draw > INPUT.minAimRadius) {
      const inv = 1 / cue.draw;
      this._dirX = this._targetX = cue.vx * inv;
      this._dirZ = this._targetZ = cue.vz * inv;
    } else {
      this._targetX = this._dirX;
      this._targetZ = this._dirZ;
    }
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

    // THE DASH. A second tap in the same spot, inside doubleTapMs, is the
    // emergency reposition. It was configured but never wired: nothing here
    // measured travel or tap spacing, so onFlick could not fire and the dash
    // was unreachable from the game.
    //
    // The dash consumes only the SECOND tap. The first still fires, because a
    // gesture that silently does nothing is the single most confusing thing a
    // control can do — it looks identical to a shot that failed.
    const travel = Math.hypot(this.currentX - this.startX, this.currentY - this.startY);
    const isTap = travel <= INPUT.tapMaxTravelPx;

    if (isTap) {
      const gap = now - this._lastTapTime;
      const drift = Math.hypot(this.currentX - this._lastTapX, this.currentY - this._lastTapY);
      if (gap <= INPUT.doubleTapMs && drift <= INPUT.doubleTapMaxTravelPx) {
        // Consumed, so a triple tap is one dash and not two.
        this._lastTapTime = -Infinity;
        this.handlers.onFlick?.(aim);
        return;
      }
      this._lastTapTime = now;
      this._lastTapX = this.currentX;
      this._lastTapY = this.currentY;
    } else {
      this._lastTapTime = -Infinity;
    }

    // Every release fires, tap or drag alike.
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
    this._pad = null;
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
