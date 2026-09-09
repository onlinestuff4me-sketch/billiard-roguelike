/**
 * check-palette.mjs — prove the balls are told apart ON SCREEN.
 *
 * THE FIRST VERSION OF THIS FILE MEASURED THE WRONG THING, and said so
 * confidently. It read `PALETTE.ballInk` out of the source, computed CIE
 * distances between those hex values, reported the closest pair as dE 32, and
 * passed. Meanwhile the game was drawing four balls that a player described,
 * correctly, as "almost the same exact color". Sampled out of the real
 * framebuffer, the four rendered as #afacaf, #a2a9b7, #a2a9be and #a2aaaf — a
 * worst-case separation of dE 3.9. The palette was never the problem. The
 * numeral sprite was `radius * 2.5`, a quarter wider than the ball it labels,
 * with a heavy dark halo: it covered the entire face, and the only part of a
 * ball wearing the ball's colour was a rim a pixel or two thick.
 *
 * A check on source colour cannot see that, and no amount of care choosing hex
 * values would have. So this boots the actual game, renders an actual board,
 * and reads actual pixels — the same discipline `npm run verify` applies to
 * whether a board can be played, and `__simShot` applies to whether a lesson's
 * sentence is true.
 *
 * WHAT IT MEASURES
 *
 *   1. Every pair of balls that can share a table — derived from the rack
 *      rules and lessons.json, because two colours only need telling apart if
 *      a player can see both at once — in normal vision and in simulated
 *      protanopia, deuteranopia and tritanopia. CIE76 dE in Lab.
 *   2. Every ball against the things that MEAN something: the cue ball, the
 *      danger red, the pick-up mint, a called pocket's bone. Measured through
 *      the same renderer, so "does this read as the cue ball" is a question
 *      about pixels.
 *   3. Every ball against the felt it sits on.
 *
 * Sampling is an annulus at 0.8 of the ball's radius: outside the numeral and
 * its halo, inside the silhouette. That is where a ball wears its colour, and
 * choosing it carelessly is how the first measurement went wrong twice.
 *
 *   npm run palette  [--verbose]
 *
 * Non-zero exit on any failure, so it can gate a build.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { openGame } from './sim.mjs';

const HERE = resolve(import.meta.dirname, '..');
const verbose = process.argv.includes('--verbose');

/* ------------------------------------------------------------------ *
 * Thresholds
 *
 * These are lower than a flat-swatch guideline would suggest, and they are
 * lower on purpose: they are measured through a bloom composite that
 * compresses the whole gamut. A rendered dE of 38 between two balls is a large
 * on-screen difference in this game. Compare against what shipped before this
 * check existed — 3.9 — rather than against an abstract scale.
 *
 * Colour is also never the only channel: every ball carries its number. That
 * is the identifier WCAG 1.4.1 asks for; hue is here to make reading the
 * numeral unnecessary at a glance, not to replace it.
 * ------------------------------------------------------------------ */
const MIN_NORMAL = 25;
/**
 * Protanopia and deuteranopia are around one man in twelve. Tritanopia is on
 * the order of one person in ten thousand and collapses a different axis, so
 * it carries a floor rather than the bar — holding all three to one number
 * costs the palette its warm half to protect against the rarest of them.
 */
const MIN_CVD = { protanopia: 14, deuteranopia: 14, tritanopia: 11 };
const MIN_MEANING = { cue: 26, bad: 24, good: 24, bone: 18 };
const MIN_FELT = 14;

/* ------------------------------------------------------------------ *
 * Colour maths
 * ------------------------------------------------------------------ */

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linearToSrgb = (c) => {
  const v = Math.min(Math.max(c, 0), 1);
  return v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055;
};

function rgbToLab(rgb) {
  const [r, g, b] = rgb.map((v) => srgbToLinear(v / 255));
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

const deltaE = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** Viénot, Brettel & Mollon (1999), applied in linear RGB. */
const CVD = {
  protanopia: [
    [0.11238, 0.88762, 0],
    [0.11238, 0.88762, 0],
    [0.004, -0.004, 1]
  ],
  deuteranopia: [
    [0.29275, 0.70725, 0],
    [0.29275, 0.70725, 0],
    [-0.02234, 0.02234, 1]
  ],
  tritanopia: [
    [1, 0.1461, -0.1461],
    [0, 0.85734, 0.14266],
    [0, 0.85734, 0.14266]
  ]
};

function simulate(rgb, kind) {
  if (!kind) return rgb;
  const m = CVD[kind];
  const lin = rgb.map((v) => srgbToLinear(v / 255));
  return m
    .map((row) => row[0] * lin[0] + row[1] * lin[1] + row[2] * lin[2])
    .map((v) => Math.round(linearToSrgb(v) * 255));
}

const views = ['protanopia', 'deuteranopia', 'tritanopia'];
const labsOf = (rgb) => ({
  normal: rgbToLab(rgb),
  ...Object.fromEntries(views.map((v) => [v, rgbToLab(simulate(rgb, v))]))
});
const hex = (rgb) => `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`;

/* ------------------------------------------------------------------ *
 * Which balls can share a table
 * ------------------------------------------------------------------ */

const config = readFileSync(resolve(HERE, 'src/config.js'), 'utf8');

function coOccurring() {
  const pairs = new Set();
  const add = (list) => {
    const solids = [...new Set(list)].sort((a, b) => a - b);
    for (let i = 0; i < solids.length; i += 1) {
      for (let j = i + 1; j < solids.length; j += 1) pairs.add(`${solids[i]}|${solids[j]}`);
    }
  };
  const arch = /archetypeByNumber:\s*\[([^\]]*)\]/.exec(config);
  if (arch) {
    const types = arch[1].split(',').map((t) => t.trim().replace(/['"]/g, ''));
    add(types.map((t, i) => (t === 'solid' ? i + 1 : null)).filter(Boolean));
  }
  const lessons = JSON.parse(readFileSync(resolve(HERE, 'src/data/lessons.json'), 'utf8'));
  for (const board of lessons.lessons ?? []) {
    add((board.enemies ?? []).filter((e) => e.type === 'solid' && e.number).map((e) => e.number));
  }
  return pairs;
}

/* ------------------------------------------------------------------ *
 * Measure
 * ------------------------------------------------------------------ */

const RESERVED = { bad: 0xff5a3d, good: 0x2ef2c4, bone: 0xeaf6ff };

const game = await openGame({ preserveDrawingBuffer: true });
let measured;
try {
  await game.gotoBoard('cut-combo');
  await game.page.waitForTimeout(700);
  measured = await game.page.evaluate((reserved) => {
    const g = window.__game;

    /** Read the framebuffer once and sample the balls' colour annulus. */
    const shoot = () =>
      new Promise((done) => {
        requestAnimationFrame(() => {
          const glc = document.getElementById('stage-canvas');
          const c = document.createElement('canvas');
          c.width = glc.width;
          c.height = glc.height;
          const ctx = c.getContext('2d');
          ctx.drawImage(glc, 0, 0);
          const cam = g.tutorial.engine.camera;
          const dpr = glc.width / glc.clientWidth;
          const W = glc.clientWidth;
          const H = glc.clientHeight;
          const visX = (cam.right - cam.left) / cam.zoom;
          const visZ = (cam.top - cam.bottom) / cam.zoom;
          const at = (x, z, r) => {
            const px = ((x - cam.position.x) / visX + 0.5) * W;
            const py = ((z - cam.position.z) / visZ + 0.5) * H;
            const rp = (r / visZ) * H;
            const pts = [];
            for (let a = 0; a < 12; a += 1) {
              const ang = (a / 12) * Math.PI * 2;
              const d = ctx.getImageData(
                Math.round((px + Math.cos(ang) * rp * 0.8) * dpr),
                Math.round((py + Math.sin(ang) * rp * 0.8) * dpr),
                1,
                1
              ).data;
              pts.push([d[0], d[1], d[2]]);
            }
            // Median per channel: a mean would be dragged by the numeral's
            // halo and by any specular hit on the sphere.
            return [0, 1, 2].map((i) => pts.map((q) => q[i]).sort((a, b) => a - b)[6]);
          };
          done({ at, ctx });
        });
      });

    /** Paint every ball one colour and read it back, so each is measured
        under identical lighting, bloom and position. */
    const asColour = async (hexColour) => {
      for (const e of g.rooms.scriptedEnemies) {
        if (!e.alive) continue;
        e.material.color.setHex(hexColour);
        e.material.emissive.setHex(hexColour);
        e.markerMat?.color.setHex(hexColour);
        e.material.needsUpdate = true;
      }
      const { at } = await shoot();
      const e = g.rooms.scriptedEnemies.find((b) => b.alive);
      return at(e.x, e.z, e.radius);
    };

    return (async () => {
      const ink = window.__BALL_INK;
      const balls = {};
      for (const [n, c] of Object.entries(ink)) balls[n] = await asColour(c);
      const meaning = {};
      for (const [k, c] of Object.entries(reserved)) meaning[k] = await asColour(c);
      const { at } = await shoot();
      meaning.cue = at(g.player.x, g.player.z, g.player.radius);
      const felt = at(-5, 6, 0.48);
      return { balls, meaning, felt };
    })();
  }, RESERVED);
} finally {
  await game.close();
}

/* ------------------------------------------------------------------ *
 * Judge
 * ------------------------------------------------------------------ */

const together = coOccurring();
const ids = Object.keys(measured.balls).sort((a, b) => Number(a) - Number(b));
const L = Object.fromEntries(ids.map((n) => [n, labsOf(measured.balls[n])]));
const ML = Object.fromEntries(
  Object.entries(measured.meaning).map(([k, v]) => [k, labsOf(v)])
);
const feltL = labsOf(measured.felt);

const failures = [];
const rows = [];

for (let i = 0; i < ids.length; i += 1) {
  for (let j = i + 1; j < ids.length; j += 1) {
    const a = ids[i];
    const b = ids[j];
    const norm = deltaE(L[a].normal, L[b].normal);
    let worst = { d: Infinity, view: null };
    for (const v of views) {
      const d = deltaE(L[a][v], L[b][v]);
      if (d < worst.d) worst = { d, view: v };
    }
    const shares = together.has(`${a}|${b}`);
    rows.push({ pair: `${a} vs ${b}`, norm, ...worst, shares });
    if (!shares) continue;
    if (norm < MIN_NORMAL) {
      failures.push(
        `balls ${a} and ${b} share a table and render only dE ${norm.toFixed(1)} apart ` +
          `(need ${MIN_NORMAL})`
      );
    }
    for (const v of views) {
      const d = deltaE(L[a][v], L[b][v]);
      if (d < MIN_CVD[v]) {
        failures.push(
          `balls ${a} and ${b} share a table and render only dE ${d.toFixed(1)} apart ` +
            `under ${v} (need ${MIN_CVD[v]})`
        );
      }
    }
  }
}

for (const n of ids) {
  for (const [k, need] of Object.entries(MIN_MEANING)) {
    if (!ML[k]) continue;
    for (const v of ['normal', ...views]) {
      const d = deltaE(L[n][v], ML[k][v]);
      const bar = v === 'tritanopia' ? need * 0.7 : need;
      if (d < bar) {
        failures.push(
          `ball ${n} renders as ${k} — dE ${d.toFixed(1)} under ${v} (need ${bar.toFixed(0)})`
        );
      }
    }
  }
  const f = deltaE(L[n].normal, feltL.normal);
  if (f < MIN_FELT) {
    failures.push(`ball ${n} renders only dE ${f.toFixed(1)} from the felt (need ${MIN_FELT})`);
  }
}

/* ------------------------------------------------------------------ *
 * Report
 * ------------------------------------------------------------------ */

console.log('\nMEASURED OUT OF THE FRAMEBUFFER, not out of the source.\n');
console.log('BALL   RENDERS AS   vs FELT   CLOSEST BALL IT SHARES A TABLE WITH');
console.log('─'.repeat(78));
for (const n of ids) {
  const mine = rows.filter(
    (r) => r.shares && (r.pair.startsWith(`${n} `) || r.pair.endsWith(` ${n}`))
  );
  const worst = mine.reduce((a, b) => (b.norm < (a?.norm ?? Infinity) ? b : a), null);
  console.log(
    `  ${n}    ${hex(measured.balls[n])}      ` +
      `dE ${deltaE(L[n].normal, feltL.normal).toFixed(0).padStart(3)}` +
      (worst
        ? `     dE ${worst.norm.toFixed(0)} normal / ${worst.d.toFixed(0)} ${worst.view.slice(0, 6)}  (${worst.pair})`
        : '     —')
  );
}
console.log(
  `\n  cue ${hex(measured.meaning.cue)}   felt ${hex(measured.felt)}   ` +
    `danger ${hex(measured.meaning.bad)}   pick-up ${hex(measured.meaning.good)}`
);

if (verbose) {
  console.log('\nEVERY PAIR  (· = never share a table, not enforced)');
  for (const r of [...rows].sort((a, b) => a.norm - b.norm)) {
    console.log(
      `  ${r.shares ? ' ' : '·'} ${r.pair.padEnd(9)} normal ${r.norm.toFixed(1).padStart(6)}   ` +
        `worst ${r.d.toFixed(1).padStart(5)} (${r.view})`
    );
  }
}

if (failures.length) {
  console.log('\nFAILED');
  for (const f of failures) console.log(`  · ${f}`);
  console.log('');
  process.exit(1);
}

const live = rows.filter((r) => r.shares);
const minN = live.reduce((a, r) => Math.min(a, r.norm), Infinity);
const minC = live.reduce((a, r) => Math.min(a, r.d), Infinity);
console.log(
  `\nall ${ids.length} balls clear — of the ${live.length} pairs that can share a table, ` +
    `the closest renders dE ${minN.toFixed(1)} apart in normal vision (floor ${MIN_NORMAL}) ` +
    `and ${minC.toFixed(1)} under dichromacy\n`
);
