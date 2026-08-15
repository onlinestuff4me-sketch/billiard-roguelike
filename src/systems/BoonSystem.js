/**
 * BoonSystem.js — the 4-phase modular boon engine.
 *
 * A boon is not a stat line; it is a hook into one of the four phases of a
 * stroke. Every boon registers into exactly one dispatch point:
 *
 *   LAUNCH      fires the instant the slingshot releases
 *   TRAJECTORY  fires every physics tick while the cue ball is airborne
 *   IMPACT      fires on every damaging collision
 *   REBOUND     fires on every rail / obstacle contact
 *
 * Boons may additionally contribute passive numbers to an aggregated stat
 * block, which Player and the damage model read every frame. Because each
 * phase has a distinct dispatch site, synergy is emergent: Trickshot (more
 * banks) multiplies Ricochet Fuse (detonations per bank) multiplies Chain Arc
 * (each detonation is an impact).
 *
 * Boons never touch the renderer directly — they call `game.dealDamage()` and
 * `game.fx.*`, so the whole registry stays declarative and testable.
 */

import * as THREE from 'three';
import { BOONS, PHYSICS, FOCUS, PLAYER, PALETTE } from '../config.js';

/* ------------------------------------------------------------------ *
 * Stat aggregation
 * ------------------------------------------------------------------ */

function baseStats() {
  return {
    damageMult: 1,
    maxBounces: PHYSICS.baseMaxBounces,
    focusMax: FOCUS.max,
    pierceRetention: PLAYER.pierceRetention,
    launchSpeedMult: 1,
    focusRegenMult: 1,
    /** Extra damage fraction per rail already banked this launch. */
    bankDamageBonus: 0,
    /** Extra damage fraction on the first hit of a launch. */
    firstHitBonus: 0,
    /** Extra multiplier stacked on top of a backstab. */
    backstabBonus: 0
  };
}

const MERGE = {
  damageMult: 'mul',
  launchSpeedMult: 'mul',
  focusRegenMult: 'mul',
  maxBounces: 'add',
  focusMax: 'add',
  bankDamageBonus: 'add',
  firstHitBonus: 'add',
  backstabBonus: 'add',
  pierceRetention: 'max'
};

function mergeStats(target, patch) {
  for (const key of Object.keys(patch)) {
    const mode = MERGE[key] || 'add';
    const value = patch[key];
    if (mode === 'mul') target[key] *= value;
    else if (mode === 'max') target[key] = Math.max(target[key], value);
    else target[key] += value;
  }
  return target;
}

const pct = (v) => `${Math.round(v * 100)}%`;

/* ------------------------------------------------------------------ *
 * Helpers shared by boon effects
 * ------------------------------------------------------------------ */

function enemiesWithin(game, x, z, radius, exclude = null) {
  const out = [];
  const r2 = radius * radius;
  for (const enemy of game.enemies) {
    if (!enemy.alive || enemy === exclude) continue;
    const dx = enemy.x - x;
    const dz = enemy.z - z;
    if (dx * dx + dz * dz <= r2) out.push(enemy);
  }
  return out;
}

function nearestEnemies(game, x, z, radius, count, exclude = null) {
  return enemiesWithin(game, x, z, radius, exclude)
    .map((e) => ({ e, d: Math.hypot(e.x - x, e.z - z) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, count)
    .map((entry) => entry.e);
}

function knockAway(enemy, x, z, speed) {
  const dx = enemy.x - x;
  const dz = enemy.z - z;
  const len = Math.hypot(dx, dz) || 1;
  enemy.applyKnock((dx / len) * speed, (dz / len) * speed);
}

/* ------------------------------------------------------------------ *
 * The registry — 12 boons, 3 per phase
 * ------------------------------------------------------------------ */

export const BOON_DEFS = [
  /* ---------------------------- LAUNCH ---------------------------- */
  {
    id: 'ignition',
    name: 'Ignition',
    phase: 'launch',
    glyph: '▲',
    flavour: 'The band leaves embers.',
    values: (rank, scalar) => ({
      radius: 2.6 + 0.35 * rank,
      dps: 26 * scalar * rank,
      duration: 3.0 + 0.6 * rank
    }),
    desc: (v) =>
      `Leaves a burning zone at the launch point: ${Math.round(v.dps)} dmg/s for ${v.duration.toFixed(
        1
      )}s.`,
    effect: () => 'Leave a pool of fire behind',
    numbers: (v) => `${Math.round(v.dps)} dmg/sec · ${v.duration.toFixed(1)}s · ${v.radius.toFixed(1)}m`,
    run(event, v, game) {
      game.boons.spawnField({
        x: event.x,
        z: event.z,
        radius: v.radius,
        dps: v.dps,
        life: v.duration,
        color: PALETTE.hazard
      });
    }
  },
  {
    id: 'recoil-nova',
    name: 'Recoil Nova',
    phase: 'launch',
    glyph: '◎',
    flavour: 'Every action has an equal and violent reaction.',
    values: (rank, scalar) => ({
      radius: 3.6 + 0.5 * rank,
      damage: 16 * scalar * rank,
      knock: 16 + 3 * rank
    }),
    desc: (v) =>
      `Launching detonates a shockwave: ${Math.round(v.damage)} dmg and heavy knockback within ${v.radius.toFixed(
        1
      )}m.`,
    effect: () => 'Blast enemies away as you launch',
    numbers: (v) => `${Math.round(v.damage)} damage · ${v.radius.toFixed(1)}m · knocks back`,
    run(event, v, game) {
      const hits = enemiesWithin(game, event.x, event.z, v.radius);
      game.fx.shockwave(event.x, event.z, PALETTE.player, v.radius * 1.6, 0.4);
      for (const enemy of hits) {
        game.dealDamage(enemy, v.damage, { source: 'boon', fromX: event.x, fromZ: event.z });
        knockAway(enemy, event.x, event.z, v.knock);
      }
      if (hits.length) game.audio.impact(0.5);
    }
  },
  {
    id: 'break-pulse',
    name: 'Break Pulse',
    phase: 'launch',
    glyph: '⟐',
    flavour: 'The break is the whole game.',
    values: (rank, scalar) => ({ bonus: 0.45 * scalar * rank }),
    desc: (v) => `The first hit of every launch deals +${pct(v.bonus)} damage.`,
    effect: () => 'Your first hit each shot hits harder',
    numbers: (v) => `+${pct(v.bonus)} damage`,
    stats: (v) => ({ firstHitBonus: v.bonus }),
    run() {
      /* Passive: consumed by the damage model via stats.firstHitBonus. */
    }
  },

  /* -------------------------- TRAJECTORY -------------------------- */
  {
    id: 'blade-rift',
    name: 'Blade Rift',
    phase: 'trajectory',
    glyph: '≡',
    flavour: 'The line itself cuts.',
    values: (rank, scalar) => ({ radius: 1.5 + 0.18 * rank, dps: 34 * scalar * rank }),
    desc: (v) => `Your flight path shreds: ${Math.round(v.dps)} dmg/s to anything you pass.`,
    effect: () => 'Damage everything you fly through',
    numbers: (v) => `${Math.round(v.dps)} dmg/sec · ${v.radius.toFixed(1)}m trail`,
    run(event, v, game) {
      const player = event.player;
      if (player.speed < PLAYER.settleSpeed) return;
      const targets = enemiesWithin(game, player.x, player.z, v.radius + player.radius);
      for (const enemy of targets) {
        game.dealDamage(enemy, v.dps * event.dt, {
          source: 'rift',
          silent: true,
          fromX: player.x,
          fromZ: player.z
        });
      }
      if (targets.length && Math.random() < 0.4) {
        game.fx.burst(player.x, player.z, 2, PALETTE.aim, 5, 0.5);
      }
    }
  },
  {
    id: 'aegis',
    name: 'Aegis',
    phase: 'trajectory',
    glyph: '⌒',
    flavour: 'Forward is the safest direction.',
    values: (rank, scalar) => ({ radius: 2.2 + 0.4 * rank, cone: 0.2 + 0.1 * scalar }),
    desc: (v) =>
      `A frontal deflection shield destroys enemy shots within ${v.radius.toFixed(1)}m while airborne.`,
    effect: () => 'Destroy enemy shots in your path',
    numbers: (v) => `${v.radius.toFixed(1)}m shield · only while flying`,
    run(event, v, game) {
      const player = event.player;
      const speed = player.speed;
      if (speed < PLAYER.settleSpeed) return;
      const fx = player.vx / speed;
      const fz = player.vz / speed;
      for (const projectile of game.projectiles) {
        if (!projectile.alive) continue;
        const dx = projectile.x - player.x;
        const dz = projectile.z - player.z;
        const dist = Math.hypot(dx, dz);
        if (dist > v.radius + player.radius) continue;
        const dot = dist > 0 ? (dx / dist) * fx + (dz / dist) * fz : 1;
        if (dot < 0.2 - v.cone) continue; // behind the shield arc
        projectile.alive = false;
        game.fx.burst(projectile.x, projectile.z, 8, PALETTE.player, 8, 0.6);
        game.audio.rebound(0.7);
      }
    }
  },
  {
    id: 'phase-drift',
    name: 'Phase Drift',
    phase: 'trajectory',
    glyph: '⇢',
    flavour: 'Bodies are a suggestion.',
    values: (rank, scalar) => ({
      retention: Math.min(0.99, PLAYER.pierceRetention + 0.05 * scalar * rank),
      speed: 1 + 0.06 * scalar * rank
    }),
    desc: (v) =>
      `Pierce with ${pct(v.retention)} speed retained and launch ${pct(v.speed - 1)} faster.`,
    effect: () => 'Keep your speed after a kill',
    numbers: (v) => `${pct(v.retention)} speed kept · +${pct(v.speed - 1)} launch speed`,
    stats: (v) => ({ pierceRetention: v.retention, launchSpeedMult: v.speed }),
    run() {
      /* Passive. */
    }
  },

  /* ---------------------------- IMPACT ---------------------------- */
  {
    id: 'chain-arc',
    name: 'Chain Arc',
    phase: 'impact',
    glyph: '⚡',
    flavour: 'Contact is a conductor.',
    values: (rank, scalar) => ({
      targets: 1 + rank,
      radius: 5.0 + 0.5 * rank,
      damage: 14 * scalar * rank
    }),
    desc: (v) =>
      `Impacts zap ${v.targets} nearby target${v.targets > 1 ? 's' : ''} for ${Math.round(
        v.damage
      )} damage.`,
    effect: (v) => `Lightning jumps to ${v.targets} more enem${v.targets > 1 ? 'ies' : 'y'}`,
    numbers: (v) => `${Math.round(v.damage)} damage each · ${v.radius.toFixed(1)}m reach`,
    run(event, v, game) {
      const targets = nearestEnemies(game, event.x, event.z, v.radius, v.targets, event.enemy);
      for (const enemy of targets) {
        game.fx.zap(event.x, event.z, enemy.x, enemy.z, PALETTE.aim);
        game.dealDamage(enemy, v.damage, {
          source: 'arc',
          fromX: event.x,
          fromZ: event.z
        });
      }
    }
  },
  {
    id: 'shatter-crit',
    name: 'Shatter Crit',
    phase: 'impact',
    glyph: '✶',
    flavour: 'Hit them where the shield is not.',
    values: (rank, scalar) => ({ bonus: 1.0 * scalar * rank }),
    desc: (v) => `Backstabs deal an additional +${pct(v.bonus)} damage.`,
    effect: () => 'Hits from behind do far more',
    numbers: (v) => `+${pct(v.bonus)} backstab damage`,
    stats: (v) => ({ backstabBonus: v.bonus }),
    run(event, v, game) {
      if (!event.result?.backstab) return;
      game.fx.shockwave(event.x, event.z, PALETTE.heavy, 3.4, 0.32);
    }
  },
  {
    id: 'concussive',
    name: 'Concussive',
    phase: 'impact',
    glyph: '◇',
    flavour: 'Make your own caroms.',
    values: (rank, scalar) => ({ radius: 3.2 + 0.4 * rank, knock: 15 + 4 * scalar * rank }),
    desc: (v) => `Impacts blast neighbours outward at ${Math.round(v.knock)} m/s — free caroms.`,
    effect: () => 'Knock nearby enemies flying',
    numbers: (v) => `${Math.round(v.knock)} m/s blast · ${v.radius.toFixed(1)}m · makes caroms`,
    run(event, v, game) {
      const targets = enemiesWithin(game, event.x, event.z, v.radius, event.enemy);
      if (!targets.length) return;
      game.fx.shockwave(event.x, event.z, PALETTE.player, v.radius * 1.5, 0.3);
      for (const enemy of targets) knockAway(enemy, event.x, event.z, v.knock);
    }
  },

  /* --------------------------- REBOUND ---------------------------- */
  {
    id: 'trickshot',
    name: 'Trickshot',
    phase: 'rebound',
    glyph: '⤡',
    flavour: 'Two rails, one answer.',
    values: (rank, scalar) => ({
      bounces: 2 * rank,
      damage: 0.5 * scalar * rank
    }),
    desc: (v) => `+${v.bounces} wall bounces and +${pct(v.damage)} damage per rail banked.`,
    effect: () => 'Bank more, and hit harder each time',
    numbers: (v) => `+${v.bounces} bounces · +${pct(v.damage)} damage per bank`,
    stats: (v) => ({ maxBounces: v.bounces, bankDamageBonus: v.damage }),
    run(event, v, game) {
      game.fx.burst(event.x, event.z, 6, PALETTE.carom, 7, 0.6);
    }
  },
  {
    id: 'ricochet-fuse',
    name: 'Ricochet Fuse',
    phase: 'rebound',
    glyph: '✷',
    flavour: 'Leave something behind at every cushion.',
    values: (rank, scalar) => ({ radius: 3.0 + 0.4 * rank, damage: 22 * scalar * rank }),
    desc: (v) => `Each bank detonates for ${Math.round(v.damage)} damage within ${v.radius.toFixed(1)}m.`,
    effect: () => 'Every wall bounce explodes',
    numbers: (v) => `${Math.round(v.damage)} damage · ${v.radius.toFixed(1)}m`,
    run(event, v, game) {
      game.fx.shockwave(event.x, event.z, PALETTE.hazard, v.radius * 1.6, 0.34);
      game.fx.burst(event.x, event.z, 10, PALETTE.hazard, 9, 0.8);
      game.audio.impact(0.45);
      for (const enemy of enemiesWithin(game, event.x, event.z, v.radius)) {
        game.dealDamage(enemy, v.damage, {
          source: 'fuse',
          fromX: event.x,
          fromZ: event.z,
          banked: true
        });
      }
    }
  },
  {
    id: 'kinetic-bank',
    name: 'Kinetic Bank',
    phase: 'rebound',
    glyph: '⇑',
    flavour: 'The cushion gives more than it takes.',
    values: (rank, scalar) => ({ boost: 1 + 0.14 * scalar * rank, cap: 58 }),
    desc: (v) => `Banks accelerate you by ${pct(v.boost - 1)} instead of bleeding speed.`,
    effect: () => 'Speed up every time you bank',
    numbers: (v) => `+${pct(v.boost - 1)} speed per bounce`,
    run(event, v, game) {
      const player = event.player;
      const speed = player.speed;
      if (speed < 1) return;
      const target = Math.min(speed * v.boost, v.cap);
      const scale = target / speed;
      player.vx *= scale;
      player.vz *= scale;
      game.fx.burst(event.x, event.z, 5, PALETTE.bumper, 8, 0.5);
    }
  }
];

export const BOONS_BY_ID = new Map(BOON_DEFS.map((def) => [def.id, def]));

export const PHASE_LABEL = {
  launch: 'Launch',
  trajectory: 'Trajectory',
  impact: 'Impact',
  rebound: 'Rebound'
};

/**
 * Player-facing trigger text.
 *
 * The internal phase names are engine vocabulary — "Impact" and "Launch" mean
 * something precise at the dispatch site and nothing at all to someone reading
 * a card for the first time. The reward screen exists to be decided in about a
 * second, so it says plainly *when* an upgrade fires instead.
 */
export const TRIGGER_LABEL = {
  launch: 'When you launch',
  trajectory: 'While flying',
  impact: 'When you hit',
  rebound: 'When you bounce'
};

/* ------------------------------------------------------------------ *
 * BoonSystem
 * ------------------------------------------------------------------ */

export class BoonSystem {
  /**
   * @param {object} game shared context (needs scene, fx, audio, dealDamage)
   */
  constructor(game) {
    this.game = game;
    /** @type {Array<{def: object, rank: number, rarity: string, values: object}>} */
    this.owned = [];
    this.stats = baseStats();
    /** Flat bonuses granted by door stat rewards, outside the boon registry. */
    this.runBonus = {};
    /** Persistent ground effects spawned by boons (Ignition). */
    this.fields = [];
    this.fieldGroup = new THREE.Group();
    game.scene.add(this.fieldGroup);
    this._fieldGeo = new THREE.CircleGeometry(1, 28);
    // Seed the player's stat block immediately so every key exists from frame 0.
    this.recompute();
  }

  /* ---------------------------------------------------------------- *
   * Build state
   * ---------------------------------------------------------------- */

  rankOf(id) {
    const entry = this.owned.find((o) => o.def.id === id);
    return entry ? entry.rank : 0;
  }

  has(id) {
    return this.rankOf(id) > 0;
  }

  /** All owned boons that hook a given phase. */
  hooksFor(phase) {
    return this.owned.filter((o) => o.def.phase === phase);
  }

  /**
   * Grant a boon (or level an owned one).
   * @param {object} offer { def, rarity }
   */
  grant(offer) {
    const def = typeof offer.def === 'string' ? BOONS_BY_ID.get(offer.def) : offer.def;
    if (!def) return null;
    const rarity = offer.rarity || 'common';
    const existing = this.owned.find((o) => o.def.id === def.id);
    if (existing) {
      existing.rank = Math.min(existing.rank + 1, BOONS.maxRank);
      // Keep the better rarity scalar when a boon is levelled.
      if (BOONS.rarity[rarity].scalar > BOONS.rarity[existing.rarity].scalar) {
        existing.rarity = rarity;
      }
      existing.values = def.values(existing.rank, BOONS.rarity[existing.rarity].scalar);
      this.recompute();
      return existing;
    }
    const entry = {
      def,
      rank: 1,
      rarity,
      values: def.values(1, BOONS.rarity[rarity].scalar)
    };
    this.owned.push(entry);
    this.recompute();
    return entry;
  }

  /** Flat run bonuses from door rewards (focus, damage, bounces). */
  addRunBonus(patch) {
    for (const key of Object.keys(patch)) {
      const mode = MERGE[key] || 'add';
      if (mode === 'mul') this.runBonus[key] = (this.runBonus[key] ?? 1) * patch[key];
      else this.runBonus[key] = (this.runBonus[key] ?? 0) + patch[key];
    }
    this.recompute();
  }

  /** Rebuild the aggregated stat block from scratch — always deterministic. */
  recompute() {
    const stats = baseStats();
    for (const entry of this.owned) {
      if (typeof entry.def.stats === 'function') {
        mergeStats(stats, entry.def.stats(entry.values));
      }
    }
    mergeStats(stats, this.runBonus);
    this.stats = stats;
    this.applyTo(this.game.player);
    return stats;
  }

  applyTo(player) {
    if (!player) return;
    Object.assign(player.stats, this.stats);
    player.focus = Math.min(player.focus, player.stats.focusMax);
  }

  reset() {
    this.owned.length = 0;
    this.runBonus = {};
    this.clearFields();
    this.recompute();
  }

  /* ---------------------------------------------------------------- *
   * Offers
   * ---------------------------------------------------------------- */

  rollRarity(rng = Math.random) {
    const roll = rng();
    let acc = 0;
    for (const [key, cfg] of Object.entries(BOONS.rarity)) {
      acc += cfg.weight;
      if (roll <= acc) return key;
    }
    return 'common';
  }

  /**
   * Build the modal's cards.
   * @param {number} count
   * @param {() => number} [rng]
   * @param {string|null} [phaseBias] prefer boons of this phase (door reward)
   */
  rollOffer(count = BOONS.offerCount, rng = Math.random, phaseBias = null) {
    const pool = BOON_DEFS.filter((def) => this.rankOf(def.id) < BOONS.maxRank);
    if (!pool.length) return [];

    const weighted = pool.map((def) => ({
      def,
      weight: phaseBias && def.phase === phaseBias ? 3 : 1
    }));

    const offers = [];
    const taken = new Set();
    for (let i = 0; i < count && taken.size < pool.length; i++) {
      const available = weighted.filter((w) => !taken.has(w.def.id));
      const total = available.reduce((sum, w) => sum + w.weight, 0);
      let roll = rng() * total;
      let picked = available[available.length - 1];
      for (const candidate of available) {
        roll -= candidate.weight;
        if (roll <= 0) {
          picked = candidate;
          break;
        }
      }
      taken.add(picked.def.id);
      const rarity = this.rollRarity(rng);
      const rank = Math.min(this.rankOf(picked.def.id) + 1, BOONS.maxRank);
      offers.push({
        def: picked.def,
        rarity,
        rank,
        values: picked.def.values(rank, BOONS.rarity[rarity].scalar),
        owned: this.rankOf(picked.def.id) > 0
      });
    }
    return offers;
  }

  /* ---------------------------------------------------------------- *
   * Phase dispatchers
   * ---------------------------------------------------------------- */

  _dispatch(phase, event) {
    const hooks = this.hooksFor(phase);
    for (let i = 0; i < hooks.length; i++) {
      hooks[i].def.run(event, hooks[i].values, this.game);
    }
  }

  onLaunch(event) {
    this._dispatch('launch', event);
  }

  onTrajectory(event) {
    this._dispatch('trajectory', event);
  }

  onImpact(event) {
    this._dispatch('impact', event);
  }

  onRebound(event) {
    this._dispatch('rebound', event);
  }

  /* ---------------------------------------------------------------- *
   * Persistent boon fields (Ignition)
   * ---------------------------------------------------------------- */

  spawnField({ x, z, radius, dps, life, color }) {
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(this._fieldGeo, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0.04, z);
    mesh.scale.setScalar(radius);
    this.fieldGroup.add(mesh);
    this.fields.push({ x, z, radius, dps, life, maxLife: life, mesh, material, tick: 0 });
  }

  clearFields() {
    for (const field of this.fields) {
      this.fieldGroup.remove(field.mesh);
      field.material.dispose();
    }
    this.fields.length = 0;
  }

  update(dt, game) {
    for (let i = this.fields.length - 1; i >= 0; i--) {
      const field = this.fields[i];
      field.life -= dt;
      if (field.life <= 0) {
        this.fieldGroup.remove(field.mesh);
        field.material.dispose();
        this.fields.splice(i, 1);
        continue;
      }
      const t = field.life / field.maxLife;
      field.material.opacity = 0.12 + t * 0.28;
      field.mesh.scale.setScalar(field.radius * (0.9 + Math.sin(field.life * 9) * 0.03));

      field.tick -= dt;
      if (field.tick <= 0) {
        field.tick = 0.2;
        for (const enemy of enemiesWithin(game, field.x, field.z, field.radius)) {
          game.dealDamage(enemy, field.dps * 0.2, {
            source: 'field',
            silent: true,
            fromX: field.x,
            fromZ: field.z
          });
        }
      }
    }
  }

  dispose() {
    this.clearFields();
    this.game.scene.remove(this.fieldGroup);
    this._fieldGeo.dispose();
  }
}

export default BoonSystem;
