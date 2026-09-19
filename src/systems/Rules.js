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
 *   beginRoom(level)          mission + stroke budget from the ramp
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
 *
 * THE MISSION, NOT THE CONTRACT. It is the sentence at the top of the screen
 * and it is addressed to the player: sink these, in this many shots, and the
 * order pays if you can find it.
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
 * The mission for a room: how many balls, how many strokes, whether the 8 has
 * to go last, and whether the order is a bonus or a demand.
 *
 * @param {number} level
 * @param {{strictOrder?: boolean}} [opts]
 */
export function missionFor(level, opts = {}) {
  const band = bandFor(level);
  const eightLast = level >= RULES.eightLastFrom;
  return {
    level,
    rack: band.rack,
    strokes: band.strokes,
    eightLast,
    /**
     * Strict order is a MODE, never a room's own idea. It arrives here from
     * the run so that one flag decides it everywhere — the mission sentence,
     * the foul rule and the HUD all read the same field.
     */
    strictOrder: !!opts.strictOrder,
    /** Strokes minus balls: what the player can afford to waste. */
    spare: band.strokes - band.rack
  };
}

/** Plain-English mission line for the HUD. Never inferred, always on screen. */
export function missionText(mission) {
  const n = mission.rack;
  if (mission.strictOrder) return `SINK ALL ${n} · IN ORDER`;
  return mission.eightLast ? `SINK ALL ${n} · 8 LAST` : `SINK ALL ${n}`;
}

/**
 * The order the rack is meant to go down in: by number, low to high, which
 * puts the 8 last on its own because it wears the highest number in the rack.
 * The "8 last" rule is this same order, made mandatory for one ball.
 */
export const inOrder = (numbers) => [...numbers].sort((a, b) => a - b);

/** Which archetype wears a given number. */
export function archetypeForNumber(number) {
  if (number === RACK.eight) return 'heavy';
  return RACK.archetypeByNumber[Math.min(number, RACK.archetypeByNumber.length) - 1] || 'solid';
}

/**
 * The numbers in a rack of `size`. The 8 is always present and always last,
 * because the mission talks about it by name — a rack whose highest ball was
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
    this.mission = missionFor(1);
    /** Numbers still on the felt, so the mission knows which one is next. */
    this.standing = new Set(rackNumbers(this.mission.rack));
    /** Consecutive pots taken in order, this room. */
    this.orderStreak = 0;
    /** Set the first time a ball goes down out of order. */
    this.orderBroken = false;
    /** How many of this room's pots were the next ball in order. */
    this.orderPots = 0;

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
    /** Set when the strokes run out with the mission unfilled. */
    this.failed = false;
  }

  /* ---------------------------------------------------------------- *
   * Room lifecycle
   * ---------------------------------------------------------------- */

  beginRoom(level, overrides = null) {
    this.level = level;
    this.mission = overrides ? { ...missionFor(level), ...overrides } : missionFor(level);
    this.standing = new Set(rackNumbers(this.mission.rack));
    this.orderStreak = 0;
    this.orderBroken = false;
    this.orderPots = 0;
    this.strokesLeft = this.mission.strokes;
    this.strokesUsed = 0;
    this.ballsDown = 0;
    this.roomScore = 0;
    this.ledger = [];
    this.failed = false;
    this.roomClosed = false;
    this.bestMultiplier = 1;
    this.resetStroke();
  }

  /** True once every ball the mission asked for is down. */
  get filled() {
    return this.ballsDown >= this.mission.rack;
  }

  get spare() {
    return this.strokesLeft - (this.mission.rack - this.ballsDown);
  }

  /**
   * The ball the mission is hoping for next: the lowest number still standing.
   * Null once the table is clear.
   */
  get nextInOrder() {
    let next = null;
    for (const n of this.standing) if (next === null || n < next) next = n;
    return next;
  }

  /** Every ball down, every one of them in order. */
  get sweptClean() {
    return this.filled && !this.orderBroken;
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
    // THE CLEAN SWEEP. Its own line, because a bonus folded into the stroke
    // totals is a bonus the player never learns they earned — and this one is
    // the whole teaching mechanism for the order.
    const swept = this.sweptClean;
    const sweepRate = RULES.order.cleanSweep * Math.max(1, this.level);
    if (swept && sweepRate > 0) {
      this.roomScore += sweepRate;
      this.ledger.push({
        id: 'sweep',
        label: 'Swept in order',
        detail: `all ${this.mission.rack} · ${RULES.order.cleanSweep.toLocaleString()} × ${this.level}`,
        amount: sweepRate
      });
    }
    this.runScore += this.roomScore;
    // Once the room is banked, `roomScore` is already inside `runScore`. The
    // HUD adds the two together while a room is live, so it has to be told to
    // stop — otherwise the running total doubles the instant a room ends.
    this.roomClosed = true;
    return {
      saved,
      rate,
      bonus,
      swept,
      sweepBonus: swept ? sweepRate : 0,
      roomScore: this.roomScore,
      runScore: this.runScore
    };
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
    /** Banks that happened before the stroke last paid — the ones that earned. */
    this.paidBanks = 0;
    /** Likewise for balls touched, so a pot can report what IT earned. */
    this.paidTouched = 0;
    /** The multiplier the stroke actually paid at, as opposed to reached. */
    this.paidMultiplier = 0;
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
        // The figure it PAID at, not the one it reached afterwards.
        detail: `×${this.paidMultiplier || this.multiplier}`,
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
      multiplier: this.paidMultiplier || this.multiplier,
      banks: this.paidBanks,
      scratched: this.scratched
    };
    if (this.strokesLeft <= 0 && !this.filled) this.failed = true;
    this.resetStroke();
    return summary;
  }

  /* ---------------------------------------------------------------- *
   * The multiplier ladder
   * ---------------------------------------------------------------- */

  /**
   * A RUNG ON THE LADDER IS NOT MONEY UNTIL SOMETHING DROPS ON IT.
   *
   * `bestMultiplier` used to be recorded here, so a stroke that banked around
   * the table after its last ball went down kept climbing a figure nothing was
   * ever paid at — and the stroke's own ledger line then reported that figure
   * as what it paid. Reported as banks after a pot counting as extra
   * multipliers, which is exactly what the numbers said even though the score
   * was right: points are paid at the instant a ball drops, at the multiplier
   * standing THEN, and the ladder afterwards is a promise to a ball that never
   * came.
   *
   * So the ladder still climbs on every bank, because the next pot might be
   * about to happen — and what is REMEMBERED is only ever the figure something
   * was actually paid at. See `_paid`.
   */
  _step(amount) {
    this.multiplier = Math.min(RULES.multiplier.max, this.multiplier + amount);
    return this.multiplier;
  }

  /** Called the instant the ladder pays out, and only then. */
  _paid() {
    this.paidMultiplier = this.multiplier;
    this.paidBanks = this.banks;
    this.paidTouched = this.ballsTouched;
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
    return this.multiplier;
  }

  /* ---------------------------------------------------------------- *
   * Paying out
   * ---------------------------------------------------------------- */

  /**
   * Is potting this ball legal, on a table with these balls still standing and
   * this many already down?
   *
   * Two rules, and they are the same rule at two strengths. Under an "8 last"
   * mission the 8 is a foul until it is the only ball left. Under STRICT
   * order, every ball but the next one in order is a foul — which is that same
   * sentence with "the 8" replaced by "whatever is next".
   *
   * The table is a parameter rather than `this`, because the preview has to
   * ask the same question about a table that does not exist yet: the second
   * ball of a two-ball stroke is judged on the table the FIRST one leaves.
   *
   * @returns {{reason: 'order'|'eight', next: number|null}|null}
   */
  _foulOn(number, standing, ballsDown) {
    if (this.mission.strictOrder) {
      let next = null;
      for (const n of standing) if (next === null || n < next) next = n;
      return next !== null && number !== next ? { reason: 'order', next } : null;
    }
    if (!this.mission.eightLast) return null;
    if (number !== RACK.eight) return null;
    return ballsDown < this.mission.rack - 1 ? { reason: 'eight', next: null } : null;
  }

  /** @returns {'order'|'eight'|null} */
  foulReason(number) {
    return this._foulOn(number, this.standing, this.ballsDown)?.reason ?? null;
  }

  isFoul(number) {
    return this.foulReason(number) !== null;
  }

  /**
   * WHAT THE MISSION WOULD SAY TO A STROKE THAT HAS NOT HAPPENED YET.
   *
   * Given the balls a drawn line claims to sink, in the order it sinks them,
   * which of them the mission would refuse. This is what lets the preview go
   * red while the player is still aiming, instead of the refusal arriving
   * after the stroke is spent — and it walks a COPY of the table, because a
   * pot that is a foul right now may be perfectly legal by the time the stroke
   * gets to it: under strict order, sinking the 1 and then the 2 is two legal
   * pots, and asking about the 2 against the table as it stands today would
   * call the second one a foul.
   *
   * The order is the order the line hands them off in, which is the best a
   * static projection has: two balls travelling at once can drop in either
   * order, and nothing drawn before the stroke can know which.
   *
   * @param {number[]} numbers
   * @returns {Array<{reason: 'order'|'eight', next: number|null}|null>}
   */
  foulsAhead(numbers) {
    const standing = new Set(this.standing);
    let down = this.ballsDown;
    return numbers.map((number) => {
      const foul = this._foulOn(number, standing, down);
      if (!foul) {
        standing.delete(number);
        down += 1;
      }
      return foul;
    });
  }

  /**
   * A ball goes down. The ladder steps first, then the ball pays at the figure
   * standing after the step — so the pot that completes a long route is worth
   * more than the pot that opens one.
   *
   * Every pocket pays the same. There is nothing to pass in but the number.
   */
  pot(number) {
    // Asked BEFORE the ball leaves the table, or the ball the mission was
    // hoping for is the ball we just removed and every pot reads as in order.
    const wanted = this.nextInOrder;
    const inOrder = wanted !== null && number === wanted;

    this._step(RULES.multiplier.perBallDown);
    // The order bonus is rungs rather than a separate pot of money, so it
    // compounds with everything else the stroke has built and shows up in the
    // one figure the player is already watching.
    let rungs = 0;
    if (inOrder) {
      this.orderStreak += 1;
      this.orderPots += 1;
      rungs = Math.min(this.orderStreak, RULES.order.streakCap) * RULES.order.bonusRung;
      if (rungs > 0) this._step(rungs);
    } else {
      this.orderStreak = 0;
      this.orderBroken = true;
    }

    this._paid();
    const value = Math.round(number * RULES.score.perPip * this.multiplier);
    this.strokeScore += value;
    this.ballsDown += 1;
    // A refused ball never reaches here — `foulReason` turns it away before the
    // ladder sees it — so leaving `standing` is the same event as being paid
    // for, and the order never has to be told about a ball coming back.
    this.standing.delete(number);
    this.strokeEvents.push({ number, value, multiplier: this.multiplier, inOrder });
    return { value, multiplier: this.multiplier, inOrder, streak: this.orderStreak, rungs };
  }


  /* ---------------------------------------------------------------- *
   * WHAT THE PILL SAYS
   *
   * The ladder goes on climbing after a ball drops, because the next ball
   * might be about to drop onto it — that is the rule, and it is right. But a
   * figure that goes UP after your ball is already in the pocket reads as
   * points still being added to it, which was reported twice: "I'm still
   * seeing points being added for bank hits after the ball was pocketed".
   *
   * So the readout stops following the ladder the moment the stroke pays. It
   * holds the figure the last pot was PAID at until something pays again —
   * and a second pot then jumps it to its own figure, which correctly includes
   * every rail taken between the two. Nothing about the scoring changes; this
   * is the difference between the ladder and the report of it.
   * ---------------------------------------------------------------- */

  /** Has this stroke put anything down yet? */
  get hasPaid() {
    return this.strokeEvents.length > 0;
  }

  get shownMultiplier() {
    return this.hasPaid ? this.paidMultiplier : this.multiplier;
  }

  get shownBanks() {
    return this.hasPaid ? this.paidBanks : this.banks;
  }

  get shownTouched() {
    return this.hasPaid ? this.paidTouched : this.ballsTouched;
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
      mission: this.mission,
      missionText: missionText(this.mission),
      ballsDown: this.ballsDown,
      rack: this.mission.rack,
      strokesLeft: this.strokesLeft,
      strokesTotal: this.mission.strokes,
      multiplier: this.shownMultiplier,
      strokeScore: this.strokeScore,
      roomScore: this.roomScore,
      runScore: this.runScore,
      /** What the score readout should say right now. */
      displayScore: this.runScore + (this.roomClosed ? 0 : this.roomScore),
      freezeCharges: this.freezeCharges,
      banks: this.shownBanks,
      ballsTouched: this.shownTouched,
      /** The order: what it wants next, how long the run is, and whether it survived. */
      nextInOrder: this.nextInOrder,
      orderStreak: this.orderStreak,
      orderBroken: this.orderBroken,
      strictOrder: !!this.mission.strictOrder
    };
  }
}

export default Rules;
