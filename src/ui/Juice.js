/**
 * Juice.js — the big-moment layer (review: "juice ideas", batch 1).
 *
 * Twelve effects drawn from the reference clips, each with versions to compare
 * in review, chosen in `lightline-juice-v2` (localStorage, a {key: version}
 * map; 'off' turns one off). Comic style in the clips, drawn in light here:
 * cyan lines, scanlines for halftone, glowing bands.
 *
 *   strike     the strike burst: lines out of the cue ball      both | lines | flash
 *   trail      behind a hard shot                               streak | sparks
 *   beam       a ball dropping                                  pillar | rings
 *   charge     pulling back for power                           rails | pulse
 *   tint       the table while an ability plays                 both | scan | dots
 *   push       the camera while pulling back                    both | push | lean
 *   pull       the camera on a full-power shot                  swoop | out
 *   follow     the camera on the last ball                      drift | punch
 *   banner     a table's rule                                   band | bandOnly
 *   slam       full power, said                                 big | small
 *   cutin      an ability, named                                panel | strip
 *   finish     the last ball down, before the result            slam | bands
 *
 * Defaults are the review's picks (JUICE_DEFAULTS).
 *
 * Everything here is presentation: it never changes a shot, the aim or the
 * score. DOM effects run on WAAPI (so a capture can step them); camera moves
 * go through `engine.view`, eased here on real time.
 */

import * as THREE from 'three';

const KEY = 'lightline-juice-v2';
export const JUICE_OPTIONS = {
  strike: ['both', 'lines', 'flash'],
  trail: ['streak', 'sparks'],
  beam: ['pillar', 'rings'],
  charge: ['rails', 'pulse'],
  tint: ['both', 'scan', 'dots'],
  push: ['both', 'push', 'lean'],
  pull: ['swoop', 'out'],
  follow: ['drift', 'punch'],
  banner: ['band', 'bandOnly'],
  slam: ['big', 'small'],
  cutin: ['panel', 'strip'],
  finish: ['slam', 'bands']
};
/**
 * THE PICKS (review, juice batches 1 and 2). "Both" means each version in its
 * own place: the strike's lines on an ordinary shot and its flash at full
 * power; the lean while charging and the push near full; scanlines for
 * Freeze and halftone dots for Curve and Bomb. Off: pocket beam, charge glow,
 * pull back, follow the last ball, banner sweep.
 */
export const JUICE_DEFAULTS = {
  strike: 'both',
  trail: 'streak',
  beam: 'off',
  charge: 'off',
  tint: 'both',
  push: 'both',
  pull: 'off',
  follow: 'off',
  banner: 'off',
  slam: 'big',
  cutin: 'panel',
  finish: 'slam'
};

const CYAN = '#22e8ff';
const ORANGE = '#ff8a1e';
const GOLD = '#ffc266';
const ICE = '#bff4ff';
const OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
const IN = 'cubic-bezier(0.55, 0, 0.9, 0.4)';
const BACK = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

const el = (tag, cls, parent) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (parent) parent.appendChild(n);
  return n;
};

export class Juice {
  constructor({ layer, camera, engine, fx, scene, arena, reducedMotion }) {
    this.layer = layer;
    this.camera = camera;
    this.engine = engine;
    this.fx = fx;
    this.arena = arena;
    this.reducedMotion = !!reducedMotion;
    this.root = el('div', 'juice', layer);
    this.settings = {};
    this.load();
    this._v = new THREE.Vector3();
    // the camera's wanted framing, eased toward on real time
    this.want = { x: 0, z: 0, zoom: 1, rate: 8 };
    this.timeline = null;
    this.hold = null;
    // the power trail: a ribbon of the cue ball's last positions
    this.trailT = 0;
    this.trailPts = [];
    this._buildTrail(scene);
    this.chargeEl = null;
    this.tintEl = null;
  }

  /* ---------------------------------------------------------------- *
   * settings
   * ---------------------------------------------------------------- */

  load() {
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {};
    } catch {
      saved = {};
    }
    this.settings = {};
    for (const [k, opts] of Object.entries(JUICE_OPTIONS)) this.settings[k] = saved[k] === 'off' || opts.includes(saved[k]) ? saved[k] : JUICE_DEFAULTS[k];
  }

  /** Which version of `key` is on, or null when it is off. */
  on(key) {
    const v = this.settings[key];
    return v && v !== 'off' ? v : null;
  }

  set(key, value) {
    this.settings[key] = value;
    try {
      localStorage.setItem(KEY, JSON.stringify(this.settings));
    } catch {
      /* private mode */
    }
  }

  /* ---------------------------------------------------------------- *
   * helpers
   * ---------------------------------------------------------------- */

  toPx(x, z) {
    const v = this._v.set(x, 0, z).project(this.camera);
    return { x: ((v.x + 1) / 2) * this.layer.clientWidth, y: ((1 - v.y) / 2) * this.layer.clientHeight };
  }

  /** The felt's rectangle on screen, in layer pixels. */
  tableRect() {
    const a = this.toPx(-this.arena.width / 2, -this.arena.height / 2);
    const b = this.toPx(this.arena.width / 2, this.arena.height / 2);
    return { left: Math.min(a.x, b.x), top: Math.min(a.y, b.y), width: Math.abs(b.x - a.x), height: Math.abs(b.y - a.y) };
  }

  anim(node, frames, opts) {
    if (!node.animate) return Promise.resolve();
    return node.animate(frames, { fill: 'both', ...opts }).finished.catch(() => {});
  }

  flash(strength = 0.7, ms = 160) {
    const f = el('div', 'jc-flash', this.root);
    return this.anim(f, [{ opacity: strength }, { opacity: 0 }], { duration: ms, easing: 'ease-out' }).then(() => f.remove());
  }

  /* ---------------------------------------------------------------- *
   * 1. STRIKE BURST
   * ---------------------------------------------------------------- */

  /** The cue meets the ball: lines burst out of it, more and longer the harder. */
  strike({ x, z, dirX = 0, dirZ = -1, power = 1, maxed = false }) {
    let style = this.on('strike');
    if (!style || this.reducedMotion) return;
    if (style === 'both') style = maxed ? 'flash' : 'lines';
    const p = this.toPx(x, z);
    const box = el('div', 'jc-burst', this.root);
    box.style.left = `${p.x}px`;
    box.style.top = `${p.y}px`;
    const n = Math.round(10 + 22 * power);
    const color = maxed ? ORANGE : CYAN;
    const reach = 60 + 150 * power;
    const back = Math.atan2(-dirZ, -dirX);
    for (let i = 0; i < n; i++) {
      const line = el('i', '', box);
      const a = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
      // a little wider gap where the stick came from, as in the clips
      if (Math.abs(((a - back + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < 0.28) continue;
      const len = reach * (0.35 + Math.random() * 0.5);
      const r0 = 14 + Math.random() * 10;
      line.style.width = `${len}px`;
      line.style.background = `linear-gradient(90deg, transparent, ${i % 3 ? color : '#ffffff'})`;
      line.style.height = style === 'flash' ? `${2 + Math.random() * 2.5}px` : `${1.5 + Math.random() * 1.2}px`;
      const deg = (a * 180) / Math.PI;
      this.anim(
        line,
        [
          { transform: `rotate(${deg}deg) translateX(${r0}px) scaleX(0.15)`, opacity: 1 },
          { transform: `rotate(${deg}deg) translateX(${r0 + reach * 0.25}px) scaleX(1)`, opacity: 1, offset: 0.35 },
          { transform: `rotate(${deg}deg) translateX(${r0 + reach * 0.75}px) scaleX(0.3)`, opacity: 0 }
        ],
        { duration: 300 + 160 * power, easing: OUT }
      );
    }
    setTimeout(() => box.remove(), 700);
    if (style === 'flash') {
      const core = el('div', 'jc-core', box);
      core.style.background = `radial-gradient(circle, #ffffff 0%, ${color} 35%, transparent 70%)`;
      this.anim(core, [{ transform: 'translate(-50%,-50%) scale(0.3)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(1.6)', opacity: 0 }], { duration: 320, easing: OUT });
      if (power > 0.85) this.flash(0.55, 140);
      // no shockwave ring here (review round 3: an orange circle hung on the
      // cue ball through the slow-motion)
    }
  }

  /**
   * A Bomb Shot goes off (review round 3: "have the explosion spread out as
   * the blast travels with the balls that get pushed out"). A small white-hot
   * flash at the ball hit; then every ball the blast throws carries its own
   * fire, a comet of flame streaming behind it and shedding embers, and the
   * fire front is a ring that grows with the farthest of them, so the blast
   * spreads exactly as far and as fast as the balls do. It burns down as they
   * slow. Drawn on the top layer; no tint, no full-screen glow.
   */
  blast({ x, z, radius, balls = [] }) {
    this._endBlast();
    const p = this.toPx(x, z);
    const r = Math.abs(this.toPx(x + radius, z).x - p.x);
    const box = el('div', 'jc-blastfx', this.root);
    // 1. the impact: white-hot and small
    const core = el('div', 'jc-core', box);
    core.style.left = `${p.x}px`;
    core.style.top = `${p.y}px`;
    core.style.width = core.style.height = `${r * 0.7}px`;
    core.style.background = 'radial-gradient(circle, #ffffff 0%, #fff1c9 30%, #ffb35c 55%, rgba(255, 138, 30, 0) 72%)';
    this.anim(core, [
      { transform: 'translate(-50%,-50%) scale(0.2)', opacity: 1 },
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 1, offset: 0.35 },
      { transform: 'translate(-50%,-50%) scale(0.8)', opacity: 0 }
    ], { duration: 320, easing: 'ease-out' });
    // 2. the fire front, sized every frame to the farthest thrown ball
    const ring = el('div', 'jc-blast-ring', box);
    ring.style.left = `${p.x}px`;
    ring.style.top = `${p.y}px`;
    // 3. each thrown ball's own fire
    const riders = balls.filter(Boolean).map((b) => ({ b, el: el('div', 'jc-ballfire', box), last: 0 }));
    this._blast = { box, ring, cx: x, cz: z, p, riders, t: 0, life: 1, peak: 0 };
  }

  _endBlast() {
    if (!this._blast) return;
    const bl = this._blast;
    this._blast = null;
    this.anim(bl.box, [{ opacity: 1 }, { opacity: 0 }], { duration: 220 }).then(() => bl.box.remove());
  }

  /**
   * The blast's fire, kept with the balls it threw. It burns down on GAME time
   * (gt): the table runs slow while a number shows, and a ball crawling there
   * still has its full speed on paper.
   */
  _updateBlast(rawDt, dt = rawDt) {
    const bl = this._blast;
    if (!bl) return;
    bl.t += rawDt;
    bl.gt = (bl.gt || 0) + dt;
    const c = this.toPx(bl.cx, bl.cz);
    let far = 0;
    let fastest = 0;
    for (const rd of bl.riders) {
      const b = rd.b;
      // a ball that has dropped is out of the blast (its last speed lingers)
      if (b.alive === false) {
        rd.el.style.opacity = '0';
        continue;
      }
      const sp = Math.hypot(b.vx || 0, b.vz || 0);
      fastest = Math.max(fastest, sp);
      const q = this.toPx(b.x, b.z);
      far = Math.max(far, Math.hypot(q.x - c.x, q.y - c.y));
      const k = Math.max(0, Math.min(1, sp / 14)) * this._burn(bl);
      if (sp < 0.6 || k < 0.05) {
        rd.el.style.opacity = '0';
        continue;
      }
      // the comet points back along the ball's travel, longer the faster
      const back = this.toPx(b.x - (b.vx || 0) * 0.1, b.z - (b.vz || 0) * 0.1);
      const ang = Math.atan2(back.y - q.y, back.x - q.x);
      const len = 18 + 70 * k;
      Object.assign(rd.el.style, {
        left: `${q.x}px`,
        top: `${q.y}px`,
        width: `${len}px`,
        opacity: String(Math.min(1, 0.35 + k)),
        transform: `rotate(${ang}rad) translateY(-50%)`
      });
      // embers shed along the way
      rd.last += rawDt;
      if (rd.last > 0.05 && !this.reducedMotion) {
        rd.last = 0;
        const e = el('i', 'jc-ember', bl.box);
        e.style.left = `${q.x + (Math.random() - 0.5) * 10}px`;
        e.style.top = `${q.y + (Math.random() - 0.5) * 10}px`;
        this.anim(e, [{ transform: 'scale(1)', opacity: 1 }, { transform: `translate(${(Math.random() - 0.5) * 24}px, ${(Math.random() - 0.5) * 24}px) scale(0.2)`, opacity: 0 }], { duration: 420, easing: 'ease-out' }).then(() => e.remove());
      }
    }
    // the front grows with the farthest ball, and burns down as they slow
    bl.peak = Math.max(bl.peak, far);
    const heat = Math.max(0, Math.min(1, fastest / 10)) * this._burn(bl);
    bl.life = bl.t < 0.25 ? 1 : Math.min(bl.life, 0.1 + heat);
    const size = Math.max(10, bl.peak) * 2;
    Object.assign(bl.ring.style, {
      left: `${c.x}px`,
      top: `${c.y}px`,
      width: `${size}px`,
      height: `${size}px`,
      opacity: String(Math.max(0, bl.life - 0.15)),
      borderWidth: `${3 + 9 * heat}px`
    });
    if ((bl.t > 0.4 && (fastest < 1.2 || this._burn(bl) <= 0)) || bl.t > 2) this._endBlast();
  }

  /** How much fire is left: out a second after the blast, by game or real time. */
  _burn(bl) {
    return Math.max(0, 1 - Math.max((bl.gt || 0) / 0.9, bl.t / 1.0));
  }

  /* ---------------------------------------------------------------- *
   * 2. POWER TRAIL
   * ---------------------------------------------------------------- */

  _buildTrail(scene) {
    const N = 18;
    this.trailN = N;
    const pos = new Float32Array(N * 2 * 3);
    const col = new Float32Array(N * 2 * 3);
    const idx = [];
    for (let i = 0; i < N - 1; i++) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setIndex(idx);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    mesh.frustumCulled = false;
    mesh.renderOrder = 3;
    mesh.visible = false;
    scene.add(mesh);
    this.trail = { mesh, geo, pos, col };
    this._trailColor = new THREE.Color();
  }

  /** A hard shot begins: the cue ball leaves light behind it for a moment. */
  startTrail(power, maxed) {
    if (!this.on('trail') || power < 0.7 || this.reducedMotion) return;
    this.trailT = 0.75;
    this.trailPts.length = 0;
    this._trailColor.set(maxed ? ORANGE : CYAN);
  }

  _updateTrail(dt, cue) {
    const style = this.on('trail');
    const T = this.trail;
    if (!style || this.trailT <= 0 || !cue) {
      if (this.trailPts.length) this.trailPts.shift();
      if (!this.trailPts.length) {
        T.mesh.visible = false;
        return;
      }
    } else {
      this.trailT -= dt;
      const speed = Math.hypot(cue.vx, cue.vz);
      if (speed < 3) this.trailT = Math.min(this.trailT, 0.1);
      if (style === 'sparks') {
        if (Math.random() < 0.8) this.fx.burst(cue.x, cue.z, 2, `#${this._trailColor.getHexString()}`, 2.5, 0.8);
        return;
      }
      this.trailPts.unshift({ x: cue.x, z: cue.z });
      if (this.trailPts.length > this.trailN) this.trailPts.length = this.trailN;
    }
    if (style !== 'streak') {
      T.mesh.visible = false;
      return;
    }
    const pts = this.trailPts;
    if (pts.length < 2) {
      T.mesh.visible = false;
      return;
    }
    T.mesh.visible = true;
    const c = this._trailColor;
    for (let i = 0; i < this.trailN; i++) {
      const p = pts[Math.min(i, pts.length - 1)];
      const q = pts[Math.min(i + 1, pts.length - 1)] || p;
      let dx = p.x - q.x;
      let dz = p.z - q.z;
      const d = Math.hypot(dx, dz) || 1;
      dx /= d;
      dz /= d;
      const k = i / (this.trailN - 1);
      // tapering from the ball's width to nothing, with a jag like the clips' streak
      const w = 0.42 * (1 - k) * (i % 2 ? 0.75 : 1.1);
      const o = i * 6;
      T.pos[o] = p.x - dz * w;
      T.pos[o + 1] = 0.3;
      T.pos[o + 2] = p.z + dx * w;
      T.pos[o + 3] = p.x + dz * w;
      T.pos[o + 4] = 0.3;
      T.pos[o + 5] = p.z - dx * w;
      const f = i < pts.length ? (1 - k) ** 1.4 : 0;
      for (const j of [0, 3]) {
        T.col[o + j] = c.r * f + 0.4 * f * (1 - k);
        T.col[o + j + 1] = c.g * f + 0.4 * f * (1 - k);
        T.col[o + j + 2] = c.b * f + 0.4 * f * (1 - k);
      }
    }
    T.geo.attributes.position.needsUpdate = true;
    T.geo.attributes.color.needsUpdate = true;
  }

  /* ---------------------------------------------------------------- *
   * 3. POCKET BEAM
   * ---------------------------------------------------------------- */

  /** A ball drops. kind: 'pot' | 'mult' | 'last'. */
  beam({ x, z, kind = 'pot' }) {
    const style = this.on('beam');
    if (!style) return;
    const color = kind === 'last' ? GOLD : kind === 'mult' ? ORANGE : CYAN;
    const p = this.toPx(x, z);
    if (style === 'pillar') {
      const b = el('div', 'jc-pillar', this.root);
      b.style.left = `${p.x}px`;
      b.style.top = `${p.y}px`;
      b.style.setProperty('--c', color);
      const tall = kind === 'last' ? 1.6 : 1;
      this.anim(
        b,
        [
          { transform: 'translate(-50%, -100%) scaleX(0.3) scaleY(0)', opacity: 1 },
          { transform: `translate(-50%, -100%) scaleX(1) scaleY(${tall})`, opacity: 1, offset: 0.25 },
          { transform: `translate(-50%, -100%) scaleX(0.15) scaleY(${tall * 1.1})`, opacity: 0 }
        ],
        { duration: kind === 'last' ? 900 : 620, easing: OUT }
      ).then(() => b.remove());
      this.fx.shockwave(x, z, color, kind === 'last' ? 8 : 5.5, 0.55);
    } else {
      this.fx.shockwave(x, z, color, 5, 0.5);
      setTimeout(() => this.fx.shockwave(x, z, '#ffffff', kind === 'last' ? 9 : 7, 0.6), 90);
      const s = el('div', 'jc-star', this.root);
      s.style.left = `${p.x}px`;
      s.style.top = `${p.y}px`;
      s.style.setProperty('--c', color);
      el('i', '', s);
      el('i', '', s);
      this.anim(
        s,
        [
          { transform: 'translate(-50%,-50%) scale(0.2) rotate(0deg)', opacity: 1 },
          { transform: 'translate(-50%,-50%) scale(1.15) rotate(25deg)', opacity: 1, offset: 0.3 },
          { transform: 'translate(-50%,-50%) scale(0.6) rotate(45deg)', opacity: 0 }
        ],
        { duration: kind === 'last' ? 800 : 560, easing: OUT }
      ).then(() => s.remove());
    }
  }

  /* ---------------------------------------------------------------- *
   * 4. CHARGE GLOW
   * ---------------------------------------------------------------- */

  /** Pulling back: the rails brighten with the draw (0..1); null lets go. */
  charge(level) {
    const style = this.on('charge');
    if (!style || level == null || level <= 0.02) {
      if (this.chargeEl) {
        const c = this.chargeEl;
        this.chargeEl = null;
        this.anim(c, [{ opacity: Number(getComputedStyle(c).opacity) || 0 }, { opacity: 0 }], { duration: 160 }).then(() => c.remove());
      }
      return;
    }
    if (!this.chargeEl) this.chargeEl = el('div', `jc-charge ${style}`, this.root);
    const r = this.tableRect();
    Object.assign(this.chargeEl.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    this.chargeLevel = level;
  }

  _updateCharge(t) {
    const c = this.chargeEl;
    if (!c) return;
    const lv = this.chargeLevel || 0;
    const hot = lv >= 0.98;
    let o = lv ** 1.4;
    if (this.on('charge') === 'pulse') o *= 0.55 + 0.45 * Math.sin(t * (6 + 22 * lv));
    c.style.opacity = String(Math.max(0, Math.min(1, o)));
    c.style.setProperty('--c', hot || lv > 0.85 ? ORANGE : CYAN);
    c.style.setProperty('--w', `${6 + 26 * lv}px`);
  }

  /* ---------------------------------------------------------------- *
   * 5. ABILITY TINT
   * ---------------------------------------------------------------- */

  /**
   * An ability's shot: the table goes into its color until the stroke ends.
   * `kind` is 'freeze' or 'ability' (Curve, Bomb): with both on, Freeze
   * gets scanlines and the abilities halftone dots.
   */
  tint(on, color = ICE, kind = 'freeze') {
    let style = this.on('tint');
    if (style === 'both') style = kind === 'freeze' ? 'scan' : 'dots';
    if (on && style) {
      if (this.tintEl && !this.tintEl.classList.contains(style)) this.tintEl.className = `jc-tint ${style}`;
      if (!this.tintEl) {
        this.tintEl = el('div', `jc-tint ${style}`, this.root);
        this.anim(this.tintEl, [{ opacity: 0 }, { opacity: 1 }], { duration: 220 });
      }
      const r = this.tableRect();
      Object.assign(this.tintEl.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
      this.tintEl.style.setProperty('--c', color);
      return;
    }
    if (this.tintEl) {
      const t = this.tintEl;
      this.tintEl = null;
      this.anim(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 380 }).then(() => t.remove());
    }
  }

  /* ---------------------------------------------------------------- *
   * 6–8. CAMERA
   * ---------------------------------------------------------------- */

  /** Pulling back to shoot: the view leans toward the cue ball. */
  pushIn(level, cue) {
    if (this.timeline || this.hold) return;
    const style = this.on('push');
    if (!style || this.reducedMotion || level == null || !cue) {
      this.want = { x: 0, z: 0, zoom: 1, rate: 10 };
      return;
    }
    const k = Math.max(0, Math.min(1, level));
    if (style === 'both') {
      // the lean all the way, and the push gathering over the last quarter
      const t = Math.max(0, Math.min(1, (k - 0.75) / 0.25));
      const p = t * t * (3 - 2 * t);
      this.want = { x: cue.x * 0.3 * p, z: cue.z * 0.3 * p, zoom: 1 + 0.035 * k + 0.045 * p, rate: 6 };
      return;
    }
    this.want = style === 'push' ? { x: cue.x * 0.3 * k, z: cue.z * 0.3 * k, zoom: 1 + 0.08 * k, rate: 6 } : { x: 0, z: 0, zoom: 1 + 0.035 * k, rate: 6 };
  }

  /** A full-power strike: punch in, then pull out past the table and settle. */
  pullBack(cue) {
    const style = this.on('pull');
    if (!style || this.reducedMotion) {
      this.want = { x: 0, z: 0, zoom: 1, rate: 12 };
      return;
    }
    const keys =
      style === 'swoop'
        ? [
            { at: 0, x: cue.x * 0.45, z: cue.z * 0.45, zoom: 1.16, rate: 40 },
            { at: 0.18, x: 0, z: 0, zoom: 0.9, rate: 5 },
            { at: 0.75, x: 0, z: 0, zoom: 1, rate: 2.2 }
          ]
        : [
            { at: 0, x: 0, z: 0, zoom: 0.9, rate: 7 },
            { at: 0.7, x: 0, z: 0, zoom: 1, rate: 2.4 }
          ];
    this.timeline = { t: 0, keys, end: 2.4 };
  }

  /**
   * The last ball drops: the view leans to its pocket, then comes home. It
   * never holds there: the cue ball can roll on for seconds before the clear,
   * and a view parked on a corner hid most of the table (from the clips).
   */
  followLast({ x, z }) {
    const style = this.on('follow');
    if (!style || this.reducedMotion) return;
    this.timeline = null;
    if (style === 'drift') {
      this.timeline = {
        t: 0,
        keys: [
          { at: 0, x: x * 0.28, z: z * 0.28, zoom: 1.12, rate: 3.2 },
          { at: 1.6, x: 0, z: 0, zoom: 1, rate: 2.2 }
        ],
        end: 3.4
      };
    } else {
      this.timeline = {
        t: 0,
        keys: [
          { at: 0, x: x * 0.5, z: z * 0.5, zoom: 1.3, rate: 30 },
          { at: 0.35, x: 0, z: 0, zoom: 1, rate: 3 }
        ],
        end: 2
      };
    }
  }

  /** Take down any message still on screen (a menu opens, a table is swapped). */
  clear() {
    for (const n of [...this.root.children]) if (/^jc-(band-wrap|slam|cut|finish)\b/.test(n.className)) n.remove();
  }

  /** Back to the plain top-down view (a table ends, a menu opens). */
  release() {
    this._endBlast();
    this.hold = null;
    this.timeline = null;
    this.want = { x: 0, z: 0, zoom: 1, rate: 6 };
  }

  _updateCamera(rawDt) {
    let w = this.want;
    if (this.hold) w = this.hold;
    else if (this.timeline) {
      const tl = this.timeline;
      tl.t += rawDt;
      let cur = tl.keys[0];
      for (const k of tl.keys) if (tl.t >= k.at) cur = k;
      w = cur;
      if (tl.t > tl.end) {
        this.timeline = null;
        this.want = { x: 0, z: 0, zoom: 1, rate: 4 };
      }
    }
    const v = this.engine.view;
    const a = 1 - Math.exp(-(w.rate || 6) * rawDt);
    v.x += (w.x - v.x) * a;
    v.z += (w.z - v.z) * a;
    v.zoom += (w.zoom - v.zoom) * a;
    if (Math.abs(v.zoom - 1) < 0.0005 && Math.abs(v.x) < 0.001 && Math.abs(v.z) < 0.001 && w.zoom === 1 && !w.x && !w.z) {
      v.x = 0;
      v.z = 0;
      v.zoom = 1;
    }
  }

  /* ---------------------------------------------------------------- *
   * 9. BANNER SWEEP
   * ---------------------------------------------------------------- */

  /**
   * A slanted band sweeps across with a title and a line. Resolves when it has
   * gone (or, with `waitTap`, once it is tapped away).
   */
  banner({ kicker, title, sub, hold = 1400 }) {
    const box = el('div', 'jc-band-wrap', this.root);
    const band = el('div', 'jc-band', box);
    if (kicker) el('small', '', band).textContent = kicker;
    el('b', '', band).textContent = title;
    if (sub) el('span', '', band).textContent = sub;
    return this.anim(band, [{ transform: 'translateX(-115%) skewX(-12deg)' }, { transform: 'translateX(0) skewX(-12deg)' }], { duration: 300, easing: OUT })
      .then(() => new Promise((r) => setTimeout(r, hold)))
      .then(() => this.anim(band, [{ transform: 'translateX(0) skewX(-12deg)', opacity: 1 }, { transform: 'translateX(115%) skewX(-12deg)', opacity: 1 }], { duration: 260, easing: IN }))
      .then(() => box.remove());
  }

  /* ---------------------------------------------------------------- *
   * 10. SLAM TITLE
   * ---------------------------------------------------------------- */

  slam(text) {
    const style = this.on('slam');
    if (!style) return Promise.resolve();
    const big = style === 'big';
    const box = el('div', `jc-slam ${style}`, this.root);
    const band = big ? el('div', 'jc-slam-band', box) : null;
    const word = el('b', '', box);
    word.textContent = text;
    if (big) this.flash(0.8, 150);
    if (band) this.anim(band, [{ transform: 'translate(-50%, -50%) skewY(-6deg) scaleX(0)' }, { transform: 'translate(-50%, -50%) skewY(-6deg) scaleX(1)' }], { duration: 220, delay: 90, easing: OUT });
    return this.anim(
      word,
      [
        { transform: `translate(-50%, -50%) rotate(-6deg) scale(${big ? 3.4 : 2})`, opacity: 0, filter: 'blur(8px)' },
        { transform: 'translate(-50%, -50%) rotate(-6deg) scale(0.94)', opacity: 1, filter: 'blur(0)', offset: 0.22 },
        { transform: 'translate(-50%, -50%) rotate(-6deg) scale(1)', opacity: 1, offset: 0.3 },
        { transform: 'translate(-50%, -50%) rotate(-6deg) scale(1)', opacity: 1, offset: 0.82 },
        { transform: 'translate(-50%, -50%) rotate(-6deg) scale(1.06)', opacity: 0 }
      ],
      { duration: big ? 1100 : 900, easing: 'linear' }
    ).then(() => box.remove());
  }

  /* ---------------------------------------------------------------- *
   * 11. ABILITY CUT-IN
   * ---------------------------------------------------------------- */

  /**
   * An ability, named. `avoid` is world points the panel must stay clear of
   * (from review: never over the cue ball or the ball nearest it, nor the
   * line the cue ball is about to run): it takes the top, the bottom or the
   * middle of the table, whichever is clear, and else the one with the most
   * room.
   */
  cutIn({ name, line, color = ICE, icon = 'freeze', avoid = [] }) {
    const style = this.on('cutin');
    if (!style) return Promise.resolve();
    const box = el('div', `jc-cut ${style}`, this.root);
    box.style.setProperty('--c', color);
    const ic = el('div', 'jc-cut-icon', box);
    ic.innerHTML = ICONS[icon] || '';
    const words = el('div', 'jc-cut-words', box);
    el('b', '', words).textContent = name;
    if (line && style === 'panel') el('span', '', words).textContent = line;
    this._placeCut(box, style, avoid);
    const from = style === 'panel' ? 'translateX(110%) skewY(-5deg)' : 'translate(-50%, 140%)';
    const at = style === 'panel' ? 'translateX(0) skewY(-5deg)' : 'translate(-50%, 0)';
    const to = style === 'panel' ? 'translateX(-110%) skewY(-5deg)' : 'translate(-50%, 140%)';
    if (style === 'panel') this.anim(ic, [{ transform: 'rotate(-8deg) scale(0.4)' }, { transform: 'rotate(-8deg) scale(1)' }], { duration: 380, delay: 120, easing: BACK });
    return this.anim(box, [{ transform: from }, { transform: at }], { duration: 260, easing: OUT })
      .then(() => new Promise((r) => setTimeout(r, style === 'panel' ? 950 : 850)))
      .then(() => this.anim(box, [{ transform: at }, { transform: to }], { duration: 240, easing: IN }))
      .then(() => box.remove());
  }

  /** Put the cut-in where nothing it must not cover is (see cutIn). */
  _placeCut(box, style, avoid) {
    const t = this.tableRect();
    const h = box.getBoundingClientRect().height || (style === 'panel' ? 110 : 44);
    // a ball's radius on screen and a little air, plus what the panel's slant
    // adds at its ends
    const pad = 22 + (style === 'panel' ? 0.045 * (box.getBoundingClientRect().width || t.width) : 0);
    const ys = avoid.filter(Boolean).map((p) => this.toPx(p.x, p.z).y);
    const spots = [t.top + t.height * 0.04, t.top + t.height * 0.96 - h, t.top + (t.height - h) / 2];
    let best = spots[0];
    let bestRoom = -Infinity;
    for (const top of spots) {
      const room = ys.length ? Math.min(...ys.map((y) => (y < top ? top - y : y > top + h ? y - top - h : -1))) : Infinity;
      if (room >= pad) {
        best = top;
        break;
      }
      if (room > bestRoom) {
        bestRoom = room;
        best = top;
      }
    }
    box.style.top = `${Math.round(best)}px`;
    box.style.bottom = 'auto';
  }

  /* ---------------------------------------------------------------- *
   * 12. FINISH SCREEN
   * ---------------------------------------------------------------- */

  /**
   * The last ball down, before the result. `lines` are what the clear earned
   * ({ kicker, title, sub }: an achievement, an unlock): CLEAR! moves up to
   * make room and each is stamped in under it, one after another, so the slam
   * never covers them (review).
   */
  finish({ title = 'Clear!', sub = '', lines = [] } = {}) {
    const style = this.on('finish');
    if (!style) return Promise.resolve();
    const box = el('div', `jc-finish ${style}${lines.length ? ' has-lines' : ''}`, this.root);
    if (style === 'bands') {
      for (let i = 0; i < 4; i++) {
        const s = el('i', `s${i}`, box);
        this.anim(s, [{ transform: 'translateX(-120%) skewX(-24deg)' }, { transform: 'translateX(0) skewX(-24deg)' }], { duration: 300, delay: 40 * i, easing: OUT });
      }
    } else {
      this.anim(box, [{ background: 'rgba(2,5,11,0)' }, { background: 'rgba(2,5,11,0.55)' }], { duration: 200 });
    }
    const word = el('b', 'jc-finish-word', box);
    word.textContent = title;
    const plate = sub ? el('span', 'jc-finish-sub', box) : null;
    if (plate) plate.textContent = sub;
    this.flash(0.85, 180);
    const w = this.anim(
      word,
      [
        { transform: 'translate(-50%, -50%) rotate(-7deg) scale(3.2)', opacity: 0, filter: 'blur(10px)' },
        { transform: 'translate(-50%, -50%) rotate(-7deg) scale(0.92)', opacity: 1, filter: 'blur(0)', offset: 0.6 },
        { transform: 'translate(-50%, -50%) rotate(-7deg) scale(1)', opacity: 1 }
      ],
      { duration: 360, delay: style === 'bands' ? 180 : 60, easing: 'ease-out' }
    );
    if (plate) this.anim(plate, [{ transform: 'translate(-50%, 0) rotate(-7deg) translateX(-60px)', opacity: 0 }, { transform: 'translate(-50%, 0) rotate(-7deg)', opacity: 1 }], { duration: 260, delay: style === 'bands' ? 520 : 400, easing: OUT });
    const list = lines.length ? el('div', 'jc-finish-lines', box) : null;
    const first = (style === 'bands' ? 520 : 400) + 340;
    lines.slice(0, 3).forEach((ln, i) => {
      const card = el('div', 'jc-finish-line', list);
      if (ln.kicker) el('small', '', card).textContent = ln.kicker;
      el('b', '', card).textContent = ln.title;
      if (ln.sub) el('span', '', card).textContent = ln.sub;
      this.anim(
        card,
        [
          { transform: 'scale(1.9) rotate(-3deg)', opacity: 0 },
          { transform: 'scale(0.96) rotate(-3deg)', opacity: 1, offset: 0.7 },
          { transform: 'scale(1) rotate(-3deg)', opacity: 1 }
        ],
        { duration: 300, delay: first + 520 * i, easing: 'ease-out' }
      );
    });
    // long enough to read each line once it lands
    const hold = (style === 'bands' ? 950 : 750) + Math.min(3, lines.length) * 900;
    return w
      .then(() => new Promise((r) => setTimeout(r, hold)))
      .then(() => this.anim(box, [{ opacity: 1 }, { opacity: 0 }], { duration: 260 }))
      .then(() => box.remove());
  }

  /* ---------------------------------------------------------------- *
   * frame
   * ---------------------------------------------------------------- */

  /** @param {number} dt game time  @param {number} rawDt real time */
  update(dt, rawDt, { cue, now }) {
    this._updateBlast(rawDt, dt);
    this._updateTrail(dt, cue);
    this._updateCharge(now);
    this._updateCamera(rawDt);
    if (this.tintEl) {
      const r = this.tableRect();
      Object.assign(this.tintEl.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    }
  }
}

const ICONS = {
  curve: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 40c0-17 12-27 28-27" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/><path d="M30 6l9 7-9 7" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  bomb: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="21" cy="28" r="14" fill="currentColor"/><path d="M30 16l6-6M36 10l3-3M38 15l4-1M33 6l1-4" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg>',
  freeze: '<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M24 4v40M6.7 14l34.6 20M6.7 34l34.6-20"/><path d="M18 8l6 5 6-5M18 40l6-5 6 5M5 21l8 0-2 7M43 27l-8 0 2-7M9 37l3-8 6 1M39 11l-3 8-6-1"/></g></svg>'
};
