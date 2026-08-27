/**
 * HUD.js — the heads-up display.
 *
 * Pure DOM, built imperatively into `#ui-layer`. Text stays crisp on high-DPI
 * phones and costs no draw calls. Every value is cached so a frame that changes
 * nothing performs zero DOM writes — the HUD must never be the reason a frame
 * misses its budget.
 *
 * WHAT IT HAS TO ANSWER, AT ALL TIMES, WITHOUT BEING ASKED:
 *
 *   1. What does winning this room mean?   the contract line, in words
 *   2. How am I doing against it?          the progress pips
 *   3. What is it costing me?              the stroke chips
 *   4. What is this shot worth?            the multiplier pill
 *   5. What have I got?                    run score, hull, freeze charges
 *
 * Those five used to be spread between a room counter, a wave line and a combo
 * that meant nothing on its own. Every one of them is now a sentence or a
 * countable row of marks, because a number the player has to interpret is a
 * number that does not get read mid-shot.
 */

import * as THREE from 'three';

const SVG_NS = 'http://www.w3.org/2000/svg';

function el(tag, className, parent) {
  const node = document.createElement(tag);
  if (className) node.className = className;
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

    // The contract. This is the single most important thing on the screen and
    // it is written as a sentence, not encoded.
    const contractBlock = el('div', 'hud-contract', top);
    this.contractLabel = el('div', 'hud-label', contractBlock);
    this.contractLabel.textContent = 'Contract';
    this.contractText = el('div', 'contract-text', contractBlock);
    this.contractPips = el('div', 'contract-pips', contractBlock);

    const scoreBlock = el('div', 'hud-score', top);
    el('div', 'hud-label', scoreBlock).textContent = 'Run';
    this.scoreValue = el('div', 'score-value', scoreBlock);

    /* ---------------- build strip ---------------- */
    this.buildStrip = el('div', 'hud-build', this.root);

    /* ---------------- multiplier ---------------- */
    this.combo = el('div', 'hud-combo', this.root);
    this.comboMult = el('div', 'combo-mult', this.combo);
    this.comboCount = el('div', 'combo-count', this.combo);

    /* ---------------- strokes ---------------- */
    // The budget, as countable marks. "3 of 6" is a fact you have to read;
    // three lit cues and three dark ones is a fact you can glance at.
    const strokeBlock = el('div', 'hud-strokes', this.root);
    el('div', 'hud-label', strokeBlock).textContent = 'Shots';
    this.strokeRow = el('div', 'stroke-row', strokeBlock);
    this.strokeText = el('div', 'stroke-text', strokeBlock);

    /* ---------------- freeze charges ---------------- */
    const freezeBlock = el('div', 'hud-freeze', this.root);
    el('div', 'hud-label', freezeBlock).textContent = 'Freeze';
    this.freezeRow = el('div', 'freeze-row', freezeBlock);

    /* ---------------- banner ---------------- */
    this.banner = el('div', 'hud-banner', this.root);
    this.bannerTitle = el('div', 'banner-title', this.banner);
    this.bannerSub = el('div', 'banner-sub', this.banner);
    this.bannerTimer = 0;

    /* ---------------- room scorecard ---------------- */
    this.card = el('div', 'hud-card', this.root);
    this.cardHead = el('div', 'card-head', this.card);
    this.cardStatus = el('div', 'card-status', this.cardHead);
    this.cardTitle = el('div', 'card-title', this.cardHead);
    this.cardLines = el('div', 'card-lines', this.card);
    this.cardTotals = el('div', 'card-totals', this.card);
    this.cardPrompt = el('div', 'card-prompt', this.card);

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
      contract: '',
      progress: '',
      strokes: '',
      freeze: -1,
      score: -1,
      mult: -1,
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
    // ONE VOICE AT A TIME.
    //
    // While a lesson is up, the coach card is the instruction AND the
    // correction — it is the component the player has learned to read. A
    // banner firing over the same event ("Scratch" here, "Scratch" there,
    // "SCRATCH" floating off the felt) is three sources for one fact, and the
    // player parses none of them. The card wins; the banner stands down.
    if (this.layer.classList.contains('coaching')) return;
    this.bannerTitle.textContent = title;
    this.bannerSub.textContent = sub;
    this.bannerTimer = duration;
    this.banner.classList.add('visible');
  }

  hideBanner() {
    this.bannerTimer = 0;
    this.banner.classList.remove('visible');
  }

  /**
   * The room scorecard: where a saved stroke actually gets paid.
   *
   * Shown at the end of every room, pass or fail, because the moment the
   * economy becomes legible is the moment the player can start playing it.
   *
   * @param {{level:number, filled:boolean, ledger:Array, roomScore:number,
   *          runScore:number, penalty?:{standing:number, damage:number}}} data
   */
  showScorecard(data) {
    this.cardStatus.textContent = data.filled ? 'Contract filled' : 'Out of shots';
    this.cardStatus.classList.toggle('failed', !data.filled);
    this.cardTitle.textContent = `Room ${String(data.level).padStart(2, '0')}`;

    this.cardLines.textContent = '';
    for (const entry of data.ledger || []) {
      const row = el('div', `card-line${entry.id === 'saved' ? ' hero' : ''}`, this.cardLines);
      el('span', 'card-k', row).textContent = entry.label;
      el('span', 'card-d', row).textContent = entry.detail || '';
      el('span', 'card-v', row).textContent = `+${entry.amount.toLocaleString()}`;
    }
    if (data.penalty && data.penalty.standing > 0) {
      const row = el('div', 'card-line bad', this.cardLines);
      el('span', 'card-k', row).textContent = 'Balls left';
      el('span', 'card-d', row).textContent = `${data.penalty.standing} still up`;
      el('span', 'card-v', row).textContent = `−${data.penalty.damage} hull`;
    }
    if (!this.cardLines.childElementCount) {
      const row = el('div', 'card-line', this.cardLines);
      el('span', 'card-k', row).textContent = 'Nothing scored';
      el('span', 'card-d', row).textContent = '';
      el('span', 'card-v', row).textContent = '0';
    }

    this.cardTotals.textContent = '';
    const room = el('div', 'card-total', this.cardTotals);
    el('span', 'card-k', room).textContent = 'Room';
    el('span', 'card-v', room).textContent = data.roomScore.toLocaleString();
    const run = el('div', 'card-total run', this.cardTotals);
    el('span', 'card-k', run).textContent = 'Run';
    el('span', 'card-v', run).textContent = data.runScore.toLocaleString();

    // The banner says the same thing the card's own header says, one layer
    // behind it. Two readouts of one event, overlapping, is worse than either.
    this.hideBanner();
    this.cardPrompt.textContent = 'Shoot into an exit';
    this.card.classList.add('visible');
  }

  hideScorecard() {
    this.card.classList.remove('visible');
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

    // --- the contract, in words ---
    const line = s.cleared ? 'CONTRACT FILLED' : s.contractText || '';
    if (line !== cache.contract) {
      cache.contract = line;
      this.contractText.textContent = line;
      this.contractText.classList.toggle('done', !!s.cleared);
    }
    const progress = `${s.ballsDown}/${s.rack}`;
    if (progress !== cache.progress) {
      cache.progress = progress;
      this.contractPips.textContent = '';
      for (let i = 0; i < (s.rack || 0); i++) {
        el('span', `pip${i < s.ballsDown ? ' on' : ''}`, this.contractPips);
      }
    }

    // --- run score ---
    if (s.displayScore !== cache.score) {
      cache.score = s.displayScore;
      this.scoreValue.textContent = (s.displayScore || 0).toLocaleString();
    }

    // --- the stroke budget ---
    const strokeKey = `${s.strokesLeft}/${s.strokesTotal}`;
    if (strokeKey !== cache.strokes) {
      cache.strokes = strokeKey;
      this.strokeRow.textContent = '';
      for (let i = 0; i < (s.strokesTotal || 0); i++) {
        el('span', `cue${i < s.strokesLeft ? '' : ' spent'}`, this.strokeRow);
      }
      this.strokeText.textContent = `${s.strokesLeft} of ${s.strokesTotal} left`;
      this.strokeRow.classList.toggle('last', s.strokesLeft === 1);
      this.strokeRow.classList.toggle('out', s.strokesLeft === 0);
    }

    // --- freeze charges ---
    if (s.freezeCharges !== cache.freeze) {
      cache.freeze = s.freezeCharges;
      this.freezeRow.textContent = '';
      const shown = Math.max(3, s.freezeCharges);
      for (let i = 0; i < shown; i++) {
        el('span', `frz${i < s.freezeCharges ? ' on' : ''}`, this.freezeRow);
      }
      this.root.classList.toggle('has-freeze', s.freezeCharges > 0);
    }

    // --- the multiplier, while a stroke is running ---
    const mult = s.midStroke ? s.multiplier : 0;
    if (mult !== cache.mult) {
      cache.mult = mult;
      if (mult > 1) {
        this.combo.classList.add('visible');
        this.comboMult.textContent = `×${mult}`;
        const parts = [];
        if (s.banks) parts.push(`${s.banks} bank${s.banks > 1 ? 's' : ''}`);
        if (s.ballsTouched) parts.push(`${s.ballsTouched} ball${s.ballsTouched > 1 ? 's' : ''}`);
        this.comboCount.textContent = parts.join(' · ') || 'building';
        this.combo.classList.remove('pop');
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
