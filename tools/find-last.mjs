/**
 * find-last.mjs — where should the LAST ball of an authored table sit?
 *
 * The last ball is played from wherever the cue ball happens to end up, so a
 * good spot is one that can be potted from most of the table, not just from
 * the break. For each candidate spot the table is racked with that ball alone
 * (felt objects, portals and obstacles kept) and the cue ball is put at six
 * places spread over the table; the score is how many of those places have a
 * run of headings at least 3° wide that sinks it, and how wide those runs are.
 *
 *   node tools/find-last.mjs <table> <ball number> x0 x1 z0 z1 [--sx=1.3] [--sz=1.5] [--part=k/n] [--port=4561]
 */
import { openGame } from './sim.mjs';
import { readFileSync } from 'node:fs';
const [table, ballNo, x0, x1, z0, z1] = process.argv.slice(2, 8).map(Number);
const opt = (k, d) => Number((process.argv.find((a) => a.startsWith(`--${k}=`)) || `=${d}`).split('=')[1]);
const [part, parts] = (process.argv.find((a) => a.startsWith('--part=')) || '--part=0/1').slice(7).split('/').map(Number);
const base = JSON.parse(readFileSync(new URL('../src/data/tables.json', import.meta.url))).tables[table - 1];
const CUES = [[-5, 9], [0, 9], [5, 9], [-5, 1], [0, 3], [5, 1]];
const game = await openGame({ port: opt('port', 4561) });
const spots = [];
for (let x = x0; x <= x1 + 1e-6; x += opt('sx', 1.3)) for (let z = z0; z <= z1 + 1e-6; z += opt('sz', 1.5)) spots.push([+x.toFixed(2), +z.toFixed(2)]);
for (const [i, [x, z]] of spots.entries()) {
  if (i % parts !== part) continue;
  const r = await game.page.evaluate(({ base, ballNo, x, z, table, CUES }) => {
    const spec = JSON.parse(JSON.stringify(base));
    spec.rack = spec.rack.filter((b) => b.number === ballNo).map((b) => ({ ...b, x, z }));
    spec.eightLast = false;
    const per = [];
    for (const [cx, cz] of CUES) {
      window.__run.loadSpec(spec, table);
      window.__game.player.placeAt(cx, cz);
      const runs = window.__runOpeners({ step: 1, powers: [0.6, 0.85] }).filter((q) => q.pots && q.width >= 3);
      per.push(runs.length ? Math.max(...runs.map((q) => q.width)) : 0);
    }
    return { x, z, reach: per.filter((w) => w > 0).length, widths: per.join(' '), sum: per.reduce((a, b) => a + b, 0) };
  }, { base, ballNo, x, z, table, CUES });
  console.log(JSON.stringify(r));
}
await game.close();
process.exit(0);
