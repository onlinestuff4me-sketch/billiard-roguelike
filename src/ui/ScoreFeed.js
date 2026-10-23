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
 *      the ball wiggles, the pocket flares — in the color of the box it feeds.
 *   3. Pops a big labeled PLATE beside the cause ("+1 WALL", "×2 ZONE").
 *   4. FLIES the plate into its box, which jumps as it lands.
 *
 * NOTHING COUNTS UNTIL A BALL DROPS, and the boxes only ever show what counts
 * (from review: faded boxes, "Locked in", provisional tags and take-backs all
 * asked the player to understand numbers that might not count). Two ways to
 * keep that promise, set in SCORE_FEED.style or with window.__feedStyle(style):
 *
 *   cash   (picked in review) a rail or a hit lights up on the table and
 *          shows no number. JUST BEFORE THE CUE BALL STRIKES A BALL THAT
 *          CONTACT WILL SINK (main.js foresees it with the aim preview's own
 *          predictor) the table all but stops, and everything that ball will
 *          cash in, the rails and hits before it, pops at its cause and flies
 *          into the boxes. Then the table runs: the hit, the ball dropping, its
 *          pocket flaring and its own numbers landing. A pot nobody could
 *          foresee (a ball knocked in by another ball) waits AT THE LIP for
 *          its numbers instead. The stroke ends on a celebrated tally. A shot
 *          that sinks nothing shows nothing.
 *   count  the shot plays at full speed with only the lights. When the table
 *          stops, the shot is counted, Balatro-style: each thing that scored
 *          pops at its cause in order and flies in, then the slam.
 *
 * Timing lives in SCORE_FEED (config.js), mirroring the Lightline tokens.
 * It runs on real time: a hit-stop freezes the table, never the presentation.
 */

import * as THREE from 'three';
import { SCORE_FEED } from '../config.js';

const style = () => SCORE_FEED.style;

/** Balatro's wiggle: an instant squash, then ~8 Hz decaying over 0.45 s. */
const wig = (age) => (age < 0 || age > 0.45 ? 0 : Math.sin(50 * age) * Math.pow(1 - age / 0.45, 3));

/** A hex color number as CSS. */
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
    /** cash: events no pot has cashed in yet, lit on the table but not shown */
    this.waiting = [];
    /** cash: the table is all but stopped while what a pot cashes in plays */
    this.brinking = false;
    /** cash: a pot foreseen before its contact, now being watched for */
    this.expecting = null;
    /** cash: the boxes as a pot last left them, for a foreseen pot that never comes */
    this.counted = { points: 0, mult: 1 };
    /** count: true while the stopped table is being counted */
    this.counting = false;
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

  /** A new stroke: both boxes back to 0 and ×1. Nothing is shown until it counts. */
  beginStroke() {
    this.clear();
    this.root.classList.remove('slam', 'void', 'paid', 'locking', 'pending', 'waiting', 'flown');
    this.voided = false;
    this.product.textContent = '';
    this._show(0, 1);
    this._state('', '');
    // count: the boxes stay out of the way until the table stops and is counted
    this.root.classList.toggle('waiting', style() === 'count');
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
    // a void shot shows nothing more (from review: after a foul, rails and the
    // ring still lit up though nothing could count any more)
    if (this.voided) return;
    if (style() === 'count') {
      // the cause lights up now; its number waits for the count
      this._juice(event, true);
      return;
    }
    if (!event.counts) {
      // cash: lit on the table, shown only if a pot cashes it in
      this._juice(event, true);
      this.waiting.push(event);
      return;
    }
    if (event.kind === 'pot' && this.expecting) {
      // foreseen: its numbers have played, and the hit and the drop were
      // watched at full speed, so the pot's own numbers follow at once
      this.expecting = null;
      this.brinking = false;
      this.queue = this.queue.filter((q) => !q.release);
      if (this.cur?.release) this.cur = null;
      this.engine.setPresentScale(1);
    } else if (event.kind === 'pot') {
      // THE BRINK (from review): the ball is at the lip. The table all but
      // stops while what this ball cashes in plays, in the order it happened;
      // then the ball drops and its own numbers follow.
      this.brinking = true;
      this.engine.setPresentScale(SCORE_FEED.brink);
      for (const w of this.waiting) this.queue.push(w);
      this.waiting = [];
      this.queue.push({ release: true });
    }
    for (const w of this.waiting) this.queue.push(w);
    this.waiting = [];
    this.counted = { points: event.points, mult: event.mult };
    this.queue.push(event);
  }

  /** The shot is void (a scratch or a foul): drop what is waiting, light nothing more. */
  voidShot() {
    this.voided = true;
    this.waiting = [];
    this.queue = this.queue.filter((e) => e.release);
  }

  /** May main.js look ahead for a pot? Only in cash, and only when nothing is held. */
  get canAnticipate() {
    return this.enabled && style() === 'cash' && !this.expecting && !this.brinking && !this.voided;
  }

  /**
   * THE FREEZE BEFORE THE HIT (from review: "have the freeze happen a bit
   * sooner, before the cue ball hits the final ball"). The cue ball is about
   * to strike a ball that this contact sinks: the table all but stops now,
   * what that pot will cash in plays, and then the hit and the drop are
   * watched at full speed.
   */
  anticipate(number = null, travel = 1) {
    if (!this.canAnticipate) return;
    this.expecting = { t: 0, number, travel };
    this.brinking = true;
    this.engine.setPresentScale(SCORE_FEED.brink);
    for (const w of this.waiting) this.queue.push(w);
    this.waiting = [];
    this.queue.push({ release: true, expect: true });
  }

  /** The ball at the lip: held a beat, then let go so it drops. */
  _release(c, dt) {
    c.t += dt;
    if (c.stage === 'brink' && c.t >= SCORE_FEED.brinkHold) {
      // let it go: the sink runs; or, foreseen, the hit and the ball's run to
      // the pocket play slowly enough to be watched (from review)
      this.brinking = false;
      this.engine.setPresentScale(c.expect ? this.expecting?.travel ?? 1 : 1);
      c.stage = c.expect ? 'watch' : 'drop';
      c.t = 0;
    } else if (c.stage === 'drop' && c.t >= SCORE_FEED.drop) {
      this.cur = null;
    } else if (c.stage === 'watch' && c.t >= SCORE_FEED.expectWait) {
      // the foreseen pot did not come (the preview's rare miss): the boxes go
      // quietly back to what last counted, and the finale says the rest
      this.expecting = null;
      this._show(this.counted.points, this.counted.mult);
      this.cur = null;
    }
  }

  /**
   * The table has stopped. Once every number has landed (count: once the
   * table has been counted), slam what the shot pays, then call `done`.
   * Whatever came after the last pot was never shown, so nothing is undone.
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
    // cash: whatever no pot cashed in was never shown, so there is nothing to undo
    this.waiting = [];
    if (style() === 'count' && !result.voided) {
      // count only what scored: everything up to the last pot
      const n = (result.events || []).length - (result.takenBack || []).length;
      this.queue.push(...(result.events || []).slice(0, Math.max(0, n)));
      this.counting = true;
      if (this.queue.length) this.root.classList.remove('waiting');
    }
    this.finale = { result, done, steps: null, i: 0, at: 0 };
  }

  /* ---------------------------------------------------------------- *
   * Drawing helpers
   * ---------------------------------------------------------------- */

  _show(points, mult) {
    this.ptsVal.textContent = Math.round(points).toLocaleString();
    this.multVal.textContent = Number.isInteger(mult) ? String(mult) : mult.toFixed(1);
  }

  _state(text, tone) {
    this.stateEl.textContent = text;
    this.stateEl.className = `sf-state${tone ? ` ${tone}` : ''}`;
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
    if (event.op !== 'x') return this.colors.mult;
    return { orange: this.colors.mult, mint: this.colors.multX ?? this.colors.multHot }[SCORE_FEED.xStyle] ?? this.colors.multHot;
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
   * THE CAUSE REACTS, in the color of the box it feeds. The light a wall
   * gives off is the cushion itself lighting up along its length; a pocket
   * flares; a ball and a zone wiggle.
   */
  _juice(event, quiet = false) {
    const at = event.at;
    if (!at) return;
    const colour = this._colour(event);
    if (quiet) {
      // a number that has not counted yet: the cause lights, briefly, no plate
      this.fx.shockwave(at.x, at.z, colour, at.kind === 'pocket' ? 4 : 2.2, 0.3);
      if (at.kind === 'wall' && Number.isFinite(at.nx)) {
        const tx = -at.nz;
        const tz = at.nx;
        this.fx.zap(at.x - tx * 2.2, at.z - tz * 2.2, at.x + tx * 2.2, at.z + tz * 2.2, colour, 0.35);
      }
      return;
    }
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
    // whatever was waiting on this plate being seen (an achievement)
    event.onShown?.();
    const colour = this._colour(event);
    const cls = event.bucket === 'points' ? 'pts' : event.op === 'x' ? `xmult x-${SCORE_FEED.xStyle}` : 'mult';
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
    // the count runs on a stopped table, so it can go briskly
    if (this.counting) hold = Math.max(SCORE_FEED.countMin, SCORE_FEED.count * Math.pow(SCORE_FEED.holdStep, this.held));
    this.held += 1;
    this.cur = { event, node, anchor, colour, t: 0, stage: 'stop', hold };
    if (!this.counting) {
      this.engine.hitStop(SCORE_FEED.hitStop / this.speed);
      this.engine.setPresentScale(this.brinking ? SCORE_FEED.brink : SCORE_FEED.slow);
    }
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
    if (!this.queue.length && !this.brinking && !this.asides) this.engine.setPresentScale(0.5);
  }

  /**
   * A moment off the score boxes that the table slows for, the way it does
   * for a plate (from review: +1 SHOT flying to the shot counter). The table
   * runs at the plates' slow speed until `run` resolves.
   * @param {() => Promise} run
   */
  async aside(run) {
    this.asides = (this.asides || 0) + 1;
    this.engine.hitStop(SCORE_FEED.hitStop);
    this.engine.setPresentScale(this.brinking ? SCORE_FEED.brink : SCORE_FEED.slow);
    try {
      await run();
    } finally {
      this.asides -= 1;
      if (!this.asides && !this.cur && !this.queue.length && !this.brinking) this.engine.setPresentScale(1);
    }
  }

  _arrive() {
    const c = this.cur;
    const e = c.event;
    c.node.remove();
    this._show(e.points, e.mult);
    this._jump(c.box, c.colour);
    this.audio.scoreNote?.(this.notes++, e.bucket === 'points' ? 'points' : 'mult');
    this.cur = null;
  }

  /* ---------------------------------------------------------------- *
   * The table has stopped: take back, then slam
   * ---------------------------------------------------------------- */

  _buildFinale(result) {
    const steps = [];
    this.counting = false;
    if (result.voided) {
      steps.push({
        hold: 0.9,
        run: () => {
          this.root.classList.remove('waiting');
          this.root.classList.add('void');
          this._state(result.voidReason === 'foul' ? 'Foul · shot void' : 'Scratch · shot void', 'hazard');
        }
      });
      return steps;
    }
    if (result.locked && result.paid > 0) {
      steps.push({
        hold: SCORE_FEED.breath,
        run: () => this._show(result.points, result.mult)
      });
      steps.push({
        hold: 0.22,
        run: () => {
          this.root.classList.add('slam');
          this.audio.scoreSlam?.();
          // no shake here (from review): the slam is in the boxes, not the table
        }
      });
      steps.push({
        hold: 1.0,
        run: () => {
          // the tally, celebrated: it pops gold and rings out, with a chime
          this.product.textContent = `+${result.paid.toLocaleString()}`;
          this.root.classList.add('paid');
          this.audio.scoreLock?.();
        }
      });
      // ...and then it goes where it belongs (from review): it lifts off the
      // boxes, flies to YOUR SCORE at the top, and is counted into it there
      if (this.onTally) {
        steps.push({
          hold: SCORE_FEED.tallyFly + SCORE_FEED.tallyCount + 0.1,
          run: () => {
            this.root.classList.add('flown');
            this.onTally(result.paid, this.product.getBoundingClientRect());
          }
        });
      }
    } else {
      // nothing dropped, and nothing was ever shown: say so, plainly
      steps.push({
        hold: 1.0,
        run: () => {
          this.root.classList.remove('waiting');
          this._show(0, 1);
          this._state('No ball dropped · no score', '');
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

    if (!this.cur && this.queue.length) {
      const next = this.queue.shift();
      if (next.release) this.cur = { release: true, expect: !!next.expect, stage: 'brink', t: 0 };
      else this._start(next);
    }

    if (this.cur?.release) {
      this._release(this.cur, dt);
      return;
    }

    if (this.cur) {
      const c = this.cur;
      c.t += dt;
      if (c.stage === 'stop' && c.t >= SCORE_FEED.hitStop) c.stage = 'hold';
      if (c.stage === 'hold' && c.t >= SCORE_FEED.hitStop + c.hold) this._fly();
      else if (c.stage === 'fly' && c.t >= SCORE_FEED.flight) {
        this._arrive();
        if (!this.queue.length && !this.brinking) this.engine.setPresentScale(this.asides ? SCORE_FEED.slow : 1);
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
