#!/usr/bin/env node
/**
 * check-coach — prove what the tutorial DOES when a stroke goes wrong.
 *
 *   npm run coach
 *
 * `verify-boards` proves a board can be solved. This proves the other half:
 * that a board played over several strokes handles a failed one correctly, and
 * that the sentence the player reads afterwards describes what actually
 * happened to the table in front of them.
 *
 * Both halves of that were wrong, and neither was visible from a sweep:
 *
 *   THE STROKE WAS CHARGED TWICE. A scratch on the four-in-three board ran the
 *   ordinary miss path — cue home, WHOLE RACK REBUILT — so every ball already
 *   cleared stood back up while the shots spent clearing them stayed spent.
 *   The attempt was neither restarted nor continued: it was left in a position
 *   the board could not be won from.
 *
 *   THE BAND SAID "DOWN". Then it said it again over the top of the scratch
 *   correction, because the progress line was written before the verdict was.
 *
 * So the checks here are behavioural, not cosmetic. A stroke is played for
 * real, through the board's own rules, and the table and the band are read
 * afterwards.
 */

import { openGame, boardIds } from './sim.mjs';

const game = await openGame();
const fails = [];
const check = (ok, what, detail = '') => {
  console.log(`  ${ok ? '✓' : '✗'} ${what}${detail ? ` — ${detail}` : ''}`);
  if (!ok) fails.push(what);
};

/** Same balls, same places? Positions are compared loosely — a ball can settle. */
const sameRack = (a, b) =>
  a.length === b.length &&
  a.every((ball, i) => ball.n === b[i].n && Math.hypot(ball.x - b[i].x, ball.z - b[i].z) < 0.05);

// TABLE VOCABULARY THE GAME HAS NOT TAUGHT. Two lists, and the second is the
// subtler one: a ball going in a pocket is POCKETED, and every other name for
// the same event — "down", "potted" — is a synonym the player has to learn on
// top of the game rather than a word the game has given them. One event, one
// word. ("down" as a direction is a different word and is left alone.)
const JARGON = /\b(cut|carom|thread|full ball|cushion|kiss|english|safety)\b/i;
const SYNONYM = /\bpott(ed|ing)\b|\b(nothing|is|are|balls?)\s+down\b/i;

/** Held so the vocabulary can be judged over everything the run heard, once. */
const said = [];
const vocab = (band) => {
  said.push(band);
  return !JARGON.test(band) && !SYNONYM.test(band);
};
const reads = (band, label) => {
  check(band.length > 0, `${label} is answered at all`, JSON.stringify(band));
  check(vocab(band), 'in words the game has taught');
  check(
    /\b(aim|hit|shoot|steer|line|put|try|start|drag|pull|angle)\b/i.test(band),
    'and with something to do next'
  );
};

try {
  /* ------------------------------------------------------------------ *
   * A LIT POCKET IS A PROMISE
   *
   * The game lights a pocket to mean "put a ball in here" — a called pocket in
   * a run, the target of a lesson. A board that lights one and then passes the
   * player for something else is lying, and one did: the angled combination
   * was judged on whether the first ball reached the second, while its card
   * named a corner and its felt lit that corner. Reported by a player who
   * bounced the ball off two walls, never came near the pocket, and was told
   * they had done it.
   * ------------------------------------------------------------------ */
  console.log('\nwhat each board promises\n');
  for (const board of await game.promises()) {
    if (!board.lights.length) continue;
    check(
      board.checksAPot,
      `${board.id} lights ${board.lights.join(', ')} and checks a ball goes in`,
      board.checksAPot ? '' : 'lights a pocket it never checks'
    );
  }

  /* ------------------------------------------------------------------ *
   * THE ROAD ON THE FELT — not the road in the solver
   * ------------------------------------------------------------------ *
   * Every route check above asks the solver whether a road exists, and for a
   * whole release it answered yes to a player who could see nothing: the fade
   * that retires the road when a stroke goes off was armed by the menu's own
   * attract-mode strokes and never cleared, so each road was drawn at full
   * strength and gone a third of a second later. The solver cannot see that.
   * These read the meshes.
   */
  console.log('\nthe road the player can actually see\n');
  for (const id of boardIds()) {
    await game.gotoBoard(id);
    const road = await game.road();
    const drawn = road?.drawn;
    check(
      drawn?.bands > 0 && drawn.fade > 0.9 && !drawn.retiring && drawn.drawn.some((n) => n > 0),
      `${id} — the road is on the felt`,
      `${drawn?.bands ?? 0} bands, fade ${drawn?.fade ?? 0}, ${drawn?.drawn?.reduce((a, b) => a + b, 0) ?? 0} vertices`
    );
    // AND IT IS THE BOARD'S OWN MEASURED LINE, while the board is untouched.
    // The sweep works from projections and only knows the goal it was handed,
    // so on the plant board it drew a line that pots the 2 with the cue — on
    // the board whose whole subject is that the 2 must be knocked in by the 4
    // — and on the bank board it drew a line straight at the ball.
    const lesson = await game.lesson();
    if (Number.isFinite(lesson?.solve)) {
      const drawn = (await game.route())?.heading;
      check(
        drawn === lesson.solve,
        `${id} — the road is the board's own solution`,
        `road ${drawn}° vs solve ${lesson.solve}°`
      );
    }
    // AND IT IS A SHOT, NOT A SCRATCH. The road is a line and a line is all
    // the player can follow — how hard they hit it is theirs — so the heading
    // it is drawn along is played here at every power a thumb produces, and
    // none of them may lose the cue. Reported as "it keeps giving me coach
    // lines that point my cue ball into pockets where it scratches": the
    // scratch was being judged only at the power that happened to achieve the
    // goal, and only on the half of the path after contact.
    const heading = (await game.route())?.heading;
    if (heading != null) {
      const tried = [];
      for (const power of [0.5, 0.65, 0.8, 1.0]) {
        const out = await game.shot({ deg: heading, power });
        tried.push(`${power}:${out.scratched ? 'SCRATCH' : 'ok'}`);
      }
      check(
        !tried.some((t) => t.includes('SCRATCH')),
        `${id} — the road it draws is not a scratch`,
        `${heading}° — ${tried.join(' ')}`
      );
    }
    // AND THE ARROWS TRAVEL THE WAY THEY POINT. They marched backwards for a
    // release: the road said "go left" and its arrows slid right.
    const march = [];
    for (let i = 0; i < 3; i += 1) {
      march.push((await game.road())?.drawn ? (await game.road())?.head : null);
      await game.page.waitForTimeout(80);
    }
    const moving = march.filter((h) => h != null);
    check(
      moving.length < 2 || moving[moving.length - 1] > moving[0],
      `${id} — the arrows march the way they point`,
      moving.join(' → ')
    );
    // AND IT KEEPS OFF THE RED. The mine board drew its road straight over the
    // mine — the one line the card exists to tell the player not to take.
    if (road?.hazards) {
      check(
        road.clearance === null || road.clearance > 0,
        `${id} — the road keeps off the mine`,
        `clearance ${road.clearance}`
      );
    }
  }

  /* ------------------------------------------------------------------ *
   * EVERY OTHER BOARD: a miss is answered, in words that report and direct
   * ------------------------------------------------------------------ */
  for (const id of ['angle', 'combo', 'cut-combo', 'bank']) {
    await game.gotoBoard(id);
    console.log(`\n${id}\n`);
    // THE ROUTE IS DRAWN BEFORE ANYTHING IS ASKED OF THE PLAYER. A board that
    // cannot show its own answer is a board the player has to guess at, which
    // is what the four-in-three one was.
    const route = await game.route();
    check(route?.lines > 0, 'the board draws its route', `${route?.lines ?? 0} lines`);
    // AND THE ROUTE IS A SHOT THAT WORKS. `solve` is a stored heading, and two
    // things teach it as the answer: the demonstration that swings the cue
    // after a miss, and the route drawn on the felt. On two boards it had
    // drifted — the bank's scratched at every power and the four-in-three
    // board's pocketed nothing at all — so the game was demonstrating shots
    // that do not work, confidently, with the board's own rule saying no.
    const solved = await game.solve();
    if (solved) {
      check(
        solved.ok,
        `${id}'s stored solution actually solves it`,
        `${solved.solve}° — ` + solved.tried.map((t) => `${t.power}:${t.ok ? 'yes' : 'no'}`).join(' ')
      );
    }
    // Straight backwards: on every board that is a miss, and on most of them
    // it is a miss that touches nothing at all.
    const miss = await game.play({ deg: 180, power: 0.35 });
    reads(miss.band, 'a miss');
  }
  /* ------------------------------------------------------------------ *
   * TWO IN ONE STROKE: one ball is not two
   * ------------------------------------------------------------------ *
   * The four-balls-five-strokes board that used to sit here is gone, and with
   * it the rewind checks that were the only exercise of `clearRack` and its
   * stroke budget. That machinery still stands in Tutorial for a board that
   * declares it; nothing ships with it today, so nothing here covers it.
   * ------------------------------------------------------------------ */
  await game.gotoBoard('two-in-one');
  console.log('\ntwo-in-one\n');

  const opening = await game.route();
  check(opening?.lines > 0, 'the board draws its route', `${opening?.lines ?? 0} lines`);
  const openSolve = await game.solve();
  check(
    openSolve?.ok,
    "two-in-one's stored solution actually solves it",
    `${openSolve?.solve}° — ` + (openSolve?.tried ?? []).map((t) => `${t.power}:${t.ok ? 'yes' : 'no'}`).join(' ')
  );

  // ONE BALL IS NOT TWO. The rule counts pots within a single stroke, and the
  // failure it refuses is the player who drops one, gets the table back, and
  // drops the other — two strokes doing one thing each.
  let oneOnly = null;
  for (let d = 0; d < 360 && oneOnly === null; d += 2) {
    const probe = await game.shot({ deg: d, power: 0.7 });
    if (probe.pots.length === 1 && !probe.scratched) oneOnly = d;
  }
  check(oneOnly !== null, 'a one-ball stroke is reachable from here', oneOnly === null ? '' : `${oneOnly}°`);
  if (oneOnly !== null) {
    const half = await game.play({ deg: oneOnly, power: 0.7 });
    check(!half.done, 'one ball down does not finish the board', `${half.pots.length} pocketed`);
    reads(half.band, 'one of two');
  }

  // AND THE SHOT THE CARD DESCRIBES PUTS BOTH DOWN, IN DIFFERENT POCKETS —
  // the 4 into the side it is sitting on, the 1 carrying on into the corner.
  //
  // PLAYED AT SEVERAL POWERS, because that is the axis this board lives on: a
  // window is an area in heading and power, and a check that plays one power
  // reports whether the shot works for a player who always hits it that hard.
  const solve = (await game.lesson()).solve;
  const won = [];
  for (const power of [0.5, 0.65, 0.8, 0.95]) {
    const out = await game.shot({ deg: solve, power });
    if (!out.scratched && out.pots.length >= 2) won.push(power);
  }
  check(
    won.length >= 2,
    'the stored shot puts both balls down, at more than one power',
    `works at ${won.join(', ') || 'none'}`
  );
  const both = await game.play({ deg: solve, power: won[0] ?? 0.8 });
  check(both.done, 'and finishes the board', `${both.pots.join(', ')} in`);

  /* ------------------------------------------------------------------ *
   * THE LAST BOARD, checked after the one that comes before it — the
   * tutorial only walks forwards, so the order here is the board order.
   * ------------------------------------------------------------------ */
  await game.gotoBoard('green-red');
  console.log('\ngreen-red\n');
  const last = await game.play({ deg: 180, power: 0.35 });
  reads(last.band, 'a miss');

  // THE RED IS A VERDICT. A board that says "not the red" used to pass a
  // stroke that drove straight over it, because hitting a mine cost health and
  // nothing else — and on the table that shipped, the red was the only way
  // through, so the only way to pass was to do the forbidden thing.
  let overTheRed = null;
  for (let d = 0; d < 360 && overTheRed === null; d += 2) {
    const probe = await game.shot({ deg: d, power: 0.8 });
    if (probe.mine && !probe.scratched) overTheRed = d;
  }
  check(overTheRed !== null, 'the red is reachable from here', overTheRed === null ? '' : `${overTheRed}°`);
  if (overTheRed !== null) {
    const mined = await game.play({ deg: overTheRed, power: 0.8 });
    check(!mined.done, 'a stroke over the red does not pass the board');
    check(/red/i.test(mined.band) && vocab(mined.band), 'and the band says so', JSON.stringify(mined.band));
    // AND THE RED IS STILL THERE FOR THE NEXT ATTEMPT. A hazard is spent when
    // it goes off and stays spent for the rest of a run — which on a lesson
    // meant the board that teaches "not the red" had no red on it from the
    // second attempt onwards.
    const again = await game.shot({ deg: overTheRed, power: 0.8 });
    check(again.mine, 'and the red is still armed for the next attempt');
  }

  /* ------------------------------------------------------------------ *
   * A FINISHED BOARD KEEPS ITS BALLS
   * ------------------------------------------------------------------ *
   * Completing a lesson used to blow the rest of the rack up with the same
   * sparks a pot gets, which from the player's chair reads as those balls
   * having gone in — on a board whose whole subject is what counts as a pot.
   */
  const standing = (await game.table()).rack.length;
  const cleared = await game.play({ deg: (await game.lesson()).solve, power: 0.6 });
  check(
    cleared.done && cleared.rack.length === standing - cleared.pots.length,
    'a completed board keeps every ball that did not go in',
    `${standing} up, ${cleared.pots.length} pocketed, ${cleared.rack.length} left${cleared.done ? '' : ' (board not completed)'}`
  );

} finally {
  await game.close();
}

console.log(`\n${said.length} lines read, one vocabulary\n`);
if (fails.length) {
  console.log(`${fails.length} check${fails.length === 1 ? '' : 's'} failed`);
  process.exit(1);
}
console.log('coaching behaves as the boards claim');
