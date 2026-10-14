/**
 * find-object.mjs — move one felt object of an authored table over a grid and
 * report, for each spot, the shots from the opening position that run the
 * cue ball through it AND pot a ball: the widest such run, and how many
 * different balls can be potted that way. Used to place the green ring.
 *
 *   node tools/find-object.mjs <table> <object index> x0 x1 z0 z1 [--step=1.2] [--port=4511]
 */
import { openGame } from './sim.mjs';
import { readFileSync } from 'node:fs';
const [table, idx, x0, x1, z0, z1] = process.argv.slice(2, 8).map(Number);
const opt = (k, d) => Number((process.argv.find((a) => a.startsWith(`--${k}=`)) || `=${d}`).split('=')[1]);
const step = opt('step', 1.2);
const base = JSON.parse(readFileSync(new URL('../src/data/tables.json', import.meta.url))).tables[table - 1];
const game = await openGame({ port: opt('port', 4511) });
const out = await game.page.evaluate(({ base, idx, x0, x1, z0, z1, step, table }) => {
  const res = [];
  for (let x = x0; x <= x1 + 1e-6; x += step)
    for (let z = z0; z <= z1 + 1e-6; z += step) {
      const spec = JSON.parse(JSON.stringify(base));
      spec.objects[idx].x = +x.toFixed(2);
      spec.objects[idx].z = +z.toFixed(2);
      window.__run.loadSpec(spec, table);
      const runs = window.__runOpeners({ step: 1, powers: [0.6, 0.85, 1] }).filter((r) => r.green && r.width >= 2);
      if (!runs.length) continue;
      const balls = new Set(runs.map((r) => r.pots));
      res.push({ x: +x.toFixed(2), z: +z.toFixed(2), widest: runs[0].width, balls: [...balls].join(' '), lines: runs.length, bestPaid: Math.max(...runs.map((r) => r.paid)) });
    }
  return res.sort((a, b) => b.balls.split(' ').length - a.balls.split(' ').length || b.widest - a.widest).slice(0, 12);
}, { base, idx, x0, x1, z0, z1, step, table });
for (const r of out) console.log(JSON.stringify(r));
await game.close();
process.exit(0);
