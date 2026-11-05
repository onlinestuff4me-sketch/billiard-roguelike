/**
 * ShotTray.js — what a shot can carry (juice batch 2, on trial).
 *
 * A small tray in the bottom band, between Shots and Freeze frame, shown only
 * for what the run owns and only while aiming (the points boxes take that spot
 * once the balls roll):
 *
 *   SPIN    a cue-ball face; tap or drag the dot to set follow (top), draw
 *           (bottom) and side spin (left, right). Resets after each shot.
 *   CURVE   arms a Curve Shot for this shot (charges per table). Aim and let
 *           go as usual: the shot then HOLDS (review round 3: "I need to see
 *           it in real time") and the bend bar takes the bottom band; drag it
 *           and the aim line bends live, then Shoot (or ✕ to aim again).
 *   BOMB    arms a Bomb Shot (charges per table): the first ball hit blows up.
 *
 * The tray only sets `game.shot`; the physics and the aim preview read it
 * (src/config.js SHOT). Its taps never start an aim.
 */

const el = (tag, cls, parent) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (parent) parent.appendChild(n);
  return n;
};

const ICON = {
  curve: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19c0-8 6-13 14-13" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M15 3l4 3-4 3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  bomb: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="14" r="7" fill="currentColor"/><path d="M15 8l3-3M18 5l1.5-1.5M19 7.5l2-.5M16.5 3l.5-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
};

export class ShotTray {
  /** @param {HTMLElement} layer  @param {object} game  @param {() => void} onChange */
  constructor(layer, game, onChange) {
    this.game = game;
    this.onChange = onChange;
    this.root = el('div', 'shot-tray', layer);
    const stop = (e) => e.stopPropagation();
    this.root.addEventListener('pointerdown', stop);
    this.row = el('div', 'st-row', this.root);

    // SPIN: the cue ball's face, and the dot where the cue meets it
    this.spin = el('div', 'st-spin', this.row);
    this.spin.setAttribute('role', 'slider');
    this.spin.setAttribute('aria-label', 'Spin');
    el('i', 'st-cross', this.spin);
    this.dot = el('b', 'st-dot', this.spin);
    el('small', 'st-label', this.spin).textContent = 'Spin';
    const setSpin = (e) => {
      const r = this.spin.getBoundingClientRect();
      let x = ((e.clientX - r.left) / r.width) * 2 - 1;
      let y = ((e.clientY - r.top) / r.height) * 2 - 1;
      const d = Math.hypot(x, y);
      if (d > 0.8) {
        x *= 0.8 / d;
        y *= 0.8 / d;
      }
      // snap to the middle when close, so "no spin" is easy to find
      if (Math.hypot(x, y) < 0.14) x = y = 0;
      this.setSpin(x / 0.8, -y / 0.8);
    };
    let dragging = false;
    this.spin.addEventListener('pointerdown', (e) => {
      dragging = true;
      this.spin.setPointerCapture?.(e.pointerId);
      setSpin(e);
    });
    this.spin.addEventListener('pointermove', (e) => dragging && setSpin(e));
    this.spin.addEventListener('pointerup', () => (dragging = false));

    // the abilities
    this.curveBtn = this._ability('curve', 'Curve');
    this.bombBtn = this._ability('bomb', 'Bomb');

    // CURVE'S BEND: shown only while a curve shot is held (see main.js
    // holdForBend): a wide bar across the bottom band, with ✕ and Shoot
    this.bend = el('div', 'st-bendhold', layer);
    this.bend.hidden = true;
    this.bend.addEventListener('pointerdown', stop);
    this.cancelBtn = el('button', 'st-cancel', this.bend);
    this.cancelBtn.type = 'button';
    this.cancelBtn.setAttribute('aria-label', 'Aim again');
    this.cancelBtn.textContent = '✕';
    const mid = el('div', 'st-bendmid', this.bend);
    el('small', 'st-bendlabel', mid).textContent = 'Drag to bend the shot';
    this.bendTrack = el('div', 'st-track', mid);
    this.bendTrack.setAttribute('role', 'slider');
    this.bendTrack.setAttribute('aria-label', 'Bend');
    el('small', 'st-l', this.bendTrack).textContent = '◀';
    el('small', 'st-r', this.bendTrack).textContent = '▶';
    el('i', 'st-mid', this.bendTrack);
    this.bendKnob = el('b', 'st-knob', this.bendTrack);
    this.shootBtn = el('button', 'st-shoot', this.bend);
    this.shootBtn.type = 'button';
    this.shootBtn.textContent = 'Shoot';
    this.onShoot = null;
    this.onCancel = null;
    this.shootBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.onShoot?.();
    });
    this.cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.onCancel?.();
    });
    const setBend = (e) => {
      const r = this.bendTrack.getBoundingClientRect();
      let v = ((e.clientX - r.left) / r.width) * 2 - 1;
      v = Math.max(-1, Math.min(1, v));
      if (Math.abs(v) < 0.06) v = 0;
      this.game.shot.curve = Math.round(v * 20) / 20;
      this.paint();
      this.onChange?.();
    };
    let bending = false;
    this.bendTrack.addEventListener('pointerdown', (e) => {
      bending = true;
      this.bendTrack.setPointerCapture?.(e.pointerId);
      setBend(e);
    });
    this.bendTrack.addEventListener('pointermove', (e) => bending && setBend(e));
    this.bendTrack.addEventListener('pointerup', () => (bending = false));
    this.bendTrack.addEventListener('pointercancel', () => (bending = false));
    this.paint();
  }

  _ability(kind, label) {
    const b = el('button', `st-ab ${kind}`, this.row);
    b.type = 'button';
    b.innerHTML = `${ICON[kind]}<small>${label}</small><em></em>`;
    b.addEventListener('click', (e) => {
      e.preventDefault();
      const g = this.game;
      if (kind === 'curve') {
        if (g.shot.curveArmed) {
          g.shot.curveArmed = false;
          g.shot.curve = 0;
        } else if ((g.abilities.curve || 0) > 0) g.shot.curveArmed = true;
      } else if (g.shot.bomb) g.shot.bomb = false;
      else if ((g.abilities.bomb || 0) > 0) g.shot.bomb = true;
      this.paint();
      this.onChange?.();
    });
    return b;
  }

  setSpin(side, follow) {
    this.game.shot.side = Math.round(side * 20) / 20;
    this.game.shot.follow = Math.round(follow * 20) / 20;
    this.paint();
    this.onChange?.();
  }

  /** A curve shot is held for its bend (true) or not. */
  setHolding(on) {
    this.holding = !!on;
    this.paint();
  }

  /** Shown only while a shot is being lined up. */
  setAiming(on) {
    if (this._aiming === on) return;
    this._aiming = on;
    this.root.classList.toggle('away', !on);
  }

  /** Show what the run owns; mark what is armed. */
  paint() {
    const g = this.game;
    const a = g.abilities || {};
    const s = g.shot;
    const any = a.spin || a.curveOwned || a.bombOwned;
    this.root.hidden = !any || !!g.hideTray;
    this.spin.hidden = !a.spin;
    this.curveBtn.hidden = !a.curveOwned;
    this.bombBtn.hidden = !a.bombOwned;
    // the dot stays inside the face (review: it ran over the rim)
    this.dot.style.left = `${50 + (s.side || 0) * 30}%`;
    this.dot.style.top = `${50 - (s.follow || 0) * 30}%`;
    this.spin.classList.toggle('on', !!(s.side || s.follow));
    this.curveBtn.classList.toggle('armed', !!s.curveArmed);
    this.curveBtn.disabled = !s.curveArmed && !(a.curve > 0);
    this.curveBtn.querySelector('em').textContent = `${a.curve || 0}`;
    this.bombBtn.classList.toggle('armed', !!s.bomb);
    this.bombBtn.disabled = !s.bomb && !(a.bomb > 0);
    this.bombBtn.querySelector('em').textContent = `${a.bomb || 0}`;
    this.bend.hidden = !this.holding;
    this.root.classList.toggle('held', !!this.holding);
    this.bendKnob.style.left = `${50 + (s.curve || 0) * 50}%`;
    this.bendTrack.setAttribute('aria-valuenow', String(s.curve || 0));
  }
}
