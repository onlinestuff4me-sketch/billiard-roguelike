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
import { ARENA, ROOM, INJECTOR, PALETTE, ENEMY, PROGRESSION, PHYSICS } from '../config.js';
import { Enemy, ENEMY_STATE } from '../entities/Enemy.js';
import layoutData from '../data/layouts.json';

/* ------------------------------------------------------------------ *
 * The procedural half lives in ThreatDirector.js — pure, scene-free and
 * shared with the level tool at /tool, so the tool can never disagree with
 * the rules it is a tool for. Re-exported here because callers have always
 * reached for makeRng through RoomManager.
 * ------------------------------------------------------------------ */

import {
  makeRng,
  roomSeed,
  budgetFor as directorBudgetFor,
  buildWaves as directorBuildWaves
} from './ThreatDirector.js';

export { makeRng };

const pick = (rng, list) => list[Math.floor(rng() * list.length) % list.length];

/* ------------------------------------------------------------------ *
 * Handcrafted table geometry pool
 *
 * Every preset is authored for clean billiard geometry: symmetric obstacle
 * placement, open corners, and at least two viable two-rail routes.
 * ------------------------------------------------------------------ */

/**
 * Table geometry now lives in `src/data/layouts.json` so the game and the level
 * tool at /tool read exactly the same source. Editing a layout in one place can
 * never leave the other stale.
 */
export const LAYOUTS = layoutData.layouts;

/* ------------------------------------------------------------------ *
 * Door reward table
 * ------------------------------------------------------------------ */

export const DOOR_REWARDS = [
  {
    id: 'boon',
    label: 'Upgrade',
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
    /** True while an authored (tutorial) room is loaded: no waves, no doors. */
    this.scripted = false;
    this.scriptedEnemies = [];

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
    this.scripted = false;
    this.level = level;
    this.rng = makeRng(roomSeed(this.runSeed, level));
    const rng = this.rng;

    // --- 1. handcrafted geometry -------------------------------------
    // The first two rooms are always the empty table. Obstacles are a second
    // idea, and the opening only has room for one: that hitting things with
    // yourself is the game. Clutter here reads as difficulty, not as teaching.
    this.layout = level <= 2 ? LAYOUTS[0] : pick(rng, LAYOUTS);
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

  /* ---------------------------------------------------------------- *
   * Authored rooms (the tutorial)
   * ---------------------------------------------------------------- */

  /**
   * Load a room exactly as written: given geometry, given enemies, no threat
   * budget, no waves, no doors, no injectors.
   *
   * A lesson has to be able to promise that the table contains the thing it is
   * teaching and nothing else. Rolling any part of it — an extra spawn, a
   * bumper in the corner — would break that promise on some seeds and not on
   * others, which is the worst way for a tutorial to be wrong.
   *
   * @param {{id?:string, name?:string, obstacles?:Array,
   *          enemies?:Array<{type?:string,x:number,z:number}>,
   *          spawn?:{x:number,z:number}}} spec
   */
  loadScripted(spec) {
    this.teardown();
    this.scripted = true;
    this.level = 0;
    this.layout = {
      id: spec.id || 'scripted',
      name: spec.name || 'Practice',
      tags: ['scripted'],
      obstacles: spec.obstacles || [],
      anchors: [],
      spawn: spec.spawn || { x: 0, z: 11 }
    };
    this.colliders = this.layout.obstacles.map((o) => ({
      ...o,
      kind: o.kind || 'obstacle'
    }));
    this.buildLayoutMeshes();

    this.waves = [];
    this.waveIndex = 0;
    this.waveDelay = WAVE_GAP;
    this.cleared = false;
    this.game.physics.setColliders(this.colliders);

    this.scriptedEnemies = (spec.enemies || []).map((slot) => {
      const enemy = new Enemy(this.enemyLayer, slot.type || 'solid', slot.x, slot.z, 1);
      enemy.frozen = slot.frozen !== false;
      // A lesson's rack is placed, not spawned: skipping the telegraph means
      // the targets are solid from the first frame the card is on screen,
      // rather than briefly intangible while the player is already shooting.
      enemy.state = ENEMY_STATE.ACTIVE;
      enemy.spawnTimer = 0;
      enemy.drag = PHYSICS.enemyDrag;
      // Remembered so a lesson can re-rack after a shot that scattered them.
      enemy.homeX = slot.x;
      enemy.homeZ = slot.z;
      this.game.enemies.push(enemy);
      return enemy;
    });

    return this.layout;
  }

  budgetFor(level) {
    return directorBudgetFor(level);
  }

  /**
   * The Threat Director: spend a budget across waves, drawing archetypes by
   * weight subject to unlock gates, and bind each to a validated anchor — or
   * take the layout's own authored waves when it has them.
   */
  buildWaves(rng, level) {
    return directorBuildWaves(this.layout, level, rng);
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
    // An authored room has no wave queue and no exits — whatever is driving it
    // decides when it is over.
    if (this.scripted) return;

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
    this.scriptedEnemies = [];
    this.game.physics.setColliders([]);
  }

  dispose() {
    this.teardown();
    this.game.scene.remove(this.group);
  }
}

export default RoomManager;
