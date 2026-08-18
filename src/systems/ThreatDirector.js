/**
 * ThreatDirector.js — the procedural half of room generation, on its own.
 *
 * Everything here is a pure function of (layout, level, seed). No scene, no
 * meshes, no Three.js: the same call that decides what a room contains at run
 * time also runs inside the level tool at /tool, so the tool can show an author
 * exactly what the game would roll onto a table they are editing — and, if they
 * like it, keep it as an authored wave.
 *
 * Splitting it out is the same move as pulling table geometry into
 * layouts.json. A tool that reimplements the rules it is a tool for will
 * eventually disagree with them, and it will be the tool that looks right.
 */

import { ARENA, ROOM, ENEMY } from '../config.js';

/* ------------------------------------------------------------------ *
 * Seeded RNG — mulberry32
 * ------------------------------------------------------------------ */

export function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A room's stream is derived from the run seed, so it is reproducible. */
export function roomSeed(runSeed, level) {
  return (runSeed ^ Math.imul(level, 0x9e3779b1)) >>> 0;
}

/* ------------------------------------------------------------------ *
 * Budget and composition
 * ------------------------------------------------------------------ */

export function budgetFor(level) {
  return Math.min(ROOM.baseBudget + ROOM.budgetPerLevel * (level - 1), ROOM.maxBudget);
}

export function waveCountFor(level) {
  return ROOM.waveCountByLevel[Math.min(level, ROOM.waveCountByLevel.length) - 1] || 1;
}

export function unlockedTypes(level) {
  return Object.keys(ROOM.unlock).filter((type) => level >= ROOM.unlock[type]);
}

/** Is a body of this radius intersecting any of the layout's geometry? */
function insideGeometry(layout, x, z, radius) {
  for (const c of layout.obstacles || []) {
    if (c.type === 'circle') {
      if (Math.hypot(x - c.x, z - c.z) < radius + c.radius) return true;
    } else {
      const cx = Math.min(Math.max(x, c.x - c.hw), c.x + c.hw);
      const cz = Math.min(Math.max(z, c.z - c.hh), c.z + c.hh);
      if (Math.hypot(x - cx, z - cz) < radius) return true;
    }
  }
  return false;
}

function clampX(x, radius) {
  const limit = ARENA.halfW - radius - 0.2;
  return Math.min(Math.max(x, -limit), limit);
}

function clampZ(z, radius) {
  const limit = ARENA.halfH - radius - 0.2;
  return Math.min(Math.max(z, -limit), limit);
}

/** Draw one archetype, biased by the layout's tags and by depth. */
export function weightedType(rng, types, tags, level) {
  const weights = types.map((type) => {
    let w = ROOM.weight[type] ?? 1;
    // Layout tags bias composition toward what the geometry teaches.
    if (tags.includes('shooter') && type === 'stripe') w *= 1.8;
    if (tags.includes('tank') && type === 'heavy') w *= 1.8;
    if (tags.includes('dense') && type === 'solid') w *= 1.5;
    if (tags.includes('pinball') && type === 'solid') w *= 1.3;
    // Heavies become more common with depth.
    if (type === 'heavy') w *= 1 + (level - ROOM.unlock.heavy) * 0.08;
    return Math.max(w, 0.01);
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = rng() * total;
  for (let i = 0; i < types.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return types[i];
  }
  return types[types.length - 1];
}

/** Bind a composition to the layout's anchors, never inside the safe radius. */
export function assignAnchors(rng, composition, layout) {
  const spawnPoint = layout.spawn;
  const candidates = layout.anchors
    .filter((a) => Math.hypot(a.x - spawnPoint.x, a.z - spawnPoint.z) >= ROOM.safeSpawnRadius)
    .slice();

  // Fisher-Yates with the seeded RNG so anchor order is reproducible.
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  return composition.map((type, index) => {
    const anchor = candidates[index % candidates.length] || { x: 0, z: -10 };
    // Jitter so repeat anchors never stack exactly.
    const spread = index >= candidates.length ? 1.6 : 0.5;
    const radius = ENEMY[type].radius;

    // Re-jitter off any anchor that would drop a body inside the table's own
    // geometry. A shooter buried in a pillar fires into the inside of it and
    // its bullets die on their first substep, which looks like a gun that does
    // not work rather than a spawn that went wrong.
    let x = clampX(anchor.x + (rng() - 0.5) * spread, radius);
    let z = clampZ(anchor.z + (rng() - 0.5) * spread, radius);
    for (let attempt = 0; attempt < 12 && insideGeometry(layout, x, z, radius + 0.35); attempt++) {
      const angle = rng() * Math.PI * 2;
      const push = 1.2 + attempt * 0.6;
      x = clampX(anchor.x + Math.cos(angle) * push, radius);
      z = clampZ(anchor.z + Math.sin(angle) * push, radius);
    }
    return { type, x, z };
  });
}

/**
 * Spend the level's budget across its waves and bind each pick to an anchor.
 *
 * A layout may instead author its waves outright, in which case they are used
 * verbatim — the whole point of placing an enemy in the level tool is that the
 * enemy shows up where it was placed.
 *
 * @param {object} layout a layout record from layouts.json
 * @param {number} level  1-based room number
 * @param {() => number} rng seeded stream
 * @returns {Array<Array<{type: string, x: number, z: number}>>}
 */
export function buildWaves(layout, level, rng) {
  if (layout.waves && layout.waves.length) {
    return layout.waves.map((wave) => wave.map((slot) => ({ ...slot })));
  }

  const budget = budgetFor(level);
  const waveCount = waveCountFor(level);

  // Later waves get a slightly larger share so rooms escalate.
  const shares = [];
  let total = 0;
  for (let i = 0; i < waveCount; i++) {
    const share = 1 + i * 0.35;
    shares.push(share);
    total += share;
  }

  const unlocked = unlockedTypes(level);
  const tags = layout.tags || [];

  const waves = [];
  for (let w = 0; w < waveCount; w++) {
    let remaining = Math.max(2, Math.round((budget * shares[w]) / total));
    const composition = [];
    let guard = 0;
    while (remaining > 0 && guard++ < 64) {
      const affordable = unlocked.filter((type) => ENEMY[type].cost <= remaining);
      if (!affordable.length) break;
      const type = weightedType(rng, affordable, tags, level);
      composition.push(type);
      remaining -= ENEMY[type].cost;
    }
    waves.push(assignAnchors(rng, composition, layout));
  }
  return waves;
}
