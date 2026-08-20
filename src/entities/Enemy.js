/**
 * Enemy.js — the object balls.
 *
 * One base class, three archetype configurations (see `ENEMY` in config.js):
 *
 *   Solids       red cubes            chase, cheap, pierceable chain fodder
 *   Stripes      violet octagons      hold range, charge a linear shot every 3 s
 *   Eight-Balls  amber cylinders      slow tanks with a 180° frontal shield
 *
 * The important shared behaviour is the KNOCKED state: a struck enemy becomes a
 * lethal projectile that damages its own allies on contact (a Carom) and
 * shatters against the rails (a Wall-Splat). That is what makes the table a
 * weapon rather than a container.
 */

import * as THREE from 'three';
import { ENEMY, PHYSICS, PALETTE, ROOM, ARENA } from '../config.js';

export const ENEMY_STATE = {
  SPAWNING: 'spawning',
  ACTIVE: 'active',
  KNOCKED: 'knocked',
  DEAD: 'dead'
};

/* Shared geometry — created once, reused by every instance. */
/**
 * Barrel length in world units, measured from the enemy's centre. The bullet is
 * born at this point rather than at a bare radial offset, so it leaves the gun
 * instead of appearing beside the body.
 */
export const GUN_LENGTH = 1.7;

/** Discharge feel: how hard the shot shoves the shooter, and for how long. */
const ENEMY_FIRE = {
  recoil: 3.4,
  flashTime: 0.16,
  /** How far the barrel kicks back, in world units, at peak recoil. */
  kick: 0.26
};

const GEO = {
  solid: null,
  stripe: null,
  heavy: null,
  shield: null,
  telegraph: null,
  charge: null,
  projectile: null
};

function geometry(key, factory) {
  if (!GEO[key]) GEO[key] = factory();
  return GEO[key];
}

/* ------------------------------------------------------------------ *
 * Enemy
 * ------------------------------------------------------------------ */

export class Enemy {
  /**
   * @param {THREE.Scene|THREE.Group} parent
   * @param {'solid'|'stripe'|'heavy'} type
   * @param {number} x
   * @param {number} z
   * @param {number} [level] scales HP mildly with room depth
   */
  constructor(parent, type, x, z, level = 1) {
    const config = ENEMY[type];
    if (!config) throw new Error(`Unknown enemy archetype: ${type}`);

    this.parent = parent;
    this.type = type;
    /**
     * Set by scripted (tutorial) rooms: hold position instead of steering.
     * Holding still is not the same as being harmless — a frozen shooter still
     * tracks, winds up and fires, it just does not walk. `disarmed` is the flag
     * that actually silences a weapon.
     */
    this.frozen = false;
    this.disarmed = false;
    this.config = config;

    // --- physics body ---
    this.x = x;
    this.z = z;
    this.vx = 0;
    this.vz = 0;
    this.radius = config.radius;
    this.mass = config.mass;
    this.drag = PHYSICS.enemyDrag;

    // --- combat ---
    const hpScale = 1 + (level - 1) * 0.06;
    this.maxHp = Math.round(config.hp * hpScale);
    this.hp = this.maxHp;
    this.alive = true;
    this.state = ENEMY_STATE.SPAWNING;
    this.spawnTimer = ROOM.spawnTelegraph;

    // --- ai ---
    this.facingX = 0;
    this.facingZ = 1;
    this.shotTimer = config.shotInterval ? config.shotInterval * (0.4 + Math.random() * 0.6) : 0;
    this.chargeTimer = 0;
    this.charging = false;
    /**
     * The bearing the wind-up was drawn along, locked when the charge starts.
     * Firing used to re-aim on the release frame, so the tell pointed one way
     * and the shot went another — which makes a readable wind-up worthless.
     */
    this.aimX = 0;
    this.aimZ = 1;
    /** Counts down after a shot: drives muzzle flash and barrel recoil. */
    this.fireFlash = 0;
    this.strafeSign = Math.random() < 0.5 ? -1 : 1;
    this.flashTimer = 0;
    this.knockTimer = 0;
    /** Prevents one carom from re-triggering against the same pair every step. */
    this.caromCooldown = 0;
    /** Stops a pierced-through body from being struck again on the next step. */
    this.strikeCooldown = 0;
    /** Set true while the trajectory preview should treat it as a target. */
    this.predictable = true;

    this._buildMesh();
  }

  /* ---------------------------------------------------------------- *
   * Presentation
   * ---------------------------------------------------------------- */

  _buildMesh() {
    const cfg = this.config;
    this.group = new THREE.Group();
    this.group.position.set(this.x, 0, this.z);

    let bodyGeo;
    let color;
    if (this.type === 'solid') {
      const s = cfg.radius * 1.55;
      bodyGeo = geometry('solid', () => new THREE.BoxGeometry(s, s, s));
      color = PALETTE.solid;
    } else if (this.type === 'stripe') {
      bodyGeo = geometry(
        'stripe',
        () => new THREE.CylinderGeometry(cfg.radius, cfg.radius, cfg.radius * 1.5, 8)
      );
      color = PALETTE.stripe;
    } else {
      bodyGeo = geometry(
        'heavy',
        () => new THREE.CylinderGeometry(cfg.radius, cfg.radius, cfg.radius * 1.2, 24)
      );
      color = PALETTE.heavy;
    }

    this.baseColor = new THREE.Color(color);
    this.material = new THREE.MeshStandardMaterial({
      color,
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.55,
      roughness: 0.4,
      metalness: 0.2
    });
    this.body = new THREE.Mesh(bodyGeo, this.material);
    this.body.position.y = cfg.radius * 0.85;
    this.group.add(this.body);

    // Ground marker so bodies read against the dark felt.
    this.markerMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.marker = new THREE.Mesh(
      new THREE.RingGeometry(cfg.radius * 1.02, cfg.radius * 1.24, 20),
      this.markerMat
    );
    this.marker.rotation.x = -Math.PI / 2;
    this.marker.position.y = 0.03;
    this.group.add(this.marker);

    // Heavy: a 180° frontal shield band. Local +Z is "forward".
    if (this.type === 'heavy') {
      const shieldGeo = geometry(
        'shield',
        () => new THREE.TorusGeometry(cfg.radius * 1.2, 0.11, 8, 26, Math.PI)
      );
      this.shieldMat = new THREE.MeshBasicMaterial({
        color: PALETTE.shield,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      this.shield = new THREE.Mesh(shieldGeo, this.shieldMat);
      this.shield.rotation.x = Math.PI / 2; // lay the arc flat, covering +Z
      this.shield.position.y = cfg.radius * 0.8;
      this.group.add(this.shield);
    }

    // Spawn telegraph ring.
    this.telegraphMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    this.telegraph = new THREE.Mesh(
      geometry('telegraph', () => new THREE.RingGeometry(0.86, 1.0, 28)),
      this.telegraphMat
    );
    this.telegraph.rotation.x = -Math.PI / 2;
    this.telegraph.position.y = 0.05;
    this.group.add(this.telegraph);

    // Stripe: the gun.
    //
    // The body is a regular octagon, so rotating the group to face the player
    // was a visual no-op — the enemy tracked you perfectly and looked like it
    // was doing nothing, and the shot arrived from a silhouette that had never
    // pointed anywhere. A barrel is the whole fix: it makes the facing visible,
    // gives the wind-up somewhere to happen, and gives the bullet an origin.
    if (this.type === 'stripe') {
      this.gun = new THREE.Group();
      this.gunMat = new THREE.MeshStandardMaterial({
        color: PALETTE.stripe,
        emissive: new THREE.Color(PALETTE.projectile),
        emissiveIntensity: 0.18,
        roughness: 0.35,
        metalness: 0.5
      });
      const barrel = new THREE.Mesh(
        geometry('stripeBarrel', () => {
          const g = new THREE.CylinderGeometry(0.17, 0.21, 1.0, 10);
          // Lay it along local +Z, which is "forward" for the whole group.
          g.rotateX(Math.PI / 2);
          g.translate(0, 0, 0.5);
          return g;
        }),
        this.gunMat
      );
      this.gun.add(barrel);

      // The muzzle glows as the shot builds, so the charge reads as energy
      // arriving at the place the bullet will leave from.
      this.muzzleMat = new THREE.MeshBasicMaterial({
        color: PALETTE.projectile,
        transparent: true,
        opacity: 0.04,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      this.muzzle = new THREE.Mesh(
        geometry('stripeMuzzle', () => new THREE.SphereGeometry(0.22, 10, 8)),
        this.muzzleMat
      );
      this.muzzle.position.z = 1.0;
      this.gun.add(this.muzzle);

      // Above the body, not inside it. The camera looks straight down, so a
      // barrel mounted at mid-height is occluded by the very silhouette it is
      // supposed to give a direction to; sitting it proud of the top face makes
      // the whole length readable from above.
      this.gun.position.y = cfg.radius * 1.8;
      this.group.add(this.gun);
    }

    // Stripe: closing charge ring.
    if (this.type === 'stripe') {
      this.chargeMat = new THREE.MeshBasicMaterial({
        color: PALETTE.projectile,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      this.chargeRing = new THREE.Mesh(
        geometry('charge', () => new THREE.RingGeometry(0.82, 1.0, 24)),
        this.chargeMat
      );
      this.chargeRing.rotation.x = -Math.PI / 2;
      this.chargeRing.position.y = 0.07;
      this.group.add(this.chargeRing);
    }

    this.parent.add(this.group);
  }

  /* ---------------------------------------------------------------- *
   * Derived
   * ---------------------------------------------------------------- */

  get speed() {
    return Math.hypot(this.vx, this.vz);
  }

  get isThreat() {
    return this.alive && this.state === ENEMY_STATE.ACTIVE;
  }

  /** Knocked bodies above the carom threshold are lethal to their own side. */
  get isLethalProjectile() {
    return this.alive && this.state === ENEMY_STATE.KNOCKED && this.speed >= PHYSICS.caromMinSpeed;
  }

  /* ---------------------------------------------------------------- *
   * Combat
   * ---------------------------------------------------------------- */

  /**
   * Classify an incoming hit against this enemy's facing.
   * @returns {{ shielded: boolean, backstab: boolean, dot: number }}
   */
  classifyHit(fromX, fromZ, options = {}) {
    if (this.type !== 'heavy') {
      const dx = fromX - this.x;
      const dz = fromZ - this.z;
      const len = Math.hypot(dx, dz) || 1;
      const dot = (dx / len) * this.facingX + (dz / len) * this.facingZ;
      return { shielded: false, backstab: dot < PHYSICS.backstabDot, dot };
    }
    const dx = fromX - this.x;
    const dz = fromZ - this.z;
    const len = Math.hypot(dx, dz) || 1;
    const dot = (dx / len) * this.facingX + (dz / len) * this.facingZ;
    const banked = Boolean(options.banked) && this.config.bankBreaksShield;
    return {
      shielded: dot > 0 && !banked,
      backstab: dot < PHYSICS.backstabDot,
      dot
    };
  }

  /**
   * @param {number} amount pre-mitigation damage
   * @param {object} [opts] { fromX, fromZ, banked, source }
   * @returns {{ dealt: number, killed: boolean, shielded: boolean, backstab: boolean }}
   */
  takeDamage(amount, opts = {}) {
    if (!this.alive || this.state === ENEMY_STATE.SPAWNING) {
      return { dealt: 0, killed: false, shielded: false, backstab: false };
    }
    let info = { shielded: false, backstab: false, dot: 0 };
    if (opts.fromX !== undefined && opts.fromZ !== undefined) {
      info = this.classifyHit(opts.fromX, opts.fromZ, opts);
    }

    let dealt = amount;
    if (info.shielded) dealt *= this.config.shieldMitigation ?? 1;
    if (info.backstab) {
      // Boons (Shatter Crit) stack additively on top of the archetype's own
      // backstab multiplier, so precision keeps scaling all run.
      dealt *= (this.config.backstabMultiplier ?? 1) + (opts.backstabBonus ?? 0);
    }
    dealt = Math.max(0, dealt);

    this.hp -= dealt;
    this.flashTimer = 0.09;

    const killed = this.hp <= 0;
    if (killed) {
      this.hp = 0;
      this.state = ENEMY_STATE.DEAD;
      this.alive = false;
    }
    return { dealt, killed, shielded: info.shielded, backstab: info.backstab };
  }

  /** Turn this body into a lethal object ball. */
  applyKnock(vx, vz) {
    this.vx = vx;
    this.vz = vz;
    this.state = ENEMY_STATE.KNOCKED;
    this.drag = PHYSICS.knockedDrag;
    this.knockTimer = 0.12;
  }

  /* ---------------------------------------------------------------- *
   * Frame update — AI only; motion is integrated by PhysicsSystem
   * ---------------------------------------------------------------- */

  update(dt, game) {
    if (!this.alive) return;
    const player = game.player;

    if (this.flashTimer > 0) this.flashTimer -= dt;
    if (this.fireFlash > 0) this.fireFlash -= dt;
    if (this.caromCooldown > 0) this.caromCooldown -= dt;
    if (this.knockTimer > 0) this.knockTimer -= dt;

    // Face the player (used for shields, backstabs and shot aiming).
    const tx = player.x - this.x;
    const tz = player.z - this.z;
    const dist = Math.hypot(tx, tz) || 1;
    const dirX = tx / dist;
    const dirZ = tz / dist;

    switch (this.state) {
      case ENEMY_STATE.SPAWNING:
        this.spawnTimer -= dt;
        this.facingX = dirX;
        this.facingZ = dirZ;
        if (this.spawnTimer <= 0) {
          this.state = ENEMY_STATE.ACTIVE;
          this.drag = PHYSICS.enemyDrag;
        }
        break;

      case ENEMY_STATE.KNOCKED:
        // Once it settles it stops being lethal and rejoins the fight.
        if (this.speed < PHYSICS.knockedSettleSpeed && this.knockTimer <= 0) {
          this.state = ENEMY_STATE.ACTIVE;
          this.drag = PHYSICS.enemyDrag;
        }
        break;

      case ENEMY_STATE.ACTIVE:
        // A frozen enemy still collides, still gets knocked, still dies — it
        // just does not drive. The tutorial racks its targets in exact spots
        // and a lesson that walks away from its own diagram teaches nothing.
        //
        // It does still shoot, though. Being pinned in place is a staging
        // decision; whether the thing is dangerous is a separate question, and
        // a lesson about reading a shooter needs one that actually shoots.
        if (this.frozen) this._holdFire(dt, game, dirX, dirZ);
        else this._steer(dt, game, dirX, dirZ, dist);
        break;

      default:
        break;
    }

    this._updateMesh(dt, dist);
  }

  _steer(dt, game, dirX, dirZ, dist) {
    const cfg = this.config;
    const accel = cfg.accel;

    if (this.type === 'solid') {
      // Steady pursuit with a light sideways wobble so lines are not identical.
      const wobble = Math.sin(game.engine.elapsed * 2.2 + this.x) * 0.25;
      const desiredX = (dirX - dirZ * wobble) * cfg.speed;
      const desiredZ = (dirZ + dirX * wobble) * cfg.speed;
      this.vx += (desiredX - this.vx) * Math.min(accel * dt, 1);
      this.vz += (desiredZ - this.vz) * Math.min(accel * dt, 1);
      this.facingX = dirX;
      this.facingZ = dirZ;
      return;
    }

    if (this.type === 'stripe') {
      this.facingX = dirX;
      this.facingZ = dirZ;

      // Hold the preferred stand-off band, strafing while in it.
      let moveX = 0;
      let moveZ = 0;
      if (dist < cfg.preferredRange - cfg.rangeTolerance) {
        moveX = -dirX;
        moveZ = -dirZ;
      } else if (dist > cfg.preferredRange + cfg.rangeTolerance) {
        moveX = dirX;
        moveZ = dirZ;
      } else {
        moveX = -dirZ * this.strafeSign;
        moveZ = dirX * this.strafeSign;
      }
      // Flip strafe direction near the rails so they do not grind the cushions.
      if (Math.abs(this.x) > ARENA.halfW - 2 || Math.abs(this.z) > ARENA.halfH - 2) {
        this.strafeSign *= -1;
      }
      const desiredX = moveX * cfg.speed;
      const desiredZ = moveZ * cfg.speed;
      this.vx += (desiredX - this.vx) * Math.min(accel * dt, 1);
      this.vz += (desiredZ - this.vz) * Math.min(accel * dt, 1);

      // Charge → fire.
      if (this.charging) {
        // Plant to shoot. Strafing through your own wind-up means the body
        // slides sideways while the shot leaves along a different line, so
        // nothing about the moment reads as one action.
        this.vx *= 0.82;
        this.vz *= 0.82;
        this.chargeTimer -= dt;
        if (this.chargeTimer <= 0) {
          this.charging = false;
          this.shotTimer = cfg.shotInterval;
          // Fire along the bearing the wind-up was drawn on, not the one the
          // player happens to be at on the release frame.
          this._fire(game, this.aimX, this.aimZ);
        }
      } else {
        this.shotTimer -= dt;
        if (this.shotTimer <= 0) this._beginCharge(game, dirX, dirZ);
      }
      return;
    }

    // Heavy: slow advance, turning at a limited rate so flanking is possible.
    const desiredX = dirX * cfg.speed;
    const desiredZ = dirZ * cfg.speed;
    this.vx += (desiredX - this.vx) * Math.min(accel * dt, 1);
    this.vz += (desiredZ - this.vz) * Math.min(accel * dt, 1);

    const current = Math.atan2(this.facingX, this.facingZ);
    const target = Math.atan2(dirX, dirZ);
    let delta = target - current;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    const step = Math.max(-cfg.turnRate * dt, Math.min(cfg.turnRate * dt, delta));
    const angle = current + step;
    this.facingX = Math.sin(angle);
    this.facingZ = Math.cos(angle);
  }

  /**
   * A pinned shooter: track and fire, never move. Everything a stripe does
   * except walking, so a staged encounter behaves exactly like a live one.
   */
  _holdFire(dt, game, dirX, dirZ) {
    const cfg = this.config;
    if (!cfg.shotInterval) return;
    this.facingX = dirX;
    this.facingZ = dirZ;

    if (this.charging) {
      this.chargeTimer -= dt;
      if (this.chargeTimer <= 0) {
        this.charging = false;
        this.shotTimer = cfg.shotInterval;
        this._fire(game, this.aimX, this.aimZ);
      }
      return;
    }
    this.shotTimer -= dt;
    if (this.shotTimer <= 0) this._beginCharge(game, dirX, dirZ);
  }

  /** Commit to a shot: lock the line now, and let the wind-up show it. */
  _beginCharge(game, dirX, dirZ) {
    if (this.disarmed) {
      this.shotTimer = this.config.shotInterval;
      return;
    }
    this.charging = true;
    this.chargeTimer = this.config.chargeTime;
    this.aimX = dirX;
    this.aimZ = dirZ;
    game.audio?.enemyCharge?.();
  }

  /** World-space tip of the barrel along a given bearing. */
  muzzlePoint(dirX = this.facingX, dirZ = this.facingZ) {
    const reach = GUN_LENGTH + this.config.shotRadius * 0.5;
    return { x: this.x + dirX * reach, z: this.z + dirZ * reach };
  }

  _fire(game, dirX, dirZ) {
    const cfg = this.config;
    const tip = this.muzzlePoint(dirX, dirZ);

    // Never fire a bullet into the inside of a wall. The muzzle can end up
    // buried when a shooter is standing against geometry, and a shot that dies
    // on its first substep looks exactly like a shot that never happened.
    if (game.physics?.pointBlocked?.(tip.x, tip.z, cfg.shotRadius)) {
      this.shotTimer = cfg.shotInterval * 0.35;
      this.fireFlash = 0;
      return;
    }

    const projectile = new Projectile(
      this.parent,
      tip.x,
      tip.z,
      dirX * cfg.shotSpeed,
      dirZ * cfg.shotSpeed,
      cfg.shotDamage,
      cfg.shotRadius,
      cfg.shotLife
    );
    game.projectiles.push(projectile);

    // Recoil: the body is shoved back down its own barrel. Small, but it is
    // what makes the bullet look expelled rather than dropped. A pinned shooter
    // keeps the barrel kick and skips the shove — three shots' worth of recoil
    // walked a "stationary" enemy four units off the mark it was staged on.
    if (!this.frozen) {
      this.vx -= dirX * ENEMY_FIRE.recoil;
      this.vz -= dirZ * ENEMY_FIRE.recoil;
    }
    this.fireFlash = ENEMY_FIRE.flashTime;

    game.audio?.enemyShot();
    // The bullet had a death effect and an impact effect but no birth effect,
    // so the loudest thing at the enemy was the charge ring *switching off*.
    game.on?.enemyFired?.({ enemy: this, x: tip.x, z: tip.z, dirX, dirZ });
  }

  _updateMesh(dt, distToPlayer) {
    this.group.position.set(this.x, 0, this.z);
    this.group.rotation.y = Math.atan2(this.facingX, this.facingZ);

    const knocked = this.state === ENEMY_STATE.KNOCKED;
    const spawning = this.state === ENEMY_STATE.SPAWNING;

    // Emissive: white-hot while knocked, flash on damage, dim while spawning.
    let intensity = 0.55;
    if (knocked) intensity = 1.1 + Math.min(this.speed / 30, 1) * 1.6;
    if (this.flashTimer > 0) intensity = 3.4;
    if (spawning) intensity = 0.2;
    this.material.emissiveIntensity = intensity;
    this.material.color.copy(this.baseColor);
    if (knocked) this.material.color.lerp(new THREE.Color(0xffffff), 0.45);
    this.material.transparent = spawning;
    this.material.opacity = spawning ? 0.3 : 1;

    // Velocity-aligned squash while knocked.
    if (knocked && this.speed > 1) {
      const stretch = 1 + Math.min(this.speed / 40, 1) * 0.5;
      const squash = 1 / Math.sqrt(stretch);
      this.body.scale.set(squash, squash, squash);
      this.group.rotation.y = Math.atan2(this.vx, this.vz);
      this.body.scale.z = stretch * squash;
    } else if (this.type === 'solid') {
      // Idle bob keeps chasers alive-looking without animation data.
      const t = performance.now() / 1000;
      this.body.rotation.y += dt * 1.4;
      this.body.position.y = this.radius * 0.85 + Math.sin(t * 3 + this.x) * 0.06;
      this.body.scale.setScalar(1);
    } else {
      this.body.scale.setScalar(1);
    }

    // Spawn telegraph collapses inward.
    if (spawning) {
      const p = 1 - this.spawnTimer / ROOM.spawnTelegraph;
      this.telegraph.visible = true;
      this.telegraph.scale.setScalar((2.6 - p * 1.4) * this.radius);
      this.telegraphMat.opacity = 0.15 + p * 0.7;
    } else if (this.telegraph.visible) {
      this.telegraph.visible = false;
    }

    if (this.chargeRing) {
      if (this.charging) {
        const p = 1 - this.chargeTimer / this.config.chargeTime;
        this.chargeRing.visible = true;
        this.chargeRing.scale.setScalar((2.4 - p * 1.3) * this.radius);
        this.chargeMat.opacity = 0.25 + p * 0.7;
      } else {
        this.chargeRing.visible = false;
      }
    }

    if (this.gun) this._updateGun(dt);

    if (this.shieldMat) {
      // Brighten the shield when the player is actually in front of it.
      this.shieldMat.opacity = 0.55 + (distToPlayer < 12 ? 0.35 : 0.1);
    }

    // --- threat tell --------------------------------------------------
    // The hardest thing to read on the table was which bodies can actually
    // hurt you, so the ground ring answers exactly that and nothing else:
    //
    //   ACTIVE    hot red ring   — touching this costs you HP
    //   KNOCKED   gold ring      — ammunition now: harmless to you, lethal
    //                              to its own side
    //   SPAWNING  barely there   — no collision at all yet
    if (this.state === ENEMY_STATE.ACTIVE) {
      // A slow pulse separates "dangerous" from "inert" in peripheral vision,
      // which is where these usually are while you line a shot up.
      const pulse = 0.42 + Math.sin(performance.now() / 300 + this.x) * 0.1;
      this.markerMat.color.setHex(PALETTE.hazard);
      this.markerMat.opacity = pulse;
      this.marker.scale.setScalar(1);
    } else if (knocked) {
      this.markerMat.color.setHex(PALETTE.carom);
      this.markerMat.opacity = 0.6;
      this.marker.scale.setScalar(1.18);
    } else {
      this.markerMat.color.copy(this.baseColor);
      this.markerMat.opacity = 0.08;
      this.marker.scale.setScalar(1);
    }
  }

  /**
   * The wind-up, told with the gun.
   *
   * Idle it sits low and dim. Charging, it levels off and the muzzle lights,
   * so the tell points *somewhere* — the old concentric ring carried no aim
   * information at all, which is the one thing you need from a wind-up. On the
   * shot it kicks back and the muzzle blows out white, and critically the
   * flash is brighter than the peak of the charge: the enemy used to get
   * dimmer on the exact frame it fired.
   */
  _updateGun(dt) {
    const cfg = this.config;
    const firing = this.fireFlash > 0 ? this.fireFlash / ENEMY_FIRE.flashTime : 0;
    const charge = this.charging ? 1 - this.chargeTimer / cfg.chargeTime : 0;

    // While charging the gun points where the shot will actually go, so the
    // barrel and the bullet cannot disagree.
    if (this.charging || firing > 0) {
      const angle = Math.atan2(this.aimX, this.aimZ);
      this.gun.rotation.y = angle - this.group.rotation.y;
    } else {
      this.gun.rotation.y = 0;
    }

    // The camera looks straight down, so raising a barrel is nearly invisible —
    // it only foreshortens. Extending it is what reads from above: the gun
    // telescopes out of the body as the shot builds and is at full reach on the
    // frame it fires, which is also the frame the muzzle point is measured at.
    // Idle it is a short dark nub — just enough to show which way the thing is
    // pointing. The wind-up runs it out to four times that protrusion and
    // lights it, so "it is about to shoot" is a change in the silhouette and
    // not only a change in colour.
    const extend = Math.max(charge, firing);
    this.gun.scale.z = (0.55 + 0.45 * extend) * GUN_LENGTH;
    // A little tilt is kept purely so the barrel catches the light and reads as
    // a solid object rather than a flat stripe.
    this.gun.rotation.x = -0.16 * (1 - extend);
    this.gun.position.z = -ENEMY_FIRE.kick * firing;
    this.gun.position.y = cfg.radius * (1.8 + charge * 0.12);

    this.gunMat.emissiveIntensity = 0.18 + charge * 2.2 + firing * 4.0;

    const flare = 0.5 + charge * 0.9 + firing * 2.4;
    this.muzzle.scale.setScalar(flare);
    this.muzzleMat.opacity = Math.min(1, 0.04 + charge * 0.8 + firing * 0.96);
  }

  dispose() {
    this.parent.remove(this.group);
    this.material.dispose();
    this.markerMat.dispose();
    this.marker.geometry.dispose();
    this.telegraphMat.dispose();
    if (this.shieldMat) this.shieldMat.dispose();
    if (this.chargeMat) this.chargeMat.dispose();
  }
}

/* ------------------------------------------------------------------ *
 * Projectile — Stripe shots
 * ------------------------------------------------------------------ */

export class Projectile {
  constructor(parent, x, z, vx, vz, damage, radius, life) {
    this.parent = parent;
    this.x = x;
    this.z = z;
    this.vx = vx;
    this.vz = vz;
    this.damage = damage;
    this.radius = radius;
    this.life = life;
    this.alive = true;
    this.drag = 0;
    /** Held at the muzzle for one frame so the shot is seen to leave the gun. */
    this.spawnFrame = true;

    this.material = new THREE.MeshBasicMaterial({ color: PALETTE.projectile });
    this.mesh = new THREE.Mesh(
      geometry('projectile', () => new THREE.SphereGeometry(1, 10, 8)),
      this.material
    );
    this.mesh.scale.setScalar(radius);
    this.mesh.position.set(x, radius + 0.2, z);

    this.haloMat = new THREE.MeshBasicMaterial({
      color: PALETTE.projectile,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.halo = new THREE.Mesh(new THREE.CircleGeometry(radius * 2.4, 14), this.haloMat);
    this.halo.rotation.x = -Math.PI / 2;
    this.halo.position.set(x, 0.05, z);

    parent.add(this.mesh);
    parent.add(this.halo);
  }

  update(dt) {
    this.life -= dt;
    if (this.life <= 0) this.alive = false;
    this.mesh.position.set(this.x, this.radius + 0.2, this.z);
    this.halo.position.set(this.x, 0.05, this.z);
    this.haloMat.opacity = 0.25 + Math.min(this.life, 0.4);
  }

  dispose() {
    this.parent.remove(this.mesh);
    this.parent.remove(this.halo);
    this.material.dispose();
    this.halo.geometry.dispose();
    this.haloMat.dispose();
  }
}

/** Convenience factory used by the room director. */
export function createEnemy(parent, type, x, z, level) {
  return new Enemy(parent, type, x, z, level);
}

export default Enemy;
