#!/usr/bin/env node
/**
 * verify-boards — prove every tutorial board is playable before shipping it.
 *
 *   npm run verify                    every board
 *   npm run verify -- --board bank    one board, finely
 *   npm run verify -- --json          machine-readable
 *
 * For each board it sweeps every aim heading through the real physics, asks
 * the BOARD'S OWN rule whether the stroke passed, and reports the contiguous
 * ranges of heading that work. Then it judges the board against two thresholds
 * that come straight from what went wrong before:
 *
 *   WIDTH   the widest working range must be at least MIN_WIDTH degrees. A
 *           shot with a half-degree window is a real shot and an unteachable
 *           one; three boards shipped like that and none was findable by hand.
 *
 *   REACH   the board's resting aim must be within MAX_REACH degrees of a
 *           working range. A board whose cue starts pointing 120 degrees away
 *           from its only solution is not hard, it is unsigned.
 *
 * Boards with a shot budget get a third check: a beam search over consecutive
 * strokes, confirming the rack can actually be cleared inside the budget the
 * card promises.
 */

import { openGame, boardIds } from './sim.mjs';

const MIN_WIDTH = 2.0;
const MAX_REACH = 12.0;

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const val = (f, d) => {
  const i = args.indexOf(f);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};

const only = val('--board', null);
const step = Number(val('--step', has('--fine') ? 0.25 : 0.5));
const asJson = has('--json');

const ids = only ? [only] : boardIds();
const game = await openGame();
const results = [];

try {
  for (const id of ids) {
    await game.gotoBoard(id);
    const lesson = await game.lesson();
    const sweep = await game.sweep({ step });
    const plan = lesson.shots ? await game.plan({ strokes: lesson.shots }) : null;

    const width = sweep.widest?.width ?? 0;
    const reach = sweep.restGap ?? Infinity;
    const problems = [];
    if (width < MIN_WIDTH) problems.push(`widest window ${width}° < ${MIN_WIDTH}°`);
    if (reach > MAX_REACH) problems.push(`rest aim ${reach}° from any solution`);

    /* THE STORED WINDOW IS THE ONE THE FELT LIGHTS UP ON, so it has to be the
       one this sweep measures. The coach's arrows brighten when the aim is
       inside `lesson.window`, which is a promise that the heading works — and
       a promise made from a number in a data file is only as good as the last
       time anyone checked it against the table. A board that moves and leaves
       its window behind would light the arrows on headings that miss. */
    const stored = lesson.window;
    if (!stored) problems.push('no stored window for the coach to light up on');
    else {
      const run = (sweep.runs || []).find((r) => r.from <= lesson.solve && lesson.solve <= r.to);
      if (!run) problems.push(`stored solve ${lesson.solve}° is in no working run`);
      else if (Math.abs(run.from - stored[0]) > step || Math.abs(run.to - stored[1]) > step) {
        problems.push(
          `stored window ${stored[0]}–${stored[1]} is not the measured run ${run.from}–${run.to}`
        );
      }
    }
    if (plan && !plan.cleared) {
      problems.push(`cannot clear ${plan.total} balls in ${plan.strokes} shots (best ${plan.bestDown})`);
    }
    results.push({ id, lesson, sweep, plan, problems, ok: problems.length === 0 });
  }
} finally {
  await game.close();
}

if (asJson) {
  console.log(JSON.stringify(results, null, 2));
} else {
  const pad = (s, n) => String(s).padEnd(n);
  console.log('');
  console.log(pad('BOARD', 13) + pad('GATE', 24) + pad('WIDEST', 9) + pad('REACH', 8) + 'RUNS');
  console.log('─'.repeat(96));
  for (const r of results) {
    const runs = r.sweep.runs
      .filter((x) => x.width >= 0.5)
      .map((x) => `${x.from}–${x.to}`)
      .slice(0, 4)
      .join('  ');
    console.log(
      (r.ok ? '  ' : '! ') +
        pad(r.id, 11) +
        pad(r.lesson.gate, 24) +
        pad(`${r.sweep.widest?.width ?? 0}°`, 9) +
        pad(`${r.sweep.restGap ?? '—'}°`, 8) +
        runs
    );
    if (r.plan) {
      const route = r.plan.line.map((s) => `${s.deg}° @${s.power} (${s.got})`).join(' → ');
      console.log(
        '    budget: ' +
          (r.plan.cleared
            ? `clears ${r.plan.total} in ${r.plan.line.length} shots`
            : `BEST ${r.plan.bestDown}/${r.plan.total} in ${r.plan.strokes} shots`) +
          (route ? `\n    route:  ${route}` : '')
      );
    }
    for (const p of r.problems) console.log(`    ✗ ${p}`);
  }
  console.log('');
  const bad = results.filter((r) => !r.ok);
  console.log(
    bad.length
      ? `${bad.length} of ${results.length} boards need work: ${bad.map((b) => b.id).join(', ')}`
      : `all ${results.length} boards playable (window ≥ ${MIN_WIDTH}°, rest within ${MAX_REACH}°)`
  );
}

if (game.errors.length) {
  console.error('\npage errors:\n  ' + game.errors.join('\n  '));
}
process.exit(results.every((r) => r.ok) && !game.errors.length ? 0 : 1);
