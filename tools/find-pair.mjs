/**
 * find-pair.mjs — search for a two-balls-in-one-shot set-up: two balls near a
 * pocket placed so that one stroke from the cue sinks both, in a run of
 * headings wide enough to aim. Used to build the combo tables.
 *
 *   node tools/find-pair.mjs --pocket=ml|mr [--port=4473]
 */
import { openGame } from './sim.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => (args.find((a) => a.startsWith(`--${k}=`)) || `=${d}`).split('=')[1];
const side = opt('pocket', 'ml');
const game = await openGame({ port: Number(opt('port', 4473)) });
const out = await game.page.evaluate((side) => {
  const sx = side === 'ml' ? -1 : 1;
  const res = [];
  for (const ax of [6.2, 6.7, 7.2])
    for (const az of [-0.6, 0.0, 0.7, 1.4])
      for (const dx of [1.3, 1.6, 2.0])
        for (const dz of [-0.6, 0.0, 0.5, 1.0]) {
          const spec = {
            id: 'pair', name: 'pair', spawn: { x: 0, z: 11 }, strokes: 3, target: 1,
            rack: [
              { number: 2, x: sx * ax, z: az },
              { number: 1, x: sx * (ax - dx), z: az + dz }
            ]
          };
          window.__run.loadSpec(spec, 1);
          const runs = side === 'ml' ? window.__runOpeners({ step: 1, powers: [0.7, 1], from: 270, to: 345 }) : window.__runOpeners({ step: 1, powers: [0.7, 1], from: 15, to: 90 });
          const two = runs.filter((r) => r.pots.split(',').length === 2);
          const best = two[0];
          if (best) res.push({ a: [sx * ax, az], b: [sx * (ax - dx), az + dz], width: best.width, from: best.from, to: best.to, power: best.power, paid: best.paid });
        }
  return res.sort((a, b) => b.width - a.width).slice(0, 12);
}, side);
for (const r of out) console.log(JSON.stringify(r));
await game.close();
process.exit(0);
