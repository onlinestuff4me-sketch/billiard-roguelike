#!/usr/bin/env node
/**
 * check-flash — nothing is drawn between the ball dropping and the card turning.
 *
 *   npm run flash
 *
 * WHY THIS EXISTS
 *
 * Reported as: "the flash of the cue guide line after the ball lands in the
 * pocket right as the lesson is ending."
 *
 * It is one frame long, and it is not a race — it happens on every board, in
 * the same place, for a reason that falls out of the order of a frame. The
 * tutorial's clock runs at the TOP of the frame and the table is simulated
 * further down it, so the frame in which the cue ball finally comes to rest is
 * a frame the lesson has already been through believing the shot is still in
 * flight. Everything the resting preview asks for is true in that frame — the
 * board is live, the lesson has not been called, the ball is idle — so it
 * draws a fresh cue line across a finished shot, and the NEXT frame the lesson
 * ends and takes it away again.
 *
 * `Tutorial.resolving` is the missing state: launched, and not yet judged. The
 * check plays a board's own solution and records every call that draws or
 * erases the line, so the one frame is either there or it is not.
 *
 * Reading the RENDERER rather than a flag is the point: the claim is about
 * what is on the felt.
 */

import { startPreview, browserPath } from './sim.mjs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
/** Boards whose solution pots a ball and ends the lesson. */
const BOARDS = ['angle', 'combo', 'bank'];

const fails = [];
const check = (ok, what, detail = '') => {
  console.log(`  ${ok ? '✓' : '✗'} ${what}${detail ? ` — ${detail}` : ''}`);
  if (!ok) fails.push(what);
};

const { url, server } = await startPreview(4187);
const { chromium } = require('playwright');
const browser = await chromium.launch({ executablePath: browserPath() });
const page = await browser.newPage({ viewport: { width: 430, height: 860 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e.message)));

await page.addInitScript(() => {
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
});

try {
  console.log('\n  the last frame of a lesson\n');
  await page.goto(url, { waitUntil: 'networkidle' });
  await wait(1400);
  await page.click('#btn-play');
  await wait(2600);
  await page.mouse.click(215, 430); // any held card
  for (let i = 0; i < 60; i += 1) {
    if (await page.evaluate(() => window.__game.phase === 'aim')) break;
    await wait(250);
  }

  for (const board of BOARDS) {
    await page.evaluate(async (want) => {
      const g = window.__game;
      const at = (g.tutorial?.boards || []).findIndex((b) => b.id === want);
      if (at >= 0 && at !== g.tutorial.index) {
        g.tutorial._enter(at);
        await new Promise((r) => setTimeout(r, 60));
      }
      for (let i = 0; i < 24; i += 1) {
        if (g.tutorial?.lesson?.id === want) return;
        g.tutorial?._advance?.();
        await new Promise((r) => setTimeout(r, 60));
      }
    }, board);
    await wait(1200);

    const solve = await page.evaluate(() => window.__game.tutorial?.lesson?.solve ?? null);
    if (!Number.isFinite(solve)) {
      check(false, `${board} — the board has a stored solution to play`);
      continue;
    }

    // EVERY DRAW, not every frame. Wrapping the two calls that put the line on
    // the felt and take it off again catches a single frame without having to
    // sample fast enough to see one — and a headless frame is slow enough that
    // sampling never would.
    await page.evaluate((deg) => {
      const g = window.__game;
      const p = g.player;
      window.__drawn = [];
      const show = p.showTrajectory.bind(p);
      p.showTrajectory = (...a) => {
        window.__drawn.push({
          resolving: !!g.tutorial?.resolving,
          awaiting: !!g.tutorial?.awaitingNext,
          state: p.state
        });
        return show(...a);
      };
      // The shot goes through the same handler a lifted thumb reaches, so the
      // board is played, not poked: the lesson judges it and ends itself.
      const rad = (deg * Math.PI) / 180;
      g.tutorial.input.handlers.onRelease({
        dirX: Math.sin(rad),
        dirZ: -Math.cos(rad),
        power: 0.85,
        valid: true,
        x: p.x,
        z: p.z
      });
    }, solve);

    // Long enough for the ball to settle, the lesson to judge it, and the card
    // to turn — all three, with room to spare on a slow headless frame.
    await wait(9000);

    const after = await page.evaluate(() => ({
      drawn: window.__drawn,
      done: !!window.__game.tutorial?.awaitingNext
    }));
    const inGap = after.drawn.filter((d) => d.resolving);
    check(after.done, `${board} — the solution ends the lesson`, after.done ? '' : 'the card never turned');
    check(
      inGap.length === 0,
      `${board} — no cue line between the ball dropping and the card turning`,
      inGap.length ? `${inGap.length} frame(s) drew one` : ''
    );

    // Hand the next board a clean page: the CTA is waiting, and the loop above
    // advances from wherever the tutorial actually is.
    await page.evaluate(() => window.__game.tutorial?._advance?.());
    await wait(900);
  }

  check(errors.length === 0, 'no page errors', errors.slice(0, 3).join(' · '));
} finally {
  await browser.close();
  server?.kill();
}

console.log(
  fails.length
    ? `\n${fails.length} of the last frame's promises are not kept: ${fails.join('; ')}\n`
    : '\na finished lesson draws nothing\n'
);
process.exit(fails.length ? 1 : 0);
