/**
 * find-spot.mjs — move one ball of an authored table over a grid and report
 * where the widest run of headings sinks it from the opening position.
 *
 *   node tools/find-spot.mjs <table> <ball number> x0 x1 z0 z1 [--step=0.6] [--port=4481]
 */
import { openGame } from './sim.mjs';
import { readFileSync } from 'node:fs';
const [table, ballNo, x0, x1, z0, z1] = process.argv.slice(2, 8).map(Number);
const opt = (k, d) => Number((process.argv.find((a) => a.startsWith(`--${k}=`)) || `=${d}`).split('=')[1]);
const step = opt('step', 0.6);
const tables = JSON.parse(readFileSync(new URL('../src/data/tables.json', import.meta.url))).tables;
const base = tables[table - 1];
const game = await openGame({ port: opt('port', 4481) });
const out = await game.page.evaluate(({ base, ballNo, x0, x1, z0, z1, step, table }) => {
  const res = [];
  for (let x = x0; x <= x1 + 1e-6; x += step)
    for (let z = z0; z <= z1 + 1e-6; z += step) {
      const spec = JSON.parse(JSON.stringify(base));
      spec.rack.find((b) => b.number === ballNo).x = +x.toFixed(2);
      spec.rack.find((b) => b.number === ballNo).z = +z.toFixed(2);
      window.__run.loadSpec(spec, table);
      const runs = window.__runOpeners({ step: 1, powers: [0.7, 1] }).filter((r) => r.pots === String(ballNo));
      if (runs[0]) res.push({ x: +x.toFixed(2), z: +z.toFixed(2), width: runs[0].width, from: runs[0].from, power: runs[0].power, paid: runs[0].paid });
    }
  return res.sort((a, b) => b.width - a.width).slice(0, 10);
}, { base, ballNo, x0, x1, z0, z1, step, table });
for (const r of out) console.log(JSON.stringify(r));
await game.close();
process.exit(0);
