/**
 * Tutorial.js — four lessons, each on a table built for that lesson alone.
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

const KEY = 'billiard-tutorial-done-v1';


/** Straight up the middle — the heading every lesson rests on. */
const UP = { x: 0, z: -1 };

/**
 * Each lesson: what it says, the table it says it on, and the single rule that
 * decides whether what just happened counts.
 *
 * A rule returns 'score' (that was the thing — take it), 'reject' (that was an
 * attempt and it was not it — say so), or nothing at all (unrelated; stay
 * quiet). `hit` judges one cue strike as it lands, `carom` judges one ball
 * striking another, `usesGoal` is polled while the table settles, and `shot`
 * judges a whole launch once the rep is over. `rest` is the heading the cue
 * parks on — NOT a rule. It was once called `aim`, which collided with an old
 * draw-distance predicate of the same name: the object got called as a
 * function, threw every frame the player was aiming, and killed the rest of
 * the frame including the render. The table simply stopped updating under
 * their thumb.
 *
 * Every table here is frozen. See docs/TUTORIAL.md — nothing moves until the
 * player shoots, and a lesson contains only what it is teaching.
 */
export const LESSONS = [
  {
    id: 'aim',
    say: 'Aim and shoot at the red ball',
    hint: 'Drag back from the blue ball to aim. Let go to fire.',
    goal: 1,
    rest: UP,
    room: {
      id: 'lesson-aim',
      name: 'First Contact',
      obstacles: [],
      enemies: [{ type: 'solid', x: 0, z: -1.0 }]
    },
    hit: () => 'score',
    shot: (s) => (s.hits === 0 ? 'reject' : null),
    cheer: 'That is the whole game',
    scold: 'Missed — pull straight back from the blue ball and let go',
    nudge: 'Put your thumb below the blue ball and drag straight down. The line shows where it will go.'
  },
  {
    id: 'goal',
    say: 'Hit the red ball into the goal',
    hint: 'Red bar takes red balls. Knock it in — do not go in yourself.',
    goal: 1,
    rest: UP,
    room: {
      id: 'lesson-goal',
      name: 'Into The Goal',
      obstacles: [],
      enemies: [{ type: 'solid', x: 0, z: -2.0, invulnerable: true }],
      // Wide, so a straight shot up the middle is comfortably enough. Set in
      // from the top rail so a ball can come to rest inside it.
      goal: { x: 0, z: -11.0, hw: 5.2, hh: 1.2 }
    },
    // Scored by the zone, not by contact: what matters is where the ball ended
    // up, so nothing is decided until the table stops moving.
    usesGoal: true,
    cheer: 'In the goal',
    scold: 'Not in — line the red ball up with the bar and drive it straight through',
    nudge: 'Hit the red ball dead centre and it carries straight on into the bar.'
  },
  {
    id: 'carom',
    say: 'Hit one ball into the other ball',
    hint: 'A ball you hit becomes a cannonball. Drive the near one into the far one.',
    goal: 1,
    rest: UP,
    room: {
      id: 'lesson-carom',
      name: 'The Cannonball',
      obstacles: [],
      // Both survive contact: the near one has to live long enough to carry on
      // into the far one, and the far one has to be there when it arrives.
      enemies: [
        { type: 'solid', x: 0, z: 1.4, invulnerable: true },
        { type: 'solid', x: 0, z: -3.0, invulnerable: true }
      ]
    },
    // A cue strike on both does not count — the second ball has to be hit by
    // the first, which is the whole idea being taught.
    carom: () => 'score',
    shot: (s) => (s.hits > 0 ? 'reject' : null),
    cheer: 'Carom!',
    scold: 'That was you hitting it — drive the near ball into the far one',
    nudge: 'Hit the near ball square in the back so it carries straight on up the table.'
  },
  {
    id: 'chain2',
    say: 'Hit 2 in a row',
    hint: 'Two hits in one shot pays a bonus. Fire straight through both.',
    goal: 1,
    rest: UP,
    room: {
      id: 'lesson-chain2',
      name: 'The Split',
      obstacles: [],
      // A column, not a split. The cue ball passes through each body it
      // destroys, so "in a row" is literally a row — and it reads as the same
      // shot as the three-ball lesson that follows.
      // Close in. The ball only passes through what it KILLS, and damage falls
      // off with impact speed — racked further up the table a soft shot leaves
      // the first ball on 1hp, bounces off it and the lesson silently becomes
      // unwinnable for anyone not pulling back all the way.
      enemies: [
        { type: 'solid', x: 0, z: 3.2 },
        { type: 'solid', x: 0, z: 0.6 }
      ]
    },
    hit: (h) => (h.index >= 2 ? 'score' : null),
    killsStruck: true,
    shot: (s) => (s.hits > 0 && s.hits < 2 ? 'reject' : null),
    cheer: 'Chain ×1.4',
    scold: 'Only one — keep the line straight and drive through both',
    nudge: 'Fire straight up the middle at full power. The ball carries on through the first.'
  },
  {
    id: 'chain3',
    say: 'Hit 3 in a row',
    hint: 'Longer chains pay more. One shot, all three — you will have to turn a little.',
    goal: 1,
    rest: UP,
    // The graduation lesson. Every rack before this one sits on the cue's
    // resting line, so the whole tutorial can be beaten with five identical
    // straight drags; this one is offset, so the player has to turn the cue
    // once before the game asks them to. It also un-hides the Focus gauge and
    // lets it drain, while they still cannot fail.
    showsFocus: true,
    room: {
      id: 'lesson-chain3',
      name: 'The Run',
      obstacles: [],
      // A column straight up the cue's resting line. The ball passes through
      // each one it destroys, so a single full-power shot runs the whole rack.
      // Kept below the card band even on short screens, where the stage is
      // shorter in absolute pixels but the card is not.
      // Collinear with the spawn along a line 20 degrees off vertical: the ball
      // holds its heading through anything it destroys, so one straight shot
      // down this line takes all three — but the player has to find the line.
      enemies: [
        { type: 'solid', x: 1.54, z: 2.17 },
        { type: 'solid', x: 2.57, z: -0.65 },
        { type: 'solid', x: 3.59, z: -3.47 }
      ]
    },
    hit: (h) => (h.index >= 3 ? 'score' : null),
    killsStruck: true,
    shot: (s) => (s.hits > 0 && s.hits < 3 ? 'reject' : null),
    cheer: 'Chain ×1.8',
    scold: 'Only part of the run — keep it straight and take all three',
    nudge: 'Fire straight up the middle at full power. The line threads all three.'
  }
];

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

/** How long a completed lesson holds its congratulation before moving on. */
const CHEER_HOLD = 1.0;
/** How long the closing card stays up before the real run begins. */
const OUTRO_HOLD = 1.9;
/** How long a status line stays lit. */
const STATUS_HOLD = 2.2;

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

    const el = document.createElement('div');
    el.id = 'coach';
    el.innerHTML =
      '<div class="step"></div><div class="say"></div><div class="hint"></div>' +
      '<div class="count" hidden></div><div class="status"></div>';
    this.el = el;
    this.stepEl = el.querySelector('.step');
    this.sayEl = el.querySelector('.say');
    this.hintEl = el.querySelector('.hint');
    this.countEl = el.querySelector('.count');
    this.statusEl = el.querySelector('.status');
    this.layer.appendChild(el);

    this.active = false;
    this.index = -1;
    this.done = 0;

    this._roomKey = null;
    this._needsRoom = false;
    this._launched = false;
    this._shotTimer = 0;
    this._shotLesson = -1;
    this._hits = 0;
    this._struck = new Set();
    this._rejected = false;
    this._cheerTimer = 0;
    this._statusTimer = 0;
    this._outro = false;
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
    this._outro = false;
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
    this._outro = false;
    this._needsRoom = false;
    this._roomKey = null;
    this.game.tutorialGuard = null;
    this.layer.classList.remove('coaching');
    this.el.classList.remove('show', 'done');
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
    this._hits = 0;
    this._struck.clear();
    this._rejected = false;
    this._cheerTimer = 0;
    this._misses = 0;

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
    this._needsRoom = lesson.room.id !== this._roomKey;
    if (this._needsRoom) this._buildRoom();
    else this._homeBall();
  }

  _buildRoom() {
    const lesson = this.lesson;
    if (!lesson) return;
    this.layer.classList.toggle('coaching', !lesson.showsFocus);
    this._needsRoom = false;
    this._roomKey = lesson.room.id;
    // A lesson card is the only thing that should be talking. The boot run
    // raises a room banner behind the menu, and it was still fading across the
    // first lesson — two sets of instructions at once, one of them stale.
    this.hud?.hideBanner?.();
    this.rooms.loadScripted(lesson.room);
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

  /* ---------------------------------------------------------------- *
   * Frame
   * ---------------------------------------------------------------- */

  update(rawDt) {
    if (!this.active) return;

    if (this._statusTimer > 0) {
      this._statusTimer -= rawDt;
      if (this._statusTimer <= 0) this.statusEl.classList.remove('show');
    }

    if (this._outro) {
      this._cheerTimer -= rawDt;
      if (this._cheerTimer <= 0) this._finish();
      return;
    }

    // Bullet time is a teaching aid, not a resource — right up until the last
    // lesson, which lets the gauge drain for real. Otherwise the player leaves
    // the tutorial having never seen the meter that limits how long they can
    // think, and meets it for the first time while something is hitting them.
    if (this.lesson?.showsFocus) this.layer.classList.remove('coaching');
    else this.player.focus = this.player.focusMax;

    // The goal lesson is decided by where a ball came to rest, so it is polled
    // rather than driven by an event.
    if (this._launched && this.lesson?.usesGoal && this._cheerTimer <= 0) this._checkGoal();

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

    if (this._cheerTimer > 0) {
      this._cheerTimer -= rawDt;
      if (this._cheerTimer <= 0) this._advance();
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
    if (!lesson || this._outro) return;

    // Nothing that happens during the congratulation counts. Actions used to be
    // queued here and replayed against the NEXT lesson, which meant a single tap
    // during the beat arrived as a phantom failed attempt on a lesson the player
    // had not seen yet — and counted toward the two-miss hint escalation.
    if (this._cheerTimer > 0) return;

    if (name === 'launch') {
      this._launched = true;
      this._shotTimer = SHOT_LIMIT;
      this._shotLesson = this.index;
      this._hits = 0;
      this._struck.clear();
      this._rejected = false;
      return;
    }

    if (name === 'carom') {
      if (!lesson.carom) return;
      const verdict = lesson.carom(payload);
      if (verdict === 'score') this._score(this.rooms.scriptedEnemies.filter((e) => e.alive));
      else if (verdict === 'reject') this._rejected = true;
      return;
    }

    if (name === 'hit') {
      this._hits += 1;
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
    const stillIts = lesson && this._shotLesson === this.index && this._cheerTimer <= 0;

    if (stillIts && lesson.usesGoal && this.done < lesson.goal) this._rejected = true;

    if (stillIts && lesson.shot) {
      const verdict = lesson.shot({ hits: this._hits });
      if (verdict === 'score') {
        this._score(lesson.killsStruck ? [...this._struck] : []);
      } else if (verdict === 'reject') {
        this._rejected = true;
      }
    }

    if (stillIts && this._rejected) {
      this._setStatus(lesson.scold || 'Not quite — go again', 'bad');
      this._misses += 1;
      // Nothing here can be failed, but something you cannot fail and cannot
      // do either is just a wall. After a couple of honest attempts the hint
      // stops being evocative and starts being the actual instruction.
      if (this._misses >= 2 && lesson.nudge) {
        this.hintEl.textContent = lesson.nudge;
      }
    }
    this._rejected = false;

    this._homeBall();
    this._reRack();
    if (this._needsRoom) this._buildRoom();
  }

  /** Clear the table with some ceremony. */
  _detonate(primary = []) {
    const at = primary.find((e) => e) || this.rooms.scriptedEnemies.find((e) => e);
    for (const enemy of this.rooms.scriptedEnemies) {
      if (enemy.alive) this.game.forceKill(enemy);
    }
    if (!at) return;
    this.fx.shockwave(at.x, at.z, 0xff3d6e, 9, 0.5);
    this.fx.shockwave(at.x, at.z, 0xfff6d8, 5, 0.34);
    this.fx.burst(at.x, at.z, 34, 0xff3d6e, 17, 1.5);
    this.fx.burst(at.x, at.z, 18, 0xfff6d8, 22, 1.0);
    this.engine?.shake?.(16);
    this.engine?.zoomPunch?.();
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
    this.done += 1;

    for (const enemy of kills) {
      if (enemy && enemy.alive) this.game.forceKill(enemy);
    }

    this._setStatus(lesson.cheer || 'Yes', 'good');

    if (this.done >= lesson.goal) {
      // Finishing a lesson should feel like finishing something. Everything
      // still standing on the table goes up with it, so the reset that follows
      // reads as a reward rather than as the room being taken away.
      this._detonate(kills);
      this._render();
      this.el.classList.add('done');
      this._cheerTimer = CHEER_HOLD;
      return;
    }

    this._render();
  }

  _advance() {
    if (this.index + 1 >= LESSONS.length) {
      this._outro = true;
      this.el.classList.add('done');
      this.stepEl.textContent = 'Tutorial complete';
      this.sayEl.textContent = 'These ones move — and they hit back';
      this.hintEl.textContent = '';
      this.countEl.hidden = true;
      this._setStatus('', null);
      this._cheerTimer = OUTRO_HOLD;
      return;
    }
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
    this.sayEl.textContent = lesson.say;
    this.hintEl.textContent = lesson.hint;

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

  _setStatus(text, tone) {
    this.statusEl.textContent = text;
    this.statusEl.classList.remove('good', 'bad');
    if (!text) {
      this.statusEl.classList.remove('show');
      this._statusTimer = 0;
      return;
    }
    if (tone) this.statusEl.classList.add(tone);
    this.statusEl.classList.add('show');
    this._statusTimer = STATUS_HOLD;
  }

  dispose() {
    this.el.remove();
  }
}

export default Tutorial;
