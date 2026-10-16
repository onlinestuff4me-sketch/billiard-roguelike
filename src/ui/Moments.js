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
    return new Promise((resolve) => setTimeout(resolve, this.skip ? 0 : ms));
  }

  anim(node, frames, opts) {
    // 'both': a delayed animation holds its first frame while it waits, so
    // nothing shows, vanishes and then animates in.
    const a = node.animate(frames, { fill: 'both', ...opts });
    this._running = this._running || new Set();
    if (this.skip) {
      try { a.finish(); } catch { /* infinite or detached */ }
    } else {
      this._running.add(a);
      a.finished.finally(() => this._running.delete(a)).catch(() => {});
    }
    return a.finished.catch(() => {});
  }

  /** SKIP: everything still playing jumps to its last frame, now. */
  skipNow() {
    this.skip = true;
    for (const a of this._running || []) {
      try { a.finish(); } catch { /* infinite or detached */ }
    }
    this._running?.clear();
  }

  /** Count a node's number from `from` to `to`, ticking a note as it goes. */
  count(node, from, to, ms, { prefix = '', tick = null } = {}) {
    return new Promise((resolve) => {
      const t0 = performance.now();
      let lastTick = -1;
      const step = () => {
        const u = this.skip ? 1 : Math.min(1, (performance.now() - t0) / Math.max(1, ms));
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
  runBox(node = this.hud.scoreValue) {
    const r = node.getBoundingClientRect();
    const L = this.layer.getBoundingClientRect();
    return { node, x: r.left - L.left + r.width / 2, y: r.top - L.top + r.height / 2 };
  }

  /**
   * BANK INTO RUN, in the same language as a shot's numbers: the total stays
   * where it is in the ledger, and a PLATE carrying it pops off it, holds a
   * beat, then flies along a streak of light into RUN, which jumps as it
   * lands and counts up. Exactly what a plate does flying into the score
   * boxes during play, only bigger.
   */
  async flyToRun(fromNode, value, land, runFrom = null, runTo = null, opt = {}) {
    const L = this.layer.getBoundingClientRect();
    const r = fromNode.getBoundingClientRect();
    const to = this.runBox(opt.to);
    const x0 = r.left - L.left + r.width / 2;
    const y0 = r.top - L.top + r.height / 2;
    const plate = el('div', 'sf-plate pts mo-bankplate', this.root);
    if (opt.cash) plate.classList.add('cash');
    el('b', '', plate).textContent = opt.cash ? `+$${value}` : `+${fmt(value)}`;
    el('small', '', plate).textContent = opt.label || 'Table';
    plate.style.left = `${x0}px`;
    plate.style.top = `${y0}px`;
    const dx = to.x - x0;
    const dy = to.y - y0;
    const at = (x, y, sc, rot = 0) => `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${sc}) rotate(${rot}deg)`;
    // the pop, as a plate pops beside its cause
    this.audio.scoreThud?.();
    // ONE MOVEMENT AT A TIME: the plate pops, then it flies, then RUN counts.
    // Nothing else on screen moves or changes while each one happens.
    await this.anim(plate, [
      { transform: at(0, 0, 0.6), opacity: 0 },
      { transform: at(0, 0, 1), opacity: 1 }
    ], { duration: 220, easing: OUT });
    await this.wait(300);
    // the flight, with its streak
    const streak = el('div', 'sf-streak mo-bankstreak', this.root);
    const len = Math.hypot(dx, dy);
    streak.style.width = `${len}px`;
    const base = `translate(${x0}px, ${y0}px) rotate(${Math.atan2(dy, dx)}rad)`;
    this.anim(streak, [
      { transform: `${base} scaleX(0)`, opacity: 1 },
      { transform: `${base} scaleX(1)`, opacity: 1, offset: 0.6 },
      { transform: `${base} scaleX(1)`, opacity: 0 }
    ], { duration: 760, easing: 'linear' }).then(() => streak.remove());
    this.audio.slingshot?.(0.4);
    await this.anim(plate, [
      { transform: at(0, 0, 1) },
      { transform: at(dx, dy, 0.55) }
    ], { duration: 460, easing: 'cubic-bezier(0.5, 0, 0.8, 0.4)' });
    plate.remove();
    // the landing: RUN glows once and counts up, in place
    this.audio.scoreLock?.();
    to.node.animate(
      [{ textShadow: '0 0 16px #e9f8ff, 0 0 32px #22e8ff' }, { textShadow: '0 0 0 transparent' }],
      { duration: 700, easing: OUT }
    );
    if (runFrom != null && runTo != null && runTo !== runFrom) {
      let n = 0;
      await this.count(to.node, runFrom, runTo, 520, { prefix: opt.cash ? '$' : '', tick: () => this.audio.scoreNote?.(6 + n++, 'points') });
    }
    land?.();
  }

  /* -------------------------------------------------------------- *
   * TABLE INTRO — an authored table opens on its own card
   * -------------------------------------------------------------- */

  /**
   * The card a table opens on (from review: "where are these instructions?").
   * The table dims; the card says the table's number, its name (which is its
   * rule, short), the rule in a sentence, and its balls and shots. One tap
   * anywhere clears it, and the name, as a chip, flies from the card to the
   * top-right corner where it stays for the table. Resolves once it has landed.
   * @param {{kicker:string, name:string, rule:string, stats:string[], chip?:string, chipTo:()=>HTMLElement}} o
   */
  tableIntro(o) {
    this.closeIntro();
    return new Promise((resolve) => {
      const root = el('div', 'mo-intro', this.root);
      this._intro = root;
      const shade = el('div', 'mo-intro-shade', root);
      const card = el('div', 'mo-intro-card', root);
      el('div', 'mo-kicker', card).textContent = o.kicker;
      const nameEl = el('div', 'mo-intro-name', card);
      nameEl.textContent = o.name;
      const rule = el('div', 'mo-intro-rule', card);
      rule.textContent = o.rule;
      const stats = el('div', 'mo-intro-stats', card);
      for (const st of o.stats) el('span', '', stats).textContent = st;
      // a real button, big enough to read as one (from review); a tap anywhere still plays
      const go = el('button', 'mo-intro-go', card);
      go.type = 'button';
      go.textContent = 'Tap to play';
      this.audio.doorOpen?.();
      this.anim(shade, [{ opacity: 0 }, { opacity: 1 }], { duration: 260 });
      this.anim(card, [{ transform: 'translate(-50%, -50%) scale(0.9)', opacity: 0 }, { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 }], { duration: 320, easing: BACK });
      let gone = false;
      absorb(root, async () => {
        if (gone) return;
        gone = true;
        // the button answers the tap, wherever it landed
        go.animate?.([{ transform: 'scale(1)', filter: 'brightness(1)' }, { transform: 'scale(0.95)', filter: 'brightness(1.5)' }, { transform: 'scale(1)', filter: 'brightness(1)' }], { duration: 200 });
        // the chip lifts off the name, which says the same thing
        const from = nameEl.getBoundingClientRect();
        const L = this.layer.getBoundingClientRect();
        this.anim(card, [{ opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }, { opacity: 0, transform: 'translate(-50%, -50%) scale(0.96)' }], { duration: 220, easing: IN });
        this.anim(shade, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 });
        const target = o.chip && o.chipTo?.();
        if (target) {
          // ...and flies to its corner
          target.hidden = false;
          target.textContent = o.chip;
          target.style.visibility = 'hidden';
          const to = target.getBoundingClientRect();
          const fly = el('div', 'rule-chip mo-intro-fly', this.root);
          fly.textContent = o.chip;
          const a = { x: from.left - L.left + from.width / 2, y: from.top - L.top + from.height / 2 };
          const b = { x: to.left - L.left + to.width / 2, y: to.top - L.top + to.height / 2 };
          this.audio.slingshot?.(0.25);
          await this._arc(fly, a, b, { ms: 620, lift: 40, s0: 1.6, s1: 1 });
          fly.remove();
          target.style.visibility = '';
        } else {
          await this.wait(240);
        }
        if (this._intro !== root) return;
        this._intro = null;
        root.remove();
        resolve();
      });
    });
  }

  /** Drop a table's opening card unanswered (the table changed under it). */
  closeIntro() {
    if (!this._intro) return;
    this._intro.remove();
    this._intro = null;
    for (const f of this.root.querySelectorAll('.mo-intro-fly')) f.remove();
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
    // A TAP SKIPS: the whole moment jumps to its end, and the Shop button waits.
    // A SKIP SHOWS IT HAPPENED: the button lights, the panel flashes as
    // everything lands, a fast-forward mark sweeps across it, and the
    // buttons come a beat later.
    let skipped = false;
    let skipFill = null;
    const skip = () => {
      if (this._clearReady || skipped) return;
      skipped = true;
      this._skipping = true;
      this._skipLand = [];
      skipFill = this._skipFx(root, act);
      this.skipNow();
    };
    absorb(root, skip);
    const act = el('button', 'mo-nexttable mo-act skip', root);
    act.type = 'button';
    act.innerHTML = 'Skip <span aria-hidden="true">▸▸</span>';
    act.hidden = true;
    act.style.bottom = 'auto';
    this._actBtn = act;
    this._actTap = null;
    absorb(act);
    act.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (this._actTap) this._actTap();
      else skip();
    });
    this._clearReady = false;
    this._clearRoot = root;
    // THE WALLET stays lit in its corner, above the dimmed table, from the
    // result through the shop.
    this.hud.root.classList.add('wallet-lit');
    this.setFilter('clear', 'brightness(0.42) saturate(0.7)', 380);
    this.audio.roomClear?.();

    const rows = (d.ledger || []).map((e) => ({
      label: e.label,
      detail: e.detail || '',
      amount: e.amount,
      kind: e.id === 'stroke' ? 'shot' : 'bonus'
    }));

    await this._clearLedger(root, d, rows, live);
    // a skip fills in what it jumped past before anything else happens
    if (skipFill) {
      this.skip = false;
      await skipFill();
    }
    // anything still held for the pop lands now (a skip before the panel)
    for (const land of this._skipLand || []) land();
    this._skipLand = [];
    this._skipping = false;
    if (!live() || d.lives <= 0) {
      act.hidden = true;
      return;
    }
    // THE SHOP replaces the exits: GO TO SHOP, or NEXT TABLE to skip it.
    if (d.shop) {
      this.skip = false;
      if (!live()) return;
      this._clearReady = true;
      await this._shopFlow(root, d, act, live);
      return;
    }

    // NEXT TABLE. The choices arrive last, so nothing can be tapped before the
    // count has had its moment.
    this.skip = false;
    this._clearReady = true;
    act.remove();
    this._actBtn = null;
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
    this.anim(next, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
  }

  /**
   * The skip's own feedback (from review). Everything jumps to its end at
   * once underneath, but what the player sees is quick: the Skip button
   * lights, a ▸▸ mark flicks across, the rows that hadn't shown yet fill in
   * down the panel one after another, and then the wallet and the score at
   * the top pop with their new figures. Returns how long that takes.
   *
   * It runs outside `anim` on purpose: a skip finishes every tracked
   * animation at once, and this has to be seen.
   */
  _skipFx(root, act) {
    this.audio.slingshot?.(0.5);
    act.classList.add('pressed');
    act.animate([{ transform: 'translate(-50%, 0) scale(1)' }, { transform: 'translate(-50%, 0) scale(0.86)', offset: 0.35 }, { transform: 'translate(-50%, 0) scale(1)' }], { duration: 340, easing: 'ease-out' });
    const panel = root.querySelector('.mo-ledger');
    if (!panel) return null;
    const P = this._at(panel);
    const mark = el('div', 'mo-skipfx', this.root);
    mark.textContent = '▸▸';
    mark.style.left = `${P.x}px`;
    mark.style.top = `${P.y}px`;
    mark.animate([{ transform: 'translate(-110%, -50%) scale(0.8)', opacity: 0 }, { transform: 'translate(-50%, -50%) scale(1.1)', opacity: 0.85, offset: 0.35 }, { transform: 'translate(10%, -50%) scale(1.3)', opacity: 0 }], { duration: 520, easing: 'ease-out' }).finished.then(() => mark.remove(), () => mark.remove());
    // What hasn't shown yet, top to bottom, is hidden now (the jump to the
    // end happens underneath) and filled in once the panel has settled.
    const box = panel.querySelector('.mo-pay2');
    const boxHidden = !!box && parseFloat(getComputedStyle(box).opacity) < 0.5;
    const hidden = (n) => n.style.opacity === '0' || parseFloat(getComputedStyle(n).opacity) < 0.5 || (boxHidden && box.contains(n));
    const pending = [...panel.querySelectorAll('.mo-row, .mo-total, .mo-target, .mo-pay-k, .mo-cash-row, .mo-cash-total')].filter(hidden);
    pending.forEach((n) => n.classList.add('mo-skiphide'));
    if (boxHidden) box.classList.add('mo-skiphide');
    return () => this._skipFill(pending, boxHidden ? box : null);
  }

  /** The skip's fill-in: each row in turn, then the totals at the top pop. */
  _skipFill(pending, box) {
    const step = 55;
    pending.forEach((n, i) => {
      setTimeout(() => {
        if (box && box.contains(n)) box.classList.remove('mo-skiphide');
        n.classList.remove('mo-skiphide');
        n.animate([{ opacity: 0, transform: 'translateX(-28px)', background: 'rgba(233,248,255,0.35)' }, { opacity: 1, transform: 'none', background: 'rgba(233,248,255,0)' }], { duration: 200, easing: 'ease-out' });
        if (i % 2 === 0) this.audio.scoreNote?.(4 + i, 'points');
      }, step * i);
    });
    const popAt = step * pending.length + 160;
    setTimeout(() => {
      box?.classList.remove('mo-skiphide');
      for (const land of this._skipLand || []) land();
      this._skipLand = [];
      this.audio.scoreLock?.();
      const pop = [{ transform: 'scale(1.45)', filter: 'brightness(1.9)' }, { transform: 'scale(1)', filter: 'none' }];
      this.hud.cashValue.animate(pop, { duration: 420, easing: 'ease-out' });
      this.hud.scoreValue?.animate(pop, { duration: 420, easing: 'ease-out' });
      const W = this._at(this.hud.cashValue);
      const ring = el('div', 'mo-ring gold', this.root);
      ring.style.left = `${W.x}px`;
      ring.style.top = `${W.y}px`;
      ring.animate([{ transform: 'translate(-50%,-50%) scale(0.4)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(2.4)', opacity: 0 }], { duration: 520, easing: 'ease-out' }).finished.then(() => ring.remove(), () => ring.remove());
    }, popAt);
    return new Promise((r) => setTimeout(r, popAt + 420));
  }

  /**
   * FROM THE RESULT TO THE SHOP (from review). One row of buttons under the
   * panel, in the place the Skip button was:
   *
   *   result:  [            ] [ GO TO SHOP ] [ Next table ▸ ]
   *   shop:    [ ◂ Summary  ] [ NEXT TABLE ] [              ]
   *
   * The row appears once the result has played (or been skipped), coin rain
   * included. Go to shop sends the result up and away and slides the shop
   * in; the small Next table slides to the middle and grows into the main
   * button, and ◂ Summary appears on the left. ◂ Summary plays all of that
   * backwards. Next table, from either, opens the next table.
   */
  async _shopFlow(root, d, act, live) {
    const shop = d.shop;
    const ledger = root.querySelector('.mo-ledger');
    const row = el('div', 'mo-actrow', root);
    row.style.top = act.style.top;
    const left = el('div', 'slot l', row);
    const mid = el('div', 'slot m', row);
    const right = el('div', 'slot r', row);
    act.hidden = false;
    act.classList.remove('skip', 'pressed');
    act.classList.add('collect', 'in-row');
    act.style.top = '';
    act.textContent = 'Go to shop';
    mid.appendChild(act);
    // the side buttons are small: an arrow over a short label
    const SMALL = { next: '<i aria-hidden="true">▸</i><span>Next table</span>', back: '<i aria-hidden="true">◂</i><span>Summary</span>' };
    const small = (cls, parent) => {
      const b = el('button', `mo-nexttable mo-act in-row small ${cls}`, parent);
      b.type = 'button';
      b.innerHTML = SMALL[cls];
      absorb(b);
      return b;
    };
    const next = small('next', right);
    const back = small('back', left);
    back.style.visibility = 'hidden';
    this.anim(act, [{ transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 260, easing: BACK });
    this.anim(next, [{ transform: 'translateX(16px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 260, delay: 120, easing: OUT });

    let panel = null;
    let inShop = false;
    let busy = false;
    // every tap answers at once: the button lights up, dips and springs back,
    // and stays lit while the screen changes
    const press = (btn) => {
      this.audio.scoreNote?.(6, 'points');
      btn.classList.add('pressed');
      this.anim(btn, [{ transform: 'scale(1)' }, { transform: 'scale(0.86)', filter: 'brightness(1.8)', offset: 0.35 }, { transform: 'scale(1)', filter: 'none' }], { duration: 340, easing: 'ease-out' });
      return this.wait(240).then(() => setTimeout(() => btn.classList.remove('pressed'), 400));
    };
    const run = (fn) => async () => {
      if (busy || !live()) return;
      busy = true;
      try { await fn(); } finally { busy = false; }
    };
    // a button moves to a new slot by sliding from where it was (FLIP)
    const move = (node, slot, big) => {
      const a = node.getBoundingClientRect();
      slot.appendChild(node);
      node.classList.toggle('small', !big);
      node.innerHTML = big ? 'Next table ▸' : SMALL.next;
      const b = node.getBoundingClientRect();
      const dx = a.left + a.width / 2 - (b.left + b.width / 2);
      const dy = a.top + a.height / 2 - (b.top + b.height / 2);
      return this.anim(node, [{ transform: `translate(${dx}px, ${dy}px) scale(${a.width / Math.max(1, b.width)})` }, { transform: 'none' }], { duration: 420, easing: OUT });
    };
    const fadeIn = (node) => {
      node.style.visibility = '';
      return this.anim(node, [{ transform: 'scale(0.6)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: BACK });
    };
    const fadeOut = (node) => this.anim(node, [{ transform: 'none', opacity: 1 }, { transform: 'scale(0.6)', opacity: 0 }], { duration: 200, easing: IN }).then(() => (node.style.visibility = 'hidden'));

    const goShop = run(async () => {
      await press(act);
      if (!live()) return;
      act.disabled = true;
      // the result flies up and away
      if (ledger) await this.anim(ledger, [{ transform: 'translate(-50%, 0)' }, { transform: 'translate(-50%, -115%)' }], { duration: 360, easing: IN });
      if (!live()) return;
      const first = !panel;
      if (first) panel = this._buildShop(root, shop, live);
      panel.style.visibility = '';
      // the shop slides in from the side; the buttons change places with it
      this.anim(panel, [{ transform: 'translate(70%, 0)', opacity: 0 }, { transform: 'translate(-50%, 0)', opacity: 1 }], { duration: 420, easing: OUT });
      if (first) panel._deal();
      fadeOut(act);
      // Summary arrives while Next table slides into the middle
      fadeIn(back);
      await move(next, mid, true);
      inShop = true;
    });
    const toSummary = run(async () => {
      await press(back);
      fadeOut(back);
      this.anim(panel, [{ transform: 'translate(-50%, 0)', opacity: 1 }, { transform: 'translate(70%, 0)', opacity: 0 }], { duration: 360, easing: IN }).then(() => (panel.style.visibility = 'hidden'));
      move(next, right, false);
      inShop = false;
      await this.wait(200);
      if (ledger) await this.anim(ledger, [{ transform: 'translate(-50%, -115%)' }, { transform: 'translate(-50%, 0)' }], { duration: 420, easing: OUT });
      act.disabled = false;
      await fadeIn(act);
    });
    const goNext = run(async () => {
      next.disabled = act.disabled = back.disabled = true;
      await press(next);
      if (!live()) return;
      shop.next();
    });
    this._actTap = goShop;
    next.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); goNext(); });
    back.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); if (inShop) toSummary(); });
  }

  /**
   * THE SHOP, in CASH, with three actions (decided in review): buy a card,
   * hold a card for the next shop, or reroll. Gold is money and nothing else;
   * rarity is the 1–3 stars on each card, not a colour. Built once per visit
   * and kept, so going back to the summary and returning keeps every choice.
   */
  _buildShop(root, shop, live) {
    const panel = el('div', 'mo-shop', root);
    const head = el('div', 'mo-shop-head', panel);
    el('div', 'mo-kicker', head).textContent = 'Shop';
    const money = (n) => `$${n}`;
    el('div', 'mo-shop-note', panel).textContent = 'Buy a card, or hold one for the next shop. Tap again to undo. Cards you leave are gone.';
    const grid = el('div', 'mo-cards', panel);
    const tools = el('div', 'mo-shop-tools', panel);
    // THE WALLET while shopping is the corner box, lit; only ever one.
    const walletV = this.hud.cashValue;
    this.hud.lockCash(true);
    walletV.textContent = money(shop.cash());
    const reroll = el('button', 'mo-tool reroll', tools);
    reroll.type = 'button';

    // Every buy, hold, undo or reroll moves money between the wallet and what
    // it pays for, and the wallet counts to its new figure as it goes.
    let payId = 0;
    const spendTo = (before, target) => {
      const to = shop.cash();
      const delta = to - before;
      if (!delta) return;
      const shown = Number(String(walletV.textContent).replace(/[^0-9]/g, '')) || 0;
      const my = ++payId;
      return this._payFx(walletV, target, delta, shown, to).then(() => {
        if (my === payId) walletV.textContent = money(shop.cash());
      });
    };
    const shake = (node) => this.anim(node, [{ transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'none' }], { duration: 200 });
    const tap = (node, fn) => {
      absorb(node);
      node.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (live()) fn(event);
      });
    };
    const RANK = { common: 1, rare: 2, epic: 3 };
    // Each card's two buttons say what they did, and tap again to undo:
    // BUY $6 → BOUGHT ✓ (undo gives the $6 back), HOLD $2 → HELD ✓.
    const paintCard = (c) => {
      const it = c._item;
      const buy = c.querySelector('.buy');
      const hold = c.querySelector('.hold');
      c.classList.toggle('bought', !!it.sold);
      c.classList.toggle('held', !!it.held && !it.sold);
      c.classList.toggle('poor', !it.sold && shop.cash() < it.price);
      buy.setAttribute('aria-pressed', String(!!it.sold));
      buy.innerHTML = it.sold ? '<b>Bought ✓</b><small>tap to undo</small>' : `<b>Buy</b><span class="p">${money(it.price)}</span>`;
      buy.disabled = it.sold ? !it.boughtHere : !shop.canBuy(it);
      hold.hidden = !!it.sold;
      hold.setAttribute('aria-pressed', String(!!it.held));
      hold.innerHTML = it.held ? (it.heldHere ? '<b>Held ✓</b><small>tap to undo</small>' : '<b>Held</b><small>from last shop</small>') : `<b>Hold</b><span class="p">${money(shop.holdPrice)}</span>`;
      hold.disabled = it.held ? !it.heldHere : !shop.canHold(it);
      const why = c.querySelector('.why');
      why.textContent = !it.sold && !shop.usable(it) ? (it.id === 'freeze-charge' ? 'Meter full' : 'Lives full') : '';
      c.querySelector('.r').textContent = `${'★'.repeat(RANK[it.rarity] || 1)} ${it.rarity}`;
    };
    const renderTools = () => {
      reroll.disabled = shop.cash() < shop.rerollPrice();
      reroll.innerHTML = '';
      el('span', 'n', reroll).textContent = 'Reroll';
      el('span', 'p', reroll).textContent = money(shop.rerollPrice());
      grid.querySelectorAll('.mo-card').forEach(paintCard);
    };
    const renderCards = (animate, still = null, flip = false) => {
      grid.textContent = '';
      shop.items.forEach((it, i) => {
        const c = el('div', `mo-card ${it.rarity}`, grid);
        c._item = it;
        el('span', 'r', c);
        el('span', 'name', c).textContent = it.name;
        el('span', 'text', c).textContent = it.text;
        el('span', 'why', c);
        const foot = el('span', 'foot', c);
        const buy = el('button', 'act buy', foot);
        buy.type = 'button';
        const hold = el('button', 'act hold', foot);
        hold.type = 'button';
        tap(buy, () => {
          const before = shop.cash();
          const ok = it.sold ? shop.unbuy(it) : shop.buy(it);
          if (!ok) return shake(c);
          if (it.sold) {
            this.anim(c, [{ filter: 'brightness(1.8)' }, { filter: 'none' }], { duration: 320, easing: OUT });
            if (it.id === 'freeze-charge') this._pulseFreeze();
          }
          spendTo(before, buy);
          renderTools();
        });
        tap(hold, () => {
          const before = shop.cash();
          const ok = it.held ? shop.unhold(it) : shop.hold(it);
          if (!ok) return shake(c);
          spendTo(before, hold);
          renderTools();
        });
        // a held card stays put through a reroll; the rest deal in, or after
        // a reroll flip over to their new face, all at once
        if (!animate || (still && still.has(it.id))) return;
        if (flip) this.anim(c, [{ transform: 'perspective(700px) rotateY(-90deg)' }, { transform: 'perspective(700px) rotateY(0deg)' }], { duration: 260, easing: OUT });
        else this.anim(c, [{ transform: 'translateY(14px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 260, delay: 70 * i, easing: BACK });
      });
      renderTools();
    };
    // A REROLL (from review): the coins go to the Reroll button first, then
    // every card flips over to a new one at once (a held card stays put), and
    // the new price pops.
    let rolling = false;
    tap(reroll, async () => {
      if (rolling) return;
      const before = shop.cash();
      const keep = new Set(shop.items.filter((it) => it.held && !it.sold).map((it) => it.id));
      if (!shop.reroll()) return shake(reroll);
      rolling = true;
      this.anim(reroll, [{ filter: 'brightness(2.2)', transform: 'scale(0.96)' }, { filter: 'none', transform: 'none' }], { duration: 260, easing: OUT });
      await spendTo(before, reroll);
      if (!live()) return;
      const leaving = [...grid.querySelectorAll('.mo-card')].filter((c) => !keep.has(c._item.id));
      this.audio.doorOpen?.();
      await Promise.all(leaving.map((c) => this.anim(c, [{ transform: 'perspective(700px) rotateY(0deg)' }, { transform: 'perspective(700px) rotateY(90deg)' }], { duration: 180, easing: IN })));
      if (!live()) return;
      renderCards(true, keep, true);
      const p = reroll.querySelector('.p');
      if (p) this.anim(p, [{ transform: 'scale(1.6)', color: '#ffffff' }, { transform: 'scale(1)' }], { duration: 300, easing: OUT });
      rolling = false;
    });
    // the cards deal in when the shop first slides in
    panel._deal = () => renderCards(true);
    return panel;
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
    this._skipping = false;
    this._skipLand = [];
    this._actTap = null;
    // the wallet goes home to the corner, and the HUD paints it again
    this.hud.root.classList.remove('wallet-away', 'wallet-lit');
    this.hud.lockCash(false);
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
    el('span', 'k', total).textContent = 'Your score';
    const totalV = el('span', 'v', total);
    totalV.textContent = '0';
    // The target and payout rows are part of the panel from the start, so the
    // panel never grows while the moment plays.
    this._verdict = null;
    // Your score against the target, on one bar: the tick is the target, the
    // fill is what you scored, so how much you beat or missed it by is visible.
    if (d.target) {
      const row = el('div', `mo-target ${d.beaten ? 'beaten' : 'missed'}`, panel);
      el('span', 'k', row).textContent = 'Target';
      el('span', 'd', row).textContent = d.target.toLocaleString();
      el('span', 'stamp', row).textContent = d.beaten ? 'Beaten' : 'Missed';
      const scale = Math.max(d.target, d.roomScore, 1);
      const bar = el('div', 'mo-vs', row);
      const fill = el('span', 'fill', bar);
      const tick = el('span', 'tick', bar);
      tick.style.left = `${(d.target / scale) * 100}%`;
      this._verdict = { row, fill, to: (d.roomScore / scale) * 100 };
    }
    // CASH EARNED sits right under the verdict, in the same panel, so the
    // reward reads as the result of beating the target. Every line is in
    // place from the start (invisible), so the panel never grows.
    this._pay = null;
    if (d.target && (d.payout || []).length) {
      const box = el('div', 'mo-pay2', panel);
      el('div', 'mo-pay-k', box).textContent = 'Cash earned';
      // read like Gambonanza's results: a count, the reason with its rule,
      // the dollars
      const rowEls = d.payout.map((p) => {
        const r = el('div', 'mo-cash-row counted', box);
        el('span', 'n', r).textContent = p.count ?? '';
        el('span', 'k', r).textContent = p.label;
        el('span', 'd', r).textContent = p.rule ? `(${p.rule})` : '';
        el('span', 'v', r).textContent = `+$${p.amount}`;
        r.style.opacity = '0';
        return r;
      });
      const sum = el('div', 'mo-cash-total', box);
      el('span', 'k', sum).textContent = 'Cash';
      const sumV = el('span', 'v', sum);
      sumV.textContent = '+$0';
      this._pay = { box, rowEls, sumV };
    }

    // Every ledger row is in place (invisible) before the panel drops in, so
    // the panel never grows and the button under it never moves.
    const rowEls = rows.map((row) => {
      const r = el('div', `mo-row ${row.kind}`, list);
      el('span', 'k', r).textContent = row.label;
      el('span', 'd', r).textContent = row.detail;
      el('span', 'v', r).textContent = row.amount < 0 ? '0' : '+0';
      r.style.opacity = '0';
      return r;
    });
    if (!rows.length) {
      const r = el('div', 'mo-row shot', list);
      el('span', 'k', r).textContent = 'Nothing scored';
      el('span', 'd', r);
      el('span', 'v', r).textContent = '0';
    }

    // panel and title arrive together, once each
    this.anim(kicker, [{ letterSpacing: '0.7em', opacity: 0, filter: 'blur(4px)' }, { letterSpacing: '0.16em', opacity: 1, filter: 'blur(0)' }], { duration: 420, delay: 120, easing: OUT });
    await this.anim(panel, [{ transform: 'translate(-50%, -40px) scale(1.08)', opacity: 0 }, { transform: 'translate(-50%, 0) scale(1)', opacity: 1 }], { duration: 300, easing: BACK });
    // SKIP ▸▸, in the spot where SHOP ▸ will be: one button, fixed in place,
    // that skips while the result plays and opens the shop once it is done.
    if (this._actBtn) {
      const P = panel.getBoundingClientRect();
      const L = this.layer.getBoundingClientRect();
      this._actBtn.style.top = `${Math.min(P.bottom - L.top + 12, L.height - 64)}px`;
      this._actBtn.hidden = false;
      this.anim(this._actBtn, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
    }
    this.audio.scoreThud?.();
    await this.wait(300);

    let i = 0;
    for (const row of rows) {
      if (!live()) return;
      const r = rowEls[i];
      const v = r.querySelector('.v');
      r.style.opacity = '';
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

    if (!live()) return;
    await this.anim(rule, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 220, easing: OUT });
    this.anim(total, [{ opacity: 0 }, { opacity: 1 }], { duration: 120 });
    // The target is on screen as the total counts, and the bar fills with the
    // count, past the tick or short of it; the verdict slams with the total.
    const countMs = Math.min(1300, 500 + rows.length * 140);
    if (this._verdict) {
      this._verdict.row.style.opacity = '1';
      this.anim(this._verdict.fill, [{ width: '0%' }, { width: `${this._verdict.to}%` }], { duration: countMs, easing: 'cubic-bezier(0.33, 1, 0.68, 1)' });
    }
    let n = 0;
    await this.count(totalV, 0, d.roomScore, countMs, {
      tick: () => this.audio.scoreNote?.(4 + n++, 'points')
    });
    if (!live()) return;
    this.audio.scoreSlam?.();
    this.engine.shake?.(7);
    total.classList.add('slam');
    this.anim(totalV, [{ transform: 'scale(1.6)', color: '#ffffff' }, { transform: 'scale(1)' }], { duration: 360, easing: OUT });
    if (this._verdict) {
      const stamp = this._verdict.row.querySelector('.stamp');
      if (d.beaten) this.audio.scoreLock?.();
      else this.audio.playerHurt?.();
      this.anim(stamp, [{ transform: 'scale(2.2) rotate(-8deg)', opacity: 0 }, { transform: 'scale(1) rotate(-4deg)', opacity: 1 }], { duration: 260, easing: BACK });
    }
    // the corner's table figure lands with the total (after a skip, with the
    // fill-in's pop instead)
    if (this._skipping) this._skipLand.push(() => d.onTotal?.());
    else d.onTotal?.();
    await this.wait(620);
    if (!live()) return;
    if (d.target) await this._clearVerdict(panel, d, live, root);
  }

  /**
   * THE TARGET, THEN THE PAYOUT. One movement at a time: the target stamps
   * BEATEN or MISSED; a missed table breaks a life in the corner; the payout
   * chips pop in one by one; their total flies into your cash as a plate.
   */
  async _clearVerdict(panel, d, live, root) {
    // the target, the bar and the verdict already landed with the total
    if (!live()) return;

    if (!d.beaten) {
      const pip = this.hud.lifeNode((d.livesFrom || 1) - 1);
      if (pip) {
        this.engine.shake?.(8);
        await this.anim(pip, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.8)', opacity: 1, offset: 0.35 }, { transform: 'scale(0.4)', opacity: 0 }], { duration: 520, easing: OUT });
      }
      d.onLifeLost?.();
      await this.wait(300);
      if (!live()) return;
      if (d.lives <= 0) {
        await this.wait(500);
        d.onRunOver?.();
        return;
      }
    }

    if (!this._pay) {
      d.onCashLanded?.();
      return;
    }
    const { box, rowEls, sumV } = this._pay;
    const pays = d.payout;
    await this.anim(box, [{ opacity: 0 }, { opacity: 1 }], { duration: 180 });
    box.style.opacity = '1';
    let total = 0;
    for (const [i, p] of pays.entries()) {
      if (!live()) return;
      const r = rowEls[i];
      this.audio.scoreNote?.(3, 'mult');
      // the line and the total it adds to change together
      total += p.amount;
      sumV.textContent = `+$${total}`;
      await this.anim(r, [{ opacity: 0 }, { opacity: 1 }], { duration: 160 });
      r.style.opacity = '1';
      await this.wait(200);
    }
    await this.wait(260);
    if (!live()) return;
    // With a shop to go to, the cash rains into the wallet as coins, as the
    // last beat of the result (a Skip lands it all at once).
    if (d.shop && d.earned > 0) {
      await this._collect(root, d, live);
      return;
    }
    await this.flyToRun(sumV, d.earned, d.onCashLanded, d.cashFrom, d.cash, { to: this.hud.cashValue, cash: true, label: 'Cash' });
  }

  /* -------------------------------------------------------------- *
   * THE WALLET — collecting cash and spending it (MOMENTS.wallet)
   * -------------------------------------------------------------- */

  /** A node's centre, in layer pixels. */
  _at(node) {
    const r = node.getBoundingClientRect();
    const L = this.layer.getBoundingClientRect();
    return { x: r.left - L.left + r.width / 2, y: r.top - L.top + r.height / 2 };
  }

  /**
   * A smooth arc from a to b: it rises (or dips) by `lift` px at the middle,
   * eases in and out, and scales from s0 to s1 on the way.
   */
  _arc(node, a, b, { ms = 600, lift = 80, s0 = 1, s1 = 1, delay = 0, spin = 0 } = {}) {
    node.style.left = '0px';
    node.style.top = '0px';
    const frames = [];
    const N = 16;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const x = a.x + (b.x - a.x) * e;
      const y = a.y + (b.y - a.y) * e - lift * 4 * e * (1 - e);
      const sc = s0 + (s1 - s0) * e;
      frames.push({ transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${sc}) rotate(${spin * e}deg)` });
    }
    return this.anim(node, frames, { duration: ms, delay, easing: 'linear' });
  }

  /** The wallet takes a hit of money: a pop, a gold glow, a ring. */
  _bumpWallet(box, big = false) {
    box.animate(
      [{ transform: `scale(${big ? 1.3 : 1.14})`, filter: 'brightness(1.6)' }, { transform: 'scale(1)', filter: 'none' }],
      { duration: big ? 420 : 200, easing: OUT }
    );
    if (!big) return;
    const p = this._at(box);
    const ring = el('div', 'mo-ring gold', this.root);
    ring.style.left = `${p.x}px`;
    ring.style.top = `${p.y}px`;
    this.anim(ring, [{ transform: 'translate(-50%,-50%) scale(0.4)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(2.4)', opacity: 0 }], { duration: 520, easing: OUT }).then(() => ring.remove());
  }

  /**
   * COLLECTING THE CASH (picked in review: coin rain, made snappier in the
   * next review), the last beat of the result. The Cash total flashes with a
   * burst behind it, then flies into the wallet as one gold plate with a
   * short trail of coins; the wallet counts up, a ding per tick. Skip lands
   * it all at once: the totals stay in the panel and the wallet shows the
   * new figure.
   */
  async _collect(root, d, live) {
    const wallet = this.hud.cashValue;
    this.hud.lockCash(true);
    wallet.textContent = `$${d.cashFrom}`;
    const { box, sumV } = this._pay || {};
    const from = this._at(sumV || box || root.querySelector('.mo-ledger'));
    // the flash: a burst behind the total, and the total pops
    const burst = el('div', 'mo-burst', this.root);
    burst.style.left = `${from.x}px`;
    burst.style.top = `${from.y}px`;
    this.audio.scoreLock?.();
    this.anim(burst, [{ transform: 'translate(-50%,-50%) scale(0.2) rotate(0deg)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(0.6) rotate(20deg)', opacity: 1, offset: 0.3 }, { transform: 'translate(-50%,-50%) scale(0.75) rotate(40deg)', opacity: 0 }], { duration: 700, easing: OUT }).then(() => burst.remove());
    if (sumV) this.anim(sumV, [{ transform: 'scale(1.45)', filter: 'brightness(1.8)' }, { transform: 'scale(1)', filter: 'none' }], { duration: 320, easing: OUT });
    await this.wait(300);
    if (!live()) return;
    // the flight: one plate, with a few coins trailing it
    const to = this._at(wallet);
    const plate = el('div', 'mo-coinplate', this.root);
    plate.textContent = `+$${d.earned}`;
    this.audio.slingshot?.(0.3);
    for (let k = 0; k < 5; k++) {
      const coin = el('div', 'mo-coin', this.root);
      coin.textContent = '$';
      this._arc(coin, from, to, { ms: 460, lift: 60 + k * 8, s0: 0.9, s1: 0.6, delay: 50 + k * 45 }).then(() => coin.remove());
    }
    await this._arc(plate, from, to, { ms: 460, lift: 60, s0: 1.1, s1: 0.55 });
    plate.remove();
    // the landing: the wallet rings and counts up (after a skip, the new
    // figure lands with the fill-in's pop instead)
    if (this._skipping) {
      this._skipLand.push(() => (wallet.textContent = `$${d.cash}`));
    } else {
      this._bumpWallet(wallet, true);
      let n = 0;
      await this.count(wallet, d.cashFrom, d.cash, Math.min(520, 120 + d.earned * 40), { prefix: '$', tick: () => this.audio.coin?.(n++) });
    }
    d.onCashLanded?.();
    await this.wait(260);
  }

  /** A coin lands: a small gold ring opens where it hit. */
  _coinPop(p) {
    const ring = el('div', 'mo-coinpop', this.root);
    ring.style.left = `${p.x}px`;
    ring.style.top = `${p.y}px`;
    this.anim(ring, [{ transform: 'translate(-50%,-50%) scale(0.3)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(1.7)', opacity: 0 }], { duration: 280, easing: OUT }).then(() => ring.remove());
  }

  /**
   * SPENDING. Money always travels between the wallet and what it pays for,
   * as coins (one per dollar, up to 8), and every coin lands. Spending: each
   * coin leaves the wallet (which ticks down as it goes) and drops into the
   * button that spent it, which takes the hit with a gold ring. A refund:
   * the coins lift off that button and drop into the wallet, which ticks up
   * as each one lands.
   */
  async _payFx(wallet, target, delta, from, to) {
    if (!delta) return;
    const spend = delta < 0;
    const n = Math.min(Math.abs(delta), 8);
    const W = this._at(wallet);
    const T = this._at(target);
    const [a, b] = spend ? [W, T] : [T, W];
    const per = (to - from) / n;
    const tick = (k) => {
      wallet.textContent = `$${k === n - 1 ? to : Math.round(from + per * (k + 1))}`;
      this._bumpWallet(wallet);
    };
    const flights = [];
    for (let k = 0; k < n; k++) {
      const coin = el('div', 'mo-coin', this.root);
      coin.textContent = '$';
      // spending: the wallet ticks down as each coin leaves it
      if (spend) setTimeout(() => tick(k), this.skip ? 0 : k * 60);
      flights.push(this._arc(coin, a, b, { ms: 380, lift: 46 + ((k * 23) % 24), s0: 1, s1: 0.8, delay: k * 60 }).then(() => {
        coin.remove();
        this._coinPop(b);
        this.audio.coin?.(k, spend);
        if (spend) target.animate([{ transform: 'scale(1.1)', filter: 'brightness(1.6)' }, { transform: 'scale(1)', filter: 'none' }], { duration: 180, easing: OUT });
        else tick(k);
      }));
    }
    await Promise.all(flights);
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
