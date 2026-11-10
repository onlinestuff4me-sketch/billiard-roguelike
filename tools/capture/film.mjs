/** film.mjs — exploratory filmstrips of real play, for the review. node tools/capture/film.mjs <outdir> <scenario> */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { open, RETURNING } from './lib.mjs';
const [out, scenario = 'pot', ...rest] = process.argv.slice(2);
export async function boot(o = {}) {
  const cap = await open({ storage: { ...RETURNING, ...(o.storage || {}) }, ...o });
  await cap.run(2000);
  await cap.ev(() => document.getElementById('btn-play').click());
  await cap.run(900);
  await cap.ev(() => document.getElementById('play-continue').click());
  await cap.run(1500);
  await cap.ev(readFileSync(new URL('../harness.js', import.meta.url), 'utf8'));
  await cap.ev(() => { window.__game.headless = false; });
  /** thumb-shoot: set the heading, then a real touch drawing back along it. */
  cap.shoot = async (deg, power = 1, o2 = {}) => {
    await cap.ev((d) => window.__run.aim(d), deg);
    const th = (deg * Math.PI) / 180;
    const pad = 150 * power * (o2.gain ?? 1);
    const a = o2.from || { x: cap.width / 2, y: cap.height * 0.55 };
    const b = { x: a.x - Math.sin(th) * pad, y: a.y + Math.cos(th) * pad };
    await cap.drag(a, b, o2.ms ?? 500, o2.release ?? true, o2.hold ?? 250);
  };
  cap.strip = async (name, ms, fps = 5, cols = 8) => {
    const dir = `${out}/_${name}`;
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    const n = Math.round((ms / 1000) * fps);
    for (let i = 0; i < n; i++) {
      await cap.run(1000 / fps);
      await cap.shot(`${dir}/f${String(i).padStart(4, '0')}.jpg`, 70);
    }
    const rows = Math.ceil(n / cols);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${dir}/f%04d.jpg`, '-vf', `scale=234:-1,tile=${cols}x${rows}`, '-q:v', '5', `${out}/${name}.jpg`]);
    rmSync(dir, { recursive: true, force: true });
  };
  return cap;
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const cap = await boot();
  if (scenario === 'pot') {
    const level = Number(rest[0] || 1);
    await cap.ev((l) => window.__run.load(l), level);
    await cap.run(300);
    const op = await cap.ev(() => window.__runOpeners({ step: 2, powers: [0.7, 1] }).slice(0, 6));
    console.log(op);
    const pick = rest[1] ? { from: +rest[1], to: +rest[1], power: +rest[2] } : op[0];
    await cap.ev((l) => { window.__game.headless = false; window.__run.load(l); }, level);
    await cap.run(600);
    await cap.shot(`${out}/pot${level}-rest.jpg`);
    await cap.shoot((pick.from + pick.to) / 2, pick.power, { release: false });
    await cap.shot(`${out}/pot${level}-aim.jpg`);
    await cap.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await cap.strip(`pot${level}-a`, 1600, 15, 8);
    await cap.strip(`pot${level}-b`, 12000, 4, 8);
    console.log(await cap.ev(() => ({ phase: __game.phase, score: __game.rules.roomScore, power: 1 })));
  }
  if (scenario === 'clear') {
    await cap.tap(195, 480);
    await cap.run(1500);
    await cap.ev(() => window.__demo.clear());
    await cap.strip('clear-a', 14000, 2, 7);
    await cap.ev(() => { const b = [...document.querySelectorAll('button')].find((n) => /go to shop/i.test(n.textContent) && n.offsetParent); if (b) b.click(); });
    await cap.strip('shop-a', 1750, 4, 7);
    await cap.ev(() => { const b = [...document.querySelectorAll('button')].find((n) => /^\s*buy/i.test(n.textContent) && n.offsetParent); if (b) b.click(); });
    await cap.strip('shop-buy', 1750, 4, 7);
    await cap.ev(() => { const b = [...document.querySelectorAll('button')].find((n) => /next table/i.test(n.textContent) && n.offsetParent); if (b) b.click(); });
    await cap.strip('next-a', 5250, 4, 7);
  }
  if (scenario === 'fail') {
    await cap.ev(() => { window.__run.load(2); });
    await cap.run(500);
    await cap.ev(() => window.__demo.clear(true));
    await cap.strip('fail-a', 10000, 4, 8);
  }
  if (scenario === 'scratch') {
    await cap.ev(() => { window.__run.load(3); });
    await cap.run(500);
    await cap.ev(() => window.__demo.scratch());
    await cap.strip('scratch-a', 6000, 6, 8);
  }
  if (scenario === 'menu') {
    await cap.close();
    const c2 = await open({ storage: RETURNING });
    Object.assign(cap, c2);
    cap.strip = cap.strip.bind(cap);
    await cap.strip('home-a', 4000, 6, 8);
    await cap.ev(() => document.getElementById('btn-play').click());
    await cap.strip('home-b', 1500, 12, 8);
    await cap.ev(() => document.getElementById('play-continue').click());
    await cap.strip('home-c', 3000, 8, 8);
    await cap.tap(195, 480);
    await cap.strip('home-d', 2500, 8, 8);
  }
  console.log(cap.errors);
  await cap.close();
}
