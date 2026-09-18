/**
 * tool/measure.js — the editor's instrument.
 *
 * The editor places balls. This measures what placing them there did, and it
 * does so by ASKING THE GAME: it boots the real game in a frame beside the
 * canvas, pushes the board being edited into the live tutorial, and drives the
 * same probes `npm run verify` and `npm run aim` drive from the command line.
 *
 * WHY A FRAME AND NOT A SOLVER IN HERE
 *
 * A window is a fact about the physics — where the cue ball goes, how the
 * cushions answer, which contacts the table resolves in what order. An editor
 * with its own copy of that would be a second implementation of the only thing
 * this game is really made of, and the first time the two disagreed the editor
 * would be the one that looked authoritative. So there is no physics in this
 * file. There is a frame with the game in it, the harness the checks already
 * use, and the arithmetic needed to put a number on the screen.
 *
 * The one cost is that a sweep is real work — a few hundred headings at six
 * powers, each played to a standstill — so it is asked for an arc at a time
 * with a frame yielded between, which is what keeps the editor drawing while
 * the measurement runs.
 */

import harnessSource from '../tools/harness.js?raw';

/** Cleared before boot, because a measured board needs the tutorial running. */
const TUTORIAL_KEY = 'billiard-tutorial-done-v2';

/**
 * The same six the sweep uses everywhere else. A thumb produces a continuum;
 * three powers reports the window for a player who only hits the ball three
 * ways. See the note in harness.js.
 */
export const POWERS = [0.45, 0.55, 0.65, 0.75, 0.85, 1.0];

/** How much of the circle one call sweeps before the editor gets a frame back. */
const SLICE = 30;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
const clone = (v) => JSON.parse(JSON.stringify(v));

let host = null;
let frame = null;

/** The heading a rest vector points along, in the degrees every probe speaks. */
export const restDeg = (rest) =>
  rest ? +((((Math.atan2(rest.x, -rest.z) * 180) / Math.PI + 360) % 360).toFixed(2)) : null;

/** Shortest signed distance between two headings, in degrees. */
export const gapDeg = (a, b) => +Math.abs(((a - b + 540) % 360) - 180).toFixed(2);

function win() {
  const w = frame?.contentWindow;
  if (!w?.__game) throw new Error('the game frame is not up — open it first');
  return w;
}

export const isUp = () => !!frame?.contentWindow?.__game?.tutorial?.lesson;

/**
 * Boot the game in a frame and leave it sitting on the first lesson.
 * Safe to call repeatedly; the second call is a no-op.
 * @param {(msg: string) => void} [say]
 */
export async function boot(say = () => {}) {
  if (isUp()) return win();

  if (!frame) {
    // A FIRST-TIME PLAYER GETS THE LESSONS. The game hands a returning player
    // straight to a run, and a run has no board to measure — so the flag comes
    // off before the frame loads. Same origin, so this is the frame's own
    // storage: the editor is not reaching into somebody else's.
    try {
      localStorage.removeItem(TUTORIAL_KEY);
    } catch {
      /* private mode — the tutorial runs anyway */
    }

    host = document.createElement('div');
    host.id = 'game-host';
    frame = document.createElement('iframe');
    frame.id = 'game-frame';
    frame.title = 'the game, measuring';
    // Relative, so this works from the dev server and from a built /tool alike.
    frame.src = new URL('../index.html', location.href).href;
    host.appendChild(frame);
    // INSIDE THE STAGE, not floating over the page. Fixed to the corner of the
    // window it sat on top of the readouts it was producing — the Ship button
    // was underneath the game and could not be clicked. The table is centred
    // in a column with dead space either side of it, which is exactly the
    // shape of a phone.
    (document.querySelector('.stage') || document.body).appendChild(host);
  }

  say('booting the game…');
  const deadline = Date.now() + 30000;
  let clicked = false;
  while (Date.now() < deadline) {
    const w = frame.contentWindow;
    const doc = w?.document;
    if (!clicked && doc?.getElementById('btn-play')) {
      doc.getElementById('btn-play').click();
      clicked = true;
      say('starting the lessons…');
    }
    if (w?.__game?.tutorial?.lesson) {
      // The harness runs against the live systems, so it goes in after boot —
      // the same order sim.mjs uses.
      if (!w.__simSweep) {
        const s = w.document.createElement('script');
        s.textContent = harnessSource;
        w.document.head.appendChild(s);
      }
      say('ready');
      return w;
    }
    await sleep(200);
  }
  throw new Error('the game never reached a lesson — is the dev server serving / as well as /tool?');
}

/**
 * Put the board being edited onto the live table.
 *
 * The lesson's RULES — what counts as a pass, what the card says — stay the
 * game's. Only the geometry comes from the editor, which is the whole point:
 * the thing measured is the placement, judged by the board's own rule.
 *
 * @param {object} record a lesson record from lessons.json, as edited
 */
export async function useBoard(record, say = () => {}) {
  const w = await boot(say);
  const t = w.__game.tutorial;
  const at = (t.boards || []).findIndex((b) => b.id === record.id);
  if (at < 0) {
    throw new Error(
      `the game has no board called "${record.id}" — a new lesson has to be in src/data/lessons.json before it can be measured`
    );
  }
  if (t.index !== at) {
    t._enter(at);
    await sleep(140);
  }
  const L = t.lesson;
  if (record.rest) L.rest = { ...record.rest };
  L.call = record.call ?? null;
  if (Number.isFinite(record.solve)) L.solve = record.solve;
  L.window = record.window || null;
  L.room.obstacles = clone(record.obstacles || []);
  L.room.enemies = clone(record.enemies || []);
  L.room.objects = clone(record.objects || []);
  L.room.goal = record.goal || null;
  t._buildRoom();
  await sleep(140);
  return w;
}

/**
 * Sweep the board and report the runs of heading that satisfy it.
 *
 * @param {{step?:number, powers?:number[], onProgress?:(at:number)=>void}} spec
 */
export async function sweep({ step = 0.5, powers = POWERS, onProgress } = {}) {
  const w = win();
  const hits = [];
  for (let from = 0; from < 360; from += SLICE) {
    const part = w.__simSweep({ step, powers, from, to: Math.min(360, from + SLICE) });
    hits.push(...part.hits);
    onProgress?.((from + SLICE) / 360);
    // A frame back to the editor, so the progress it is drawing is visible
    // rather than a repaint that lands after the whole sweep is over.
    await raf();
  }

  // The game's own grouping, not a second opinion about what "contiguous" is.
  const runs = w.__simRuns(hits, step);
  const L = w.__game.tutorial.lesson;
  const rest = restDeg(L.rest);
  const solve = Number.isFinite(L.solve) ? L.solve : null;

  const widest = runs.reduce((a, b) => (b.width > (a?.width ?? -1) ? b : a), null);
  const holding = (deg) =>
    deg == null ? null : runs.find((r) => r.from <= deg && deg <= r.to) || null;
  const nearest = (deg) => {
    if (deg == null || !runs.length) return null;
    return runs.reduce(
      (best, r) => {
        const d = r.from <= deg && deg <= r.to ? 0 : Math.min(gapDeg(deg, r.from), gapDeg(deg, r.to));
        return !best || d < best.d ? { d, run: r } : best;
      },
      null
    );
  };
  const near = nearest(rest);

  return {
    step,
    powers,
    headings: hits.length,
    runs,
    widest,
    rest,
    restGap: near ? near.d : null,
    restRun: near ? near.run : null,
    solve,
    /** The run `solve` sits in — what `verify` stores as the board's window. */
    solveRun: holding(solve)
  };
}

/** One stroke, played on the live table, with the paths every body took. */
export function playShot({ deg, power = 0.8 }) {
  return win().__simAim({ deg, power, trails: true });
}

/** Can the rack be cleared inside the budget? A beam search over strokes. */
export function clearRack({ strokes, step = 2 } = {}) {
  return win().__simPlan({ strokes, step });
}

/** What the board is asking for, in the game's own words. */
export function lesson() {
  return win().__simLesson();
}

/** Show or hide the frame without letting the browser stop animating it. */
export function showFrame(on) {
  if (!host) return;
  // NOT `display: none`. A frame that is not laid out stops getting animation
  // frames, and the game resolves a lesson on its own clock — hiding it that
  // way leaves probes measuring a table that has stopped listening. Faded and
  // un-clickable is invisible enough.
  host.classList.toggle('away', !on);
}
