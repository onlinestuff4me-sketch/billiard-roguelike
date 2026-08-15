/**
 * HUD.js — the heads-up display.
 *
 * Pure DOM, built imperatively into `#ui-layer`. Text stays crisp on high-DPI
 * phones and costs no draw calls. Every value is cached so a frame that changes
 * nothing performs zero DOM writes — the HUD must never be the reason a frame
 * misses its budget.
 *
 * Layout follows the style guide: top ~12% and bottom ~10% are HUD, the middle
 * 78% is untouched play space.
 */

import * as THREE from 'three';
import { CSS_PALETTE } from '../config.js';

const FOCUS_RADIUS = 42;
const FOCUS_CIRCUMFERENCE = 2 * Math.PI * FOCUS_RADIUS;

const SVG_NS = 'http://www.w3.org/2000/svg';

function el(tag, className, parent) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (parent) parent.appendChild(node);
  return node;
}

function svgEl(tag, attrs, parent) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  if (parent) parent.appendChild(node);
  return node;
}

export class HUD {
  /**
   * @param {HTMLElement} layer the `#ui-layer` element
   * @param {{ camera: import('three').Camera, stage: HTMLElement }} context
   *        used to project world-space door labels into stage pixels
   */
  constructor(layer, context = {}) {
    this.layer = layer;
    this.camera = context.camera || null;
    this.stage = context.stage || layer;
    this.root = el('div', 'hud', layer);

    /* ---------------- top bar ---------------- */
    const top = el('div', 'hud-top', this.root);

    const hpBlock = el('div', 'hud-hp', top);
    el('div', 'hud-label', hpBlock).textContent = 'Hull';
    const hpBar = el('div', 'hp-bar', hpBlock);
    this.hpGhost = el('div', 'hp-ghost', hpBar);
    this.hpFill = el('div', 'hp-fill', hpBar);
    this.hpText = el('div', 'hp-text', hpBlock);

    const roomBlock = el('div', 'hud-room', top);
    el('div', 'hud-label', roomBlock).textContent = 'Room';
    this.roomNumber = el('div', 'room-number', roomBlock);
    this.waveText = el('div', 'wave-text', roomBlock);

    const layoutBlock = el('div', 'hud-layout', top);
    el('div', 'hud-label', layoutBlock).textContent = 'Table';
    this.layoutName = el('div', 'layout-name', layoutBlock);

    /* ---------------- build strip ---------------- */
    this.buildStrip = el('div', 'hud-build', this.root);

    /* ---------------- combo ---------------- */
    this.combo = el('div', 'hud-combo', this.root);
    this.comboMult = el('div', 'combo-mult', this.combo);
    this.comboCount = el('div', 'combo-count', this.combo);

    /* ---------------- radial focus gauge ---------------- */
    const focusBlock = el('div', 'hud-focus', this.root);
    const svg = svgEl('svg', { viewBox: '0 0 100 100', class: 'focus-svg' }, focusBlock);
    svgEl(
      'circle',
      {
        cx: 50,
        cy: 50,
        r: FOCUS_RADIUS,
        fill: 'none',
        stroke: 'rgba(234,246,255,0.12)',
        'stroke-width': 7
      },
      svg
    );
    this.focusArc = svgEl(
      'circle',
      {
        cx: 50,
        cy: 50,
        r: FOCUS_RADIUS,
        fill: 'none',
        stroke: CSS_PALETTE.cyan,
        'stroke-width': 7,
        'stroke-linecap': 'round',
        'stroke-dasharray': FOCUS_CIRCUMFERENCE,
        'stroke-dashoffset': 0,
        transform: 'rotate(-90 50 50)'
      },
      svg
    );
    this.focusValue = el('div', 'focus-value', focusBlock);
    el('div', 'focus-label', focusBlock).textContent = 'Focus';

    /* ---------------- banner ---------------- */
    this.banner = el('div', 'hud-banner', this.root);
    this.bannerTitle = el('div', 'banner-title', this.banner);
    this.bannerSub = el('div', 'banner-sub', this.banner);
    this.bannerTimer = 0;

    /* ---------------- damage vignette ---------------- */
    this.damageVeil = el('div', 'hud-damage', this.root);
    this.damageTimer = 0;

    /* ---------------- world-projected door labels ---------------- */
    this.doorLayer = el('div', 'hud-doors', this.root);
    this.doorLabels = [];
    this._projection = new THREE.Vector3();

    // Cached values so we only touch the DOM when something actually changed.
    this._cache = {
      hp: -1,
      ghost: -1,
      focus: -1,
      level: -1,
      wave: '',
      chain: -1,
      layout: '',
      buildKey: ''
    };
    this._ghost = 1;
  }

  /* ---------------------------------------------------------------- *
   * Feedback
   * ---------------------------------------------------------------- */

  flashDamage() {
    this.damageTimer = 0.4;
  }

  showBanner(title, sub = '', duration = 2.2) {
    this.bannerTitle.textContent = title;
    this.bannerSub.textContent = sub;
    this.bannerTimer = duration;
    this.banner.classList.add('visible');
  }

  hideBanner() {
    this.bannerTimer = 0;
    this.banner.classList.remove('visible');
  }

  /** Render the owned-boon chips. Only rebuilds when the build changes. */
  setBuild(owned) {
    const key = owned.map((o) => `${o.def.id}:${o.rank}:${o.rarity}`).join('|');
    if (key === this._cache.buildKey) return;
    this._cache.buildKey = key;
    this.buildStrip.textContent = '';
    for (const entry of owned) {
      const chip = el('div', `build-chip ${entry.rarity} phase-${entry.def.phase}`, this.buildStrip);
      el('span', 'chip-glyph', chip).textContent = entry.def.glyph;
      el('span', 'chip-name', chip).textContent = entry.def.name;
      if (entry.rank > 1) el('span', 'chip-rank', chip).textContent = `×${entry.rank}`;
      chip.title = `${entry.def.name} — ${entry.def.desc(entry.values)}`;
    }
  }

  /**
   * Attach reward labels to the exit doors. Doors must telegraph what they
   * give *before* the player commits the shot, or the exit is not a choice.
   * @param {Array<{x:number, z:number, text:string, color:string}>} doors
   */
  setDoors(doors) {
    this.doorLayer.textContent = '';
    this.doorLabels = [];
    for (const door of doors) {
      const node = el('div', 'door-label', this.doorLayer);
      node.textContent = door.text;
      node.style.color = door.color;
      node.style.borderColor = door.color;
      this.doorLabels.push({ node, x: door.x, z: door.z });
    }
  }

  _updateDoorLabels() {
    if (!this.doorLabels.length || !this.camera) return;
    const w = this.stage.clientWidth;
    const h = this.stage.clientHeight;
    for (const label of this.doorLabels) {
      this._projection.set(label.x, 0.6, label.z).project(this.camera);
      const px = (this._projection.x * 0.5 + 0.5) * w;
      const py = (-this._projection.y * 0.5 + 0.5) * h;
      label.node.style.transform = `translate(${px}px, ${py}px) translate(-50%, -50%)`;
    }
  }

  /* ---------------------------------------------------------------- *
   * Frame update
   * ---------------------------------------------------------------- */

  /**
   * @param {object} s snapshot
   * @param {number} rawDt real seconds (HUD animation is never slowed)
   */
  update(s, rawDt) {
    const cache = this._cache;

    // --- health, with a lagging "damage ghost" fill ---
    const hpRatio = Math.max(0, Math.min(1, s.hp / s.maxHp));
    if (Math.abs(hpRatio - cache.hp) > 0.001) {
      cache.hp = hpRatio;
      this.hpFill.style.width = `${hpRatio * 100}%`;
      this.hpText.textContent = `${Math.ceil(s.hp)}/${s.maxHp}`;
      this.hpFill.classList.toggle('critical', hpRatio < 0.3);
    }
    if (this._ghost > hpRatio) {
      this._ghost = Math.max(hpRatio, this._ghost - rawDt * 0.55);
    } else {
      this._ghost = hpRatio;
    }
    if (Math.abs(this._ghost - cache.ghost) > 0.002) {
      cache.ghost = this._ghost;
      this.hpGhost.style.width = `${this._ghost * 100}%`;
    }

    // --- radial focus gauge ---
    const focusRatio = Math.max(0, Math.min(1, s.focus / s.focusMax));
    if (Math.abs(focusRatio - cache.focus) > 0.004) {
      cache.focus = focusRatio;
      this.focusArc.setAttribute(
        'stroke-dashoffset',
        String(FOCUS_CIRCUMFERENCE * (1 - focusRatio))
      );
      this.focusValue.textContent = `${s.focus.toFixed(1)}s`;
      const low = focusRatio < 0.12;
      this.focusArc.setAttribute('stroke', low ? CSS_PALETTE.magenta : CSS_PALETTE.cyan);
      this.root.classList.toggle('focus-low', low);
    }

    // --- room / wave / layout ---
    if (s.level !== cache.level) {
      cache.level = s.level;
      this.roomNumber.textContent = String(s.level).padStart(2, '0');
    }
    const waveLabel = s.waveCount > 1 ? `Wave ${s.waveIndex + 1}/${s.waveCount}` : '';
    if (waveLabel !== cache.wave) {
      cache.wave = waveLabel;
      this.waveText.textContent = waveLabel;
    }
    if (s.layout !== cache.layout) {
      cache.layout = s.layout;
      this.layoutName.textContent = s.layout || '';
    }

    // --- combo ---
    if (s.chain !== cache.chain) {
      cache.chain = s.chain;
      if (s.chain > 1) {
        this.combo.classList.add('visible');
        this.comboMult.textContent = `×${s.chainMult.toFixed(1)}`;
        this.comboCount.textContent = `${s.chain} chain`;
        this.combo.classList.remove('pop');
        // Force a reflow so the pop animation can restart on every step.
        void this.combo.offsetWidth;
        this.combo.classList.add('pop');
      } else {
        this.combo.classList.remove('visible');
      }
    }

    this._updateDoorLabels();

    // --- transient overlays ---
    if (this.bannerTimer > 0) {
      this.bannerTimer -= rawDt;
      if (this.bannerTimer <= 0) this.banner.classList.remove('visible');
    }
    if (this.damageTimer > 0) {
      this.damageTimer -= rawDt;
      this.damageVeil.style.opacity = String(Math.max(0, this.damageTimer / 0.4) * 0.55);
      if (this.damageTimer <= 0) this.damageVeil.style.opacity = '0';
    }
  }

  dispose() {
    this.root.remove();
  }
}

export default HUD;
