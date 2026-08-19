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
 *   UNFAILABLE      nothing in a lesson room can be damaged by the player. The
 *                   director is the only thing that kills, and it only kills on
 *                   a rep that satisfies the lesson. Contact damage is off. So
 *                   "hit two at once" cannot decay into "one left, now what",
 *                   and a wrong shot costs a re-rack, never the lesson.
 *
 *   BUILDS UP       lesson N assumes N-1. The bank lesson reuses the split from
 *                   the chain lesson and adds one rule on top: the rail comes
 *                   first. Hits without a rail are called out, not silently
 *                   ignored, and there is a visible counter so "how much longer"
 *                   always has an answer.
 *
 *   ALWAYS ON       the card stays up for the whole lesson. Only the status line
 *                   under it changes, so feedback never costs you the instruction.
 */

import { PLAYER_STATE } from '../entities/Player.js';

const KEY = 'billiard-tutorial-done-v1';

/**
 * Two solids (radius 0.62 each) sitting this far either side of the centre line
 * are just touching. A ball fired up the middle wedges between them and splits
 * the pair — the widest capture window two targets can offer, and the most
 * recognisable shot in billiards.
 */
const PAIR = 0.68;

/** Where the racks sit relative to the ball, which spawns at z ≈ 6.4. */
const SOLO_Z = 0.5;
const CHAIN_Z = 0.5;
const BANK_Z = 1.0;
/**
 * The shooter stands off at its own preferred range, so the encounter looks
 * like the ones the player will meet in a real room rather than a special case.
 */
const SHOOTER_Z = -3.2;

/**
 * The bank solution, precomputed.
 *
 * From the spawn at (0, 6.4) the ball runs to the right rail at x = 8.38
 * (the wall inset by its own radius) and returns to x = 0 at z = 1.0, where the
 * rack is. Total lateral travel 16.76 over 5.4 of depth, so the line sits at
 * atan(16.76 / 5.4) = 72.1 degrees off vertical. The cue rests on exactly this
 * heading, so the lesson opens with the whole two-leg path drawn on the table.
 */
const BANK_AIM = { x: 0.9517, z: -0.307 };

/** Straight up the middle — the default the ball starts every room on. */
const UP = { x: 0, z: -1 };

/**
 * Each lesson: what it says, the room it says it in, the heading the cue rests
 * on, and the single rule that decides whether what just happened counts.
 *
 * A rule returns 'score' (that was the thing — take it), 'reject' (that was an
 * attempt at the thing and it was not it — say so), or nothing at all (not
 * related; stay quiet). `hit` judges one strike as it lands; `shot` judges a
 * whole launch once the rep is over, because some lessons are about the shot as
 * a whole rather than any one contact in it.
 *
 * The first three rooms hold perfectly still. A lesson is hard enough to read
 * without the diagram walking away while you study it, and there is nothing to
 * learn from dodging before you can reliably hit. Movement — and the reason you
 * are given a way to stop it — arrives once aiming is solved.
 */
export const LESSONS = [
  {
    id: 'aim',
    say: 'Hit the enemy',
    hint: 'Your thumb is the butt of the cue. Drag back from the orb to aim, and let go to fire.',
    goal: 1,
    aim: UP,
    room: {
      id: 'lesson-aim',
      name: 'First Contact',
      obstacles: [],
      enemies: [{ type: 'solid', x: 0, z: SOLO_Z }]
    },
    // One target, dead ahead of the resting cue. The lesson is over when the
    // player has actually hit something — not when they have dragged far
    // enough, which is what the instruction used to disappear on.
    hit: () => 'score',
    shot: (s) => (s.hits === 0 ? 'reject' : null),
    cheer: 'That is the whole game',
    scold: 'Missed — pull straight back from the orb and let go',
    nudge: 'Put your thumb below the orb and drag straight down. The line points where it will go.'
  },
  {
    id: 'chain',
    say: 'Hit 2 in a row',
    hint: 'Two hits in one shot pays a chain bonus. These two are racked tight and the cue is already lined up — just pull back and let go.',
    goal: 1,
    aim: UP,
    room: {
      id: 'lesson-chain',
      name: 'The Split',
      obstacles: [],
      enemies: [
        { type: 'solid', x: -PAIR, z: CHAIN_Z },
        { type: 'solid', x: PAIR, z: CHAIN_Z }
      ]
    },
    // Scored the instant the second body is struck — waiting for the ball to
    // stop would put the congratulation several seconds after the moment it is
    // congratulating. The miss is judged at the end of the rep instead.
    hit: (h) => (h.index >= 2 ? 'score' : null),
    killsStruck: true,
    shot: (s) => (s.hits > 0 && s.hits < 2 ? 'reject' : null),
    cheer: 'Chain ×1.4',
    scold: 'One at a time does nothing — split them down the middle',
    nudge: 'Keep the line dead straight up the middle. The preview shows it clipping both.'
  },
  {
    id: 'bank',
    say: 'Bank off a wall',
    hint: 'Only hits that come off a rail count. The cue is already on the line — follow it into the side wall and it comes back through them.',
    goal: 2,
    showCount: true,
    aim: BANK_AIM,
    room: {
      id: 'lesson-bank',
      name: 'Off The Rail',
      obstacles: [],
      enemies: [
        { type: 'solid', x: -PAIR, z: BANK_Z },
        { type: 'solid', x: PAIR, z: BANK_Z }
      ]
    },
    // Judged per strike: the rail has to have happened first.
    hit: (h) => (h.banked ? 'score' : 'reject'),
    cheer: 'Off the rail!',
    scold: 'No rail yet — bank it off a side wall first',
    nudge: 'Drag down and to the LEFT, so the cue swings the line up and right into the wall.'
  },
  {
    id: 'freeze',
    say: 'Hold to stop time',
    hint: 'These ones move. Put your thumb down and the table stops dead — take as long as you like to line the shot up.',
    goal: 3,
    showCount: true,
    aim: UP,
    room: {
      id: 'lesson-freeze',
      name: 'Dead Stop',
      obstacles: [],
      // Live, so the freeze has something to be worth doing.
      // Started well up-table so there is a visible approach to stop, rather
      // than three bodies already on top of the ball when the card appears.
      enemies: [
        { type: 'solid', x: -5.0, z: -8.0, frozen: false },
        { type: 'solid', x: 5.0, z: -8.0, frozen: false },
        { type: 'solid', x: 0, z: -12.0, frozen: false }
      ]
    },
    hit: () => 'score',
    shot: (s) => (s.hits === 0 ? 'reject' : null),
    cheer: 'Nice — time is yours',
    scold: 'Miss. Hold your thumb down and look before you fire',
    nudge: 'While your thumb is down nothing on the table moves at all. Line it up properly, then release.'
  },
  {
    id: 'shooter',
    say: 'Kill the shooter',
    hint: 'Violet enemies shoot back. Watch the barrel run out and light up — that is your warning. Hit it before it lands one on you.',
    goal: 1,
    aim: UP,
    room: {
      id: 'lesson-shooter',
      name: 'Return Fire',
      obstacles: [],
      // Pinned so it holds the line it is teaching, but live: it tracks, winds
      // up and fires exactly as one will in a real room.
      enemies: [{ type: 'stripe', x: 0, z: SHOOTER_Z }]
    },
    hit: () => 'score',
    shot: (s) => (s.hits === 0 ? 'reject' : null),
    cheer: 'Down it goes',
    scold: 'Still up — it is winding up again'
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
    /** Actions that arrived while a lesson was taking its bow. */
    this._pending = [];
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
    this.active = true;
    this._outro = false;
    this.game.state = 'playing';
    // The single switch that makes a lesson unfailable: while it is set,
    // nothing in the room can be hurt except by this director.
    this.game.tutorialGuard = () => false;
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
    this._pending.length = 0;
    this.game.tutorialGuard = null;
    this.el.classList.remove('show', 'done');
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

    this._needsRoom = lesson.room.id !== this._roomKey;
    // A new table is racked at once unless a shot is still being judged, in
    // which case the rep that is finishing gets to finish first.
    if (this._needsRoom && !this._launched) this._buildRoom();
  }

  _buildRoom() {
    const lesson = this.lesson;
    if (!lesson) return;
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
    const aim = this.lesson?.aim;
    this.input.setHeading(aim ? aim.x : 0, aim ? aim.z : -1);
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

    // Bullet time is a teaching aid here, not a resource. A beginner lining up
    // their first shot should not be hurried by a bar they have not been told
    // about yet.
    this.player.focus = this.player.focusMax;

    if (this._launched) {
      this._shotTimer -= rawDt;
      const settled = this.player.state === PLAYER_STATE.IDLE && !this.input.isAiming;
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

    // A lesson takes a beat to congratulate you, and a player who drags and
    // releases in one motion would otherwise lose the release inside it — they
    // would meet "Release to shoot" having just released. So the two actions a
    // lesson can be waiting on are held and replayed against the next lesson
    // once it is actually on screen. Hits are not: a stray extra contact must
    // never score against the lesson the player is already leaving.
    if (this._cheerTimer > 0) {
      if (name === 'aiming' || name === 'launch') this._pending.push({ name, payload });
      return;
    }

    if (name === 'aiming') {
      if (lesson.aim && lesson.aim(payload.draw ?? 0)) this._score();
      return;
    }

    if (name === 'launch') {
      this._launched = true;
      this._shotTimer = SHOT_LIMIT;
      this._shotLesson = this.index;
      this._hits = 0;
      this._struck.clear();
      this._rejected = false;
      if (lesson.launch && lesson.launch(payload)) this._score();
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

  /**
   * The rep is over. Judge it against the lesson that launched it — a shot fired
   * under lesson 2 is not evidence about lesson 3 — then put the table back the
   * way the lesson drew it.
   */
  _resolveShot() {
    const lesson = LESSONS[this._shotLesson];
    const stillIts = lesson && this._shotLesson === this.index && this._cheerTimer <= 0;

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
      this.sayEl.textContent = 'Go break some racks';
      this.hintEl.textContent = '';
      this.countEl.hidden = true;
      this._setStatus('', null);
      this._cheerTimer = OUTRO_HOLD;
      return;
    }
    this.el.classList.remove('done');
    this._enter(this.index + 1);
    const queued = this._pending.splice(0, this._pending.length);
    for (const q of queued) this.notify(q.name, q.payload);
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
