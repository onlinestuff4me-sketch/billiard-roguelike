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
        this._steer(dt, game, dirX, dirZ, dist);
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
        this.chargeTimer -= dt;
        if (this.chargeTimer <= 0) {
          this.charging = false;
          this.shotTimer = cfg.shotInterval;
          this._fire(game, dirX, dirZ);
        }
      } else {
        this.shotTimer -= dt;
        if (this.shotTimer <= 0) {
          this.charging = true;
          this.chargeTimer = cfg.chargeTime;
        }
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

  _fire(game, dirX, dirZ) {
    const cfg = this.config;
    const spawnDist = this.radius + cfg.shotRadius + 0.1;
    const projectile = new Projectile(
      this.parent,
      this.x + dirX * spawnDist,
      this.z + dirZ * spawnDist,
      dirX * cfg.shotSpeed,
      dirZ * cfg.shotSpeed,
      cfg.shotDamage,
      cfg.shotRadius,
      cfg.shotLife
    );
    game.projectiles.push(projectile);
    game.audio?.enemyShot();
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

    if (this.shieldMat) {
      // Brighten the shield when the player is actually in front of it.
      this.shieldMat.opacity = 0.55 + (distToPlayer < 12 ? 0.35 : 0.1);
    }

    this.markerMat.opacity = spawning ? 0.08 : 0.28;
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
