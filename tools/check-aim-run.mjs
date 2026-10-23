#!/usr/bin/env node
/**
 * check-aim-run — the aim line's promise, on the twelve RUN tables.
 *
 *   node tools/check-aim-run.mjs                 every table, 4° and three powers
 *   node tools/check-aim-run.mjs --step 2 --tables 1,4,7
 *   node tools/check-aim-run.mjs --mode frame120 every stroke stepped at 120 fps
 *
 * Reported as: "50% of the time or more, when a line said a ball was going to
 * sink into a pocket, the ball actually went at a different angle after being
 * hit and never went into the pocket."
 *
 * check-aim holds the preview to the table on the two LESSON boards. The run
 * tables are where players spend their time, and they carry things the
 * lessons do not: rings, mines, bumpers, portals, pick-ups, three or more
 * balls. This plays the heading the preview drew, the way a frame of the game
 * plays it, and compares the two verdicts a player reads a line for:
 *
 *   SCRATCH    did the cue ball go down, and did the line say so
 *   POTS       which balls went in which pockets, and did the line say so
 *
 * Modes (how a stroke is stepped):
 *   frame60    whole frames at 60 fps, entities updated as main.js does (default)
 *   frame120   the same at 120 fps (a ProMotion phone)
 *   slow       60 fps with the score feed's slow motion: every frame's dt
 *              scaled by 0.2, as the table plays under a held plate
 */

import { openGame } from './sim.mjs';

const arg = (name, fallback) => {
  const at = process.argv.indexOf(`--${name}`);
  return at > 0 && process.argv[at + 1] ? process.argv[at + 1] : fallback;
};
const STEP = Number(arg('step', 4));
const MODE = arg('mode', 'frame60');
const POWERS = arg('powers', '0.5,0.75,1').split(',').map(Number);
const TABLES = arg('tables', '1,2,3,4,5,6,7,8,9,10,11,12').split(',').map(Number);
const FLOOR = Number(arg('floor', 100));

const game = await openGame({ port: Number(arg('port', 4173)) });
let total = 0;
let agree = 0;
let claimed = 0;
let kept = 0;
const misses = [];

try {
  for (const level of TABLES) {
    const r = await game.page.evaluate(
      ({ level, step, powers, mode }) => {
        const G = window.__game;
        window.__run.load(level);
        const P = G.player;
        const snap = {
          balls: G.rooms.scriptedEnemies.filter((e) => e.alive && Number.isFinite(e.slotIndex)).map((e) => ({ index: e.slotIndex, x: e.x, z: e.z })),
          px: P.x,
          pz: P.z,
          armed: G.rooms.table.objects.map((o) => o.armed)
        };
        const restore = () => {
          G.rooms.restoreScripted(snap.balls);
          G.rooms.rack = G.rooms.scriptedEnemies;
          G.rooms.table.objects.forEach((o, i) => (o.armed = snap.armed[i]));
          G.rooms.table.rearmBoard?.();
          P.placeAt(snap.px, snap.pz);
          P.vx = 0;
          P.vz = 0;
          G.midStroke = false;
          G.phase = 'aim';
        };
        const potsOf = (list) => list.filter((p) => p.n != null && p.slot).map((p) => `${p.n}@${p.slot}`).sort().join(',');
        const dt = mode === 'frame120' ? 1 / 120 : 1 / 60;
        const scale = mode === 'slow' ? 0.2 : 1;
        const out = { total: 0, agree: 0, claimed: 0, kept: 0, misses: [] };
        for (const power of powers) {
          for (let deg = 0; deg < 360; deg += step) {
            restore();
            const promise = window.__aim(deg, power);
            const said = potsOf(promise.legs.map((l) => ({ n: l.number, slot: l.potted })));
            const saidScratch = !!promise.cue.scratch;
            const got = { pots: [], scratched: false };
            const real = { scratch: G.on.scratch, potted: G.on.potted };
            G.on.scratch = (p) => {
              got.scratched = true;
              return real.scratch(p);
            };
            G.on.potted = (p) => {
              got.pots.push({ n: p.ball.number ?? null, slot: p.pocket.slot });
              return real.potted(p);
            };
            P.scratchGuard = 0;
            const th = (deg * Math.PI) / 180;
            P.launch({ dirX: Math.sin(th), dirZ: -Math.cos(th), power, valid: true }, G);
            G.midStroke = true;
            G.phase = 'resolve';
            // a frame's time, spent in the table's own fixed steps (main.js simulate)
            const frames = Math.ceil(16 / (dt * scale));
            let acc = 0;
            for (let i = 0; i < frames; i++) {
              acc += dt * scale;
              while (acc >= window.__run.stepSize * (1 - 1e-9)) {
                window.__run.step(1);
                acc -= window.__run.stepSize;
              }
              const moving = (P.alive && (P.vx !== 0 || P.vz !== 0)) || (G.enemies || []).some((e) => e.alive && (e.vx !== 0 || e.vz !== 0));
              if (!moving && i > 30) break;
            }
            Object.assign(G.on, real);
            const did = potsOf(got.pots);
            const ok = did === said && got.scratched === saidScratch;
            out.total += 1;
            if (ok) out.agree += 1;
            if (said) {
              out.claimed += 1;
              if (did === said && !got.scratched) out.kept += 1;
            }
            if (!ok && out.misses.length < 6) out.misses.push(`T${level} ${deg}° @${power}  drawn ${saidScratch ? 'SCRATCH ' : ''}${said || '-'}  →  played ${got.scratched ? 'SCRATCH ' : ''}${did || '-'}`);
          }
        }
        restore();
        return out;
      },
      { level, step: STEP, powers: POWERS, mode: MODE }
    );
    total += r.total;
    agree += r.agree;
    claimed += r.claimed;
    kept += r.kept;
    misses.push(...r.misses);
    const pct = (100 * r.agree) / r.total;
    const kpct = r.claimed ? (100 * r.kept) / r.claimed : 100;
    console.log(`  ${pct >= FLOOR ? '✓' : '✗'} Table ${String(level).padStart(2)}  ${pct.toFixed(1).padStart(5)}% agree  ·  pots promised ${r.claimed}, kept ${kpct.toFixed(1)}%`);
  }
} finally {
  await game.close();
}

console.log(`\n  ${MODE}: ${total} lines drawn and played; ${((100 * agree) / total).toFixed(1)}% agree, and ${claimed ? ((100 * kept) / claimed).toFixed(1) : 100}% of ${claimed} promised pots went in`);
if (misses.length) {
  console.log('\n  where they disagree:');
  for (const m of misses) console.log(`    ${m}`);
}
if ((100 * agree) / total < FLOOR) process.exit(1);
