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

import { ARENA, PHYSICS, TIME, TRAJECTORY, PLAYER, RULES, TABLE } from '../config.js';
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
 * THE DRAG MODEL, SOLVED RATHER THAN STEPPED.
 *
 * `integrate` damps velocity exponentially (v *= e^-drag*h), and the integral
 * of that is beautifully simple: the distance covered between two speeds is
 * (v0 - v1) / drag. So speed and distance are LINEAR in each other inside one
 * drag regime, and the preview never has to run the simulation to know where a
 * body stops — it can solve for it.
 *
 * There are two regimes, because the creep assist forces drag up to
 * `creepDrag` once a body drops below `creepSpeed` (see RULES.creepSpeed).
 * Both functions below walk the fast regime first, then the creep regime.
 */

/**
 * Speed remaining after coasting `dist` from `v0`.
 *
 * `drag` is the body's own fast-regime friction and it MATTERS: this used to
 * take the cue ball's number whatever body it was asked about, so every
 * object-ball line was drawn as though the ball were sliding on the cue's
 * friction (0.9 against a struck ball's 0.8). The leg came out about five
 * percent short — which is nothing across the felt and everything when the
 * line stops just outside a pocket the ball rolls into.
 */
export function speedAfterDistance(v0, dist, drag = PLAYER.dragLaunched) {
  let v = v0;
  let s = Math.max(0, dist);
  if (RULES.staticTable && v > RULES.creepSpeed) {
    const fast = (v - RULES.creepSpeed) / drag;
    if (s <= fast) return v - drag * s;
    s -= fast;
    v = RULES.creepSpeed;
  } else if (!RULES.staticTable) {
    return Math.max(0, v - drag * s);
  }
  return Math.max(0, v - RULES.creepDrag * s);
}

/**
 * How far a body still travels before it is slow enough to have stopped.
 *
 * @param {number} v0
 * @param {number} [drag] the body's own fast-regime drag. The cue ball uses
 *   PLAYER.dragLaunched; a knocked object ball is heavier on the felt and uses
 *   PHYSICS.knockedDrag, which is why the object-ball preview would be wrong
 *   if it borrowed the cue's number.
 */
export function carryDistance(v0, drag = PLAYER.dragLaunched) {
  // WHERE THE BALL STOPS, NOT WHERE THE GAME STOPS WATCHING IT.
  //
  // This used to subtract a settle speed — the speed below which the table is
  // declared still and the next stroke may be aimed. But nothing anywhere
  // zeroes a velocity: `integrate` damps exponentially, so a ball keeps
  // creeping after the game has stopped caring, and the total distance it
  // covers from any speed is exactly v/drag. Ending the drawn line at the
  // settle speed left it a third of a unit short of the truth — invisible in
  // the middle of the table, and the difference between a trickle that drops
  // and one that does not when the line ends at a pocket's lip.
  if (v0 <= 0) return 0;
  if (!RULES.staticTable) return v0 / drag;
  if (v0 <= RULES.creepSpeed) return v0 / RULES.creepDrag;
  return (v0 - RULES.creepSpeed) / drag + RULES.creepSpeed / RULES.creepDrag;
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

  // THE ENTRY FACE'S NORMAL ALWAYS OPPOSES TRAVEL. A body moving right enters
  // through the left face, whose outward normal is -x; moving left, through
  // the right face, whose outward normal is +x. So the sign is -sign(d) in
  // both cases — but the swap branch used to set it to +sign(d), which handed
  // back a normal pointing INTO the box for every hit taken travelling in the
  // negative direction on the dominant axis.
  //
  // `reflect` is blind to the sign (a mirror is a mirror whichever way its
  // normal faces) so the drawn line looked right, and the corner branch below
  // has always returned an outward normal, so the two halves of this function
  // disagreed with each other. What it broke was everything that asks which
  // SIDE the body is on: the standoff after a bounce pushed the ball further
  // in, and the table's "only reflect if we are moving into the surface" guard
  // read a real contact as a departure and let the ball through — then caught
  // it a step later, deep in the corner, and sent it somewhere no line drew.
  if (Math.abs(dx) < EPS) {
    if (px < exMin || px > exMax) return null;
  } else {
    const inv = 1 / dx;
    let t1 = (exMin - px) * inv;
    let t2 = (exMax - px) * inv;
    if (t1 > t2) {
      const tmp = t1;
      t1 = t2;
      t2 = tmp;
    }
    if (t1 > tMin) {
      tMin = t1;
      axis = 0;
      sign = -Math.sign(dx);
    }
    if (t2 < tMax) tMax = t2;
  }

  if (Math.abs(dz) < EPS) {
    if (pz < ezMin || pz > ezMax) return null;
  } else {
    const inv = 1 / dz;
    let t1 = (ezMin - pz) * inv;
    let t2 = (ezMax - pz) * inv;
    if (t1 > t2) {
      const tmp = t1;
      t1 = t2;
      t2 = tmp;
    }
    if (t1 > tMin) {
      tMin = t1;
      axis = 1;
      sign = -Math.sign(dz);
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

    // PORTALS LAST OF THE MOVERS, and for the same reason pockets are last of
    // all: a translation moves a ball somewhere else entirely, so anything
    // resolved after one is resolved against a table the ball is no longer on.
    // A contact the portal jumped over is not lost — the ball is now on the far
    // side of the ring with the rest of its speed, and meets whatever is there
    // on the next sub-step, a fiftieth of a unit later.
    if (game.table?.portals?.length) {
      if (player && player.alive) this.resolvePortals(player, game.table);
    }

    // Pockets and felt objects are tested last, once every body is where this
    // sub-step leaves it. A ball is taken by its CENTRE reaching a pocket, so
    // the rails can keep reflecting normally and the trajectory preview stays
    // exactly as trustworthy as it was.
    if (game.table) this.resolveTable(game);
  }

  /* ---------------------------------------------------------------- *
   * Portals
   * ---------------------------------------------------------------- */

  /**
   * A ball whose step reaches a ring comes out of the other one, carrying its
   * heading, its speed and its offset from the ring's centre — the whole path
   * picked up and put down somewhere else.
   *
   * Resolved at the crossing rather than at the end of the step, like every
   * other contact in this file, because the preview solves the exact crossing
   * and a table that teleports a fiftieth of a second late is a table that
   * disagrees with the line the player was shown.
   *
   * ONLY THE CUE BALL, which is the rule every felt object already follows: a
   * rack that can vanish mid-stroke makes routing unreadable, and the whole
   * point of the felt is that YOUR ball's path is the thing you are choosing.
   */
  resolvePortals(body, table) {
    let last = null;
    // TWICE, for the same reason the rails resolve twice: the rest of a step
    // spent on the far side can reach a second ring.
    for (let pass = 0; pass < 2; pass += 1) {
      const step = this._step(body);
      if (!step) break;
      const hit = table.portalAlong(step.x, step.z, body.x, body.z);
      if (!hit) break;

      const left = this._rewind(body, step, hit.t);
      // The leg from here to where the ball comes out is the one nothing may
      // read as travel.
      const jump = Math.max(0, (body.stepTrailN || 1) - 1);
      body.x += hit.dx;
      body.z += hit.dz;
      // Inside the far ring by a skin, so the ring it came out of cannot read
      // as a ring it is entering. See the same standoff in the preview.
      const sp = Math.hypot(body.vx, body.vz) || 1;
      body.x += (body.vx / sp) * PHYSICS.skin;
      body.z += (body.vz / sp) * PHYSICS.skin;
      this._trailPush(body);
      body.stepTrailJump |= 1 << jump;
      // THE RIBBON BREAKS WHERE THE BALL DOES. The streak behind the cue ball
      // is a list of the places it has been, so a jump would be drawn as one
      // long bar across the table — the only thing on screen claiming the ball
      // went through the middle of it.
      body.trail?.clear?.();
      const cx = body.x;
      const cz = body.z;
      // Whatever was left of the step, spent from the far ring on the same
      // heading — so passing through costs the ball nothing but the distance
      // it would have travelled anyway.
      body.x += body.vx * left;
      body.z += body.vz * left;
      this._trailPush(body);
      this._rebase(body, cx, cz, left);
      last = hit;
    }
    return last;
  }

  /* ---------------------------------------------------------------- *
   * Pockets and felt objects
   * ---------------------------------------------------------------- */

  /**
   * The only place a ball can leave the table.
   *
   * Everything here reports upward through `game.on` and changes no rules
   * itself — physics decides that a body arrived somewhere, the rules layer
   * decides what that is worth.
   */
  resolveTable(game) {
    const table = game.table;
    const player = game.player;

    // ALONG THE PATH, not at the end of it. See Table.pocketAlong.
    const walk = (body, fn) => {
      const t = body.stepTrail;
      const n = body.stepTrailN || 0;
      if (!t || n < 2) return fn(body.x, body.z, body.x, body.z);
      const jumps = body.stepTrailJump || 0;
      for (let k = 1; k < n; k++) {
        // A portal's leg joins two places the ball was without being anywhere in
        // between. See `_trailStart`.
        if (jumps & (1 << (k - 1))) continue;
        const out = fn(t[(k - 1) * 2], t[(k - 1) * 2 + 1], t[k * 2], t[k * 2 + 1]);
        if (out) return out;
      }
      return null;
    };

    if (player && player.alive) {
      const drop = walk(player, (ax, az, bx, bz) => table.pocketAlong(ax, az, bx, bz));
      if (drop) {
        // Stand the ball in the mouth it actually entered, so what is drawn
        // falling is where it fell.
        player.x = drop.x;
        player.z = drop.z;
        game.on?.scratch?.({ player, pocket: drop.pocket });
      } else {
        const seen = new Set();
        walk(player, (ax, az, bx, bz) => {
          for (const object of table.objectsAlong(ax, az, bx, bz, player.radius)) {
            if (seen.has(object)) continue;
            seen.add(object);
            game.on?.objectHit?.({ object, body: player, isCue: true });
          }
          return null;
        });
      }
    }

    const enemies = game.enemies || [];
    for (let i = 0; i < enemies.length; i++) {
      const ball = enemies[i];
      if (!ball.alive || ball.state === ENEMY_STATE.SPAWNING) continue;
      const drop = walk(ball, (ax, az, bx, bz) => table.pocketAlong(ax, az, bx, bz));
      if (drop) {
        ball.x = drop.x;
        ball.z = drop.z;
        game.on?.potted?.({ ball, pocket: drop.pocket });
        continue;
      }
      const seen = new Set();
      walk(ball, (ax, az, bx, bz) => {
        for (const object of table.objectsAlong(ax, az, bx, bz, ball.radius)) {
          if (seen.has(object) || !ball.alive) continue;
          seen.add(object);
          game.on?.objectHit?.({ object, body: ball, isCue: false });
        }
        return null;
      });
    }
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
    // WHERE THIS BODY WAS BEFORE THE STEP, kept so a contact discovered after
    // the step can be traced back to the moment it actually happened. Every
    // resolver below works from this instead of from the overlap it landed in
    // — see `_rewind`.
    body.stepX = body.x;
    body.stepZ = body.z;
    body.stepH = h;
    this._trailStart(body);

    let drag = body.drag || 0;
    // The creep assist: a body too slow to reach anything stops being allowed
    // to hold the stroke open. See RULES.creepSpeed.
    if (RULES.staticTable) {
      const speed = Math.hypot(body.vx, body.vz);
      if (speed > 0 && speed < RULES.creepSpeed) drag = Math.max(drag, RULES.creepDrag);
    }

    // THE EXACT DISPLACEMENT, NOT A STEP AT THE OLD SPEED.
    //
    // This moved the body by v·h and then damped v, which over a whole stroke
    // overshoots the drag it is modelling by about half a step's worth of
    // decay — roughly 1% at 180 Hz, and MORE on a slower phone. Two
    // consequences, both of which showed up as the preview lying:
    //
    //   the ball travels further than `carryDistance` — the closed-form
    //   solution of this same drag — says it will, so a line drawn to the lip
    //   of a pocket was short of a ball that trickled in;
    //
    //   and how much further depends on the frame rate, so the same stroke
    //   landed in different places on different devices.
    //
    // Integrating the exponential in closed form is not more expensive and it
    // is exact at any step size: over a step the body covers v·(1-e^-dh)/d,
    // and over the whole coast it covers v/d, which is exactly what the
    // preview draws.
    if (drag > 0) {
      const damp = Math.exp(-drag * h);
      const travel = (1 - damp) / drag;
      body.x += body.vx * travel;
      body.z += body.vz * travel;
      body.vx *= damp;
      body.vz *= damp;
    } else {
      body.x += body.vx * h;
      body.z += body.vz * h;
    }
    this._trailPush(body);
  }

  /* ---------------------------------------------------------------- *
   * Player vs static geometry
   * ---------------------------------------------------------------- */

  resolvePlayerGeometry(player, game) {
    // TWICE, because a step that ends past a corner crossed two cushions and
    // resolving one of them leaves the ball still outside the other.
    for (let pass = 0; pass < 2; pass += 1) {
      const rail = this.resolveRails(player, PHYSICS.wallRestitution);
      if (!rail) break;
      this.onPlayerRebound(player, game, rail, 'rail');
    }

    for (let i = 0; i < this.colliders.length; i++) {
      const collider = this.colliders[i];
      const hit = this.resolveCollider(player, collider);
      if (hit) this.onPlayerRebound(player, game, hit, collider.kind || 'obstacle', collider);
    }
  }

  /* ---------------------------------------------------------------- *
   * CONTACTS RESOLVED WHERE THEY HAPPEN
   *
   * A step moves a ball by v*h in a straight line, and a collision is then
   * noticed because the step ENDED inside something. Resolving it there —
   * taking the normal from the overlap, reflecting from the overlap — is
   * wrong in a way that is invisible on any single bounce and ruinous over a
   * chain of them:
   *
   *   - the turn happens up to v*h past the cushion the ball really touched,
   *     which slides the whole outgoing line sideways;
   *   - on a ball, the line of centres taken while the two are overlapping is
   *     rotated away from the line of centres at the touch, so the object ball
   *     leaves on the wrong heading — by degrees, on a thin cut;
   *   - and the deeper the overlap, the bigger both errors, so the same shot
   *     played on a slower phone lands somewhere else.
   *
   * The aim preview never had any of this: it solves the exact swept contact.
   * So the preview and the table disagreed, and the preview was the one
   * telling the truth. These helpers put the table on the preview's geometry:
   * rewind along the step to the moment of touch, resolve THERE, and spend
   * whatever is left of the step on the new heading.
   * ------------------------------------------------------------------ */

  /**
   * How much of this step is left after `t`, in seconds, given the step the
   * body just took. Reconstructed from the step itself so nothing has to
   * thread `h` through every resolver.
   */
  _stepRemainder(body, t) {
    return (body.stepH || 0) * Math.max(0, 1 - t);
  }

  /* THE PATH A SUBSTEP ACTUALLY TOOK, corner by corner.
   *
   * `stepTrail`, not `trail`: the player entity already owns a `trail`, the
   * ribbon drawn behind the ball, and these two have been sharing one property
   * since the day this was written — it happened to work because a JS object
   * takes numeric keys, so the coordinates were being stored on the ribbon.
   * A portal needs both of them in the same breath (break the ribbon, skip the
   * leg) and two things that need telling apart should have two names.
   *
   * Pockets and pads are tested against this rather than against the point the
   * step ended on, and a step with a cushion in the middle of it is a bent
   * line, not a chord — testing the chord would drop a ball into the corner
   * pocket it banked cleanly past. Four corners is more than any one substep
   * can produce. */
  _trailStart(body) {
    if (!body.stepTrail) body.stepTrail = new Float64Array(12);
    body.stepTrail[0] = body.x;
    body.stepTrail[1] = body.z;
    body.stepTrailN = 1;
    // WHICH OF THIS STEP'S LEGS WERE NOT TRAVELLED. A portal moves a ball from
    // one ring to the other without crossing what is between them, so the leg
    // joining the two is a bookkeeping line, not a path: anything that reads
    // the trail as "where this body went" — pockets, pads — has to step over
    // it, or a portal becomes a way of potting balls halfway across the table.
    body.stepTrailJump = 0;
  }

  _trailPush(body) {
    if (!body.stepTrail || body.stepTrailN >= 6) return;
    body.stepTrail[body.stepTrailN * 2] = body.x;
    body.stepTrail[body.stepTrailN * 2 + 1] = body.z;
    body.stepTrailN += 1;
  }

  /** Move the last recorded corner to wherever the body has just been put. */
  _trailMoveLast(body) {
    if (!body.stepTrail || !body.stepTrailN) return;
    body.stepTrail[(body.stepTrailN - 1) * 2] = body.x;
    body.stepTrail[(body.stepTrailN - 1) * 2 + 1] = body.z;
  }

  /** The straight line this step travelled, or null if there was none. */
  _step(body) {
    if (!Number.isFinite(body.stepX)) return null;
    const dx = body.x - body.stepX;
    const dz = body.z - body.stepZ;
    const len = Math.hypot(dx, dz);
    if (len < EPS) return null;
    return { x: body.stepX, z: body.stepZ, dx: dx / len, dz: dz / len, len };
  }

  /**
   * THE REST OF THE STEP IS NOW THE STEP.
   *
   * Called once a contact has been resolved and the body re-advanced along its
   * new heading. Without this, a second contact in the same substep — a bank
   * into a ball, which is exactly the shot this whole change is about — would
   * be rewound along the leg BEFORE the bounce, and land the ball somewhere it
   * never went.
   */
  _rebase(body, cx, cz, left) {
    body.stepX = cx;
    body.stepZ = cz;
    body.stepH = left;
  }

  /**
   * Did `mover`'s step reach `target` at any point along it?
   * @returns {{step: object, toi: number} | null}
   */
  _sweepsInto(mover, target) {
    const step = this._step(mover);
    if (!step) return null;
    const toi = sweepCircleCircle(
      step.x,
      step.z,
      step.dx,
      step.dz,
      mover.radius,
      target.x,
      target.z,
      target.radius
    );
    return Number.isFinite(toi) && toi <= step.len ? { step, toi } : null;
  }

  /**
   * Put the body at the contact `dist` along its own step, and hand back the
   * seconds of the step that remain to be spent on the new heading.
   */
  _rewind(body, step, dist) {
    body.x = step.x + step.dx * dist;
    body.z = step.z + step.dz * dist;
    this._trailMoveLast(body);
    return this._stepRemainder(body, step.len > EPS ? dist / step.len : 1);
  }

  /**
   * Push a circular body back inside the rails and reflect its velocity.
   * @returns {{ nx: number, nz: number, x: number, z: number, speed: number } | null}
   */
  resolveRails(body, restitution) {
    const limitX = ARENA.halfW - body.radius;
    const limitZ = ARENA.halfH - body.radius;
    if (
      body.x >= -limitX &&
      body.x <= limitX &&
      body.z >= -limitZ &&
      body.z <= limitZ
    ) {
      return null;
    }

    // WHICH CUSHION, AND WHERE ALONG IT. A step that ends outside two rails at
    // once touched ONE of them first; the earliest crossing of the step is
    // that one, and resolving the other here would turn a cushion into a
    // corner pocket the table does not have.
    const step = this._step(body);
    let nx = 0;
    let nz = 0;
    let t = 1;
    if (step) {
      const dx = body.x - step.x;
      const dz = body.z - step.z;
      const cross = (from, to, span) => (Math.abs(span) < EPS ? Infinity : (to - from) / span);
      if (body.x < -limitX) {
        const tt = cross(step.x, -limitX, dx);
        if (tt >= 0 && tt < t) {
          t = tt;
          nx = 1;
          nz = 0;
        }
      } else if (body.x > limitX) {
        const tt = cross(step.x, limitX, dx);
        if (tt >= 0 && tt < t) {
          t = tt;
          nx = -1;
          nz = 0;
        }
      }
      if (body.z < -limitZ) {
        const tt = cross(step.z, -limitZ, dz);
        if (tt >= 0 && tt < t) {
          t = tt;
          nx = 0;
          nz = 1;
        }
      } else if (body.z > limitZ) {
        const tt = cross(step.z, limitZ, dz);
        if (tt >= 0 && tt < t) {
          t = tt;
          nx = 0;
          nz = -1;
        }
      }
    }

    // No usable step (a body placed into a rail rather than driven into one):
    // fall back to the clamp, which is all the information there is.
    if (!step || t >= 1) {
      nx = 0;
      nz = 0;
      if (body.x < -limitX) {
        body.x = -limitX + PHYSICS.skin;
        nx = 1;
      } else if (body.x > limitX) {
        body.x = limitX - PHYSICS.skin;
        nx = -1;
      }
      if (body.z < -limitZ) {
        body.z = -limitZ + PHYSICS.skin;
        nz = 1;
      } else if (body.z > limitZ) {
        body.z = limitZ - PHYSICS.skin;
        nz = -1;
      }
      const l = Math.hypot(nx, nz) || 1;
      nx /= l;
      nz /= l;
      const sp = Math.hypot(body.vx, body.vz);
      if (body.vx * nx + body.vz * nz < 0) {
        const r = reflect(body.vx, body.vz, nx, nz, restitution);
        body.vx = r.x;
        body.vz = r.z;
      }
      return { nx, nz, x: body.x, z: body.z, speed: sp };
    }

    const left = this._rewind(body, step, step.len * t);
    // Stand off the cushion by a skin so the next step does not re-detect the
    // contact it just resolved.
    body.x += nx * PHYSICS.skin;
    body.z += nz * PHYSICS.skin;
    const cx = body.x;
    const cz = body.z;
    const speed = Math.hypot(body.vx, body.vz);
    if (body.vx * nx + body.vz * nz < 0) {
      const r = reflect(body.vx, body.vz, nx, nz, restitution);
      body.vx = r.x;
      body.vz = r.z;
    }
    // Spend the rest of the step on the new heading, so a bounce costs the
    // ball no distance and the rebound starts where the cushion is.
    body.x += body.vx * left;
    body.z += body.vz * left;
    this._trailPush(body);
    this._rebase(body, cx, cz, left);
    return { nx, nz, x: cx, z: cz, speed };
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

    // The same rewind the rails and the balls get: an obstacle struck from
    // inside the overlap turns the ball at the wrong place, on a normal that
    // is wrong by however deep the step drove. On a board with something in
    // the middle of it that is the first bounce of five, and every one after
    // it inherits the error.
    //
    // ALONG THE STEP, NOT AT THE END OF IT.
    //
    // A body was only considered to have hit a collider if its step FINISHED
    // inside one. A step is v·h long and a barrier's corner is a point, so a
    // ball that clipped the corner and was already past it by the end of the
    // step went through untouched — while the preview, which sweeps, drew the
    // bounce. Every remaining disagreement on the one board with something in
    // the middle of it was this.
    //
    // The swept test comes first and the overlap test is the fallback, for a
    // body placed inside a collider rather than driven into one.
    let left = 0;
    let sweptNx = null;
    let sweptNz = 0;
    {
      const step = this._step(body);
      if (step) {
        let toi = Infinity;
        let hitNx = null;
        let hitNz = 0;
        if (collider.type === 'circle') {
          toi = sweepCircleCircle(
            step.x,
            step.z,
            step.dx,
            step.dz,
            body.radius,
            collider.x,
            collider.z,
            collider.radius
          );
          if (Number.isFinite(toi)) {
            const ix = step.x + step.dx * toi - collider.x;
            const iz = step.z + step.dz * toi - collider.z;
            const l = Math.hypot(ix, iz) || 1;
            hitNx = ix / l;
            hitNz = iz / l;
          }
        } else {
          const box = sweepCircleBox(step.x, step.z, step.dx, step.dz, body.radius, collider);
          if (box) {
            toi = box.t;
            hitNx = box.nx;
            hitNz = box.nz;
          }
        }
        if (hitNx !== null && Number.isFinite(toi) && toi <= step.len) {
          left = this._rewind(body, step, toi);
          sweptNx = hitNx;
          sweptNz = hitNz;
        }
      }
      if (sweptNx === null && !this.overlapsCollider(body.x, body.z, body.radius, collider)) {
        return null;
      }
    }

    if (sweptNx !== null) {
      nx = sweptNx;
      nz = sweptNz;
      // Standing exactly on the surface: no penetration left to push out of,
      // just the skin that keeps the next step from re-detecting this contact.
      body.x += nx * PHYSICS.skin;
      body.z += nz * PHYSICS.skin;
      const cx = body.x;
      const cz = body.z;
      const speed = Math.hypot(body.vx, body.vz);
      if (body.vx * nx + body.vz * nz < 0) {
        const r = reflect(body.vx, body.vz, nx, nz, rest);
        body.vx = r.x;
        body.vz = r.z;
      }
      if (left > 0) {
        body.x += body.vx * left;
        body.z += body.vz * left;
        this._trailPush(body);
      }
      this._rebase(body, cx, cz, left);
      return { nx, nz, x: cx, z: cz, speed };
    }

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
    this._trailMoveLast(body);
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

    for (let pass = 0; pass < 2; pass += 1) {
      const rail = this.resolveRails(enemy, PHYSICS.enemyWallRestitution);
      if (!rail) break;
      this._afterEnemyImpact(enemy, game, rail, knocked, speedBefore, 'rail', null);
    }

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
    let dx = player.x - enemy.x;
    let dz = player.z - enemy.z;
    let dist = Math.hypot(dx, dz);
    const min = player.radius + enemy.radius;

    // Spawning bodies have no collision — you cannot be ambushed by a telegraph.
    if (enemy.state === ENEMY_STATE.SPAWNING) return;

    // A contact is anywhere ALONG the step. At full power the cue covers a
    // third of a ball's width per substep, so it cannot pass clean through
    // one — but it can clip the edge of one and be past it by the time the
    // step ends, which the old end-of-step test scored as a clean miss while
    // the preview drew the carom.
    const grazed = this._sweepsInto(player, enemy);
    if (!grazed && dist >= min) return;

    // THE LINE OF CENTRES AT THE TOUCH, not at the overlap.
    //
    // This is the one that matters most. An object ball leaves along the line
    // of centres, so every degree of error here is a degree of error in where
    // it goes — and a cut taken from inside an overlap is rotated toward
    // head-on, by more the deeper the step drove in. It is why a thin cut the
    // preview drew into the corner came off the table somewhere else, and why
    // it did it differently on a slower phone.
    //
    // `sweepCircleCircle` is the predictor's own solver: rewinding the step
    // through it puts the table on exactly the geometry the drawn line was
    // promising.
    let left = 0;
    if (grazed) {
      left = this._rewind(player, grazed.step, grazed.toi);
      dx = player.x - enemy.x;
      dz = player.z - enemy.z;
      dist = Math.hypot(dx, dz) || min;
    }

    // Normal points from the enemy toward the player.
    const nx = dist > EPS ? dx / dist : 0;
    const nz = dist > EPS ? dz / dist : -1;
    const depth = Math.max(0, min - dist);

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
        if (left > 0) {
          player.x += player.vx * left;
          player.z += player.vz * left;
          this._trailPush(player);
        }
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
      const cx = player.x;
      const cz = player.z;
      const ex = enemy.x;
      const ez = enemy.z;
      // Both balls spend the rest of the step on the headings the impulse just
      // gave them. Without this the collision costs the stroke a whole step of
      // travel, which on a chain is a ball's width of lost carry per link.
      if (left > 0) {
        player.x += player.vx * left;
        player.z += player.vz * left;
        this._trailPush(player);
        if (enemy.alive) {
          enemy.x += enemy.vx * left;
          enemy.z += enemy.vz * left;
          this._trailPush(enemy);
        }
      }
      this._rebase(player, cx, cz, left);
      if (enemy.alive) this._rebase(enemy, ex, ez, left);
      return;
    }

    // Not a strike: separate softly, and let an active body body-check us.
    player.x += nx * (depth * 0.65 + PHYSICS.skin);
    player.z += nz * (depth * 0.65 + PHYSICS.skin);
    enemy.x -= nx * depth * 0.35;
    enemy.z -= nz * depth * 0.35;
    // On a static table a resting ball is furniture, not a threat: rolling up
    // against one costs you nothing. The only things that can hurt you are the
    // ones a stroke set in motion.
    if (enemy.state === ENEMY_STATE.ACTIVE && !RULES.staticTable) {
      game.on?.playerTouched?.({ player, enemy });
    }
  }

  /* ---------------------------------------------------------------- *
   * Enemy vs enemy — the Carom ("The Break")
   * ---------------------------------------------------------------- */

  resolveEnemyPair(a, b, game) {
    let dx = b.x - a.x;
    let dz = b.z - a.z;
    let dist = Math.hypot(dx, dz);
    const min = a.radius + b.radius;
    if (a.state === ENEMY_STATE.SPAWNING || b.state === ENEMY_STATE.SPAWNING) return;

    // Which body is doing the hitting: the faster one, whatever its state.
    const striker = a.speed >= b.speed ? a : b;
    const grazed = this._sweepsInto(striker, striker === a ? b : a);
    if (!grazed && dist >= min) return;

    // THE SAME REWIND THE CUE GETS. A combination is two of these collisions
    // in a row, so a normal taken from inside the overlap is an error the
    // second link inherits and multiplies — which is why the boards whose
    // lesson is a plant were the least predictable of all.
    let left = 0;
    if (grazed) {
      left = this._rewind(striker, grazed.step, grazed.toi);
      dx = b.x - a.x;
      dz = b.z - a.z;
      dist = Math.hypot(dx, dz) || min;
    }

    const nx = dist > EPS ? dx / dist : 1; // from a toward b
    const nz = dist > EPS ? dz / dist : 0;
    const depth = Math.max(0, min - dist);
    const target = striker === a ? b : a;
    const sx = striker === a ? nx : -nx; // striker → target
    const sz = striker === a ? nz : -nz;
    const speed = striker.speed;

    // TWO BALLS ALWAYS EXCHANGE MOMENTUM.
    //
    // This used to happen only when the striker was above the carom threshold,
    // which meant a slow ball nudging another simply pushed it apart without
    // any transfer — fine when object balls were enemies, wrong on a billiard
    // table, where a gentle kiss still moves the ball it kisses. The impulse is
    // unconditional now; the *scoring* event is what stays gated on speed.
    const impulse = this.resolveBallImpulse(striker, target, sx, sz, PHYSICS.ballRestitution);
    if (impulse > 0 && target.alive) target.applyKnock(target.vx, target.vz);

    const scoring = speed >= PHYSICS.caromMinSpeed && a.caromCooldown <= 0 && b.caromCooldown <= 0;
    if (scoring && impulse > 0) {
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
    }

    // Always separate so bodies never stack.
    const push = depth * 0.5 + PHYSICS.skin;
    a.x -= nx * push;
    a.z -= nz * push;
    b.x += nx * push;
    b.z += nz * push;
    // …and both spend what is left of the step on their new headings.
    const ax0 = a.x;
    const az0 = a.z;
    const bx0 = b.x;
    const bz0 = b.z;
    if (left > 0) {
      a.x += a.vx * left;
      a.z += a.vz * left;
      this._trailPush(a);
      b.x += b.vx * left;
      b.z += b.vz * left;
      this._trailPush(b);
      this._rebase(a, ax0, az0, left);
      this._rebase(b, bx0, bz0, left);
    }
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
    const bodies = opts.bodies || [];
    const colliders = opts.colliders || this.colliders;

    // A SPEED, NOT A LENGTH.
    //
    // The preview used to be handed one distance — how far the ball would roll
    // on an open table — and walk it down segment by segment. A cushion takes
    // four percent of a ball's speed every time it touches one, and a flat
    // distance cannot know that, so the line ran on past where the ball stops:
    // by a couple of units after one rail, by five or six after three. That is
    // the whole difference between a drawn line that reaches a pocket and a
    // ball that does not, and it is why banked shots were the ones that lied.
    //
    // Given a speed the preview spends it the way the table does: coast, lose
    // a bite of it at each cushion, and end where the ball runs out.
    const drag = opts.drag ?? PLAYER.dragLaunched;
    // THE HOLES IN THE CUSHION.
    //
    // `rayRails` reflects off an unbroken rectangle, so a line arriving at a
    // pocket was drawn bouncing cleanly off the rail beside it while the ball
    // dropped in — the single largest source of scratches the preview never
    // warned about. A pocket ends the line.
    const pockets = opts.pockets || [];
    // THE ONE ROUTE THAT IS NOT A LINE. A portal translates the ball by the
    // vector between its rings, so the drawn line is cut at one and resumes,
    // parallel, at the other. Handed in the same way the pockets are: a caller
    // that does not pass them gets the table without them, which is every
    // caller that is projecting something other than the cue ball.
    const portals = opts.portals || [];
    // A cushion charges a struck ball more than it charges the cue (0.82
    // against 0.96), so a preview that used one number for both drew object
    // legs running a third further than the ball goes.
    const railRestitution = opts.railRestitution ?? PHYSICS.wallRestitution;
    let speed = Number.isFinite(opts.speed) ? opts.speed : null;
    const ceiling = opts.maxDistance ?? TRAJECTORY.maxDistance;
    const budget = () => (speed === null ? ceiling : Math.min(ceiling, carryDistance(speed, drag)));

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
      totalDistance: 0,
      // The speed left at the end of the drawn line, and at the contact if
      // there was one. A caller that chains a second prediction onto this one
      // must not re-derive it from the distance: after a cushion the distance
      // no longer says what the speed is.
      hitSpeed: null,
      endSpeed: speed,
      // The pocket this line ends in, if it ends in one.
      pocket: null
    };
    if (dirLen < EPS) return result;
    dx /= dirLen;
    dz /= dirLen;

    let remaining = budget();
    let bounces = 0;
    let passes = 0;

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

      // --- nearest pocket -------------------------------------------------
      // Capture is on the CENTRE, so the sweep radius is zero: this asks where
      // the centre-line first enters a mouth, which is the table's own test.
      let pocketT = Infinity;
      let pocketRef = null;
      for (let i = 0; i < pockets.length; i++) {
        const k = pockets[i];
        const t0 = sweepCircleCircle(px, pz, dx, dz, 0, k.x, k.z, k.radius);
        if (t0 < pocketT) {
          pocketT = t0;
          pocketRef = k;
        }
      }

      // --- nearest portal ---------------------------------------------------
      // On the CENTRE, like a pocket and like the table's own test: a rule the
      // preview and the table have to agree on to the millimetre cannot afford
      // a fudge factor in one of them.
      let portalT = Infinity;
      let portalRef = null;
      for (let i = 0; i < portals.length; i++) {
        const ring = portals[i];
        // ALREADY INSIDE IS NOT ARRIVING, which is `Table.portalAlong`'s rule and
        // has to be this one too. A swept circle started inside another one
        // reports a contact at zero, so without this the line came out of the
        // far ring and read that ring as a fresh entry — straight back, and
        // again, four times over.
        const mx = px - ring.x;
        const mz = pz - ring.z;
        if (mx * mx + mz * mz <= ring.radius * ring.radius) continue;
        const t0 = sweepCircleCircle(px, pz, dx, dz, 0, ring.x, ring.z, ring.radius);
        if (t0 < portalT) {
          portalT = t0;
          portalRef = ring;
        }
      }

      // --- resolve the nearest event ------------------------------------
      const bodyFirst = bodyT <= geomT;
      const t = Math.min(bodyT, geomT, remaining);

      if (portalRef && portalT <= Math.min(t, remaining) && portalT <= pocketT && passes < TABLE.portal.maxPasses) {
        // To the ring, then on from the far one. The two legs are separate
        // segments with nothing drawn between them: the ball is never on the
        // line joining the rings, and a preview that drew one would be
        // promising a pot it cannot make.
        const ex = px + dx * portalT;
        const ez = pz + dz * portalT;
        segments.push({ ax: px, az: pz, bx: ex, bz: ez, bounce: bounces, kind: 'portal' });
        result.totalDistance += portalT;
        if (speed !== null) {
          speed = speedAfterDistance(speed, portalT, drag);
          result.endSpeed = speed;
          remaining = budget();
        } else {
          remaining -= portalT;
        }
        // A STANDOFF, INWARD, and it is the whole of what stops a portal sending
        // a ball back where it came from.
        //
        // The translation lands the ball exactly ON the far ring, which is a
        // floating-point coin toss between "just inside" and "just outside" —
        // and just outside, moving inward, is a fresh entry. Measured, the
        // preview took that second entry on a fifth of all headings through a portal and
        // drew the line carrying on from where it had started: through the
        // portal, back out of it, and off in the wrong direction.
        //
        // Both this and the table step a skin's depth inside instead, which
        // makes "am I already in this ring" the only state either of them
        // needs — no mute, no memory, nothing to keep in step.
        px = ex + (portalRef.twin.x - portalRef.x) + dx * PHYSICS.skin;
        pz = ez + (portalRef.twin.z - portalRef.z) + dz * PHYSICS.skin;
        passes += 1;
        result.portals = (result.portals || 0) + 1;
        continue;
      }

      if (pocketRef && pocketT <= Math.min(t, remaining)) {
        // TO THE LIP, AND THE VERDICT SEPARATELY.
        //
        // This drew the segment all the way to the pocket's CENTRE, because
        // every downstream test re-derived "does this line find a hole" by
        // measuring the closest approach of the drawn segments, and a segment
        // ending exactly ON the radius is a coin toss in floating point.
        //
        // But it also meant that the instant a sweeping aim crossed into the
        // mouth the far end of the line teleported to the centre, and back out
        // again — a visible jump at exactly the place the player is trying to
        // line up. The verdict lives in `result.pocket` now, which is exact and
        // needs no re-derivation, so the line can be drawn where the ball
        // actually reaches: the lip it goes in at.
        segments.push({
          ax: px,
          az: pz,
          bx: px + dx * pocketT,
          bz: pz + dz * pocketT,
          bounce: bounces,
          kind: 'pocket'
        });
        result.totalDistance += pocketT;
        if (speed !== null) result.endSpeed = speedAfterDistance(speed, pocketT, drag);
        result.pocket = pocketRef;
        break;
      }
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
        if (speed !== null) speed = speedAfterDistance(speed, t, drag);
        result.hitSpeed = speed;
        result.endSpeed = speed;
        break;
      }

      if (Number.isFinite(geomT) && geomT <= remaining) {
        // The cushion's tax, taken here so the rest of the line is drawn at
        // the speed the ball will really have.
        if (speed !== null) {
          const rest =
            geomKind === 'rail'
              ? railRestitution
              : geomRef?.restitution ?? PHYSICS.obstacleRestitution;
          speed = speedAfterDistance(speed, t, drag) * rest;
          result.endSpeed = speed;
          remaining = budget();
        } else {
          remaining -= t;
        }
        // Step marginally off the surface so the next sweep does not re-hit it.
        px = bx + geomNx * PHYSICS.skin;
        pz = bz + geomNz * PHYSICS.skin;
        const r = reflect(dx, dz, geomNx, geomNz, 1);
        dx = r.x;
        dz = r.z;
        bounces += 1;
        result.bounces = bounces;
        continue;
      }

      if (speed !== null) result.endSpeed = speedAfterDistance(speed, t, drag);
      break; // the ball has run out of legs
    }

    return result;
  }
}

export default PhysicsSystem;
