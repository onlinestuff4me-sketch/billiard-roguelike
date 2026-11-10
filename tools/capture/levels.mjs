/**
 * levels.mjs — for each redesigned table in tools/review/levels.json, record
 * its measured robust line being played: today's layout (t<n>-now) and the
 * proposed one (t<n>-new), in the real game on virtual time.
 *
 *   npx vite build && node tools/capture/levels.mjs <outdir> [table numbers...]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { open, RETURNING } from './lib.mjs';

const [out, ...only] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const levels = JSON.parse(readFileSync(new URL('../review/levels.json', import.meta.url), 'utf8'));
const SECONDS = 12;
const SHOTS = 2;

for (const t of levels.tables) {
  if (t.verdict !== 'redesign' || !t.proposed) continue;
  if (only.length && !only.includes(String(t.n))) continue;
  const logs = {};
  for (const ver of ['now', 'new']) {
    const d = ver === 'now' ? t.current : t.proposed;
    const line = (d.demo || d.robust?.line || d.best?.line || []).slice(0, SHOTS);
    const cap = await open({ storage: RETURNING });
    await cap.run(1800);
    await cap.ev(() => document.getElementById('btn-play').click());
    await cap.run(900);
    await cap.ev(() => document.getElementById('play-continue').click());
    await cap.run(1200);
    if (ver === 'now') await cap.ev((n) => window.__run.load(n), t.n);
    else await cap.ev(([spec, n]) => window.__run.loadSpec(spec, n), [d.spec, t.n]);
    await cap.run(500);
    const rect = await cap.ev(() => { const a = window.__run.px(-10.4, -17.4); const b = window.__run.px(10.4, 17.4); return { x: Math.max(0, Math.round(a.x)), y: Math.max(0, Math.round(a.y)), w: Math.round(b.x - a.x), h: Math.round(b.y - a.y) }; });
    rect.w = Math.min(rect.w, cap.width - rect.x);
    rect.h = Math.min(rect.h, cap.height - rect.y);
    let fired = 0;
    let wait = 12;
    const file = `t${t.n}-${ver}`;
    await cap.record(`${out}/${file}.mp4`, SECONDS * 1000, {
      poster: `${out}/${file}.jpg`, posterAt: 0.02, crop: rect, width: 300, crf: 29,
      onFrame: async (i) => {
        if (wait-- > 0 || fired >= line.length) return;
        const rest = await cap.ev(() => window.__game.phase === 'aim' && !window.__game.midStroke && window.__game.state === 'playing');
        if (!rest) return;
        const s = line[fired++];
        await cap.ev(([deg, power]) => window.__run.strike(deg, power), [s.deg, s.power]);
        wait = 20;
      }
    });
    logs[ver] = [];
    if (cap.errors.length) console.log(file, 'errors', cap.errors);
    console.log(file, 'shots', fired);
    await cap.close();
  }
}
