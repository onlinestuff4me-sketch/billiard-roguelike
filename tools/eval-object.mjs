/**
 * eval-object.mjs — for each candidate spot of one felt object, plan a whole
 * table (the tuner's robust beam search: every shot at least 3° wide) and
 * report the line's score and how many of its shots used the object (for the
 * green ring: rolled through it before a ball dropped).
 *
 *   node tools/eval-object.mjs <table> <object index> "x,z;x,z;..." [--port=4551]
 */
import { openGame } from './sim.mjs';
import { readFileSync } from 'node:fs';
const [table, idx] = process.argv.slice(2, 4).map(Number);
const spots = process.argv[4].split(';').map((p) => p.split(',').map(Number));
const opt = (k, d) => Number((process.argv.find((a) => a.startsWith(`--${k}=`)) || `=${d}`).split('=')[1]);
const base = JSON.parse(readFileSync(new URL('../src/data/tables.json', import.meta.url))).tables[table - 1];
const game = await openGame({ port: opt('port', 4551) });
for (const [x, z] of spots) {
  const r = await game.page.evaluate(({ base, idx, x, z, table }) => {
    const spec = JSON.parse(JSON.stringify(base));
    spec.objects[idx].x = x;
    spec.objects[idx].z = z;
    window.__run.loadSpec(spec, table);
    const plan = window.__runPlan({ step: 1, powers: [0.6, 0.85, 1], beam: 3, minWidth: 3 });
    const top = plan.best[0];
    if (!top) return { x, z, line: null };
    return { x, z, filled: top.filled, total: top.total, greens: top.line.filter((s) => s.green).length, line: top.line.map((s) => `${s.deg}@${s.power}[${s.width}]→${s.pots.join('+') || '-'}${s.green ? '×2' : ''}=${s.paid}`).join('  ') };
  }, { base, idx, x, z, table });
  console.log(JSON.stringify(r));
}
await game.close();
process.exit(0);
