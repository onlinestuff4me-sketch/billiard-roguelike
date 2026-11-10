/**
 * clips.mjs — the polish plan's review clips: each moment recorded twice from
 * the real game on virtual time, once as it is today and once with its
 * prototype switched on (src/ui/Polish.js).
 *
 *   npx vite build && node tools/capture/clips.mjs <outdir> [name...]
 *
 * Writes <name>-now.mp4, <name>-new.mp4, a poster each, and <name>.json: every
 * sound the game played during the clip with its time, so the review page can
 * play today's sounds or the proposed ones in step with the picture.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { open, RETURNING } from './lib.mjs';

const [out, ...only] = process.argv.slice(2);
mkdirSync(out, { recursive: true });

async function boot(polish = {}, o = {}) {
  const cap = await open({ storage: { ...RETURNING, 'lightline-polish-v1': polish, ...(o.storage || {}) }, ...o });
  cap.logAudio = () =>
    cap.ev(() => {
      const a = window.__run.sys.audio;
      window.__audioLog = [];
      if (a.__logged) return;
      a.__logged = true;
      const names = new Set([...Object.getOwnPropertyNames(Object.getPrototypeOf(a)), 'uiTick', 'rezTick', 'targetBeaten']);
      for (const k of names) {
        if (k === 'constructor' || k.startsWith('_') || ['update', 'resume', 'setMuted', 'tone', 'noise', 'duck', 'init', 'ensure', 'unlock', 'setTimeScale', 'setSlowMo', 'setTimeDilation', 'chainNote'].includes(k)) continue;
        const f = a[k];
        if (f && typeof f !== 'function') continue;
        a[k] = function (...args) {
          window.__audioLog.push({ t: performance.now(), name: k, args: args.filter((v) => typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean').slice(0, 3) });
          return f ? f.apply(this, args) : undefined;
        };
      }
    });
  cap.start = async () => {
    await cap.run(1800);
    await cap.ev(() => document.getElementById('btn-play').click());
    await cap.run(900);
    await cap.ev(() => document.getElementById('play-continue').click());
    await cap.run(1200);
    await cap.logAudio();
  };
  cap.until = async (fn, max = 15000) => {
    for (let t = 0; t < max; t += 33) {
      if (await cap.ev(fn)) return true;
      await cap.run(33.34);
    }
    return false;
  };
  cap.load = (n) => cap.ev((l) => window.__run.load(l), n);
  // shots go through the game's own release path (window.__run.strike); a real
  // touch cannot be delivered while the virtual clock is paused between frames
  cap.shoot = (deg, power = 1) => cap.ev(([d, p]) => window.__run.strike(d, p), [deg, power]);
  /** Record, and save the sounds played during it (times from the clip's start, in seconds). */
  cap.clip = async (name, ms, o2 = {}) => {
    const t0 = await cap.ev(() => { window.__audioLog = []; return performance.now(); });
    await cap.record(`${out}/${name}.mp4`, ms, { poster: `${out}/${name}.jpg`, ...o2 });
    const log = await cap.ev((t) => window.__audioLog.map((e) => ({ ...e, t: +((e.t - t) / 1000).toFixed(3) })), t0);
    return log;
  };
  return cap;
}

/** Table px for a crop centred on a table point. */
async function cropAt(cap, x, z, w, h) {
  const p = await cap.ev(([a, b]) => window.__run.px(a, b), [x, z]);
  const cx = Math.round(Math.min(Math.max(p.x - w / 2, 0), cap.width - w));
  const cy = Math.round(Math.min(Math.max(p.y - h / 2, 0), cap.height - h));
  return { x: cx, y: cy, w, h };
}

const CLIPS = {
  // a full-power bank on Table 1: two rails, then the 8 down
  rail: { polish: { rail: 'run' }, async play(cap) {
    await cap.start(); await cap.load(1); await cap.run(400);
    await cap.shoot(290, 1);
    return cap.clip(this.file, 5200, { crop: await cropAt(cap, 0, -3, 390, 560) });
  } },
  // a straight pot of the 1 on Table 1
  pocket: { polish: { pocket: 'gulp' }, async play(cap) {
    await cap.start(); await cap.load(1); await cap.run(400);
    await cap.shoot(63, 0.7);
    await cap.until(() => window.__game.launchHits > 0);
    return cap.clip(this.file, 3600, { crop: await cropAt(cap, 7.2, 0.4, 240, 240) });
  } },
  contact: { polish: { contact: 'snap' }, async play(cap) {
    await cap.start(); await cap.load(1); await cap.run(400);
    await cap.shoot(63, 0.7);
    await cap.until(() => { const c = window.__run.cue(); const b = window.__game.enemies.find((e) => e.number === 1); return Math.hypot(c.x - b.x, c.z - b.z) < 4.2; });
    return cap.clip(this.file, 3000, { crop: await cropAt(cap, 4.9, 3.4, 300, 300) });
  } },
  rack: { polish: { rack: 'rez' }, async play(cap) {
    await cap.start(); await cap.load(13); await cap.run(300);
    await cap.ev(() => window.__run.intro());
    return cap.clip(this.file, 2200);
  } },
  idle: { polish: { idle: 'breathe' }, async play(cap) {
    await cap.start(); await cap.load(5); await cap.run(1200);
    return cap.clip(this.file, 7000, { crf: 30 });
  } },
  target: { polish: { target: 'beat' }, async play(cap) {
    await cap.start(); await cap.load(1); await cap.run(400);
    await cap.shoot(290, 1);
    await cap.until(() => window.__game.rules.roomScore > 0, 30000);
    return cap.clip(this.file, 5000, { crop: { x: 0, y: 0, w: 390, h: 280 } });
  } },
  flash: { polish: { flash: 'soft' }, async play(cap) {
    await cap.start(); await cap.load(1); await cap.run(600);
    await cap.shoot(0, 1);
    return cap.clip(this.file, 2000, { crop: await cropAt(cap, 0, 3, 390, 560) });
  } },
  menu: { polish: { menu: 'boot' }, async play(cap) {
    await cap.run(300);
    const log = [];
    await cap.record(`${out}/${this.file}.mp4`, 3800, { poster: `${out}/${this.file}.jpg`, posterAt: 0.4, onFrame: async (i) => {
      if (i === 54) await cap.ev(() => { const b = document.getElementById('btn-play'); b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); setTimeout(() => b.click(), 120); });
    } });
    return log;
  } }
};

for (const [name, def] of Object.entries(CLIPS)) {
  if (only.length && !only.includes(name)) continue;
  const logs = {};
  for (const ver of ['now', 'new']) {
    const cap = await boot(ver === 'new' ? def.polish : {});
    def.file = `${name}-${ver}`;
    logs[ver] = await def.play(cap);
    if (cap.errors.length) console.log(name, ver, 'errors', cap.errors);
    await cap.close();
  }
  writeFileSync(`${out}/${name}.json`, JSON.stringify(logs));
  console.log(name, 'done', (logs.now || []).length, (logs.new || []).length);
}
