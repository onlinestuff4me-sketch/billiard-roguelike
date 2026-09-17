#!/usr/bin/env node
/**
 * check-aim — play the shot the preview drew, and ask the table whether the
 * preview was telling the truth.
 *
 *   npm run aim              every board, 3° and four powers
 *   npm run aim -- --step 6  coarser and quicker
 *   npm run aim -- --floor 98
 *
 * WHY THIS EXISTS
 *
 * Reported as: "when I bank the cue off a wall so it hits balls into other
 * balls into pockets, 50% of the time the projected guide lines are
 * inaccurate — it ends up in a scratch or a missed pocket when the line showed
 * a successful pocket and no scratch."
 *
 * Every check in this directory could see that a board was solvable and none
 * of them could see this, because they all ask the same question the player
 * cannot: they play a stroke and read the result. The preview is a SECOND
 * claim, made before the stroke, and nothing was comparing the two. Measured
 * the first time, the report was exactly right — on shots that banked and
 * then found a ball the drawn line agreed with the table 71% of the time, and
 * on shots involving two object balls, 63%.
 *
 * So this is the instrument for the promise rather than the shot. For every
 * heading it reads what the felt is telling the player — the same projection,
 * through `window.__aim`, not a fresh solve with its own options — then plays
 * that heading and compares two verdicts:
 *
 *   SCRATCH    did the cue ball go down, and did the line say so
 *   POTS       which balls went in which pockets, and did the line say so
 *
 * Those two are the whole of what a player reads a preview for. Where a ball
 * comes to rest is deliberately not compared: the preview does not promise a
 * resting place to within a ball's width, and holding it to one would report
 * failures the player would never notice while hiding the two that they do.
 */

import { openGame, boardIds } from './sim.mjs';

const arg = (name, fallback) => {
  const at = process.argv.indexOf(`--${name}`);
  return at > 0 && process.argv[at + 1] ? Number(process.argv[at + 1]) : fallback;
};

const STEP = arg('step', 3);
const FLOOR = arg('floor', 99);
const POWERS = [0.4, 0.6, 0.8, 1.0];

/**
 * A stable name for one verdict, so two of them can simply be compared.
 * Only balls that go DOWN are named: a leg that ends on the felt is not a
 * claim about a pocket, and counting it as `3@null` made every drawn line
 * that moved a ball without potting it read as a disagreement.
 */
const potsOf = (list) =>
  list
    .filter((p) => p.n != null && p.slot)
    .map((p) => `${p.n}@${p.slot}`)
    .sort()
    .join(',');

const game = await openGame();
const rows = [];
const misses = [];

try {
  for (const id of boardIds()) {
    await game.gotoBoard(id);
    const tally = { total: 0, agree: 0, scratch: 0, pots: 0 };
    const banked = { total: 0, agree: 0 };
    const chain = { total: 0, agree: 0 };

    for (let deg = 0; deg < 360; deg += STEP) {
      for (const power of POWERS) {
        const { promise, actual } = await game.aim({ deg, power });
        const saidPots = potsOf(promise.legs.map((l) => ({ n: l.number, slot: l.potted })));
        const didPots = potsOf(actual.pots);
        const saidScratch = !!promise.cue.scratch;
        const didScratch = !!actual.scratched;

        const potsOk = saidPots === didPots;
        const scratchOk = saidScratch === didScratch;
        const ok = potsOk && scratchOk;

        tally.total += 1;
        if (ok) tally.agree += 1;
        if (!scratchOk) tally.scratch += 1;
        if (!potsOk) tally.pots += 1;

        // The two shapes the report was about: a line that banks before it
        // finds a ball, and a line that moves more than one ball.
        const rails = Math.max(0, promise.cue.approach.length - 1);
        if (promise.hit != null && rails >= 1) {
          banked.total += 1;
          if (ok) banked.agree += 1;
        }
        if (promise.legs.length >= 2) {
          chain.total += 1;
          if (ok) chain.agree += 1;
        }

        if (!ok && misses.length < 40) {
          misses.push(
            `${id} ${deg}° @${power}  drawn ${saidScratch ? 'SCRATCH ' : ''}${saidPots || '(nothing down)'}` +
              `  →  played ${didScratch ? 'SCRATCH ' : ''}${didPots || '(nothing down)'}`
          );
        }
      }
    }
    rows.push({ id, ...tally, banked, chain });
    const pct = (100 * tally.agree) / tally.total;
    console.log(
      `  ${pct >= FLOOR ? '✓' : '✗'} ${id.padEnd(12)} ${pct.toFixed(1).padStart(5)}%  ` +
        `of ${tally.total} headings   ${tally.scratch} scratch, ${tally.pots} pot`
    );
  }
} finally {
  await game.close();
}

const sum = (pick) => rows.reduce((t, r) => t + pick(r), 0);
const total = sum((r) => r.total);
const agree = sum((r) => r.agree);
const overall = (100 * agree) / total;
const part = (pick) => {
  const t = sum((r) => pick(r).total);
  const a = sum((r) => pick(r).agree);
  return t ? `${((100 * a) / t).toFixed(1)}% of ${t}` : 'none on these boards';
};

console.log(`
  ${total} previews drawn and then played.

  every heading          ${overall.toFixed(1)}%
  banked, then a ball    ${part((r) => r.banked)}
  two balls or more      ${part((r) => r.chain)}

  disagreements: ${sum((r) => r.scratch)} about a scratch, ${sum((r) => r.pots)} about a pot`);

if (misses.length) {
  console.log('\n  where they disagree:');
  for (const m of misses) console.log(`    ${m}`);
}

if (overall < FLOOR) {
  console.log(`\nthe preview agrees with the table on ${overall.toFixed(1)}% of shots — floor is ${FLOOR}%`);
  process.exit(1);
}
// Never round this up in the prose. The residual is a real shape — a struck
// ball that banks and then meets the cue ball while it is still rolling, which
// a projection through static geometry cannot see — and a tool that prints
// "they agree" over fourteen disagreements is how it gets forgotten.
console.log(
  overall === 100
    ? '\nthe line the player is shown is the shot the table plays'
    : `\nthe line keeps its promise on ${overall.toFixed(1)}% of headings (floor ${FLOOR}%)` +
        `, and ${total - agree} of ${total} it does not — see docs/AIMING.md §6a`
);
