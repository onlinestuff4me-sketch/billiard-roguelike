#!/usr/bin/env node
/**
 * check-portal — a line through a portal is still a promise.
 *
 *   npm run portal
 *   npm run portal -- --step 2
 *
 * WHY THIS EXISTS
 *
 * A portal is the first thing on this table whose route is not a line: the ball
 * is translated by the vector between two rings, keeping its heading, its
 * speed and its offset from the ring's centre. Two pieces of code have to
 * believe exactly the same thing about that — the table, which resolves it at
 * the crossing inside a sub-step, and the preview, which solves the crossing
 * on the drawn line — and the whole value of this game's aiming rests on them
 * agreeing. `npm run aim` measures that agreement on every other shape of
 * shot; this measures it on the one shape that did not exist when that check
 * was written.
 *
 * The board is a lesson table with a portal pair added to it at run time, which
 * is deliberate: a portal authored into a layout would test one arrangement, and
 * this tests the rule.
 */

import { openGame } from './sim.mjs';

const arg = (name, fallback) => {
  const at = process.argv.indexOf(`--${name}`);
  return at > 0 && process.argv[at + 1] ? Number(process.argv[at + 1]) : fallback;
};

// Two degrees, not one: this plays every heading to a standstill, and the
// sweep is about the RULE rather than about the exact shot at 43°.
const STEP = arg('step', 2);
const FLOOR = arg('floor', 99);
const POWERS = [0.5, 0.7, 0.9];

/** The pair. Wide apart, and clear of the rack and every pocket. */
const PORTAL = { a: { x: -5.4, z: 1.2 }, b: { x: 5.4, z: -9.4 } };

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
  await game.gotoBoard('angle');
  await game.page.waitForTimeout(400);

  const built = await game.page.evaluate((pair) => {
    const t = window.__game.rooms.table;
    t.addPortal(pair.a, pair.b);
    return { portals: t.portals.length, rings: t.portalRings.length };
  }, PORTAL);
  console.log(`\n  one pair on the felt: ${built.portals} portal, ${built.rings} rings\n`);

  let through = 0;
  let agree = 0;
  let total = 0;

  for (let deg = 0; deg < 360; deg += STEP) {
    for (const power of POWERS) {
      const { promise, actual } = await game.aim({ deg, power });
      const saidPots = potsOf(promise.legs.map((l) => ({ n: l.number, slot: l.potted })));
      const didPots = potsOf(actual.pots);
      const saidScratch = !!promise.cue.scratch;
      const didScratch = !!actual.scratched;
      const ok = saidPots === didPots && saidScratch === didScratch;
      total += 1;
      if (ok) agree += 1;

      // The shots this check is actually about: the ones the drawn line takes
      // through a ring. Everything else is `npm run aim` again, and is counted
      // only so a portal on the table cannot quietly break the rest of the felt.
      const passes = promise.span?.portals ?? 0;
      if (passes > 0) {
        through += 1;
        rows.push({ deg, power, ok, passes });
        if (!ok && misses.length < 20) {
          misses.push(
            `${deg}° @${power} (${passes} through)  drawn ${saidScratch ? 'SCRATCH ' : ''}${
              saidPots || '(nothing down)'
            }  →  played ${didScratch ? 'SCRATCH ' : ''}${didPots || '(nothing down)'}`
          );
        }
      }
    }
  }

  const kept = rows.filter((r) => r.ok).length;
  const pct = through ? (100 * kept) / through : 0;
  const all = (100 * agree) / total;

  console.log(`  ${through} of ${total} drawn lines go through the pair`);
  console.log(`  through a portal        ${pct.toFixed(1)}%`);
  console.log(`  every heading         ${all.toFixed(1)}%`);
  if (misses.length) {
    console.log('\n  where they disagree:');
    for (const m of misses) console.log(`    ${m}`);
  }

  if (!through) {
    console.log('\nno drawn line went through the pair — the check measured nothing\n');
    process.exit(1);
  }
  if (pct < FLOOR || all < FLOOR) {
    console.log(
      `\nthe line keeps its promise on ${pct.toFixed(1)}% of headings through a portal and ${all.toFixed(
        1
      )}% overall — floor is ${FLOOR}%\n`
    );
    process.exit(1);
  }
  console.log('\nthe line through the portal is the shot the table plays\n');
} finally {
  await game.close();
}
