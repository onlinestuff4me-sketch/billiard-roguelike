/**
 * sim.mjs — drive the REAL game headlessly and measure what a board can do.
 *
 * WHY THIS EXISTS
 *
 * Every board in this game is a claim: "there is a shot here, a beginner can
 * find it, and it teaches the thing the card says". Three times now a board
 * shipped where that claim was false — one asked for a bank that a sweep of
 * every heading at every power could make exactly once in 2160 attempts, one
 * lost its scoring rule and could never complete at all, and one demanded two
 * balls in a stroke that had seven solutions in the same 2160. None of those
 * were visible by playing the board a few times, and all three were obvious
 * within seconds of measuring it.
 *
 * So the boards are measured, not eyeballed. This module boots the built game
 * in a headless browser, drives its ACTUAL physics — the same PhysicsSystem
 * the player's shots go through, not a re-implementation that could drift —
 * and reports, for a given board and pass condition, the contiguous ranges of
 * aim headings that succeed. A range is the honest unit here: a shot that
 * works at exactly one heading is not a shot a human can play.
 *
 * It runs the game rather than a model of it on purpose. A verifier that
 * disagrees with the game is worse than no verifier.
 */

import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));

/** The board list, straight from the file the game itself loads. */
export function boardIds() {
  const data = JSON.parse(readFileSync(join(HERE, '../src/data/lessons.json'), 'utf8'));
  return data.lessons.map((l) => l.id);
}

/** Where the headless Chromium lives in this environment, if it is pinned. */
function browserPath() {
  return process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
}

/** Wait for the preview server to answer, or give up. */
async function waitForServer(url, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

/**
 * Boot the game and hand back a driver.
 * @param {{url?: string, serve?: boolean, port?: number}} [opts]
 */
export async function openGame(opts = {}) {
  const port = opts.port ?? 4173;
  const url = opts.url ?? `http://localhost:${port}/`;

  let server = null;
  if (opts.serve !== false && !(await waitForServer(url, 800))) {
    server = spawn('npx', ['vite', 'preview', '--port', String(port)], {
      stdio: 'ignore',
      detached: false
    });
    if (!(await waitForServer(url))) {
      server.kill();
      throw new Error(`preview server never came up on ${url} — run \`npm run build\` first`);
    }
  }

  const { chromium } = require('playwright');
  const browser = await chromium.launch({ executablePath: browserPath() });
  const page = await browser.newPage({ viewport: { width: 430, height: 860 } });

  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message)));

  // The synth is irrelevant to physics and a headless AudioContext throws on
  // values a real one tolerates; a thrown note inside a substep would abort the
  // very stroke we are trying to measure.
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

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1400);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((n) => /play/i.test(n.textContent));
    if (b) b.click();
  });
  await page.waitForTimeout(2400);
  // The harness runs against the live systems, so it goes in AFTER boot.
  await page.evaluate(readFileSync(join(HERE, 'harness.js'), 'utf8'));

  return {
    page,
    errors,
    /** Move to the board with this id, from wherever the tutorial currently is. */
    async gotoBoard(id) {
      const ok = await page.evaluate(async (want) => {
        const g = window.__game;
        for (let i = 0; i < 24; i++) {
          if (g.tutorial?.lesson?.id === want) return true;
          g.tutorial?._advance?.();
          await new Promise((r) => setTimeout(r, 60));
        }
        return g.tutorial?.lesson?.id === want;
      }, id);
      await page.waitForTimeout(900);
      if (!ok) throw new Error(`no board with id "${id}"`);
    },

    lesson: () => page.evaluate(() => window.__simLesson()),
    sweep: (spec) => page.evaluate((s) => window.__simSweep(s), spec),
    plan: (spec) => page.evaluate((s) => window.__simPlan(s), spec),
    async close() {
      await browser.close();
      if (server) server.kill();
    }
  };
}
