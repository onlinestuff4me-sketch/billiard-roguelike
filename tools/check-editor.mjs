#!/usr/bin/env node
/**
 * check-editor — the table editor's instruments, measured against the CLI's.
 *
 *   npm run editor
 *
 * WHY THIS EXISTS
 *
 * `/tool` can now measure a board: sweep it, play a heading on it, and write
 * the measured window back into the lesson. It does that by running the real
 * game in a frame and driving the same probes this directory drives — which is
 * the only arrangement that cannot drift, and is also an arrangement with a lot
 * of moving parts between the button and the number. A frame that never boots,
 * a board that never reaches the table, a panel the game's own frame happens to
 * sit on top of: each of those turns the editor into something that reports
 * confidently and wrongly, and none of them is visible from reading the code.
 *
 * So the editor is held to the one claim that matters: MEASURED IN THE EDITOR
 * IS MEASURED BY VERIFY. It sweeps a board through the editor at the step
 * `verify` uses and checks the run it finds is the run stored in lessons.json —
 * the same number, arrived at through the UI a person actually clicks.
 */

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { browserPath, startPreview } from './sim.mjs';

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));
const lessons = JSON.parse(readFileSync(join(HERE, '../src/data/lessons.json'), 'utf8')).lessons;

/** The board to put through the whole path. The first one, which is also the
    widest, so a failure here is a failure of the machinery and not of a board. */
const BOARD = 'angle';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const problems = [];
const check = (ok, what, detail = '') => {
  console.log(`  ${ok ? '✓' : '✗'} ${what}${detail ? `   ${detail}` : ''}`);
  if (!ok) problems.push(what);
};

/** Poll a page reading until it says something conclusive, or give up. */
async function until(page, sel, re, seconds) {
  for (let i = 0; i < seconds * 2; i++) {
    const text = (await page.textContent(sel)) || '';
    if (re.test(text)) return text;
    await wait(500);
  }
  return (await page.textContent(sel)) || '';
}

const { url, server } = await startPreview(4174);
const { chromium } = require('playwright');
const browser = await chromium.launch({ executablePath: browserPath() });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e.message)));

try {
  console.log('\n  the editor, measuring\n');
  await page.goto(`${url}tool/`, { waitUntil: 'networkidle' });
  await page.click('#mode-lessons');
  await wait(300);

  // Move to the board under test through the list, the way a person does.
  const at = lessons.findIndex((l) => l.id === BOARD);
  await page.locator('#layout-list .layout-item').nth(at).click();
  await wait(200);

  const stored = lessons[at].window;
  const solve = lessons[at].solve;

  /* --- DAYLIGHT: live, and off the game's own radii ------------------- */
  const two = lessons.findIndex((l) => (l.enemies || []).length >= 2);
  await page.locator('#layout-list .layout-item').nth(two).click();
  await wait(200);
  const reads = (await page.textContent('#reads')) || '';
  check(/daylight\s*[\d.]+ between/.test(reads), 'daylight reads a gap between two balls', reads.trim());
  await page.locator('#layout-list .layout-item').nth(at).click();
  await wait(200);

  /* --- THE FRAME ----------------------------------------------------- */
  await page.click('#m-open');
  const up = await until(page, '#m-status', /The game is up|never reached|no board/, 45);
  check(/The game is up/.test(up), 'the game boots in the editor', up);
  if (!/The game is up/.test(up)) throw new Error('nothing else can be measured');

  /* --- MEASURE: the editor's number is verify's number ----------------- */
  await page.selectOption('#m-step', '0.5');
  await page.click('#m-sweep');
  const swept = await until(page, '#m-status', /Widest window|Nothing on this board/, 180);
  const run = swept.match(/([\d.]+)–([\d.]+)°/);
  check(
    !!run && Number(run[1]) === stored[0] && Number(run[2]) === stored[1],
    `the measured run is the stored window ${stored[0]}–${stored[1]}°`,
    swept.trim()
  );

  /* --- PLAY IT -------------------------------------------------------- */
  await page.fill('#m-deg', String(solve));
  await page.click('#m-play');
  await until(page, '#m-status', /Played|error|never/, 60);
  const note = (await page.textContent('#m-play-note')) || '';
  check(/Down: /.test(note) && !/SCRATCH/.test(note), `the stored solve ${solve}° pots without scratching`, note.trim());
  check(/preview drew the same shot/.test(note), 'the preview drew what the table played');

  /* --- SHIP: reachable, and writes the run it measured ---------------- */
  const label = (await page.textContent('#m-ship')) || '';
  check(
    label.includes(`${stored[0]}–${stored[1]}`),
    'Ship offers the measured run',
    label.trim()
  );
  // CLICKED, not merely enabled. The game's own frame was laid out on top of
  // this button once, which no reading of the markup would have shown.
  await page.click('#m-ship', { timeout: 5000 });
  await wait(200);
  const wrote = (await page.textContent('#status')) || '';
  check(
    wrote.includes(`${stored[0]}–${stored[1]}`) && wrote.includes(BOARD),
    'Ship writes it into the lesson',
    wrote.trim()
  );

  check(errors.length === 0, 'no page errors', errors.slice(0, 3).join(' · '));
} finally {
  await browser.close();
  server?.kill();
}

console.log(
  problems.length
    ? `\n${problems.length} of the editor's instruments are not answering: ${problems.join('; ')}\n`
    : '\nthe editor measures what verify measures, through the buttons a person clicks\n'
);
process.exit(problems.length ? 1 : 0);
