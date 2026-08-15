/**
 * RoomManager.js — the hybrid generation engine (the Hades model).
 *
 *   HANDCRAFTED                          PROCEDURAL
 *   ───────────                          ──────────
 *   · table geometry pool                · threat budget & composition
 *   · collision layout                   · environmental injectors
 *   · spawn anchors & sightlines   ───►  · wave sequencing
 *   · guaranteed bank routes             · 2-door exit rewards
 *
 * Fully procedural geometry produces tables whose angles cannot be read, and an
 * angle you cannot predict is not a decision. Fully handcrafted rooms are
 * memorised in three runs. So the *space* is authored and the *contents* are
 * rolled — every room is familiar enough to plan a bank shot in and fresh
 * enough to demand one.
 *
 * All rolls go through a seeded RNG so a room can be reproduced from
 * (runSeed, level) alone.
 */

import * as THREE from 'three';
import { ARENA, ROOM, INJECTOR, PALETTE, ENEMY, PROGRESSION } from '../config.js';
import { Enemy } from '../entities/Enemy.js';

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

const pick = (rng, list) => list[Math.floor(rng() * list.length) % list.length];

/* ------------------------------------------------------------------ *
 * Handcrafted table geometry pool
 *
 * Every preset is authored for clean billiard geometry: symmetric obstacle
 * placement, open corners, and at least two viable two-rail routes.
 * ------------------------------------------------------------------ */

export const LAYOUTS = [
  {
    id: 'open-arena',
    name: 'Open Arena',
    tags: ['dense', 'carom'],
    obstacles: [],
    anchors: [
      { x: -6, z: -11 },
      { x: 0, z: -12.5 },
      { x: 6, z: -11 },
      { x: -6.5, z: -6 },
      { x: 0, z: -6.5 },
      { x: 6.5, z: -6 },
      { x: -5, z: -1 },
      { x: 5, z: -1 },
      { x: 0, z: 1.5 },
      { x: -7, z: 3 },
      { x: 7, z: 3 }
    ],
    spawn: { x: 0, z: 10.5 }
  },
  {
    id: 'split-pillar',
    name: 'Split Central Pillar',
    tags: ['flank', 'shooter'],
    obstacles: [{ type: 'box', x: 0, z: -3, hw: 1.7, hh: 6.2 }],
    anchors: [
      { x: -6.4, z: -12 },
      { x: 6.4, z: -12 },
      { x: -6.6, z: -7 },
      { x: 6.6, z: -7 },
      { x: -6.6, z: -1 },
      { x: 6.6, z: -1 },
      { x: 0, z: -13.5 },
      { x: -4.5, z: 4 },
      { x: 4.5, z: 4 },
      { x: 0, z: 5 }
    ],
    spawn: { x: 0, z: 11 }
  },
  {
    id: 'triangle-rack',
    name: 'Triangle Bumper Grid',
    tags: ['pinball', 'dense'],
    obstacles: [
      { type: 'circle', x: 0, z: -8.4, radius: 0.95, kind: 'bumper' },
      { type: 'circle', x: -1.9, z: -5.6, radius: 0.95, kind: 'bumper' },
      { type: 'circle', x: 1.9, z: -5.6, radius: 0.95, kind: 'bumper' },
      { type: 'circle', x: -3.8, z: -2.8, radius: 0.95, kind: 'bumper' },
      { type: 'circle', x: 0, z: -2.8, radius: 0.95, kind: 'bumper' },
      { type: 'circle', x: 3.8, z: -2.8, radius: 0.95, kind: 'bumper' }
    ],
    anchors: [
      { x: -6.8, z: -12 },
      { x: 0, z: -12.6 },
      { x: 6.8, z: -12 },
      { x: -7, z: -6 },
      { x: 7, z: -6 },
      { x: -7, z: 0 },
      { x: 7, z: 0 },
      { x: -3.5, z: 3.5 },
      { x: 3.5, z: 3.5 },
      { x: 0, z: 1 }
    ],
    spawn: { x: 0, z: 11.5 }
  },
  {
    id: 'choke-corridor',
    name: 'Choke Corridor',
    tags: ['precision', 'tank'],
    obstacles: [
      { type: 'box', x: -6.4, z: -4.5, hw: 2.6, hh: 0.95 },
      { type: 'box', x: 6.4, z: -4.5, hw: 2.6, hh: 0.95 },
      { type: 'box', x: -6.4, z: -10.5, hw: 2.6, hh: 0.95 },
      { type: 'box', x: 6.4, z: -10.5, hw: 2.6, hh: 0.95 }
    ],
    anchors: [
      { x: 0, z: -13.5 },
      { x: -4, z: -13 },
      { x: 4, z: -13 },
      { x: 0, z: -7.5 },
      { x: -2.6, z: -7.5 },
      { x: 2.6, z: -7.5 },
      { x: -6.5, z: -1 },
      { x: 6.5, z: -1 },
      { x: 0, z: -1 },
      { x: 0, z: 4 }
    ],
    spawn: { x: 0, z: 11.5 }
  },
  {
    id: 'pinball-pillars',
    name: 'Pinball Pillars',
    tags: ['pinball', 'chaos'],
    obstacles: [
      { type: 'circle', x: -4.6, z: -11, radius: 1.15 },
      { type: 'circle', x: 4.6, z: -11, radius: 1.15 },
      { type: 'circle', x: 0, z: -6.5, radius: 1.4, kind: 'bumper' },
      { type: 'circle', x: -5.8, z: -2, radius: 1.05, kind: 'bumper' },
      { type: 'circle', x: 5.8, z: -2, radius: 1.05, kind: 'bumper' },
      { type: 'circle', x: 0, z: 2.5, radius: 1.15 }
    ],
    anchors: [
      { x: 0, z: -13.2 },
      { x: -7, z: -13 },
      { x: 7, z: -13 },
      { x: -7.2, z: -7 },
      { x: 7.2, z: -7 },
      { x: -2.4, z: -3 },
      { x: 2.4, z: -3 },
      { x: -7, z: 2 },
      { x: 7, z: 2 },
      { x: 0, z: 6 }
    ],
    spawn: { x: 0, z: 12 }
  },
  {
    id: 'diamond-bank',
    name: 'Diamond Bank',
    tags: ['bank', 'precision'],
    obstacles: [
      { type: 'box', x: 0, z: -11, hw: 2.2, hh: 0.85 },
      { type: 'box', x: -5.2, z: -6, hw: 0.85, hh: 2.2 },
      { type: 'box', x: 5.2, z: -6, hw: 0.85, hh: 2.2 },
      { type: 'box', x: 0, z: -1, hw: 2.2, hh: 0.85 }
    ],
    anchors: [
      { x: -7, z: -13 },
      { x: 7, z: -13 },
      { x: 0, z: -14 },
      { x: -7.2, z: -8 },
      { x: 7.2, z: -8 },
      { x: 0, z: -6 },
      { x: -7, z: -2 },
      { x: 7, z: -2 },
      { x: -4, z: 3 },
      { x: 4, z: 3 }
    ],
    spawn: { x: 0, z: 11 }
  }
];

/* ------------------------------------------------------------------ *
 * Door reward table
 * ------------------------------------------------------------------ */

export const DOOR_REWARDS = [
  {
    id: 'boon',
    label: 'Boon',
    glyph: '◆',
    color: PALETTE.door,
    weight: 3,
    describe: (phase) => `${phase ? phase.toUpperCase() : 'ANY'} BOON`
  },
  { id: 'repair', label: 'Repair', glyph: '✚', color: 0x4dff9e, weight: 1 },
  { id: 'focus', label: 'Focus', glyph: '◯', color: PALETTE.player, weight: 1 },
  { id: 'power', label: 'Power', glyph: '⌃', color: PALETTE.solid, weight: 1 },
  { id: 'ricochet', label: 'Ricochet', glyph: '⤢', color: PALETTE.carom, weight: 1 }
];

const PHASES = ['launch', 'trajectory', 'impact', 'rebound'];

/** Scaled seconds of breathing room between cleared waves. */
const WAVE_GAP = 0.9;

/* ------------------------------------------------------------------ *
 * RoomManager
 * ------------------------------------------------------------------ */

export class RoomManager {
  /**
   * @param {object} game shared context
   * @param {object} [handlers] { onRoomClear, onDoorEntered }
   */
  constructor(game, handlers = {}) {
    this.game = game;
    this.handlers = handlers;
    this.level = 0;
    this.runSeed = (Math.random() * 0xffffffff) >>> 0;
    this.rng = makeRng(this.runSeed);

    this.layout = null;
    this.colliders = [];
    this.waves = [];
    this.waveIndex = 0;
    this.waveDelay = WAVE_GAP;
    this.cleared = false;
    this.doors = [];

    this.group = new THREE.Group();
    this.group.name = 'room';
    game.scene.add(this.group);

    this.enemyLayer = new THREE.Group();
    this.group.add(this.enemyLayer);
  }

  /* ---------------------------------------------------------------- *
   * Generation
   * ---------------------------------------------------------------- */

  /**
   * Build a whole room: pick geometry, spend the threat budget, roll injectors.
   * @param {number} level 1-based room number
   */
  generate(level) {
    this.teardown();
    this.level = level;
    this.rng = makeRng((this.runSeed ^ Math.imul(level, 0x9e3779b1)) >>> 0);
    const rng = this.rng;

    // --- 1. handcrafted geometry -------------------------------------
    this.layout = pick(rng, LAYOUTS);
    this.colliders = this.layout.obstacles.map((o) => ({
      ...o,
      kind: o.kind || 'obstacle',
      restitution: o.kind === 'bumper' ? 1.0 : undefined
    }));
    this.buildLayoutMeshes();

    // --- 2. procedural environmental injectors ------------------------
    this.injectEnvironment(rng, level);

    // --- 3. procedural threat budget ----------------------------------
    this.waves = this.buildWaves(rng, level);
    this.waveIndex = 0;
    this.waveDelay = WAVE_GAP;
    this.cleared = false;

    this.game.physics.setColliders(this.colliders);
    this.spawnWave(0);

    return {
      layout: this.layout,
      waves: this.waves.length,
      budget: this.budgetFor(level)
    };
  }

  budgetFor(level) {
    return Math.min(
      ROOM.baseBudget + ROOM.budgetPerLevel * (level - 1),
      ROOM.maxBudget
    );
  }

  /**
   * The Threat Director: spend a budget across waves, drawing archetypes by
   * weight subject to unlock gates, and bind each to a validated anchor.
   */
  buildWaves(rng, level) {
    const budget = this.budgetFor(level);
    const waveCount =
      ROOM.waveCountByLevel[Math.min(level, ROOM.waveCountByLevel.length) - 1] || 1;

    // Later waves get a slightly larger share so rooms escalate.
    const shares = [];
    let total = 0;
    for (let i = 0; i < waveCount; i++) {
      const share = 1 + i * 0.35;
      shares.push(share);
      total += share;
    }

    const unlocked = Object.keys(ROOM.unlock).filter((type) => level >= ROOM.unlock[type]);
    const tags = this.layout.tags || [];

    const waves = [];
    for (let w = 0; w < waveCount; w++) {
      let remaining = Math.max(2, Math.round((budget * shares[w]) / total));
      const composition = [];
      let guard = 0;
      while (remaining > 0 && guard++ < 64) {
        const affordable = unlocked.filter((type) => ENEMY[type].cost <= remaining);
        if (!affordable.length) break;
        const type = this.weightedType(rng, affordable, tags, level);
        composition.push(type);
        remaining -= ENEMY[type].cost;
      }
      waves.push(this.assignAnchors(rng, composition));
    }
    return waves;
  }

  weightedType(rng, types, tags, level) {
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

  /** Bind a composition to anchors that are clear of the player and geometry. */
  assignAnchors(rng, composition) {
    const spawnPoint = this.layout.spawn;
    const candidates = this.layout.anchors
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
      return {
        type,
        x: this.clampX(anchor.x + (rng() - 0.5) * spread, ENEMY[type].radius),
        z: this.clampZ(anchor.z + (rng() - 0.5) * spread, ENEMY[type].radius)
      };
    });
  }

  clampX(x, radius) {
    const limit = ARENA.halfW - radius - 0.2;
    return Math.min(Math.max(x, -limit), limit);
  }

  clampZ(z, radius) {
    const limit = ARENA.halfH - radius - 0.2;
    return Math.min(Math.max(z, -limit), limit);
  }

  /* ---------------------------------------------------------------- *
   * Environmental injectors
   * ---------------------------------------------------------------- */

  injectEnvironment(rng, level) {
    this.game.zones.length = 0;
    if (level < ROOM.injectors.minLevel) return;

    const free = this.layout.anchors.filter(
      (a) =>
        Math.hypot(a.x - this.layout.spawn.x, a.z - this.layout.spawn.z) >= ROOM.safeSpawnRadius &&
        !this.overlapsObstacle(a.x, a.z, 2.0)
    );
    for (let i = free.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [free[i], free[j]] = [free[j], free[i]];
    }

    let placed = 0;
    let cursor = 0;
    const rolls = [
      { kind: 'bumper', chance: ROOM.injectors.bumperChance },
      { kind: 'pyre', chance: ROOM.injectors.pyreChance },
      { kind: 'hazard', chance: ROOM.injectors.hazardChance }
    ];

    for (const roll of rolls) {
      if (placed >= ROOM.injectors.maxPerRoom) break;
      if (rng() > roll.chance) continue;
      const anchor = free[cursor++ % Math.max(free.length, 1)];
      if (!anchor) break;
      this.spawnInjector(roll.kind, anchor.x, anchor.z);
      placed++;
    }
  }

  spawnInjector(kind, x, z) {
    if (kind === 'bumper') {
      const collider = {
        type: 'circle',
        x,
        z,
        radius: INJECTOR.bumper.radius,
        kind: 'bumper',
        restitution: 1.0
      };
      this.colliders.push(collider);
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(INJECTOR.bumper.radius, INJECTOR.bumper.radius * 0.8, 0.5, 20),
        new THREE.MeshStandardMaterial({
          color: PALETTE.bumper,
          emissive: new THREE.Color(PALETTE.bumper),
          emissiveIntensity: 0.6,
          roughness: 0.3
        })
      );
      mesh.position.set(x, 0.25, z);
      this.group.add(mesh);
      collider.mesh = mesh;
      return;
    }

    if (kind === 'pyre') {
      const zone = {
        type: 'circle',
        x,
        z,
        radius: INJECTOR.pyre.radius,
        kind: 'pyre',
        contains: false
      };
      this.game.zones.push(zone);
      const mesh = new THREE.Mesh(
        new THREE.RingGeometry(INJECTOR.pyre.radius * 0.35, INJECTOR.pyre.radius, 28),
        new THREE.MeshBasicMaterial({
          color: PALETTE.pyre,
          transparent: true,
          opacity: 0.3,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide
        })
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(x, 0.04, z);
      this.group.add(mesh);
      zone.mesh = mesh;
      return;
    }

    // hazard strip
    const zone = {
      type: 'box',
      x,
      z,
      hw: INJECTOR.hazard.width / 2,
      hh: INJECTOR.hazard.height / 2,
      kind: 'hazard',
      contains: false
    };
    this.game.zones.push(zone);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(INJECTOR.hazard.width, INJECTOR.hazard.height),
      new THREE.MeshBasicMaterial({
        color: PALETTE.hazard,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0.035, z);
    this.group.add(mesh);
    zone.mesh = mesh;
  }

  overlapsObstacle(x, z, radius) {
    for (const c of this.colliders) {
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

  /* ---------------------------------------------------------------- *
   * Meshes for the handcrafted geometry
   * ---------------------------------------------------------------- */

  buildLayoutMeshes() {
    for (const c of this.colliders) {
      const isBumper = c.kind === 'bumper';
      const color = isBumper ? PALETTE.bumper : PALETTE.railGlow;
      let mesh;
      if (c.type === 'circle') {
        mesh = new THREE.Mesh(
          new THREE.CylinderGeometry(c.radius, c.radius * 0.92, isBumper ? 0.55 : 1.1, 22),
          new THREE.MeshStandardMaterial({
            color: isBumper ? PALETTE.bumper : PALETTE.rail,
            emissive: new THREE.Color(color),
            emissiveIntensity: isBumper ? 0.55 : 0.35,
            roughness: 0.45,
            metalness: 0.3
          })
        );
        mesh.position.set(c.x, isBumper ? 0.28 : 0.55, c.z);
      } else {
        mesh = new THREE.Mesh(
          new THREE.BoxGeometry(c.hw * 2, 1.1, c.hh * 2),
          new THREE.MeshStandardMaterial({
            color: PALETTE.rail,
            emissive: new THREE.Color(PALETTE.railGlow),
            emissiveIntensity: 0.4,
            roughness: 0.5,
            metalness: 0.3
          })
        );
        mesh.position.set(c.x, 0.55, c.z);
      }
      this.group.add(mesh);
      c.mesh = mesh;

      // Neon rim on the felt so the collision footprint is unambiguous — the
      // player is banking off these, so the silhouette has to be exact.
      let outline;
      if (c.type === 'circle') {
        outline = new THREE.Mesh(
          new THREE.RingGeometry(c.radius * 1.02, c.radius * 1.16, 26),
          new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.45,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
          })
        );
        outline.rotation.x = -Math.PI / 2;
      } else {
        const hw = c.hw + 0.06;
        const hh = c.hh + 0.06;
        outline = new THREE.LineLoop(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-hw, 0, -hh),
            new THREE.Vector3(hw, 0, -hh),
            new THREE.Vector3(hw, 0, hh),
            new THREE.Vector3(-hw, 0, hh)
          ]),
          new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85 })
        );
      }
      outline.position.set(c.x, 0.03, c.z);
      this.group.add(outline);
      c.outline = outline;
    }
  }

  /* ---------------------------------------------------------------- *
   * Waves
   * ---------------------------------------------------------------- */

  spawnWave(index) {
    const wave = this.waves[index];
    if (!wave) return;
    for (const slot of wave) {
      this.game.enemies.push(new Enemy(this.enemyLayer, slot.type, slot.x, slot.z, this.level));
    }
    this.waveIndex = index;
  }

  get wavesRemaining() {
    return Math.max(0, this.waves.length - this.waveIndex - 1);
  }

  /* ---------------------------------------------------------------- *
   * Exit doors
   * ---------------------------------------------------------------- */

  rollReward(rng) {
    const total = DOOR_REWARDS.reduce((sum, r) => sum + r.weight, 0);
    let roll = rng() * total;
    for (const reward of DOOR_REWARDS) {
      roll -= reward.weight;
      if (roll <= 0) return reward;
    }
    return DOOR_REWARDS[0];
  }

  spawnDoors() {
    const rng = this.rng;
    const count = ROOM.door.count;
    const forcedRepair = this.level % PROGRESSION.healEvery === 0;

    const picks = [];
    for (let i = 0; i < count; i++) {
      let reward = this.rollReward(rng);
      // Guarantee a repair door on the pacing beat, and never offer two
      // identical doors — the exit must be a real choice.
      if (i === 0 && forcedRepair) reward = DOOR_REWARDS.find((r) => r.id === 'repair');
      let guard = 0;
      while (picks.some((p) => p.id === reward.id) && guard++ < 12) {
        reward = this.rollReward(rng);
      }
      picks.push(reward);
    }

    const z = -ARENA.halfH + ROOM.door.inset + ROOM.door.height / 2;
    const spacing = ARENA.width / (count + 1);

    this.doors = picks.map((reward, i) => {
      const x = -ARENA.halfW + spacing * (i + 1);
      const phase = reward.id === 'boon' ? PHASES[Math.floor(rng() * PHASES.length)] : null;
      const color = i === 0 ? PALETTE.door : PALETTE.doorAlt;
      const door = {
        reward,
        phase,
        x,
        z,
        hw: ROOM.door.width / 2,
        hh: ROOM.door.height / 2,
        color,
        taken: false,
        pulse: rng() * Math.PI * 2
      };
      door.meshes = this.buildDoorMesh(door);
      return door;
    });

    return this.doors;
  }

  buildDoorMesh(door) {
    const group = new THREE.Group();
    group.position.set(door.x, 0, door.z);

    const gate = new THREE.Mesh(
      new THREE.BoxGeometry(door.hw * 2, 0.14, door.hh * 2),
      new THREE.MeshBasicMaterial({
        color: door.color,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    gate.position.y = 0.07;
    group.add(gate);

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(door.hw * 2 + 0.3, 1.4, 0.22),
      new THREE.MeshStandardMaterial({
        color: PALETTE.rail,
        emissive: new THREE.Color(door.color),
        emissiveIntensity: 1.4,
        roughness: 0.4
      })
    );
    frame.position.set(0, 0.7, -door.hh);
    group.add(frame);

    const pillarGeo = new THREE.CylinderGeometry(0.16, 0.16, 1.6, 12);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: PALETTE.rail,
      emissive: new THREE.Color(door.color),
      emissiveIntensity: 1.6,
      roughness: 0.35
    });
    for (const sx of [-1, 1]) {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(sx * door.hw, 0.8, 0);
      group.add(pillar);
    }

    this.group.add(group);
    return group;
  }

  clearDoors() {
    for (const door of this.doors) {
      if (door.meshes) this.group.remove(door.meshes);
    }
    this.doors.length = 0;
  }

  /* ---------------------------------------------------------------- *
   * Frame update
   * ---------------------------------------------------------------- */

  update(dt, game) {
    const alive = game.enemies.length;

    if (!this.cleared) {
      if (alive === 0) {
        if (this.wavesRemaining > 0) {
          // A short breath between waves so a clear always reads as a clear.
          this.waveDelay -= dt;
          if (this.waveDelay <= 0) {
            this.waveDelay = WAVE_GAP;
            this.spawnWave(this.waveIndex + 1);
            this.handlers.onWaveSpawned?.({
              index: this.waveIndex,
              total: this.waves.length
            });
          }
        } else {
          this.cleared = true;
          this.spawnDoors();
          this.handlers.onRoomClear?.({ level: this.level, layout: this.layout });
        }
      } else {
        this.waveDelay = WAVE_GAP;
      }
      return;
    }

    // Doors are live: pulse them and test for the player flying in.
    const player = game.player;
    for (const door of this.doors) {
      door.pulse += dt * 3;
      if (door.meshes) {
        const s = 1 + Math.sin(door.pulse) * 0.06;
        door.meshes.scale.set(s, 1, s);
      }
      if (door.taken || !player.alive) continue;
      const insideX = Math.abs(player.x - door.x) < door.hw + player.radius;
      const insideZ = Math.abs(player.z - door.z) < door.hh + player.radius;
      if (insideX && insideZ) {
        door.taken = true;
        this.handlers.onDoorEntered?.(door);
        return;
      }
    }
  }

  /* ---------------------------------------------------------------- *
   * Teardown
   * ---------------------------------------------------------------- */

  teardown() {
    this.clearDoors();
    for (const enemy of this.game.enemies) enemy.dispose();
    this.game.enemies.length = 0;
    for (const projectile of this.game.projectiles) projectile.dispose();
    this.game.projectiles.length = 0;
    this.game.zones.length = 0;

    // Dispose everything except the (persistent) enemy layer.
    for (let i = this.group.children.length - 1; i >= 0; i--) {
      const child = this.group.children[i];
      if (child === this.enemyLayer) continue;
      this.group.remove(child);
      child.traverse?.((node) => {
        if (node.geometry) node.geometry.dispose();
        if (node.material) {
          if (Array.isArray(node.material)) node.material.forEach((m) => m.dispose());
          else node.material.dispose();
        }
      });
    }

    this.colliders = [];
    this.doors = [];
    this.game.physics.setColliders([]);
  }

  dispose() {
    this.teardown();
    this.game.scene.remove(this.group);
  }
}

export default RoomManager;
