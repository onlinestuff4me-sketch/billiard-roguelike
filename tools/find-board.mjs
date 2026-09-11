#!/usr/bin/env node
/**
 * find-board — search ball placements for a board that asks what it claims.
 *
 *   node tools/find-board.mjs cut-combo
 *   node tools/find-board.mjs budget
 *
 * `verify-boards` answers "is this board solvable as authored". This answers
 * the question that comes before it: WHERE SHOULD THE BALLS GO so that the
 * shot the card describes is a shot a beginner can find.
 *
 * It exists because two boards were caught claiming something they did not
 * check, and the honest fix for one of them — require the pot the card names —
 * was rejected on a search of twenty layouts that found nothing wider than two
 * degrees. Twenty layouts is not a search. This is: it sweeps candidate
 * placements, and for each one sweeps every heading at several powers through
 * the real physics, and reports the widest CONTIGUOUS window of heading that
 * satisfies the goal. A window is the unit that matters — a shot that works at
 * one sampled heading is not a shot a human can play.
 *
 * The goal is named per board, and it is the goal the CARD names, not the one
 * the code currently happens to accept.
 */
import { openGame } from './sim.mjs';

const board = process.argv[2];
if (!board) {
  console.error('usage: node tools/find-board.mjs <board-id>');
  process.exit(1);
}

/** Candidate placements per board, and what a stroke has to do to count. */
const PLANS = {
  'cut-combo': {
    // The card: hit the 4 off to one side so it knocks the 2 in. So the 2 has
    // to go down, and the cue must reach the 4 first — a combination, not a
    // straight pot of the 2.
    //
    // A GRID OVER THE MIDDLE OF THE TABLE FOUND NOTHING. 320 placements, best
    // window 2 degrees, which `verify` calls unplayable. That is not a verdict
    // on combinations, it is a verdict on combinations played the long way:
    // the tolerance of a pot falls off as one over the distance the object
    // ball has to travel, and every one of those layouts had the second ball a
    // long way from a pocket.
    //
    // So this family is a PLANT: the 2 parked a ball's width off a pocket
    // mouth, and the 4 on the line from the cue to it. The second ball travels
    // almost no distance, which is exactly where the window comes from.
    goal: 'the 2 pocketed off the 4',
    balls: [2, 4],
    grid() {
      const cue = { x: 0, z: 6.4 };
      const round = (v) => +v.toFixed(2);
      const out = [];
      for (const pocket of [
        { x: 8.1, z: 0 },
        { x: 8.1, z: -15.1 },
        { x: -8.1, z: 0 }
      ]) {
        for (const back of [1.1, 1.6, 2.2]) {
          // The 2, backed off the mouth along the line the cue is coming from.
          const dx = cue.x - pocket.x;
          const dz = cue.z - pocket.z;
          const len = Math.hypot(dx, dz);
          const two = { x: pocket.x + (dx / len) * back, z: pocket.z + (dz / len) * back };
          // The 4, on the line from the cue to the 2, at a few distances and a
          // few sideways offsets — the offset is what makes it a cut.
          const ax = two.x - cue.x;
          const az = two.z - cue.z;
          const al = Math.hypot(ax, az);
          for (const along of [0.35, 0.5, 0.65]) {
            for (const off of [-0.6, -0.3, 0, 0.3, 0.6]) {
              const x = cue.x + (ax / al) * al * along + (-az / al) * off;
              const z = cue.z + (az / al) * al * along + (ax / al) * off;
              if (Math.abs(x) > 7.4 || Math.abs(z) > 14.4) continue;
              out.push({ 2: [round(two.x), round(two.z)], 4: [round(x), round(z)] });
            }
          }
        }
      }
      return out;
    },
    ok: (out) => out.pots.some((p) => p.n === 2) && out.passes >= 1 && !out.scratched
  },
  budget: {
    // The card asks for four balls in three shots, which means at least one
    // stroke has to drop two — and a player who cannot see WHICH stroke that
    // is has been asked to find something invisible.
    //
    // A first search put two balls on the line from the cue to a pocket and
    // found nothing wider than two degrees. Same lesson as the plant board
    // learned: it is not the LINE that makes a shot findable, it is how far
    // the object balls have to travel. So both balls go on the mouth — one
    // parked a ball's width off it and the second directly behind, so a single
    // stroke sends the front one in and follows it with the back one.
    goal: 'two balls pocketed in one stroke, both hanging on the mouth',
    balls: [1, 4],
    grid() {
      const round = (v) => +v.toFixed(2);
      const out = [];
      for (const pocket of [
        { x: 8.1, z: 0, ax: 1, az: 0 },
        { x: -8.1, z: 0, ax: -1, az: 0 }
      ]) {
        // Both balls parked ON the mouth rather than in a line at it: one a
        // little in front of the other and to the side, so a stroke into the
        // pair pushes the near one in and the far one after it. A ball this
        // close to a pocket needs almost no speed and almost no accuracy,
        // which is where the window has to come from — every family that put
        // the second ball out on the table measured two degrees.
        for (const near of [0.95, 1.15, 1.4]) {
          for (const far of [1.5, 1.85, 2.2]) {
            for (const side of [0.5, 0.75, 1] ) {
              const a = { x: pocket.x + pocket.ax * -near, z: pocket.z + side * 0.5 };
              const b = { x: pocket.x + pocket.ax * -far, z: pocket.z - side };
              if (Math.abs(b.x) > 7.5 || Math.abs(a.x) > 7.5) continue;
              out.push({ 1: [round(a.x), round(a.z)], 4: [round(b.x), round(b.z)] });
            }
          }
        }
      }
      return out;
    },
    ok: (out) => out.pots.length >= 2 && !out.scratched
  }
};

const plan = PLANS[board];
if (!plan) {
  console.error(`no search plan for "${board}" — add one to PLANS`);
  process.exit(1);
}

const game = await openGame();
try {
  await game.gotoBoard(board);
  await game.page.waitForTimeout(600);
  console.log(`\n${board} — searching for: ${plan.goal}\n`);
  // ONE PLACEMENT PER CALL. The whole grid in a single evaluate crashed the
  // renderer process — a few hundred placements times a few hundred headings
  // is a lot of physics to run without ever yielding. Chunking costs a round
  // trip each and finishes.
  const grid = plan.grid();
  const results = [];
  for (let i = 0; i < grid.length; i += 1) {
    if (i % 20 === 0) process.stdout.write(`  ${i}/${grid.length}\r`);
    results.push(
      await game.page.evaluate(
        ({ place, okSource, step }) => {
          const g = window.__game;
          const ok = new Function('out', `return (${okSource})(out);`);
          for (const slot of g.rooms.scriptedSpec.enemies) {
            const at = place[slot.number];
            if (at) {
              slot.x = at[0];
              slot.z = at[1];
            }
          }
          g.rooms.reRackScripted();
          const hits = [];
          for (let deg = 0; deg < 360; deg += step) {
            for (const power of [0.6, 0.85]) {
              if (ok(window.__simShot({ deg, power }))) {
                hits.push(deg);
                break;
              }
            }
          }
          let best = 0;
          let start = null;
          let prev = null;
          for (const d of hits) {
            if (start === null) start = d;
            else if (d - prev > step * 1.5) {
              best = Math.max(best, prev - start);
              start = d;
            }
            prev = d;
          }
          if (start !== null) best = Math.max(best, prev - start);
          return { place, n: hits.length, widest: +best.toFixed(2) };
        },
        { place: grid[i], okSource: plan.ok.toString(), step: 2 }
      )
    );
  }
  process.stdout.write('        \r');
  results.sort((a, b) => b.widest - a.widest || b.n - a.n);
  for (const r of results.slice(0, 12)) {
    const where = Object.entries(r.place)
      .map(([n, at]) => `${n}@(${at[0]}, ${at[1]})`)
      .join('  ');
    console.log(`  widest ${String(r.widest).padStart(5)}°   headings ${String(r.n).padStart(3)}   ${where}`);
  }
  console.log('');
} finally {
  await game.close();
}
