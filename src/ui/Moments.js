/**
 * Moments.js — the four beats between shots that used to be a banner.
 *
 *   clear       the table is done: every shot's pay counts in, the total
 *               slams, flies into the run, and the next table is offered
 *   scratch     the cue ball went down: the shot is void, and the ball
 *               comes back
 *   freeze      Freeze frame: time stops mid-roll so the cue ball can be re-aimed
 *   transition  one table goes, the next one arrives
 *
 * Each has two treatments, picked in MOMENTS (config.js), so they can be
 * compared in the real game. All of it is DOM over the canvas, on real time
 * (setTimeout and WAAPI), so a hit-stop never stalls a moment.
 *
 * The rule every treatment follows: a moment says ONE thing, says it big, and
 * says what caused it. Nothing here is a sentence that scrolls past.
 */

import * as THREE from 'three';
import { MOMENTS, ARENA, TRAJECTORY } from '../config.js';

const el = (tag, cls, parent) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (parent) parent.appendChild(node);
  return node;
};
const SVG_NS = 'http://www.w3.org/2000/svg';
const svg = (tag, attrs, parent) => {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, v);
  if (parent) parent.appendChild(node);
  return node;
};
const fmt = (n) => Math.round(n).toLocaleString();
const BACK = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const IN = 'cubic-bezier(0.55, 0, 0.9, 0.4)';
const OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Swallow both ends of a tap, so an overlay never also starts an aim. */
function absorb(node, onTap) {
  for (const type of ['pointerdown', 'pointerup']) {
    node.addEventListener(type, (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (type === 'pointerdown' && onTap) onTap(event);
    });
  }
}

export class Moments {
  /**
   * @param {object} o
   * @param {HTMLElement} o.layer   #ui-layer
   * @param {HTMLCanvasElement} o.canvas
   * @param {THREE.Camera} o.camera
   * @param {object} o.audio
   * @param {object} o.engine
   * @param {object} o.hud
   */
  constructor({ layer, canvas, camera, audio, engine, hud }) {
    this.layer = layer;
    this.canvas = canvas;
    this.camera = camera;
    this.audio = audio;
    this.engine = engine;
    this.hud = hud;
    this.enabled = true;
    this.skip = false;
    this._v = new THREE.Vector3();
    this.root = el('div', 'moments', layer);
    this._clear = null;
    this._freeze = null;
    this._filters = {};
  }

  variant(kind) {
    return MOMENTS[kind];
  }

  /* -------------------------------------------------------------- *
   * helpers
   * -------------------------------------------------------------- */

  get W() {
    return this.layer.clientWidth;
  }

  get H() {
    return this.layer.clientHeight;
  }

  toPx(x, z) {
    const v = this._v.set(x, 0, z).project(this.camera);
    return { x: ((v.x + 1) / 2) * this.W, y: ((1 - v.y) / 2) * this.H };
  }

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, this.skip ? Math.min(ms, 24) : ms));
  }

  anim(node, frames, opts) {
    // 'both': a delayed animation holds its first frame while it waits, so
    // nothing shows, vanishes and then animates in.
    const a = node.animate(frames, { fill: 'both', ...opts });
    if (this.skip) a.playbackRate = 6;
    return a.finished.catch(() => {});
  }

  /** Count a node's number from `from` to `to`, ticking a note as it goes. */
  count(node, from, to, ms, { prefix = '', tick = null } = {}) {
    return new Promise((resolve) => {
      const t0 = performance.now();
      let lastTick = -1;
      const step = () => {
        const dur = this.skip ? Math.min(ms, 60) : ms;
        const u = Math.min(1, (performance.now() - t0) / Math.max(1, dur));
        const e = 1 - Math.pow(1 - u, 3);
        node.textContent = prefix + fmt(from + (to - from) * e);
        const k = Math.floor(u * 8);
        if (tick && k !== lastTick && u < 1) {
          lastTick = k;
          tick(k);
        }
        if (u < 1) requestAnimationFrame(step);
        else resolve();
      };
      step();
    });
  }

  /** A CSS filter on the canvas, layered by owner so moments can overlap. */
  setFilter(owner, value, ms = 220) {
    if (value) this._filters[owner] = value;
    else delete this._filters[owner];
    this.canvas.style.transition = `filter ${ms}ms ease`;
    this.canvas.style.filter = Object.values(this._filters).join(' ');
  }

  /** The RUN box in the top bar, in layer pixels. */
  runBox() {
    const node = this.hud.scoreValue;
    const r = node.getBoundingClientRect();
    const L = this.layer.getBoundingClientRect();
    return { node, x: r.left - L.left + r.width / 2, y: r.top - L.top + r.height / 2 };
  }

  /**
   * Fly a number into the RUN box. The box counts from what it showed to the
   * new run total as it lands, then `land` hands it back to the HUD.
   */
  async flyToRun(fromNode, value, land, runFrom = null, runTo = null) {
    const L = this.layer.getBoundingClientRect();
    const r = fromNode.getBoundingClientRect();
    const fly = el('div', 'mo-fly', this.root);
    fly.textContent = fmt(value);
    const x0 = r.left - L.left + r.width / 2;
    const y0 = r.top - L.top + r.height / 2;
    const to = this.runBox();
    fly.style.left = `${x0}px`;
    fly.style.top = `${y0}px`;
    fly.style.fontSize = getComputedStyle(fromNode).fontSize;
    fromNode.style.visibility = 'hidden';
    this.audio.slingshot?.(0.4);
    await this.anim(
      fly,
      [
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${(to.x - x0) * 0.3}px), calc(-50% + ${(to.y - y0) * 0.1 - 30}px)) scale(1.1)`, opacity: 1, offset: 0.3 },
        { transform: `translate(calc(-50% + ${to.x - x0}px), calc(-50% + ${to.y - y0}px)) scale(0.32)`, opacity: 0.9 }
      ],
      { duration: 460, easing: IN }
    );
    fly.remove();
    this.audio.scoreLock?.();
    this.engine.shake?.(5);
    // what just landed, pinned under the run total for a moment
    const plate = el('div', 'sf-plate pts mo-landed', this.root);
    el('b', '', plate).textContent = `+${fmt(value)}`;
    el('small', '', plate).textContent = 'Banked';
    plate.style.left = `${Math.min(to.x, this.W - 60)}px`;
    plate.style.top = `${to.y + 42}px`;
    this.anim(plate, [
      { transform: 'translate(-50%, -50%) scale(0.2)', opacity: 0 },
      { transform: 'translate(-50%, -50%) scale(1.25)', opacity: 1, offset: 0.25 },
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 1, offset: 0.4 },
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 1, offset: 0.85 },
      { transform: 'translate(-50%, -80%) scale(0.95)', opacity: 0 }
    ], { duration: 1400, easing: OUT }).then(() => plate.remove());
    if (runFrom != null && runTo != null && runTo !== runFrom) {
      this.count(to.node, runFrom, runTo, 420).then(() => land?.());
    } else {
      land?.();
    }
    to.node.animate(
      [
        { transform: 'scale(1.9)', textShadow: '0 0 18px #22e8ff, 0 0 40px #22e8ff' },
        { transform: 'scale(1)', textShadow: '0 0 0 transparent' }
      ],
      { duration: 520, easing: OUT }
    );
    const ring = el('div', 'mo-ring', this.root);
    ring.style.left = `${to.x}px`;
    ring.style.top = `${to.y}px`;
    this.anim(ring, [{ transform: 'translate(-50%,-50%) scale(0.3)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(2.4)', opacity: 0 }], { duration: 480, easing: OUT }).then(() => ring.remove());
  }

  /* -------------------------------------------------------------- *
   * CLEAR — the table is done
   * -------------------------------------------------------------- */

  /**
   * @param {object} d
   * @param {number} d.level
   * @param {boolean} d.filled
   * @param {{id:string,label:string,detail:string,amount:number}[]} d.ledger
   * @param {number} d.roomScore
   * @param {number} d.runScore
   * @param {{standing:number,damage:number}} [d.penalty]
   * @param {{name:string,detail:string,color:string,pick:Function}[]} d.choices
   * @param {Function} d.onRunLanded  release the HUD's held run total
   */
  async clear(d) {
    this.closeClear();
    this.skip = false;
    const id = {};
    this._clear = id;
    const live = () => this._clear === id;
    const style = this.variant('clear');
    const root = el('div', `mo-clear ${style}${d.filled ? '' : ' failed'}`, this.root);
    absorb(root, () => {
      if (!this._clearReady) this.skip = true;
    });
    this._clearReady = false;
    this._clearRoot = root;
    this.setFilter('clear', 'brightness(0.42) saturate(0.7)', 380);
    this.audio.roomClear?.();

    const rows = (d.ledger || []).map((e) => ({
      label: e.label,
      detail: e.detail || '',
      amount: e.amount,
      kind: e.id === 'stroke' ? 'shot' : 'bonus'
    }));
    if (d.penalty && d.penalty.standing > 0) {
      rows.push({ label: 'Balls left', detail: `${d.penalty.standing} still up`, amount: -d.penalty.damage, kind: 'bad', unit: 'hull' });
    }

    await this._clearLedger(root, d, rows, live);
    if (!live()) return;

    // NEXT TABLE. The choices arrive last, so nothing can be tapped before the
    // count has had its moment.
    this.skip = false;
    this._clearReady = true;
    const next = el('div', 'mo-next', root);
    el('div', 'mo-next-label', next).textContent = d.choices?.length > 1 ? 'Pick your next table' : 'Next table';
    const list = el('div', 'mo-choices', next);
    (d.choices || []).forEach((choice, i) => {
      const button = el('button', 'mo-choice', list);
      button.type = 'button';
      button.style.setProperty('--c', choice.color);
      el('span', 'mo-choice-name', button).textContent = choice.name;
      el('span', 'mo-choice-detail', button).textContent = choice.detail;
      el('span', 'mo-choice-go', button).textContent = '▸';
      absorb(button);
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!live()) return;
        button.classList.add('picked');
        choice.pick();
      });
      const from = 'translateY(18px)';
      this.anim(button, [{ transform: from, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 300, delay: 90 * i, easing: BACK });
    });
    // CASH IN: a Freeze frame charge for credits, under the exits.
    if (d.shop) this._shopButton(next, d.shop);
    this.anim(next, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
  }

  _shopButton(parent, shop) {
    const b = el('button', 'mo-buy', parent);
    b.type = 'button';
    const name = el('span', 'mo-buy-name', b);
    const detail = el('span', 'mo-buy-detail', b);
    const render = () => {
      const can = shop.canBuy();
      const charges = shop.charges();
      b.disabled = !can;
      name.textContent = '+1 Freeze frame';
      detail.textContent =
        charges >= shop.max
          ? 'Meter full'
          : charges > shop.max - 1
            ? 'No room for a whole one'
            : `${shop.price} credits · you have ${shop.credits()}`;
    };
    render();
    absorb(b);
    b.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!shop.buy()) return;
      render();
      this.anim(b, [{ transform: 'scale(1.06)', filter: 'brightness(1.6)' }, { transform: 'none', filter: 'none' }], { duration: 300, easing: OUT });
      this._pulseFreeze();
    });
    this.anim(b, [{ transform: 'translateY(18px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: BACK });
  }

  /** The Freeze frame meter in the HUD, in layer pixels. */
  _freezeMeter() {
    const node = this.hud.freezeRow;
    const r = node.getBoundingClientRect();
    const L = this.layer.getBoundingClientRect();
    return { node, x: r.left - L.left + r.width / 2, y: r.top - L.top + r.height / 2 };
  }

  _pulseFreeze() {
    const m = this._freezeMeter();
    m.node.animate([{ transform: 'scale(1.8)', filter: 'drop-shadow(0 0 10px #bff4ff)' }, { transform: 'scale(1)', filter: 'none' }], { duration: 480, easing: OUT });
    const ring = el('div', 'mo-ring ice', this.root);
    ring.style.left = `${m.x}px`;
    ring.style.top = `${m.y}px`;
    this.anim(ring, [{ transform: 'translate(-50%,-50%) scale(0.3)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(2.2)', opacity: 0 }], { duration: 460, easing: OUT }).then(() => ring.remove());
  }

  /**
   * FREEZE FRAME CHARGES EARNED: each one is an ice plate that pops above the
   * score boxes, says what earned it, and flies into the meter. One at a time.
   * @param {{amount:number, label:string}[]} awards
   */
  charges(awards) {
    this._chargeQ = (this._chargeQ || Promise.resolve()).then(async () => {
      for (const a of awards) {
        const plate = el('div', 'sf-plate mo-charge', this.root);
        el('b', '', plate).textContent = a.amount === 0.5 ? '+½' : `+${a.amount}`;
        el('small', '', plate).textContent = `Freeze frame · ${a.label}`;
        const x0 = this.W / 2;
        const y0 = this.H - 200;
        plate.style.left = `${x0}px`;
        plate.style.top = `${y0}px`;
        this.audio.scoreNote?.(10, 'points');
        await this.anim(plate, [
          { transform: 'translate(-50%,-50%) scale(0.2) rotate(-10deg)', opacity: 0 },
          { transform: 'translate(-50%,-50%) scale(1.25) rotate(4deg)', opacity: 1, offset: 0.6 },
          { transform: 'translate(-50%,-50%) scale(1) rotate(0deg)', opacity: 1 }
        ], { duration: 320, easing: OUT });
        await this.wait(520);
        const m = this._freezeMeter();
        await this.anim(plate, [
          { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
          { transform: `translate(calc(-50% + ${m.x - x0}px), calc(-50% + ${m.y - y0}px)) scale(0.35)`, opacity: 0.9 }
        ], { duration: 340, easing: IN });
        plate.remove();
        this.audio.shatter?.();
        this._pulseFreeze();
        await this.wait(160);
      }
    });
    return this._chargeQ;
  }

  closeClear() {
    this._clear = null;
    if (this._clearRoot) {
      const root = this._clearRoot;
      this._clearRoot = null;
      root.style.pointerEvents = 'none';
      this.anim(root, [{ opacity: 1 }, { opacity: 0 }], { duration: 180 }).then(() => root.remove());
    }
    this.setFilter('clear', null, 260);
  }

  /**
   * THE LEDGER. A scanline wipes up the table, then a receipt: every line
   * slams in and counts, then the total slams and flies into RUN.
   */
  async _clearLedger(root, d, rows, live) {
    // THE WIPE: a scanline sweeps up the table and dims it behind itself.
    const shade = el('div', 'mo-shade', root);
    const scan = el('div', 'mo-scan', root);
    this.audio.doorOpen?.();
    this.anim(shade, [{ height: '0%' }, { height: '100%' }], { duration: 520, easing: 'ease-in-out' });
    await this.anim(scan, [{ top: '100%', opacity: 1 }, { top: '0%', opacity: 1 }, { top: '0%', opacity: 0 }], { duration: 600, easing: 'ease-in-out' });
    scan.remove();

    const panel = el('div', 'mo-ledger', root);
    const head = el('div', 'mo-head', panel);
    const kicker = el('div', 'mo-kicker', head);
    kicker.textContent = d.filled ? 'Table clear' : 'Out of shots';
    el('div', 'mo-title', head).textContent = `Room ${String(d.level).padStart(2, '0')}`;
    const list = el('div', 'mo-rows', panel);
    const rule = el('div', 'mo-rule', panel);
    const total = el('div', 'mo-total', panel);
    el('span', 'k', total).textContent = 'Table';
    const totalV = el('span', 'v', total);
    totalV.textContent = '0';

    // panel and title arrive together, once each
    this.anim(kicker, [{ letterSpacing: '0.7em', opacity: 0, filter: 'blur(4px)' }, { letterSpacing: '0.16em', opacity: 1, filter: 'blur(0)' }], { duration: 420, delay: 120, easing: OUT });
    await this.anim(panel, [{ transform: 'translate(-50%, -40px) scale(1.08)', opacity: 0 }, { transform: 'translate(-50%, 0) scale(1)', opacity: 1 }], { duration: 300, easing: BACK });
    this.audio.scoreThud?.();
    await this.wait(300);

    let i = 0;
    for (const row of rows) {
      if (!live()) return;
      const r = el('div', `mo-row ${row.kind}`, list);
      el('span', 'k', r).textContent = row.label;
      el('span', 'd', r).textContent = row.detail;
      const v = el('span', 'v', r);
      v.textContent = row.amount < 0 ? '0' : '+0';
      const big = row.kind !== 'shot';
      this.anim(r, [{ transform: big ? 'scale(1.35)' : 'translateX(-46px)', opacity: 0, background: 'rgba(233,248,255,0.5)' }, { transform: 'none', opacity: 1, background: 'rgba(233,248,255,0)' }], { duration: 240, easing: BACK });
      this.audio.scoreNote?.(i, row.kind === 'shot' ? 'points' : 'mult', row.kind === 'bad');
      if (row.kind === 'bad') {
        this.engine.shake?.(6);
        v.textContent = `−${Math.abs(row.amount)} ${row.unit || ''}`;
        this.anim(r, [{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-3px)' }, { transform: 'none' }], { duration: 260 });
        await this.wait(380);
      } else {
        await this.count(v, 0, row.amount, 260, { prefix: '+' });
        this.anim(v, [{ transform: 'scale(1.4)' }, { transform: 'scale(1)' }], { duration: 220, easing: OUT });
        await this.wait(Math.max(120, 300 - i * 40));
      }
      i += 1;
    }
    if (!rows.length) {
      const r = el('div', 'mo-row shot', list);
      el('span', 'k', r).textContent = 'Nothing scored';
      el('span', 'd', r);
      el('span', 'v', r).textContent = '0';
    }

    if (!live()) return;
    await this.anim(rule, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 220, easing: OUT });
    this.anim(total, [{ opacity: 0 }, { opacity: 1 }], { duration: 120 });
    let n = 0;
    await this.count(totalV, 0, d.roomScore, Math.min(1300, 500 + rows.length * 140), {
      tick: () => this.audio.scoreNote?.(4 + n++, 'points')
    });
    if (!live()) return;
    this.audio.scoreSlam?.();
    this.engine.shake?.(7);
    total.classList.add('slam');
    this.anim(totalV, [{ transform: 'scale(1.6)', color: '#ffffff' }, { transform: 'scale(1)' }], { duration: 360, easing: OUT });
    await this.wait(620);
    if (!live()) return;
    await this.flyToRun(totalV, d.roomScore, d.onRunLanded, d.shownRun, d.runScore);
    totalV.style.visibility = '';
    totalV.textContent = fmt(d.roomScore);
    total.classList.add('banked');
    // CREDITS: what the table paid as money, in money's colour.
    if (d.credits > 0) {
      const c = el('div', 'mo-credits', panel);
      el('span', 'k', c).textContent = 'Credits';
      const cv = el('span', 'v', c);
      cv.textContent = '+0';
      this.anim(c, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: OUT });
      this.audio.scoreNote?.(9, 'mult');
      await this.count(cv, 0, d.credits, 360, { prefix: '+' });
    }
    await this.wait(200);
  }

  /* -------------------------------------------------------------- *
   * SCRATCH — the cue ball went down
   * -------------------------------------------------------------- */

  /**
   * @param {object} o
   * @param {{x:number,z:number}} o.pocket
   * @param {{x:number,z:number}} o.spawn  where the cue ball comes back
   * @param {(on:boolean)=>void} o.setCueVisible
   * @param {()=>boolean} [o.cueShown]  whether the real cue stick is drawn again
   */
  async scratch({ pocket, spawn, setCueVisible, cueShown }) {
    this.skip = false;
    const P = this.toPx(pocket.x, pocket.z);
    const S = this.toPx(spawn.x, spawn.z);
    setCueVisible(false);
    this.engine.hitStop?.(0.14);
    await this._scratchGlitch(P, S, setCueVisible, spawn, cueShown);
  }

  /**
   * GLITCH. Red alert: the screen tears and SCRATCH jitters out of a split.
   * Then a beam drops onto the spot, the ball rezzes in, and the cue takes
   * form under it, pointing straight up at it.
   */
  async _scratchGlitch(P, S, setCueVisible, spawn, cueShown) {
    const root = el('div', 'mo-scratch glitch', this.root);
    const alarm = el('div', 'mo-alarm', root);
    this.anim(alarm, [{ opacity: 0 }, { opacity: 1 }, { opacity: 0.25 }, { opacity: 1 }, { opacity: 0 }], { duration: 900, easing: 'ease-in-out' });
    this.audio.playerHurt?.();
    this.engine.shake?.(10);
    // tearing bands
    const bands = [];
    for (let i = 0; i < 7; i++) {
      const band = el('div', 'mo-tear', root);
      const top = Math.random() * 92;
      band.style.top = `${top}%`;
      band.style.height = `${2 + Math.random() * 7}%`;
      bands.push(band);
      const dx = (Math.random() < 0.5 ? -1 : 1) * (8 + Math.random() * 22);
      this.anim(band, [
        { transform: 'translateX(0)', opacity: 1 },
        { transform: `translateX(${dx}px)`, opacity: 1, offset: 0.25 },
        { transform: `translateX(${-dx * 0.6}px)`, opacity: 1, offset: 0.5 },
        { transform: `translateX(${dx * 0.3}px)`, opacity: 1, offset: 0.75 },
        { transform: 'translateX(0)', opacity: 0 }
      ], { duration: 420, delay: i * 18, easing: 'steps(6)' });
    }
    this.setFilter('scratch', 'hue-rotate(150deg) saturate(1.6)', 0);
    await this.wait(70);
    this.setFilter('scratch', null, 0);
    await this.wait(60);
    this.setFilter('scratch', 'hue-rotate(150deg) saturate(1.6)', 0);
    await this.wait(60);
    this.setFilter('scratch', 'saturate(0.6) brightness(0.7)', 0);

    const word = el('div', 'mo-glitch', root);
    word.dataset.text = 'SCRATCH';
    word.textContent = 'SCRATCH';
    const sub = el('div', 'mo-glitch-sub', root);
    sub.textContent = 'Cue ball down · shot void';
    this.audio.scoreSlam?.();
    this.anim(word, [{ transform: 'translate(-50%,-50%) scaleY(0.05) scaleX(1.6)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }], { duration: 140, easing: OUT });
    this.anim(sub, [{ opacity: 0, letterSpacing: '0.8em' }, { opacity: 1, letterSpacing: '0.26em' }], { duration: 320, delay: 120, easing: OUT });
    await this.wait(800);
    bands.forEach((b) => b.remove());

    // THE BEAM: light drops from the top of the screen onto the spot, and the
    // ball rezzes in where it lands.
    const beam = el('div', 'mo-beam', root);
    beam.style.left = `${S.x}px`;
    beam.style.height = `${S.y}px`;
    this.audio.doorOpen?.();
    await this.anim(beam, [{ transform: 'translateX(-50%) scaleY(0)', opacity: 1 }, { transform: 'translateX(-50%) scaleY(1)', opacity: 1 }], { duration: 160, easing: IN });
    const rez = el('div', 'mo-rez', root);
    rez.style.left = `${S.x}px`;
    rez.style.top = `${S.y}px`;
    await this.anim(rez, [{ transform: 'translate(-50%,-50%) scale(3)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }], { duration: 200, easing: IN });
    setCueVisible(true);
    this.setFilter('scratch', null, 220);
    this.audio.scoreLock?.();
    this.engine.shake?.(4);
    this.anim(rez, [{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(1.8)', opacity: 0 }], { duration: 300, easing: OUT });
    this.anim(beam, [{ opacity: 1 }, { opacity: 0 }], { duration: 360 });

    // THE CUE TAKES FORM: the light gathers into the stick, under the ball and
    // pointing straight up at it, ready for the next shot.
    const stick = this._formStick(root, spawn);
    await this.wait(80);
    this.audio.boot?.();
    await this.anim(stick.outline, [{ strokeDashoffset: 100 }, { strokeDashoffset: 0 }], { duration: 380, easing: 'cubic-bezier(0.5, 0, 0.3, 1)' });
    await this.anim(stick.fill, [{ opacity: 0 }, { opacity: 0.85 }], { duration: 160 });
    await this.anim(word, [{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: 'translate(-50%,-50%) scaleY(0.02) scaleX(1.4)', opacity: 0 }], { duration: 180, easing: IN });
    await this.anim(sub, [{ opacity: 1 }, { opacity: 0 }], { duration: 160 });
    // it hands over to the real stick once the table is ready to aim again
    const t0 = performance.now();
    while (!(cueShown?.() ?? true) && performance.now() - t0 < 2400) await this.wait(40);
    await this.anim(stick.svg, [{ opacity: 1 }, { opacity: 0 }], { duration: 220 });
    root.remove();
  }

  /** A cue stick drawn in light below the spawn, pointing up at the ball. */
  _formStick(root, spawn) {
    const r = 0.48 + 0.2;
    const L = TRAJECTORY.stickLength;
    const tip = this.toPx(spawn.x, spawn.z + r);
    const butt = this.toPx(spawn.x, spawn.z + r + L);
    const unit = Math.abs(this.toPx(1, 0).x - this.toPx(0, 0).x);
    const w0 = TRAJECTORY.stickWidth * 0.55 * unit;
    const w1 = TRAJECTORY.stickWidth * 1.9 * unit;
    const g = svg('svg', { class: 'mo-form', width: this.W, height: this.H, viewBox: `0 0 ${this.W} ${this.H}` }, root);
    const pts = `${tip.x - w0},${tip.y} ${tip.x + w0},${tip.y} ${butt.x + w1},${butt.y} ${butt.x - w1},${butt.y}`;
    const fill = svg('polygon', { points: pts, class: 'fill' }, g);
    const outline = svg('polygon', { points: pts, class: 'line', pathLength: 100 }, g);
    return { svg: g, fill, outline };
  }

  /* -------------------------------------------------------------- *
   * FREEZE — time stops mid-roll; re-aim the cue ball
   * -------------------------------------------------------------- */

  /**
   * @param {object} o
   * @param {{x:number,z:number}} o.cue
   * @param {{x:number,z:number,vx:number,vz:number}[]} o.balls  the ones still rolling
   * @param {number} o.left  charges left after this one
   */
  freeze({ cue, balls, left }) {
    this.unfreeze(true);
    const style = this.variant('freeze');
    const C = this.toPx(cue.x, cue.z);
    const root = el('div', `mo-freeze ${style}`, this.root);
    const state = { root, style, C, balls: balls.map((b) => ({ ...b, p: this.toPx(b.x, b.z), q: this.toPx(b.x + b.vx * 0.35, b.z + b.vz * 0.35) })) };
    this._freeze = state;
    this.audio.freezeOn?.();

    const label = el('div', 'mo-freeze-label', root);
    el('b', '', label).textContent = 'Freeze frame';
    el('small', '', label).textContent = `Re-aim from here · no shot spent · ${left} left`;

    // THE FLASH: the frame is taken.
    const flash = el('div', 'mo-flash', root);
    this.anim(flash, [{ opacity: 0.9 }, { opacity: 0 }], { duration: 220, easing: 'ease-out' }).then(() => flash.remove());
    this.engine.zoomPunch?.();

    // STASIS: a wave of ice from the cue ball. Everything it passes stops.
    const diag = Math.hypot(this.W, this.H) * 2.1;
    // the tint (a disc multiplied over the table) and its bright leading edge
    const wave = el('div', 'mo-stasis', root);
    const rim = el('div', 'mo-stasis-rim', root);
    for (const node of [wave, rim]) {
      node.style.left = `${C.x}px`;
      node.style.top = `${C.y}px`;
      node.style.width = node.style.height = `${diag}px`;
      this.anim(node, [{ transform: 'translate(-50%,-50%) scale(0)' }, { transform: 'translate(-50%,-50%) scale(1)' }], { duration: 560, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' });
    }
    this.anim(rim, [{ opacity: 1 }, { opacity: 1, offset: 0.6 }, { opacity: 0 }], { duration: 640 });
    this.engine.shake?.(3);
    const R = diag / 2;
    for (const b of state.balls) {
      const dist = Math.hypot(b.p.x - C.x, b.p.y - C.y);
      const delay = Math.min(520, (dist / R) * 900);
      const hex = svg('svg', { class: 'mo-hex', width: 54, height: 54, viewBox: '-27 -27 54 54' }, root);
      hex.style.left = `${b.p.x}px`;
      hex.style.top = `${b.p.y}px`;
      const pts = [];
      for (let k = 0; k < 6; k++) pts.push(`${Math.cos((k * Math.PI) / 3 + Math.PI / 6) * 20},${Math.sin((k * Math.PI) / 3 + Math.PI / 6) * 20}`);
      svg('polygon', { points: pts.join(' ') }, hex);
      b.hex = hex;
      this.anim(hex, [{ transform: 'translate(-50%,-50%) scale(1.8) rotate(30deg)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1) rotate(0deg)', opacity: 1 }], { duration: 260, delay, easing: BACK });
      const len = Math.hypot(b.q.x - b.p.x, b.q.y - b.p.y);
      if (len > 6) {
        const arrow = el('div', 'mo-arrow', root);
        arrow.style.left = `${b.p.x}px`;
        arrow.style.top = `${b.p.y}px`;
        arrow.style.width = `${len}px`;
        arrow.style.transform = `rotate(${Math.atan2(b.q.y - b.p.y, b.q.x - b.p.x)}rad)`;
        b.arrow = arrow;
        this.anim(arrow, [{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: delay + 160 });
      }
    }
    this.anim(label, [{ opacity: 0, transform: 'translate(-50%, 10px) scale(1.3)', filter: 'blur(6px)' }, { opacity: 1, transform: 'translate(-50%, 0) scale(1)', filter: 'blur(0)' }], { duration: 380, delay: 120, easing: OUT });
  }

  /** The re-aimed shot is away: time starts again. */
  unfreeze(silent = false) {
    const state = this._freeze;
    if (!state) return;
    this._freeze = null;
    this.setFilter('freeze', null, silent ? 0 : 160);
    const { root, C } = state;
    if (silent) {
      root.remove();
      return;
    }
    this.audio.shatter?.();
    {
      // THE SHATTER: the ice breaks outward from the cue ball.
      const shards = el('div', 'mo-shards', root);
      for (let i = 0; i < 18; i++) {
        const s = el('div', 'mo-shard', shards);
        const a = (i / 18) * Math.PI * 2 + Math.random() * 0.3;
        const d = 60 + Math.random() * 120;
        s.style.left = `${C.x}px`;
        s.style.top = `${C.y}px`;
        s.style.width = `${8 + Math.random() * 14}px`;
        s.style.height = `${14 + Math.random() * 20}px`;
        this.anim(s, [
          { transform: `translate(-50%,-50%) rotate(${a}rad)`, opacity: 1 },
          { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d}px)) rotate(${a + 3}rad) scale(0.4)`, opacity: 0 }
        ], { duration: 480 + Math.random() * 200, easing: OUT });
      }
      const wave = root.querySelector('.mo-stasis');
      if (wave) this.anim(wave, [{ opacity: 1 }, { opacity: 0 }], { duration: 220 });
      const flash = el('div', 'mo-flash', root);
      this.anim(flash, [{ opacity: 0.35 }, { opacity: 0 }], { duration: 200 });
      for (const b of state.balls) {
        if (b.hex) this.anim(b.hex, [{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(2.2)', opacity: 0 }], { duration: 260, easing: OUT });
        if (b.arrow) this.anim(b.arrow, [{ opacity: 1 }, { opacity: 0 }], { duration: 120 });
      }
      this.engine.shake?.(4);
    }
    const label = root.querySelector('.mo-freeze-label');
    if (label) this.anim(label, [{ opacity: 1 }, { opacity: 0, transform: 'translate(-50%, -12px)' }], { duration: 200 });
    setTimeout(() => root.remove(), 800);
  }

  /* -------------------------------------------------------------- *
   * TRANSITION — one table goes, the next arrives
   * -------------------------------------------------------------- */

  /**
   * @param {object} o
   * @param {number} o.from  the room being left
   * @param {number} o.to    the room arriving
   * @param {string} [o.note]  what the exit gave you, shown on the cover
   * @param {Function} o.swap  builds the next table; called while covered
   */
  async transition({ from, to, note, swap }) {
    this._note = note || '';
    this.skip = false;
    const root = el('div', 'mo-trans boot', this.root);
    absorb(root);
    try {
      await this._transBoot(root, from, to, swap);
    } finally {
      root.remove();
    }
  }

  /** The table's rail line, in layer pixels. */
  _railRect() {
    const a = this.toPx(-ARENA.halfW, -ARENA.halfH);
    const b = this.toPx(ARENA.halfW, ARENA.halfH);
    return { x0: Math.min(a.x, b.x), y0: Math.min(a.y, b.y), x1: Math.max(a.x, b.x), y1: Math.max(a.y, b.y) };
  }

  /**
   * BOOT. Strips slide shut; the room number rolls over to the next and
   * holds; the rails trace back in; the strips open on the new table.
   */
  async _transBoot(root, from, to, swap) {
    const N = 14;
    const strips = [];
    for (let i = 0; i < N; i++) {
      const s = el('div', `mo-strip ${i % 2 ? 'r' : 'l'}`, root);
      s.style.top = `${(i * 100) / N}%`;
      s.style.height = `${100 / N + 0.2}%`;
      strips.push(s);
    }
    this.audio.derez?.();
    await Promise.all(
      strips.map((s, i) =>
        this.anim(s, [{ transform: `translateX(${i % 2 ? 101 : -101}%)` }, { transform: 'translateX(0)' }], { duration: 230, delay: i * 20, easing: IN })
      )
    );
    root.classList.add('covered');
    await swap();
    // THE COUNT: the room you finished, then it rolls over to the next one
    // and holds there, big, so the step is felt before the table arrives.
    const num = el('div', 'mo-roomnum', root);
    el('small', '', num).textContent = 'Room';
    const digits = el('div', 'mo-digits', num);
    const oldN = el('b', 'old', digits);
    oldN.textContent = String(from).padStart(2, '0');
    const newN = el('b', 'new', digits);
    newN.textContent = String(to).padStart(2, '0');
    const note = this._note ? el('em', '', num) : null;
    if (note) {
      note.textContent = this._note;
      note.style.opacity = '0';
    }
    await this.anim(num, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(1.3)', filter: 'blur(8px)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', filter: 'blur(0)' }], { duration: 260, easing: OUT });
    await this.wait(260);
    this.audio.scoreNote?.(6, 'points');
    this.anim(oldN, [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-90%)', opacity: 0 }], { duration: 260, easing: IN });
    await this.anim(newN, [{ transform: 'translateY(90%)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 340, delay: 70, easing: BACK });
    this.audio.scoreLock?.();
    this.engine.shake?.(4);
    this.anim(newN, [{ textShadow: '0 0 30px #22e8ff, 0 0 70px #22e8ff' }, { textShadow: '0 0 14px rgba(34,232,255,0.6)' }], { duration: 500, easing: OUT });
    if (note) this.anim(note, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: OUT });
    await this.wait(520);

    // THE BOOT TRACE: two light-cycles leave the bottom centre and draw the
    // rails, meeting at the top.
    const R = this._railRect();
    const g = svg('svg', { class: 'mo-boot', width: this.W, height: this.H, viewBox: `0 0 ${this.W} ${this.H}` }, root);
    const mx = (R.x0 + R.x1) / 2;
    const left = `M ${mx} ${R.y1} L ${R.x0} ${R.y1} L ${R.x0} ${R.y0} L ${mx} ${R.y0}`;
    const right = `M ${mx} ${R.y1} L ${R.x1} ${R.y1} L ${R.x1} ${R.y0} L ${mx} ${R.y0}`;
    const paths = [left, right].map((d) => svg('path', { d, pathLength: 100 }, g));
    this.audio.boot?.();
    await Promise.all(paths.map((p) => this.anim(p, [{ strokeDashoffset: 100 }, { strokeDashoffset: 0 }], { duration: 560, easing: 'cubic-bezier(0.5, 0, 0.3, 1)' })));
    this.audio.scoreLock?.();
    this.anim(g, [{ opacity: 1 }, { opacity: 0 }], { duration: 380, delay: 120 });
    this.anim(num, [{ opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }, { opacity: 0, transform: 'translate(-50%,-50%) scale(0.85)' }], { duration: 300, delay: 160 });
    const mid = (N - 1) / 2;
    await Promise.all(
      strips.map((s, i) =>
        this.anim(s, [{ transform: 'scaleX(1)', opacity: 1 }, { transform: 'scaleX(0)', opacity: 0.6 }], { duration: 240, delay: 40 + Math.abs(i - mid) * 24, easing: IN })
      )
    );
  }
}
