/**
 * find-object.mjs — move one felt object of an authored table over a grid and
 * report, for each spot, the shots from the opening position that run the
 * cue ball through it AND pot a ball: the widest such run, and how many
 * different balls can be potted that way. Used to place the green ring.
 *
 *   node tools/find-object.mjs <table> <object index> x0 x1 z0 z1 [--step=1.2] [--port=4511] [--part=k/n]
 */
import { openGame } from './sim.mjs';
import { readFileSync } from 'node:fs';
const [table, idx, x0, x1, z0, z1] = process.argv.slice(2, 8).map(Number);
const opt = (k, d) => Number((process.argv.find((a) => a.startsWith(`--${k}=`)) || `=${d}`).split('=')[1]);
const step = opt('step', 1.2);
const base = JSON.parse(readFileSync(new URL('../src/data/tables.json', import.meta.url))).tables[table - 1];
const game = await openGame({ port: opt('port', 4511) });
// one spot per evaluate, printed as it is measured, so a long search that
// dies part way still leaves its results (and can be split with --part=k/n)
const [part, parts] = (process.argv.find((a) => a.startsWith('--part=')) || '--part=0/1').slice(7).split('/').map(Number);
const spots = [];
for (let x = x0; x <= x1 + 1e-6; x += step) for (let z = z0; z <= z1 + 1e-6; z += step) spots.push([+x.toFixed(2), +z.toFixed(2)]);
for (const [i, [x, z]] of spots.entries()) {
  if (i % parts !== part) continue;
  const r = await game.page.evaluate(({ base, idx, x, z, table }) => {
    const spec = JSON.parse(JSON.stringify(base));
    spec.objects[idx].x = x;
    spec.objects[idx].z = z;
    window.__run.loadSpec(spec, table);
    const runs = window.__runOpeners({ step: 1, powers: [0.6, 0.85, 1] }).filter((r) => r.green && r.width >= 2);
    const balls = [...new Set(runs.map((r) => r.pots))];
    return { x, z, widest: runs[0]?.width || 0, balls: balls.join(' '), lines: runs.length, bestPaid: runs.length ? Math.max(...runs.map((r) => r.paid)) : 0, runs: runs.slice(0, 6).map((r) => `${r.pots}@${r.power}[${r.from}-${r.to}]`) };
  }, { base, idx, x, z, table });
  console.log(JSON.stringify(r));
}
await game.close();
process.exit(0);
