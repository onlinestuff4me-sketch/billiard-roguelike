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
    absorb(root, () => {
      if (!this._clearReady) this.skipNow();
    });
    const act = el('button', 'mo-nexttable mo-act skip', root);
    act.type = 'button';
    act.innerHTML = 'Skip <span aria-hidden="true">▸▸</span>';
    act.hidden = true;
    act.style.bottom = 'auto';
    this._actBtn = act;
    let onShop = null;
    absorb(act);
    act.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (onShop) onShop();
      else if (!this._clearReady) this.skipNow();
    });
    this._clearReady = false;
    this._clearRoot = root;
    this._toCollect = false;
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
    if (!live() || d.lives <= 0) {
      act.hidden = true;
      return;
    }
    // THE SHOP replaces the exits: the ledger hands over to it, and the next
    // table is a button inside it.
    if (d.shop) {
      this.skip = false;
      this._clearReady = true;
      // The same button, now the way into the shop. With cash to collect it
      // is a CASH OUT button (Balatro, Gambonanza): one tap banks the cash
      // into the wallet, and the shop follows on its own.
      act.classList.remove('skip');
      const collect = this._toCollect;
      if (collect) {
        act.classList.add('collect');
        act.innerHTML = this.variant('wallet') === 'coins' ? `Get my $${d.earned}!` : `Cash out <b>+$${d.earned}</b>`;
      } else {
        act.textContent = 'Shop ▸';
      }
      this.anim(act, [{ transform: 'translate(-50%, 0) scale(1.12)' }, { transform: 'translate(-50%, 0) scale(1)' }], { duration: 260, easing: BACK });
      await new Promise((resolve) => (onShop = resolve));
      if (!live()) return;
      onShop = null;
      if (collect) {
        // a tap during the collect skips it to the end
        this._clearReady = false;
        await this._collect(root, d, act, live);
        if (!live()) return;
        this.skip = false;
        this._clearReady = true;
      }
      act.remove();
      this._actBtn = null;
      await this._openShop(root, d.shop, live);
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
   * THE SHOP, in CASH, with three actions (decided in review): buy a card,
   * hold a card for the next shop, or reroll. Gold is money and nothing else;
   * rarity is the 1–3 diamonds on each card, not a colour.
   */
  async _openShop(root, shop, live) {
    const wstyle = this.variant('wallet') || 'cashout';
    const ledger = root.querySelector('.mo-ledger');
    if (ledger) {
      // coins: the results fly up and away (Gambonanza); otherwise they sink and fade
      const out = wstyle === 'coins'
        ? [{ transform: 'translate(-50%, 0)', opacity: 1 }, { transform: 'translate(-50%, -115%)', opacity: 1 }]
        : [{ transform: 'translate(-50%, 0)', opacity: 1 }, { transform: 'translate(-50%, 30px) scale(0.97)', opacity: 0 }];
      await this.anim(ledger, out, { duration: wstyle === 'coins' ? 360 : 280, easing: IN });
      ledger.remove();
    }
    if (!live()) return;
    const panel = el('div', 'mo-shop', root);
    const head = el('div', 'mo-shop-head', panel);
    el('div', 'mo-kicker', head).textContent = 'Shop';
    const money = (n) => `$${n}`;
    el('div', 'mo-shop-note', panel).textContent = 'Buy a card, or hold one for the next shop. Tap again to undo. Cards you leave are gone.';
    const grid = el('div', 'mo-cards', panel);
    const tools = el('div', 'mo-shop-tools', panel);
    // THE WALLET while shopping (MOMENTS.wallet). Only ever one on screen:
    // the corner box, lit (cash out, coins), or the same box glided into the
    // shop's header (glide).
    let walletV = this.hud.cashValue;
    let wallet = null;
    this.hud.lockCash(true);
    walletV.textContent = money(shop.cash());
    if (wstyle === 'glide') {
      wallet = el('div', 'mo-wallet move', head);
      el('span', 'k', wallet).textContent = 'Your cash';
      walletV = el('span', 'v', wallet);
      walletV.textContent = money(shop.cash());
    }
    const reroll = el('button', 'mo-tool reroll', tools);
    reroll.type = 'button';
    const next = el('button', 'mo-nexttable', root);
    next.type = 'button';
    next.textContent = 'Next table ▸';

    // Every buy, hold, undo or reroll moves money between the wallet and what
    // it pays for, and the wallet counts to its new figure as it goes.
    let payId = 0;
    const spendTo = (before, target) => {
      const to = shop.cash();
      const delta = to - before;
      if (!delta) return;
      const shown = Number(String(walletV.textContent).replace(/[^0-9]/g, '')) || 0;
      const my = ++payId;
      this._payFx(walletV, target, delta, shown, to).then(() => {
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
    const renderCards = (animate, still = null) => {
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
        // a held card stays put through a reroll; the rest deal in
        if (animate && !(still && still.has(it.id))) this.anim(c, [{ transform: 'translateY(14px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 260, delay: 70 * i, easing: BACK });
      });
      renderTools();
    };
    // A REROLL ANSWERS THE TAP: the button flashes, the old cards leave (held
    // ones stay put), the new ones come in, and the new price pops.
    let rolling = false;
    tap(reroll, async () => {
      if (rolling) return;
      const before = shop.cash();
      const keep = new Set(shop.items.filter((it) => it.held && !it.sold).map((it) => it.id));
      if (!shop.reroll()) return shake(reroll);
      rolling = true;
      this.anim(reroll, [{ filter: 'brightness(2.2)', transform: 'scale(0.96)' }, { filter: 'none', transform: 'none' }], { duration: 260, easing: OUT });
      spendTo(before, reroll);
      const leaving = [...grid.querySelectorAll('.mo-card')].filter((c) => !keep.has(c._item.id));
      await Promise.all(leaving.map((c, i) => this.anim(c, [{ transform: 'none', opacity: 1 }, { transform: 'translateY(-10px) scale(0.94)', opacity: 0 }], { duration: 160, delay: 40 * i, easing: IN })));
      if (!live()) return;
      renderCards(true, keep);
      const p = reroll.querySelector('.p');
      if (p) this.anim(p, [{ transform: 'scale(1.6)', color: '#ffffff' }, { transform: 'scale(1)' }], { duration: 300, easing: OUT });
      rolling = false;
    });
    tap(next, async () => {
      next.disabled = true;
      // glide: the wallet goes home to its corner before the table loads
      if (wallet) await this._glideWallet(false, wallet, walletV);
      shop.next();
    });

    if (wstyle === 'coins') {
      // Gambonanza: the shop slides in from the side, NEXT pops in last
      this.anim(panel, [{ transform: 'translate(60%, 0)', opacity: 0 }, { transform: 'translate(-50%, 0)', opacity: 1 }], { duration: 420, easing: OUT });
      this.anim(next, [{ transform: 'translate(-50%, 0) scale(0.2)', opacity: 0 }, { transform: 'translate(-50%, 0) scale(1)', opacity: 1 }], { duration: 300, delay: 620, easing: BACK });
    } else {
      this.anim(panel, [{ transform: 'translate(-50%, 24px)', opacity: 0 }, { transform: 'translate(-50%, 0)', opacity: 1 }], { duration: 320, easing: OUT });
      this.anim(next, [{ transform: 'translate(-50%, 20px)', opacity: 0 }, { transform: 'translate(-50%, 0)', opacity: 1 }], { duration: 300, delay: 420, easing: BACK });
    }
    renderCards(true);
    if (wallet) {
      wallet.style.visibility = 'hidden';
      await this.wait(200);
      await this._glideWallet(true, wallet, walletV);
    }
  }

  /**
   * GLIDE: the wallet box itself lifts out of the corner and travels into
   * the shop's header on a soft curve, growing as it goes (and back again on
   * the way out). Its spot in the corner stays empty while you shop.
   */
  async _glideWallet(into, wallet, walletV) {
    const corner = this.hud.cashValue;
    const [fromBox, toBox] = into ? [corner, walletV] : [walletV, corner];
    const a = fromBox.getBoundingClientRect();
    const b = toBox.getBoundingClientRect();
    const L = this.layer.getBoundingClientRect();
    const ghost = el('div', 'mo-walletglide', this.root);
    ghost.textContent = walletV.textContent;
    wallet.style.visibility = 'hidden';
    this.hud.root.classList.add('wallet-away');
    const P = (r) => ({ x: r.left - L.left + r.width / 2, y: r.top - L.top + r.height / 2 });
    const big = walletV.getBoundingClientRect().height / Math.max(1, corner.getBoundingClientRect().height);
    this.audio.slingshot?.(0.2);
    await this._arc(ghost, P(a), P(b), { ms: 620, lift: 36, s0: into ? 1 : big, s1: into ? big : 1 });
    ghost.remove();
    if (into) {
      wallet.style.visibility = '';
      this._bumpWallet(walletV);
    } else {
      corner.textContent = walletV.textContent;
      this.hud.root.classList.remove('wallet-away');
      this._bumpWallet(corner);
    }
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
      // coins reads like Gambonanza's results: a count, the reason with its
      // rule, the dollars
      const counted = this.variant('wallet') === 'coins';
      const rowEls = d.payout.map((p) => {
        const r = el('div', `mo-cash-row${counted ? ' counted' : ''}`, box);
        if (counted) el('span', 'n', r).textContent = p.count ?? '';
        el('span', 'k', r).textContent = p.label;
        el('span', 'd', r).textContent = counted ? (p.rule ? `(${p.rule})` : '') : p.detail || '';
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
    // the corner's table figure lands with the total
    d.onTotal?.();
    await this.wait(620);
    if (!live()) return;
    if (d.target) await this._clearVerdict(panel, d, live);
  }

  /**
   * THE TARGET, THEN THE PAYOUT. One movement at a time: the target stamps
   * BEATEN or MISSED; a missed table breaks a life in the corner; the payout
   * chips pop in one by one; their total flies into your cash as a plate.
   */
  async _clearVerdict(panel, d, live) {
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
    // With a shop to go to, the cash waits for CASH OUT, so banking it is the
    // player's own tap.
    if (d.shop && d.earned > 0) {
      this._toCollect = true;
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

  /** Roll a wallet figure to `to`, one coin tick per dollar. */
  _rollWallet(node, from, to, ms) {
    const my = (this._rollId = (this._rollId || 0) + 1);
    return new Promise((resolve) => {
      const t0 = performance.now();
      let last = from;
      const step = () => {
        if (my !== this._rollId) return resolve();
        const u = this.skip ? 1 : Math.min(1, (performance.now() - t0) / Math.max(1, ms));
        const e = 1 - Math.pow(1 - u, 2);
        const v = Math.round(from + (to - from) * e);
        if (v !== last) {
          last = v;
          this.audio.coin?.(Math.abs(v - from), to < from);
        }
        node.textContent = `$${v}`;
        if (u < 1) requestAnimationFrame(step);
        else resolve();
      };
      step();
    });
  }

  /**
   * CASH OUT. Cash out / Glide: the Cash total lifts off as one plate and
   * arcs into the wallet, which counts up. Coins (Gambonanza): a burst, then
   * every line pays out its dollars as coins, one ding per coin.
   */
  async _collect(root, d, act, live) {
    const style = this.variant('wallet');
    const wallet = this.hud.cashValue;
    this.hud.lockCash(true);
    wallet.textContent = `$${d.cashFrom}`;
    this.anim(act, [{ transform: 'translate(-50%, 0) scale(0.92)' }, { transform: 'translate(-50%, 0) scale(1)' }], { duration: 180, easing: OUT });
    act.disabled = true;
    const { box, rowEls, sumV } = this._pay || {};
    const to = () => this._at(wallet);
    if (style === 'coins') {
      // the burst behind the panel, the moment you tap
      const panel = root.querySelector('.mo-ledger');
      const P = this._at(box || panel);
      const burst = el('div', 'mo-burst', this.root);
      burst.style.left = `${P.x}px`;
      burst.style.top = `${P.y}px`;
      this.audio.scoreLock?.();
      this.anim(burst, [{ transform: 'translate(-50%,-50%) scale(0.3) rotate(0deg)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1) rotate(20deg)', opacity: 1, offset: 0.3 }, { transform: 'translate(-50%,-50%) scale(1.25) rotate(40deg)', opacity: 0 }], { duration: 900, easing: OUT }).then(() => burst.remove());
      await this.wait(260);
      let cur = d.cashFrom;
      let n = 0;
      for (const [i, p] of (d.payout || []).entries()) {
        if (!live()) return;
        const row = rowEls?.[i];
        const v = row?.querySelector('.v');
        const from = v ? this._at(v) : P;
        row?.classList.add('paying');
        const flights = [];
        for (let k = 0; k < p.amount; k++) {
          const coin = el('div', 'mo-coin', this.root);
          coin.textContent = '$';
          const lift = 50 + ((k * 37) % 50);
          flights.push(this._arc(coin, from, to(), { ms: 520, lift, s0: 1.2, s1: 0.7, delay: k * 70 }).then(() => {
            coin.remove();
            cur += 1;
            wallet.textContent = `$${cur}`;
            this.audio.coin?.(n++);
            this._bumpWallet(wallet);
          }));
        }
        if (v) this.anim(v, [{ opacity: 1 }, { opacity: 0.25 }], { duration: Math.max(200, p.amount * 70), easing: 'linear' });
        await Promise.all(flights);
        row?.classList.remove('paying');
        row?.classList.add('paid');
      }
      wallet.textContent = `$${d.cash}`;
      this._bumpWallet(wallet, true);
      if (sumV) sumV.parentNode.classList.add('paid');
      d.onCashLanded?.();
      await this.wait(380);
      return;
    }
    // CASH OUT / GLIDE: one plate, one smooth arc, the wallet counts up
    const a = sumV ? this._at(sumV) : this._at(act);
    const plate = el('div', 'sf-plate pts mo-bankplate cash mo-arcplate', this.root);
    el('b', '', plate).textContent = `+$${d.earned}`;
    el('small', '', plate).textContent = 'Cash';
    this.audio.scoreThud?.();
    if (sumV) this.anim(sumV.parentNode, [{ opacity: 1 }, { opacity: 0.3 }], { duration: 300 });
    await this._arc(plate, a, a, { ms: 200, lift: 0, s0: 0.6, s1: 1.1 });
    this.audio.slingshot?.(0.3);
    await this._arc(plate, a, to(), { ms: 640, lift: 90, s0: 1.1, s1: 0.45 });
    plate.remove();
    this._bumpWallet(wallet, true);
    await this._rollWallet(wallet, d.cashFrom, d.cash, Math.min(900, 160 + d.earned * 70));
    d.onCashLanded?.();
    await this.wait(300);
  }

  /**
   * SPENDING. Money always travels between the wallet and the thing it pays
   * for: spending leaves the wallet for the card, a refund comes back.
   * Coins: one coin per dollar (up to 8). Otherwise: a price chip.
   */
  async _payFx(wallet, target, delta, from, to) {
    if (!delta) return;
    const style = this.variant('wallet');
    const spend = delta < 0;
    const amt = Math.abs(delta);
    const W = this._at(wallet);
    const T = this._at(target);
    const [a, b] = spend ? [W, T] : [T, W];
    if (style === 'coins') {
      const n = Math.min(amt, 8);
      let cur = from;
      const per = (to - from) / n;
      const flights = [];
      for (let k = 0; k < n; k++) {
        const coin = el('div', 'mo-coin', this.root);
        coin.textContent = '$';
        const step = () => {
          const next = Math.round(from + per * (k + 1));
          cur = k === n - 1 ? to : next;
          wallet.textContent = `$${cur}`;
          this.audio.coin?.(k, spend);
          this._bumpWallet(wallet);
        };
        // spending: the wallet ticks down as each coin leaves; a refund ticks up as each lands
        if (spend) setTimeout(step, this.skip ? 0 : k * 60);
        flights.push(this._arc(coin, a, b, { ms: 420, lift: 40 + ((k * 23) % 30), s0: spend ? 0.7 : 1, s1: spend ? 1 : 0.7, delay: k * 60 }).then(() => {
          coin.remove();
          if (!spend) step();
        }));
      }
      await Promise.all(flights);
      return;
    }
    const chip = el('div', `mo-paychip${spend ? '' : ' up'}`, this.root);
    chip.textContent = `${spend ? '−' : '+'}$${amt}`;
    if (spend) {
      this._bumpWallet(wallet);
      this._rollWallet(wallet, from, to, Math.min(500, 120 + amt * 50));
    }
    await this._arc(chip, a, b, { ms: 460, lift: 50, s0: spend ? 0.8 : 1.1, s1: spend ? 1.1 : 0.7 });
    chip.remove();
    if (!spend) {
      this._bumpWallet(wallet);
      await this._rollWallet(wallet, from, to, Math.min(500, 120 + amt * 50));
    } else {
      target.animate([{ filter: 'brightness(2)' }, { filter: 'none' }], { duration: 300, easing: OUT });
    }
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
