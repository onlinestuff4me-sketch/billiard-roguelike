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

const SIZES = [
  { width: 360, height: 740 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
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
        play: box('#btn-play'),
        row: box('.menu-row'),
        buttons: ['#btn-modes', '#btn-settings', '#btn-mute'].map(box),
        title: box('.menu-title'),
        eyebrow: box('.menu-eyebrow')
      };
    });
    const mid = menu.vw / 2;
    for (const [name, b] of [
      ['the title', menu.title],
      ['the eyebrow', menu.eyebrow],
      ['Play', menu.play],
      ['the button row', menu.row]
    ]) {
      if (!b) continue;
      check(b.l >= -0.5 && b.r <= menu.vw + 0.5, `${name} stays on screen`, `${b.l} → ${b.r} of ${menu.vw}`);
      check(Math.abs((b.l + b.r) / 2 - mid) < 1, `${name} is centred`);
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

console.log('');
if (fails.length) {
  console.log(`${fails.length} check${fails.length === 1 ? '' : 's'} failed`);
  for (const f of fails) console.log(`  · ${f}`);
  console.log('');
  process.exit(1);
}
console.log('nothing off the edge, and the coach never covers the felt\n');
