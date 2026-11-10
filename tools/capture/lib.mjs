/**
 * capture/lib.mjs — record the real game on a STEPPED CLOCK, so a clip plays
 * evenly however slowly a headless GPU draws each frame.
 *
 * The page's clock is replaced before the game loads: performance.now,
 * Date.now, setTimeout / setInterval and requestAnimationFrame all run off one
 * counter that only moves when the recorder steps it, and every CSS or WAAPI
 * animation is paused and positioned from the same counter. One step is one
 * frame: timers due in it fire in order, the game's frame runs once, the
 * animations move, and then a screenshot is taken. Frames go to JPEGs and
 * ffmpeg makes the clip.
 *
 * (Chromium's own virtual time, CDP Emulation.setVirtualTimePolicy, was tried
 * first: with WebGL frames in play it stalls waiting on a compositor frame
 * that is itself waiting on the clock.)
 *
 *   const cap = await open({ width: 390, height: 780 });
 *   await cap.run(1500);                    // let time pass, no recording
 *   await cap.record('out.mp4', 4000, { onFrame });   // 4 s at 30 fps
 */
import { spawn, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startPreview, browserPath } from '../sim.mjs';

const require = createRequire(import.meta.url);

export async function open(opts = {}) {
  const port = opts.port ?? 4173;
  const { url, server } = await startPreview(port);
  const { chromium } = require('playwright');
  const browser = await chromium.launch({
    executablePath: browserPath(),
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
  });
  const width = opts.width ?? 390;
  const height = opts.height ?? 780;
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: opts.scale ?? 1,
    hasTouch: true,
    isMobile: true
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message)));
  await page.addInitScript((storage) => {
    for (const k of ['setValueAtTime', 'exponentialRampToValueAtTime', 'linearRampToValueAtTime']) {
      const f = AudioParam.prototype[k];
      AudioParam.prototype[k] = function (v, t) {
        try {
          return f.call(this, v, t);
        } catch {
          return this;
        }
      };
    }
    try {
      for (const [k, v] of Object.entries(storage || {})) localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
    } catch {
      /* no storage */
    }
    // THE STEPPED CLOCK (see the header).
    {
      const realSetTimeout = window.setTimeout.bind(window);
      let now = 1000;
      const epoch = Date.now();
      let seq = 0;
      let timers = [];
      let frames = [];
      const tracked = new WeakMap();
      performance.now = () => now;
      Date.now = () => epoch + now;
      window.setTimeout = (fn, ms = 0, ...args) => {
        const id = ++seq;
        timers.push({ id, at: now + Math.max(0, +ms || 0), fn, args });
        return id;
      };
      window.setInterval = (fn, ms = 0, ...args) => {
        const id = ++seq;
        timers.push({ id, at: now + Math.max(1, +ms || 0), fn, args, every: Math.max(1, +ms || 0) });
        return id;
      };
      window.clearTimeout = window.clearInterval = (id) => {
        timers = timers.filter((t) => t.id !== id);
      };
      window.requestAnimationFrame = (cb) => {
        const id = ++seq;
        frames.push({ id, cb });
        return id;
      };
      window.cancelAnimationFrame = (id) => {
        frames = frames.filter((f) => f.id !== id);
      };
      const call = (fn, args) => {
        try {
          if (typeof fn === 'function') fn(...args);
        } catch (e) {
          realSetTimeout(() => {
            throw e;
          }, 0);
        }
      };
      const breathe = () => new Promise((r) => r());
      /** Position every animation on the page from the stepped clock. */
      const syncAnimations = () => {
        for (const a of document.getAnimations()) {
          let t = tracked.get(a);
          if (!t) {
            if (a.playState === 'finished' || a.playState === 'idle') continue;
            t = { start: now - (Number(a.currentTime) || 0) };
            tracked.set(a, t);
            try {
              a.pause();
            } catch {
              continue;
            }
          }
          if (t.done) continue;
          const end = a.effect?.getComputedTiming?.().endTime;
          const at = (now - t.start) * (a.playbackRate || 1);
          try {
            if (Number.isFinite(Number(end)) && at >= Number(end)) {
              t.done = true;
              a.finish();
            } else a.currentTime = at;
          } catch {
            /* an animation whose target has gone */
          }
        }
      };
      window.__clock = {
        get now() {
          return now;
        },
        /** One frame: timers due within `ms`, in order; then the frame callbacks; then the animations. */
        async step(ms) {
          const target = now + ms;
          for (let guard = 0; guard < 5000; guard++) {
            let next = null;
            for (const t of timers) if (t.at <= target && (!next || t.at < next.at || (t.at === next.at && t.id < next.id))) next = t;
            if (!next) break;
            now = Math.max(now, next.at);
            if (next.every) next.at += next.every;
            else timers = timers.filter((t) => t !== next);
            call(next.fn, next.args);
            await breathe();
            syncAnimations();
          }
          now = target;
          const run = frames;
          frames = [];
          for (const f of run) call(f.cb, [now]);
          await breathe();
          await breathe();
          syncAnimations();
        }
      };
    }
    // Every AudioManager call, with the virtual time it happened at (for lining sound up with a clip).
    window.__audioLog = [];
  }, opts.storage || {});
  await page.goto(url + (opts.query || ''), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts?.ready);
  const cdp = await context.newCDPSession(page);

  /** Step the clock by `ms` as one frame. */
  const advance = (ms) => page.evaluate((m) => window.__clock.step(m), ms);
  /** Let `ms` pass, a frame at a time, so the game keeps stepping. */
  async function run(ms) {
    for (let t = 0; t < ms - 1; t += 1000 / 30) await advance(Math.min(1000 / 30, ms - t));
  }

  async function shot(file, quality = 88) {
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality, optimizeForSpeed: true });
    writeFileSync(file, Buffer.from(data, 'base64'));
  }

  /**
   * Record `ms` of virtual time to `out` (mp4, h264). `onFrame(i, tMs)` runs
   * before each frame is granted its time, for staged input.
   */
  async function record(out, ms, o = {}) {
    const fps = o.fps ?? 30;
    const dir = join(process.env.CAPTURE_TMP || tmpdir(), `cap-${process.pid}-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const n = Math.round((ms / 1000) * fps);
    for (let i = 0; i < n; i++) {
      if (o.onFrame) await o.onFrame(i, (i * 1000) / fps);
      await advance(1000 / fps);
      await shot(join(dir, `f${String(i).padStart(5, '0')}.jpg`));
    }
    const vf = [];
    if (o.crop) vf.push(`crop=${o.crop.w}:${o.crop.h}:${o.crop.x}:${o.crop.y}`);
    if (o.width) vf.push(`scale=${o.width}:-2:flags=lanczos`);
    vf.push('pad=ceil(iw/2)*2:ceil(ih/2)*2');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', join(dir, 'f%05d.jpg'), '-vf', vf.join(','), '-c:v', 'libx264', '-preset', 'slow', '-crf', String(o.crf ?? 27), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', out]);
    if (o.poster) execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', join(dir, `f${String(Math.min(n - 1, Math.round((o.posterAt ?? 0.5) * n))).padStart(5, '0')}.jpg`), ...(vf.length ? ['-vf', vf.join(',')] : []), '-q:v', '5', o.poster]);
    rmSync(dir, { recursive: true, force: true });
    return n;
  }

  return {
    page,
    cdp,
    errors,
    run,
    shot,
    record,
    advance,
    width,
    height,
    ev: (fn, arg) => page.evaluate(fn, arg),
    async close() {
      await browser.close();
      if (server) server.kill();
    }
  };
}

/** Storage for a returning player: lessons done, nothing first-time left to teach. */
export const RETURNING = {
  'billiard-tutorial-done-v3': '1',
  'lightline-stats-optout': '1',
  'lightline-freeze-taught-v1': '1',
  'lightline-reached-v1': '13',
  // every achievement already earned, so none pops over a clip
  'lightline-achievements-v1': ['lessons', 'table1', 'bank', 'assist', 'inone', 'zone', 'buy', 'freeze', 'big', 'order', 'table6', 'table12']
};
