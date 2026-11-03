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
 *   1. What does winning this room mean?   the mission line, in words
 *   2. How am I doing against it?          the progress pips
 *   3. What is it costing me?              the stroke chips
 *   4. What is this shot worth?            the multiplier pill
 *   5. What have I got?                    table points vs target, lives, cash, freeze charges
 *
 * Those five used to be spread between a room counter, a wave line and a combo
 * that meant nothing on its own. Every one of them is now a sentence or a
 * countable row of marks, because a number the player has to interpret is a
 * number that does not get read mid-shot.
 */

import * as THREE from 'three';

const SVG_NS = 'http://www.w3.org/2000/svg';
export const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.6-4.7-9.4-9.4C1.2 7.6 3.3 4 6.8 4c2.2 0 3.7 1.3 5.2 3.1C13.5 5.3 15 4 17.2 4c3.5 0 5.6 3.6 4.2 7.1-1.8 4.7-9.4 9.4-9.4 9.4Z"/></svg>';

function el(tag, className, parent) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (parent) parent.appendChild(node);
  return node;
}

/**
 * Pass as a banner's duration to make it wait for a tap instead of a clock.
 * Reserved for the mission, which the player has to READ before the room
 * makes any sense.
 */
export const HOLD = Symbol('hold-until-dismissed');

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
    this.topBand = top;

    // LIVES and CASH: what you carry from table to table. Missing a table's
    // target costs a life; cash is spent in the shop between tables.
    const hpBlock = el('div', 'hud-hp', top);
    this.hpBlock = hpBlock;
    this.hpLabel = el('div', 'hud-label', hpBlock);
    this.hpLabel.textContent = 'Lives';
    this.livesRow = el('div', 'lives-row', hpBlock);
    // A TABLE ON ITS OWN (round 12): no hearts or cash to carry, so the corner
    // shows the stars this table holds, the ones it is played for
    this.singleStars = el('div', 'single-stars', hpBlock);
    // THE WALLET: one boxed figure, always in this corner, during play, the
    // table's result and the shop alike.
    this.cashValue = el('div', 'cash-value', hpBlock);

    // The mission. This is the single most important thing on the screen and
    // it is written as a sentence, not encoded.
    const missionBlock = el('div', 'hud-mission', top);
    this.missionLabel = el('div', 'hud-label', missionBlock);
    this.missionLabel.textContent = 'Mission';
    this.missionText = el('div', 'mission-text', missionBlock);
    this.missionPips = el('div', 'mission-pips', missionBlock);
    /**
     * WHICH BALL THE ORDER WANTS NEXT.
     *
     * The order pays and never demands, which means nothing on the table makes
     * the player look for it — so this line is the only thing that teaches it
     * exists. It names a number rather than describing a rule, because "the 3
     * is next" is a fact you can act on and "sink them in ascending order" is a
     * sentence you have to translate.
     */
    this.missionOrder = el('div', 'mission-order', missionBlock);
    // THE TABLE'S RULE, in a few words (from review): it flies here from the
    // table's intro card and stays for the whole table.
    this.ruleChip = el('div', 'rule-chip', missionBlock);
    this.ruleChip.hidden = true;


    const scoreBlock = el('div', 'hud-score', top);
    el('div', 'hud-label', scoreBlock).textContent = 'Your score';
    this.scoreValue = el('div', 'score-value', scoreBlock);
    // THE TARGET this table's points have to beat, as a bar that fills as you
    // score, so how far you have to go is visible at a glance all table long.
    const bar = el('div', 'score-bar', scoreBlock);
    this.targetFill = el('div', 'fill', bar);
    this.tableValue = el('div', 'score-table', scoreBlock);

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
    // THE FREEZE BUTTON (from review: "is there a button … near the natural
    // thumb placement?"). The meter is the button: while the balls roll and a
    // charge is in hand it lights up and says FREEZE, and a tap on it stops
    // the table. Anywhere else, a tap only hurries the numbers along.
    const freezeBlock = el('div', 'hud-freeze', this.root);
    this.freezeBlock = freezeBlock;
    this.freezeLabel = el('div', 'hud-label', freezeBlock);
    this.freezeLabel.textContent = 'Freeze frame';
    this.freezeRow = el('div', 'freeze-row', freezeBlock);
    this.freezeCall = el('div', 'freeze-call', freezeBlock);
    this.freezeCall.textContent = 'Freeze';
    /** set by the game: what a press on the button does */
    this.onFreeze = null;
    freezeBlock.addEventListener('pointerdown', (e) => {
      if (!freezeBlock.classList.contains('armed')) return;
      e.stopPropagation();
      e.preventDefault();
      this.onFreeze?.();
    });

    /* ---------------- practice ---------------- */
    // A practice table (from review): what to try, and the way out.
    this.practice = el('div', 'hud-practice', this.root);
    this.practice.hidden = true;
    this.practiceTitle = el('div', 'practice-title', this.practice);
    this.practiceLine = el('div', 'practice-line', this.practice);
    this.practiceCount = el('div', 'practice-count', this.practice);
    this.practiceDone = el('button', 'practice-done', this.root);
    this.practiceDone.type = 'button';
    this.practiceDone.hidden = true;
    // the button is not a shot or a freeze
    this.practiceDone.addEventListener('pointerdown', (e) => e.stopPropagation());

    /* ---------------- banner ---------------- */
    this.banner = el('div', 'hud-banner', this.root);
    this.bannerTitle = el('div', 'banner-title', this.banner);
    this.bannerSub = el('div', 'banner-sub', this.banner);
    this.bannerTimer = 0;
    /** A banner that waits for a tap rather than a clock. */
    this.bannerHolds = false;
    this.bannerHint = el('div', 'banner-hint', this.banner);
    this.bannerHint.textContent = 'Tap anywhere to continue';

    /* ---------------- room scorecard ---------------- */
    this.card = el('div', 'hud-card', this.root);
    this.cardHead = el('div', 'card-head', this.card);
    this.cardStatus = el('div', 'card-status', this.cardHead);
    this.cardTitle = el('div', 'card-title', this.cardHead);
    this.cardLines = el('div', 'card-lines', this.card);
    this.cardTotals = el('div', 'card-totals', this.card);
    this.cardPrompt = el('div', 'card-prompt', this.card);
    /**
     * THE EXITS ARE BUTTONS.
     *
     * They used to be doors you shot the cue ball into, and that only works
     * while there IS a cue ball on the table to shoot — at the end of a room
     * there is not one to see, so the prompt asked for a gesture the player
     * had no way to perform. A choice between named rewards is a choice
     * between named rewards; it does not need a physics puzzle in front of it.
     */
    this.cardChoices = el('div', 'card-choices', this.card);

    /* ---------------- damage vignette ---------------- */
    this.damageVeil = el('div', 'hud-damage', this.root);
    this.damageTimer = 0;

    /* ---------------- the floating aim pad ---------------- */
    /**
     * The thumb's own control, drawn where the thumb is.
     *
     * It is not decoration: with a floating pivot the player cannot see what
     * the cue is pivoting ABOUT unless it is drawn, and the whole reason the
     * pad floats is that the pivot is no longer somewhere they can infer. Ring
     * = the full draw. Knob = the butt of the cue. The line between them is the
     * shot, mirrored under the thumb.
     */
    this.pad = el('div', 'aim-pad', this.root);
    this.padRing = el('div', 'pad-ring', this.pad);
    this.padFill = el('div', 'pad-fill', this.pad);
    this.padLine = el('div', 'pad-line', this.pad);
    this.padKnob = el('div', 'pad-knob', this.pad);

    /* ---------------- world-projected door labels ---------------- */
    this.doorLayer = el('div', 'hud-doors', this.root);
    this.doorLabels = [];
    this._projection = new THREE.Vector3();

    // Cached values so we only touch the DOM when something actually changed.
    this._cache = {
      lives: '',
      cash: null,
      target: '',
      mission: '',
      order: '',
      progress: '',
      strokes: '',
      freeze: -1,
      score: -1,
      mult: -1,
      buildKey: ''
    };

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
    // A MISSION WAITS TO BE READ.
    //
    // Everything else a banner says is a report on something the player just
    // watched happen, and a couple of seconds is plenty. The mission is the
    // opposite: it is the terms of the room, arriving before anything has
    // happened, and it decides every shot that follows. It holds until it is
    // dismissed, and says so.
    this.bannerHolds = duration === HOLD;
    this.bannerTimer = this.bannerHolds ? 0 : duration;
    this.bannerHint.style.display = this.bannerHolds ? '' : 'none';
    // A banner that waits is read, not glanced at: it gets a dark band so the
    // resting aim line underneath doesn't run through the words.
    this.banner.classList.toggle('holds', this.bannerHolds);
    this.banner.classList.add('visible');
  }

  /** The table's rule chip under the mission; null hides it. */
  setRule(text, arrived = false) {
    this.ruleChip.hidden = !text;
    this.ruleChip.textContent = text || '';
    if (text && arrived) {
      this.ruleChip.animate(
        [{ transform: 'scale(1.25)', filter: 'brightness(1.8)' }, { transform: 'scale(1)', filter: 'none' }],
        { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      );
    }
  }

  /**
   * A shot was just added (+1 SHOT). The mark at `index` is the new one: it
   * opens a gap between the shots you have and the ones you've spent, lands
   * white-hot and settles to the counter's amber, and the count flashes.
   */
  shotAdded(index) {
    this.freshShot = index;
    this.strokeText.animate?.(
      [{ color: '#ffb340', transform: 'scale(1.25)' }, { color: '#ffb340', transform: 'scale(1)', offset: 0.6 }, { color: '' }],
      { duration: 1400, easing: 'ease-out' }
    );
  }

  /**
   * A practice table's panel, or null to put the table back the way it was.
   * @param {{title:string, line:string, count?:string, done:string, ready?:boolean, onDone?:Function}|null} p
   */
  setPractice(p) {
    this.root.classList.toggle('practicing', !!p);
    this.practice.hidden = !p;
    this.practiceDone.hidden = !p;
    if (!p) return;
    this.practiceTitle.textContent = p.title;
    if (this.practiceLine.textContent !== p.line) {
      this.practiceLine.textContent = p.line;
      this.practiceLine.animate?.([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'ease-out' });
    }
    this.practiceCount.textContent = p.count || '';
    // between the lives in the corner and the right edge, not over them
    const R = this.root.getBoundingClientRect();
    const hp = this.hpBlock?.getBoundingClientRect();
    if (hp?.width && R.width) {
      const left = hp.right - R.left + 8;
      this.practice.style.left = `${left}px`;
      this.practice.style.right = getComputedStyle(this.root).getPropertyValue('--hud-pad') || '12px';
      this.practice.style.width = 'auto';
      this.practice.style.transform = 'none';
    }
    this.practiceDone.textContent = p.done;
    this.practiceDone.classList.toggle('ready', !!p.ready);
    if (p.onDone) this.practiceDone.onclick = p.onDone;
  }

  /** A −1 lifts off the pip that just went out, and the count flashes. */
  _shotSpent(pip) {
    if (!pip?.animate) return;
    const block = this.strokeRow.parentNode;
    const a = pip.getBoundingClientRect();
    const b = block.getBoundingClientRect();
    const chip = el('div', 'shot-minus', block);
    chip.textContent = '−1';
    chip.style.left = `${a.left - b.left + a.width / 2}px`;
    chip.style.top = `${a.top - b.top}px`;
    chip.animate(
      [
        { transform: 'translate(-50%, 0) scale(0.4)', opacity: 0 },
        { transform: 'translate(-50%, -14px) scale(1.25)', opacity: 1, offset: 0.25 },
        { transform: 'translate(-50%, -22px) scale(1)', opacity: 1, offset: 0.6 },
        { transform: 'translate(-50%, -34px) scale(0.9)', opacity: 0 }
      ],
      { duration: 900, easing: 'ease-out', fill: 'forwards' }
    ).onfinish = () => chip.remove();
    this.strokeText.animate?.(
      [{ color: '#fff', transform: 'scale(1.2)' }, { color: '#fff', transform: 'scale(1)', offset: 0.5 }, { color: '' }],
      { duration: 700, easing: 'ease-out' }
    );
  }

  /**
   * AN ACHIEVEMENT, THE MOMENT IT IS EARNED (from review: "pop up when you
   * take the action that earns you the achievement, and linger long enough
   * for you to read it, with a way to see all achievements and to dismiss
   * it"). A plate drops in under the top band with the name and what it was
   * for, stays about six seconds, and has two controls: See all opens the
   * whole list, × puts it away. Two earned at once queue, one after another.
   */
  achievement(a, { all } = {}) {
    this._achQueue = this._achQueue || [];
    this._achQueue.push({ a, all });
    if (!this._achUp) this._achNext();
  }

  /**
   * Hold plates off while the score screen is up: the one showing fades
   * now, and the rest wait until the hold lifts.
   */
  holdAchievements(on) {
    this._achHold = on;
    if (on) this._achLeave?.();
    else if (!this._achUp) this._achNext();
  }

  /**
   * The bottom of the top band in page pixels, down to the lowest thing that
   * hangs off it (the mission's BEAT THE TARGET chip sits below the band's
   * own box). Whatever drops in under the band starts here.
   */
  topBandBottom() {
    const R = this.root.getBoundingClientRect();
    let bottom = this.topBand.getBoundingClientRect().bottom;
    // a practice table's what-to-try sits where the band's middle was
    if (!this.practice.hidden) bottom = Math.max(bottom, this.practice.getBoundingClientRect().bottom);
    for (const n of this.topBand.querySelectorAll('*')) {
      const r = n.getBoundingClientRect();
      if (r.height && r.bottom < R.top + R.height * 0.3) bottom = Math.max(bottom, r.bottom);
    }
    return bottom;
  }

  /** How much longer the plate up needs to have been on screen `ms`. */
  achievementReadLeft(ms) {
    if (!this._achUp) return 0;
    return Math.max(0, ms - (performance.now() - this._achAt));
  }

  _achNext() {
    if (this._achHold) return;
    const next = this._achQueue?.shift();
    if (!next) return;
    const { a, all } = next;
    const t = el('div', 'ach-toast', this.root);
    t.innerHTML =
      '<span class="ach-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10v4.5a5 5 0 0 1-10 0Zm0 1.5H3.5a3.5 3.5 0 0 0 3.6 4M17 5.5h3.5a3.5 3.5 0 0 1-3.6 4M12 13.5V17m-4 3.5h8l-1-3.5H9Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/></svg></span>' +
      '<span class="ach-words"><small>Achievement</small><b></b><em></em></span>' +
      '<button class="ach-all" type="button">See all</button>' +
      '<button class="ach-x" type="button" aria-label="Dismiss">×</button>';
    t.querySelector('b').textContent = a.name;
    t.querySelector('em').textContent = a.text;
    // its buttons are not a shot or a freeze
    for (const type of ['pointerdown', 'pointerup']) t.addEventListener(type, (e) => e.stopPropagation());
    this._achUp = t;
    this._achAt = performance.now();
    // just under the top band, so the score and target stay in view
    t.style.top = `${Math.round(this.topBandBottom() - this.root.getBoundingClientRect().top + 6)}px`;
    let gone = false;
    const leave = () => {
      if (gone) return;
      gone = true;
      this._achLeave = null;
      clearTimeout(timer);
      stay?.cancel();
      const out = t.animate?.([{ transform: 'translate(-50%, 0)', opacity: 1 }, { transform: 'translate(-50%, -16px) scale(0.92)', opacity: 0 }], { duration: 240, easing: 'ease-in', fill: 'forwards' });
      const done = () => {
        t.remove();
        this._achUp = null;
        this._achNext();
      };
      if (out) out.onfinish = done;
      else done();
    };
    this._achLeave = leave;
    t.querySelector('.ach-x').addEventListener('click', leave);
    t.querySelector('.ach-all').addEventListener('click', () => {
      leave();
      all?.();
    });
    // in, then held long enough to read the name and what it was for
    const HOLD = 6500;
    const stay = t.animate?.(
      [
        { transform: 'translate(-50%, -24px) scale(0.6)', opacity: 0 },
        { transform: 'translate(-50%, 4px) scale(1.06)', opacity: 1, offset: 230 / HOLD },
        { transform: 'translate(-50%, 0) scale(1)', opacity: 1, offset: 380 / HOLD },
        { transform: 'translate(-50%, 0) scale(1)', opacity: 1 }
      ],
      { duration: HOLD, easing: 'ease-out' }
    );
    if (stay) stay.onfinish = leave;
    const timer = stay ? 0 : setTimeout(leave, HOLD);
  }

  /** Is a hold-until-tapped banner up? */
  get bannerWaiting() {
    return this.bannerHolds && this.banner.classList.contains('visible');
  }

  hideBanner() {
    this.bannerTimer = 0;
    this.bannerHolds = false;
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
    this.cardStatus.textContent = data.filled ? 'Mission complete' : 'Out of shots';
    this.cardStatus.classList.toggle('failed', !data.filled);
    this.cardTitle.textContent = `Table ${data.level}`;

    this.cardLines.textContent = '';
    for (const entry of data.ledger || []) {
      const row = el('div', `card-line${entry.id === 'saved' ? ' hero' : ''}`, this.cardLines);
      el('span', 'card-k', row).textContent = entry.label;
      el('span', 'card-d', row).textContent = entry.detail || '';
      el('span', 'card-v', row).textContent = `+${entry.amount.toLocaleString()}`;
    }
    if (data.target) {
      const row = el('div', `card-line${data.beaten ? ' hero' : ' bad'}`, this.cardLines);
      el('span', 'card-k', row).textContent = data.beaten ? 'Target beaten' : 'Target missed';
      el('span', 'card-d', row).textContent = data.target.toLocaleString();
      el('span', 'card-v', row).textContent = data.beaten ? `+$${data.earned}` : '−1 life';
    }
    if (!this.cardLines.childElementCount) {
      const row = el('div', 'card-line', this.cardLines);
      el('span', 'card-k', row).textContent = 'Nothing scored';
      el('span', 'card-d', row).textContent = '';
      el('span', 'card-v', row).textContent = '0';
    }

    this.cardTotals.textContent = '';
    const room = el('div', 'card-total', this.cardTotals);
    el('span', 'card-k', room).textContent = 'Table';
    el('span', 'card-v', room).textContent = data.roomScore.toLocaleString();
    const run = el('div', 'card-total run', this.cardTotals);
    el('span', 'card-k', run).textContent = 'Run';
    el('span', 'card-v', run).textContent = data.runScore.toLocaleString();

    // The banner says the same thing the card's own header says, one layer
    // behind it. Two readouts of one event, overlapping, is worse than either.
    this.hideBanner();

    this.cardChoices.textContent = '';
    const choices = data.choices || [];
    this.cardPrompt.textContent = choices.length
      ? choices.length > 1
        ? 'Choose one'
        : 'Carry on'
      : '';
    this.cardPrompt.style.display = choices.length ? '' : 'none';
    for (const choice of choices) {
      const button = el('button', 'card-choice', this.cardChoices);
      button.type = 'button';
      button.style.setProperty('--c', choice.color);
      el('span', 'choice-name', button).textContent = choice.name;
      el('span', 'choice-detail', button).textContent = choice.detail;
      // The aim gesture begins on POINTERDOWN, so stopping the click is too
      // late: the tap that picks an exit would also draw the cue back and fire
      // a shot on release. Both ends of the gesture stop here.
      for (const type of ['pointerdown', 'pointerup']) {
        button.addEventListener(type, (event) => {
          event.preventDefault();
          event.stopPropagation();
        });
      }
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        choice.pick();
      });
    }
    this.card.classList.add('visible');
  }

  hideScorecard() {
    this.card.classList.remove('visible');
  }

  /**
   * Place the aim pad, in stage pixels.
   * @param {{px:number, py:number, kx:number, ky:number, radius:number,
   *          power:number}|null} pad null hides it
   */
  setPad(pad) {
    if (!pad) {
      this.pad.classList.remove('show');
      return;
    }
    const dx = pad.kx - pad.px;
    const dy = pad.ky - pad.py;
    const len = Math.hypot(dx, dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const style = this.pad.style;
    style.setProperty('--pad-x', `${pad.px.toFixed(1)}px`);
    style.setProperty('--pad-y', `${pad.py.toFixed(1)}px`);
    style.setProperty('--pad-r', `${pad.radius.toFixed(1)}px`);
    style.setProperty('--knob-x', `${dx.toFixed(1)}px`);
    style.setProperty('--knob-y', `${dy.toFixed(1)}px`);
    style.setProperty('--line-len', `${len.toFixed(1)}px`);
    style.setProperty('--line-rot', `${angle.toFixed(2)}deg`);
    style.setProperty('--pad-power', pad.power.toFixed(3));
    this.pad.classList.add('show');
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
  /** The node of the life that is about to go, for the moment to break. */
  /** Playing one table on its own: the corner shows its stars (null: a run). */
  setSingle(stars) {
    this.root.classList.toggle('single', !!stars);
    this.hpLabel.textContent = stars ? 'Stars' : 'Lives';
    this.singleStars.innerHTML = stars ? ['t', 'a', 'o'].map((k) => `<i class="${stars[k] ? 'on' : ''}">★</i>`).join('') : '';
  }

  lifeNode(index) {
    return this.livesRow.children[index] || null;
  }

  /** Hold the wallet's figure while a moment animates it; release repaints. */
  lockCash(on) {
    this.cashLocked = !!on;
    if (!on) this._cache.cash = undefined;
  }

  update(s, rawDt) {
    const cache = this._cache;

    // --- lives and cash ---
    const lifeKey = `${s.lives}/${s.livesMax}`;
    if (lifeKey !== cache.lives) {
      cache.lives = lifeKey;
      this.livesRow.textContent = '';
      // RED HEARTS (round 11): full while you have them, an outline once lost
      for (let i = 0; i < (s.livesMax || 3); i++) el('span', `life${i < s.lives ? ' on' : ''}`, this.livesRow).innerHTML = HEART;
    }
    // While a moment counts the wallet itself (collecting, spending), the
    // HUD leaves its figure alone; unlocking repaints it with the real one.
    if (!this.cashLocked && s.cash !== cache.cash) {
      cache.cash = s.cash;
      this.cashValue.textContent = `$${s.cash ?? 0}`;
    }

    // --- the mission, in words ---
    const line = s.cleared ? 'MISSION COMPLETE' : s.missionText || '';
    if (line !== cache.mission) {
      cache.mission = line;
      this.missionText.textContent = line;
      this.missionText.classList.toggle('done', !!s.cleared);
    }
    const progress = `${s.ballsDown}/${s.rack}`;
    if (progress !== cache.progress) {
      cache.progress = progress;
      this.missionPips.textContent = '';
      for (let i = 0; i < (s.rack || 0); i++) {
        el('span', `pip${i < s.ballsDown ? ' on' : ''}`, this.missionPips);
      }
    }

    // --- what the order wants next ---
    const next = s.cleared ? null : s.nextInOrder;
    const streak = s.orderStreak || 0;
    let order = '';
    if (next != null) {
      if (s.strictOrder) order = `NEXT ${next} · REQUIRED`;
      else if (streak > 0) order = `NEXT ${next} · IN ORDER ×${streak}`;
      else if (!s.orderBroken) order = `NEXT ${next} · IN ORDER PAYS`;
      else order = `NEXT ${next}`;
    }
    // A REFUSAL THE PREVIEW HAS SEEN, while the thumb is still down.
    //
    // The felt turns the offending line red; these words say which ball to
    // take instead, because red alone only says "bad". It arrives in the
    // snapshot like everything else here — the game decides what is true, the
    // HUD only draws it — and it takes the slot over, since while the drawn
    // shot would be turned away there is nothing more useful this line can be
    // saying. The words live here because the tag layer that carries SCRATCH
    // only runs during a lesson.
    const warned = !!s.aimFoul && !s.cleared;
    if (warned) order = s.aimFoul;
    const orderKey = `${warned ? '!' : ''}${order}|${streak}`;
    if (orderKey !== cache.order) {
      cache.order = orderKey;
      this.missionOrder.textContent = order;
      this.missionOrder.classList.toggle('on', !warned && !s.strictOrder && streak > 0);
      this.missionOrder.classList.toggle('strict', warned || !!s.strictOrder);
      // Declutter (from review): the order hint shows only when it is a rule —
      // a refused line, or Strict Order mode — never as a standing reminder.
      // An authored table about the order (Table 2) shows it all table long.
      this.missionOrder.hidden = !order || !(warned || s.strictOrder || s.orderHint);
    }

    // --- this table's points, against its target ---
    if (s.displayScore !== cache.score) {
      cache.score = s.displayScore;
      this.scoreValue.textContent = (s.displayScore || 0).toLocaleString();
    }
    const beaten = (s.displayScore || 0) >= (s.target || Infinity);
    const targetKey = `${s.target}/${beaten}`;
    if (targetKey !== cache.target) {
      cache.target = targetKey;
      this.tableValue.innerHTML = s.target ? `<small>Target</small> ${s.target.toLocaleString()}${beaten ? ' ✓' : ''}` : '';
      this.tableValue.classList.toggle('on', !!s.target);
      this.tableValue.classList.toggle('beaten', beaten);
      this.targetFill.parentNode.classList.toggle('beaten', beaten);
    }
    const ratio = s.target ? Math.min(1, (s.displayScore || 0) / s.target) : 0;
    if (Math.abs(ratio - (cache.ratio ?? -1)) > 0.001) {
      cache.ratio = ratio;
      this.targetFill.style.width = `${ratio * 100}%`;
    }

    // --- the stroke budget ---
    const strokeKey = `${s.strokesLeft}/${s.strokesTotal}`;
    if (strokeKey !== cache.strokes) {
      // A SHOT SPENT IS SHOWN GOING OUT (from review): one fewer of the same
      // total is the pip at the new count, and it flashes, sheds a −1 and
      // drains to the spent look.
      const spending = cache.strokesTotal === s.strokesTotal && cache.strokesLeft === s.strokesLeft + 1 ? s.strokesLeft : -1;
      cache.strokes = strokeKey;
      cache.strokesLeft = s.strokesLeft;
      cache.strokesTotal = s.strokesTotal;
      this.strokeRow.textContent = '';
      for (let i = 0; i < (s.strokesTotal || 0); i++) {
        const fresh = i === this.freshShot ? ' fresh' : '';
        const spend = i === spending ? ' spend' : '';
        el('span', `cue${i < s.strokesLeft ? '' : ' spent'}${fresh}${spend}`, this.strokeRow);
      }
      this.freshShot = null;
      if (spending >= 0) this._shotSpent(this.strokeRow.children[spending]);
      this.strokeText.textContent = `${s.strokesLeft} of ${s.strokesTotal} left`;
      this.strokeRow.classList.toggle('last', s.strokesLeft === 1);
      this.strokeRow.classList.toggle('out', s.strokesLeft === 0);
    }

    // --- freeze charges ---
    if (s.freezeCharges !== cache.freeze) {
      cache.freeze = s.freezeCharges;
      this.freezeRow.textContent = '';
      // Halves: a charge is earned half at a time and spent whole.
      const shown = Math.max(3, Math.ceil(s.freezeCharges));
      // the diamond a gain just filled flashes in (from review: every change
      // is telegraphed)
      const prev = cache.freezePrev ?? s.freezeCharges;
      const fresh = s.freezeCharges > prev ? Math.floor(prev) : -1;
      cache.freezePrev = s.freezeCharges;
      for (let i = 0; i < shown; i++) {
        const full = s.freezeCharges >= i + 1;
        const half = !full && s.freezeCharges >= i + 0.5;
        el('span', `frz${full ? ' on' : half ? ' half' : ''}${i === fresh ? ' fresh' : ''}`, this.freezeRow);
      }
      this.root.classList.toggle('has-freeze', s.freezeCharges >= 1);
    }
    if (!!s.canFreeze !== cache.canFreeze) {
      cache.canFreeze = !!s.canFreeze;
      this.freezeBlock.classList.toggle('armed', cache.canFreeze);
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
