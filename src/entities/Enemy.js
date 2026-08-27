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
import { ENEMY, PHYSICS, PALETTE, ROOM, ARENA, RULES } from '../config.js';

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
 * Ball numbers
 *
 * Every ball on the table carries a number, because the contract talks about
 * them by name ("the 8 last") and because the number IS the ball's value. The
 * digit rides as a camera-facing sprite rather than being baked into the
 * silhouette, so shape still means behaviour and the number means worth —
 * two channels, never one doing both jobs.
 * ------------------------------------------------------------------ */

const NUMBER_TEXTURES = new Map();

let STRIPE_TEXTURE = null;

/** The stripe band, circle-clipped so it never overhangs the ball. */
function stripeTexture() {
  if (STRIPE_TEXTURE) return STRIPE_TEXTURE;
  const size = 128;
  const c = size / 2;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.arc(c, c, c * 0.98, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = `#${PALETTE.stripe.toString(16).padStart(6, '0')}`;
  ctx.fillRect(0, c - size * 0.29, size, size * 0.58);
  STRIPE_TEXTURE = new THREE.CanvasTexture(canvas);
  STRIPE_TEXTURE.anisotropy = 4;
  return STRIPE_TEXTURE;
}

/**
 * The digit sits on a disc of the BALL'S OWN COLOUR, not on a bone one.
 *
 * A light disc was the obvious choice and the wrong one: bloom is thresholded
 * at 0.34, so a near-white puck haloed harder than anything else on the table
 * and every ball turned into a glowing blob with a number lost inside it. A
 * disc that matches the body adds no luminance at all, and a near-black digit
 * on it reads at 60px on a phone.
 */
function numberTexture(number, hex) {
  const key = `${number}:${hex}`;
  if (NUMBER_TEXTURES.has(key)) return NUMBER_TEXTURES.get(key);
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  // An outlined numeral, no disc behind it. A light puck haloed harder than
  // anything else under a 0.34 bloom threshold; a puck in the ball's colour
  // just read as a hole. A heavy near-black stroke filled bone survives both,
  // against amber, violet-on-bone and black alike.
  ctx.font = `700 ${size * 0.7}px Rajdhani, "Segoe UI", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.15;
  ctx.strokeStyle = 'rgba(5, 7, 10, 0.96)';
  ctx.strokeText(String(number), size / 2, size / 2 + size * 0.02);
  ctx.fillStyle = hex;
  ctx.fillText(String(number), size / 2, size / 2 + size * 0.02);
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  NUMBER_TEXTURES.set(key, texture);
  return texture;
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
     * The ball's number, and therefore its worth. Zero until a rack assigns
     * one — an unnumbered body is a legacy enemy and pays nothing.
     */
    this.number = 0;
    this.value = 0;
    this.numberSprite = null;
    /**
     * Set by scripted (tutorial) rooms: hold position instead of steering.
     * Holding still is not the same as being harmless — a frozen shooter still
     * tracks, winds up and fires, it just does not walk. `disarmed` is the flag
     * that actually silences a weapon.
     */
    this.frozen = false;
    this.disarmed = false;
    /**
     * Cannot be damaged. Used by lessons whose target has to survive being hit
     * — you cannot knock a ball into a goal if the knock destroys it.
     */
    this.invulnerable = false;
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
    // THE RACK IS ITS OWN CHANNEL.
    //
    // Solids are amber, stripes are a bone body with a violet band, the 8 is
    // black. None of them is red or mint, because a ball is neither good nor
    // bad — those two hues belong to the felt objects, and red can only mean
    // danger if nothing else on the table is wearing it.
    if (this.type === 'solid') {
      bodyGeo = geometry('solid', () => new THREE.SphereGeometry(cfg.radius, 20, 14));
      color = PALETTE.solid;
    } else if (this.type === 'stripe') {
      bodyGeo = geometry('stripe', () => new THREE.SphereGeometry(cfg.radius, 20, 14));
      color = PALETTE.stripeBody;
    } else {
      bodyGeo = geometry('heavy', () => new THREE.SphereGeometry(cfg.radius, 20, 14));
      color = PALETTE.eight;
    }

    this.baseColor = new THREE.Color(color);
    // The heavy is nearly four times the area of a solid, so the same emissive
    // intensity puts four times as much light through the bloom pass and the
    // whole body whites out — taking the number with it. Under the old rules
    // that was merely bright; now the 8 is the ball the contract names, and an
    // unreadable 8 makes "the 8 last" unplayable.
    // The 8 is a dark ball and stays dark: it reads by contrast against the
    // felt, not by glow. Stripes are bone-bodied and would white out at the
    // same intensity a solid needs.
    const emissive = this.type === 'heavy' ? 0.05 : this.type === 'stripe' ? 0.16 : 0.45;
    this.material = new THREE.MeshStandardMaterial({
      color,
      emissive: new THREE.Color(color),
      emissiveIntensity: emissive,
      roughness: 0.4,
      metalness: 0.2
    });
    this.body = new THREE.Mesh(bodyGeo, this.material);
    this.body.position.y = cfg.radius * 0.85;
    this.group.add(this.body);

    // A real stripe: a coloured band across a bone ball, so the word names
    // something you can see rather than something you were told.
    //
    // It has to be a DECAL, not a band of geometry. The camera looks straight
    // down, and an equatorial ring around a sphere is edge-on from up there —
    // invisible. A flat texture on the ball's top face is the only version
    // that reads from the angle the game is actually played at.
    if (this.type === 'stripe') {
      const band = new THREE.Mesh(
        new THREE.PlaneGeometry(cfg.radius * 2, cfg.radius * 2),
        new THREE.MeshBasicMaterial({
          map: stripeTexture(),
          transparent: true,
          depthWrite: false
        })
      );
      band.rotation.x = -Math.PI / 2;
      band.position.y = cfg.radius * 1.74;
      this.group.add(band);
      this.bandMesh = band;
    }

    // The 8 keeps a thin bone rim so a dark ball still has an edge on dark felt.
    if (this.type === 'heavy') {
      const rim = new THREE.Mesh(
        new THREE.RingGeometry(cfg.radius * 0.86, cfg.radius, 24),
        new THREE.MeshBasicMaterial({
          color: PALETTE.bone,
          transparent: true,
          opacity: 0.5,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide
        })
      );
      rim.rotation.x = -Math.PI / 2;
      rim.position.y = cfg.radius * 1.7;
      this.group.add(rim);
    }

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
    //
    // THE SHIELD IS GONE ON A STATIC TABLE.
    //
    // It existed to mitigate damage, and damage no longer decides whether a
    // ball leaves the table — a pocket does. Keeping a near-white band that
    // means nothing would be worse than cosmetic: it is the brightest thing in
    // the scene, and it was drowning the one number the contract names.
    if (!RULES.staticTable && this.type === 'heavy') {
      const shieldGeo = geometry(
        'shield',
        () => new THREE.TorusGeometry(cfg.radius * 1.2, 0.11, 8, 26, Math.PI)
      );
      this.shieldMat = new THREE.MeshBasicMaterial({
        color: PALETTE.bone,
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
        emissive: new THREE.Color(PALETTE.bad),
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
        color: PALETTE.bad,
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
        color: PALETTE.bad,
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

  /**
   * Give this ball its number. The sprite is added once and follows the body,
   * so re-numbering (a re-rack, a re-spot) is cheap.
   */
  setNumber(number) {
    this.number = number;
    this.value = number * 100;
    // Deliberately wider than the body: at this camera scale a numeral
    // confined to the silhouette is about ten pixels tall on a phone.
    const scale = Math.max(1.15, this.radius * 2.5);
    // Bone on everything except the bone-bodied stripes, which take the band's violet.
    const ink = this.type === 'stripe' ? PALETTE.stripe : PALETTE.bone;
    const hex = `#${ink.toString(16).padStart(6, '0')}`;
    if (!this.numberSprite) {
      this.numberSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: numberTexture(number, hex),
          transparent: true,
          depthWrite: false
        })
      );
      this.group.add(this.numberSprite);
    } else {
      this.numberSprite.material.map = numberTexture(number, hex);
      this.numberSprite.material.needsUpdate = true;
    }
    this.numberSprite.scale.set(scale, scale, scale);
    this.numberSprite.position.set(0, this.radius * 2.1, 0);
    return this;
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
        // ON A STATIC TABLE A BALL DOES NOTHING ON ITS OWN.
        //
        // No pursuit, no range-keeping, no wind-up, no shot. It sits where the
        // last stroke left it until the next one moves it. This is the single
        // switch the whole "nothing moves between shots" promise hangs on, so
        // it is checked here rather than being spread across three behaviours
        // that each have to remember to opt out.
        if (RULES.staticTable) break;
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
      this.markerMat.color.setHex(PALETTE.bad);
      this.markerMat.opacity = pulse;
      this.marker.scale.setScalar(1);
    } else if (knocked) {
      this.markerMat.color.setHex(PALETTE.bone);
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

    this.material = new THREE.MeshBasicMaterial({ color: PALETTE.bad });
    this.mesh = new THREE.Mesh(
      geometry('projectile', () => new THREE.SphereGeometry(1, 10, 8)),
      this.material
    );
    this.mesh.scale.setScalar(radius);
    this.mesh.position.set(x, radius + 0.2, z);

    this.haloMat = new THREE.MeshBasicMaterial({
      color: PALETTE.bad,
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
