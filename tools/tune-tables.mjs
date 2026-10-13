/**
 * tune-tables.mjs — play every authored run table (src/data/tables.json) with
 * a beam search, in the real game, and report what each one pays.
 *
 *   node tools/tune-tables.mjs [table numbers...] [--step=1] [--beam=5] [--width=3]
 *
 * For each table it reports two lines through the table:
 *   ROBUST  every shot sits in a run of headings at least --width degrees wide
 *           (default 3): a line a new player can actually hit.
 *   BEST    any line at all (1-degree runs): the ceiling.
 * and the table's current target, so the target can be set between them.
 * Run `npm run build` first; this plays the built game.
 */
import { openGame } from './sim.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => {
  const a = args.find((x) => x.startsWith(`--${k}=`));
  return a ? Number(a.split('=')[1]) : d;
};
const only = args.filter((a) => /^\d+$/.test(a)).map(Number);
const step = opt('step', 1);
const beam = opt('beam', 5);
const width = opt('width', 3);

const game = await openGame({ port: opt('port', 4173) });
const tables = await game.page.evaluate(() => window.__runTables?.() || []);
const pick = only.length ? only : tables.map((_, i) => i + 1);
const fmt = (p) => (p ? `${p.filled ? 'clears' : 'short '} ${String(p.total).padStart(5)}  ${p.line.map((s) => `${s.deg}°@${s.power}[${s.width}°]→${s.pots.join('+') || '-'}=${s.paid}`).join('  ')}` : 'no line');
if (args.includes('--openers')) {
  for (const n of pick) {
    const info = await game.page.evaluate((lv) => window.__runLoad(lv), n);
    const runs = await game.page.evaluate((o) => window.__runOpeners(o), { step });
    console.log(`\nTable ${n} · ${info.name} — openers ≥2°:`);
    for (const r of runs.filter((r) => r.width >= 2).slice(0, 14)) console.log(`  ${String(r.width).padStart(3)}°  ${r.from}–${r.to}° @${r.power}  → ${r.pots}  pays ${r.paid}`);
  }
  await game.close();
  process.exit(0);
}
for (const n of pick) {
  const info = await game.page.evaluate((lv) => window.__runLoad(lv), n);
  const robust = await game.page.evaluate((o) => window.__runPlan(o), { step, beam, minWidth: width });
  await game.page.evaluate((lv) => window.__runLoad(lv), n);
  const best = await game.page.evaluate((o) => window.__runPlan(o), { step, beam, minWidth: 0.5 });
  console.log(`\nTable ${n} · ${info.name} · ${info.mission.rack} balls · ${info.mission.strokes} shots · target ${info.target}`);
  console.log(`  ROBUST ${fmt(robust.best[0])}   (${robust.ms} ms)`);
  console.log(`  BEST   ${fmt(best.best[0])}   (${best.ms} ms)`);
}
await game.close();
process.exit(0);
