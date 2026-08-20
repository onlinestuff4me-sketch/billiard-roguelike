/**
 * PhysicsSystem.js — deterministic billiard physics.
 *
 * There is no third-party physics engine here. The game needs exactly three
 * interactions (circle↔circle, circle↔AABB, circle↔rail), all solved in the XZ
 * plane, so they are implemented directly. Nothing in this file uses randomness:
 * the aim preview and the live simulation call the *same* intersection helpers,
 * which is what makes the trajectory lines trustworthy.
 *
 * Bodies are plain objects with `{ x, z, vx, vz, radius, mass, drag }`.
 * Colliders are `{ type: 'circle' | 'box', x, z, radius | hw, hh, restitution }`.
 *
 * Resolution order per sub-step:
 *   1. integrate velocities (per-state drag)
 *   2. player  ↔ rails / obstacles      → rebound, bounce budget, onRebound
 *   3. player  ↔ enemies                → cue strike, momentum transfer, pierce
 *   4. enemies ↔ enemies                → caroms when the striker is KNOCKED
 *   5. enemies ↔ rails / obstacles      → wall-splats
 *   6. projectiles ↔ player / geometry
 */

import { ARENA, PHYSICS, TIME, TRAJECTORY, PLAYER } from '../config.js';
// Shared state vocabulary. Systems may read entity constants; entities never
// import systems, which is what keeps the dependency graph acyclic.
import { ENEMY_STATE } from '../entities/Enemy.js';
import { PLAYER_STATE } from '../entities/Player.js';

const EPS = 1e-6;

/* ------------------------------------------------------------------ *
 * Standalone geometry helpers (pure, reusable by the predictor)
 * ------------------------------------------------------------------ */

/** Reflect a velocity about a unit normal, scaled by restitution. */
export function reflect(vx, vz, nx, nz, restitution = 1) {
  const d = 2 * (vx * nx + vz * nz);
  return { x: (vx - d * nx) * restitution, z: (vz - d * nz) * restitution };
}

/**
 * Swept circle vs static circle.
 * @returns distance along `d` (unit) of first contact, or Infinity.
 */
export function sweepCircleCircle(px, pz, dx, dz, radius, cx, cz, cr) {
  const mx = px - cx;
  const mz = pz - cz;
  const R = radius + cr;
  const b = mx * dx + mz * dz;
  const c = mx * mx + mz * mz - R * R;
  if (c > 0 && b > 0) return Infinity; // moving away from the outside
  const disc = b * b - c;
  if (disc < 0) return Infinity;
  const t = -b - Math.sqrt(disc);
  return t < 0 ? (c < 0 ? 0 : Infinity) : t;
}

/**
 * Swept circle vs axis-aligned box, handling the rounded corners properly
 * (Minkowski expansion + a corner circle test).
 * @returns {{ t: number, nx: number, nz: number } | null}
 */
export function sweepCircleBox(px, pz, dx, dz, radius, box) {
  const minX = box.x - box.hw;
  const maxX = box.x + box.hw;
  const minZ = box.z - box.hh;
  const maxZ = box.z + box.hh;

  // Slab test against the expanded box.
  const exMin = minX - radius;
  const exMax = maxX + radius;
  const ezMin = minZ - radius;
  const ezMax = maxZ + radius;

  let tMin = -Infinity;
  let tMax = Infinity;
  let axis = -1;
  let sign = 0;

  if (Math.abs(dx) < EPS) {
    if (px < exMin || px > exMax) return null;
  } else {
    const inv = 1 / dx;
    let t1 = (exMin - px) * inv;
    let t2 = (exMax - px) * inv;
    let s = -Math.sign(dx);
    if (t1 > t2) {
      const tmp = t1;
      t1 = t2;
      t2 = tmp;
      s = Math.sign(dx);
    }
    if (t1 > tMin) {
      tMin = t1;
      axis = 0;
      sign = s;
    }
    if (t2 < tMax) tMax = t2;
  }

  if (Math.abs(dz) < EPS) {
    if (pz < ezMin || pz > ezMax) return null;
  } else {
    const inv = 1 / dz;
    let t1 = (ezMin - pz) * inv;
    let t2 = (ezMax - pz) * inv;
    let s = -Math.sign(dz);
    if (t1 > t2) {
      const tmp = t1;
      t1 = t2;
      t2 = tmp;
      s = Math.sign(dz);
    }
    if (t1 > tMin) {
      tMin = t1;
      axis = 1;
      sign = s;
    }
    if (t2 < tMax) tMax = t2;
  }

  if (tMax < Math.max(tMin, 0) || tMin === -Infinity) return null;
  if (tMin < 0) return null; // started inside the expanded box

  const hx = px + dx * tMin;
  const hz = pz + dz * tMin;

  // Face hit if the contact lies within the original extent on the other axis.
  if (axis === 0 && hz >= minZ && hz <= maxZ) {
    return { t: tMin, nx: sign, nz: 0 };
  }
  if (axis === 1 && hx >= minX && hx <= maxX) {
    return { t: tMin, nx: 0, nz: sign };
  }

  // Otherwise we are in a corner region: sweep against the corner circle.
  const cx = hx < box.x ? minX : maxX;
  const cz = hz < box.z ? minZ : maxZ;
  const t = sweepCircleCircle(px, pz, dx, dz, radius, cx, cz, 0);
  if (!Number.isFinite(t)) return null;
  const ix = px + dx * t;
  const iz = pz + dz * t;
  const nx = ix - cx;
  const nz = iz - cz;
  const len = Math.hypot(nx, nz) || 1;
  return { t, nx: nx / len, nz: nz / len };
}

/** Ray vs the four inset rail planes. */
export function rayRails(px, pz, dx, dz, radius) {
  const limitX = ARENA.halfW - radius;
  const limitZ = ARENA.halfH - radius;
  let best = Infinity;
  let nx = 0;
  let nz = 0;

  if (dx > EPS) {
    const t = (limitX - px) / dx;
    if (t >= 0 && t < best) {
      best = t;
      nx = -1;
      nz = 0;
    }
  } else if (dx < -EPS) {
    const t = (-limitX - px) / dx;
    if (t >= 0 && t < best) {
      best = t;
      nx = 1;
      nz = 0;
    }
  }

  if (dz > EPS) {
    const t = (limitZ - pz) / dz;
    if (t >= 0 && t < best) {
      best = t;
      nx = 0;
      nz = -1;
    }
  } else if (dz < -EPS) {
    const t = (-limitZ - pz) / dz;
    if (t >= 0 && t < best) {
      best = t;
      nx = 0;
      nz = 1;
    }
  }

  return Number.isFinite(best) ? { t: best, nx, nz } : null;
}

/* ------------------------------------------------------------------ *
 * PhysicsSystem
 * ------------------------------------------------------------------ */

export class PhysicsSystem {
  constructor() {
    /** Static solid geometry for the current room. */
    this.colliders = [];
    /** Scratch object reused by resolvers to keep the loop allocation-free. */
    this._hit = { nx: 0, nz: 0, depth: 0, collider: null };
  }

  /**
   * Is this point inside (or within `radius` of) any static geometry?
   *
   * Used before a muzzle spawns a bullet: a shooter standing against a wall
   * would otherwise plant its projectile inside the wall, where it dies on the
   * first substep. On screen that is indistinguishable from the gun failing to
   * go off at all.
   */
  pointBlocked(x, z, radius = 0) {
    if (Math.abs(x) > ARENA.halfW - radius || Math.abs(z) > ARENA.halfH - radius) return true;
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

  setColliders(colliders) {
    this.colliders = colliders || [];
  }

  /* ---------------------------------------------------------------- *
   * Frame update — fixed sub-stepping
   * ---------------------------------------------------------------- */

  /**
   * @param {number} dt scaled seconds for this frame
   * @param {object} game shared context
   */
  update(dt, game) {
    if (dt <= 0) return;
    const steps = Math.min(
      Math.max(1, Math.ceil(dt / TIME.fixedStep)),
      TIME.maxSubSteps
    );
    const h = dt / steps;
    for (let i = 0; i < steps; i++) this.substep(h, game);

    // Clear the muzzle hold once per *frame*, not once per substep — otherwise
    // a bullet born this frame still travels the remaining substeps and is
    // rendered clear of the barrel it supposedly just left.
    const projectiles = game.projectiles || [];
    for (let i = 0; i < projectiles.length; i++) projectiles[i].spawnFrame = false;
  }

  substep(h, game) {
    const player = game.player;
    const enemies = game.enemies || [];
    const projectiles = game.projectiles || [];

    if (player && player.alive) {
      this.integrate(player, h);
      this.resolvePlayerGeometry(player, game);
    }

    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      if (!enemy.alive) continue;
      if (enemy.strikeCooldown > 0) enemy.strikeCooldown -= h;
      if (enemy.caromCooldown > 0) enemy.caromCooldown -= h;
      this.integrate(enemy, h);
      this.resolveEnemyGeometry(enemy, game);
    }

    if (player && player.alive) {
      for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (!enemy.alive) continue;
        this.resolvePlayerEnemy(player, enemy, game);
      }
    }

    for (let i = 0; i < enemies.length; i++) {
      const a = enemies[i];
      if (!a.alive) continue;
      for (let j = i + 1; j < enemies.length; j++) {
        const b = enemies[j];
        if (!b.alive) continue;
        this.resolveEnemyPair(a, b, game);
      }
    }

    for (let i = 0; i < projectiles.length; i++) {
      const p = projectiles[i];
      if (!p.alive) continue;
      // A projectile used to be integrated on the very frame it was created,
      // so its first *rendered* position was already a step down-range — at 26
      // units/sec that is a unit clear of the muzzle before anyone sees it, and
      // the bullet looks like it appeared in mid-air rather than left the gun.
      // It gets one frame standing at the muzzle.
      if (p.spawnFrame) continue;
      this.integrate(p, h);
      this.resolveProjectile(p, player, game);
    }

    if (game.zones && game.zones.length) this.resolveZones(h, game);
  }

  /**
   * Resolve a near-elastic collision between two circular bodies.
   *
   * This is the standard impulse along the line of centres:
   *
   *     j = -(1 + e)(v_rel · n) / (1/mA + 1/mB)
   *
   * with `n` pointing from A to B. Only the normal component is exchanged; each
   * body keeps its tangential velocity, which is exactly what produces the
   * familiar billiard results — full transfer on a head-on hit between equal
   * masses, and a 90° separation on a cut.
   *
   * Nothing here is scripted or randomised, so the outcome always matches the
   * line the aim preview drew before the shot.
   *
   * @param {object} a first body ({ vx, vz, mass })
   * @param {object} b second body
   * @param {number} nx unit normal from A toward B
   * @param {number} nz
   * @param {number} e restitution
   * @returns {number} the impulse magnitude applied (0 if already separating)
   */
  resolveBallImpulse(a, b, nx, nz, e = PHYSICS.ballRestitution) {
    const rvx = a.vx - b.vx;
    const rvz = a.vz - b.vz;
    const vn = rvx * nx + rvz * nz;
    // Negative means they are already moving apart — resolving again would
    // suck them back together and cause jitter on a resting contact.
    if (vn <= 0) return 0;

    const invA = a.mass > 0 ? 1 / a.mass : 0;
    const invB = b.mass > 0 ? 1 / b.mass : 0;
    const total = invA + invB;
    if (total <= 0) return 0;

    const j = (-(1 + e) * vn) / total;
    a.vx += j * invA * nx;
    a.vz += j * invA * nz;
    b.vx -= j * invB * nx;
    b.vz -= j * invB * nz;
    return Math.abs(j);
  }

  /** Semi-implicit integration with per-state exponential drag. */
  integrate(body, h) {
    body.x += body.vx * h;
    body.z += body.vz * h;
    const drag = body.drag || 0;
    if (drag > 0) {
      const damp = Math.exp(-drag * h);
      body.vx *= damp;
      body.vz *= damp;
    }
  }

  /* ---------------------------------------------------------------- *
   * Player vs static geometry
   * ---------------------------------------------------------------- */

  resolvePlayerGeometry(player, game) {
    const rail = this.resolveRails(player, PHYSICS.wallRestitution);
    if (rail) this.onPlayerRebound(player, game, rail, 'rail');

    for (let i = 0; i < this.colliders.length; i++) {
      const collider = this.colliders[i];
      const hit = this.resolveCollider(player, collider);
      if (hit) this.onPlayerRebound(player, game, hit, collider.kind || 'obstacle', collider);
    }
  }

  /**
   * Push a circular body back inside the rails and reflect its velocity.
   * @returns {{ nx: number, nz: number, x: number, z: number, speed: number } | null}
   */
  resolveRails(body, restitution) {
    const limitX = ARENA.halfW - body.radius;
    const limitZ = ARENA.halfH - body.radius;
    let nx = 0;
    let nz = 0;
    let hit = false;

    if (body.x < -limitX) {
      body.x = -limitX + PHYSICS.skin;
      nx = 1;
      hit = true;
    } else if (body.x > limitX) {
      body.x = limitX - PHYSICS.skin;
      nx = -1;
      hit = true;
    }

    if (body.z < -limitZ) {
      body.z = -limitZ + PHYSICS.skin;
      nz = 1;
      hit = true;
    } else if (body.z > limitZ) {
      body.z = limitZ - PHYSICS.skin;
      nz = -1;
      hit = true;
    }

    if (!hit) return null;

    const len = Math.hypot(nx, nz) || 1;
    nx /= len;
    nz /= len;
    const speed = Math.hypot(body.vx, body.vz);
    // Only reflect if we are actually travelling into the rail.
    if (body.vx * nx + body.vz * nz < 0) {
      const r = reflect(body.vx, body.vz, nx, nz, restitution);
      body.vx = r.x;
      body.vz = r.z;
    }
    return { nx, nz, x: body.x, z: body.z, speed };
  }

  /**
   * Resolve a circular body against one static collider.
   * @returns {{ nx, nz, x, z, speed } | null}
   */
  resolveCollider(body, collider, restitution = null) {
    const rest = restitution ?? collider.restitution ?? PHYSICS.obstacleRestitution;
    let nx = 0;
    let nz = 0;
    let depth = 0;

    if (collider.type === 'circle') {
      const dx = body.x - collider.x;
      const dz = body.z - collider.z;
      const dist = Math.hypot(dx, dz);
      const min = body.radius + collider.radius;
      if (dist >= min) return null;
      if (dist > EPS) {
        nx = dx / dist;
        nz = dz / dist;
      } else {
        nx = 0;
        nz = -1;
      }
      depth = min - dist;
    } else {
      const minX = collider.x - collider.hw;
      const maxX = collider.x + collider.hw;
      const minZ = collider.z - collider.hh;
      const maxZ = collider.z + collider.hh;
      const closestX = Math.min(Math.max(body.x, minX), maxX);
      const closestZ = Math.min(Math.max(body.z, minZ), maxZ);
      const dx = body.x - closestX;
      const dz = body.z - closestZ;
      const dist = Math.hypot(dx, dz);

      if (dist > EPS) {
        if (dist >= body.radius) return null;
        nx = dx / dist;
        nz = dz / dist;
        depth = body.radius - dist;
      } else {
        // Centre is inside the box — escape along the shallowest face.
        const left = body.x - minX;
        const right = maxX - body.x;
        const top = body.z - minZ;
        const bottom = maxZ - body.z;
        const min = Math.min(left, right, top, bottom);
        if (min === left) {
          nx = -1;
          nz = 0;
          depth = left + body.radius;
        } else if (min === right) {
          nx = 1;
          nz = 0;
          depth = right + body.radius;
        } else if (min === top) {
          nx = 0;
          nz = -1;
          depth = top + body.radius;
        } else {
          nx = 0;
          nz = 1;
          depth = bottom + body.radius;
        }
      }
    }

    body.x += nx * (depth + PHYSICS.skin);
    body.z += nz * (depth + PHYSICS.skin);

    const speed = Math.hypot(body.vx, body.vz);
    if (body.vx * nx + body.vz * nz < 0) {
      const r = reflect(body.vx, body.vz, nx, nz, rest);
      body.vx = r.x;
      body.vz = r.z;
    }
    return { nx, nz, x: body.x, z: body.z, speed };
  }

  /** Bounce bookkeeping: budget, boon hooks and feedback. */
  onPlayerRebound(player, game, hit, kind, collider = null) {
    if (player.state !== 'launched') return;
    player.bouncesUsed += 1;
    game.on?.playerRebound?.({
      player,
      x: hit.x,
      z: hit.z,
      nx: hit.nx,
      nz: hit.nz,
      speed: hit.speed,
      kind,
      collider
    });
    if (player.bouncesUsed > player.maxBounces) {
      player.endLaunch();
    }
  }

  /* ---------------------------------------------------------------- *
   * Enemies vs static geometry — the Wall-Splat
   * ---------------------------------------------------------------- */

  resolveEnemyGeometry(enemy, game) {
    const knocked = enemy.state === ENEMY_STATE.KNOCKED;
    const speedBefore = enemy.speed;

    const rail = this.resolveRails(enemy, PHYSICS.enemyWallRestitution);
    if (rail) this._afterEnemyImpact(enemy, game, rail, knocked, speedBefore, 'rail', null);

    for (let i = 0; i < this.colliders.length; i++) {
      const collider = this.colliders[i];
      const hit = this.resolveCollider(enemy, collider, PHYSICS.enemyWallRestitution);
      if (hit) {
        this._afterEnemyImpact(
          enemy,
          game,
          hit,
          knocked,
          speedBefore,
          collider.kind || 'obstacle',
          collider
        );
      }
    }
  }

  _afterEnemyImpact(enemy, game, hit, knocked, speed, kind, collider) {
    if (knocked && speed >= PHYSICS.wallSplatSpeed && enemy.caromCooldown <= 0) {
      enemy.caromCooldown = 0.15;
      game.on?.wallSplat?.({
        enemy,
        x: hit.x,
        z: hit.z,
        nx: hit.nx,
        nz: hit.nz,
        speed,
        kind,
        collider
      });
    } else {
      game.on?.enemyRebound?.({ enemy, x: hit.x, z: hit.z, speed, kind });
    }
  }

  /* ---------------------------------------------------------------- *
   * Player vs enemies — the Cue Strike
   * ---------------------------------------------------------------- */

  resolvePlayerEnemy(player, enemy, game) {
    const dx = player.x - enemy.x;
    const dz = player.z - enemy.z;
    const dist = Math.hypot(dx, dz);
    const min = player.radius + enemy.radius;
    if (dist >= min) return;

    // Spawning bodies have no collision — you cannot be ambushed by a telegraph.
    if (enemy.state === ENEMY_STATE.SPAWNING) return;

    // Normal points from the enemy toward the player.
    const nx = dist > EPS ? dx / dist : 0;
    const nz = dist > EPS ? dz / dist : -1;
    const depth = min - dist;

    const launched =
      player.state === PLAYER_STATE.LAUNCHED || player.state === PLAYER_STATE.DASHING;
    const striking = launched && player.speed > PLAYER.settleSpeed && enemy.strikeCooldown <= 0;

    if (striking) {
      const impactSpeed = player.speed;
      const banked = player.bouncesUsed > 0;
      const result =
        game.on?.cueStrike?.({
          player,
          enemy,
          nx,
          nz,
          x: enemy.x + nx * enemy.radius,
          z: enemy.z + nz * enemy.radius,
          speed: impactSpeed,
          banked
        }) || {};
      enemy.strikeCooldown = 0.14;

      if (result.killed || !enemy.alive) {
        // The body shattered, so there is nothing left to bounce off: hold the
        // line and pay a small speed tax. This is the *only* pass-through case.
        // Making it conditional on the kill rather than on an archetype flag is
        // what removes the old "why did I go through that one but not this one?"
        // — the answer is now visible on screen.
        const retention = player.stats.pierceRetention;
        player.vx *= retention;
        player.vz *= retention;
        return;
      }

      // Textbook two-body impulse along the line of centres. Solving it properly
      // (rather than scripting a knock speed) is what makes the table legible:
      // equal masses head-on give a stop shot, a cut sends the object ball down
      // the centre line while the cue ball leaves along the tangent — the 90°
      // rule the aim preview draws.
      this.resolveBallImpulse(player, enemy, -nx, -nz, PHYSICS.ballRestitution);
      if (enemy.alive) enemy.applyKnock(enemy.vx, enemy.vz);

      player.x += nx * (depth + PHYSICS.skin);
      player.z += nz * (depth + PHYSICS.skin);
      return;
    }

    // Not a strike: separate softly, and let an active body body-check us.
    player.x += nx * (depth * 0.65 + PHYSICS.skin);
    player.z += nz * (depth * 0.65 + PHYSICS.skin);
    enemy.x -= nx * depth * 0.35;
    enemy.z -= nz * depth * 0.35;
    if (enemy.state === ENEMY_STATE.ACTIVE) {
      game.on?.playerTouched?.({ player, enemy });
    }
  }

  /* ---------------------------------------------------------------- *
   * Enemy vs enemy — the Carom ("The Break")
   * ---------------------------------------------------------------- */

  resolveEnemyPair(a, b, game) {
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const dist = Math.hypot(dx, dz);
    const min = a.radius + b.radius;
    if (dist >= min) return;
    if (a.state === ENEMY_STATE.SPAWNING || b.state === ENEMY_STATE.SPAWNING) return;

    const nx = dist > EPS ? dx / dist : 1; // from a toward b
    const nz = dist > EPS ? dz / dist : 0;
    const depth = min - dist;

    const aLethal = a.isLethalProjectile && a.caromCooldown <= 0;
    const bLethal = b.isLethalProjectile && b.caromCooldown <= 0;

    if (aLethal || bLethal) {
      const striker = aLethal && (!bLethal || a.speed >= b.speed) ? a : b;
      const target = striker === a ? b : a;
      const sx = striker === a ? nx : -nx; // striker → target
      const sz = striker === a ? nz : -nz;
      const speed = striker.speed;

      game.on?.carom?.({
        striker,
        target,
        x: target.x - sx * target.radius,
        z: target.z - sz * target.radius,
        nx: sx,
        nz: sz,
        speed
      });
      a.caromCooldown = 0.15;
      b.caromCooldown = 0.15;

      // Object balls collide by the same rule the cue ball does, so a carom in
      // the middle of a chain is as readable as the opening strike.
      this.resolveBallImpulse(striker, target, sx, sz, PHYSICS.ballRestitution);
      if (target.alive) target.applyKnock(target.vx, target.vz);
    }

    // Always separate so bodies never stack.
    const push = depth * 0.5 + PHYSICS.skin;
    a.x -= nx * push;
    a.z -= nz * push;
    b.x += nx * push;
    b.z += nz * push;
  }

  /* ---------------------------------------------------------------- *
   * Projectiles
   * ---------------------------------------------------------------- */

  overlapsCollider(x, z, radius, collider) {
    if (collider.type === 'circle') {
      return Math.hypot(x - collider.x, z - collider.z) < radius + collider.radius;
    }
    const cx = Math.min(Math.max(x, collider.x - collider.hw), collider.x + collider.hw);
    const cz = Math.min(Math.max(z, collider.z - collider.hh), collider.z + collider.hh);
    return Math.hypot(x - cx, z - cz) < radius;
  }

  resolveProjectile(p, player, game) {
    if (
      Math.abs(p.x) > ARENA.halfW - p.radius ||
      Math.abs(p.z) > ARENA.halfH - p.radius
    ) {
      p.alive = false;
      game.on?.projectileExpired?.({ projectile: p, reason: 'rail' });
      return;
    }

    for (let i = 0; i < this.colliders.length; i++) {
      if (this.overlapsCollider(p.x, p.z, p.radius, this.colliders[i])) {
        p.alive = false;
        game.on?.projectileExpired?.({ projectile: p, reason: 'obstacle' });
        return;
      }
    }

    if (player && player.alive) {
      const d = Math.hypot(p.x - player.x, p.z - player.z);
      if (d < p.radius + player.radius) {
        p.alive = false;
        game.on?.projectileHit?.({ projectile: p, player });
      }
    }
  }

  /* ---------------------------------------------------------------- *
   * Non-solid zones (amplifier pyres, hazard strips)
   * ---------------------------------------------------------------- */

  resolveZones(h, game) {
    const player = game.player;
    if (!player || !player.alive) return;
    for (let i = 0; i < game.zones.length; i++) {
      const zone = game.zones[i];
      let inside;
      if (zone.type === 'circle') {
        inside = Math.hypot(player.x - zone.x, player.z - zone.z) < zone.radius + player.radius;
      } else {
        inside = this.overlapsCollider(player.x, player.z, player.radius, zone);
      }
      if (!inside) {
        zone.contains = false;
        continue;
      }
      const entering = !zone.contains;
      zone.contains = true;
      if (zone.kind === 'hazard') {
        game.on?.hazardTick?.({ zone, player, dt: h });
      } else if (entering) {
        game.on?.zoneEnter?.({ zone, player });
      }
    }
  }

  /* ---------------------------------------------------------------- *
   * Trajectory prediction — pure, never mutates world state
   * ---------------------------------------------------------------- */

  /**
   * March a swept circle through the table, reflecting off geometry until it
   * hits a body or runs out of distance.
   *
   * @param {{x:number,z:number}} origin
   * @param {{x:number,z:number}} dir unit direction
   * @param {object} [opts]
   * @param {number} [opts.radius]
   * @param {number} [opts.maxBounces]
   * @param {number} [opts.maxDistance]
   * @param {Array}  [opts.bodies] targets that stop the sweep (enemies)
   * @returns {{segments: Array, hit: object|null, caromDir: object|null,
   *           bounces: number, totalDistance: number}}
   */
  predictTrajectory(origin, dir, opts = {}) {
    const radius = opts.radius ?? PLAYER.radius;
    const maxBounces = opts.maxBounces ?? TRAJECTORY.previewBounces;
    const maxDistance = opts.maxDistance ?? TRAJECTORY.maxDistance;
    const bodies = opts.bodies || [];
    const colliders = opts.colliders || this.colliders;

    const segments = [];
    let px = origin.x;
    let pz = origin.z;
    let dx = dir.x;
    let dz = dir.z;
    const dirLen = Math.hypot(dx, dz);
    const result = {
      segments,
      hit: null,
      caromDir: null,
      bounces: 0,
      totalDistance: 0
    };
    if (dirLen < EPS) return result;
    dx /= dirLen;
    dz /= dirLen;

    let remaining = maxDistance;
    let bounces = 0;

    while (remaining > EPS && bounces <= maxBounces) {
      // --- nearest body -------------------------------------------------
      let bodyT = Infinity;
      let bodyRef = null;
      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        if (!b || b.alive === false || b.predictable === false) continue;
        const t = sweepCircleCircle(px, pz, dx, dz, radius, b.x, b.z, b.radius);
        if (t < bodyT) {
          bodyT = t;
          bodyRef = b;
        }
      }

      // --- nearest geometry ---------------------------------------------
      let geomT = Infinity;
      let geomNx = 0;
      let geomNz = 0;
      let geomKind = 'rail';
      let geomRef = null;

      const railHit = rayRails(px, pz, dx, dz, radius);
      if (railHit && railHit.t < geomT) {
        geomT = railHit.t;
        geomNx = railHit.nx;
        geomNz = railHit.nz;
        geomKind = 'rail';
        geomRef = null;
      }

      for (let i = 0; i < colliders.length; i++) {
        const c = colliders[i];
        if (c.solid === false) continue;
        let t = Infinity;
        let nx = 0;
        let nz = 0;
        if (c.type === 'circle') {
          t = sweepCircleCircle(px, pz, dx, dz, radius, c.x, c.z, c.radius);
          if (Number.isFinite(t)) {
            const ix = px + dx * t - c.x;
            const iz = pz + dz * t - c.z;
            const len = Math.hypot(ix, iz) || 1;
            nx = ix / len;
            nz = iz / len;
          }
        } else {
          const boxHit = sweepCircleBox(px, pz, dx, dz, radius, c);
          if (boxHit) {
            t = boxHit.t;
            nx = boxHit.nx;
            nz = boxHit.nz;
          }
        }
        if (t < geomT) {
          geomT = t;
          geomNx = nx;
          geomNz = nz;
          geomKind = c.kind || 'obstacle';
          geomRef = c;
        }
      }

      // --- resolve the nearest event ------------------------------------
      const bodyFirst = bodyT <= geomT;
      const t = Math.min(bodyT, geomT, remaining);
      const ax = px;
      const az = pz;
      const bx = px + dx * t;
      const bz = pz + dz * t;
      segments.push({ ax, az, bx, bz, bounce: bounces, kind: bodyFirst ? 'body' : geomKind });
      result.totalDistance += t;

      if (bodyFirst && Number.isFinite(bodyT) && bodyT <= remaining) {
        // The struck body flies along the line from contact point to its centre.
        const cdx = bodyRef.x - bx;
        const cdz = bodyRef.z - bz;
        const len = Math.hypot(cdx, cdz) || 1;
        result.hit = {
          body: bodyRef,
          x: bx,
          z: bz,
          nx: cdx / len,
          nz: cdz / len,
          bounces
        };
        result.caromDir = { x: cdx / len, z: cdz / len };
        break;
      }

      if (Number.isFinite(geomT) && geomT <= remaining) {
        remaining -= t;
        // Step marginally off the surface so the next sweep does not re-hit it.
        px = bx + geomNx * (PHYSICS.skin * 4);
        pz = bz + geomNz * (PHYSICS.skin * 4);
        const r = reflect(dx, dz, geomNx, geomNz, 1);
        dx = r.x;
        dz = r.z;
        bounces += 1;
        result.bounces = bounces;
        continue;
      }

      break; // ran out of preview distance
    }

    return result;
  }
}

export default PhysicsSystem;
