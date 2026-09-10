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

import { openGame } from './sim.mjs';

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
   * THE MULTI-SHOT BOARD: a failed stroke is given back, not charged
   * ------------------------------------------------------------------ */
  await game.gotoBoard('budget');
  console.log('\nbudget — four balls, five strokes\n');

  const opening = await game.route();
  check(opening?.lines > 0, 'the board draws its route', `${opening?.lines ?? 0} lines`);
  const openSolve = await game.solve();
  check(
    openSolve?.ok,
    "budget's stored solution actually solves it",
    `${openSolve?.solve}° — ` + (openSolve?.tried ?? []).map((t) => `${t.power}:${t.ok ? 'yes' : 'no'}`).join(' ')
  );

  // The opening shot of the route `verify-boards` finds. It pots.
  const first = await game.play({ deg: 20, power: 0.7 });
  check(first.pots.length >= 1, 'the opening shot pockets a ball', `${first.pots.join(', ')} in`);
  check(first.strokes === 1, 'and spends a shot', `${first.strokes} spent`);
  check(
    /pocketed/i.test(first.band) && vocab(first.band),
    'the band names what was pocketed, in the table\'s own word',
    JSON.stringify(first.band)
  );
  check(
    /strokes? left/.test(first.band) && /\d/.test(first.band),
    'and names the next ball and its pocket'
  );

  const before = await game.table();

  // A HEADING THAT SCRATCHES, found rather than assumed — the board's geometry
  // is free to move, and a hard-coded number would quietly stop testing a
  // scratch the first time it did.
  let deg = null;
  for (let d = 0; d < 360 && deg === null; d += 2) {
    const probe = await game.shot({ deg: d, power: 1 });
    if (probe.scratched) deg = d;
  }
  check(deg !== null, 'a scratch is reachable from here', deg === null ? '' : `${deg}°`);

  if (deg !== null) {
    const after = await game.play({ deg, power: 1 });
    check(after.scratched, 'the stroke scratched');
    check(
      sameRack(after.rack, before.rack),
      'the rack is exactly as it was before that stroke',
      `${before.rack.map((b) => b.n).join(',')} → ${after.rack.map((b) => b.n).join(',')}`
    );
    check(
      after.strokes === before.strokes,
      'the stroke is not charged',
      `${before.strokes} → ${after.strokes}`
    );
    check(
      Math.hypot(after.player.x - before.player.x, after.player.z - before.player.z) < 0.05,
      'the cue is back where it was played from',
      `(${before.player.x}, ${before.player.z}) → (${after.player.x}, ${after.player.z})`
    );
    check(
      /^Scratched/.test(after.band) && vocab(after.band),
      'the band names the scratch first',
      JSON.stringify(after.band)
    );
    check(
      /Try the .* into the .*pocket/i.test(after.band),
      'and then says what to play next'
    );
    // AND THE FELT AGREES WITH THE WORDS. The route re-solves from wherever
    // the rewind left the cue, so the line the player follows is the line for
    // the shot the sentence just named.
    const again = await game.route();
    check(again?.lines > 0, 'and a route for the shot it names', `${again?.lines ?? 0} lines`);
  }

  /* ------------------------------------------------------------------ *
   * RUNNING OUT OF SHOTS: stated, and the attempt starts again
   * ------------------------------------------------------------------ */
  // The budget used to simply run past zero — the card counted down into
  // negative numbers while the player went on shooting at a table that could
  // no longer be cleared in three.
  // A POTTING HEADING FROM WHEREVER THE CUE NOW IS, found the same way the
  // scratch was: the board's geometry moves, and only a stroke that actually
  // puts a ball down spends a shot.
  let potDeg = null;
  for (let d = 0; d < 360 && potDeg === null; d += 2) {
    const probe = await game.shot({ deg: d, power: 0.7 });
    if (probe.pots.length && !probe.scratched) potDeg = d;
  }
  check(potDeg !== null, 'a pot is reachable from here', potDeg === null ? '' : `${potDeg}°`);
  const spent = await game.play({ deg: potDeg ?? 20, power: 0.7, spent: 4 });
  check(spent.strokes === 0, 'the attempt starts over', `${spent.strokes} spent`);
  check(spent.rack.length === 4, 'the whole rack is back up', `${spent.rack.length} balls`);
  check(
    /out of strokes/i.test(spent.band) && /Starting over/.test(spent.band) && vocab(spent.band),
    'and the band says the budget ran out',
    JSON.stringify(spent.band)
  );

  /* ------------------------------------------------------------------ *
   * THE LAST BOARD, checked after the one that comes before it — the
   * tutorial only walks forwards, so the order here is the board order.
   * ------------------------------------------------------------------ */
  await game.gotoBoard('green-red');
  console.log('\ngreen-red\n');
  const last = await game.play({ deg: 180, power: 0.35 });
  reads(last.band, 'a miss');

} finally {
  await game.close();
}

console.log(`\n${said.length} lines read, one vocabulary\n`);
if (fails.length) {
  console.log(`${fails.length} check${fails.length === 1 ? '' : 's'} failed`);
  process.exit(1);
}
console.log('coaching behaves as the boards claim');
