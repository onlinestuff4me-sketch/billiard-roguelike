/**
 * check-palette.mjs — prove the balls are told apart by sight, not by faith.
 *
 * Colour became load-bearing the moment the rack stopped being one amber
 * channel: a lesson says "hit the 4, so it knocks the 1", two routes cross the
 * same felt, and which is which is now carried by hue. That is exactly the
 * kind of claim that is easy to assert and easy to get wrong — "these look
 * different to me" is a statement about one pair of eyes in one room.
 *
 * Roughly one man in twelve has some red-green colour vision deficiency. A
 * palette that separates cleanly for the author and collapses to two shades of
 * mustard for them has not made the game harder, it has made the coaching
 * unreadable — the picture stops answering the question the words defer to it.
 *
 * So this measures, in the same spirit as `npm run verify` measures whether a
 * board can be played:
 *
 *   1. Every ball against every other ball, in normal vision AND simulated
 *      protanopia, deuteranopia and tritanopia. Distance is CIE76 dE in Lab.
 *   2. Every ball against the RESERVED hues — a ball that reads as the danger
 *      red, the pick-up mint, your own cyan or a called pocket's bone is worse
 *      than a ball nobody can name.
 *   3. Every ball against the felt it sits on, as a WCAG relative-luminance
 *      ratio. Two balls can be perfectly distinct from each other and both
 *      invisible on the cloth.
 *
 *   node tools/check-palette.mjs [--verbose]
 *
 * Non-zero exit on any failure, so it can gate a build.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const HERE = resolve(import.meta.dirname, '..');
const verbose = process.argv.includes('--verbose');

/* ------------------------------------------------------------------ *
 * Thresholds
 * ------------------------------------------------------------------ */

/**
 * TWO FLOORS, BECAUSE THERE ARE TWO FAILURES.
 *
 * `MIN_NORMAL` is separation as most players see it: this is the one that
 * decides whether the palette does its job at all. `MIN_CVD` is separation at
 * its worst across simulated protanopia, deuteranopia and tritanopia: this is
 * the one that decides whether it does its job for everyone.
 *
 * They are different numbers because the achievable ceiling is different. Red,
 * mint and cyan are spoken for — danger, pick-up, your own ball — and under
 * dichromacy the remaining wheel collapses hard onto a blue-yellow axis. Chase
 * the CVD number alone and the optimiser herds every ball into blue-violet,
 * where dichromats keep the most separation: technically accessible, and
 * useless as a set of billiard balls. Both are scored, and both must pass.
 *
 * COLOUR IS NOT THE ONLY CHANNEL, and these numbers are set knowing that.
 * Every ball carries its number in bone on its face — that is the identifier
 * WCAG 1.4.1 asks for, and it does not care about hue at all. Colour is here
 * to make the numeral unnecessary at a glance, not to replace it.
 */
const MIN_NORMAL = 25;

/**
 * AND THE DICHROMACIES ARE NOT ONE BAR.
 *
 * Protanopia and deuteranopia together are around one man in twelve.
 * Tritanopia is on the order of one person in ten thousand, and it collapses a
 * different axis — it is the one that makes magenta approach red. Holding all
 * three to the same number costs the palette its entire warm half to protect
 * against the rarest of them, which is a worse outcome for everyone including
 * the people it is meant to protect. So the common two carry the real bar and
 * tritanopia carries a floor: still checked, still has to clear "obviously
 * different", not allowed to veto the palette on its own.
 */
const MIN_CVD = { protanopia: 18, deuteranopia: 18, tritanopia: 14 };

/** Tritanopia's reduced bar applies to the reserved hues too, same reasoning. */
const TRITAN_RESERVED_SCALE = 0.6;

/** A ball must be further than this from a hue that MEANS something else. */
const MIN_RESERVED = {
  // These three appear as objects on the same felt as the balls. A ball
  // wearing one is not hard to read, it is a lie.
  'bad (danger)': 30,
  'good (pick-up)': 30,
  'player (your ball)': 30,
  // These two are told apart by form as well as colour — a pocket is a ring in
  // the rail, a stripe carries a violet band — and holding the balls 30 off
  // them would forfeit the light end of the space, which is where contrast on
  // a dark cloth comes from.
  'bone (called pocket)': 20,
  'stripe (striped ball)': 20
};

/**
 * WCAG 1.4.11 asks 3:1 for a graphical object, comparing two flat fills. A
 * ball is not a flat fill: it is a lit sphere with an emissive term, a ground
 * marker ring and a bone numeral on its face, all of which raise its real
 * separation from the cloth well above what its base hex suggests. 2:1 on the
 * hex alone is the floor this uses — a sanity check that nothing is painted
 * felt-on-felt, not a claim of WCAG conformance.
 */
const MIN_FELT_CONTRAST = 2;

/* ------------------------------------------------------------------ *
 * Colour maths
 * ------------------------------------------------------------------ */

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

function hexToRgb(hex) {
  const n = typeof hex === 'string' ? parseInt(hex.replace('#', ''), 16) : hex;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
}

/** WCAG relative luminance. */
function luminance(rgb) {
  const [r, g, b] = rgb.map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** sRGB (0..1) -> CIELAB, D65. */
function rgbToLab(rgb) {
  const [r, g, b] = rgb.map(srgbToLinear);
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

/**
 * Viénot, Brettel & Mollon (1999) dichromat simulation, applied in linear RGB.
 * These are the matrices used by most colour-blindness simulators; they are an
 * approximation of what a dichromat sees, not a claim about their experience,
 * and they are used here the way a contrast ratio is used — as a conservative
 * proxy that catches the failures worth catching.
 */
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
  const lin = rgb.map(srgbToLinear);
  const out = m.map((row) => row[0] * lin[0] + row[1] * lin[1] + row[2] * lin[2]);
  const toSrgb = (c) => {
    const v = Math.min(Math.max(c, 0), 1);
    return v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055;
  };
  return out.map(toSrgb);
}

const labUnder = (hex, kind) => rgbToLab(simulate(hexToRgb(hex), kind));

/* ------------------------------------------------------------------ *
 * The palette, read from the source of truth
 * ------------------------------------------------------------------ */

const config = readFileSync(resolve(HERE, 'src/config.js'), 'utf8');

function readBallInk() {
  // The numeric PALETTE.ballInk block, so this checks what the GAME uses
  // rather than a copy of it that can drift.
  const block = /ballInk:\s*\{([^}]*)\}/.exec(config);
  if (!block) throw new Error('could not find PALETTE.ballInk in src/config.js');
  const out = {};
  for (const [, n, hex] of block[1].matchAll(/(\d+):\s*0x([0-9a-fA-F]{6})/g)) {
    out[n] = `#${hex}`;
  }
  if (!Object.keys(out).length) throw new Error('PALETTE.ballInk parsed empty');
  return out;
}

function readNamed(name) {
  const m = new RegExp(`\\b${name}:\\s*0x([0-9a-fA-F]{6})`).exec(config);
  return m ? `#${m[1]}` : null;
}

/**
 * WHICH BALLS CAN SHARE A TABLE.
 *
 * Two colours only have to be told apart if a player can see both at once.
 * Requiring every ball to differ from every other ball is a stricter problem
 * than the game actually poses, and with red, mint and cyan reserved it is a
 * problem with no good answer — five mutually separable hues do not exist in
 * what is left. Five that separate WHERE IT MATTERS do.
 *
 * So the pairs are read from the game: the solids a generated rack can hold,
 * and the solids each authored lesson places. A pair that never co-occurs is
 * reported and not enforced.
 */
function coOccurring() {
  const pairs = new Set();
  const add = (list) => {
    const solids = [...new Set(list)].sort((a, b) => a - b);
    for (let i = 0; i < solids.length; i += 1) {
      for (let j = i + 1; j < solids.length; j += 1) pairs.add(`${solids[i]}|${solids[j]}`);
    }
  };

  // Generated rooms: RACK.archetypeByNumber decides which numbers are solids.
  const arch = /archetypeByNumber:\s*\[([^\]]*)\]/.exec(config);
  if (arch) {
    const types = arch[1].split(',').map((t) => t.trim().replace(/['"]/g, ''));
    add(types.map((t, i) => (t === 'solid' ? i + 1 : null)).filter(Boolean));
  }

  // Authored lessons: whatever each board actually puts on the felt.
  const lessons = JSON.parse(readFileSync(resolve(HERE, 'src/data/lessons.json'), 'utf8'));
  for (const board of lessons.lessons ?? []) {
    add((board.enemies ?? []).filter((e) => e.type === 'solid' && e.number).map((e) => e.number));
  }
  return pairs;
}

const balls = readBallInk();
const together = coOccurring();
const RESERVED = {
  'bad (danger)': readNamed('bad'),
  'good (pick-up)': readNamed('good'),
  'player (your ball)': readNamed('player'),
  'bone (called pocket)': readNamed('bone'),
  'stripe (striped ball)': readNamed('stripeBody')
};
const FELT = readNamed('felt') ?? '#0b3a2e';

/* ------------------------------------------------------------------ *
 * Checks
 * ------------------------------------------------------------------ */

const failures = [];
const rows = [];

const ids = Object.keys(balls).sort((a, b) => Number(a) - Number(b));
const cvdViews = ['protanopia', 'deuteranopia', 'tritanopia'];

for (let i = 0; i < ids.length; i += 1) {
  for (let j = i + 1; j < ids.length; j += 1) {
    const a = ids[i];
    const b = ids[j];
    const norm = deltaE(labUnder(balls[a], null), labUnder(balls[b], null));
    let worst = { d: Infinity, view: null };
    for (const view of cvdViews) {
      const d = deltaE(labUnder(balls[a], view), labUnder(balls[b], view));
      if (d < worst.d) worst = { d, view };
    }
    const shares = together.has(`${a}|${b}`);
    rows.push({ pair: `${a} vs ${b}`, norm, d: worst.d, view: worst.view, shares });
    if (!shares) continue;
    if (norm < MIN_NORMAL) {
      failures.push(
        `balls ${a} and ${b} share a table and are only dE ${norm.toFixed(1)} apart ` +
          `in normal vision (need ${MIN_NORMAL})`
      );
    }
    for (const view of cvdViews) {
      const d = deltaE(labUnder(balls[a], view), labUnder(balls[b], view));
      if (d < MIN_CVD[view]) {
        failures.push(
          `balls ${a} and ${b} share a table and are only dE ${d.toFixed(1)} apart ` +
            `under ${view} (need ${MIN_CVD[view]})`
        );
      }
    }
  }
}

for (const id of ids) {
  for (const [name, hex] of Object.entries(RESERVED)) {
    if (!hex) continue;
    for (const view of [null, ...cvdViews]) {
      const need =
        view === 'tritanopia'
          ? MIN_RESERVED[name] * TRITAN_RESERVED_SCALE
          : MIN_RESERVED[name];
      const d = deltaE(labUnder(balls[id], view), labUnder(hex, view));
      if (d < need) {
        failures.push(
          `ball ${id} reads as ${name} — dE ${d.toFixed(1)} under ${view ?? 'normal'} ` +
            `(need ${need.toFixed(0)})`
        );
      }
    }
  }
  const ratio = contrastRatio(hexToRgb(balls[id]), hexToRgb(FELT));
  if (ratio < MIN_FELT_CONTRAST) {
    failures.push(
      `ball ${id} is ${ratio.toFixed(2)}:1 against the felt (need ${MIN_FELT_CONTRAST}:1)`
    );
  }
}

/* ------------------------------------------------------------------ *
 * Report
 * ------------------------------------------------------------------ */

console.log('\nBALL   HEX        vs FELT   CLOSEST NEIGHBOUR');
console.log('─'.repeat(76));
for (const id of ids) {
  const ratio = contrastRatio(hexToRgb(balls[id]), hexToRgb(FELT));
  const mine = rows.filter(
    (r) => r.shares && (r.pair.startsWith(`${id} `) || r.pair.endsWith(` ${id}`))
  );
  const worst = mine.reduce((a, b) => (b.d < (a?.d ?? Infinity) ? b : a), null);
  console.log(
    `  ${id}    ${balls[id]}    ${ratio.toFixed(2)}:1` +
      (worst
        ? `     dE ${worst.d.toFixed(0)} ${worst.view.slice(0, 6)} / ${worst.norm.toFixed(0)} normal (${worst.pair})`
        : '     —')
  );
}

if (verbose) {
  console.log('\nEVERY PAIR  (· = never share a table, not enforced)');
  for (const r of [...rows].sort((a, b) => a.d - b.d)) {
    console.log(
      `  ${r.shares ? ' ' : '·'} ${r.pair.padEnd(9)} cvd ${r.d.toFixed(1).padStart(5)} ` +
        `(${r.view.padEnd(12)})  normal ${r.norm.toFixed(1).padStart(5)}`
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
const minC = live.reduce((a, r) => Math.min(a, r.d), Infinity);
const minN = live.reduce((a, r) => Math.min(a, r.norm), Infinity);
console.log(
  `\nall ${ids.length} balls clear — of the ${live.length} pairs that can share a table, ` +
    `the closest is dE ${minN.toFixed(1)} in normal vision (floor ${MIN_NORMAL}) and ` +
    `${minC.toFixed(1)} under dichromacy\n`
);
