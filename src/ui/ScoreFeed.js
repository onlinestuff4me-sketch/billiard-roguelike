/**
 * ScoreFeed.js — every number, one at a time, beside the thing that earned it.
 *
 * Rules.js decides what a stroke is worth. This decides how the player SEES it
 * being earned, and the brief is Balatro's: a number must be unmissable, and
 * it must be unmistakable what caused it. Balatro gets there by never showing
 * two triggers at once, holding each for most of a second, popping the number
 * on the object that caused it while that object wiggles, and pumping the
 * receiving total in the same frame.
 *
 * Billiard balls cannot be paused the way a hand of cards can, so the table
 * does the waiting instead. Each event:
 *
 *   1. FREEZES the table for a beat (hit-stop), then runs it in SLOW MOTION
 *      while the number has its moment. Events that happen meanwhile queue.
 *   2. Makes its CAUSE react — the wall lights and pulses, the zone swells,
 *      the ball wiggles, the pocket flares — in the colour of the box it feeds.
 *   3. Pops a big labelled PLATE beside the cause ("+1 WALL", "×2 ZONE").
 *   4. FLIES the plate into its box, which jumps as it lands.
 *
 * Nothing counts until a ball drops, so the boxes stay faded until a pot locks
 * them in. After that, a number only counts if another ball drops, so it is
 * shown as PROVISIONAL: a faint tag beside its box, never added to it. Another
 * pot folds the tags in; if none comes, they fade. What the boxes show is never
 * taken back (from review: the red take-back read as a penalty for a good shot).
 *
 * A POT NEVER WAITS. A ball dropping lights its pocket the moment it drops,
 * cuts the plate on screen short and hurries anything still queued, so the
 * pot's own number follows at once (from review: "why is there a delay on the
 * pocketing animation?").
 *
 * Timing lives in SCORE_FEED (config.js), mirroring the Lightline tokens.
 * It runs on real time: a hit-stop freezes the table, never the presentation.
 */

import * as THREE from 'three';
import { SCORE_FEED } from '../config.js';

/** Balatro's wiggle: an instant squash, then ~8 Hz decaying over 0.45 s. */
const wig = (age) => (age < 0 || age > 0.45 ? 0 : Math.sin(50 * age) * Math.pow(1 - age / 0.45, 3));

/** A hex colour number as CSS. */
const css = (n) => `#${(n >>> 0).toString(16).padStart(6, '0')}`;

const el = (tag, cls, parent) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (parent) parent.appendChild(node);
  return node;
};

export class ScoreFeed {
  /**
   * @param {object} o
   * @param {HTMLElement} o.layer   the #ui-layer element (stage-sized)
   * @param {THREE.Camera} o.camera
   * @param {import('../core/Engine.js').Engine} o.engine
   * @param {import('../core/AudioManager.js').AudioManager} o.audio
   * @param {object} o.fx           the game's FX helper (burst, shockwave, zap)
   * @param {{points:number, mult:number, multHot:number, void:number}} o.colors
   * @param {boolean} [o.reducedMotion]
   */
  constructor({ layer, camera, engine, audio, fx, colors, reducedMotion = false }) {
    this.layer = layer;
    this.camera = camera;
    this.engine = engine;
    this.audio = audio;
    this.fx = fx;
    this.colors = colors;
    this.reduced = reducedMotion;
    this._v = new THREE.Vector3();

    this.root = el('div', 'score-feed', layer);
    this.stateEl = el('div', 'sf-state', this.root);
    this.boxes = el('div', 'sf-boxes', this.root);
    this.ptsBox = el('div', 'sf-box pts', this.boxes);
    el('small', '', this.ptsBox).textContent = 'Points';
    this.ptsVal = el('span', '', this.ptsBox);
    this.times = el('span', 'sf-times', this.boxes);
    this.times.textContent = '×';
    this.multBox = el('div', 'sf-box mult', this.boxes);
    el('small', '', this.multBox).textContent = 'Mult';
    this.multVal = el('span', '', this.multBox);
    this.product = el('span', 'sf-product', this.boxes);
    // provisional numbers: earned after the last pot, counted only if another drops
    // (a row of their own under the boxes: the boxes' cut corners would clip them)
    this.tagRow = el('div', 'sf-tags', this.root);
    this.ptsTag = el('span', 'sf-tag', this.tagRow);
    el('span', 'sf-tag-gap', this.tagRow);
    this.multTag = el('span', 'sf-tag', this.tagRow);
    this.plates = el('div', 'sf-plates', layer);

    this.enabled = false;
    this.root.hidden = true;
    this._resetState();
    this._show(0, 1);
  }

  _resetState() {
    this.queue = [];
    this.cur = null;
    this.finale = null;
    this.timers = [];
    this.wiggles = [];
    this.held = 0;
    this.notes = 0;
    this.speed = 1;
    this.locked = false;
    this.shown = { points: 0, mult: 1 };
  }

  /* ---------------------------------------------------------------- *
   * Lifecycle
   * ---------------------------------------------------------------- */

  /** Off during lessons and headless measurement; the table then runs at full speed. */
  setEnabled(on) {
    on = !!on;
    if (on === this.enabled) return;
    this.enabled = on;
    this.root.hidden = !on;
    this.layer.classList.toggle('feed-on', on);
    if (!on) this.clear();
  }

  /** Drop everything in flight and give the table its speed back. */
  clear() {
    this.plates.textContent = '';
    for (const w of this.wiggles) this._restore(w);
    this._resetState();
    this.engine.setPresentScale(1);
  }

  /** A new stroke: both boxes back to 0 and ×1, faded until something drops. */
  beginStroke() {
    this.clear();
    this.root.classList.remove('slam', 'void', 'paid', 'locking');
    this.product.textContent = '';
    this._show(0, 1);
    this._tags(null);
    this.root.classList.add('pending');
    this._state('Not locked yet', '');
  }

  /**
   * TUCKED AWAY WHILE YOU AIM.
   *
   * The boxes sit over the bottom of the felt, which is exactly where the aim
   * preview draws where a ball will finish. The preview is the one thing the
   * boxes must never cover, so they show only while a stroke is playing out.
   */
  setTucked(on) {
    this.root.classList.toggle('tucked', !!on);
  }

  /** Is anything still presenting, or waiting to? The stroke must not end while it is. */
  get busy() {
    return !!(this.cur || this.queue.length || this.finale);
  }

  /** A tap: everything still to come runs faster, holds and flights included. */
  speedUp() {
    if (!this.busy) return false;
    this.speed = SCORE_FEED.fastSpeed;
    return true;
  }

  /** One scoring event from Rules, carrying its `at` presentation data. */
  push(event) {
    if (!this.enabled || !event) return;
    if (event.kind === 'pot') {
      // the pocket answers now, not when the queue reaches it
      this._juice(event);
      event.juiced = true;
      if (this.cur && this.cur.stage !== 'fly') this._fly();
      for (const q of this.queue) q.quick = true;
    }
    this.queue.push(event);
  }

  /**
   * The table has stopped. Once every number has landed: take back whatever
   * came after the last pot, slam whatever was locked, then call `done`.
   *
   * @param {ReturnType<import('../systems/Rules.js').Rules['strokeResult']>} result
   * @param {() => void} done
   */
  settle(result, done) {
    if (!this.enabled) {
      done();
      return;
    }
    if (this.finale) return;
    this.finale = { result, done, steps: null, i: 0, at: 0 };
  }

  /* ---------------------------------------------------------------- *
   * Drawing helpers
   * ---------------------------------------------------------------- */

  _show(points, mult) {
    this.shown = { points, mult };
    this.ptsVal.textContent = Math.round(points).toLocaleString();
    this.multVal.textContent = Number.isInteger(mult) ? String(mult) : mult.toFixed(1);
  }

  _state(text, tone) {
    this.stateEl.textContent = text;
    this.stateEl.className = `sf-state${tone ? ` ${tone}` : ''}`;
  }

  /** The provisional tags: what another pot would add to each box (null clears). */
  _tags(e) {
    const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
    const dp = e ? Math.round(e.points - this.shown.points) : 0;
    const dm = e ? e.mult - this.shown.mult : 0;
    this.ptsTag.textContent = dp > 0 ? `+${dp.toLocaleString()}` : '';
    this.multTag.textContent = dm > 1e-6 ? `+${fmt(dm)}` : '';
    this.root.classList.toggle('provisional', dp > 0 || dm > 1e-6);
  }

  /** World (x, z) to layer pixels. */
  _project(x, z) {
    this._v.set(x, 0.7, z).project(this.camera);
    const w = this.layer.clientWidth;
    const h = this.layer.clientHeight;
    return [(this._v.x * 0.5 + 0.5) * w, (-this._v.y * 0.5 + 0.5) * h];
  }

  _boxCentre(box) {
    const l = this.layer.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    return [b.left - l.left + b.width / 2, b.top - l.top + b.height / 2];
  }

  /**
   * WHERE THE PLATE GOES: beside its cause and clear of it. Inboard of a wall,
   * inboard of a pocket, above a ball or a zone — and never under the HUD.
   */
  _anchor(at) {
    if (!at) {
      const w = this.layer.clientWidth;
      return [w / 2, this.layer.clientHeight * 0.45];
    }
    let p;
    if (at.kind === 'wall' && Number.isFinite(at.nx)) {
      p = this._project(at.x + at.nx * 3.2, at.z + at.nz * 3.2);
    } else if (at.kind === 'pocket') {
      const len = Math.hypot(at.x, at.z) || 1;
      p = this._project(at.x - (at.x / len) * 4, at.z - (at.z / len) * 4);
    } else {
      p = this._project(at.x, at.z);
      p[1] -= 44;
    }
    const w = this.layer.clientWidth;
    const h = this.layer.clientHeight;
    p[0] = Math.max(56, Math.min(w - 56, p[0]));
    p[1] = Math.max(96, Math.min(h - 170, p[1]));
    return p;
  }

  _colour(event) {
    if (event.bucket === 'points') return this.colors.points;
    return event.op === 'x' ? this.colors.multHot : this.colors.mult;
  }

  _plate(event, cls) {
    const node = el('div', `sf-plate ${cls}`, this.plates);
    const sign = event.op === 'x' ? '×' : '+';
    el('b', '', node).textContent = `${sign}${event.amount}`;
    el('small', '', node).textContent = event.label;
    return node;
  }

  _place(node, x, y, extra = '') {
    node.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)${extra}`;
  }

  _anim(node, frames, ms, easing, fill = 'none') {
    if (this.reduced || !node.animate) return null;
    return node.animate(frames, { duration: ms / this.speed, easing, fill });
  }

  /** A wiggle on a world object's scale, restored when it is done. */
  _wiggle(obj, amp, guard = null) {
    if (!obj || !obj.scale || this.reduced) return;
    this.wiggles.push({ obj, amp, t: 0, base: obj.scale.x || 1, guard });
  }

  _restore(w) {
    if (w.guard && w.guard()) return;
    w.obj.scale.setScalar(w.base);
  }

  /**
   * THE CAUSE REACTS, in the colour of the box it feeds. The light a wall
   * gives off is the cushion itself lighting up along its length; a pocket
   * flares; a ball and a zone wiggle.
   */
  _juice(event) {
    const at = event.at;
    if (!at) return;
    const colour = this._colour(event);
    const fx = this.fx;
    const later = (s, fn) => this.timers.push({ t: s, fn });
    if (at.kind === 'wall') {
      const tx = Number.isFinite(at.nz) ? -at.nz : 1;
      const tz = Number.isFinite(at.nx) ? at.nx : 0;
      const run = (len, life) => {
        // Two parallel lines read as one thick lit cushion.
        for (const off of [0, 0.12]) {
          const ox = (at.nx || 0) * off;
          const oz = (at.nz || 0) * off;
          fx.zap(at.x - tx * len + ox, at.z - tz * len + oz, at.x + tx * len + ox, at.z + tz * len + oz, colour, life);
        }
      };
      run(2.2, 0.5);
      later(0.18, () => run(4, 0.55));
      later(0.42, () => run(6, 0.6));
      fx.burst(at.x, at.z, 14, colour, 9, 0.8);
      fx.shockwave(at.x, at.z, colour, 2.6, 0.4);
    } else if (at.kind === 'pocket') {
      fx.shockwave(at.x, at.z, colour, 5.5, 0.5);
      later(0.28, () => fx.shockwave(at.x, at.z, colour, 4.2, 0.45));
      fx.burst(at.x, at.z, 16, colour, 10, 0.9);
    } else if (at.kind === 'zone') {
      fx.shockwave(at.x, at.z, colour, 5, 0.45);
      later(0.22, () => fx.shockwave(at.x, at.z, colour, 3.6, 0.4));
      fx.burst(at.x, at.z, 18, colour, 11, 0.9);
      this._wiggle(at.ref?.meshes, 0.55);
    } else {
      fx.shockwave(at.x, at.z, colour, 2.6, 0.4);
      fx.burst(at.x, at.z, 10, colour, 7, 0.7);
      const ball = at.ref;
      this._wiggle(ball?.group, 0.5, () => !!ball?.sinking || ball?.alive === false);
    }
  }

  _jump(box, colour) {
    this._anim(
      box,
      [
        { transform: 'scale(1)', filter: 'brightness(1)' },
        { transform: 'scale(1.32) rotate(-3deg)', filter: `brightness(1.5) drop-shadow(0 0 14px ${css(colour)})`, offset: 0.3 },
        { transform: 'scale(0.94) rotate(2deg)', offset: 0.6 },
        { transform: 'scale(1)', filter: 'brightness(1)' }
      ],
      SCORE_FEED.pop * 1000,
      'cubic-bezier(0.34, 1.56, 0.64, 1)'
    );
  }

  _streak(from, to, colour) {
    if (this.reduced) return;
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const len = Math.hypot(dx, dy);
    const node = el('div', 'sf-streak', this.plates);
    node.style.background = `linear-gradient(90deg, transparent, ${css(colour)})`;
    node.style.boxShadow = `0 0 12px ${css(colour)}`;
    node.style.width = `${len}px`;
    node.style.transform = `translate(${from[0]}px, ${from[1]}px) rotate(${Math.atan2(dy, dx)}rad)`;
    const a = this._anim(
      node,
      [
        { transform: `${node.style.transform} scaleX(0)`, opacity: 1 },
        { transform: `${node.style.transform} scaleX(1)`, opacity: 1, offset: 0.55 },
        { transform: `${node.style.transform} scaleX(1)`, opacity: 0 }
      ],
      (SCORE_FEED.flight + 0.3) * 1000,
      'linear'
    );
    if (a) a.onfinish = () => node.remove();
    else node.remove();
  }

  /* ---------------------------------------------------------------- *
   * One event: freeze, hold beside the cause, fly into the box
   * ---------------------------------------------------------------- */

  _start(event) {
    const colour = this._colour(event);
    // after a pot, anything a pot has not locked in only counts if one follows
    event.provisional = this.locked && !event.counts && event.kind !== 'pot';
    const cls = (event.bucket === 'points' ? 'pts' : event.op === 'x' ? 'xmult' : 'mult') + (event.provisional ? ' maybe' : '');
    const node = this._plate(event, cls);
    const anchor = this._anchor(event.at);
    this._place(node, anchor[0], anchor[1]);
    const base = node.style.transform;
    this._anim(
      node,
      [
        { transform: `${base} scale(0.2) rotate(-12deg)`, opacity: 0 },
        { transform: `${base} scale(1.32) rotate(6deg)`, opacity: 1, offset: 0.35 },
        { transform: `${base} scale(0.9) rotate(-4deg)`, offset: 0.6 },
        { transform: `${base} scale(1.06) rotate(2deg)`, offset: 0.8 },
        { transform: `${base} scale(1)` }
      ],
      SCORE_FEED.pop * 1000,
      'ease-out'
    );
    let hold = Math.max(SCORE_FEED.holdMin, SCORE_FEED.hold * Math.pow(SCORE_FEED.holdStep, this.held));
    if (event.quick) hold = SCORE_FEED.holdMin * 0.5;
    this.held += 1;
    this.cur = { event, node, anchor, colour, t: 0, stage: 'stop', hold };
    this.engine.hitStop(SCORE_FEED.hitStop / this.speed);
    this.engine.setPresentScale(SCORE_FEED.slow);
    this.engine.shake(60);
    this.audio.scoreThud?.();
    if (!event.juiced) this._juice(event);
  }

  _fly() {
    const c = this.cur;
    const box = c.event.bucket === 'points' ? this.ptsBox : this.multBox;
    const to = this._boxCentre(box);
    c.stage = 'fly';
    c.t = 0;
    c.box = box;
    this._anim(
      c.node,
      [
        { transform: `translate(${c.anchor[0]}px, ${c.anchor[1]}px) translate(-50%, -50%) scale(1)` },
        { transform: `translate(${to[0]}px, ${to[1]}px) translate(-50%, -50%) scale(0.5)` }
      ],
      SCORE_FEED.flight * 1000,
      'cubic-bezier(0.6, 0, 0.9, 0.4)',
      'forwards'
    );
    this._streak(c.anchor, to, c.colour);
    // With nothing else waiting, let the table pick its speed back up while
    // this one is in the air.
    if (!this.queue.length) this.engine.setPresentScale(0.5);
  }

  _arrive() {
    const c = this.cur;
    const e = c.event;
    c.node.remove();
    if (e.provisional) {
      this._tags(e);
    } else {
      this._show(e.points, e.mult);
      this._tags(null);
    }
    this._jump(c.box, c.colour);
    this.audio.scoreNote?.(this.notes++, e.bucket === 'points' ? 'points' : 'mult');
    if (e.kind === 'pot' && !this.locked) {
      this.locked = true;
      this.root.classList.remove('pending');
      this._state('Locked in', 'lock');
      this.root.classList.remove('locking');
      void this.root.offsetWidth;
      this.root.classList.add('locking');
      this.audio.scoreLock?.();
    }
    this.cur = null;
  }

  /* ---------------------------------------------------------------- *
   * The table has stopped: take back, then slam
   * ---------------------------------------------------------------- */

  _buildFinale(result) {
    const steps = [];
    const back = result.takenBack || [];

    if (result.voided) {
      steps.push({
        hold: 0.9,
        run: () => {
          this.root.classList.remove('pending');
          this.root.classList.add('void');
          this._state('Scratch · shot void', 'hazard');
        }
      });
      return steps;
    }

    if (back.length && result.locked) {
      // what came after the last pot was only ever shown as provisional:
      // its tags fade, and the boxes, which never counted it, stay as they are
      steps.push({
        hold: 0.5,
        run: () => {
          this.root.classList.add('fading');
          this._state('After the last pot · not counted', '');
        }
      });
      steps.push({
        hold: 0.1,
        run: () => {
          this._tags(null);
          this.root.classList.remove('fading');
        }
      });
    }

    if (result.locked && result.paid > 0) {
      steps.push({
        hold: SCORE_FEED.breath,
        run: () => {
          this.root.classList.remove('void', 'pending');
          this._state('', '');
          this._show(result.points, result.mult);
        }
      });
      steps.push({
        hold: 0.22,
        run: () => {
          this.root.classList.add('slam');
          this.audio.scoreSlam?.();
          this.engine.shake(140);
        }
      });
      steps.push({
        hold: 1.0,
        run: () => {
          this.product.textContent = `+${result.paid.toLocaleString()}`;
          this.root.classList.add('paid');
        }
      });
    } else {
      steps.push({
        hold: 1.0,
        run: () => {
          // nothing dropped, so nothing was ever counted: the faded boxes empty quietly
          this.root.classList.remove('pending');
          this._show(0, 1);
          this._tags(null);
          this._state('No ball dropped', '');
        }
      });
    }
    return steps;
  }

  /* ---------------------------------------------------------------- *
   * Per frame, on real time
   * ---------------------------------------------------------------- */

  update(rawDt) {
    if (!this.enabled) return;
    const dt = rawDt * this.speed;

    for (let i = this.timers.length - 1; i >= 0; i--) {
      const t = this.timers[i];
      t.t -= dt;
      if (t.t <= 0) {
        this.timers.splice(i, 1);
        t.fn();
      }
    }
    for (let i = this.wiggles.length - 1; i >= 0; i--) {
      const w = this.wiggles[i];
      w.t += dt;
      if (w.guard && w.guard()) {
        this.wiggles.splice(i, 1);
        continue;
      }
      if (w.t > 0.5) {
        this._restore(w);
        this.wiggles.splice(i, 1);
      } else {
        w.obj.scale.setScalar(w.base * (1 + w.amp * wig(w.t)));
      }
    }

    if (!this.cur && this.queue.length) this._start(this.queue.shift());

    if (this.cur) {
      const c = this.cur;
      c.t += dt;
      if (c.stage === 'stop' && c.t >= SCORE_FEED.hitStop) c.stage = 'hold';
      if (c.stage === 'hold' && c.t >= SCORE_FEED.hitStop + c.hold) this._fly();
      else if (c.stage === 'fly' && c.t >= SCORE_FEED.flight) {
        this._arrive();
        if (!this.queue.length) this.engine.setPresentScale(1);
      }
      return;
    }

    if (this.finale) {
      const f = this.finale;
      this.engine.setPresentScale(1);
      if (!f.steps) {
        f.steps = this._buildFinale(f.result);
        f.at = 0.15;
      }
      f.at -= dt;
      if (f.at <= 0) {
        if (f.i < f.steps.length) {
          const step = f.steps[f.i++];
          step.run();
          f.at = step.hold;
        } else {
          this.finale = null;
          this.speed = 1;
          f.done();
        }
      }
    }
  }
}

export default ScoreFeed;
