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
 * `say` is MARKUP, not text, and it is ONE SENTENCE — the coaching band holds
 * a fixed two lines and nothing else, so a board that needs a paragraph is a
 * board teaching two things. The markup is the game's own colour allocation,
 * not decoration: `<b>` names a ball and takes the rack's amber, `<em>` names
 * the good thing or the way through and takes green, and plain ink is the
 * band's bone-white — the same white the called pocket is lit in, so a pocket
 * named in the sentence and the pocket glowing on the felt read as one thing.
 *
 * `nudge` is the same sentence's second attempt. Nothing here can be failed,
 * but a board you cannot fail and cannot do either is a wall, so after two
 * honest misses the nudge replaces the instruction with the actual answer.
 *
 * `spot` names what the band is talking about, and the spotlight dims the rest
 * of the table around it — 'player', 'goal', 'first' (the ball nearest the
 * cue), 'rack' (all of them in one shape) or 'blocked' (the rack together with
 * whatever is in the way of it).
 */
const RULES = {
  /* ================================================================== *
   * ACT I — THE CUT. You, one ball, one pocket, and an angle.
   * ================================================================== */

  // THIS USED TO BE THREE BOARDS. "Knock it in", "find the angle" and "watch
  // where you end up" all ran on the same table with the same ball, and a
  // second ball on one of them that did nothing. Three identical tables in a
  // row do not read as three lessons; they read as the game being stuck. One
  // board, and the departure line is taught by the line itself — it is drawn
  // on every shot, and it turns red before the mistake rather than after.
  angle: {
    say: '<em>Pull back</em> and sink the <b>3</b> in the side pocket',
    spot: 'first',
    hand: true,
    handDraw: 6.4,
    pot: () => 'score',
    facing: 'Other way — the ball fires AWAY from your thumb. Drag from below it.',
    cheer: 'In, and you are still on the table',
    whiff: 'Your line went past the 3 — put it through the middle of the ball',
    nudge: 'Line the <b>3</b> up with the lit pocket, then pull back from below your ball.'
  },

  /* ================================================================== *
   * ACT II — TWO BALLS. The object ball becomes your cue.
   * ================================================================== */

  combo: {
    say: 'Sink the <b>1</b> in the side pocket, off the <b>4</b>',
    spot: 'rack',
    pot: (p) => (p.ball.number === 1 ? 'score' : null),
    cheer: 'One ball moved another. That is a combination',
    scold: 'You put the 4 down, not the 1 — the 1 is the one by the pocket',
    whiff: 'You aimed past the 4 — aim through it, at the 1 behind it',
    nudge: 'Aim <em>through</em> the <b>4</b> at the <b>1</b>. Those two already point at the lit pocket.'
  },

  // JUDGED ON THE HAND-OFF, not the pot: measured across every heading at
  // every power, the pot at the end of an angled combination is worth about a
  // degree and a half. Making the first ball reach the second is the lesson.
  'cut-combo': {
    say: 'Cut the <b>6</b> across into the <b>2</b>, toward the side pocket',
    spot: 'rack',
    handoff: true,
    cheer: 'The 6 found the 2 — that is the shot',
    scold: 'You hit the 6 too full, so it went straight — catch it further round its side',
    whiff: 'You aimed past the 6 — the shot starts on that ball',
    nudge: 'Put your white circle on the <em>left</em> of the <b>6</b>, so the 6 runs across into the 2.'
  },

  /* ================================================================== *
   * ACT III — THE TABLE. Cushions, budget, and the felt.
   * ================================================================== */

  bank: {
    say: 'The wall blocks the <b>3</b> — <em>bounce</em> off the cushion below you',
    spot: 'first',
    bankThenHit: true,
    cheer: 'Off the cushion and onto the 3 — and a bank is worth more',
    scold: 'You went straight at it and the wall took the shot — go down into the cushion instead',
    whiff: 'Your line came back short of the 3 — aim further down the cushion',
    nudge: 'Aim <em>down</em> into the cushion below you. The dashed line swings back up to the <b>3</b>.'
  },

  // TWO POCKETS, LIT THROUGHOUT. The plan spans the strokes rather than living
  // inside one of them: the 1 and the 4 belong to the side pocket, the 2 to the
  // corner, and three shots is not enough to take them one at a time carelessly.
  //
  // The single stroke that drops one in the side AND one in the corner was
  // searched for and does not exist — after the first cut the cue has lost most
  // of its speed and its departure is nearly fixed, so reaching a second ball
  // twelve units away at the right angle is a coincidence, not a plan. The
  // board points at the first shot of the route instead, and keeps both goals
  // on screen.
  budget: {
    say: 'Clear four balls in <em>three shots</em> — the <b>1</b> into the <b>4</b> first',
    spot: 'rack',
    clearRack: true,
    shots: 3,
    cheer: 'Rack cleared',
    scold: 'Nothing down — a stroke that pockets nothing costs you nothing, so go again',
    whiff: 'You touched nothing — start the shot on a ball',
    nudge: 'Aim <em>through</em> the <b>1</b> at the <b>4</b>, into the side pocket. Both lit pockets are yours.'
  },

  // THE RED SITS ON THE LAZY LINE. The obvious route to the 2 runs straight
  // over a mine; the green sits just off it. So the board is a choice between
  // the line you would take without looking and the line that pays — which is
  // the whole game stated on one table.
  //
  // The original design put the green behind a bank. Measured, a route that
  // banks, collects a pick-up and then pots is worth about a degree, so it was
  // built as a thread instead: 4.5 degrees wide, and it still costs you the
  // easy line.
  'green-red': {
    say: 'Thread to the <b>2</b> through the <em>green</em>, not over the red',
    spot: 'rack',
    needsGreen: true,
    pot: (p) => (p.tookGreen ? 'score' : 'reject'),
    cheer: 'Past the red, through the green, and in',
    scold: 'In, but your line went under the green — it pays double and it is barely off the lazy route',
    whiff: 'Your line missed the 2 — thread it between the red and the green',
    nudge: 'Turn a few degrees <em>up</em> from the red. The <em>green</em> is the next thing your line touches.'
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

    // THE BAND. One sentence, on a strip of fixed height pinned above the
    // felt, and nothing else — see docs/COACHING.md.
    //
    // What this replaces was a light card floating over the table at 12.5%,
    // capped at a quarter of the screen, which faded to nine per cent opacity
    // the instant a thumb went down so it would stop covering the shot. That
    // is the whole problem stated as a workaround: the words were in the play
    // area, so they had to be taken away exactly when the player might want to
    // re-read them. The band is not in the play area, so it never moves, never
    // fades, and never has to choose between being readable and being clear of
    // the balls. Four states — instruct, aiming, missed, complete — are the
    // same strip in the same place, in three colours.
    const el = document.createElement('div');
    el.id = 'coach';
    el.innerHTML =
      '<div class="line"></div>' +
      '<div class="prog"></div>' +
      '<button class="next" type="button" hidden></button>';
    this.el = el;
    this.lineEl = el.querySelector('.line');
    this.progEl = el.querySelector('.prog');
    this.nextEl = el.querySelector('.next');
    this.layer.appendChild(el);

    // Skip lives in the HUD band above, not in the coaching band. The band has
    // room for one sentence and one control, and the control has to be the one
    // that moves forward; a way out sitting next to it at the same size is a
    // way out that gets pressed by mistake. The HUD's score, contract and
    // stroke readouts are all hidden during a lesson, so that corner is free.
    const skip = document.createElement('button');
    skip.id = 'coach-skip';
    skip.type = 'button';
    skip.textContent = 'Skip';
    // Hidden until a lesson starts. The button it replaces lived inside the
    // card, which was opacity 0 before the tutorial ran; this one is its own
    // element on the layer, so without this it is a live control over the
    // menu and over normal play.
    skip.hidden = true;
    this.skipEl = skip;
    this.layer.appendChild(skip);

    // ENDPOINT TAGS. The band says what the board is; these say what THIS aim
    // does — where your ball ends up, where the ball you are about to move
    // ends up, and whether either of those is a pocket. They are the half of
    // the instruction that changes on every frame of the drag, which is
    // exactly the half a fixed sentence cannot carry.
    this.tagEl = document.createElement('div');
    this.tagEl.id = 'coach-tags';
    this.layer.appendChild(this.tagEl);
    this._tagNodes = [];

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
    /** Has this board been missed enough times to swap the hint for the answer? */
    this._nudging = false;
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
    this.lineEl.textContent = '';
    this.progEl.textContent = '';
    this.progEl.hidden = false;
    this.el.classList.remove('good', 'bad');
    this._hideTags();
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
    this._nudging = false;
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
    // Keep the board's own called pockets lit and ADD the guided one. On a
    // board whose whole point is that two pockets are in play, replacing them
    // with a single suggestion throws the plan away to give a hint.
    const board = this.lesson?.call;
    const base = board == null ? [] : Array.isArray(board) ? board : [board];
    this.game.callPocket?.([...new Set([...base, best.pocket.slot])]);
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
   * ENDPOINT TAGS: the per-aim half of the instruction.
   *
   * The band is fixed and says what the board is. These say what the shot
   * currently drawn would DO — "→ SIDE POCKET" at the end of the rack ball's
   * route, "YOUR BALL" or "SCRATCH" at the end of yours. The geometry is
   * computed in main.js beside the routes they annotate (`game.aimTags`), so a
   * tag and the line under it can never disagree.
   *
   * Only while aiming: with no thumb down there is no route, and a tag with no
   * line under it is a label for nothing. That also means they cost the
   * instruct state nothing — goal 2's guide line is optional, and here it is
   * the player who opts in by touching the screen.
   */
  _updateTags() {
    const cam = this.engine?.camera;
    const tags = this.input.isAiming && !this._awaitingNext ? this.game.aimTags : null;
    if (!tags || !tags.length || !cam || !this.layer.clientWidth) {
      this._hideTags();
      return;
    }

    const w = this.layer.clientWidth;
    const h = this.layer.clientHeight;
    const visX = (cam.right - cam.left) / cam.zoom;
    const visZ = (cam.top - cam.bottom) / cam.zoom;

    for (let i = 0; i < tags.length; i += 1) {
      let node = this._tagNodes[i];
      if (!node) {
        node = document.createElement('div');
        node.className = 'coach-tag';
        this.tagEl.appendChild(node);
        this._tagNodes[i] = node;
      }
      const tag = tags[i];
      const px = ((tag.x - cam.position.x) / visX + 0.5) * w;
      const py = ((tag.z - cam.position.z) / visZ + 0.5) * h;
      node.textContent = tag.text;
      node.className = `coach-tag show ${tag.tone}`;
      // Clamped inside the layer, and by the tag's OWN measured width. A route
      // that ends hard against a rail or in a corner pocket puts its endpoint
      // within a few pixels of the edge, and a label centred there runs off
      // the screen — which is how the scratch float text used to read
      // "CRATCH".
      const half = node.offsetWidth / 2 + 4;
      node.style.left = `${Math.min(Math.max(px, half), w - half).toFixed(1)}px`;
      node.style.top = `${Math.min(Math.max(py, 14), h - 14).toFixed(1)}px`;
    }
    for (let i = tags.length; i < this._tagNodes.length; i += 1) {
      this._tagNodes[i].className = 'coach-tag';
    }
  }

  _hideTags() {
    for (const node of this._tagNodes) node.className = 'coach-tag';
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
    this._updateTags();
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
      this._pendingScore = null;
      this._tookGreen = false;
      this._struck.clear();
      this._strikes.length = 0;
      this._rejected = false;
      this._scratched = null;
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
      // A REP IS JUDGED WHEN IT IS OVER, NOT WHILE IT IS STILL HAPPENING.
      //
      // Scoring the instant a ball dropped meant a stroke that potted the right
      // ball AND then scratched was already a pass, with the Next button up,
      // before the cue ball had finished rolling. The verdict is held until the
      // table stops, where `_resolveShot` can see everything the stroke did.
      const verdict = lesson.pot({ ...payload, tookGreen: this._tookGreen });
      if (verdict === 'score') this._pendingScore = [payload.ball];
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
      // Held, not written. The verdict for a stroke is written once, when the
      // table has stopped — and this one has to survive that write, because a
      // scratch is a more specific fact than anything the board's own scold
      // can say. Writing it here meant `_resolveShot` overwrote the sharpest
      // correction the game has with the generic one a moment later.
      this._scratched =
        lesson.scratched ||
        'Scratch — your ball followed the shot in. Angle it, and yours rolls clear instead.';
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

  /** Is a finished lesson waiting for the player to press Next? */
  get awaitingNext() {
    return this.active && this._awaitingNext;
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

    // Did any rule below actually judge this stroke? See the "no stroke goes
    // unanswered" gate at the end.
    let counted = false;

    // THE HAND-OFF. Cue reaches ball A, A reaches ball B. This is the whole
    // content of a combination, and it is judged on its own because the pot at
    // the end of an ANGLED one measures at a degree and a half — the shot is
    // real, but requiring it would be requiring tournament accuracy of someone
    // on their fifth board. Dropping it as well is a bonus the cheer notices.
    if (stillIts && lesson.handoff) {
      counted = true;
      if (this._passes >= 1) this._score();
      else this._rejected = true;
    }

    // THE BANK. Same reasoning: a banked pot measures at one degree. Using the
    // cushion to reach a ball you could not otherwise touch is the lesson.
    if (stillIts && lesson.bankThenHit) {
      counted = true;
      if (this._hits >= 1 && (this.player?.bouncesUsed ?? 0) >= 1) this._score();
      else this._rejected = true;
    }

    // CLEAR THE RACK. Judged once per stroke, and the balls stay down between
    // strokes — this is one long attempt, not a series of identical reps.
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

    // The held pot verdict. A scratch anywhere in the stroke takes it away —
    // that is the whole reason it was held.
    if (stillIts && this._pendingScore && !this._rejected) {
      counted = true;
      this._score(this._pendingScore);
    }
    this._pendingScore = null;

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
      const line = this._scratched
        ? this._scratched
        : this._wrongWay
          ? lesson.facing
          : this._hits === 0 && lesson.whiff
            ? lesson.whiff
            : lesson.scold || 'Not quite — go again';
      this._setStatus(line, 'bad');
      this._misses += 1;
      // Nothing here can be failed, but something you cannot fail and cannot
      // do either is just a wall. After a couple of honest attempts the
      // evocative sentence gives way to the actual instruction — and it is not
      // shown NEXT TO the correction, it REPLACES the board's line from now
      // on. The band holds one sentence, and the one that earns the space
      // after two misses is the one with the answer in it.
      if (this._misses >= 2 && lesson.nudge) this._nudging = true;
    }

    // Kept, because the reset below needs to know how the stroke went and the
    // per-stroke flags are about to be cleared for the next one.
    const missed = this._rejected;
    this._rejected = false;
    this._wrongWay = false;
    this._scratched = null;

    // A RACK-CLEARING BOARD IS ONE LONG ATTEMPT, NOT A SERIES OF REPS.
    //
    // Every other board resets between attempts, which is right: they are the
    // same shot practised until it lands. This one is a rack being cleared over
    // three strokes, and teleporting the cue ball back to the spawn after each
    // one throws away the position the player just played for — and does it
    // silently, which is exactly how it was reported ("it resets my cue without
    // telling me why"). The cue stays where it stopped, like it would at a
    // table, and only goes home when the attempt itself is over.
    const inProgress = lesson?.clearRack && !this._awaitingNext && !missed;
    if (!inProgress) {
      this._homeBall();
      this._reRack();
    } else {
      this._restAim();
    }

    // SHOW THE FIX, DO NOT ONLY NAME IT.
    //
    // This used to run on a scratch alone, which is the one miss where the
    // mistake is unmissable anyway — the player just watched their own ball
    // disappear. Every OTHER miss is the one where they cannot see what went
    // wrong, because the difference between the line they played and the line
    // that works is two degrees of a thing they cannot replay.
    //
    // So on any miss that put the cue back on its spawn, the demonstration
    // runs: hold on the heading that just failed, then swing to a measured
    // solution, on the real cue with the real preview redrawing itself the
    // whole way. It gives way the instant a thumb goes down. A board mid-way
    // through a rack is skipped, because `solve` is measured from the spawn
    // and the cue is not there.
    if (missed && !inProgress && Number.isFinite(lesson?.solve) && this._lastAim) {
      const to = (lesson.solve * Math.PI) / 180;
      this._demo = {
        from: this._lastAim,
        to: { x: Math.sin(to), z: -Math.cos(to) },
        t: 0
      };
    }
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
    // NO WORDS HERE. This used to throw the lesson's whole cheer across the
    // felt in celebration type — which, now that the cheers are sentences
    // rather than labels, ran off both edges of the screen ("AND YOU ARE
    // STILL ON THE TABL") and said the same thing the band was already
    // saying, twice as loud and half legible. The band has the words; the
    // felt has the fireworks. One voice.
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
    // Nothing is left to aim at. The last preview stayed on the felt through
    // the whole completion state, which is the single loudest way a finished
    // board goes on looking like a live one — dimming the table behind a CTA
    // does not help while a bright cue line is still drawn across it.
    this.player.hideTrajectory?.();
    this.game.aimTags = null;
    this._hideTags();

    // A FINISHED LESSON HAS TO LOOK FINISHED.
    //
    // It used to keep its own instruction on the card and simply grow a Next
    // button underneath, so the board still read as a live table with an extra
    // control on it — the player could not tell whether they had passed, and
    // whether they were meant to shoot again. The card now says the lesson is
    // over, in the lesson's own words of praise, and the table stops taking
    // shots (see Tutorial.awaitingNext, read by the input gate).
    const last = this.index + 1 >= LESSONS.length;
    // The lesson's own words of praise, not a generic one — "one ball moved
    // another" tells the player what they have just learned to do, which
    // "complete" does not.
    this._say(last ? 'You know enough to play' : this.lesson?.cheer || 'Nicely done', 'good');
    this.skipEl.hidden = true;
    // The CTA takes the progress chip's place rather than being added beside
    // it: exactly one control on screen, and it moves forward.
    this.progEl.hidden = true;
    this.nextEl.hidden = false;
    this.nextEl.textContent = last ? 'Start playing \u2192' : 'Next \u2192';
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
    this.progEl.hidden = false;
    this.el.classList.remove('done');
    this._enter(this.index + 1);
  }

  /* ---------------------------------------------------------------- *
   * Card
   * ---------------------------------------------------------------- */

  _render() {
    const lesson = this.lesson;
    if (!lesson) return;
    // The progress chip is where the old card's "Lesson 2 of 6" eyebrow went.
    // It is two numerals because the band's left side is spoken for, and
    // because a player two boards in wants to know how many are left, not to
    // read the phrase again.
    this.progEl.textContent = `${this.index + 1} / ${LESSONS.length}`;
    this._say(lesson.say, null);
    this.el.classList.add('show');
  }

  /**
   * Write the band. One entry point for all four states, because the states
   * differ only in the sentence and the colour — nothing appears, nothing
   * disappears, and nothing moves.
   *
   * innerHTML, deliberately: lesson copy carries <em>/<b> so the one word that
   * matters is coloured. Nothing here is player-supplied — every string is a
   * constant in RULES above — so there is nothing to escape.
   */
  _say(html, tone) {
    this.lineEl.innerHTML = html || '';
    this.el.classList.remove('good', 'bad');
    if (tone) this.el.classList.add(tone);
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
    if (!text) {
      // Empty is not blank — it is the board's own instruction, back. A band
      // with nothing in it would read as the lesson having ended.
      this._say(this._nudging && this.lesson?.nudge ? this.lesson.nudge : this.lesson?.say, null);
      return;
    }
    this._say(text, tone);
  }

  dispose() {
    this.el.remove();
    this.spotEl.remove();
    this.ringEl.remove();
    this.handEl.remove();
    this.trackEl.remove();
    this.skipEl.remove();
    this.tagEl.remove();
  }
}

export default Tutorial;
