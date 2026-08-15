/**
 * InputManager.js — one-thumb pointer state machine.
 *
 *   IDLE ──pointerdown──► PRESSED ──drag past dead-zone──► AIMING
 *     ▲                      │                                │
 *     │                 quick release (<150 ms, >26 px) ──► FLICK (dash)
 *     │                      │                                │
 *     └──────── pointerup / cancel ◄───────────────── RELEASE (launch)
 *
 * The manager knows nothing about the player. It converts pointer pixels into a
 * normalised pull (direction + power) and emits callbacks; the game decides what
 * that means. Pull distance is normalised against the live stage height so the
 * slingshot feels identical on a phone and on a desktop letterbox.
 */

import { INPUT, PLAYER, ARENA, RENDER } from '../config.js';

const STATE = {
  IDLE: 'idle',
  PRESSED: 'pressed',
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
   * @param {(aim: object) => void} [handlers.onFlick]
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

    /** Latest computed aim payload (also handed to callbacks). */
    this.aim = this._makeAim();

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
      dirZ: 0,
      /** Pull vector in world units (opposite the launch direction). */
      pullX: 0,
      pullZ: 0,
      /** 0..1 power ramp after the response curve. */
      power: 0,
      /** Raw drag distance in CSS pixels. */
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

  /** Pixels of drag that correspond to maximum pull, scaled to this screen. */
  get pixelsForMaxPull() {
    const h = this.element.clientHeight || INPUT.referenceStageHeight;
    return INPUT.pullPixelsAtReferenceHeight * (h / INPUT.referenceStageHeight);
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

  _updateAim(now) {
    const dx = this.currentX - this.startX;
    const dy = this.currentY - this.startY;
    const distPx = Math.hypot(dx, dy);
    const aim = this.aim;
    aim.distPx = distPx;
    aim.hold = (now - this.startTime) / 1000;

    if (distPx < 0.0001) {
      aim.valid = false;
      aim.power = 0;
      aim.dirX = 0;
      aim.dirZ = 0;
      aim.pullX = 0;
      aim.pullZ = 0;
    } else {
      const invLen = 1 / distPx;
      // Drag direction in world space (screen-right = +X, screen-down = +Z).
      const dragX = dx * invLen;
      const dragZ = dy * invLen;
      const sign = INPUT.invertAim ? -1 : 1;
      aim.dirX = dragX * sign;
      aim.dirZ = dragZ * sign;

      const raw = Math.min(distPx / this.pixelsForMaxPull, 1);
      aim.power = Math.pow(raw, PLAYER.pullCurve);
      const pullLength = raw * PLAYER.maxPull;
      aim.pullX = dragX * pullLength;
      aim.pullZ = dragZ * pullLength;
      aim.valid = distPx >= INPUT.deadZonePx;
    }

    const world = this.screenToWorld(this.currentX, this.currentY);
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
    this.state = STATE.PRESSED;
    this._updateAim(this.startTime);

    this.handlers.onAimStart?.(this.aim);
  }

  _handleMove(event) {
    if (event.pointerId !== this.pointerId) return;
    event.preventDefault();
    this.currentX = event.clientX;
    this.currentY = event.clientY;
    const aim = this._updateAim(performance.now());

    if (this.state === STATE.PRESSED && aim.distPx >= INPUT.deadZonePx) {
      this.state = STATE.AIMING;
    }
    if (this.state === STATE.AIMING || this.state === STATE.PRESSED) {
      this.handlers.onAimUpdate?.(aim);
    }
  }

  _handleUp(event) {
    if (event.pointerId !== this.pointerId) return;
    event.preventDefault();
    this.currentX = event.clientX;
    this.currentY = event.clientY;

    const now = performance.now();
    const aim = this._updateAim(now);
    const duration = (now - this.startTime) / 1000;
    this._release(event.pointerId);

    if (duration <= INPUT.flickMaxDuration && aim.distPx >= INPUT.flickMinDistancePx) {
      // Emergency dash: travels *with* the swipe, no slow-mo, no Focus cost.
      const flick = {
        ...aim,
        dirX: INPUT.invertAim ? -aim.dirX : aim.dirX,
        dirZ: INPUT.invertAim ? -aim.dirZ : aim.dirZ
      };
      this.handlers.onFlick?.(flick);
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
}

export { STATE as INPUT_STATE };
export default InputManager;
