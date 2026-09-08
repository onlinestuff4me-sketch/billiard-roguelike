/**
 * Rules.js — the billiards layer, as pure state.
 *
 * Everything about "what does this room want, what does it cost, what did that
 * stroke pay" lives here and nowhere else. It owns no meshes, imports no
 * systems and reads no globals, so the same object drives the game, the
 * tutorial and (eventually) the level tool without any of them disagreeing
 * about the score.
 *
 * The shape of a room:
 *
 *   beginRoom(level)          contract + stroke budget from the ramp
 *     beginStroke()           multiplier resets to x1
 *       bank() / touch()      the ladder climbs while the table moves
 *       gold()                doubles what has been built
 *       pot(ball, kind)       steps the ladder, THEN pays at the new figure
 *     endStroke()             banks the stroke, spends one from the budget
 *   endRoom()                 pays for every stroke left unspent
 *
 * The one rule worth stating out loud: points are paid at the instant a ball
 * drops, at the multiplier standing then. Banking before you pot is worth real
 * money, and that is deliberate.
 */

import { RULES, RACK } from '../config.js';

/** The ramp band covering this room. */
export function bandFor(level) {
  let band = RULES.ramp[0];
  for (const entry of RULES.ramp) {
    if (level >= entry.fromLevel) band = entry;
  }
  return band;
}

/**
 * The contract for a room: how many balls, how many strokes, and whether the
 * 8 has to go last.
 */
export function contractFor(level) {
  const band = bandFor(level);
  const eightLast = level >= RULES.eightLastFrom;
  return {
    level,
    rack: band.rack,
    strokes: band.strokes,
    eightLast,
    /** Strokes minus balls: what the player can afford to waste. */
    spare: band.strokes - band.rack
  };
}

/** Plain-English contract line for the HUD. Never inferred, always on screen. */
export function contractText(contract) {
  const n = contract.rack;
  return contract.eightLast ? `KNOCK ALL ${n} IN · 8 LAST` : `KNOCK ALL ${n} IN`;
}

/** Which archetype wears a given number. */
export function archetypeForNumber(number) {
  if (number === RACK.eight) return 'heavy';
  return RACK.archetypeByNumber[Math.min(number, RACK.archetypeByNumber.length) - 1] || 'solid';
}

/**
 * The numbers in a rack of `size`. The 8 is always present and always last,
 * because the contract talks about it by name — a rack whose highest ball was
 * a 6 would make "the 8 last" a lie on most rooms.
 */
export function rackNumbers(size) {
  const numbers = [];
  for (let i = 1; i < size; i++) numbers.push(i);
  numbers.push(RACK.eight);
  return numbers;
}

/* ------------------------------------------------------------------ *
 * Rules
 * ------------------------------------------------------------------ */

export class Rules {
  constructor() {
    this.runScore = 0;
    this.level = 0;
    this.contract = contractFor(1);

    this.strokesLeft = 0;
    this.strokesUsed = 0;
    this.ballsDown = 0;
    this.roomScore = 0;
    /** Per-room ledger, rendered on the scorecard. */
    this.ledger = [];

    /** Stroke-scoped state. */
    this.multiplier = RULES.multiplier.base;
    this.strokeScore = 0;
    this.strokeEvents = [];
    this.ballsTouched = 0;
    this.banks = 0;
    this.scratched = false;
    this.bestMultiplier = 1;

    this.freezeCharges = 0;
    /** Set when the strokes run out with the contract unfilled. */
    this.failed = false;
  }

  /* ---------------------------------------------------------------- *
   * Room lifecycle
   * ---------------------------------------------------------------- */

  beginRoom(level, overrides = null) {
    this.level = level;
    this.contract = overrides ? { ...contractFor(level), ...overrides } : contractFor(level);
    this.strokesLeft = this.contract.strokes;
    this.strokesUsed = 0;
    this.ballsDown = 0;
    this.roomScore = 0;
    this.ledger = [];
    this.failed = false;
    this.roomClosed = false;
    this.bestMultiplier = 1;
    this.resetStroke();
  }

  /** True once every ball the contract asked for is down. */
  get filled() {
    return this.ballsDown >= this.contract.rack;
  }

  get spare() {
    return this.strokesLeft - (this.contract.rack - this.ballsDown);
  }

  /**
   * End of room: every unspent stroke pays `savedStroke x level`. This is the
   * skill income, and it scales with the room precisely so that efficiency
   * gets more valuable as it gets harder to achieve.
   */
  endRoom() {
    const saved = Math.max(0, this.strokesLeft);
    const rate = RULES.score.savedStroke * Math.max(1, this.level);
    const bonus = saved * rate;
    if (bonus > 0) {
      this.roomScore += bonus;
      this.ledger.push({ id: 'saved', label: 'Shots saved', detail: `${saved} × ${rate.toLocaleString()}`, amount: bonus });
    }
    this.runScore += this.roomScore;
    // Once the room is banked, `roomScore` is already inside `runScore`. The
    // HUD adds the two together while a room is live, so it has to be told to
    // stop — otherwise the running total doubles the instant a room ends.
    this.roomClosed = true;
    return { saved, rate, bonus, roomScore: this.roomScore, runScore: this.runScore };
  }

  /* ---------------------------------------------------------------- *
   * Stroke lifecycle
   * ---------------------------------------------------------------- */

  resetStroke() {
    this.multiplier = RULES.multiplier.base;
    this.strokeScore = 0;
    this.strokeEvents = [];
    this.ballsTouched = 0;
    this.banks = 0;
    this.scratched = false;
  }

  beginStroke() {
    this.resetStroke();
  }

  /**
   * End the stroke and spend one from the budget. A freeze does NOT come
   * through here — the whole point of a freeze is that the stroke is still
   * going.
   */
  endStroke() {
    const paid = this.scratched && RULES.scratch.voidScore ? 0 : this.strokeScore;
    this.roomScore += paid;
    if (paid > 0) {
      this.ledger.push({
        id: 'stroke',
        label: `Shot ${this.strokesUsed + 1}`,
        detail: `×${this.multiplier}`,
        amount: paid
      });
    }
    this.strokesLeft = Math.max(0, this.strokesLeft - 1);
    this.strokesUsed += 1;
    const voided = this.scratched && this.strokeScore > 0;
    const summary = {
      paid,
      voided,
      lost: voided ? this.strokeScore : 0,
      multiplier: this.multiplier,
      scratched: this.scratched
    };
    if (this.strokesLeft <= 0 && !this.filled) this.failed = true;
    this.resetStroke();
    return summary;
  }

  /* ---------------------------------------------------------------- *
   * The multiplier ladder
   * ---------------------------------------------------------------- */

  _step(amount) {
    this.multiplier = Math.min(RULES.multiplier.max, this.multiplier + amount);
    this.bestMultiplier = Math.max(this.bestMultiplier, this.multiplier);
    return this.multiplier;
  }

  /** The cue ball banked off a rail or an obstacle. */
  bank() {
    this.banks += 1;
    return this._step(RULES.multiplier.perBank);
  }

  /** The cue ball touched a ball, or one object ball cannoned into another. */
  touch() {
    this.ballsTouched += 1;
    return this._step(RULES.multiplier.perBallTouched);
  }

  /** The double: multiply whatever has been built. */
  gold() {
    this.multiplier = Math.min(RULES.multiplier.max, this.multiplier * RULES.multiplier.goldFactor);
    this.bestMultiplier = Math.max(this.bestMultiplier, this.multiplier);
    return this.multiplier;
  }

  /* ---------------------------------------------------------------- *
   * Paying out
   * ---------------------------------------------------------------- */

  /**
   * Is potting this ball legal right now? Under an "8 last" contract the 8 is
   * a foul until it is the only ball left.
   */
  isFoul(number) {
    if (!this.contract.eightLast) return false;
    if (number !== RACK.eight) return false;
    return this.ballsDown < this.contract.rack - 1;
  }

  /**
   * A ball goes down. The ladder steps first, then the ball pays at the figure
   * standing after the step — so the pot that completes a long route is worth
   * more than the pot that opens one.
   *
   * Every pocket pays the same. There is nothing to pass in but the number.
   */
  pot(number) {
    this._step(RULES.multiplier.perBallDown);
    const value = Math.round(number * RULES.score.perPip * this.multiplier);
    this.strokeScore += value;
    this.ballsDown += 1;
    this.strokeEvents.push({ number, value, multiplier: this.multiplier });
    return { value, multiplier: this.multiplier };
  }

  /** The cue ball went down a pocket. */
  scratch() {
    this.scratched = true;
  }

  /* ---------------------------------------------------------------- *
   * Freeze charges
   * ---------------------------------------------------------------- */

  grantFreeze(count = RULES.freeze.cellCharges) {
    this.freezeCharges = Math.min(RULES.freeze.maxCharges, this.freezeCharges + count);
    return this.freezeCharges;
  }

  spendFreeze() {
    if (this.freezeCharges <= 0) return false;
    this.freezeCharges -= 1;
    return true;
  }

  /** Everything the HUD needs, in one object. */
  snapshot() {
    return {
      level: this.level,
      contract: this.contract,
      contractText: contractText(this.contract),
      ballsDown: this.ballsDown,
      rack: this.contract.rack,
      strokesLeft: this.strokesLeft,
      strokesTotal: this.contract.strokes,
      multiplier: this.multiplier,
      strokeScore: this.strokeScore,
      roomScore: this.roomScore,
      runScore: this.runScore,
      /** What the score readout should say right now. */
      displayScore: this.runScore + (this.roomClosed ? 0 : this.roomScore),
      freezeCharges: this.freezeCharges,
      banks: this.banks,
      ballsTouched: this.ballsTouched
    };
  }
}

export default Rules;
