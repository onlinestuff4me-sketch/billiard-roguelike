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
 *   3. Every ball against the felt it sits on AND against the obsidian the
 *      table floats on, as a WCAG CONTRAST RATIO — see below.
 *   4. Every ball's NUMERAL against the ball it is written on, the same way.
 *
 * Sampling is an annulus at 0.8 of the ball's radius: outside the numeral and
 * its halo, inside the silhouette. That is where a ball wears its colour, and
 * choosing it carelessly is how the first measurement went wrong twice.
 *
 * TELLING TWO BALLS APART IS NOT THE SAME AS SEEING EITHER OF THEM.
 *
 * The second version of this file measured distance and only distance: four
 * balls a long way apart from each other passed, and one of them was #0000ff
 * on a near-black table. Pure blue carries a relative luminance of 0.07, which
 * is a contrast ratio of 2.3:1 against the obsidian — under the 3:1 that WCAG
 * 1.4.11 asks of any graphic you have to make out. Reported, correctly, as
 * "the dark blue 4 is hard to read against the black background".
 *
 * The numeral had the same hole in it from the other side: bone ink on the
 * yellow ball is 1.2:1, which is invisible, and the only reason it could be
 * read at all was the heavy dark outline drawn around every glyph. An outline
 * is a workaround for contrast, not contrast. The ink is chosen per ball now,
 * by the same ratio (WCAG 1.4.3, small text) — bone on the dark balls, near
 * black on the light ones, the way a real pool ball is printed.
 *
 * Both are measured HERE, out of the same framebuffer, rather than computed
 * from the source hexes: bloom lifts a rendered colour well off its authored
 * one, and it is the rendered one the player has to see.
 *
 *   npm run palette  [--verbose]
 *   npm run palette -- --pick     search the rendered gamut for a new set
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

/**
 * WCAG contrast ratios, measured on rendered pixels.
 *
 * 1.4.11 asks 3:1 of a graphical object you have to perceive to use the thing.
 * A ball is exactly that, and it has two backgrounds — the felt it rolls on
 * and the obsidian around the table — so it clears both.
 *
 * The bar was briefly raised to the 4.5:1 text one, because a ball at 4.1:1
 * had been reported as hard to make out. Measured, that costs too much to be
 * right: only 16 of 432 rendered candidates clear 4.5:1 against a near-black
 * table, they are all bright warm colours, and the best four of them sit at
 * 1.26x the separation floors against 1.83x at the standard's own number. It
 * would buy a little contrast by giving up the thing contrast is FOR — telling
 * the balls apart, including under dichromacy.
 *
 * The report was also about the numeral rather than the body, and the numeral
 * had its own cause and its own fix (Enemy.numberTexture). So the floor is
 * the standard's, and the picker maximises separation above it.
 *
 * 1.4.3 asks 4.5:1 of small text. The numeral on a ball is about as small as
 * text gets, so it takes the text bar against the ball it is written on rather
 * than the graphic one.
 */
const MIN_ON_BACKGROUND = 3;
/**
 * What --pick aims for, as opposed to what the check enforces.
 *
 * The standard's 3:1 is a floor and this treats it as one. A ball that only
 * just cleared it — 4.0:1 against the obsidian, 3.1:1 against the felt — was
 * the one reported as hard to make out, so the search will not hand back a
 * palette built out of colours sitting on the line when the same gamut has
 * plenty that are not.
 */
const PREFER_ON_BACKGROUND = 4;
const MIN_NUMERAL = 4.5;

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

/** WCAG 2.x relative luminance, and the ratio between two of them. */
const luminance = (rgb) => {
  const [r, g, b] = rgb.map((v) => srgbToLinear(v / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

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

const picking = process.argv.includes('--pick');
const game = await openGame({ preserveDrawingBuffer: true, deviceScaleFactor: 3 });
let measured;
let candidates = null;
try {
  // The four-in-three board, because it is the one that racks every numbered
  // ball the palette defines — three solids and the stripe — so the numerals
  // can be measured on the balls they are actually printed on.
  await game.gotoBoard('budget');
  await game.page.waitForTimeout(700);
  measured = await game.page.evaluate((reserved) => {
    const g = window.__game;

    /** Read the framebuffer once and sample the balls' colour annulus. */
    // The projection constants, read once: the glyph pass needs them outside
    // the closure `shoot` builds its sampler in.
    const glc0 = document.getElementById('stage-canvas');
    const cam0 = g.tutorial.engine.camera;
    const W0 = glc0.clientWidth;
    const H0 = glc0.clientHeight;
    const visX0 = (cam0.right - cam0.left) / cam0.zoom;
    const visZ0 = (cam0.top - cam0.bottom) / cam0.zoom;

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
          done({ at, ctx, dpr });
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
      const { at, ctx, dpr } = await shoot();
      meaning.cue = at(g.player.x, g.player.z, g.player.radius);
      const felt = at(-5, 6, 0.48);
      // The obsidian outside the table: the top-left of the canvas, which is
      // reserve or letterbox and never felt.
      const corner = ctx.getImageData(Math.round(6 * dpr), Math.round(6 * dpr), 1, 1).data;
      const obsidian = [corner[0], corner[1], corner[2]];

      // THE NUMERALS, ON THE BALLS THEY ARE ACTUALLY PRINTED ON.
      //
      // Everything above repaints every ball one colour so each candidate is
      // measured under identical light. A numeral cannot be measured that way:
      // its ink is chosen FOR the ball it sits on, so the ball has to be
      // wearing its own colour and its own number.
      for (const e of g.rooms.scriptedEnemies) if (e.alive) e.setNumber(e.number);
      const { at: at2, ctx: ctx2, dpr: dpr2 } = await shoot();
      const glyphs = {};
      for (const e of g.rooms.scriptedEnemies) {
        if (!e.alive || !(e.number > 0)) continue;
        const body = at2(e.x, e.z, e.radius);
        const px = ((e.x - cam0.position.x) / visX0 + 0.5) * W0;
        const py = ((e.z - cam0.position.z) / visZ0 + 0.5) * H0;
        const rp = (e.radius / visZ0) * H0;
        // The glyph is a digit, so most of the disc it lives in is still ball.
        // The ink is the pixel that gets FURTHEST from the body — which is the
        // part of the numeral the eye is actually reading.
        const lum = (c) => {
          const f = (v) => (v / 255 <= 0.04045 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4);
          return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
        };
        // THE DIGIT AGAINST WHATEVER IT IS WRITTEN ON, which is the question
        // the eye is asking. Inside the numeral's disc there are exactly two
        // things — the strokes and their ground — so the darkest and lightest
        // pixels in it are those two, whether the ground is a printed disc or
        // the ball itself.
        let ink = null;
        let ground = null;
        for (let a = -6; a <= 6; a += 1) {
          for (let b = -6; b <= 6; b += 1) {
            const sx = px + (a / 6) * rp * 0.3;
            const sy = py + (b / 6) * rp * 0.3;
            const d = ctx2.getImageData(Math.round(sx * dpr2), Math.round(sy * dpr2), 1, 1).data;
            const p = [d[0], d[1], d[2]];
            if (!ink || lum(p) < lum(ink)) ink = p;
            if (!ground || lum(p) > lum(ground)) ground = p;
          }
        }
        glyphs[e.number] = { body, ink, ground };
      }
      return { balls, meaning, felt, obsidian, glyphs };
    })();
  }, RESERVED);
  if (picking) candidates = await pick(game.page);
} finally {
  await game.close();
}

/* ------------------------------------------------------------------ *
 * --pick — search the RENDERED gamut for a set that clears everything
 *
 * Choosing hexes by eye, or by distance between source values, is how this
 * palette went wrong twice. The renderer is not a straight pipe: emissive
 * material, rim lights, a bloom composite and a tone-free output stage between
 * them lift and compress a colour so far that the ordering of two source
 * values is not reliably the ordering of what lands on screen.
 *
 * So candidates are put THROUGH the renderer, sampled back, and judged on what
 * came out. Everything below is measured, nothing is assumed.
 * ------------------------------------------------------------------ */

function hsl(h, s, l) {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return (
    (Math.round(f(0) * 255) << 16) | (Math.round(f(8) * 255) << 8) | Math.round(f(4) * 255)
  );
}

async function pick(page) {
  const candidates = [];
  for (let h = 0; h < 360; h += 10) {
    for (const sat of [0.6, 0.8, 1]) {
      for (const light of [0.4, 0.5, 0.6, 0.7]) candidates.push(hsl(h, sat, light));
    }
  }
  process.stdout.write(`\nrendering ${candidates.length} candidates`);
  const seen = await page.evaluate(async (list) => {
    const g = window.__game;
    const glc = document.getElementById('stage-canvas');
    const cam = g.tutorial.engine.camera;
    const dpr = glc.width / glc.clientWidth;
    const W = glc.clientWidth;
    const H = glc.clientHeight;
    const visX = (cam.right - cam.left) / cam.zoom;
    const visZ = (cam.top - cam.bottom) / cam.zoom;
    const out = [];
    const c = document.createElement('canvas');
    c.width = glc.width;
    c.height = glc.height;
    const ctx = c.getContext('2d');
    const ball = g.rooms.scriptedEnemies.find((b) => b.alive);
    for (const colour of list) {
      for (const e of g.rooms.scriptedEnemies) {
        if (!e.alive) continue;
        e.material.color.setHex(colour);
        e.material.emissive.setHex(colour);
        e.markerMat?.color.setHex(colour);
      }
      await new Promise((r) => requestAnimationFrame(r));
      ctx.drawImage(glc, 0, 0);
      const px = ((ball.x - cam.position.x) / visX + 0.5) * W;
      const py = ((ball.z - cam.position.z) / visZ + 0.5) * H;
      const rp = (ball.radius / visZ) * H;
      const ring = (f) => {
        const pts = [];
        for (let a = 0; a < 12; a += 1) {
          const ang = (a / 12) * Math.PI * 2;
          const d = ctx.getImageData(
            Math.round((px + Math.cos(ang) * rp * f) * dpr),
            Math.round((py + Math.sin(ang) * rp * f) * dpr),
            1,
            1
          ).data;
          pts.push([d[0], d[1], d[2]]);
        }
        return [0, 1, 2].map((i) => pts.map((q) => q[i]).sort((a, b) => a - b)[6]);
      };
      out.push({ colour, rim: ring(0.8), face: ring(0.62) });
    }
    return out;
  }, candidates);
  process.stdout.write(' — measured\n');
  return seen;
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
  // WCAG 1.4.11 — a graphic you have to make out, against both of its grounds.
  for (const [what, bg] of [
    ['the felt', measured.felt],
    ['the obsidian', measured.obsidian]
  ]) {
    const c = contrast(measured.balls[n], bg);
    if (c < MIN_ON_BACKGROUND) {
      failures.push(
        `ball ${n} renders at only ${c.toFixed(2)}:1 against ${what} ` +
          `(WCAG 1.4.11 wants ${MIN_ON_BACKGROUND}:1)`
      );
    }
  }
}

// WCAG 1.4.3 — the numeral is small text on the ball it is printed on.
// WCAG 1.4.3 — the digit against the ground it is printed on, which since the
// numeral got its own disc (Enemy.numberTexture) is the disc rather than the
// ball. That the disc does not then swallow the ball is a different question,
// and the pair separations above are what answer it: they are sampled at 0.8
// of the radius, which is ball, and a disc that grew over them would show up
// there as four balls reading the same near-white. It has, twice.
for (const [n, g] of Object.entries(measured.glyphs ?? {})) {
  const c = contrast(g.ink, g.ground);
  if (c < MIN_NUMERAL) {
    failures.push(
      `the ${n}'s numeral renders at only ${c.toFixed(2)}:1 against its own ball ` +
        `(WCAG 1.4.3 wants ${MIN_NUMERAL}:1 for small text)`
    );
  }
}

/* ------------------------------------------------------------------ *
 * --pick — choose four out of what the renderer can actually show
 * ------------------------------------------------------------------ */

if (picking) {
  // HUE FAMILIES, NOT DISTANCES FROM ONE SWATCH. "Green means a pick-up" and
  // "red means it hurts" are rules about a family of colours, and a ball far
  // enough from the exact mint to pass a dE test can still be unmistakably
  // green. Cyan belongs to the cue ball for the same reason.
  const RESERVED_HUES = [
    [340, 20, 'danger red'],
    // Wide on the warm side on purpose: a chartreuse ball measures a long way
    // from the mint pick-up in every view and still reads as "the green one"
    // on a table where green means something.
    [80, 170, 'pick-up green'],
    [170, 200, 'cue cyan']
  ];
  const hueOf = ([r, g, b]) => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max === min) return 0;
    const d = max - min;
    const h =
      max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return ((h * 60) % 360 + 360) % 360;
  };
  const reserved = (rgb) => {
    const h = hueOf(rgb);
    return RESERVED_HUES.some(([a, b]) => (a > b ? h >= a || h <= b : h >= a && h <= b));
  };

  const usable = [];
  for (const c of candidates) {
    // Seen, not intended: a candidate is judged on the pixels it produced.
    if (contrast(c.face, measured.felt) < PREFER_ON_BACKGROUND) continue;
    if (contrast(c.face, measured.obsidian) < PREFER_ON_BACKGROUND) continue;
    if (reserved(c.rim)) continue;
    const lab = labsOf(c.rim);
    let clash = false;
    for (const [k, need] of Object.entries(MIN_MEANING)) {
      if (!ML[k]) continue;
      for (const v of ['normal', ...views]) {
        const bar = v === 'tritanopia' ? need * 0.7 : need;
        if (deltaE(lab[v], ML[k][v]) < bar) clash = true;
      }
    }
    if (clash) continue;
    if (deltaE(lab.normal, feltL.normal) < MIN_FELT) continue;
    usable.push({ ...c, lab });
  }

  /** How well two candidates are told apart, as a multiple of their floors. */
  const margin = (a, b) => {
    let worst = deltaE(a.lab.normal, b.lab.normal) / MIN_NORMAL;
    for (const v of views) worst = Math.min(worst, deltaE(a.lab[v], b.lab[v]) / MIN_CVD[v]);
    return worst;
  };

  // Thin to a spread-out shortlist first — four out of two hundred is nine
  // million combinations, and nearly all of them are two shades of the same
  // colour with a third thrown in.
  const shortlist = [];
  const pool = [...usable];
  while (shortlist.length < 26 && pool.length) {
    let best = 0;
    if (shortlist.length) {
      let bestScore = -Infinity;
      pool.forEach((c, i) => {
        const score = Math.min(...shortlist.map((k) => margin(c, k)));
        if (score > bestScore) {
          bestScore = score;
          best = i;
        }
      });
    }
    shortlist.push(pool.splice(best, 1)[0]);
  }

  let winner = null;
  for (let a = 0; a < shortlist.length; a += 1) {
    for (let b = a + 1; b < shortlist.length; b += 1) {
      for (let c = b + 1; c < shortlist.length; c += 1) {
        for (let d = c + 1; d < shortlist.length; d += 1) {
          const set = [shortlist[a], shortlist[b], shortlist[c], shortlist[d]];
          let worst = Infinity;
          for (let i = 0; i < 4; i += 1) {
            for (let j = i + 1; j < 4; j += 1) worst = Math.min(worst, margin(set[i], set[j]));
          }
          if (!winner || worst > winner.worst) winner = { set, worst };
        }
      }
    }
  }

  console.log(
    `\n${usable.length} of ${candidates.length} candidates clear the floors on their own; ` +
      `${shortlist.length} shortlisted\n`
  );
  if (!winner) {
    console.log('no set of four clears every pair — loosen a floor or widen the sweep\n');
    process.exit(1);
  }
  console.log('BEST SET  (source hex, and what the renderer makes of it)\n');
  for (const c of winner.set) {
    const src = `#${c.colour.toString(16).padStart(6, '0')}`;
    console.log(
      `  ${src}  renders ${hex(c.rim)}   ` +
        `on felt ${contrast(c.face, measured.felt).toFixed(1)}:1   ` +
        `on black ${contrast(c.face, measured.obsidian).toFixed(1)}:1`
    );
  }
  console.log(
    `\n  worst pair sits at ${winner.worst.toFixed(2)}x its floor ` +
      `(1.00 = exactly at the limit)\n`
  );
  process.exit(0);
}

/* ------------------------------------------------------------------ *
 * Report
 * ------------------------------------------------------------------ */

console.log('\nMEASURED OUT OF THE FRAMEBUFFER, not out of the source.\n');
console.log('BALL   RENDERS AS   ON FELT  ON BLACK  NUMERAL   CLOSEST BALL IT SHARES A TABLE WITH');
console.log('─'.repeat(94));
for (const n of ids) {
  const mine = rows.filter(
    (r) => r.shares && (r.pair.startsWith(`${n} `) || r.pair.endsWith(` ${n}`))
  );
  const worst = mine.reduce((a, b) => (b.norm < (a?.norm ?? Infinity) ? b : a), null);
  const g = measured.glyphs?.[n];
  const ratio = (v) => `${v.toFixed(1).padStart(4)}:1`;
  console.log(
    `  ${n}    ${hex(measured.balls[n])}     ` +
      `${ratio(contrast(measured.balls[n], measured.felt))}  ` +
      `${ratio(contrast(measured.balls[n], measured.obsidian))}  ` +
      `${g ? ratio(contrast(g.ink, g.ground)) : '     —'}   ` +
      (worst
        ? `dE ${worst.norm.toFixed(0)} normal / ${worst.d.toFixed(0)} ${worst.view.slice(0, 6)}  (${worst.pair})`
        : '—')
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
