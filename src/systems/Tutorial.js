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
import { CSS_PALETTE, POCKET_NAME } from '../config.js';

// BUMPED WITH THE CURRICULUM, DELIBERATELY.
//
// This flag means "has seen the tutorial", and the tutorial it referred to no
// longer exists — nine lessons about a real-time table became six about a
// still one. Everybody who has played the live site is carrying the v1 flag,
// so leaving the key alone would ship the new tutorial to new players only and
// hide it from precisely the people who have been playing. A new curriculum
// gets a new key.
const KEY = 'billiard-tutorial-done-v2';

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
 * `route` is what the coaching road is drawn for: `{number, slot}` names a ball
 * and the pocket it has to reach, `{reach}` names a ball that only has to be
 * hit. It is the goal the board's SENTENCE describes, stated once so the words
 * and the road drawn on the felt cannot come from two different ideas of the
 * shot. (Not `goal` — LESSONS already uses that for the number of reps a board
 * takes, and a second meaning on the same key silently won.)
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
    say: '<em>Pull back</em>, then hit the <b>3</b> into the side pocket',
    spot: 'first',
    hand: true,
    handDraw: 6.4,
    pot: () => 'score',
    route: { number: 3, slot: 'mr' },
    facing: 'Wrong way — your ball fires AWAY from your thumb. Drag from below it instead',
    cheer: 'In, and you are still on the table',
    whiff: 'You missed the 3 completely — put your line through the middle of the ball',
    scold: 'You hit the <b>3</b>, but it missed the pocket. Line your ball up behind it, straight at the lit pocket',
    nudge: 'Line your ball up with the <b>3</b> and the lit pocket, then pull back from below it.'
  },

  /* ================================================================== *
   * ACT II — TWO BALLS. The object ball becomes your cue.
   * ================================================================== */

  combo: {
    say: 'Hit the <b>4</b>, so it knocks the <b>1</b> into the side pocket',
    spot: 'rack',
    pot: (p) => (p.ball.number === 1 ? 'score' : null),
    route: { number: 1, slot: 'mr' },
    cheer: 'One ball moved another. That is a combination',
    scold: 'You pocketed the <b>4</b>, not the <b>1</b>. Aim through the 4 so it knocks the 1 in instead',
    whiff: 'You missed the 4 completely — aim through it, at the 1 behind it',
    nudge: 'Aim <em>through</em> the <b>4</b> at the <b>1</b>. Those two already point at the lit pocket.'
  },

  // THE PLANT. Two balls in a row, the second parked on a pocket, and the shot
  // is not finished until that second one goes in.
  //
  // It used to be judged on the HAND-OFF — the 4 merely reaching the 2 — while
  // its card named a corner and its felt lit one. A player who bounced the 2
  // off two walls and never came near the pocket was told they had done it,
  // and said so. The board was rebuilt rather than reworded: a lesson whose
  // success is "you touched it" sits inside a tutorial where every other
  // success is a ball going down, and no wording fixes that.
  //
  // Requiring the pot was rejected once on a search of twenty layouts that
  // found nothing wider than two degrees. Twenty layouts is not a search. A
  // real one (tools/find-board.mjs, 320 placements) confirmed the verdict for
  // combinations played the LONG way — a pot's tolerance falls off as one over
  // the distance the object ball travels, and every one of those layouts had
  // the second ball far from a pocket — and then found six degrees, three
  // times the playable floor, the moment the second ball was parked a ball's
  // width off the mouth. That is the board now, and the pot is required.
  'cut-combo': {
    say: 'The <b>2</b> is sitting on the side pocket. Send the <b>4</b> into it',
    spot: 'rack',
    // A pot of the 2 ONLY off the 4 — a direct hit on the 2 is a different
    // shot and not the one being taught.
    pot: (p) => (p.ball.number === 2 ? 'score' : null),
    needsPass: true,
    // viaBall, because needsPass: a road that pots the 2 with the cue itself
    // is a road to a stroke this board rejects.
    route: { number: 2, slot: 'mr', viaBall: true },
    cheer: 'In — and you never touched the 2 yourself',
    scold: 'The <b>2</b> has to be knocked in by the <b>4</b>, not by your own ball. Start the shot on the 4',
    whiff: 'You missed the 4 completely — the shot has to start on that ball',
    nudge: 'Line your ball up with the <b>4</b> and the <b>2</b> behind it, then follow the road on the felt.'
  },

  /* ================================================================== *
   * ACT III — THE TABLE. Cushions, budget, and the felt.
   * ================================================================== */

  // AND IT DOES NOT LIGHT A POCKET EITHER. Judged on reaching the 3 off a
  // wall, which is the lesson; it was lighting the far corner all the same.
  // The same false promise as the angled combination, found by the check
  // written for that one — which is the point of writing the check.
  bank: {
    say: 'A barrier blocks the <b>3</b>. <em>Bounce</em> off the bottom wall to reach it',
    spot: 'first',
    bankThenHit: true,
    // viaRail, because bankThenHit: a road straight at the 3 is a road to a
    // stroke this board rejects.
    route: { reach: 3, viaRail: true },
    cheer: 'Off the wall and onto the 3 — and a bounce is worth more',
    scold: 'The barrier stopped your ball. Shoot down into the bottom wall instead, and bounce around it',
    whiff: 'You did not reach the <b>3</b>. Aim down into the bottom wall, and bounce around the barrier',
    nudge: 'Aim <em>down</em> into the bottom wall. The dashed line swings back up to the <b>3</b>.'
  },

  // TWO BALLS IN ONE STROKE — and the search that said it was impossible was
  // measuring with two thumbs.
  //
  // Asked for three times. Answered twice with "there is no such shot here",
  // on eight families and about 1,800 placements: both balls pushed by one
  // impulse, one cut off the other into a second pocket, both into the same
  // pocket, the far ball hanging in the jaws, the cue potting one and carrying
  // on into another. Nothing measured wider than two degrees, the floor
  // `npm run verify` calls unplayable.
  //
  // THE SEARCH WAS SWEEPING TWO POWERS. Every heading was tried at 0.6 and
  // 0.85 and the widest run of headings that worked at ONE OF THOSE TWO was
  // called the window — which is the window for a player who only ever hits
  // the ball two ways. Re-ranked and re-measured across the range a thumb
  // actually produces, the family the request described comes back at FOUR AND
  // A HALF DEGREES — 310.5° to 315° — which is where every other board on this
  // tutorial lives.
  //
  // (The same mistake in the other axis cost a round earlier: a sweep at two
  // degrees cannot measure a window finer than two degrees. find-board ranks
  // coarsely on two powers and re-measures its leaders at half a degree across
  // five; `npm run verify` sweeps six.)
  //
  // THE STORED HEADING HAS TO SATISFY TWO INSTRUMENTS, and they disagree.
  //
  // The window is an area in heading AND power, and the middle of the heading
  // run is not the middle of that area: measured through the real physics,
  // 311° works at nine powers out of eleven and the middle of the run works at
  // two. But the road is drawn from the PREDICTOR, which models one contact at
  // a time, and its version of this shot sits about three degrees away — it
  // cannot draw 311° at all, and the heading its own sweep picks works at one
  // power in eleven.
  //
  // So the stored heading is the most forgiving one both agree on: 314.5°,
  // seven powers out of eleven, and a road the felt can actually draw. The
  // resting aim, the road and the demonstration after a miss are then one
  // line rather than three.
  //
  // THE TWO BALLS SIT CLOSE TOGETHER BECAUSE THE SHOT NEEDS THEM TO. Asked
  // whether they have to — a pair that nearly touches is hard to read — and
  // measured across the gap: a ball's width apart is 4.5°, 1.7 apart is 2°,
  // 2.2 apart is 1.5°. The near ball travels further before contact as they
  // separate, so the same aim error opens into a bigger miss where it matters.
  // Putting the pair on a corner instead, where the chain is oblique from the
  // spawn rather than end-on, does not buy the picture anything either: every
  // leader in that search is still this family.
  //
  // The board is the shape that was asked for: the cue clips the 1, the 1
  // sends the 4 into the side pocket, and the 1 carries on into the corner.
  // Two pockets, one stroke, and the cue rests pointing at it with the road
  // drawn on the felt — the lesson is that the opportunity is there to be
  // seen, not that a 3.5° line is easy to find unaided.
  'two-in-one': {
    say: 'One stroke, two balls: clip the <b>4</b> in with the <b>1</b>, and the 1 runs on',
    spot: 'rack',
    // Both, in the same stroke. Counting reps would pass a player who potted
    // one, re-racked, and potted the other — two strokes doing one thing each,
    // which is the opposite of the lesson.
    strokePots: 2,
    // DRAWN ALONG THE HEADING THE CUE RESTS ON. The sweep's own pick is a
    // degree or two off it and works too, but then the road and the resting
    // aim are two different lines for one shot, and the player is left to
    // wonder which of them is the answer. One line: the measured one.
    route: { fromSolve: true, number: 4, slot: 'ml' },
    cheer: 'Two balls, one stroke. That is what to look for',
    scold: 'Only one went down. Aim so the <b>1</b> clips the <b>4</b> thinly — it has to keep rolling afterwards',
    whiff: 'You missed the <b>1</b> completely — aim at the near ball, not past it',
    nudge: 'Follow the road: through the edge of the <b>1</b>, so it puts the <b>4</b> in and carries on.'
  },

  // THE RED SITS ON THE LAZY LINE — AND NOW THE BOARD MEANS IT.
  //
  // Three things were wrong with this one, and the first was the only one
  // anybody could see: "it's not possible to complete the needed shot without
  // also passing through the mine".
  //
  // 1. THE MINE WAS NOT A VERDICT. Rolling over it cost some health and
  //    nothing else, so a stroke that went straight across the red still
  //    passed a board whose card says "not the red". `rejectsMine` is the
  //    board checking what it claims, like the lit pockets before it.
  //
  // 2. THE MINE WAS SPENT AFTER ONE MISTAKE. A hazard is consumed when it goes
  //    off and stays consumed for the rest of a RUN, which is the run's rule.
  //    A lesson is not a run: from the second attempt onwards this board had
  //    no red on it at all. The felt re-arms with the rack now.
  //
  // 3. THE SHOT THE CARD DESCRIBED DID NOT EXIST. Measured with the mine
  //    actually on the line to the ball — which, once (2) was fixed, is the
  //    only table the search ever sees — a direct pot is not narrow, it is
  //    GONE: the pad is a unit and a bit across at four units' range, so it
  //    covers about sixteen degrees of heading either side and the window for
  //    potting the 2 is four. There is no thread past a mine that is really on
  //    the line. The board that shipped only had one because its mine was not.
  //
  // So the shot is a rail, as asked for. Three shapes were measured over the
  // whole table (24 placements of ball and mine, every heading at two powers,
  // leaders re-measured at half a degree):
  //
  //   direct pot, mine on the line ............ 0.5°
  //   banked pot, the cue potting the 2 ....... 2°    (the floor: unplayable)
  //   banked into the 5, the 5 potting the 2 .. 4°
  //
  // The two balls sit a ball's width apart for the same reason the two-in-one
  // board's do, and it was measured the same way: 0.9 apart is 3.5°, 1.3 is
  // 1.5°, and anything wider is under a degree. The 5 has to reach the 2 after
  // a rail, and every unit of daylight between them is another unit for the
  // error in that bank to grow across.
  //
  // The last one is the board. It is also the right shape for the last lesson:
  // the rail from lesson four, the hand-off from lesson three, and the choice
  // between the two pads, in one stroke.
  'green-red': {
    say: 'Off the left wall and through the <em>green</em> — the <b>5</b> puts the <b>2</b> in',
    spot: 'rack',
    needsGreen: true,
    // The 2, off the 5, having collected the green and missed the red.
    pot: (p) => (p.ball.number !== 2 ? null : p.tookGreen ? 'score' : 'reject'),
    needsPass: true,
    rejectsMine: true,
    // DRAWN ALONG THE BOARD'S OWN MEASURED HEADING, trimmed at the 2. The
    // predictor models one contact at a time and stops at the distance a ball
    // can carry, so asked to search for a heading that pots the 2 off a rail
    // and a hand-off it finds none — see roadAlong in main.js.
    route: { fromSolve: true, reach: 5, viaRail: true },
    cheer: 'Off the wall, past the red, and in',
    scold: 'The <b>2</b> goes in off the <b>5</b>. Come off the left wall, and take the <em>green</em> on the way',
    mined: 'You went over the red. Aim <em>away</em> from the balls — left, into the wall',
    whiff: 'You reached nothing. Aim <em>left</em> into the wall and let it bring you back',
    nudge: 'Aim <em>left</em> into the wall. The road on the felt shows where it brings you back.'
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

    // The strip is measured, not assumed, so it has to be re-measured whenever
    // the thing it is measured against changes size.
    this._onResize = () => this._layoutCoach(true);
    window.addEventListener('resize', this._onResize);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', this._onResize);

    // The board list, reachable from the page. tools/ asks the game what its
    // boards claim rather than re-reading the data file and re-deriving it —
    // a checker with its own copy of the rules eventually checks the wrong ones.
    this.boards = LESSONS;

    this.active = false;
    this.index = -1;
    this.done = 0;
    /** Strokes spent on the current board — the budget the third lesson counts. */
    this._strokes = 0;
    /** The table as it stood the instant the current stroke was fired. */
    this._before = null;
    /** The lowest screen y the coaching strip occupies, and what it cost. */
    this._bandFloor = 0;
    this._reserve = 0;
    /** Did the stroke that just resolved use up a multi-shot board's budget? */
    this._restart = false;
    /** Balls this stroke put down, in the order they dropped. */
    this._potted = [];
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
    this._tookMine = false;
    this._struck = new Set();
    /** Cue contacts this launch, in order, with whether each one killed. */
    this._strikes = [];
    this._rejected = false;
    /** Did the stroke that just resolved put the cue ball down a pocket? */
    this._scratched = false;
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
    // TAKE THE STRIP BEFORE THE FIRST BOARD IS DRAWN, not after. Animating the
    // table down into place on lesson one would open the tutorial with the
    // felt moving under a sentence the player is still reading.
    this._layoutCoach(true);
    // The menu hands over mid-attract-shot, so nothing about the previous ball
    // is carried in: the first lesson racks its own table immediately.
    // (The route is solved once the board's table exists — see _buildRoom.)
    this._launched = false;
    this.hud?.hideBanner?.();
    this._enter(0);
  }

  stop() {
    this.active = false;
    this.index = -1;
    // AND GIVE THE TABLE BACK, over half a second. This is the moment the
    // tutorial hands the game over; the felt growing out to fill the screen is
    // the curtain going up, and a jump cut here reads as a glitch.
    this.setBandReserve?.(0);
    this.drawCoachRoute?.(null);
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
    this._before = null;
    this._restart = false;
    this._potted.length = 0;
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
    this._planned = undefined;
    // NOT re-solved here. Every board in the tutorial is the same table with a
    // different rack on it, so the strip is the same strip — and re-solving it
    // per board meant the felt shifted under the player between lessons. It is
    // solved once, when the tutorial starts, and on a real viewport change.
    this._showRoute();
  }

  /**
   * DRAW THE ANSWER, AND LEAVE IT ON THE FELT.
   *
   * The band names a ball and a pocket; the player still has to find the LINE.
   * On the four-in-three board they have to find three of them, in order,
   * before the first stroke, and no sentence carries that — reported as "I
   * still have no idea how to complete this lesson in the required number of
   * shots". So the route is drawn: faint and dashed, up the whole time, under
   * whatever the player is aiming.
   *
   * It is solved from where the cue is NOW (main.js solveCoachRoute), which is
   * the only version that survives a board played over several strokes: after
   * the first one the cue is wherever the player left it, and an authored line
   * would be describing a table that no longer exists.
   *
   * The ball it solves for is the one the band is talking about, so the words
   * and the line are the same advice. A board with no route to find — nothing
   * left, or nothing reachable — simply has no line, rather than a wrong one.
   */
  _showRoute() {
    if (!this.solveCoachRoute || !this.drawCoachRoute) return;
    if (!this.active || this._awaitingNext) {
      this.drawCoachRoute(null);
      return;
    }
    this.drawCoachRoute(this.roadNow());
  }

  /**
   * THE ROAD THIS BOARD WOULD DRAW RIGHT NOW.
   *
   * One function, because there were two and a check was reading the wrong
   * one: it asked the sweep directly and reported a heading the felt was not
   * showing, which is the same class of mistake as a check that asks the
   * solver whether a road exists while the player sees nothing.
   *
   * A BOARD MAY NAME ITS OWN LINE. Only where the shot is one the predictor
   * cannot see to the end of — a rail into a hand-off — and only because
   * `solve` is measured through the real physics rather than guessed. The
   * search is still the default, because it is the only thing that can answer
   * for a table the player has already changed.
   */
  roadNow() {
    if (!this.solveCoachRoute) return null;
    // THE BOARD'S OWN LINE COMES FIRST, while the board is as it was authored.
    //
    // `solve` is measured through the real physics against the board's OWN
    // RULE — `npm run verify` plays it and asks the board whether it passed.
    // The sweep cannot make that statement: it works from projections and it
    // only knows the goal it was handed, so on the plant board it found a line
    // that pots the 2 directly and drew that, on a board whose entire subject
    // is that the 2 has to be knocked in by the 4. Reported as "if I have to
    // hit the 2 with the 4, why is the coach line telling me to shoot the cue
    // into the wall and hit the 4 directly".
    //
    // The moment the player has changed the table the stored line describes a
    // table that no longer exists, and the sweep — which solves from where the
    // cue IS — is the only thing that can answer. That is the split.
    if (this._authored() && Number.isFinite(this.lesson?.solve)) {
      const stored = this.roadAlong?.(this.lesson.solve, this.lesson.route ?? {});
      if (stored) return stored;
    }
    // A rack-clearing board has already searched, to find out what it was
    // allowed to SAY; the road is that same search's answer rather than a
    // second one that could disagree with it. It is asked FIRST, because such
    // a board names no `route` of its own — there is no fixed goal on a table
    // the player is emptying.
    if (this.lesson?.clearRack) return this._guideNext()?.bands ?? null;
    const want = this.lesson?.route;
    if (!want) return null;
    if (want.fromSolve) return this.roadAlong?.(this.lesson.solve, want) ?? this.solveCoachRoute(want);
    return this.solveCoachRoute(want);
  }

  /**
   * PUT THE COACH ABOVE THE TABLE, AND BUY THE ROOM FOR IT.
   *
   * The band used to be pinned to the one strip of felt a board cannot place
   * anything in — below the far corner pockets, above the rack. That strip is
   * real, and it is still where the band goes when no lesson is running. But
   * "a board cannot place a ball there" is not "a ball cannot END there": a
   * ball rolled up under the band is a ball the player cannot see, and it was
   * reported exactly that way.
   *
   * So a lesson buys the space. Skip and the band stack at the very top of the
   * screen, the strip they occupy is measured rather than guessed at, and the
   * table is told to shrink out of it (main.js setBandReserve). Nothing is
   * behind the words, so nothing can hide behind them.
   *
   * @param {boolean} [now] take the room immediately instead of easing into it
   */
  _layoutCoach(now = false) {
    if (!this.active) return;
    // Skip's own top comes from --hud-pad; the band goes under whatever height
    // that button turns out to be at this size, and both are read back rather
    // than recomputed here so the CSS stays the one place they are described.
    // RELATIVE TO THE LAYER, NOT TO THE VIEWPORT. `--coach-top` is a `top` on
    // an element inside #ui-layer, and the layer is only at the top of the
    // screen when the stage happens to fill it — the frame is letterboxed the
    // rest of the time. Reading the rects raw put the band a stage-offset
    // further down than asked for, which on a 430x860 phone was 48px of empty
    // strip between Skip and the sentence.
    const origin = this.layer.getBoundingClientRect().top;
    const skip = this.skipEl.getBoundingClientRect();
    const skipBottom = skip.height ? skip.bottom - origin : 32;
    this.layer.style.setProperty('--coach-top', `${Math.round(skipBottom + 7)}px`);
    // Measured AFTER the property is written: reading a rect flushes layout,
    // so this is the band where it has just been put, not where it used to be.
    const band = this.el.getBoundingClientRect();
    const bottom = band.height ? band.bottom - origin : skipBottom + 53;
    this._bandFloor = bottom + 2;
    if (!this.setBandReserve) return;
    this._reserve = this._solveReserve(bottom + 9);
    this.setBandReserve(this._reserve, now);
  }

  /**
   * SOLVE THE STRIP ONCE, EXACTLY, AND THEN LEAVE IT ALONE.
   *
   * The reserve is measured against the ARENA, and the arena is not the last
   * thing the table draws: the far rail stands above the pocket centres, so a
   * strip sized to the arena leaves the rail poking into the band. Buying the
   * difference moves the camera, which moves the rail — the correction has to
   * account for its own effect.
   *
   * It used to do that by nudging a pixel at a time, every frame, until the
   * rail cleared. That is a resize per frame, and the table visibly crept down
   * at the start of every board. Reported as the table animating on every step
   * of the tutorial, which is exactly what it was.
   *
   * The relationship is LINEAR — the arena is mapped into the stage by a
   * single scale — so two probes give the line and the line gives the answer.
   * Measure where the table's top lands at two different reserves, take the
   * slope, solve for the reserve that puts it exactly where the band ends.
   * One computation, one resize, and the table then holds still for the whole
   * tutorial.
   *
   * @param {number} floor  the screen y the table must start at or below
   * @returns {number} the reserve to hold
   */
  _solveReserve(floor) {
    const probe = (r) => {
      this.setBandReserve(r, true);
      return this._tableTop();
    };
    const r0 = Math.round(floor);
    const t0 = probe(r0);
    if (t0 == null) return r0;
    const r1 = r0 + 40;
    const t1 = probe(r1);
    if (t1 == null || Math.abs(t1 - t0) < 1e-3) return r0;
    const slope = (t1 - t0) / (r1 - r0);
    const want = r0 + (floor - t0) / slope;
    // A cap, because a stage that is nearly all strip is worse than a rail
    // touching the band, and a bad probe must not be able to ask for one.
    return Math.max(r0, Math.min(Math.round(want), Math.round(this.layer.clientHeight * 0.4)));
  }

  /**
   * The topmost pixel the table draws, in layer coordinates.
   *
   * @returns {number|null}
   */
  _tableTop() {
    const pockets = this.rooms?.table?.pockets;
    const cam = this.engine?.camera;
    const h = this.layer.clientHeight;
    if (!pockets?.length || !cam || !h) return null;
    const visZ = (cam.top - cam.bottom) / cam.zoom;
    let top = Infinity;
    for (const p of pockets) {
      top = Math.min(top, ((p.z - cam.position.z) / visZ + 0.5) * h - (p.radius / visZ) * h);
    }
    return Number.isFinite(top) ? top : null;
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
    if (this._planned !== undefined) return this._planned;
    this._planned = null;
    const rack = this.rooms.scriptedEnemies.filter((e) => e.alive && e.number > 0);
    if (!rack.length || !this.solveCoachRoute) return this._planned;

    // ONLY NAME A SHOT THAT IS THERE.
    //
    // This used to pick the shortest ball-to-pocket run on the table and say
    // it. That is the right ball to WANT and not necessarily a ball you can
    // hit: on the four-in-three board it told a player to pot a ball parked on
    // a pocket while their cue was on the wrong side of it, and every line to
    // it was a scratch. An instruction that cannot be followed is worse than
    // no instruction, because the player spends their strokes believing it.
    //
    // The route solver sweeps every heading once and files each under what it
    // achieves, so asking it for the best AVAILABLE shot costs no more than
    // asking it to confirm one already chosen — and the words and the road
    // then come out of the same search and cannot disagree.
    //
    // NO DOUBLE IS LOOKED FOR, because there is no double to find. Three
    // families of placement, about 550 layouts, every heading at two powers
    // through the real physics (tools/find-board.mjs): the widest window for
    // two balls in one stroke was two degrees anywhere on the table. A knocked
    // ball carries its own drag, so once the first has taken the impulse there
    // is nothing left in the second.
    const bands = this.solveCoachRoute({});
    const plan = bands?.plan;
    if (!plan?.number) return this._planned;

    // Keep the board's own called pockets lit and ADD the guided one. On a
    // board whose whole point is that two pockets are in play, replacing them
    // with a single suggestion throws the plan away to give a hint.
    const board = this.lesson?.call;
    const base = board == null ? [] : Array.isArray(board) ? board : [board];
    this.game.callPocket?.([...new Set([...base, plan.slot].filter(Boolean))]);

    this._planned = {
      bands,
      number: String(plan.number),
      slot: plan.slot,
      pocket: POCKET_NAME[plan.slot] || 'lit pocket'
    };
    return this._planned;
  }

  /**
   * The shot `_guideNext` chose, as a noun phrase.
   *
   * A phrase rather than a sentence, because it is used after three different
   * verbs — "Now hit…", "Try…", "Scratched… Try…" — and one of them read
   * "Try hit the 6 into the side pocket" when this carried its own verb.
   */
  _nextLine(next) {
    return next ? `the <b>${next.number}</b> into the ${next.pocket}` : null;
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
   * THE ONE THING THE PICTURE CANNOT SAY.
   *
   * This used to label every route endpoint — "YOUR BALL", "2 STOPS HERE",
   * "1 → SIDE POCKET". All of them named a place the picture was already
   * showing, in words the eye had to leave the felt to read, and each one then
   * had to be kept clear of every ball and pocket it might cover. The ghosts
   * say all of it better: a hollow copy of the ball, in the ball's colour, at
   * the point its journey commits.
   *
   * SCRATCH survives, because it is not a place. It is a consequence — this
   * shot loses you the cue ball — and no arrangement of shapes on the felt
   * says that. It rides on the ghost that is now drawn INSIDE the pocket the
   * cue ball will drop into, so the word and the warning are in the same place
   * for the first time.
   *
   * Only while aiming: with no thumb down there is no route, and a warning
   * about a shot nobody is taking is noise.
   */
  _updateTags() {
    const cam = this.engine?.camera;
    const tags = this.input.isAiming && !this._awaitingNext ? this.game.aimTags : null;
    // Only entries carrying words get a label. The rest are ghost-only — the
    // intermediate balls of a chain, whose resting place is shown but not
    // narrated (see aimTags in main.js).
    const labelled = tags?.filter((t) => t.text) ?? [];
    if (!labelled.length || !cam || !this.layer.clientWidth) {
      this._hideTags();
      return;
    }

    const w = this.layer.clientWidth;
    const h = this.layer.clientHeight;
    const visX = (cam.right - cam.left) / cam.zoom;
    const visZ = (cam.top - cam.bottom) / cam.zoom;
    const toPx = (x, z) => ({
      x: ((x - cam.position.x) / visX + 0.5) * w,
      y: ((z - cam.position.z) / visZ + 0.5) * h
    });
    // THE CEILING IS THE BAND, NOT THE SCREEN. A route that ends in a far
    // corner pocket puts its label up level with the coaching band, which is
    // opaque and drawn above these — so the label was there, correct, and
    // completely invisible.
    const ceiling = this.el.offsetTop + this.el.offsetHeight + 4;

    // WHAT A LABEL MUST NOT COVER.
    //
    // Everything the player is being asked to look at: every ball on the
    // table, every pocket, and the ghosts marking where the balls are going.
    // A label that lands on the 2 has hidden the subject of its own sentence,
    // which is how this was reported — the ball the lesson names was behind
    // the words naming it.
    const blockers = [];
    for (const ball of this.game.enemies) {
      if (!ball.alive) continue;
      const p = toPx(ball.x, ball.z);
      blockers.push({ ...p, r: (ball.radius / visZ) * h + 3 });
    }
    for (const pocket of this.rooms?.table?.pockets ?? []) {
      const p = toPx(pocket.x, pocket.z);
      blockers.push({ ...p, r: (pocket.radius / visZ) * h + 3 });
    }
    for (const tag of tags) {
      const p = toPx(tag.x, tag.z);
      blockers.push({ ...p, r: ((tag.r ?? 0) / visZ) * h + 3 });
    }
    const cue = toPx(this.player.x, this.player.z);
    blockers.push({ ...cue, r: (this.player.radius / visZ) * h + 3 });

    /** How badly a label box centred here lands on something worth seeing. */
    const cost = (cx, cy, bw, bh) => {
      let worst = 0;
      for (const b of blockers) {
        // Closest point on the box to the blocker's centre.
        const dx = Math.max(Math.abs(b.x - cx) - bw / 2, 0);
        const dy = Math.max(Math.abs(b.y - cy) - bh / 2, 0);
        const gap = Math.hypot(dx, dy) - b.r;
        if (gap < 0) worst += -gap;
      }
      return worst;
    };

    // Eight positions around the point, near ring first then far, so a label
    // sits as close to the thing it names as it can get away with.
    const DIRS = [
      [0, -1], [0, 1], [1, 0], [-1, 0],
      [0.72, -0.72], [-0.72, -0.72], [0.72, 0.72], [-0.72, 0.72]
    ];
    const placed = [];

    for (let i = 0; i < labelled.length; i += 1) {
      let node = this._tagNodes[i];
      if (!node) {
        node = document.createElement('div');
        node.className = 'coach-tag';
        this.tagEl.appendChild(node);
        this._tagNodes[i] = node;
      }
      const tag = labelled[i];
      node.textContent = tag.text;
      node.className = 'coach-tag show bad';

      const at = toPx(tag.x, tag.z);
      const bw = node.offsetWidth;
      const bh = node.offsetHeight;
      const ballPx = ((tag.r ?? 0) / visZ) * h;

      let best = null;
      // Three rings, near first. A wide label beside a corner pocket often has
      // no clean spot on the near ring at all — everything within a ball's
      // reach of a corner is either the pocket, its mouth, or the rail — so
      // there has to be somewhere further out to fall back to before the
      // solve gives up and takes the least-bad overlap.
      for (const reach of [ballPx + bh * 0.62 + 6, ballPx + bh * 1.5 + 12, ballPx + bh * 2.6 + 20]) {
        for (const [ux, uy] of DIRS) {
          // Clamped so a candidate never leaves the felt or hides under the
          // band; the clamp happens BEFORE scoring, so the score is of the
          // position that will actually be used.
          const cx = Math.min(Math.max(at.x + ux * (reach + bw * 0.18), bw / 2 + 4), w - bw / 2 - 4);
          const cy = Math.min(Math.max(at.y + uy * reach, ceiling + bh / 2), h - bh / 2 - 4);
          // Labels already placed this frame are blockers for the next one.
          let c = cost(cx, cy, bw, bh);
          for (const q of placed) {
            if (Math.abs(q.x - cx) < (q.w + bw) / 2 && Math.abs(q.y - cy) < (q.h + bh) / 2) c += 40;
          }
          if (!best || c < best.c) best = { c, cx, cy };
          if (c === 0) break;
        }
        if (best?.c === 0) break;
      }

      placed.push({ x: best.cx, y: best.cy, w: bw, h: bh });
      node.style.transform = 'translate(-50%, -50%)';
      node.style.left = `${best.cx.toFixed(1)}px`;
      node.style.top = `${best.cy.toFixed(1)}px`;
    }
    for (let i = labelled.length; i < this._tagNodes.length; i += 1) {
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
      // THE TABLE AS IT IS RIGHT NOW, before the balls move.
      //
      // A board played over several strokes has to be able to give a stroke
      // back. Taken here rather than at the end of the last one because this
      // is the only moment that is certainly "before the shot" — the player
      // may have rolled the cue, and the previous stroke may have left balls
      // still drifting when its verdict was read.
      this._before = this._snapshot();
      // The plan is about a table that is about to stop existing.
      this._planned = undefined;
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
      this._tookMine = false;
      this._struck.clear();
      this._strikes.length = 0;
      this._rejected = false;
      this._scratched = false;
      this._potted.length = 0;
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
      // Which ball, not just how many. A board that coaches the next shot has
      // to be able to name the one that just went in — "the 4 is down" is a
      // report of what happened; "down" is a noise the player has to decode.
      if (payload.ball) this._potted.push(payload.ball);
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
      // A FLAG, NOT A SENTENCE. The verdict for a stroke is written once, when
      // the table has stopped — and the sentence a scratch deserves depends on
      // what the game does about it, which is decided there: on a board played
      // over several strokes the scratch is undone, and a correction that does
      // not mention that is describing a table the player is not looking at.
      this._scratched = true;
      return;
    }

    // A pick-up or a hazard. Only the green matters to a lesson; hitting the
    // red is its own punishment and the board says so without failing you.
    if (name === 'object') {
      if (payload.object?.good) this._tookGreen = true;
      else this._tookMine = true;
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

    // A POT THAT HAS TO COME OFF ANOTHER BALL. The plant board's pot rule
    // already refuses every ball but the 2; this refuses a 2 the cue hit
    // itself, which is a different shot from the one being taught and an
    // easier one.
    if (stillIts && lesson.needsPass && this._pendingScore && this._passes < 1) {
      this._pendingScore = null;
      this._rejected = true;
    }

    // TWO IN ONE STROKE, and it has to be ONE stroke.
    //
    // Counting reps would pass a player who pocketed one ball, re-racked, and
    // pocketed the other — which is two strokes doing one thing each, and the
    // opposite of what the board teaches. The count is per stroke, taken at
    // the end of it, so the two balls have to have gone down together.
    if (stillIts && lesson.strokePots) {
      counted = true;
      if (this._pots >= lesson.strokePots && !this._scratched) this._score();
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
      } else if (this._rejected) {
        // A SCRATCH IS NOT A RESULT. It used to be scored as one: the stroke
        // that ended in a pocket still banked whatever it had potted on the
        // way, still spent a shot, and still printed "Down. Now hit the …"
        // — which the scratch correction then overwrote a line later. The
        // stroke is about to be given back below, so it says nothing here.
      } else {
        // COACH THE NEXT SHOT, NOT THE SCOREBOARD.
        //
        // This used to read "3 left · 2 shots of your three · go for the 4",
        // which is an inventory. The one board that asks the player to plan
        // ahead is the one board where a running total is the least useful
        // thing to say: what they need is the same kind of sentence the board
        // opened with, again, for the shot in front of them — which ball, and
        // which pocket.
        //
        // EVERY STROKE COSTS ONE, hit or miss, where the board says so.
        // Charging only the pots was right while the board asked for four
        // balls in three strokes, because that arithmetic needed a double and
        // a double turned out to be a two-degree shot wherever the balls were
        // put. With five strokes for four balls there is slack in the budget,
        // and a budget nothing can spend is not a budget.
        this._strokes += lesson.chargesMisses || this._pots > 0 ? 1 : 0;
        const s = lesson.shots - this._strokes;
        const next = this._guideNext();
        const budget = `${s} stroke${s === 1 ? '' : 's'} left`;
        if (s > 0) {
          const did = this._pots > 0 ? `${this._pottedNames()}.` : 'Nothing pocketed.';
          // NOTHING REACHABLE IS A THING TO SAY, not a thing to leave out. The
          // guide only names shots that exist now, so when it has nothing the
          // honest line is that the cue is out of position — which is a real
          // state of a real table and the one the budget is teaching about.
          this._setStatus(
            next
              ? `${did} Now hit ${this._nextLine(next)} — ${budget}`
              : `${did} Nothing on from here — take a stroke to get the cue back in play. ${budget}`,
            this._pots > 0 ? 'good' : 'bad'
          );
        } else {
          // OUT OF STROKES, AND THE BOARD HAD NOTHING TO SAY ABOUT IT. The
          // budget simply ran past zero: the card went on counting down into
          // negative numbers while the player kept shooting at a table that
          // could no longer be cleared. Running out is the one way this board
          // can be got wrong, so it is stated, and the attempt starts again
          // from the beginning rather than from wherever the impossible
          // position happened to leave off.
          this._restart = true;
          this._setStatus(
            `You are out of strokes with ${left === 1 ? 'a ball' : `${left} balls`} still up. ` +
              `Starting over — the whole rack in ${lesson.shots}`,
            'bad'
          );
        }
      }
    }

    // THE RED IS A VERDICT, NOT A BRUISE.
    //
    // Running over the mine cost the player some health and nothing else: the
    // board that says "not the red" passed a stroke that went straight over it
    // as long as the ball dropped. A card making a claim its board does not
    // check is the same failure as a lit pocket nothing looks at — and this
    // one was worse, because the shipped table had no line that took the green
    // WITHOUT the mine, so the only way to pass was to do the thing the card
    // forbids.
    if (stillIts && lesson.rejectsMine && this._tookMine) {
      this._pendingScore = null;
      this._rejected = true;
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

    // Kept, because the table below needs to know how the stroke went and the
    // per-stroke flags are about to be cleared for the next one.
    // Whatever the stroke did, the table is not the one the last plan was made
    // for. Cleared here rather than at each place that moves a ball, so a path
    // added later cannot forget to.
    this._planned = undefined;
    const missed = this._rejected;
    const scratched = this._scratched;
    const tookMine = this._tookMine;
    const wrongWay = this._wrongWay;
    const restart = this._restart;
    this._rejected = false;
    this._wrongWay = false;
    this._scratched = false;
    this._tookMine = false;
    this._restart = false;

    // PUT THE TABLE RIGHT BEFORE SAYING ANYTHING ABOUT IT.
    //
    // The correction below names the ball to play next, and it is chosen off
    // the balls that are standing — so it has to be written against the table
    // the player will be looking at when they read it, not the one the failed
    // stroke left behind.
    //
    // A BOARD THAT IS OVER DOES NOT GET PUT BACK.
    //
    // A reset is preparation for another attempt, and a passed board has no
    // next attempt — so re-racking one is the game tidying the table out from
    // under a player who is still watching what they did. The felt stays
    // exactly as the winning shot left it (see _freeze, which is now the whole
    // of what completing a board does to the table), and the only thing asking
    // for attention is the CTA. The
    // next lesson rebuilds the table when it loads, which is where a rack that
    // does not match the new board was always going to be fixed.
    //
    // A RACK-CLEARING BOARD IS ONE LONG ATTEMPT, NOT A SERIES OF REPS.
    //
    // Every other board resets between attempts, which is right: they are the
    // same shot practised until it lands. This one is a rack being cleared over
    // three strokes, and teleporting the cue ball back to the spawn after each
    // one throws away the position the player just played for — and does it
    // silently, which is exactly how it was reported ("it resets my cue without
    // telling me why"). The cue stays where it stopped, like it would at a
    // table, and only goes home when the attempt itself is over.
    //
    // A FAILED STROKE ON SUCH A BOARD IS GIVEN BACK, NOT CHARGED.
    //
    // It used to be charged twice over. A scratch on the fourth lesson ran the
    // ordinary miss path — cue home, WHOLE RACK REBUILT — so every ball the
    // player had already cleared stood back up, while the strokes they had
    // spent clearing them stayed spent. The attempt was not restarted and it
    // was not continued; it was left in a state the board could not be won
    // from. A stroke that fails now rewinds to the table as it stood when that
    // stroke was fired: the balls that were up are up, where they were, and
    // the cue is back on the spot it was played from.
    const over = this._awaitingNext;
    const multi = !!lesson?.clearRack;
    let homed = !multi;
    if (over) {
      /* nothing moves — see above */
    } else if (multi && restart) {
      this._strokes = 0;
      this._before = null;
      this._homeBall();
      this._reRack();
      homed = true;
    } else if (multi && missed) {
      // The rewind is the whole attempt's memory, so a board with nothing
      // remembered yet (a scratch on the opening stroke of a fresh board)
      // falls back to the ordinary reset, which is the same table anyway.
      if (this._rewind()) {
        homed = this._atSpawn();
      } else {
        this._homeBall();
        this._reRack();
        homed = true;
      }
    } else if (multi) {
      this._restAim();
    } else {
      this._homeBall();
      this._reRack();
    }

    if (missed) {
      // SAY WHAT HAPPENED, THEN SAY WHAT TO DO.
      //
      // A shot that touched nothing is a different mistake from a shot that
      // touched some of it, and saying nothing at all — which is what a whiff
      // used to get — is indistinguishable from the game being broken.
      const line = scratched
        ? this._scratchLine(lesson, multi)
        : wrongWay
          ? lesson.facing
          : tookMine && lesson.mined
            ? lesson.mined
            : this._hits === 0 && lesson.whiff
              ? lesson.whiff
              : lesson.scold || this._restateLine();
      // The multi-shot board has already written the sentence that names the
      // next ball; only a scratch, which is a fact about the cue rather than
      // about the rack, is sharper than what it said.
      if (!multi || scratched) this._setStatus(line, 'bad');
      this._misses += 1;
      // Nothing here can be failed, but something you cannot fail and cannot
      // do either is just a wall. After a couple of honest attempts the
      // evocative sentence gives way to the actual instruction — and it is not
      // shown NEXT TO the correction, it REPLACES the board's line from now
      // on. The band holds one sentence, and the one that earns the space
      // after two misses is the one with the answer in it.
      if (this._misses >= 2 && lesson.nudge) this._nudging = true;
    }

    // SHOW THE FIX, DO NOT ONLY NAME IT.
    //
    // This used to run on a scratch alone, which is the one miss where the
    // mistake is unmissable anyway — the player just watched their own ball
    // disappear. Every OTHER miss is the one where they cannot see what went
    // wrong, because the difference between the line they played and the line
    // that works is two degrees of a thing they cannot replay.
    //
    // So on any miss that left the cue on its spawn, the demonstration runs:
    // hold on the heading that just failed, then swing to a measured solution,
    // on the real cue with the real preview redrawing itself the whole way. It
    // gives way the instant a thumb goes down. A cue that is anywhere else is
    // skipped, because `solve` is a heading measured FROM THE SPAWN and means
    // nothing from a stroke's worth of table away.
    if (missed && !over && homed && Number.isFinite(lesson?.solve) && this._lastAim) {
      const to = (lesson.solve * Math.PI) / 180;
      this._demo = {
        from: this._lastAim,
        to: { x: Math.sin(to), z: -Math.cos(to) },
        t: 0
      };
    }
    if (this._needsRoom) this._buildRoom();
    else this._showRoute();
  }

  /**
   * THE TABLE STOPS WHERE IT IS.
   *
   * Completing a lesson used to blow the rest of the rack up: every ball still
   * standing was force-killed with the same shockwave-and-sparks a pot gets,
   * on the theory that finishing should feel like finishing. From the player's
   * chair it reads as the balls going IN — "it seems we then also randomly
   * make other balls disappear with a flourish, this is confusing because it
   * looks like they also got pocketed". A lesson that teaches what counts as a
   * pot cannot end by faking three of them.
   *
   * So nothing is removed and nothing is thrown. The balls stop where the
   * stroke left them, which is the picture of what the player just did, and
   * the card animates in over the top of it with the way forward. The sound
   * stays: it says "that worked" without drawing a single ball off the felt.
   */
  _freeze() {
    for (const enemy of this.rooms.scriptedEnemies) {
      if (!enemy?.alive) continue;
      enemy.vx = 0;
      enemy.vz = 0;
    }
    this.player.vx = 0;
    this.player.vz = 0;
    // AND THE CAMERA. A pot shakes the camera and punches the zoom, both of
    // which decay over a few hundred milliseconds — fine mid-stroke, wrong the
    // moment everything else stops: the only thing still moving is the frame
    // around a motionless ball, which reads as the ball twitching.
    this.engine?.settle?.();
    this.game.audio?.roomClear?.();
  }

  /**
   * The table as it stands, in enough detail to put it back.
   *
   * Balls are named by their AUTHORED SLOT rather than by their place in the
   * rack, because the rack shortens as it is cleared and a ball's index in it
   * stops meaning anything the moment one goes down.
   *
   * @returns {object|null}
   */
  _snapshot() {
    if (!this.rooms?.scriptedSpec) return null;
    return {
      balls: this.rooms.scriptedEnemies
        .filter((e) => e.alive && Number.isFinite(e.slotIndex))
        .map((e) => ({ index: e.slotIndex, x: e.x, z: e.z })),
      x: this.player.x,
      z: this.player.z,
      done: this.done,
      strokes: this._strokes
    };
  }

  /**
   * Give the last stroke back: the table exactly as it stood when it was fired.
   *
   * Only reachable on a board played over several strokes, and only when that
   * stroke failed. Everything the stroke did is undone together — the balls it
   * put down stand again where they stood, the cue goes back to the spot it
   * was played from, and the budget it spent is unspent. Undoing half of that
   * is what the old path did, and it left a board that could not be won.
   *
   * @returns {boolean} whether there was a stroke to give back
   */
  _rewind() {
    const before = this._before;
    if (!before || !this.rooms.restoreScripted?.(before.balls)) return false;
    this.player.placeAt(before.x, before.z);
    this.player.focus = this.player.focusMax;
    this._restAim();
    this.done = before.done;
    this._strokes = before.strokes;
    // The same small puff `_reRack` uses, for the same reason: a ball that
    // moves on its own is the game doing something, and the player is owed the
    // sight of it happening rather than a table that is quietly different.
    for (const ball of before.balls) this.fx.burst(ball.x, ball.z, 6, 0x8aa0b8, 4, 0.5);
    this._before = null;
    return true;
  }

  /** Is the cue sitting on the board's spawn, where `solve` was measured from? */
  _atSpawn() {
    return Math.hypot(this.player.x, this.player.z - this.spawnZ()) < 0.05;
  }

  /**
   * Is this the table the board was authored as?
   *
   * The cue on its spot, every ball still up and none of them nudged. It is
   * the question "does the board's stored solution still describe this table",
   * and it is the difference between coaching a measured line and coaching a
   * projection.
   */
  _authored() {
    if (!this._atSpawn()) return false;
    const rack = this.rooms.scriptedEnemies;
    const spec = this.rooms.scriptedSpec?.enemies ?? [];
    if (rack.filter((e) => e.alive).length !== spec.length) return false;
    return rack.every(
      (e) => !e.alive || Math.hypot(e.x - e.homeX, e.z - e.homeZ) < 0.05
    );
  }

  /**
   * What the stroke put away, by name.
   *
   * ONE WORD FOR ONE EVENT, AND IT IS THE WORD ON THE TABLE. "Down" is the
   * game talking to itself — a word that assumes the player already knows
   * which ball it means — and "potted" is a second name for the same thing,
   * which is worse than the first: a lesson that calls one event two things
   * has taught the player a synonym instead of a game. The table has pockets,
   * so a ball that goes in one is POCKETED, everywhere, always.
   *
   * Naming the ball as well costs two characters and reports the actual event.
   */
  _pottedNames() {
    const names = this._potted.map((b) => b?.number).filter(Boolean);
    if (names.length === 1) return `The <b>${names[0]}</b> is pocketed`;
    if (names.length > 1) return `${names.length} balls pocketed`;
    return 'Pocketed';
  }

  /**
   * What just happened, and what to do about it.
   *
   * A scratch is the one mistake that is always a mistake, so it is always
   * called by its name. It is NOT also narrated: the table has already put
   * itself back by the time this is read, and a sentence that says so spends
   * one of its two lines describing what the player can see. The band has room
   * for what happened and what to do next, and nothing else.
   */
  _scratchLine(lesson, multi) {
    if (lesson.scratched) return lesson.scratched;
    const opener = 'Scratched — your own ball went in the pocket';
    const next = multi ? this._guideNext() : null;
    return next
      ? `${opener}. Try ${this._nextLine(next)}, but hit it off-centre`
      : `${opener}. Hit the target ball off to one side, and yours rolls clear instead`;
  }

  /**
   * The last-resort correction: a stroke that matched no rule and that the
   * board has no words of its own for.
   *
   * It used to be "Not quite — go again", which reports nothing that happened
   * and asks for the same shot with no idea what to change. Every board that
   * can reach this now carries a `scold` that names the miss, so this is the
   * floor rather than the common case — and even the floor says which way to
   * look.
   */
  _restateLine() {
    return 'That one did not go in — line your ball up with the lit pocket and try again';
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
    // AND THE FELT, not only the rack. A mine is spent when it goes off and
    // stays spent for the rest of a run, which is the run's rule and a fair
    // one. A lesson is not a run: it is one table presented until the player
    // gets it right. Leaving the mine spent meant the board that teaches "not
    // the red" had no red on it from the second attempt onwards.
    this.rooms.table.rearmBoard?.();
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
      this._freeze();
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
    // A finished board has no next shot, so it has no route to show.
    this.drawCoachRoute?.(null);

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
    // A BALL NAMED IN THE SENTENCE IS INKED IN THAT BALL'S OWN COLOUR.
    //
    // Every solid now has its own hue on the felt, so "hit the 4, so it knocks
    // the 1" can point with colour instead of asking the player to read two
    // small numerals and match them. `<b>4</b>` picks up the 4's yellow; a
    // <b> holding anything that is not a ball number keeps the rack amber.
    this.lineEl.innerHTML = (html || '').replace(
      /<b>(\d+)<\/b>/g,
      (whole, n) => {
        const ink = CSS_PALETTE.ballInk?.[n];
        return ink ? `<b style="color:${ink}">${n}</b>` : whole;
      }
    );
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
    window.removeEventListener('resize', this._onResize);
    window.visualViewport?.removeEventListener('resize', this._onResize);
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
