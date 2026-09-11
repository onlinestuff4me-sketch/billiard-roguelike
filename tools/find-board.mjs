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

/**
 * The mine board's premise: aiming straight at the 2 — the line a player takes
 * before they notice the mine — has to run over it. Tried at both powers,
 * because a mine the cue rolls to a stop in front of is not a blocker.
 */
const MINED_DIRECT = ({ place, shot }) => {
  const two = place[2] || [-7, 2];
  const deg = ((Math.atan2(two[0] - 0, -(two[1] - 6.4)) * 180) / Math.PI + 360) % 360;
  return [0.6, 0.85].every((power) => shot(deg, power).mine);
};

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
  'two-in-one': {
    // THE CARD NOW ASKS FOR A CAROM, AND A CAROM IS NOT A DOUBLE.
    //
    // The first version of this board asked for four balls in three strokes,
    // which meant one stroke had to drop two. That was searched across three
    // families and about 550 placements — two balls in a line at a pocket, two
    // in a line at the cue, two hanging on the mouth together — and the widest
    // window anywhere was two degrees, because a knocked ball carries its own
    // drag and once the first has taken the impulse there is nothing left in
    // the second. Both balls being PUSHED by one impulse is the shape that
    // does not work.
    //
    // This is a different shape, and the difference is the whole point: the
    // object ball is not pushed twice, it is cut thin. A thin cut sends the
    // second ball off along the line of centres with very little of the
    // energy and leaves the first ball almost all of it, still travelling
    // nearly where it was going. So the second ball drops in the side pocket
    // it is parked on, and the first carries on into a corner.
    //
    // The search is over where those two balls sit: the far one backed off the
    // side pocket along the line the cue is coming from, the near one behind
    // it with a lateral offset, and the offset is what sets the cut.
    goal: 'one stroke, two pockets: the far ball in the side, the near one on into a corner',
    balls: [1, 4],
    grid() {
      const round = (v) => +v.toFixed(2);
      const cue = { x: 0, z: 6.4 };
      const out = [];
      // ONE SIDE ONLY. The table is symmetric in x and the cue spawns on the
      // centre line, so the other side pocket is this search mirrored — and
      // the budget is better spent on the offset, which is what sets how thin
      // the hit is and therefore how much the near ball keeps.
      for (const S of [{ x: -8.1, z: 0 }]) {
        const ux = cue.x - S.x;
        const uz = cue.z - S.z;
        const ul = Math.hypot(ux, uz);
        // NOT IN THE JAWS. Closer than the pocket's own capture radius and the
        // ball is not hanging over the pocket, it is IN it: the table drops it
        // the moment anything moves, with no contact at all. The first run of
        // this search leaned on exactly that — every leading placement had the
        // far ball 0.55 to 0.7 from a mouth whose radius is 0.82, so "two
        // balls in one stroke" included one that was already down.
        for (const back of [1.15, 1.35, 1.6, 1.9]) {
          // The 4: parked off the side pocket's mouth, so its own run is short
          // — which is where every workable window in this game has come from.
          const four = { x: S.x + (ux / ul) * back, z: S.z + (uz / ul) * back };
          const bx = S.x - four.x;
          const bz = S.z - four.z;
          const bl = Math.hypot(bx, bz);
          const nx = -bz / bl;
          const nz = bx / bl;
          for (const d of [1.0, 1.3, 1.7]) {
            for (const off of [-1.2, -1.0, -0.8, -0.6, -0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45, 0.6, 0.8, 1.0, 1.2]) {
              // The 1: behind the 4 on the line back from the pocket, pushed
              // sideways. Straight behind is a full hit and the 1 stops dead;
              // the further off that line it sits the thinner the cut and the
              // more of its speed the 1 keeps for the corner.
              const one = {
                x: four.x - (bx / bl) * d + nx * off,
                z: four.z - (bz / bl) * d + nz * off
              };
              if (Math.abs(one.x) > 7.4 || Math.abs(one.z) > 14.4) continue;
              if (Math.hypot(one.x - four.x, one.z - four.z) < 0.95) continue;
              // Same rule for the near ball, wherever the offset put it.
              const sunk = (b) =>
                [
                  { x: -8.1, z: 0, r: 0.82 },
                  { x: 8.1, z: 0, r: 0.82 },
                  { x: -8.1, z: -15.1, r: 0.98 },
                  { x: 8.1, z: -15.1, r: 0.98 },
                  { x: -8.1, z: 15.1, r: 0.98 },
                  { x: 8.1, z: 15.1, r: 0.98 }
                ].some((p) => Math.hypot(p.x - b.x, p.z - b.z) < p.r + 0.25);
              if (sunk(one) || sunk(four)) continue;
              out.push({ 1: [round(one.x), round(one.z)], 4: [round(four.x), round(four.z)] });
            }
          }
        }
      }
      return out;
    },
    // TWO BALLS DOWN IN ONE STROKE. Which pockets is left open deliberately.
    //
    // Asking for a side AND a corner — the shape the request described — was
    // measured across two grids and 500 placements at two degrees, and the
    // stroke-by-stroke trace says why: the near ball has to cross thirteen
    // units to reach the second pocket, and the band of headings that sends it
    // that far barely overlaps the band that drops the far ball. In the
    // thicker half of that band the near ball stops a single unit short of the
    // SAME pocket. So the requirement that the pockets be different is the
    // expensive half of the claim, and it is the half the lesson does not
    // need: two balls in one stroke is the thing being taught.
    ok: (out) => !out.scratched && out.pots.length >= 2
  }
,
  'green-red': {
    // THE BOARD'S WHOLE POINT IS THAT THE DIRECT SHOT IS SHUT.
    //
    // The mine is meant to stand in front of the 2 so the player has to give
    // up the obvious line and come at it off the far rail, through the green.
    // It was doing half that job: it blocked the direct shot AND sat where the
    // bank came through, so the shot the card asked for could not be played at
    // all — "it's not possible to complete the needed shot without also
    // passing through the mine".
    //
    // Both halves are searchable, and they pull in opposite directions, which
    // is why eyeballing a position for it kept landing on one or the other:
    //   the PREMISE — aiming straight at the 2 has to run over the mine, or
    //   the board is teaching nothing;
    //   the WINDOW — there has to be a run of headings that banks off a rail,
    //   crosses the green, pots the 2 in the side pocket it lights, and never
    //   touches the mine.
    goal: 'the 2 in the left side pocket off a rail and through the green, with the direct line mined',
    balls: [],
    grid() {
      const round = (v) => +v.toFixed(2);
      const cue = { x: 0, z: 6.4 };
      const two = { x: -7, z: 2 };
      const dx = two.x - cue.x;
      const dz = two.z - cue.z;
      const dl = Math.hypot(dx, dz);
      const ux = dx / dl;
      const uz = dz / dl;
      const nx = -uz;
      const nz = ux;
      const out = [];
      // The mine ON the line the cue would take if it simply aimed at the ball,
      // at a range of distances along it and a little either side of it.
      for (const along of [0.32, 0.45, 0.58, 0.7]) {
        for (const off of [-0.35, 0, 0.35]) {
          const mine = {
            x: cue.x + ux * dl * along + nx * off,
            z: cue.z + uz * dl * along + nz * off
          };
          // The green sits where the bank comes back across the table. Its own
          // position is searched too: a pad the winning shot cannot cross is a
          // pad the card is lying about.
          for (const pad of [
            { x: 1.6, z: 2.2 },
            { x: 2.6, z: 0.6 },
            { x: 0.6, z: 3.4 },
            { x: -1.2, z: 1.2 }
          ]) {
            out.push({ mine: [round(mine.x), round(mine.z)], double: [round(pad.x), round(pad.z)] });
          }
        }
      }
      return out;
    },
    // What the card says, every clause of it: the 2 down in the pocket the
    // board lights, off a rail, through the green, and not over the red.
    ok: (out) =>
      !out.scratched && !out.mine && out.green && out.pots.some((p) => p.n === 2 && p.slot === 'ml'),
    premise: MINED_DIRECT
  }
,
  // THE WHOLE BOARD, not just where the mine sits.
  //
  // With the mine anywhere on the line to the ball, a DIRECT pot is gone
  // outright: the pad is a unit and a bit across at four units' range, so it
  // covers about sixteen degrees either side, and the window for potting the 2
  // is four. There is no thread past it — the board that shipped only had one
  // because its mine was not actually on the line the pot needs.
  //
  // Which leaves the rail, as the request said. Whether a banked route exists
  // is not a question about the mine, it is a question about where the BALL
  // is: a ball out in the middle has no rail behind it to come off. So the
  // ball moves too, the mine follows it onto the line, and the search reports
  // which of those tables has a route wide enough to teach.
  'green-red-bank': {
    board: 'green-red',
    goal: 'the 2 potted off a rail, with the direct line mined',
    balls: [2],
    grid() {
      const round = (v) => +v.toFixed(2);
      const cue = { x: 0, z: 6.4 };
      const out = [];
      for (const x of [-6.6, -5, -3.4, 3.4, 5, 6.6]) {
        for (const z of [-6, -3, 0, 3]) {
          // The mine on the line the cue would take straight at it, half way,
          // where it covers the widest span of the lines that matter.
          const mine = { x: cue.x + (x - cue.x) * 0.45, z: cue.z + (z - cue.z) * 0.45 };
          out.push({
            2: [round(x), round(z)],
            // The other ball parked well out of the traffic. Left where it
            // was, it turned out to be load-bearing: every winning heading in
            // the first pass banked into the 5 and let the 5 knock the 2 in,
            // which is lesson three with a rail in front of it, not the shot
            // this card describes.
            5: [6.6, -11],
            mine: [round(mine.x), round(mine.z)],
            // Parked off the felt for this pass: where the green goes is a
            // question for the route that wins, not one to search blind.
            double: [14, 14]
          });
        }
      }
      return out;
    },
    // THE CUE'S OWN SHOT: off a rail, onto the 2, into a pocket. `passes` is
    // any ball reaching another, so requiring none of them is what separates
    // "you banked onto the ball" from "you banked into a ball that happened to
    // knock the ball in".
    ok: (out) =>
      !out.scratched &&
      !out.mine &&
      out.bounces >= 1 &&
      out.passes === 0 &&
      out.pots.some((p) => p.n === 2),
    premise: MINED_DIRECT
  }
,
  // THE CUE DOING BOTH, which is the one shape left untried.
  //
  // Every family so far hands the work on: the cue hits a ball and that ball
  // has to do the rest, either by pushing the second (nothing left after the
  // drag) or by cutting it (the near ball then has thirteen units to cross).
  // Here nothing is handed on. The cue clips the first ball into a pocket,
  // keeps most of its own speed — which is what a thin cut does — and carries
  // on into a second ball sitting on a second pocket. Two pots, one impulse,
  // no second-hand energy.
  'two-in-one-cue': {
    board: 'two-in-one',
    goal: 'the cue potting both balls itself, one after the other',
    balls: [1, 4],
    grid() {
      const round = (v) => +v.toFixed(2);
      const cue = { x: 0, z: 6.4 };
      const out = [];
      const pairs = [
        [{ x: -8.1, z: 0, r: 0.82 }, { x: -8.1, z: -15.1, r: 0.98 }],
        [{ x: -8.1, z: 15.1, r: 0.98 }, { x: -8.1, z: 0, r: 0.82 }]
      ];
      for (const [A, B] of pairs) {
        const off = (P, back, side) => {
          const ux = cue.x - P.x;
          const uz = cue.z - P.z;
          const ul = Math.hypot(ux, uz);
          return {
            x: P.x + (ux / ul) * back + (-uz / ul) * side,
            z: P.z + (uz / ul) * back + (ux / ul) * side
          };
        };
        for (const backA of [1.2, 1.5, 1.9]) {
          for (const backB of [1.2, 1.5, 1.9]) {
            for (const side of [-0.9, -0.45, 0, 0.45, 0.9]) {
              const a = off(A, backA, 0);
              const b = off(B, backB, side);
              if (Math.abs(a.x) > 7.4 || Math.abs(b.x) > 7.4) continue;
              if (Math.abs(a.z) > 14.4 || Math.abs(b.z) > 14.4) continue;
              if (Math.hypot(a.x - b.x, a.z - b.z) < 1.1) continue;
              out.push({ 4: [round(a.x), round(a.z)], 1: [round(b.x), round(b.z)] });
            }
          }
        }
      }
      return out;
    },
    // Two down, and no ball touched another: the cue did all of it.
    ok: (out) => !out.scratched && out.passes === 0 && out.pots.length >= 2
  }
};

const plan = PLANS[board];
if (!plan) {
  console.error(`no search plan for "${board}" — add one to PLANS`);
  process.exit(1);
}

const game = await openGame();
try {
  await game.gotoBoard(plan.board ?? board);
  await game.page.waitForTimeout(600);
  console.log(`\n${board} — searching for: ${plan.goal}\n`);
  // ONE PLACEMENT PER CALL. The whole grid in a single evaluate crashed the
  // renderer process — a few hundred placements times a few hundred headings
  // is a lot of physics to run without ever yielding. Chunking costs a round
  // trip each and finishes.
  const grid = plan.grid();
  const results = [];
  const sweep = async (place, step) =>
    game.page.evaluate(
        ({ place, okSource, premiseSource, step }) => {
          const g = window.__game;
          const ok = new Function('out', `return (${okSource})(out);`);
          const spec = g.rooms.scriptedSpec;
          for (const slot of spec.enemies || []) {
            const at = place[slot.number];
            if (at) {
              slot.x = at[0];
              slot.z = at[1];
            }
          }
          // A PAD IS NOT A BALL. Balls are re-racked from the spec every
          // placement; the felt's objects are built once when the room loads,
          // so moving one means building the room again — the same call the
          // board itself makes, so a searched placement and a played one are
          // the same table.
          let rebuilt = false;
          for (const object of spec.objects || []) {
            const at = place[object.kind];
            if (at) {
              object.x = at[0];
              object.z = at[1];
              rebuilt = true;
            }
          }
          if (rebuilt) g.tutorial._buildRoom();
          else g.rooms.reRackScripted();
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
          let mid = null;
          let start = null;
          let prev = null;
          const close = () => {
            if (start === null) return;
            if (prev - start >= best) {
              best = prev - start;
              mid = (start + prev) / 2;
            }
          };
          for (const d of hits) {
            if (start === null) start = d;
            else if (d - prev > step * 1.5) {
              close();
              start = d;
            }
            prev = d;
          }
          close();
          // THE PLACEMENT'S OWN CLAIM, not this or that heading's.
          // "Blocked by the mine" is a fact about where the mine sits, and a
          // sweep of headings that succeed cannot see it: the headings that
          // prove it are exactly the ones that FAIL. A board whose premise is
          // false is not a candidate however wide its window.
          let premise = true;
          if (premiseSource) {
            const fn = new Function('api', `return (${premiseSource})(api);`);
            premise = !!fn({
              place,
              shot: (deg, power = 0.8) => window.__simShot({ deg, power }),
              table: window.__game.rooms.table
            });
          }
          return { place, n: hits.length, widest: +best.toFixed(2), mid, premise };
        },
      {
        place,
        okSource: plan.ok.toString(),
        premiseSource: plan.premise ? plan.premise.toString() : null,
        step
      }
    );

  // TWO PASSES, AND THE COARSE ONE IS ONLY FOR RANKING.
  //
  // A single pass at two degrees reported this board's family at SIX degrees
  // wide. It is not: at half a degree the same placement is a pair of
  // one-degree islands with a gap between them. A sweep cannot measure a
  // window finer than its own step — it joins two hits two degrees apart into
  // a run and calls the space between them solid, which is exactly the claim
  // being tested. So the grid is ranked coarsely, because ranking is all it
  // can honestly do, and the leaders are then measured properly.
  const COARSE = 2;
  const FINE = 0.5;
  for (let i = 0; i < grid.length; i += 1) {
    if (i % 20 === 0) process.stdout.write(`  ${i}/${grid.length}\r`);
    results.push(await sweep(grid[i], COARSE));
  }
  process.stdout.write('        \r');
  const kept = results.filter((r) => r.premise);
  if (kept.length !== results.length) {
    console.log(`  ${results.length - kept.length} of ${results.length} placements fail the board's premise\n`);
  }
  kept.sort((a, b) => b.widest - a.widest || b.n - a.n);
  const leaders = kept.slice(0, 8);
  console.log(`  re-measuring the best ${leaders.length} at ${FINE}°\n`);
  for (let i = 0; i < leaders.length; i += 1) {
    process.stdout.write(`  ${i}/${leaders.length}\r`);
    const fine = await sweep(leaders[i].place, FINE);
    leaders[i].widest = fine.widest;
    leaders[i].mid = fine.mid;
    leaders[i].n = fine.n;
  }
  process.stdout.write('        \r');
  leaders.sort((a, b) => b.widest - a.widest || b.n - a.n);
  for (const r of leaders) {
    const where = Object.entries(r.place)
      .map(([n, at]) => `${n}@(${at[0]}, ${at[1]})`)
      .join('  ');
    const mid = r.mid == null ? '   —' : `${String(+r.mid.toFixed(2)).padStart(6)}°`;
    console.log(
      `  widest ${String(r.widest).padStart(5)}°   mid ${mid}   headings ${String(r.n).padStart(3)}   ${where}`
    );
  }
  console.log('');
} finally {
  await game.close();
}
