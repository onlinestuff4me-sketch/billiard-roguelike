/**
 * Tutorial.js — five lessons, each on a table built for that lesson alone.
 *
 * The old version was a caption track: three lines of text that advanced when
 * the player happened to do the right thing in a normal, randomly generated
 * room. That fails in every way a tutorial can fail. The room might not contain
 * the shot being described. The targets wander off the diagram. A half-finished
 * attempt kills the thing you were meant to practise on, so the lesson becomes
 * unteachable halfway through. And the instruction disappears the instant you
 * start, which is exactly when you need to read it again.
 *
 * So the director owns the room outright:
 *
 *   AUTHORED ROOM   every lesson loads a scripted table (RoomManager.loadScripted)
 *                   holding only what the lesson is about. Targets are frozen so
 *                   the rack you are shown is the rack you shoot at.
 *
 *   UNFAILABLE      the player cannot be hurt: contact and projectile damage
 *                   are off while a lesson runs. Targets that must survive
 *                   being hit are flagged `invulnerable` per body; the rest die
 *                   normally, exactly as they do in play, and a partial attempt
 *                   rebuilds the whole rack. So "hit two at once" cannot decay
 *                   into "one left, now what", and a wrong shot costs a re-rack
 *                   rather than the lesson.
 *
 *   BUILDS UP       lesson N assumes N-1. Three in a row reuses two in a row and
 *                   moves the rack off the cue's resting line, so the last
 *                   thing the tutorial asks for is the first thing it has not
 *                   already drawn the answer to.
 *
 *   ALWAYS ON       the card stays up for the whole lesson. Only the status line
 *                   under it changes, so feedback never costs you the instruction.
 */

import { PLAYER_STATE } from '../entities/Player.js';
import lessonData from '../data/lessons.json';

const KEY = 'billiard-tutorial-done-v1';

/** Where the demonstrating thumb presses: clear of the ball, on the cue's axis. */
const HAND_PRESS = 2.6;
/** Where it releases. INPUT.maxDraw is 9.5 — this is a committed, near-full draw. */
const HAND_RELEASE = 8.6;


/**
 * What each lesson ASKS FOR, and how it is judged. Geometry lives in
 * src/data/lessons.json so the level tool at /tool can edit it visually; these
 * are keyed to it by id and merged at load.
 *
 * A rule returns 'score' (that was the thing — take it), 'reject' (an attempt
 * that was not it — say so), or nothing (unrelated; stay quiet). `hit` judges a
 * cue strike, `pass` judges one ball striking another, `usesGoal` is polled
 * while the table settles, `clearsRack` scores the whole rack going down in one
 * launch, and `shot` judges the launch once the rep is over.
 *
 * `say` and `hint` are MARKUP, not text. One idea per card is easier to hold
 * when one word carries it, so the target is red (`<b>`) and the gesture is
 * green (`<em>`) — the same two colours on every lesson, so the colour itself
 * is readable before the sentence is. Never more than one of each per line:
 * highlighting everything highlights nothing.
 *
 * `spot` names what the card is talking about, and the spotlight dims the rest
 * of the table around it — 'player', 'goal', 'first' (the ball nearest the
 * cue), 'rack' (all of them in one shape) or 'blocked' (the rack together with
 * whatever is in the way of it).
 */
const RULES = {
  pocket: {
    // The gesture and the rule arrive together. A player who has only been
    // told to hit a ball has not been told what the game is.
    say: 'Knock the <b>3</b> in',
    hint: 'Press <em>anywhere</em> and pull back, like a cue.',
    spot: 'first',
    hand: true,
    handDraw: 6.4,
    pot: () => 'score',
    facing: 'Other way — the ball fires AWAY from your thumb. Drag from below it.',
    cheer: 'That is the whole game',
    whiff: 'Missed the ball — line up on it first',
    nudge: 'The cue is already pointing the right way. Just pull straight back.'
  },

  // NO WORDS THE PLAYER HAS NOT BEEN GIVEN.
  //
  // This board used to say "aim at the ghost" and "slide it onto the far
  // side". Nothing had ever told the player what a ghost was, and "slide it"
  // names a gesture that does not exist — you turn the cue, you do not drag
  // the circle. It says what is on screen: a white circle, and where to put
  // it.
  angle: {
    say: 'Now <em>angle</em> it in',
    hint: 'The <em>white circle</em> is where your ball will be when it touches the <b>2</b>. Turn until it sits on the far side.',
    spot: 'first',
    hand: true,
    handDraw: 6.4,
    pot: (p) => (p.ball.number === 2 ? 'score' : null),
    cheer: 'Cut and in',
    scold: 'Straight at it sends the 2 wide — put the white circle further round',
    whiff: 'Missed — the white circle shows where your ball touches the 2',
    nudge: 'Turn until the white circle sits on the far side of the 2, lined up with the lit pocket.'
  },

  // FOUR BALLS AND A BUDGET — TAUGHT BY COUNTING, NOT BY A GATE.
  //
  // This board used to demand two balls down in a SINGLE stroke. Brute-forcing
  // every heading at every power through the real physics found seven such
  // shots in 2160 — and the best re-tuned pair layout only widened that to a
  // 1.5-degree window. Potting one ball already needs one to three degrees;
  // needing the follow-through to drop a second one as well is a miracle, not
  // a lesson. Worse, potting ONE ball matched no rule at all, so the shot the
  // player had just made worked and the board said nothing.
  //
  // The budget is now taught the way it is actually felt: four balls go down
  // over as many strokes as it takes, the count is on screen the whole time,
  // and the third stroke is called out as the one the real room would have
  // stopped at. The arithmetic does the teaching and nobody gets stranded.
  budget: {
    say: 'Four balls. <em>Three shots.</em>',
    hint: 'Knock them all in. Watch how fast three shots goes.',
    spot: 'rack',
    clearRack: true,
    shots: 3,
    cheer: 'Rack cleared',
    scold: 'Nothing down that time',
    whiff: 'Missed everything — line up on a ball first',
    nudge: 'Take the easiest one on the table. The lit pocket is the near one.'
  },

  // WALLS ARE FURNITURE, NOT A PUZZLE.
  //
  // This lesson used to demand a BANK: the 3 sat behind the barrier, so the
  // only way to it was off a cushion. Sweeping every heading at every power
  // found exactly one shot in 2160 that potted — a banked pot needs better
  // than half a degree of aim, because the cushion multiplies the error and
  // the path to the ball is long. It was not a hard lesson, it was an
  // unpassable one.
  //
  // The wall now stands beside the shot instead of across it: the pot is the
  // widest direct window on the table (3.5 degrees, measured), and the wall is
  // what the cue ball rebounds off on its way out. You learn that it is solid
  // by watching it be solid, not by being locked out of the room.
  walls: {
    say: 'The wall is <em>solid</em>',
    hint: 'Knock the <b>3</b> into the lit pocket. <em>Nothing</em> passes through a wall.',
    spot: 'first',
    hand: true,
    handDraw: 6.4,
    pot: () => 'score',
    cheer: 'In — and the wall never got a say',
    scold: 'That is off the wall, not into the pocket',
    whiff: 'Missed the 3 — line up on it first',
    nudge: 'The lit pocket is right beside the 3. Barely a cut.'
  },

  'green-red': {
    say: 'Take the <em>green</em>. Miss the <b>red</b>.',
    hint: '<em>Green</em> is always good. <b>Red</b> always costs you.',
    spot: 'rack',
    needsGreen: true,
    pot: (p) => (p.tookGreen ? 'score' : 'reject'),
    cheer: 'Green on the way, red left alone',
    scold: 'In, but you missed the green — take the line that rolls over it',
    whiff: 'Missed the ball. The green is on the way, not the target',
    nudge: 'The green sits on the line to the 2. Aim so your ball rolls over it.'
  }
};

/** Geometry from the data file, married to the rule of the same id. */
export const LESSONS = lessonData.lessons.map((table) => ({
  ...RULES[table.id],
  id: table.id,
  goal: 1,
  rest: table.rest || { x: 0, z: -1 },
  call: table.call || null,
  // A measured, scratch-free potting heading in degrees. The scratch demo
  // swings the cue onto it so the fix is shown rather than described.
  solve: table.solve,
  room: {
    id: `lesson-${table.id}`,
    name: table.name,
    obstacles: table.obstacles || [],
    enemies: table.enemies || [],
    // Pockets are static architecture; only the felt objects are per-board.
    objects: table.objects || [],
    goal: table.goal || null
  }
}));

/**
 * How long a rep is given before it is called and the table is reset.
 *
 * A shot in an empty room keeps its bounce budget for the better part of half a
 * minute, so "wait for the ball to stop" is not a usable end-of-rep signal in a
 * lesson room. A rep is over once its outcome is decided, which is a few
 * seconds at most; after that the ball goes back to its spawn so the next
 * attempt starts from the same place the rack was drawn around.
 */
const SHOT_LIMIT = 3.2;

export class Tutorial {
  /**
   * @param {object} deps
   * @param {HTMLElement} deps.layer   the `#ui-layer` element
   * @param {object} deps.game
   * @param {object} deps.player
   * @param {object} deps.rooms
   * @param {object} deps.input
   * @param {object} deps.fx
   * @param {object} deps.audio
   * @param {() => void} deps.resetRun  wipe build/score state for a fresh start
   * @param {() => void} deps.finish    hand control back to the real game
   */
  constructor(deps) {
    Object.assign(this, deps);

    // THE SPOTLIGHT. A pop-up that names something on the table is only half
    // an instruction — the player still has to find the thing it named. These
    // two dim everything except a circle around it, so "knock it into the goal"
    // points as well as tells. Both are driven from the same three CSS custom
    // properties, written once a frame from the live camera.
    this.spotEl = document.createElement('div');
    this.spotEl.id = 'coach-spot';
    this.ringEl = document.createElement('div');
    this.ringEl.id = 'coach-ring';
    // The ghost hand and the track it draws along. A card can name a gesture;
    // only a demonstration teaches one, and the gesture here is 209 px long —
    // far further than a thumb travels by instinct, which is why players stop
    // pulling at whatever felt like enough.
    this.trackEl = document.createElement('div');
    this.trackEl.id = 'coach-hand-track';
    this.handEl = document.createElement('div');
    this.handEl.id = 'coach-hand';
    this.layer.appendChild(this.spotEl);
    this.layer.appendChild(this.ringEl);
    this.layer.appendChild(this.trackEl);
    this.layer.appendChild(this.handEl);

    const el = document.createElement('div');
    el.id = 'coach';
    el.innerHTML =
      '<button class="skip" type="button">Skip</button>' +
      '<div class="step"></div><div class="say"></div><div class="hint"></div>' +
      '<div class="count" hidden></div>' +
      '<button class="next" type="button" hidden></button>' +
      '<div class="status"></div>';
    this.el = el;
    this.stepEl = el.querySelector('.step');
    this.sayEl = el.querySelector('.say');
    this.hintEl = el.querySelector('.hint');
    this.countEl = el.querySelector('.count');
    this.statusEl = el.querySelector('.status');
    this.nextEl = el.querySelector('.next');
    this.skipEl = el.querySelector('.skip');
    this.layer.appendChild(el);

    // Bound to pointerdown, not click, and the event stops here.
    //
    // The stage takes a pointer capture on its own pointerdown and calls
    // preventDefault, so a bubbling press on one of these never becomes a
    // click — the button looked live and did nothing. Stopping propagation
    // also keeps the press from starting an aim underneath the card.
    const act = (el, fn) => {
      el.addEventListener('pointerdown', (event) => {
        event.stopPropagation();
        event.preventDefault();
        fn();
      });
    };
    // A lesson holds its celebration until the player says go. Auto-advancing
    // after a fixed beat meant the reward for finishing was briefer than the
    // telling-off for missing.
    act(this.nextEl, () => this._advance());
    // And there is always a way out. A tutorial that cannot be left is a wall,
    // not a tutorial — the more so because it cannot be failed, so a player who
    // has not found the gesture has no other exit.
    act(this.skipEl, () => this._finish());

    this.active = false;
    this.index = -1;
    this.done = 0;
    /** Strokes spent on the current board — the budget the third lesson counts. */
    this._strokes = 0;
    /** Did the stroke that just resolved match any rule? */
    this._scored = false;

    this._roomKey = null;
    this._needsRoom = false;
    this._launched = false;
    this._wrongWay = false;
    this._shotTimer = 0;
    this._shotLesson = -1;
    this._hits = 0;
    this._passes = 0;
    this._pots = 0;
    this._tookGreen = false;
    this._struck = new Set();
    /** Cue contacts this launch, in order, with whether each one killed. */
    this._strikes = [];
    this._rejected = false;
    /** True once a lesson is finished and the Next button is showing. */
    this._awaitingNext = false;
    this._misses = 0;
  }

  /* ---------------------------------------------------------------- *
   * Persistence
   * ---------------------------------------------------------------- */

  static get completed() {
    try {
      return localStorage.getItem(KEY) === '1';
    } catch {
      return false;
    }
  }

  static markComplete() {
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* private mode — the tutorial simply runs again next time */
    }
  }

  static reset() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* no-op */
    }
  }

  get running() {
    return this.active;
  }

  get lesson() {
    return this.active ? LESSONS[this.index] : null;
  }

  /* ---------------------------------------------------------------- *
   * Lifecycle
   * ---------------------------------------------------------------- */

  start() {
    this.resetRun();
    // Not a room. The HUD renders level 0 as dashes, so "01" appearing later is
    // the visible moment the tutorial ends and the run begins.
    this.game.level = 0;
    this.active = true;
    this._awaitingNext = false;
    this.nextEl.hidden = true;
    this.skipEl.hidden = false;
    this.game.state = 'playing';
    // The single switch that makes a lesson unfailable: while it is set,
    // nothing in the room can be hurt except by this director.
    this.game.tutorialGuard = () => false;
    this.layer.classList.add('coaching');
    // The menu hands over mid-attract-shot, so nothing about the previous ball
    // is carried in: the first lesson racks its own table immediately.
    this._launched = false;
    this.hud?.hideBanner?.();
    this._enter(0);
  }

  stop() {
    this.active = false;
    this.index = -1;
    this._awaitingNext = false;
    this._needsRoom = false;
    this._roomKey = null;
    this.game.tutorialGuard = null;
    this.layer.classList.remove('coaching');
    this.spotEl.classList.remove('show');
    this.ringEl.classList.remove('show');
    this.handEl.classList.remove('show');
    this.trackEl.classList.remove('show');
    this.el.classList.remove('show', 'done');
    // Both buttons are hidden, not merely faded. The card drops to opacity 0
    // and opacity does not stop hit-testing, so a button left un-hidden here
    // stayed live as an invisible rect over the playfield — and Skip's handler
    // still reached `finish`, which starts a new run. Tapping a patch of empty
    // table restarted the game.
    this.skipEl.hidden = true;
    this.nextEl.hidden = true;
    // Emptied rather than left holding the last lesson's text: the card stays
    // in the DOM for a possible replay, and is otherwise one class toggle away
    // from reappearing over live play.
    this.stepEl.textContent = '';
    this.sayEl.textContent = '';
    this.hintEl.textContent = '';
    this._setStatus('', null);
  }

  _finish() {
    Tutorial.markComplete();
    this.stop();
    this.finish();
  }

  /** Move to a lesson: show it now, build its table when the table is free. */
  _enter(index) {
    this.index = index;
    this.done = 0;
    this._strokes = 0;
    this._scored = false;
    this._hits = 0;
    this._struck.clear();
    this._rejected = false;
    this._misses = 0;
    // Entering a lesson means one is running, so nothing may still be waiting
    // on a Next press. Only start() and the Next handler cleared this, which
    // held for the live flow but left _enter unable to restart a lesson — it
    // would build the table and then ignore every event on it.
    this._awaitingNext = false;
    this.nextEl.hidden = true;

    const lesson = this.lesson;
    if (!lesson) return;

    // The card flips over immediately, even with the previous lesson's ball
    // still in the air: the player reads the next instruction while watching
    // the shot that earned it play out.
    this._render();
    this._setStatus('', null);

    // The card and the table change on the SAME frame. Deferring the build
    // until the previous shot resolved left the next lesson's instruction
    // sitting over a completely empty table for ~2 seconds — and, worse, a shot
    // taken into that gap was judged against a lesson that had not been
    // playable for a single frame, so lesson 2 could open already scolding you
    // with a miss on the board. The old shot is over; it does not get to finish.
    this._launched = false;
    // RE-ENTERING A LESSON MUST REBUILD ITS RACK, NOT JUST RE-HOME THE CUE.
    //
    // Completing a lesson detonates what it killed, and a scored goal stays
    // scored until the room is rebuilt. Re-entry only called _homeBall, so a
    // replay opened on a rack with dead bodies still dead and the goal still
    // closed — unpassable until a failed attempt happened to trigger a re-rack.
    // The symptom was a perfect fail / pass / fail / pass alternation.
    if (this.rooms.goal) this.rooms.goal.scored = false;
    this._needsRoom = lesson.room.id !== this._roomKey;
    if (this._needsRoom) {
      this._buildRoom();
    } else {
      this._reRack();
      this._homeBall();
    }
  }

  _buildRoom() {
    const lesson = this.lesson;
    if (!lesson) return;
    this.layer.classList.add('coaching');
    this._needsRoom = false;
    this._roomKey = lesson.room.id;
    // A lesson card is the only thing that should be talking. The boot run
    // raises a room banner behind the menu, and it was still fading across the
    // first lesson — two sets of instructions at once, one of them stale.
    this.hud?.hideBanner?.();
    this.rooms.loadScripted(lesson.room);
    // POINT AT THE TARGET, DO NOT DESCRIBE IT.
    //
    // "the far corner" is a sentence the player has to translate into a place.
    // Lighting the pocket costs no words and cannot be misread — and it uses
    // the pocket's own called state, so the tutorial is teaching the same
    // signal a contract will use later.
    this.game.callPocket?.(lesson.call || null);
    this.player.respawn(0, this.spawnZ());
    this.player.focus = this.player.focusMax;
    this._restAim();
  }

  /**
   * Park the cue on the line the lesson is about.
   *
   * The resting cue is drawn, and the trajectory preview follows it, so a
   * lesson opens with its own solution already on the table — including the
   * bank, whose two legs are visible before the player has touched anything.
   * They still have to reproduce it; they just are not being asked to guess
   * what "bank off a wall" is supposed to look like.
   */
  _restAim() {
    const rest = this.lesson?.rest;
    this.input.setHeading(rest ? rest.x : 0, rest ? rest.z : -1);
  }

  /**
   * Point at the easiest ball left, and light the pocket it belongs in.
   *
   * "Easiest" is the shortest ball-to-pocket run on the table, which is also
   * the widest aim window — the angular tolerance of a pot falls off as one
   * over that distance. So the advice the board gives is the advice the
   * geometry supports, not a preference.
   *
   * @returns {string|null} the number to name, or null if there is nothing left
   */
  _guideNext() {
    const pockets = this.rooms?.table?.pockets;
    const rack = this.rooms.scriptedEnemies.filter((e) => e.alive && e.number > 0);
    if (!pockets || !pockets.length || !rack.length) return null;
    let best = null;
    for (const ball of rack) {
      for (const pocket of pockets) {
        const d = Math.hypot(pocket.x - ball.x, pocket.z - ball.z);
        if (!best || d < best.d) best = { d, ball, pocket };
      }
    }
    if (!best) return null;
    this.game.callPocket?.(best.pocket.slot);
    return String(best.ball.number);
  }

  /**
   * THE SCRATCH DEMONSTRATION.
   *
   * Three beats, on the real cue and the real preview — nothing here is a
   * cartoon of the game:
   *
   *   0.0-0.9s  hold on the line that just scratched. The departure preview
   *             is drawing itself red across the pocket, which is the whole
   *             point: that red line was there before the shot too.
   *   0.9-2.1s  swing to a line that pots and rolls clear. The player watches
   *             the red go out as the angle opens up.
   *   2.1-3.0s  hold on the safe line, then hand the cue back on that line.
   *
   * It gives way instantly to a thumb — the moment the player takes over, the
   * demonstration has done its job and competing with them is noise.
   */
  _updateDemo(rawDt) {
    const demo = this._demo;
    if (!demo) return;
    if (this.input.isAiming || this._launched || this._awaitingNext) {
      this._demo = null;
      return;
    }
    demo.t += rawDt;
    const HOLD_BAD = 0.9;
    const SWING = 1.2;
    let k;
    if (demo.t <= HOLD_BAD) k = 0;
    else if (demo.t >= HOLD_BAD + SWING) k = 1;
    else {
      const u = (demo.t - HOLD_BAD) / SWING;
      k = u * u * (3 - 2 * u); // smoothstep, so it reads as a hand turning
    }
    const x = demo.from.x + (demo.to.x - demo.from.x) * k;
    const z = demo.from.z + (demo.to.z - demo.from.z) * k;
    const len = Math.hypot(x, z) || 1;
    this.input.setHeading(x / len, z / len);
    // Leave the cue sitting on the safe line rather than snapping back to the
    // lesson's rest heading: the demonstration ends where the shot should go.
    if (demo.t > HOLD_BAD + SWING + 0.9) this._demo = null;
  }

  /* ---------------------------------------------------------------- *
   * Spotlight
   * ---------------------------------------------------------------- */

  /**
   * What this lesson is talking about, as an AXIS-ALIGNED ELLIPSE in world
   * space — centre plus a half-extent on each axis.
   *
   * Not a circle: the two things most worth pointing at are a goal bar three
   * times wider than it is tall and a rack strung out in a line. A circle
   * around either has to be big enough to contain the long axis, so it spills
   * over half the table — and, for the goal, up under the card.
   *
   * A lesson names a SHAPE (`spot: 'goal'`) rather than coordinates, so the
   * geometry stays in lessons.json alone: drag a rack somewhere else in /tool
   * and the spotlight follows it, with nothing to keep in sync by hand.
   *
   * @returns {{x:number,z:number,rx:number,rz:number}|null}
   */
  _focus() {
    const lesson = this.lesson;
    if (!lesson?.spot) return null;
    const balls = (this.rooms.scriptedEnemies || []).filter((e) => e.alive);

    switch (lesson.spot) {
      case 'player':
        return { x: this.player.x, z: this.player.z, rx: 3.4, rz: 3.4 };

      case 'goal': {
        const g = lesson.room.goal;
        if (!g) return null;
        // Tighter above and below than at the sides: the bar sits just under
        // the card, and a symmetric margin puts the ring behind it.
        return { x: g.x, z: g.z, rx: g.hw + 1.4, rz: g.hh + 0.4 };
      }

      // The ball the shot starts with. Every rack in this file is aimed at from
      // the spawn, so "nearest the cue" is the one the instruction means.
      case 'first': {
        let best = null;
        let bestD = Infinity;
        for (const ball of balls) {
          const d = (ball.x - this.player.x) ** 2 + (ball.z - this.player.z) ** 2;
          if (d < bestD) {
            bestD = d;
            best = ball;
          }
        }
        return best ? { x: best.x, z: best.z, rx: 2.8, rz: 2.8 } : null;
      }

      // The whole rack, in one shape. Spotlighting each ball separately would
      // be three holes in the felt and no sense of the line they make.
      //
      // 'blocked' takes in the barriers as well, because on a bank lesson the
      // barrier is half the sentence: "the red ball is blocked" is unreadable
      // when the thing doing the blocking has been dimmed into the felt.
      case 'rack':
      case 'blocked': {
        if (!balls.length) return null;
        let minX = Infinity;
        let maxX = -Infinity;
        let minZ = Infinity;
        let maxZ = -Infinity;
        const grow = (x, z, hw = 0, hh = 0) => {
          minX = Math.min(minX, x - hw);
          maxX = Math.max(maxX, x + hw);
          minZ = Math.min(minZ, z - hh);
          maxZ = Math.max(maxZ, z + hh);
        };
        for (const ball of balls) grow(ball.x, ball.z);
        if (lesson.spot === 'blocked') {
          for (const o of lesson.room.obstacles || []) grow(o.x, o.z, o.hw || 0, o.hh || 0);
        }
        const pad = 2.4;
        return {
          x: (minX + maxX) / 2,
          z: (minZ + maxZ) / 2,
          rx: (maxX - minX) / 2 + pad,
          rz: (maxZ - minZ) / 2 + pad
        };
      }

      default:
        return null;
    }
  }

  /**
   * Project the focus circle onto the card layer.
   *
   * `#ui-layer` is `inset: 0` on the stage and the camera frustum is sized to
   * that same stage, so world units map straight onto layer pixels with no
   * bounding-rect arithmetic. Zoom and camera position are read live rather
   * than assumed: the celebration punches one and shakes the other, and a
   * spotlight that ignored either would slide off its target at the loudest
   * moment of the lesson.
   */
  _updateSpot() {
    const cam = this.engine?.camera;
    // Dark felt is useful while the player is READING about the table, and
    // squarely unhelpful while they are aiming across it — so the dim lifts the
    // instant a thumb goes down and stays off until the rep has been called.
    const off = this._awaitingNext || this._launched || this.input.isAiming;
    const focus = off ? null : this._focus();
    if (!focus || !cam || !this.layer.clientWidth) {
      this.spotEl.classList.remove('show');
      this.ringEl.classList.remove('show');
      return;
    }

    const w = this.layer.clientWidth;
    const h = this.layer.clientHeight;
    const visX = (cam.right - cam.left) / cam.zoom;
    const visZ = (cam.top - cam.bottom) / cam.zoom;
    const px = ((focus.x - cam.position.x) / visX + 0.5) * w;
    const py = ((focus.z - cam.position.z) / visZ + 0.5) * h;
    const rx = (focus.rx / visX) * w;
    const rz = (focus.rz / visZ) * h;

    for (const node of [this.spotEl, this.ringEl]) {
      node.style.setProperty('--spot-x', `${px.toFixed(1)}px`);
      node.style.setProperty('--spot-y', `${py.toFixed(1)}px`);
      node.style.setProperty('--spot-rx', `${rx.toFixed(1)}px`);
      node.style.setProperty('--spot-ry', `${rz.toFixed(1)}px`);
      node.classList.add('show');
    }
  }

  /**
   * Drive the ghost hand.
   *
   * The demonstration is the real thing, not a cartoon of it: the press point
   * and the release point are the actual positions a thumb would occupy for
   * this lesson's own resting heading, projected through the same camera maths
   * the spotlight uses. So the hand draws back along the cue's own axis, and
   * stops exactly where full power is.
   *
   * It clears the instant a real thumb goes down — the player is now doing it,
   * and a demonstration competing with their own live preview is noise.
   */
  _updateHand() {
    const lesson = this.lesson;
    const cam = this.engine?.camera;
    const off =
      !lesson?.hand ||
      this._awaitingNext ||
      this._launched ||
      this.input.isAiming ||
      !cam ||
      !this.layer.clientWidth;
    if (off) {
      this.handEl.classList.remove('show');
      this.trackEl.classList.remove('show');
      return;
    }

    // Behind the ball along the resting heading: the cue's axis, which is the
    // one direction a draw can travel without changing the aim.
    const h = this.input.heading;
    const w = this.layer.clientWidth;
    const hgt = this.layer.clientHeight;
    const visX = (cam.right - cam.left) / cam.zoom;
    const visZ = (cam.top - cam.bottom) / cam.zoom;
    const toPx = (x, z) => ({
      x: ((x - cam.position.x) / visX + 0.5) * w,
      y: ((z - cam.position.z) / visZ + 0.5) * hgt
    });

    // Start clear of the ball (INPUT.minAimRadius is 0.7; sitting on top of the
    // ball is the one place the direction goes degenerate) and finish at the
    // draw this lesson actually wants.
    const from = toPx(this.player.x - h.x * HAND_PRESS, this.player.z - h.z * HAND_PRESS);
    const draw = lesson.handDraw || HAND_RELEASE;
    const to = toPx(this.player.x - h.x * draw, this.player.z - h.z * draw);
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    for (const node of [this.handEl, this.trackEl]) {
      node.style.setProperty('--hand-x', `${from.x.toFixed(1)}px`);
      node.style.setProperty('--hand-y', `${from.y.toFixed(1)}px`);
      node.style.setProperty('--hand-dx', `${dx.toFixed(1)}px`);
      node.style.setProperty('--hand-dy', `${dy.toFixed(1)}px`);
      node.classList.add('show');
    }
    this.trackEl.style.setProperty('--hand-len', `${Math.hypot(dx, dy).toFixed(1)}px`);
    this.trackEl.style.setProperty('--hand-rot', `${((Math.atan2(dy, dx) * 180) / Math.PI).toFixed(1)}deg`);
  }

  /* ---------------------------------------------------------------- *
   * Frame
   * ---------------------------------------------------------------- */

  update(rawDt) {
    if (!this.active) return;

    // Ahead of the early return below: the spotlight follows a camera that is
    // still shaking and punching its zoom through the celebration, so it has to
    // be re-projected on frames where nothing else about the lesson is running.
    this._updateSpot();
    this._updateHand();
    this._updateDemo(rawDt);

    if (this._awaitingNext) return;

    // Bullet time is a teaching aid, not a resource — right up until the last
    // lesson, which lets the gauge drain for real. Otherwise the player leaves
    // the tutorial having never seen the meter that limits how long they can
    // think, and meets it for the first time while something is hitting them.
    this.player.focus = this.player.focusMax;

    // The goal lesson is decided by where a ball came to rest, so it is polled
    // rather than driven by an event.
    if (this._launched && this.lesson?.usesGoal) this._checkGoal();

    if (this._launched && !this.input.isAiming) {
      // Only while the world is running. Aiming stops time completely, but this
      // clock used to keep draining through it — so holding an aim for three
      // seconds after a shot cancelled that shot mid-gesture: the ball teleported
      // from mid-flight back to spawn and the player was told they had missed,
      // with their thumb still down. Taking three seconds over a shot is
      // entirely ordinary, and bullet time exists to invite exactly that.
      this._shotTimer -= rawDt;
      const settled = this.player.state === PLAYER_STATE.IDLE;
      if (settled || this._shotTimer <= 0) {
        this._launched = false;
        this._resolveShot();
      }
    }

  }

  /* ---------------------------------------------------------------- *
   * Events from the game
   * ---------------------------------------------------------------- */

  /**
   * @param {'aiming'|'launch'|'hit'} name
   * @param {object} [payload]
   */
  notify(name, payload = {}) {
    const lesson = this.lesson;
    if (!lesson || this._awaitingNext) return;

    if (name === 'launch') {
      // The cue model fires along (ball - thumb), so the instinctive first move
      // — putting a thumb on the thing the card names — fires directly AWAY
      // from it. That used to pass anyway, off the bottom rail, teaching the
      // opposite of the control it was introducing.
      this._wrongWay = !!lesson.facing && this._awayFromRack(payload);
      // Kept so a scratch can replay the shot that caused it before showing
      // the angle that would not have.
      this._lastAim = { x: payload.dirX ?? 0, z: payload.dirZ ?? -1 };
      this._demo = null;
      // Taking the next shot is the only thing that clears the last one's
      // feedback. It used to expire on a 2.2s timer, which is not long enough
      // to read a sentence, look at the table and work out what it means — the
      // advice was gone before it had been understood.
      this._setStatus('', null);
      this._launched = true;
      this._shotTimer = SHOT_LIMIT;
      this._shotLesson = this.index;
      this._hits = 0;
      this._passes = 0;
      this._pots = 0;
      this._scored = false;
      this._tookGreen = false;
      this._struck.clear();
      this._strikes.length = 0;
      this._rejected = false;
      return;
    }

    // One ball striking another. `depth` counts how far the shot was handed
    // along in this launch: 1 is the first ball reaching a second, 2 is that
    // second ball reaching a third.
    if (name === 'pass') {
      this._passes += 1;
      if (!lesson.pass) return;
      const verdict = lesson.pass({ ...payload, depth: this._passes });
      if (verdict === 'score') this._score();
      else if (verdict === 'reject') this._rejected = true;
      return;
    }

    // A ball going down a pocket. This is the verdict most boards are judged
    // on, because it is the thing the game is actually about.
    if (name === 'potted') {
      this._pots += 1;
      // A rack-clearing board is judged when the stroke ends, not on each ball
      // — a shot that drops two should read as one success, not two.
      if (lesson.clearRack) return;
      if (!lesson.pot) return;
      const verdict = lesson.pot({ ...payload, tookGreen: this._tookGreen });
      if (verdict === 'score') this._score([payload.ball]);
      else if (verdict === 'reject') this._rejected = true;
      return;
    }

    // Knocking your own ball in fails the rep on every board. It is the one
    // mistake that is always a mistake, so it is always called by name.
    // A SCRATCH IS THE BEST TEACHING MOMENT THE GAME HAS.
    //
    // It is the one mistake that is always a mistake, the player has just
    // watched it happen, and the fix is a property of the shot they can see:
    // hit the ball squarely and your own ball follows it in; hit it at an
    // angle and yours rolls away instead. So the board does not just say so —
    // it swings the cue from the line that scratched to a line that does not,
    // and the departure preview turns from red to safe on the way. See _demo.
    if (name === 'scratch') {
      this._rejected = true;
      this._setStatus(
        lesson.scratched ||
          'Scratch — your ball followed it in. Watch: angle the shot and the red line turns away.',
        'bad'
      );
      if (Number.isFinite(lesson.solve) && this._lastAim) {
        const to = (lesson.solve * Math.PI) / 180;
        this._demo = {
          from: this._lastAim,
          to: { x: Math.sin(to), z: -Math.cos(to) },
          t: 0
        };
      }
      return;
    }

    // A pick-up or a hazard. Only the green matters to a lesson; hitting the
    // red is its own punishment and the board says so without failing you.
    if (name === 'object') {
      if (payload.object?.good) this._tookGreen = true;
      return;
    }

    if (name === 'hit') {
      this._strikes.push({ enemy: payload.enemy, killed: !!payload.killed });
      this._hits += 1;
      // Fired away from the rack and connected anyway, off a rail. It does not
      // count: the whole point of the first lesson is which way the orb goes.
      if (this._wrongWay) {
        this._rejected = true;
        return;
      }
      if (payload.enemy) this._struck.add(payload.enemy);
      if (!lesson.hit) return;
      const verdict = lesson.hit(payload);
      if (verdict === 'score') {
        this._score(lesson.killsStruck ? [...this._struck] : [payload.enemy]);
      } else if (verdict === 'reject') {
        this._rejected = true;
      }
    }
  }

  /** Was this shot fired more than 90 degrees away from the rack? */
  _awayFromRack({ dirX = 0, dirZ = 0 }) {
    const rack = this.rooms.scriptedEnemies.filter((e) => e.alive);
    if (!rack.length) return false;
    const cx = rack.reduce((a, e) => a + e.x, 0) / rack.length - this.player.x;
    const cz = rack.reduce((a, e) => a + e.z, 0) / rack.length - this.player.z;
    const len = Math.hypot(cx, cz) || 1;
    return (dirX * cx + dirZ * cz) / len < 0;
  }

  /** Has a target been driven into the lit bar? */
  _checkGoal() {
    const rooms = this.rooms;
    if (!rooms.goal || rooms.goal.scored) return;
    for (const enemy of rooms.scriptedEnemies) {
      if (!enemy.alive) continue;
      if (!rooms.inGoal(enemy.x, enemy.z, -enemy.radius * 0.4)) continue;
      rooms.goal.scored = true;
      this._score([enemy]);
      return;
    }
  }

  /**
   * The rep is over. Judge it against the lesson that launched it — a shot fired
   * under lesson 2 is not evidence about lesson 3 — then put the table back the
   * way the lesson drew it.
   */
  _resolveShot() {
    const lesson = LESSONS[this._shotLesson];
    const stillIts = lesson && this._shotLesson === this.index && !this._awaitingNext;

    if (stillIts && lesson.usesGoal && this.done < lesson.goal) this._rejected = true;

    // Did this launch clear the rack? Bodies destroyed, however they were
    // destroyed — by the cue ball or by each other. That is what the player
    // watched happen and what the chain counter in the HUD already agrees with.
    if (stillIts && lesson.relay) {
      const rack = this.rooms.scriptedEnemies;
      const moved = rack.filter(
        (e) => Math.hypot(e.x - e.homeX, e.z - e.homeZ) > 0.6
      ).length;
      // At least one ball-to-ball hand-off, and every ball ended up somewhere
      // else. Counting cue strikes instead was wrong: a cue ball that stops
      // dead on the first ball still creeps forward afterwards and taps another
      // one, which is not the player doing anything — but it made the strike
      // count 2 and rejected a shot that had visibly worked.
      if (this._passes >= 1 && rack.length && moved >= rack.length) this._score();
      else this._rejected = true;
    }

    // THE SHATTER. A max-power direct hit destroys a basic ball outright, and
    // because the cue only passes through a body it KILLS, that is also what
    // lets the shot carry on into the next one. Judged on the whole sequence:
    // shatter on first contact, reach the second ball, hand off to the third.
    // Anything looser passed at 0.70 power and taught nothing about power — the
    // ball simply got knocked into a wall and splatted there instead.
    if (stillIts && lesson.shatterThrough) {
      const first = this._strikes[0];
      const rack = this.rooms.scriptedEnemies;
      const shattered = !!first && first.killed && first.enemy === rack[0];
      const reachedSecond = this._strikes.some((k) => k.enemy === rack[1]);
      if (shattered && reachedSecond && this._passes >= 1) this._score();
      else this._rejected = true;
    }

    // SOFT PASS. The lesson is "a gentler hit MOVES it instead of breaking it",
    // so it must not be satisfied by a max-power shot that shattered the ball
    // and happened to register a carom on its way out. The struck ball lives.
    if (stillIts && lesson.softPass) {
      const rack = this.rooms.scriptedEnemies;
      // "Survived the CUE", not "is alive now". A ball can take the softer hit
      // exactly as the lesson asks, travel, hand off, and then splat on a far
      // wall seconds later — judging its final state failed the very shot the
      // card describes.
      const struck = this._strikes.find((k) => k.enemy === rack[0]);
      if (struck && !struck.killed && this._passes >= 1) this._score();
      else this._rejected = true;
    }

    if (stillIts && lesson.clearsRack) {
      const rack = this.rooms.scriptedEnemies;
      const down = rack.filter((e) => !e.alive).length;
      if (down >= rack.length && rack.length) this._score();
      else this._rejected = true;
    }

    if (stillIts && lesson.shot) {
      const verdict = lesson.shot({ hits: this._hits });
      if (verdict === 'score') this._score();
      else if (verdict === 'reject') this._rejected = true;
    }

    // CLEAR THE RACK. Judged once per stroke, and the balls stay down between
    // strokes — this is one long attempt, not a series of identical reps.
    let counted = false;
    if (stillIts && lesson.clearRack) {
      counted = true;
      const rack = this.rooms.scriptedEnemies;
      const left = rack.filter((e) => e.alive).length;
      if (left === 0) {
        this._score();
      } else if (this._pots > 0) {
        // Only a stroke that PUT SOMETHING DOWN spends a shot. A tutorial that
        // charges for misses turns its own arithmetic into a trap: the player
        // runs out of budget while still learning the gesture the budget is
        // supposed to be about.
        this._strokes += 1;
        const s = lesson.shots - this._strokes;
        const next = this._guideNext();
        this._setStatus(
          `${left} left · ${s} shot${s === 1 ? '' : 's'} of your three${next ? ` · go for the ${next}` : ''}`,
          s > 0 ? 'good' : 'bad'
        );
      } else {
        const next = this._guideNext();
        this._setStatus(
          `Nothing down, so that one is free. ${left} left${next ? ` — go for the ${next}` : ''}`,
          'bad'
        );
      }
    }

    // NO STROKE GOES UNANSWERED.
    //
    // Every rule above is opt-in, and a shot that matched none of them fell
    // through in silence: the table reset, the card did not change, and a
    // player who had just watched a ball drop was told nothing. Silence is
    // indistinguishable from the game being broken, so the absence of a
    // verdict IS a verdict.
    if (stillIts && !counted && !this._scored && !this._rejected) this._rejected = true;

    if (stillIts && this._rejected) {
      // A shot that touched nothing is a different mistake from a shot that
      // touched some of it, and saying nothing at all — which is what a whiff
      // used to get — is indistinguishable from the game being broken.
      const line = this._wrongWay
        ? lesson.facing
        : this._hits === 0 && lesson.whiff
          ? lesson.whiff
          : lesson.scold || 'Not quite — go again';
      this._setStatus(line, 'bad');
      this._misses += 1;
      // Nothing here can be failed, but something you cannot fail and cannot
      // do either is just a wall. After a couple of honest attempts the hint
      // stops being evocative and starts being the actual instruction.
      if (this._misses >= 2 && lesson.nudge) {
        this.hintEl.textContent = lesson.nudge;
      }
    }
    this._rejected = false;
    this._wrongWay = false;

    this._homeBall();
    // A rack-clearing board keeps its progress: re-racking between strokes
    // would hand back the very balls the player just spent shots on.
    if (!lesson?.clearRack || this._awaitingNext) this._reRack();
    if (this._needsRoom) this._buildRoom();
  }

  /** Clear the table with some ceremony. */
  _detonate(primary = []) {
    const at = primary.find((e) => e) || this.rooms.scriptedEnemies.find((e) => e);
    for (const enemy of this.rooms.scriptedEnemies) {
      if (enemy.alive) this.game.forceKill(enemy);
    }
    if (!at) return;
    this.fx.shockwave(at.x, at.z, 0xff3d6e, 11, 0.55);
    this.fx.shockwave(at.x, at.z, 0xfff6d8, 6.5, 0.38);
    this.fx.shockwave(at.x, at.z, 0x2ef2c4, 16, 0.7);
    this.fx.burst(at.x, at.z, 44, 0xff3d6e, 19, 1.6);
    this.fx.burst(at.x, at.z, 26, 0xfff6d8, 26, 1.1);
    this.fx.burst(at.x, at.z, 16, 0x2ef2c4, 13, 1.8);
    this.fx.floatText?.(at.x, at.z, this.lesson?.cheer || 'CLEARED', 'crit');
    this.engine?.shake?.(20);
    this.engine?.zoomPunch?.();
    this.game.audio?.roomClear?.();
  }

  /**
   * Back to the spawn, pointing at 12 o'clock. Every rack in this file is drawn
   * around where the ball starts, so a rep that began somewhere else would be
   * aiming at a diagram that no longer applies.
   */
  _homeBall() {
    this.player.placeAt(0, this.spawnZ());
    this.player.focus = this.player.focusMax;
    this._restAim();
  }

  /**
   * Put every surviving target back where the lesson drew it. A rack that
   * drifts a little further out of position with every miss quietly turns an
   * unfailable lesson into an impossible one.
   */
  _reRack() {
    // Chain targets are destroyed on contact, so a partial attempt leaves a
    // short rack. Rebuild the whole thing rather than tidying the survivors.
    if (this.rooms.scriptedEnemies.some((e) => !e.alive)) {
      this.rooms.reRackScripted();
      return;
    }
    for (const enemy of this.rooms.scriptedEnemies) {
      if (!enemy.alive || !enemy.frozen) continue;
      if (Math.abs(enemy.x - enemy.homeX) < 0.02 && Math.abs(enemy.z - enemy.homeZ) < 0.02) {
        continue;
      }
      enemy.x = enemy.homeX;
      enemy.z = enemy.homeZ;
      enemy.vx = 0;
      enemy.vz = 0;
      this.fx.burst(enemy.homeX, enemy.homeZ, 6, 0x8aa0b8, 4, 0.5);
    }
  }

  /**
   * A rep landed. The director is the only thing that can remove a target, so
   * this is also where the kills happen.
   *
   * @param {Array} [kills] targets this rep consumed
   */
  _score(kills = []) {
    const lesson = this.lesson;
    this._scored = true;
    this.done += 1;

    for (const enemy of kills) {
      if (enemy && enemy.alive) this.game.forceKill(enemy);
    }

    if (this.done >= lesson.goal) {
      // No status line on completion: the float text says the same words twice
      // as big, and the card's own done-state says it a third time. The small
      // line under the card is for corrections.
      this._setStatus('', null);
      // Finishing a lesson should feel like finishing something. Everything
      // still standing on the table goes up with it, so the reset that follows
      // reads as a reward rather than as the room being taken away.
      this._detonate(kills);
      this._complete();
      return;
    }

    this._setStatus(lesson.cheer || 'Yes', 'good');
    this._render();
  }

  /** The lesson is done. Celebrate, and hand the player the trigger. */
  _complete() {
    this._awaitingNext = true;
    this._launched = false;
    this.el.classList.add('done');

    const last = this.index + 1 >= LESSONS.length;
    if (last) {
      this.stepEl.textContent = 'Tutorial complete';
      this.sayEl.textContent = 'You know enough to play';
      this.hintEl.textContent = 'Next ones move — and they hit back.';
      this.countEl.hidden = true;
    } else {
      this._render();
    }
    this.skipEl.hidden = true;
    this.nextEl.hidden = false;
    this.nextEl.textContent = last ? 'Start playing \u2192' : 'Next lesson \u2192';
  }

  _advance() {
    this._awaitingNext = false;
    this.nextEl.hidden = true;
    if (this.index + 1 >= LESSONS.length) {
      this._finish();
      return;
    }
    // Un-hidden only once there IS a next lesson to skip. Above the branch, the
    // last lesson's "Start playing" press re-armed Skip on its way out and left
    // it live over the running game.
    this.skipEl.hidden = false;
    this.el.classList.remove('done');
    this._enter(this.index + 1);
  }

  /* ---------------------------------------------------------------- *
   * Card
   * ---------------------------------------------------------------- */

  _render() {
    const lesson = this.lesson;
    if (!lesson) return;
    this.stepEl.textContent = `Lesson ${this.index + 1} of ${LESSONS.length}`;
    // innerHTML, deliberately: lesson copy carries <em>/<b> so the one word
    // that matters is coloured. Nothing here is player-supplied — every string
    // is a constant in RULES above — so there is nothing to escape.
    this.sayEl.innerHTML = lesson.say;
    this.hintEl.innerHTML = lesson.hint;

    if (lesson.showCount) {
      this.countEl.hidden = false;
      this.countEl.textContent = '';
      for (let i = 0; i < lesson.goal; i++) {
        const pip = document.createElement('span');
        pip.className = i < this.done ? 'pip on' : 'pip';
        this.countEl.appendChild(pip);
      }
      const tally = document.createElement('span');
      tally.className = 'tally';
      tally.textContent = `${this.done} / ${lesson.goal}`;
      this.countEl.appendChild(tally);
    } else {
      this.countEl.hidden = true;
    }

    this.el.classList.add('show');
  }

  /**
   * ONE PLACE FOR EVERY WORD A LESSON SAYS.
   *
   * Corrections used to be a separate floating line with its own style and its
   * own timer — a second voice, in a second place, that could vanish before it
   * had been read. They replace the card's own hint line now: same component,
   * same position, and nothing hides them but the next attempt.
   */
  _setStatus(text, tone) {
    this.statusEl.classList.remove('show', 'good', 'bad');
    this.hintEl.classList.remove('good', 'bad');
    if (!text) {
      if (this.lesson) this.hintEl.innerHTML = this.lesson.hint || '';
      return;
    }
    this.hintEl.textContent = text;
    if (tone) this.hintEl.classList.add(tone);
  }

  dispose() {
    this.el.remove();
    this.spotEl.remove();
    this.ringEl.remove();
    this.handEl.remove();
    this.trackEl.remove();
  }
}

export default Tutorial;
