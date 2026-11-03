/**
 * Juice.js — the big-moment layer (review: "juice ideas", batch 1).
 *
 * Twelve effects drawn from the reference clips, each with versions to compare
 * in review, chosen in `lightline-juice-v1` (localStorage, a {key: version}
 * map; 'off' turns one off). Comic style in the clips, drawn in light here:
 * cyan lines, scanlines for halftone, glowing bands.
 *
 *   strike     the strike burst: lines out of the cue ball      lines | flash
 *   trail      behind a hard shot                               streak | sparks
 *   beam       a ball dropping                                  pillar | rings
 *   charge     pulling back for power                           rails | pulse
 *   tint       the table while an ability plays                 scan | dots
 *   push       the camera while pulling back                    push | lean
 *   pull       the camera on a full-power shot                  swoop | out
 *   follow     the camera on the last ball                      drift | punch
 *   banner     a table's rule                                   band | bandOnly
 *   slam       full power, said                                 big | small
 *   cutin      an ability, named                                panel | strip
 *   finish     the last ball down, before the result            bands | slam
 *
 * Everything here is presentation: it never changes a shot, the aim or the
 * score. DOM effects run on WAAPI (so a capture can step them); camera moves
 * go through `engine.view`, eased here on real time.
 */

import * as THREE from 'three';

const KEY = 'lightline-juice-v1';
export const JUICE_OPTIONS = {
  strike: ['lines', 'flash'],
  trail: ['streak', 'sparks'],
  beam: ['pillar', 'rings'],
  charge: ['rails', 'pulse'],
  tint: ['scan', 'dots'],
  push: ['push', 'lean'],
  pull: ['swoop', 'out'],
  follow: ['drift', 'punch'],
  banner: ['band', 'bandOnly'],
  slam: ['big', 'small'],
  cutin: ['panel', 'strip'],
  finish: ['bands', 'slam']
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
    for (const [k, opts] of Object.entries(JUICE_OPTIONS)) this.settings[k] = saved[k] === 'off' || opts.includes(saved[k]) ? saved[k] : opts[0];
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
    const style = this.on('strike');
    if (!style || this.reducedMotion) return;
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
      this.fx.shockwave(x, z, color, 4 + 3 * power, 0.35);
    }
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

  /** An ability's shot: the table goes into its color until the stroke ends. */
  tint(on, color = ICE) {
    const style = this.on('tint');
    if (on && style) {
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

  /** The last ball drops: the view goes to its pocket and stays for the clear. */
  followLast({ x, z }) {
    const style = this.on('follow');
    if (!style || this.reducedMotion) return;
    this.timeline = null;
    if (style === 'drift') this.hold = { x: x * 0.55, z: z * 0.55, zoom: 1.22, rate: 3.2 };
    else {
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

  /** Back to the plain top-down view (a table ends, a menu opens). */
  release() {
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

  cutIn({ name, line, color = ICE, icon = 'freeze' }) {
    const style = this.on('cutin');
    if (!style) return Promise.resolve();
    const box = el('div', `jc-cut ${style}`, this.root);
    box.style.setProperty('--c', color);
    const ic = el('div', 'jc-cut-icon', box);
    ic.innerHTML = ICONS[icon] || '';
    const words = el('div', 'jc-cut-words', box);
    el('b', '', words).textContent = name;
    if (line && style === 'panel') el('span', '', words).textContent = line;
    const from = style === 'panel' ? 'translateX(110%) skewY(-5deg)' : 'translate(-50%, 140%)';
    const at = style === 'panel' ? 'translateX(0) skewY(-5deg)' : 'translate(-50%, 0)';
    const to = style === 'panel' ? 'translateX(-110%) skewY(-5deg)' : 'translate(-50%, 140%)';
    if (style === 'panel') this.anim(ic, [{ transform: 'rotate(-8deg) scale(0.4)' }, { transform: 'rotate(-8deg) scale(1)' }], { duration: 380, delay: 120, easing: BACK });
    return this.anim(box, [{ transform: from }, { transform: at }], { duration: 260, easing: OUT })
      .then(() => new Promise((r) => setTimeout(r, style === 'panel' ? 950 : 850)))
      .then(() => this.anim(box, [{ transform: at }, { transform: to }], { duration: 240, easing: IN }))
      .then(() => box.remove());
  }

  /* ---------------------------------------------------------------- *
   * 12. FINISH SCREEN
   * ---------------------------------------------------------------- */

  finish({ title = 'Clear!', sub = '' } = {}) {
    const style = this.on('finish');
    if (!style) return Promise.resolve();
    const box = el('div', `jc-finish ${style}`, this.root);
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
    return w
      .then(() => new Promise((r) => setTimeout(r, style === 'bands' ? 950 : 750)))
      .then(() => this.anim(box, [{ opacity: 1 }, { opacity: 0 }], { duration: 260 }))
      .then(() => box.remove());
  }

  /* ---------------------------------------------------------------- *
   * frame
   * ---------------------------------------------------------------- */

  /** @param {number} dt game time  @param {number} rawDt real time */
  update(dt, rawDt, { cue, now }) {
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
  freeze: '<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M24 4v40M6.7 14l34.6 20M6.7 34l34.6-20"/><path d="M18 8l6 5 6-5M18 40l6-5 6 5M5 21l8 0-2 7M43 27l-8 0 2-7M9 37l3-8 6 1M39 11l-3 8-6-1"/></g></svg>'
};
