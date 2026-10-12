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
 *     beginStroke()           POINTS 0, MULT x1, nothing locked
 *       hit() / bank() / kiss() / gold()   events build the two numbers
 *       pot(number)           adds its own events, then LOCKS everything so far
 *     strokeResult()          what the stroke pays, and what is taken back
 *     endStroke()             banks the stroke, spends one from the budget
 *   endRoom()                 pays for every stroke left unspent
 *
 * The rule worth stating out loud: NOTHING COUNTS UNTIL A BALL DROPS. Every
 * event adds to POINTS or MULT the moment it happens, but it is pending until
 * a pot locks it in. Whatever the stroke does after its last pot is taken
 * back, and a stroke that sinks nothing pays nothing. The stroke pays
 * POINTS x MULT as they stood at its last pot.
 *
 * Because the bonus zone MULTIPLIES, order still matters: a wall taken before
 * the zone is doubled, the same wall after it is not.
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

/** A table's points target: it starts easy and grows each table. */
export function targetFor(level) {
  const T = RULES.target;
  return Math.round((T.base * Math.pow(T.growth, Math.max(0, level - 1))) / T.round) * T.round;
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

    /** Stroke-scoped state: see resetStroke. */
    this.bestMultiplier = 1;
    this.resetStroke();

    this.freezeCharges = 0;
    /**
     * UPGRADES bought in the shop, as numbers added to the base rules
     * (`perHit`, `perBank`, …) and flags (`corner`, `eight`, …). See
     * src/systems/Upgrades.js. Reset with the run.
     */
    this.perks = {};
    /** CASH: the one thing that carries over between tables. Spent in the shop. */
    this.cash = RULES.cash.start;
    /** LIVES: missing a table's target costs one; none left ends the run. */
    this.lives = RULES.lives.start;
    /** This table's points target (RULES.target). */
    this.target = targetFor(1);
    /** Consecutive shots this table that paid (the Hot Streak upgrade). */
    this.paidStreak = 0;
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
    this.target = targetFor(level);
    this.paidStreak = 0;
    // ICE BOX: every table starts with some Freeze frame already in hand.
    if (this.perks.icebox) this.grantFreeze(this.perks.icebox);
    this.failed = false;
    this.roomClosed = false;
    this.bestMultiplier = 1;
    this.resetStroke();
  }

  /** A scoring value with the run's upgrades added to the base rule. */
  val(key) {
    const base = {
      perHit: RULES.score.perHit,
      perPip: RULES.score.perPip,
      savedStroke: RULES.score.savedStroke,
      perBank: RULES.multiplier.perBank,
      perKiss: RULES.multiplier.perKiss,
      bankPot: RULES.multiplier.bankPot,
      extraPot: RULES.multiplier.extraPot,
      goldFactor: RULES.multiplier.goldFactor
    }[key];
    return (base ?? 0) + (this.perks[key] || 0);
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
    const rate = this.val('savedStroke') * Math.max(1, this.level);
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

    // THE TARGET, then the PAYOUT. Interest is on what you held coming in, so
    // saving is what earns it; beating the target pays, and beating it by more
    // pays more. Missing it pays only the interest, and costs a life.
    const C = RULES.cash;
    const beaten = this.roomScore >= this.target;
    const payout = [];
    if (beaten) {
      payout.push({ id: 'beaten', label: 'Target beaten', detail: `${this.target.toLocaleString()}`, amount: C.beaten });
      if (saved > 0) payout.push({ id: 'shots', label: 'Shots left', detail: `${saved} × $${C.perShotLeft}`, amount: saved * C.perShotLeft });
      const over = Math.min(C.overCap, Math.floor((this.roomScore / Math.max(1, this.target) - 1) / C.overStep + 1e-9));
      if (over > 0) payout.push({ id: 'over', label: 'Beat it by', detail: `${Math.round((this.roomScore / this.target - 1) * 100)}%`, amount: over });
    }
    const interest = Math.min(C.interestCap, Math.floor(this.cash / C.interestPer));
    if (interest > 0) payout.push({ id: 'interest', label: 'Interest', detail: `$${this.cash} held`, amount: interest });
    const cashFrom = this.cash;
    const earned = payout.reduce((n, p) => n + p.amount, 0);
    this.cash += earned;
    const livesFrom = this.lives;
    if (!beaten) this.lives = Math.max(0, this.lives - 1);
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
      runScore: this.runScore,
      target: this.target,
      beaten,
      payout,
      earned,
      cashFrom,
      cash: this.cash,
      livesFrom,
      lives: this.lives
    };
  }

  /* ---------------------------------------------------------------- *
   * Stroke lifecycle
   * ---------------------------------------------------------------- */

  resetStroke() {
    /** The two numbers, as they stand right now (pending included). */
    this.points = 0;
    this.mult = RULES.multiplier.base;
    /**
     * Every scoring event of this stroke, in the order it happened. Each one
     * records what it added and the two numbers after it, so a presenter can
     * show it and a take-back can step back over it.
     */
    this.events = [];
    /** How many of `events` are locked in by a pot. */
    this.lockedCount = 0;
    this.lockedPoints = 0;
    this.lockedMult = RULES.multiplier.base;
    /** Pots this stroke, so the second one knows it is a second one. */
    this.potsThisStroke = 0;
    /** Balls the cue ball has already been paid for touching this stroke. */
    this._hitBalls = new Set();
    /** Balls already paid for being driven into by another ball. */
    this._kissedBalls = new Set();
    this.banks = 0;
    this.ballsTouched = 0;
    /** Banks that were locked in — the ones that earned. */
    this.paidBanks = 0;
    this.paidTouched = 0;
    this.scratched = false;
  }

  beginStroke() {
    this.resetStroke();
  }

  /* ---------------------------------------------------------------- *
   * The two numbers
   * ---------------------------------------------------------------- */

  /** The multiplier as it stands, pending included. Kept for older readers. */
  get multiplier() {
    return this.mult;
  }

  /** What the stroke would pay if it ended now: only what a pot locked in. */
  get strokeScore() {
    return this.lockedCount > 0 ? Math.round(this.lockedPoints * this.lockedMult) : 0;
  }

  /** Has a pot locked anything in yet? */
  get hasPaid() {
    return this.lockedCount > 0;
  }

  /** The events a pot has not locked in yet. */
  get pending() {
    return this.events.slice(this.lockedCount);
  }

  /**
   * Record one event. `bucket` is 'points' or 'mult'; `op` is '+' or 'x'.
   * `at` is presentation data (where it happened, what caused it) that this
   * file passes through untouched.
   */
  _add(kind, bucket, op, amount, label, at = null) {
    if (bucket === 'points') this.points += amount;
    else if (op === 'x') this.mult = Math.min(RULES.multiplier.max, this.mult * amount);
    else this.mult = Math.min(RULES.multiplier.max, this.mult + amount);
    const event = {
      index: this.events.length,
      kind,
      bucket,
      op,
      amount,
      label,
      at,
      points: this.points,
      mult: this.mult
    };
    this.events.push(event);
    return event;
  }

  /** A pot locks in everything up to and including itself. */
  _lock() {
    this.lockedCount = this.events.length;
    this.lockedPoints = this.points;
    this.lockedMult = this.mult;
    this.paidBanks = this.banks;
    this.paidTouched = this.ballsTouched;
    this.bestMultiplier = Math.max(this.bestMultiplier, this.mult);
  }

  /**
   * The cue ball's first contact with a ball this stroke: +POINTS. A second
   * contact with the same ball pays nothing, so rattling two balls together
   * cannot farm points. Returns the event, or null if it paid nothing.
   */
  hit(number, at = null) {
    this.ballsTouched += 1;
    const key = number ?? `#${this.ballsTouched}`;
    if (this._hitBalls.has(key)) return null;
    this._hitBalls.add(key);
    const label = number != null && number > 0 ? `HIT · ${number}` : 'HIT';
    return this._add('hit', 'points', '+', this.val('perHit'), label, at);
  }

  /** The cue ball banked off a wall or an obstacle: +MULT. */
  bank(at = null) {
    this.banks += 1;
    return this._add('bank', 'mult', '+', this.val('perBank'), 'WALL', at);
  }

  /** One object ball driving into another: +MULT, once per struck ball. */
  kiss(number, at = null) {
    const key = number ?? `#${this._kissedBalls.size}`;
    if (this._kissedBalls.has(key)) return null;
    this._kissedBalls.add(key);
    return this._add('kiss', 'mult', '+', this.val('perKiss'), 'KISS', at);
  }

  /** The bonus zone: multiply whatever MULT has been built. */
  gold(at = null) {
    return this._add('zone', 'mult', 'x', this.val('goldFactor'), 'ZONE', at);
  }

  /**
   * Legacy name for a contact: the cue ball touching a ball. Boons and old
   * callers that only know "touch" get the cue-contact rule.
   */
  touch(number = null, at = null) {
    return this.hit(number, at);
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
   * which of them the mission would refuse. It walks a COPY of the table,
   * because a pot that is a foul right now may be legal by the time the
   * stroke gets to it: under strict order, sinking the 1 and then the 2 is two
   * legal pots.
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
   * A ball goes down. It adds its own events — the ball's value to POINTS,
   * then a bank pot, a second-pot bonus and the order bonus to MULT — and
   * then LOCKS everything the stroke has done so far.
   *
   * @param {number} number
   * @param {{banked?: boolean, at?: object, bankAt?: object}} [opts]
   *   `banked`: the ball took a wall on its way in. `at` is where it dropped;
   *   `bankAt` is the wall it banked off, for the BANK event's presentation.
   */
  pot(number, opts = {}) {
    // Asked BEFORE the ball leaves the table, or the ball the mission was
    // hoping for is the ball we just removed and every pot reads as in order.
    const wanted = this.nextInOrder;
    const inOrder = wanted !== null && number === wanted;
    const added = [];

    const at = opts.at ?? null;
    const P = this.perks;
    added.push(this._add('pot', 'points', '+', number * this.val('perPip'), `${number} SUNK`, at));
    if (opts.banked) {
      added.push(this._add('bankPot', 'mult', '+', this.val('bankPot'), 'BANK', opts.bankAt ?? at));
    }
    if (this.potsThisStroke > 0) {
      const n = this.potsThisStroke + 1;
      const words = ['', '', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN'];
      added.push(this._add('multiPot', 'mult', '+', this.val('extraPot'), `${words[n] || n} IN ONE`, at));
    }
    // UPGRADES that read the pot itself: which pocket, which ball, when.
    const slot = at?.ref?.slot || '';
    if (P.corner && slot && slot[0] !== 'm') added.push(this._add('perk', 'mult', '+', P.corner, 'CORNER OFFICE', at));
    if (P.side && slot[0] === 'm') added.push(this._add('perk', 'mult', '+', P.side, 'SIDE HUSTLE', at));
    if (P.odd && number % 2 === 1) added.push(this._add('perk', 'points', '+', P.odd, 'ODD ONES', at));
    if (P.even && number % 2 === 0) added.push(this._add('perk', 'points', '+', P.even, 'EVEN MONEY', at));
    if (P.eight && number === 8) added.push(this._add('perk', 'mult', 'x', P.eight, 'EIGHT BALL', at));
    if (this.potsThisStroke === 0) {
      if (P.opener && this.strokesUsed === 0) added.push(this._add('perk', 'mult', '+', P.opener, 'OPENING BREAK', at));
      if (P.streak && this.paidStreak > 0) added.push(this._add('perk', 'mult', '+', P.streak * this.paidStreak, 'HOT STREAK', at));
    }
    if (P.runout && this.standing.size === 1 && this.standing.has(number)) {
      added.push(this._add('perk', 'mult', 'x', P.runout, 'RUN OUT', at));
    }
    this.potsThisStroke += 1;

    // The order bonus is MULT rather than a separate pot of money, so it
    // compounds with everything else the stroke has built.
    let rungs = 0;
    if (inOrder) {
      this.orderStreak += 1;
      this.orderPots += 1;
      rungs = Math.min(this.orderStreak, RULES.order.streakCap) * RULES.order.bonusRung;
      if (rungs > 0) added.push(this._add('order', 'mult', '+', rungs, 'IN ORDER', opts.at ?? null));
    } else {
      this.orderStreak = 0;
      this.orderBroken = true;
    }

    this._lock();
    this.ballsDown += 1;
    // A refused ball never reaches here — `foulReason` turns it away before
    // this is called — so leaving `standing` is the same event as being paid.
    this.standing.delete(number);
    return {
      value: number * this.val('perPip'),
      events: added,
      points: this.points,
      mult: this.mult,
      multiplier: this.mult,
      inOrder,
      streak: this.orderStreak,
      rungs
    };
  }

  /**
   * WHAT THIS STROKE COMES TO, without ending it.
   *
   * `takenBack` is every event after the last pot, latest last; a presenter
   * walks it backwards. A scratch or a foul voids the lot.
   */
  strokeResult() {
    const voided = this.scratched;
    return {
      points: this.lockedPoints,
      mult: this.lockedMult,
      paid: voided ? 0 : this.strokeScore,
      locked: this.lockedCount > 0,
      voided,
      takenBack: this.pending,
      events: this.events
    };
  }

  /**
   * End the stroke and spend one from the budget. A freeze does NOT come
   * through here — the whole point of a freeze is that the stroke is still
   * going.
   */
  endStroke() {
    const result = this.strokeResult();
    const paid = RULES.scratch.voidScore ? result.paid : this.strokeScore;
    this.roomScore += paid;
    if (paid > 0) {
      this.ledger.push({
        id: 'stroke',
        label: `Shot ${this.strokesUsed + 1}`,
        detail: `${this.lockedPoints} × ${this.lockedMult}`,
        amount: paid
      });
    }
    this.paidStreak = paid > 0 ? this.paidStreak + 1 : 0;
    this.strokesLeft = Math.max(0, this.strokesLeft - 1);
    this.strokesUsed += 1;
    const voided = this.scratched && this.strokeScore > 0;
    const summary = {
      paid,
      voided,
      lost: voided ? this.strokeScore : 0,
      points: this.lockedPoints,
      multiplier: this.lockedMult,
      banks: this.paidBanks,
      takenBack: result.takenBack,
      scratched: this.scratched,
      pots: this.potsThisStroke
    };
    if (this.strokesLeft <= 0 && !this.filled) this.failed = true;
    this.resetStroke();
    return summary;
  }

  /* ---------------------------------------------------------------- *
   * What the HUD shows mid-stroke: the numbers as they stand, pending
   * included. The presenter fades the boxes until something is locked.
   * ---------------------------------------------------------------- */

  get shownMultiplier() {
    return this.mult;
  }

  get shownBanks() {
    return this.banks;
  }

  get shownTouched() {
    return this.ballsTouched;
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

  /** A charge is spent whole: half a charge is progress toward one, not a freeze. */
  spendFreeze() {
    if (this.freezeCharges < 1) return false;
    this.freezeCharges -= 1;
    return true;
  }

  /** Spend CASH in the shop. Points are never spent: they are each table's test. */
  spend(dollars) {
    if (!(dollars > 0) || this.cash < dollars) return false;
    this.cash -= dollars;
    return true;
  }

  /** An extra life, up to the cap. Returns false when already full. */
  gainLife(n = 1) {
    if (this.lives >= RULES.lives.max) return false;
    this.lives = Math.min(RULES.lives.max, this.lives + n);
    return true;
  }

  /**
   * What a stroke that paid earns in charges: combinations, extra pots and a
   * big mult. Granted here; the caller shows each one landing.
   * @param {{paid:number, voided:boolean, pots:number, multiplier:number}} summary
   * @param {number} combinations balls knocked in by another ball this stroke
   * @returns {{amount:number, label:string}[]} what was actually granted
   */
  earnCharges(summary, combinations = 0) {
    const out = [];
    if (!summary || summary.paid <= 0 || summary.voided) return out;
    const E = RULES.freeze.earn;
    const add = (amount, label) => {
      const before = this.freezeCharges;
      this.grantFreeze(amount);
      if (this.freezeCharges > before) out.push({ amount: this.freezeCharges - before, label });
    };
    for (let i = 0; i < combinations; i++) add(this.perks.frostbite ? 1 : E.combination, 'Combination');
    for (let i = 1; i < (summary.pots || 0); i++) add(E.extraPot, 'Two in one');
    if (summary.multiplier >= E.bigShotMult) add(E.bigShot, `Big shot · ×${summary.multiplier}`);
    return out;
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
      points: this.points,
      mult: this.mult,
      locked: this.lockedCount > 0,
      strokeScore: this.strokeScore,
      roomScore: this.roomScore,
      runScore: this.runScore,
      /**
       * What the corner says: THIS table's points, against its target.
       * Points start fresh every table; cash is what carries over.
       */
      displayScore: this.roomScore,
      target: this.target,
      cash: this.cash,
      lives: this.lives,
      livesMax: RULES.lives.max,
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
