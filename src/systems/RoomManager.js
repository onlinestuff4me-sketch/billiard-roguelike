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
import { ARENA, ROOM, PALETTE, ENEMY, PROGRESSION, PHYSICS, TABLE } from '../config.js';
import { Table, pocketSlots } from './Table.js';
import { contractFor, rackNumbers, archetypeForNumber } from './Rules.js';
import { Enemy, ENEMY_STATE } from '../entities/Enemy.js';
import layoutData from '../data/layouts.json';

/* ------------------------------------------------------------------ *
 * The procedural half lives in ThreatDirector.js — pure, scene-free and
 * shared with the level tool at /tool, so the tool can never disagree with
 * the rules it is a tool for. Re-exported here because callers have always
 * reached for makeRng through RoomManager.
 * ------------------------------------------------------------------ */

import { makeRng, roomSeed } from './ThreatDirector.js';

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
  /**
   * The reward table follows the rules. Focus and raw damage decided nothing
   * once balls stopped dying to hits, so both are gone; what a player wants
   * now is another stroke, another freeze, or another bank on the multiplier.
   */
  { id: 'stroke', label: 'Stroke', glyph: '│', color: PALETTE.carom, weight: 1.6 },
  { id: 'freeze', label: 'Freeze', glyph: '◈', color: PALETTE.player, weight: 1.2 },
  { id: 'ricochet', label: 'Ricochet', glyph: '⤢', color: PALETTE.bumper, weight: 1 }
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
    /** Optional lit target zone for a lesson: `{x, z, hw, hh}`. */
    this.goal = null;

    this.group = new THREE.Group();
    this.group.name = 'room';
    game.scene.add(this.group);

    this.enemyLayer = new THREE.Group();
    this.group.add(this.enemyLayer);

    /**
     * Pockets and felt objects. The room owns the table because the room is
     * what re-rolls it; everything else reaches it through `game.table`.
     */
    this.table = new Table(this.group);
    game.table = this.table;

    /** The contract this room was generated against. */
    this.contract = contractFor(1);
    /** The numbered balls currently racked. */
    this.rack = [];
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
    // idea, and the opening only has room for one: that the point is driving
    // balls into pockets. Clutter here reads as difficulty, not as teaching.
    this.layout = level <= 2 ? LAYOUTS[0] : pick(rng, LAYOUTS);
    this.colliders = this.layout.obstacles.map((o) => ({
      ...o,
      kind: o.kind || 'obstacle',
      restitution: o.kind === 'bumper' ? 1.0 : undefined
    }));
    this.buildLayoutMeshes();

    // --- 2. the contract, and the table it is played on ---------------
    this.contract = contractFor(level);
    this.table.buildPockets(level, rng);
    this.placeObjects(rng, level);

    // --- 3. the rack ---------------------------------------------------
    this.rack = this.rackBalls(rng, level);

    this.waves = [];
    this.waveIndex = 0;
    this.waveDelay = WAVE_GAP;
    this.cleared = false;

    this.game.physics.setColliders(this.colliders);

    return { layout: this.layout, contract: this.contract, rack: this.rack.length };
  }

  /* ---------------------------------------------------------------- *
   * Racking
   * ---------------------------------------------------------------- */

  /**
   * Anchor points that are safe to put something on: clear of the player's
   * spawn, clear of the obstacles, and clear of every pocket and lit object
   * placed so far. Shuffled, so two rooms on the same layout do not rack
   * identically.
   */
  freeAnchors(rng, radius = 1.0) {
    const spawn = this.layout.spawn;
    const list = this.layout.anchors.filter(
      (a) =>
        Math.hypot(a.x - spawn.x, a.z - spawn.z) >= ROOM.safeSpawnRadius &&
        !this.overlapsObstacle(a.x, a.z, radius + 0.6) &&
        !this.table.blocked(a.x, a.z, radius)
    );
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }

  /**
   * Roll the lit objects onto the felt. Each type has a room it can first
   * appear in, so the table gains one new idea at a time rather than arriving
   * fully furnished.
   */
  placeObjects(rng, level) {
    this.game.zones.length = 0;
    const order = ['gold', 'gate', 'freeze', 'mine'];
    const spec = {
      gold: TABLE.objects.gold,
      gate: TABLE.objects.gate,
      freeze: TABLE.objects.freezeCell,
      mine: TABLE.objects.mine
    };
    for (const kind of order) {
      const cfg = spec[kind];
      if (level < cfg.minLevel) continue;
      if (rng() > cfg.chance) continue;
      const anchors = this.freeAnchors(rng, kind === 'gate' ? 2.0 : 1.4);
      const anchor = anchors[0];
      if (!anchor) continue;
      this.table.addObject(kind, anchor.x, anchor.z);
    }
  }

  /**
   * Place the numbered rack.
   *
   * Balls go on free anchors rather than in a triangle: a tight rack is a
   * lovely opening break and a terrible puzzle, because every ball after the
   * first is behind another one. Spread positions are what make a route a
   * choice.
   */
  rackBalls(rng, level) {
    const numbers = rackNumbers(this.contract.rack);
    const anchors = this.freeAnchors(rng, 1.2);
    const placed = [];

    numbers.forEach((number, index) => {
      const type = archetypeForNumber(number);
      const anchor = anchors[index] || this.fallbackSpot(rng, placed);
      if (!anchor) return;
      const ball = new Enemy(this.enemyLayer, type, anchor.x, anchor.z, level);
      // A racked ball is on the table from the first frame. There is no
      // telegraph to wait out, because nothing spawned — it was always there.
      ball.state = ENEMY_STATE.ACTIVE;
      ball.spawnTimer = 0;
      ball.drag = PHYSICS.enemyDrag;
      ball.frozen = true;
      ball.disarmed = true;
      ball.setNumber(number);
      ball.homeX = anchor.x;
      ball.homeZ = anchor.z;
      this.game.enemies.push(ball);
      placed.push(ball);
    });

    return placed;
  }

  /** Last resort when a layout runs out of anchors: jitter into open felt. */
  fallbackSpot(rng, placed) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const x = (rng() * 2 - 1) * (ARENA.halfW - 2.6);
      const z = -ARENA.halfH + 2.6 + rng() * (ARENA.height - 9);
      if (this.overlapsObstacle(x, z, 1.6)) continue;
      if (this.table.blocked(x, z, 1.2)) continue;
      if (placed.some((b) => Math.hypot(b.x - x, b.z - z) < 2.8)) continue;
      return { x, z };
    }
    return null;
  }

  /**
   * Re-spot a ball that must not have gone down yet — the 8 potted early
   * under an "8 last" contract. Classic billiards: it comes back, and the
   * stroke that fouled pays nothing.
   */
  respot(ball) {
    const spot = this.fallbackSpot(this.rng, this.game.enemies.filter((b) => b !== ball && b.alive));
    if (!spot) return false;
    ball.x = spot.x;
    ball.z = spot.z;
    ball.vx = 0;
    ball.vz = 0;
    ball.state = ENEMY_STATE.ACTIVE;
    ball.group?.position.set(spot.x, 0, spot.z);
    return true;
  }

  /** How many contract balls are still on the felt. */
  get ballsRemaining() {
    return this.game.enemies.filter((b) => b.alive && b.number > 0).length;
  }

  /** The contract is filled: put the exits up. Called by the run, not here. */
  openExits() {
    if (this.cleared) return this.doors;
    this.cleared = true;
    return this.spawnDoors();
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
    this.scriptedSpec = spec;

    // The goal: a lit bar an enemy has to be knocked into. It is not a
    // collider — the cue ball and the targets pass straight through it — because
    // the lesson is about where a struck ball ends up, and a wall you can bounce
    // off would teach the opposite.
    this.goal = spec.goal ? { ...spec.goal, scored: false } : null;
    if (this.goal) this.buildGoalMesh(this.goal);

    // A LESSON TABLE HAS TO BE THE REAL TABLE.
    //
    // The tutorial teaches potting, so lesson rooms get real pockets — the
    // same capture radii, the same types, the same rules. A lesson that taught
    // the game against a stand-in target would be teaching a different game.
    // Only the pockets a lesson names are built, so each board contains the
    // thing it is about and nothing else.
    if (spec.pockets && spec.pockets.length) {
      const byslot = new Map(pocketSlots().map((slot) => [slot.slot, slot]));
      const spots = spec.pockets
        .map((entry) => {
          const slot = byslot.get(entry.slot);
          return slot ? { ...slot, type: entry.type || 'score' } : null;
        })
        .filter(Boolean);
      this.table.buildPockets(0, () => 0, spots);
    }
    for (const object of spec.objects || []) {
      this.table.addObject(object.kind, object.x, object.z, object);
    }

    this.scriptedEnemies = this.spawnScripted(spec.enemies || []);

    return this.layout;
  }

  /** Instantiate one authored rack. */
  spawnScripted(list) {
    return list.map((slot) => {
      const enemy = new Enemy(this.enemyLayer, slot.type || 'solid', slot.x, slot.z, 1);
      enemy.frozen = slot.frozen !== false;
      // Pinned in place, but still armed unless the lesson says otherwise —
      // an encounter staged to teach you to read a shooter needs one that
      // actually shoots.
      enemy.disarmed = slot.disarmed === true;
      enemy.invulnerable = slot.invulnerable === true;
      // A lesson's rack is placed, not spawned: skipping the telegraph means
      // the targets are solid from the first frame the card is on screen,
      // rather than briefly intangible while the player is already shooting.
      enemy.state = ENEMY_STATE.ACTIVE;
      enemy.spawnTimer = 0;
      enemy.drag = PHYSICS.enemyDrag;
      // Remembered so a lesson can re-rack after a shot that scattered them.
      enemy.homeX = slot.x;
      enemy.homeZ = slot.z;
      // Numbered like every other ball, so a lesson can talk about "the 8" and
      // mean the same thing the contract means.
      if (slot.number) enemy.setNumber(slot.number);
      this.game.enemies.push(enemy);
      return enemy;
    });
  }

  /**
   * Rebuild the authored rack from scratch, replacing anything that died.
   *
   * A lesson has to be repeatable from an identical table, and chain targets
   * are destroyed on contact like any other body — so restoring only the
   * survivors would leave the player practising a two-ball split with one ball.
   */
  reRackScripted() {
    const spec = this.scriptedSpec;
    if (!spec) return;
    for (const enemy of this.scriptedEnemies) {
      enemy.alive = false;
      enemy.dispose();
      const i = this.game.enemies.indexOf(enemy);
      if (i >= 0) this.game.enemies.splice(i, 1);
    }
    if (this.goal) this.goal.scored = false;
    this.scriptedEnemies = this.spawnScripted(spec.enemies || []);
  }

  /** The lit bar for a goal lesson. Drawn on the felt, never collided with. */
  buildGoalMesh(goal) {
    const group = new THREE.Group();
    const color = PALETTE.solid;

    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(goal.hw * 2, 0.12, goal.hh * 2),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    slab.position.set(goal.x, 0.06, goal.z);
    group.add(slab);

    const rim = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-goal.hw, 0, -goal.hh),
        new THREE.Vector3(goal.hw, 0, -goal.hh),
        new THREE.Vector3(goal.hw, 0, goal.hh),
        new THREE.Vector3(-goal.hw, 0, goal.hh)
      ]),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.95 })
    );
    rim.position.set(goal.x, 0.09, goal.z);
    group.add(rim);

    this.group.add(group);
    goal.meshes = group;
    goal.material = slab.material;
    return group;
  }

  /** Is this body inside the goal? */
  inGoal(x, z, radius = 0) {
    const g = this.goal;
    if (!g) return false;
    return Math.abs(x - g.x) < g.hw + radius && Math.abs(z - g.z) < g.hh + radius;
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
    this.table.update(dt);

    // An authored room has no exits — whatever is driving it decides when it
    // is over.
    if (this.scripted) return;

    // THE ROOM IS NOT OVER WHEN THE TABLE IS EMPTY, IT IS OVER WHEN THE
    // CONTRACT IS FILLED.
    //
    // Those used to be the same sentence, back when clearing meant killing
    // everything. They are not any more: a ball can leave the table without
    // counting (an early 8 is re-spotted) and a contract can be filled with
    // balls still standing. So the run calls `openExits()` when the rules say
    // so, and this loop only ever drives the doors.
    if (!this.cleared) return;

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
    this.table.clear();
    this.rack = [];
    for (const enemy of this.game.enemies) enemy.dispose();
    this.game.enemies.length = 0;
    for (const projectile of this.game.projectiles) projectile.dispose();
    this.game.projectiles.length = 0;
    this.game.zones.length = 0;

    // Dispose everything except the two PERSISTENT layers.
    //
    // The table's own group used to be caught by this sweep, which quietly
    // detached it on the first generate() — every pocket and lit object built
    // afterwards went into an orphaned group and rendered nowhere. Both
    // long-lived layers are named here so the next one added cannot repeat it.
    for (let i = this.group.children.length - 1; i >= 0; i--) {
      const child = this.group.children[i];
      if (child === this.enemyLayer || child === this.table.group) continue;
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
    this.goal = null;
    // A live re-rack handle pointing at a room that no longer exists.
    this.scriptedSpec = null;
    this.game.physics.setColliders([]);
  }

  dispose() {
    this.teardown();
    this.game.scene.remove(this.group);
  }
}

export default RoomManager;
