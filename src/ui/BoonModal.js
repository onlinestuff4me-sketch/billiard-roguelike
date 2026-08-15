/**
 * BoonModal.js — the 3-card reward overlay.
 *
 * Opens on entering a boon door, freezes time completely (the caller pauses the
 * Engine), and hands the picked offer back through a callback. It is the only
 * screen in the game with a scrim.
 *
 * Cards carry three reads, in this priority order:
 *   1. phase glyph + phase name — *when* in the stroke this fires
 *   2. rarity border            — how strong this particular roll is
 *   3. the numbers              — what it actually does at this rank
 */

import { BOONS } from '../config.js';
import { PHASE_LABEL, TRIGGER_LABEL } from '../systems/BoonSystem.js';

const RANK_NUMERAL = ['', 'I', 'II', 'III', 'IV'];

function el(tag, className, parent) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (parent) parent.appendChild(node);
  return node;
}

export class BoonModal {
  /** @param {HTMLElement} layer the `#ui-layer` element */
  constructor(layer) {
    this.layer = layer;
    this.open = false;
    this.onPick = null;

    this.scrim = el('div', 'boon-scrim', layer);
    this.panel = el('div', 'boon-panel', this.scrim);
    this.title = el('div', 'boon-title', this.panel);
    this.subtitle = el('div', 'boon-subtitle', this.panel);
    this.cards = el('div', 'boon-cards', this.panel);
    this.footer = el('div', 'boon-footer', this.panel);
    this.footer.textContent = 'Pick one — it applies immediately';

    this._onClick = this._handleClick.bind(this);
    this.cards.addEventListener('click', this._onClick);
    // Swallow pointer events so an aim never starts underneath the modal.
    this.scrim.addEventListener('pointerdown', (e) => e.stopPropagation());
    this.scrim.addEventListener('pointerup', (e) => e.stopPropagation());
  }

  /**
   * @param {Array} offers from BoonSystem.rollOffer()
   * @param {(offer: object) => void} onPick
   * @param {{ level?: number, phase?: string|null }} [context]
   */
  show(offers, onPick, context = {}) {
    this.onPick = onPick;
    this.offers = offers;
    this.cards.textContent = '';

    this.title.textContent = 'Choose an Upgrade';
    this.subtitle.textContent = `Room ${context.level ?? '?'} · pick one`;

    if (!offers.length) {
      const empty = el('div', 'boon-empty', this.cards);
      empty.textContent = 'Everything is already at maximum rank.';
      this.footer.textContent = 'Tap anywhere to continue';
      this.footer.style.display = '';
      this.scrim.classList.add('visible');
      this.open = true;
      this._emptyHandler = () => this._pick(null);
      this.scrim.addEventListener('click', this._emptyHandler, { once: true });
      return;
    }

    // The instruction already lives in the subtitle; a second copy underneath
    // is exactly the kind of text that costs a read without informing a choice.
    this.footer.textContent = '';
    this.footer.style.display = 'none';
    offers.forEach((offer, index) => {
      const rarity = BOONS.rarity[offer.rarity] || BOONS.rarity.common;
      const def = offer.def;
      const card = el('button', `boon-card ${offer.rarity} phase-${def.phase}`, this.cards);
      card.type = 'button';
      card.dataset.index = String(index);

      // 1. WHEN it fires, in plain words — scannable without being read.
      const head = el('div', 'card-head', card);
      el('span', 'card-trigger', head).textContent =
        TRIGGER_LABEL[def.phase] || PHASE_LABEL[def.phase] || def.phase;
      el('span', 'card-rarity', head).textContent = rarity.label;

      // 2. WHAT it does for you — the largest text on the card, because it is
      //    the only line that actually decides the pick.
      el('div', 'card-effect', card).textContent = def.effect
        ? def.effect(offer.values)
        : def.desc(offer.values);

      // 3. The numbers, kept on their own line so they can be compared across
      //    cards at a glance rather than dug out of a sentence.
      if (def.numbers) el('div', 'card-numbers', card).textContent = def.numbers(offer.values);

      // 4. Identity last: the name matters for recognising the build you are
      //    assembling, not for making this decision.
      const foot = el('div', 'card-foot', card);
      el('span', 'card-glyph', foot).textContent = def.glyph;
      el('span', 'card-name', foot).textContent = def.name;
      if (offer.owned) {
        el('span', 'card-rank', foot).textContent = `Rank ${RANK_NUMERAL[offer.rank - 1]} → ${
          RANK_NUMERAL[offer.rank]
        }`;
      }
    });

    this.scrim.classList.add('visible');
    this.open = true;
  }

  _handleClick(event) {
    const card = event.target.closest('.boon-card');
    if (!card) return;
    const index = Number(card.dataset.index);
    const offer = this.offers?.[index];
    if (!offer) return;
    this._pick(offer);
  }

  _pick(offer) {
    const cb = this.onPick;
    this.close();
    cb?.(offer);
  }

  close() {
    if (!this.open) return;
    this.open = false;
    this.onPick = null;
    this.scrim.classList.remove('visible');
    if (this._emptyHandler) {
      this.scrim.removeEventListener('click', this._emptyHandler);
      this._emptyHandler = null;
    }
  }

  dispose() {
    this.cards.removeEventListener('click', this._onClick);
    this.scrim.remove();
  }
}

export default BoonModal;
