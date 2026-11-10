/**
 * Polish.js — the polish plan's prototypes (docs/POLISH_PLAN.md), each behind
 * a switch in the manner of Juice.js and OFF until it is approved in review.
 *
 * Chosen in `lightline-polish-v1` (localStorage, a {key: version} map), or
 * from the console / a capture with `window.__polish(key, version)`.
 *
 *   rail      a rail hit: light runs along the cushion             run
 *   pocket    a ball drops: the mouth gulps it                     gulp
 *   contact   cue ball meets a ball: a snap of sparks, a held beat snap
 *   rack      a table opens: the balls rez in, by number           rez
 *   idle      nothing happening: the table stays alive             breathe
 *   target    the score passes the target mid-table                beat
 *   menu      the home screen boots; panels arrive; buttons dip    boot
 *   flash     the full-power strike: light from the ball, no whiteout  soft
 *
 * Everything here is presentation. Nothing changes a shot, the aim preview or
 * the score. DOM effects run on WAAPI (so a capture can step them).
 */

const KEY = 'lightline-polish-v1';
export const POLISH_OPTIONS = {
  rail: ['run'],
  pocket: ['gulp'],
  contact: ['snap'],
  rack: ['rez'],
  idle: ['breathe'],
  target: ['beat'],
  menu: ['boot'],
  flash: ['soft']
};
/** Nothing is on until the review approves it. */
export const POLISH_DEFAULTS = {
  rail: 'off',
  pocket: 'off',
  contact: 'off',
  rack: 'off',
  idle: 'off',
  target: 'off',
  menu: 'off',
  flash: 'off'
};

const CYAN = '#22e8ff';
const ORANGE = '#ff8a1e';
const HOT = '#ffc266';
const LIT = '#3a87a8';
const INK = '#e9f8ff';
const DRAW = 'cubic-bezier(0.16, 1, 0.3, 1)';
const POP = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const SLAM = 'cubic-bezier(0.7, 0, 0.84, 0)';

const CSS = `
.polish { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 6; }
.polish i, .polish b { position: absolute; display: block; pointer-events: none; }
.po-rail { height: 4px; margin-top: -2px; transform-origin: 50% 50%; border-radius: 0; mix-blend-mode: screen; }
.po-rail.v { width: 4px; height: auto; margin-top: 0; margin-left: -2px; }
.po-ring { border-radius: 50%; border: 2px solid currentColor; box-shadow: 0 0 10px currentColor, inset 0 0 8px currentColor; transform: translate(-50%, -50%); mix-blend-mode: screen; }
.po-disc { border-radius: 50%; transform: translate(-50%, -50%); mix-blend-mode: screen; }
.po-tick { height: 2px; margin-top: -1px; transform-origin: 0 50%; background: currentColor; box-shadow: 0 0 6px currentColor; mix-blend-mode: screen; }
.po-beam { width: 2px; margin-left: -1px; background: linear-gradient(180deg, transparent, currentColor 70%, #fff); box-shadow: 0 0 8px currentColor; transform-origin: 50% 100%; mix-blend-mode: screen; }
.po-glint { width: 84px; height: 4px; margin: -2px 0 0 -84px; background: linear-gradient(90deg, transparent, ${LIT} 45%, ${CYAN} 85%, #fff); box-shadow: 0 0 12px 1px ${CYAN}; mix-blend-mode: screen; opacity: 0; transform-origin: 100% 50%; }
.po-chip { font: 700 11px/1 Orbitron, sans-serif; letter-spacing: 0.16em; text-transform: uppercase; color: #02050b; background: ${CYAN}; padding: 6px 9px 5px; transform: translate(-50%, 0); clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px); white-space: nowrap; }
.po-sweep { background: linear-gradient(90deg, transparent, #fff, transparent); mix-blend-mode: screen; }
.po-under { height: 2px; background: linear-gradient(90deg, transparent, ${CYAN} 20%, ${INK} 50%, ${CYAN} 80%, transparent); box-shadow: 0 0 12px ${CYAN}; transform-origin: 50% 50%; }
`;

const el = (tag, cls, parent) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (parent) parent.appendChild(n);
  return n;
};

export class Polish {
  /**
   * @param {{ layer: HTMLElement, toPx: (x:number,z:number)=>{x:number,y:number}, arena: {width:number,height:number}, engine: any, audio?: any, reducedMotion?: boolean }} o
   */
  constructor({ layer, toPx, arena, engine, audio, reducedMotion }) {
    this.layer = layer;
    this.toPx = toPx;
    this.arena = arena;
    this.engine = engine;
    this.audio = audio;
    this.reducedMotion = !!reducedMotion;
    if (!document.getElementById('polish-css')) {
      const s = el('style', '', document.head);
      s.id = 'polish-css';
      s.textContent = CSS;
    }
    this.root = el('div', 'polish', layer);
    this.settings = {};
    this.load();
    this.idleT = 0;
    this.idleN = 0;
    this.rezzing = [];
    this._pressBound = false;
    this._bindPress();
  }

  load() {
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {};
    } catch {
      saved = {};
    }
    for (const [k, opts] of Object.entries(POLISH_OPTIONS)) this.settings[k] = opts.includes(saved[k]) ? saved[k] : POLISH_DEFAULTS[k];
  }

  /** Which version of `key` is on, or null when it is off. */
  on(key) {
    const v = this.settings[key];
    return v && v !== 'off' && !this.reducedMotion ? v : null;
  }

  set(key, value) {
    if (!(key in POLISH_OPTIONS)) return this.settings;
    this.settings[key] = value === 'off' || POLISH_OPTIONS[key].includes(value) ? value : POLISH_DEFAULTS[key];
    try {
      localStorage.setItem(KEY, JSON.stringify(this.settings));
    } catch {
      /* private mode */
    }
    return this.settings;
  }

  anim(node, frames, opts) {
    if (!node.animate) return Promise.resolve();
    return node.animate(frames, { fill: 'both', ...opts }).finished.catch(() => {});
  }

  _gone(node, ms) {
    setTimeout(() => node.remove(), ms);
  }

  /* ---------------------------------------------------------------- *
   * RAIL: the cushion flashes where it was hit, then light runs along it
   * both ways (bible §11: "the rail flashes, then a mult light runs along
   * it"). Orange for the cue ball, whose rails feed Mult; structure light
   * for any other ball.
   * ---------------------------------------------------------------- */
  rail({ x, z, nx = 0, nz = 0, speed = 12, pays = false }) {
    if (!this.on('rail')) return;
    const hw = this.arena.width / 2;
    const hh = this.arena.height / 2;
    const vertical = Math.abs(nx) > Math.abs(nz);
    // snap to the cushion's face
    const rx = vertical ? (x > 0 ? hw : -hw) : x;
    const rz = vertical ? z : z > 0 ? hh : -hh;
    // only a real rail: a bumper or a wall block in the middle has no cushion to run along
    if (vertical ? Math.abs(Math.abs(x) - hw) > 1.2 : Math.abs(Math.abs(z) - hh) > 1.2) return;
    const p = this.toPx(rx, rz);
    const k = Math.min(1, Math.max(0.3, speed / 30));
    const unit = Math.abs(this.toPx(1, 0).x - this.toPx(0, 0).x);
    const reach = unit * (5 + 11 * k);
    const color = pays ? ORANGE : LIT;
    const hot = pays ? HOT : INK;
    const ms = 420 + 380 * k;
    for (const dir of [-1, 1]) {
      const bar = el('i', `po-rail${vertical ? ' v' : ''}`, this.root);
      // bright at the running head, fading back to where it was hit
      bar.style.background = `linear-gradient(${vertical ? (dir > 0 ? 0 : 180) : dir > 0 ? 270 : 90}deg, #fff, ${hot} 12%, ${color} 40%, transparent)`;
      bar.style.boxShadow = `0 0 14px 1px ${color}`;
      const grow = [{ transform: vertical ? 'scaleY(0.03)' : 'scaleX(0.03)', opacity: 1 }, { transform: vertical ? 'scaleY(1)' : 'scaleX(1)', opacity: 1, offset: 0.55 }, { transform: vertical ? 'scaleY(1)' : 'scaleX(1)', opacity: 0 }];
      if (vertical) {
        bar.style.left = `${p.x}px`;
        bar.style.height = `${reach}px`;
        bar.style.top = `${dir > 0 ? p.y : p.y - reach}px`;
        bar.style.transformOrigin = dir > 0 ? '50% 0' : '50% 100%';
      } else {
        bar.style.top = `${p.y}px`;
        bar.style.width = `${reach}px`;
        bar.style.left = `${dir > 0 ? p.x : p.x - reach}px`;
        bar.style.transformOrigin = dir > 0 ? '0 50%' : '100% 50%';
      }
      this.anim(bar, grow, { duration: ms, easing: DRAW });
      this._gone(bar, ms + 60);
    }
    // the flash at the point of contact
    const dot = el('i', 'po-disc', this.root);
    dot.style.left = `${p.x}px`;
    dot.style.top = `${p.y}px`;
    dot.style.width = dot.style.height = `${unit * (2 + 2 * k)}px`;
    dot.style.background = `radial-gradient(circle, #fff 0%, ${color} 40%, transparent 70%)`;
    this.anim(dot, [{ transform: 'translate(-50%,-50%) scale(0.4)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(1.5)', opacity: 0 }], { duration: 260, easing: DRAW });
    this._gone(dot, 300);
  }

  /* ---------------------------------------------------------------- *
   * POCKET: the mouth gulps. A ring in the ball's ink closes on the
   * pocket as the ball falls, the mouth flashes, a ring goes out, and
   * ticks of light chase round the lip.
   * ---------------------------------------------------------------- */
  pocket({ x, z, radius = 1.2, color = INK, last = false }) {
    if (!this.on('pocket')) return;
    const p = this.toPx(x, z);
    const unit = Math.abs(this.toPx(1, 0).x - this.toPx(0, 0).x);
    const r = radius * unit;
    const mk = (cls) => {
      const n = el('i', cls, this.root);
      n.style.left = `${p.x}px`;
      n.style.top = `${p.y}px`;
      n.style.color = color;
      return n;
    };
    // 1. the gulp: a ring closing on the mouth
    const inn = mk('po-ring');
    inn.style.width = inn.style.height = `${r * 2}px`;
    inn.style.borderWidth = '3px';
    this.anim(inn, [{ transform: 'translate(-50%,-50%) scale(4.2)', opacity: 0 }, { opacity: 1, offset: 0.35 }, { transform: 'translate(-50%,-50%) scale(0.6)', opacity: 1 }], { duration: 240, easing: SLAM });
    this._gone(inn, 250);
    // 2. the mouth flashes
    const disc = mk('po-disc');
    disc.style.width = disc.style.height = `${r * 4.4}px`;
    disc.style.background = `radial-gradient(circle, #fff 0%, ${color} 30%, transparent 68%)`;
    this.anim(disc, [{ transform: 'translate(-50%,-50%) scale(0.3)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 1, offset: 0.2 }, { transform: 'translate(-50%,-50%) scale(1.3)', opacity: 0 }], { duration: 420, delay: 220, easing: DRAW });
    this._gone(disc, 700);
    // 3. two rings go out
    for (const [d, to] of [[230, last ? 5.5 : 3.8], [330, last ? 4 : 2.6]]) {
      const out = mk('po-ring');
      out.style.width = out.style.height = `${r * 2}px`;
      this.anim(out, [{ transform: 'translate(-50%,-50%) scale(0.7)', opacity: 1 }, { transform: `translate(-50%,-50%) scale(${to})`, opacity: 0 }], { duration: last ? 800 : 560, delay: d, easing: DRAW });
      this._gone(out, 1200);
    }
    // 4. ticks chase round the lip
    const n = last ? 12 : 8;
    const spin = el('i', '', this.root);
    spin.style.left = `${p.x}px`;
    spin.style.top = `${p.y}px`;
    for (let i = 0; i < n; i++) {
      const t = el('i', 'po-tick', spin);
      t.style.color = i % 2 ? color : '#fff';
      t.style.width = `${r * 0.8}px`;
      t.style.height = '3px';
      t.style.transform = `rotate(${(i / n) * 360}deg) translateX(${r * 1.25}px)`;
    }
    this.anim(spin, [{ transform: 'rotate(0deg) scale(0.8)', opacity: 0 }, { opacity: 1, offset: 0.15 }, { transform: 'rotate(200deg) scale(1.7)', opacity: 0 }], { duration: 760, delay: 220, easing: DRAW });
    this._gone(spin, 1000);
  }

  /* ---------------------------------------------------------------- *
   * CONTACT: the cue ball meets a ball. A fan of sparks thrown across the
   * line of the hit, a ring off the struck ball in its own ink, and on a
   * hard hit the table holds for a beat (a hit-stop: time only, no physics).
   * ---------------------------------------------------------------- */
  contact({ x, z, dirX = 0, dirZ = -1, intensity = 0.5, color = INK }) {
    if (!this.on('contact')) return;
    const p = this.toPx(x, z);
    const i = Math.min(1, Math.max(0, intensity));
    if (i > 0.3) this.engine?.hitStop?.(0.018 + 0.04 * i);
    const along = Math.atan2(dirZ, dirX);
    const box = el('i', '', this.root);
    box.style.left = `${p.x}px`;
    box.style.top = `${p.y}px`;
    const n = Math.round(4 + 6 * i);
    for (let k = 0; k < n; k++) {
      // thrown to both sides of the hit, never back along the shot
      const side = k % 2 ? 1 : -1;
      const a = along + side * (Math.PI / 2 - 0.15 + (Math.random() - 0.5) * 0.9) + (Math.random() - 0.5) * 0.3;
      const len = (16 + 34 * i) * (0.5 + Math.random() * 0.7);
      const t = el('i', 'po-tick', box);
      t.style.color = k % 3 ? color : '#fff';
      t.style.width = `${len}px`;
      t.style.height = '2.5px';
      const deg = (a * 180) / Math.PI;
      this.anim(t, [{ transform: `rotate(${deg}deg) translateX(3px) scaleX(0.2)`, opacity: 1 }, { transform: `rotate(${deg}deg) translateX(${8 + 14 * i}px) scaleX(1)`, opacity: 1, offset: 0.4 }, { transform: `rotate(${deg}deg) translateX(${18 + 30 * i}px) scaleX(0.2)`, opacity: 0 }], { duration: 180 + 140 * i, easing: DRAW });
    }
    const ring = el('i', 'po-ring', box);
    ring.style.color = color;
    ring.style.width = ring.style.height = `${20 + 14 * i}px`;
    ring.style.borderWidth = '2.5px';
    this.anim(ring, [{ transform: 'translate(-50%,-50%) scale(0.5)', opacity: 1 }, { transform: `translate(-50%,-50%) scale(${1.6 + 1.2 * i})`, opacity: 0 }], { duration: 240, easing: DRAW });
    this._gone(box, 420);
  }

  /* ---------------------------------------------------------------- *
   * RACK: a table opens and its balls rez in, lowest number first: a beam
   * drops on the spot, a ring closes, the ball pops up to size (bible §11:
   * "balls flicker up"). The balls are on the table for the physics and the
   * aim line from the start; only their drawing waits.
   * ---------------------------------------------------------------- */
  rack(balls, { delay = 0, ink = () => INK } = {}) {
    if (!this.on('rack')) return 0;
    this.rezzing.length = 0;
    const list = balls.filter((b) => b.alive && b.group).sort((a, b) => (a.number || 0) - (b.number || 0));
    const step = 0.11;
    list.forEach((ball, i) => {
      ball.group.scale.setScalar(0.001);
      this.rezzing.push({ ball, i, at: delay + i * step, t: 0, shown: false, color: ink(ball) });
    });
    return delay + list.length * step + 0.3;
  }

  _updateRack(rawDt) {
    if (!this.rezzing.length) return;
    for (let i = this.rezzing.length - 1; i >= 0; i--) {
      const r = this.rezzing[i];
      r.t += rawDt;
      const k = (r.t - r.at) / 0.26;
      if (!r.ball.alive || !r.ball.group) {
        this.rezzing.splice(i, 1);
        continue;
      }
      if (k <= 0) continue;
      if (!r.shown) {
        r.shown = true;
        this._rezFx(r.ball, r.color, r.i);
      }
      // overshoot, then settle (ease-pop)
      const c = 2.2;
      const e = 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2);
      r.ball.group.scale.setScalar(Math.max(0.001, e));
      if (k >= 1) {
        r.ball.group.scale.setScalar(1);
        this.rezzing.splice(i, 1);
      }
    }
  }

  _rezFx(ball, color, index) {
    const p = this.toPx(ball.x, ball.z);
    const beam = el('i', 'po-beam', this.root);
    beam.style.color = color;
    beam.style.left = `${p.x}px`;
    beam.style.top = `${p.y - 150}px`;
    beam.style.height = '150px';
    this.anim(beam, [{ transform: 'scaleY(0)', opacity: 1, transformOrigin: '50% 0' }, { transform: 'scaleY(1)', opacity: 1, offset: 0.4, transformOrigin: '50% 0' }, { transform: 'scaleY(0.05)', opacity: 0, transformOrigin: '50% 100%' }], { duration: 260, easing: DRAW });
    this._gone(beam, 300);
    const ring = el('i', 'po-ring', this.root);
    ring.style.color = color;
    ring.style.left = `${p.x}px`;
    ring.style.top = `${p.y}px`;
    ring.style.width = ring.style.height = '22px';
    this.anim(ring, [{ transform: 'translate(-50%,-50%) scale(2.4)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(0.9)', opacity: 1, offset: 0.6 }, { transform: 'translate(-50%,-50%) scale(1.5)', opacity: 0 }], { duration: 340, delay: 60, easing: DRAW });
    this._gone(ring, 420);
    this.audio?.rezTick?.(index);
  }

  /* ---------------------------------------------------------------- *
   * IDLE: when nothing is happening the table is still alive. Every few
   * seconds a glint runs a lap of the rails and the cue ball lets a slow
   * ring go. Both at rest brightness (glow-1), never over an aim.
   * ---------------------------------------------------------------- */
  _updateIdle(rawDt, { resting, cue }) {
    if (!this.on('idle') || !resting) {
      this.idleT = 0;
      return;
    }
    this.idleT += rawDt;
    const due = 2.2 + this.idleN * 4.6;
    if (this.idleT < due) return;
    this.idleN++;
    if (this.idleT > due + 1) {
      // came back from a long pause: start the rhythm over
      this.idleT = 0;
      this.idleN = 0;
      return;
    }
    this._cuePing(cue);
    this._lap(this.idleN % 2 === 0);
  }

  idleReset() {
    this.idleT = 0;
    this.idleN = 0;
  }

  _cuePing(cue) {
    if (!cue) return;
    const p = this.toPx(cue.x, cue.z);
    for (const d of [0, 420]) {
      const ring = el('i', 'po-ring', this.root);
      ring.style.color = CYAN;
      ring.style.borderWidth = '2px';
      ring.style.left = `${p.x}px`;
      ring.style.top = `${p.y}px`;
      ring.style.width = ring.style.height = '22px';
      this.anim(ring, [{ transform: 'translate(-50%,-50%) scale(0.9)', opacity: 0 }, { opacity: 0.9, offset: 0.12 }, { transform: 'translate(-50%,-50%) scale(4.2)', opacity: 0 }], { duration: 1500, delay: d, easing: 'cubic-bezier(0.2, 0.6, 0.3, 1)' });
      this._gone(ring, 2000);
    }
  }

  _lap(clockwise) {
    const hw = this.arena.width / 2;
    const hh = this.arena.height / 2;
    const c = [this.toPx(-hw, hh), this.toPx(-hw, -hh), this.toPx(hw, -hh), this.toPx(hw, hh)];
    if (!clockwise) c.reverse();
    // two glints leave the bottom middle and meet at the top, as the Boot's light-cycles do
    const mid = { x: (c[0].x + c[3].x) / 2, y: c[0].y };
    const top = { x: mid.x, y: c[1].y };
    const paths = [
      [mid, c[0], c[1], top],
      [mid, c[3], c[2], top]
    ];
    for (const path of paths) {
      const g = el('i', 'po-glint', this.root);
      let total = 0;
      const legs = [];
      for (let i = 1; i < path.length; i++) {
        const len = Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
        legs.push(len);
        total += len;
      }
      const frames = [];
      let acc = 0;
      for (let i = 0; i < path.length; i++) {
        const next = path[Math.min(i + 1, path.length - 1)];
        const prev = path[Math.max(i - 1, 0)];
        const a0 = Math.atan2(path[i].y - prev.y, path[i].x - prev.x);
        const a1 = Math.atan2(next.y - path[i].y, next.x - path[i].x);
        const off = acc / total;
        if (i > 0) frames.push({ transform: `translate(${path[i].x}px, ${path[i].y}px) rotate(${a0}rad)`, opacity: i === path.length - 1 ? 0 : 1, offset: Math.max(0, off - 0.001) });
        if (i < path.length - 1) frames.push({ transform: `translate(${path[i].x}px, ${path[i].y}px) rotate(${a1}rad)`, opacity: i === 0 ? 0 : 1, offset: off });
        acc += legs[i] || 0;
      }
      frames[1] && (frames[1].opacity = 1);
      this.anim(g, frames, { duration: 1700, easing: 'cubic-bezier(0.4, 0, 0.4, 1)' });
      this._gone(g, 1800);
    }
  }

  /* ---------------------------------------------------------------- *
   * TARGET: the table's score passes its target mid-table. Law 8: nothing
   * changes without being shown to change. The bar takes a sweep of white,
   * a ring leaves the tick, and a TARGET BEATEN chip pops under it.
   * ---------------------------------------------------------------- */
  targetBeaten(bar) {
    if (!this.on('target') || !bar) return;
    const host = this.layer.getBoundingClientRect();
    const r = bar.getBoundingClientRect();
    const x = r.left - host.left;
    const y = r.top - host.top;
    const sweep = el('i', 'po-sweep', this.root);
    sweep.style.left = `${x}px`;
    sweep.style.top = `${y - 3}px`;
    sweep.style.width = `${r.width * 0.5}px`;
    sweep.style.height = `${r.height + 6}px`;
    this.anim(sweep, [{ transform: `translateX(${-r.width * 0.5}px)`, opacity: 0 }, { opacity: 1, offset: 0.3 }, { transform: `translateX(${r.width}px)`, opacity: 0 }], { duration: 420, easing: DRAW });
    this._gone(sweep, 460);
    const ring = el('i', 'po-ring', this.root);
    ring.style.color = CYAN;
    ring.style.left = `${x + r.width}px`;
    ring.style.top = `${y + r.height / 2}px`;
    ring.style.width = ring.style.height = '14px';
    this.anim(ring, [{ transform: 'translate(-50%,-50%) scale(0.6)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(3.2)', opacity: 0 }], { duration: 480, delay: 220, easing: DRAW });
    this._gone(ring, 760);
    const chip = el('b', 'po-chip', this.root);
    chip.textContent = 'Target beaten';
    chip.style.left = `${x + r.width / 2}px`;
    // on the TARGET line itself, inside the top band: clear of the achievement plate under it
    chip.style.top = `${y + r.height + 2}px`;
    this.anim(chip, [{ transform: 'translate(-50%, -8px) scale(0.6)', opacity: 0 }, { transform: 'translate(-50%, 0) scale(1)', opacity: 1 }], { duration: 300, delay: 240, easing: POP }).then(() => this.anim(chip, [{ transform: 'translate(-50%, 0) scale(1)', opacity: 1 }, { transform: 'translate(-50%, -6px) scale(0.96)', opacity: 0 }], { duration: 220, delay: 1100, easing: 'ease-in' }).then(() => chip.remove()));
    setTimeout(() => this.audio?.targetBeaten?.(), 240);
  }

  /* ---------------------------------------------------------------- *
   * MENU: the home screen boots (the title's letters flicker on, a line of
   * light draws under it, the button rises); a panel's rows arrive one after
   * another; every button dips and flashes under the thumb.
   * ---------------------------------------------------------------- */
  menuPanel(panel, { home = false } = {}) {
    if (!this.on('menu') || !panel) return;
    const kids = [...panel.children].filter((n) => !n.hidden && n.offsetParent !== null);
    kids.forEach((n, i) => {
      if (home && n.classList.contains('menu-title')) return;
      this.anim(n, [{ transform: 'translateY(14px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 320, delay: (home ? 520 : 0) + i * 55, easing: DRAW }).then(() => n.getAnimations().forEach((a) => a.id === '' && a.effect?.getTiming().fill === 'both' && a.cancel()));
    });
    // a list's rows (the tables to replay) follow, a row at a time
    const rows = [...panel.querySelectorAll('.tp-row')].slice(0, 12);
    rows.forEach((n, i) => this.anim(n, [{ transform: 'translateX(-18px)', opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }], { duration: 260, delay: 140 + i * 32, easing: DRAW }).then(() => n.getAnimations().forEach((a) => a.cancel())));
    if (!home) return;
    const title = panel.querySelector('.menu-title');
    const ln = title?.querySelector('.ln');
    if (!ln) return;
    // the title is revealed left to right on the glitch steps, a letter's width at a time, flickering as it comes
    this.anim(ln, [{ clipPath: 'inset(-20% 100% -20% 0)' }, { clipPath: 'inset(-20% 0 -20% 0)' }], { duration: 460, delay: 60, easing: 'steps(9, end)' }).then(() => ln.getAnimations().forEach((a) => a.cancel()));
    this.anim(ln, [{ opacity: 1 }, { opacity: 0.35 }, { opacity: 1 }, { opacity: 0.6 }, { opacity: 1 }], { duration: 520, delay: 60, easing: 'steps(4, end)', fill: 'none' });
    let under = title.querySelector('.po-under');
    if (!under) {
      under = el('i', 'po-under', title);
      under.style.cssText += 'position:absolute;left:8%;right:8%;bottom:-6px;';
      if (getComputedStyle(title).position === 'static') title.style.position = 'relative';
    }
    this.anim(under, [{ transform: 'scaleX(0)', opacity: 1 }, { transform: 'scaleX(1)', opacity: 1, offset: 0.7 }, { transform: 'scaleX(1)', opacity: 0.35 }], { duration: 620, delay: 380, easing: DRAW });
  }

  _bindPress() {
    if (this._pressBound) return;
    this._pressBound = true;
    document.addEventListener(
      'pointerdown',
      (e) => {
        if (!this.on('menu')) return;
        const b = e.target?.closest?.('button, .tp-row.open, .mode-card');
        if (!b || b.disabled) return;
        this.anim(b, [{ transform: 'scale(1)', filter: 'brightness(1)' }, { transform: 'scale(0.955)', filter: 'brightness(1.9)', offset: 0.25 }, { transform: 'scale(1)', filter: 'brightness(1)' }], { duration: 220, easing: DRAW, fill: 'none' });
        this.audio?.uiTick?.();
      },
      true
    );
  }

  /* ---------------------------------------------------------------- *
   * FLASH: the full-power strike lights from the ball, not the whole
   * screen. (Changes a review pick: the full-screen flash.)
   * ---------------------------------------------------------------- */
  softFlash({ x, z }) {
    const p = this.toPx(x, z);
    const d = el('i', 'po-disc', this.root);
    d.style.left = `${p.x}px`;
    d.style.top = `${p.y}px`;
    d.style.width = d.style.height = '520px';
    d.style.background = `radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,194,102,0.55) 18%, rgba(255,138,30,0.22) 40%, transparent 68%)`;
    this.anim(d, [{ transform: 'translate(-50%,-50%) scale(0.25)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 0 }], { duration: 300, easing: DRAW });
    this._gone(d, 340);
  }

  update(rawDt, state) {
    this._updateRack(rawDt);
    this._updateIdle(rawDt, state);
  }
}
