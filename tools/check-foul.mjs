#!/usr/bin/env node
/**
 * check-foul — the line goes red before the stroke, not after it.
 *
 *   npm run foul
 *
 * WHY THIS EXISTS
 *
 * The mission can refuse a pot: the 8 before its turn, and — under strict
 * order — any ball that is not the next one. A refusal that arrives AFTER the
 * stroke is spent reads as a bug, however correct it is, because the preview
 * had already drawn the shot and the preview is this game's one promise: the
 * line never lies. A line that draws a pot the game will not accept is the
 * line lying, in the only way it still could.
 *
 * So the preview asks the mission the same question the pot will ask, over the
 * table each earlier pot leaves behind, and when the answer is no it says so
 * twice: the offending ball's line turns red on the felt, and the mission
 * block names the ball to take instead. This checks both, and it checks them
 * the way the rest of this directory does — by sweeping every heading through
 * the real game rather than by driving one shot and hoping it was the
 * interesting one.
 *
 * (An earlier version of this file drove a real thumb across the glass. It
 * worked two runs in three: a heading is EASED toward, so the line a hand
 * settles on is a fraction off the one the sweep found, and a fraction is
 * enough to sink a different ball. The thumb is a good way to test the input
 * and a bad way to test a verdict.)
 */

import { startPreview, browserPath } from './sim.mjs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
/** PALETTE.bad — the one hue that means "this costs you". */
const BAD = 0xff5a3d;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const fails = [];
const check = (ok, what, detail = '') => {
  console.log(`  ${ok ? '✓' : '✗'} ${what}${detail ? ` — ${detail}` : ''}`);
  if (!ok) fails.push(what);
};

const { url, server } = await startPreview(4178);
const { chromium } = require('playwright');
const browser = await chromium.launch({ executablePath: browserPath() });
const page = await browser.newPage({ viewport: { width: 430, height: 860 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e.message)));

// Past the tutorial, and with the mode the warning is loudest in switched on.
await page.addInitScript(() => {
  try {
    localStorage.setItem('billiard-tutorial-done-v2', '1');
    localStorage.setItem('billiard-strict-order-v1', '1');
  } catch {
    /* private mode — the run below reports what it finds */
  }
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
  console.log('\n  the refusal, before the stroke\n');
  await page.goto(url, { waitUntil: 'networkidle' });
  await wait(1400);
  await page.click('#btn-play');
  await wait(2400);
  await page.mouse.click(215, 430); // the room banner holds until it is read
  // A room opens mid-resolve — the menu hands over while its attract stroke is
  // still rolling — and nothing can be aimed until the table is still.
  for (let i = 0; i < 40; i += 1) {
    if ((await page.evaluate(() => window.__game.phase)) === 'aim') break;
    await wait(250);
  }
  check((await page.evaluate(() => window.__game.phase)) === 'aim', 'the table is ready to be aimed');
  check(await page.evaluate(() => !!window.__game.rules.mission.strictOrder), 'the run is under strict order');

  /* --- every heading, and what the felt says about each ------------------ */
  const swept = await page.evaluate((bad) => {
    const g = window.__game;
    const next = g.rules.nextInOrder;
    const out = { next, drawn: 0, refused: 0, allowed: 0, wrong: [] };
    for (let deg = 0; deg < 360; deg += 1) {
      for (const power of [0.5, 0.7, 0.9]) {
        const line = window.__aim(deg, power);
        const sunk = line.legs
          .map((l, i) => ({ i, n: l.number, potted: l.potted }))
          .filter((l) => l.potted && l.n > 0);
        if (!sunk.length) continue;
        out.drawn += 1;
        // The mission's own verdict on this line, asked the way the pot will
        // ask it — first ball against the table as it stands, each one after
        // against the table the one before leaves.
        const reasons = g.rules.foulsAhead(sunk.map((l) => l.n));
        const at = reasons.findIndex((r) => r);
        const shouldWarn = at >= 0;
        const redLegs = line.legInks
          .map((ink, i) => (ink === bad ? i : -1))
          .filter((i) => i >= 0);
        const said = !!line.foul;
        if (shouldWarn) out.refused += 1;
        else out.allowed += 1;
        // Three things have to agree: whether there is a refusal, which leg it
        // is about, and the words. Any disagreement is recorded with enough to
        // find it again.
        const wantWords = shouldWarn
          ? reasons[at].reason === 'eight'
            ? '8 GOES LAST'
            : `THE ${reasons[at].next} FIRST`
          : null;
        const legOk = shouldWarn
          ? redLegs.includes(sunk[at].i) && redLegs.length === reasons.filter((r) => r).length
          : redLegs.length === 0;
        if (said !== shouldWarn || line.foul !== wantWords || !legOk) {
          if (out.wrong.length < 6) {
            out.wrong.push(
              `${deg}° @${power}: sinks ${sunk.map((l) => l.n).join(',')} · should ${
                wantWords || 'allow'
              } · said ${line.foul || 'allow'} · red legs [${redLegs.join(',')}]`
            );
          }
        }
        break;
      }
    }
    return out;
  }, BAD);

  check(swept.drawn > 0, 'headings whose line sinks something', `${swept.drawn} of 360`);
  check(swept.refused > 0, 'some of them the mission would refuse', `${swept.refused} refused, ${swept.allowed} allowed`);
  check(
    swept.wrong.length === 0,
    'every drawn line agrees with the mission, in words and in colour',
    swept.wrong.join(' | ')
  );

  /* --- and the HUD draws what it is handed ------------------------------- */
  const hud = await page.evaluate(() => {
    const g = window.__game;
    const line = document.querySelector('.mission-order');
    const base = { hp: 100, maxHp: 100, level: 1, phase: 'aim', cleared: false, ...g.rules.snapshot() };
    g.hud.update({ ...base, aimFoul: 'THE 4 FIRST' }, 1 / 60);
    const warned = { text: line.textContent, red: line.classList.contains('strict') };
    g.hud.update({ ...base, aimFoul: null }, 1 / 60);
    return { warned, quiet: { text: line.textContent, red: line.classList.contains('strict') } };
  });
  check(hud.warned.text === 'THE 4 FIRST' && hud.warned.red, 'the mission block says the refusal in red', hud.warned.text);
  check(hud.quiet.text !== 'THE 4 FIRST', 'and goes back to the order when the line is clean', hud.quiet.text);

  check(errors.length === 0, 'no page errors', errors.slice(0, 3).join(' · '));
} finally {
  await browser.close();
  server?.kill();
}

console.log(
  fails.length
    ? `\n${fails.length} of the warning's promises are not kept: ${fails.join('; ')}\n`
    : '\nthe line says no while the thumb is still down\n'
);
process.exit(fails.length ? 1 : 0);
