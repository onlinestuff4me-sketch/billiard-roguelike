#!/usr/bin/env node
/**
 * check-layout — prove nothing runs off the screen, at every size a phone is.
 *
 *   npm run layout
 *
 * The menu's three secondary buttons were a flex row of items each carrying
 * `width: 100%`. A flex item will not shrink below its min-content width by
 * default, so three buttons each asking for the whole row — one of them
 * holding the unbreakable word SETTINGS — could not fit, and the row's
 * contents ran past its own right-hand edge. Measured on a 360px phone that
 * put SOUND ON off the side of the screen. It is the kind of thing that is
 * obvious in a screenshot and invisible in a diff, so it is measured.
 *
 * Three things are checked, at four viewports:
 *
 *   OVERFLOW   nothing crosses the left or right edge of the viewport.
 *   CENTRED    a row that is meant to be centred has its middle on the middle.
 *   EQUAL      buttons sharing a row are the same width, so the row reads as
 *              one control rather than three that disagree.
 *
 * And, in a lesson: that the coaching strip and the table do not overlap. The
 * band used to be pinned to a strip of felt no board places anything in, which
 * is not the same as a strip no BALL can reach — one rolled up under it and
 * out of sight, which is why the table now shrinks to make room.
 */
import { openGame } from './sim.mjs';

// Narrow, common, large, short-and-wide. The last one is not a phone held
// upright; it is a phone whose browser chrome has eaten half the screen, and
// it is where a title sized against `vmin` gets big enough to fall off.
const SIZES = [
  { width: 320, height: 700 },
  { width: 360, height: 740 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 428, height: 500 },
  { width: 820, height: 1180 }
];

const fails = [];
const check = (ok, what, detail = '') => {
  console.log(`    ${ok ? '✓' : '✗'} ${what}${detail ? ` — ${detail}` : ''}`);
  if (!ok) fails.push(`${what}${detail ? ` (${detail})` : ''}`);
};

for (const size of SIZES) {
  const game = await openGame({ viewport: size });
  console.log(`\n${size.width}x${size.height}\n`);
  try {
    const menu = await game.page.evaluate(() => {
      // Back to the menu, which the harness's boot has already left.
      const box = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { w: +r.width.toFixed(1), l: +r.left.toFixed(1), r: +r.right.toFixed(1) };
      };
      document.getElementById('boot-veil')?.classList.remove('hidden');
      document.getElementById('menu-main').hidden = false;
      return {
        vw: window.innerWidth,
        // The widest thing the menu holds, so a failure says whether the box
        // is wrong or the type in it is.
        inner: box('.menu-inner#menu-main'),
        play: box('#btn-play'),
        row: box('.menu-row'),
        buttons: ['#btn-modes', '#btn-settings', '#btn-mute'].map(box),
        title: box('.menu-title'),
        eyebrow: box('.menu-eyebrow')
      };
    });
    const mid = menu.vw / 2;
    for (const [name, b] of [
      ['the menu box', menu.inner],
      ['the title', menu.title],
      ['the eyebrow', menu.eyebrow],
      ['Play', menu.play],
      ['the button row', menu.row]
    ]) {
      if (!b) continue;
      check(b.l >= -0.5 && b.r <= menu.vw + 0.5, `${name} stays on screen`, `${b.l} → ${b.r} of ${menu.vw}`);
      check(Math.abs((b.l + b.r) / 2 - mid) < 1, `${name} is centred`, `middle ${((b.l + b.r) / 2).toFixed(1)} of ${mid}`);
      // AND INSIDE THE BOX IT WAS MEASURED INTO. Staying on screen is not the
      // same as fitting: there is no webfont here, so the type falls back to
      // whatever the device has, and a title that fits in the test can spill
      // out of its own container on a phone with a wider face installed.
      if (menu.inner && b !== menu.inner) {
        check(
          b.l >= menu.inner.l - 0.5 && b.r <= menu.inner.r + 0.5,
          `${name} fits its box`,
          `${b.l} → ${b.r} in ${menu.inner.l} → ${menu.inner.r}`
        );
      }
    }
    const widths = menu.buttons.filter(Boolean).map((b) => b.w);
    check(
      widths.length === 3 && Math.max(...widths) - Math.min(...widths) < 0.5,
      'the three buttons are one width',
      widths.join(' / ')
    );
    check(
      menu.buttons.every((b) => b && b.l >= menu.row.l - 0.5 && b.r <= menu.row.r + 0.5),
      'and none of them escapes the row'
    );

    // In a lesson: the coach has its own strip and the felt starts below it.
    await game.gotoBoard('budget');
    await game.page.waitForTimeout(400);
    const lesson = await game.page.evaluate(() => {
      const g = window.__game;
      const layer = document.getElementById('ui-layer');
      const origin = layer.getBoundingClientRect().top;
      const band = document.getElementById('coach').getBoundingClientRect();
      const cam = g.tutorial.engine.camera;
      const h = layer.clientHeight;
      const visZ = (cam.top - cam.bottom) / cam.zoom;
      const toY = (z) => ((z - cam.position.z) / visZ + 0.5) * h;
      // The topmost thing the table draws: the far rail, above the far pockets.
      const top = Math.min(...g.rooms.table.pockets.map((p) => toY(p.z) - (p.radius / visZ) * h));
      return { band: { top: band.top - origin, bottom: band.bottom - origin }, tableTop: top };
    });
    check(
      lesson.tableTop >= lesson.band.bottom - 0.5,
      'the table starts below the coaching band',
      `band ends ${lesson.band.bottom.toFixed(0)}, table starts ${lesson.tableTop.toFixed(0)}`
    );
  } finally {
    await game.close();
  }
}

/* ------------------------------------------------------------------ *
 * The tutorial's own motion, in one session of its own — the walk only
 * goes forwards, so it cannot share a page with the checks above.
 * ------------------------------------------------------------------ */
{
  const game = await openGame();
  console.log('\nthrough the tutorial\n');
  try {
    // THE TABLE HOLDS STILL FOR THE WHOLE TUTORIAL. It used to creep down at
    // the start of every board: the strip was re-solved per lesson, by nudging
    // a pixel a frame until the far rail cleared the band — and the nudge was
    // undone every frame by the Engine, which rewrites the camera position it
    // was being applied to. Reported as the table animating on every step.
    const reserves = [];
    for (const id of ['angle', 'combo', 'cut-combo', 'bank', 'budget', 'green-red']) {
      await game.gotoBoard(id);
      await game.page.waitForTimeout(250);
      reserves.push(await game.page.evaluate(() => window.__reserve().target));
    }
    check(
      Math.max(...reserves) - Math.min(...reserves) < 0.5,
      'the strip is the same on every board',
      reserves.join(' / ')
    );

    // AND GIVING IT BACK IS SMOOTH. Sampled across the release: the reserve
    // has to fall, never rise, and never in one jump.
    const release = await game.page.evaluate(
      () =>
        new Promise((done) => {
          window.__game.tutorial.stop();
          const seen = [];
          const tick = () => {
            seen.push(window.__reserve().now);
            if (seen.length < 40) requestAnimationFrame(tick);
            else done(seen);
          };
          requestAnimationFrame(tick);
        })
    );
    const start = release[0];
    const rises = release.some((v, i) => i && v > release[i - 1] + 0.01);
    const biggest = release.reduce((a, v, i) => (i ? Math.max(a, release[i - 1] - v) : a), 0);
    check(!rises, 'the table only grows, never jumps back', `${start.toFixed(0)} → ${release.at(-1).toFixed(0)}`);
    check(
      biggest < start * 0.5,
      'and gets there over frames rather than in one step',
      `biggest step ${biggest.toFixed(1)}px of ${start.toFixed(0)}`
    );
  } finally {
    await game.close();
  }
}

console.log('');
if (fails.length) {
  console.log(`${fails.length} check${fails.length === 1 ? '' : 's'} failed`);
  for (const f of fails) console.log(`  · ${f}`);
  console.log('');
  process.exit(1);
}
console.log('nothing off the edge, and the coach never covers the felt\n');
