#!/usr/bin/env node
/**
 * check-release — letting go must not move the shot.
 *
 *   npm run release
 *
 * WHY THIS EXISTS
 *
 * Reported as: "I line up the shot to hit the ball into the pocket, but then
 * when I release somehow it changes my angle and I miss." The recording shows
 * a line drawn into the top-left pocket and a ball played a whisker wide of
 * it, ending in a scratch.
 *
 * The cause is invisible from the screen and obvious from the event stream: a
 * finger ROLLS as it leaves the glass, so the `pointerup` carries coordinates
 * several pixels from the last `pointermove` — and the release used to track
 * those coordinates and re-derive the heading from them before firing. At a
 * hundred pixels of lever, six pixels of roll is about three degrees, which is
 * the whole window of a hard shot.
 *
 * So this presses, drags, lets the line settle, and then lifts with the sort of
 * offset a thumb really produces — and checks that the ball leaves along the
 * line the felt was showing, not along the lift. A real gesture is the only way
 * to test this: the bug lives in the handler, not in the physics.
 */

import { startPreview, browserPath } from './sim.mjs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
/** How far a heading may move on the lift before a player would feel it. */
const TOLERANCE = 0.25;
/** Lift offsets, in CSS pixels: a clean lift, a roll, and a clumsy one. */
const ROLLS = [0, 5, 12, 22];

const fails = [];
const check = (ok, what, detail = '') => {
  console.log(`  ${ok ? '✓' : '✗'} ${what}${detail ? ` — ${detail}` : ''}`);
  if (!ok) fails.push(what);
};

const { url, server } = await startPreview(4186);
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

const heading = (v) => +((((Math.atan2(v.x, -v.z) * 180) / Math.PI) + 360) % 360).toFixed(3);

try {
  console.log('\n  the shot the felt was showing\n');
  await page.goto(url, { waitUntil: 'networkidle' });
  await wait(1400);
  await page.click('#btn-play');
  await wait(2600);
  await page.mouse.click(215, 430); // any held card
  for (let i = 0; i < 40; i += 1) {
    if (await page.evaluate(() => window.__game.phase === 'aim')) break;
    await wait(250);
  }
  check(await page.evaluate(() => window.__game.phase === 'aim'), 'the table is ready to be aimed');

  const ball = await page.evaluate(() => {
    const g = window.__game;
    const cam = g.engine.camera;
    const rect = document.querySelector('canvas').getBoundingClientRect();
    const visX = (cam.right - cam.left) / cam.zoom;
    const visZ = (cam.top - cam.bottom) / cam.zoom;
    return {
      x: rect.left + ((g.player.x - cam.position.x) / visX + 0.5) * rect.width,
      y: rect.top + ((g.player.z - cam.position.z) / visZ + 0.5) * rect.height
    };
  });

  for (const roll of ROLLS) {
    // Press below the ball and draw back: the thumb is the butt of the cue.
    const from = { x: ball.x + 14, y: ball.y + 26 };
    const to = { x: ball.x + 38, y: ball.y + 96 };
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    for (let i = 0; i < 8; i += 1) {
      await page.mouse.move(to.x, to.y);
      await wait(35);
    }

    // What the player is looking at, at the moment they let go.
    const drawn = await page.evaluate(() => {
      const d = window.__game.player.aimDir;
      return { x: d.x, z: d.z, power: +window.__game.player.aimPower.toFixed(3) };
    });

    // THE LIFT, as a thumb really performs it: the up carries coordinates the
    // last move never had. Playwright's own mouse.up cannot do this — it
    // releases wherever the pointer already is — so the event is dispatched
    // with the roll baked in, which is exactly the shape of the real one.
    const fired = await page.evaluate(
      ({ x, y, roll }) => {
        const g = window.__game;
        const input = g.tutorial?.input;
        const target = document.getElementById('stage') || document.querySelector('canvas');
        target.dispatchEvent(
          new PointerEvent('pointerup', {
            pointerId: input?.pointerId ?? 1,
            pointerType: 'mouse',
            clientX: x + roll,
            clientY: y + roll * 0.6,
            bubbles: true,
            cancelable: true
          })
        );
        const p = g.player;
        return { x: p.vx, z: p.vz, speed: Math.hypot(p.vx, p.vz) };
      },
      { x: to.x, y: to.y, roll }
    );

    const off = Math.abs(((heading(drawn) - heading(fired) + 540) % 360) - 180);
    check(
      fired.speed > 1 && off <= TOLERANCE,
      `a ${roll}px roll on the lift moves the shot by no more than ${TOLERANCE}°`,
      `drawn ${heading(drawn)}° → fired ${heading(fired)}° (${off.toFixed(3)}°)`
    );

    // Let the table settle before the next attempt.
    for (let i = 0; i < 60; i += 1) {
      if (await page.evaluate(() => window.__game.phase === 'aim')) break;
      await wait(250);
    }
  }

  check(errors.length === 0, 'no page errors', errors.slice(0, 3).join(' · '));
} finally {
  await browser.close();
  server?.kill();
}

console.log(
  fails.length
    ? `\n${fails.length} of the release's promises are not kept: ${fails.join('; ')}\n`
    : '\nthe ball leaves along the line the player was shown\n'
);
process.exit(fails.length ? 1 : 0);
