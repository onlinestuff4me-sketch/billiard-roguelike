/**
 * Player.js — the cue ball.
 *
 * Owns: the state machine (IDLE / AIMING / LAUNCHED / DASHING), the Focus gauge,
 * invulnerability frames, the motion ribbon, and the three-layer aim preview.
 *
 * It deliberately knows nothing about enemies or boons: systems read its public
 * fields (`x, z, vx, vz, radius, mass, drag, state`) and mutate them. The `stats`
 * block is the single seam through which BoonSystem raises its ceilings.
 */

import * as THREE from 'three';
import { PLAYER, PHYSICS, FOCUS, PALETTE, TRAJECTORY, ARENA } from '../config.js';

export const PLAYER_STATE = {
  IDLE: 'idle',
  AIMING: 'aiming',
  LAUNCHED: 'launched',
  DASHING: 'dashing',
  DEAD: 'dead'
};

/* ------------------------------------------------------------------ *
 * Motion ribbon — an indexed quad strip rebuilt every frame.
 * Additive blending + per-vertex colour means fading the tail to black
 * fades it to invisible, which is both cheaper and prettier than alpha.
 * ------------------------------------------------------------------ */

class TrailRibbon {
  constructor(maxPoints, width, color) {
    this.max = maxPoints;
    this.width = width;
    this.color = new THREE.Color(color);
    this.points = [];

    const vertexCount = maxPoints * 2;
    this.positions = new Float32Array(vertexCount * 3);
    this.colors = new Float32Array(vertexCount * 3);

    const indices = new Uint16Array((maxPoints - 1) * 6);
    for (let i = 0; i < maxPoints - 1; i++) {
      const o = i * 6;
      const v = i * 2;
      indices[o] = v;
      indices[o + 1] = v + 1;
      indices[o + 2] = v + 2;
      indices[o + 3] = v + 1;
      indices[o + 4] = v + 3;
      indices[o + 5] = v + 2;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    this.geometry.setDrawRange(0, 0);

    this.material = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 2;
  }

  clear() {
    this.points.length = 0;
    this.geometry.setDrawRange(0, 0);
  }

  push(x, z, intensity) {
    const last = this.points[this.points.length - 1];
    if (last && Math.hypot(last.x - x, last.z - z) < 0.06) {
      last.intensity = Math.max(last.intensity, intensity);
      return;
    }
    this.points.push({ x, z, intensity });
    if (this.points.length > this.max) this.points.shift();
  }

  /** Fade the tail out over time even when the player is standing still. */
  decay(dt) {
    for (let i = 0; i < this.points.length; i++) {
      this.points[i].intensity *= Math.exp(-3.2 * dt);
    }
    while (this.points.length > 1 && this.points[0].intensity < 0.02) {
      this.points.shift();
    }
  }

  rebuild(y = 0.16) {
    const n = this.points.length;
    if (n < 2) {
      this.geometry.setDrawRange(0, 0);
      return;
    }
    const pos = this.positions;
    const col = this.colors;

    for (let i = 0; i < n; i++) {
      const p = this.points[i];
      const prev = this.points[Math.max(i - 1, 0)];
      const next = this.points[Math.min(i + 1, n - 1)];
      let tx = next.x - prev.x;
      let tz = next.z - prev.z;
      const len = Math.hypot(tx, tz);
      if (len < 1e-5) {
        tx = 0;
        tz = 1;
      } else {
        tx /= len;
        tz /= len;
      }
      // Perpendicular in the XZ plane.
      const nx = -tz;
      const nz = tx;

      const taper = (i / (n - 1)) ** 0.7;
      const halfWidth = this.width * 0.5 * taper * (0.45 + 0.55 * p.intensity);
      const o = i * 6;
      pos[o] = p.x + nx * halfWidth;
      pos[o + 1] = y;
      pos[o + 2] = p.z + nz * halfWidth;
      pos[o + 3] = p.x - nx * halfWidth;
      pos[o + 4] = y;
      pos[o + 5] = p.z - nz * halfWidth;

      const glow = taper * p.intensity;
      col[o] = this.color.r * glow;
      col[o + 1] = this.color.g * glow;
      col[o + 2] = this.color.b * glow;
      col[o + 3] = col[o];
      col[o + 4] = col[o + 1];
      col[o + 5] = col[o + 2];
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.setDrawRange(0, (n - 1) * 6);
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}

/* ------------------------------------------------------------------ *
 * Aim preview — three layers, exactly as specified in the GDD:
 *   1. primary cue path (solid, bright)
 *   2. predicted rail reflections (ghosted dots)
 *   3. carom deflection cone off the first body struck
 * ------------------------------------------------------------------ */

const MAX_DASH_VERTS = 900;

class AimRenderer {
  constructor() {
    this.group = new THREE.Group();
    this.group.visible = false;
    this.group.renderOrder = 3;

    // 1. Primary path.
    this.primaryPositions = new Float32Array(6);
    this.primaryGeo = new THREE.BufferGeometry();
    this.primaryGeo.setAttribute('position', new THREE.BufferAttribute(this.primaryPositions, 3));
    this.primaryMat = new THREE.LineBasicMaterial({
      color: PALETTE.aim,
      transparent: true,
      opacity: 0.95,
      depthWrite: false
    });
    this.primary = new THREE.Line(this.primaryGeo, this.primaryMat);
    this.primary.frustumCulled = false;
    this.group.add(this.primary);

    // 2. Ghosted reflections (manual dashes for consistent world-space spacing).
    this.dashPositions = new Float32Array(MAX_DASH_VERTS * 3);
    this.dashGeo = new THREE.BufferGeometry();
    this.dashGeo.setAttribute('position', new THREE.BufferAttribute(this.dashPositions, 3));
    this.dashGeo.setDrawRange(0, 0);
    this.dashMat = new THREE.LineBasicMaterial({
      color: PALETTE.aimGhost,
      transparent: true,
      opacity: 0.7,
      depthWrite: false
    });
    this.dashes = new THREE.LineSegments(this.dashGeo, this.dashMat);
    this.dashes.frustumCulled = false;
    this.group.add(this.dashes);

    // 3. Carom deflection cone.
    this.conePositions = new Float32Array(18);
    this.coneGeo = new THREE.BufferGeometry();
    this.coneGeo.setAttribute('position', new THREE.BufferAttribute(this.conePositions, 3));
    this.coneGeo.setDrawRange(0, 0);
    this.coneMat = new THREE.LineBasicMaterial({
      color: PALETTE.carom,
      transparent: true,
      opacity: 0.9,
      depthWrite: false
    });
    this.cone = new THREE.LineSegments(this.coneGeo, this.coneMat);
    this.cone.frustumCulled = false;
    this.group.add(this.cone);

    // 4. Cue-ball tangent line — the 90° rule.
    //    On a cut, the striking ball leaves perpendicular to the object ball's
    //    departure. Drawing it is what turns "why did I end up there?" into a
    //    decision you make before releasing, and it is the single most useful
    //    aid real pool players train with.
    this.tangentPositions = new Float32Array(6);
    this.tangentGeo = new THREE.BufferGeometry();
    this.tangentGeo.setAttribute('position', new THREE.BufferAttribute(this.tangentPositions, 3));
    this.tangentGeo.setDrawRange(0, 0);
    this.tangentMat = new THREE.LineBasicMaterial({
      color: PALETTE.player,
      transparent: true,
      opacity: 0.75,
      depthWrite: false
    });
    this.tangent = new THREE.LineSegments(this.tangentGeo, this.tangentMat);
    this.tangent.frustumCulled = false;
    this.group.add(this.tangent);

    // Ghost ball — a full outline of the cue ball at its contact position.
    // Aiming at a whole shape reads faster than aiming at an abstract point,
    // which is why the ghost-ball method is what beginners are taught first.
    this.markerMat = new THREE.MeshBasicMaterial({
      color: PALETTE.bone,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    this.marker = new THREE.Mesh(
      new THREE.RingGeometry(PLAYER.radius * 0.88, PLAYER.radius, 32),
      this.markerMat
    );
    this.marker.rotation.x = -Math.PI / 2;
    this.marker.visible = false;
    this.group.add(this.marker);

    // Pull band behind the player.
    this.pullPositions = new Float32Array(6);
    this.pullGeo = new THREE.BufferGeometry();
    this.pullGeo.setAttribute('position', new THREE.BufferAttribute(this.pullPositions, 3));
    this.pullMat = new THREE.LineBasicMaterial({
      color: PALETTE.player,
      transparent: true,
      opacity: 0.55,
      depthWrite: false
    });
    this.pull = new THREE.Line(this.pullGeo, this.pullMat);
    this.pull.frustumCulled = false;
    this.group.add(this.pull);

    this.anchorMat = new THREE.MeshBasicMaterial({
      color: PALETTE.player,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.anchor = new THREE.Mesh(new THREE.CircleGeometry(0.22, 16), this.anchorMat);
    this.anchor.rotation.x = -Math.PI / 2;
    this.group.add(this.anchor);
  }

  hide() {
    this.group.visible = false;
  }

  /**
   * @param {object} prediction result of PhysicsSystem.predictTrajectory
   * @param {object} player
   * @param {number} power 0..1
   */
  show(prediction, player, power) {
    this.group.visible = true;
    const y = 0.12;
    const segments = prediction.segments;

    // --- primary path ---
    if (segments.length > 0) {
      const s = segments[0];
      this.primaryPositions.set([s.ax, y, s.az, s.bx, y, s.bz]);
      this.primaryGeo.attributes.position.needsUpdate = true;
      this.primary.visible = true;
      this.primaryMat.opacity = 0.45 + 0.5 * power;
    } else {
      this.primary.visible = false;
    }

    // --- ghosted reflections ---
    let v = 0;
    for (let i = 1; i < segments.length && v < MAX_DASH_VERTS - 2; i++) {
      const s = segments[i];
      const dx = s.bx - s.ax;
      const dz = s.bz - s.az;
      const len = Math.hypot(dx, dz);
      if (len < 1e-4) continue;
      const ux = dx / len;
      const uz = dz / len;
      const stride = TRAJECTORY.dashLength + TRAJECTORY.dashGap;
      for (let d = 0; d < len && v < MAX_DASH_VERTS - 2; d += stride) {
        const e = Math.min(d + TRAJECTORY.dashLength, len);
        this.dashPositions[v * 3] = s.ax + ux * d;
        this.dashPositions[v * 3 + 1] = y;
        this.dashPositions[v * 3 + 2] = s.az + uz * d;
        v++;
        this.dashPositions[v * 3] = s.ax + ux * e;
        this.dashPositions[v * 3 + 1] = y;
        this.dashPositions[v * 3 + 2] = s.az + uz * e;
        v++;
      }
    }
    this.dashGeo.setDrawRange(0, v);
    this.dashGeo.attributes.position.needsUpdate = true;

    // --- object-ball departure + ghost ball + cue tangent ---
    if (prediction.hit && prediction.caromDir) {
      const h = prediction.hit;
      const cd = prediction.caromDir;
      const angle = Math.atan2(cd.z, cd.x);
      const L = TRAJECTORY.caromConeLength;
      const spread = TRAJECTORY.caromConeAngle;
      const ox = h.body ? h.body.x : h.x;
      const oz = h.body ? h.body.z : h.z;
      const lines = [];
      for (const a of [angle - spread, angle, angle + spread]) {
        lines.push(ox, y, oz, ox + Math.cos(a) * L, y, oz + Math.sin(a) * L);
      }
      this.conePositions.set(lines);
      this.coneGeo.setDrawRange(0, 6);
      this.coneGeo.attributes.position.needsUpdate = true;
      this.cone.visible = true;

      // The ghost ball sits where the cue ball's centre stops at contact, which
      // is exactly the point the swept-circle predictor solved for.
      this.marker.visible = true;
      this.marker.position.set(h.x, y, h.z);

      // Tangent = perpendicular to the object ball's line, taking whichever of
      // the two perpendiculars the cue ball is already travelling towards.
      const last = segments[segments.length - 1];
      let inX = last ? last.bx - last.ax : 0;
      let inZ = last ? last.bz - last.az : 0;
      const inLen = Math.hypot(inX, inZ);
      if (inLen > 1e-5) {
        inX /= inLen;
        inZ /= inLen;
        let tx = -cd.z;
        let tz = cd.x;
        if (tx * inX + tz * inZ < 0) {
          tx = -tx;
          tz = -tz;
        }
        const TL = TRAJECTORY.tangentLength;
        this.tangentPositions.set([h.x, y, h.z, h.x + tx * TL, y, h.z + tz * TL]);
        this.tangentGeo.setDrawRange(0, 2);
        this.tangentGeo.attributes.position.needsUpdate = true;
        this.tangent.visible = true;
      } else {
        this.tangent.visible = false;
      }
    } else {
      this.cone.visible = false;
      this.marker.visible = false;
      this.tangent.visible = false;
    }

    // --- pull band ---
    const px = player.x - player.aimPull.x;
    const pz = player.z - player.aimPull.z;
    this.pullPositions.set([player.x, y, player.z, px, y, pz]);
    this.pullGeo.attributes.position.needsUpdate = true;
    this.anchor.position.set(px, y, pz);
    const scale = 0.7 + power * 0.9;
    this.anchor.scale.setScalar(scale);
  }

  dispose() {
    this.primaryGeo.dispose();
    this.primaryMat.dispose();
    this.dashGeo.dispose();
    this.dashMat.dispose();
    this.coneGeo.dispose();
    this.coneMat.dispose();
    this.tangentGeo.dispose();
    this.tangentMat.dispose();
    this.marker.geometry.dispose();
    this.markerMat.dispose();
    this.pullGeo.dispose();
    this.pullMat.dispose();
    this.anchor.geometry.dispose();
    this.anchorMat.dispose();
  }
}

/* ------------------------------------------------------------------ *
 * Player
 * ------------------------------------------------------------------ */

export class Player {
  constructor(scene) {
    this.scene = scene;

    // --- physics body ---
    this.x = 0;
    this.z = ARENA.halfH * 0.55;
    this.vx = 0;
    this.vz = 0;
    this.radius = PLAYER.radius;
    this.mass = 1.6;
    this.drag = PLAYER.dragIdle;

    // --- run state ---
    this.maxHp = PLAYER.maxHp;
    this.hp = PLAYER.maxHp;
    this.focus = FOCUS.max;
    this.alive = true;
    this.state = PLAYER_STATE.IDLE;
    this.bouncesUsed = 0;
    this.launchPower = 0;

    /** Mutable stat block — BoonSystem writes here, everything else reads. */
    this.stats = {
      damageMult: 1,
      maxBounces: PHYSICS.baseMaxBounces,
      focusMax: FOCUS.max,
      pierceRetention: PLAYER.pierceRetention,
      launchSpeedMult: 1,
      focusRegenMult: 1
    };

    // --- timers ---
    this.iFrameTimer = 0;
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.flashTimer = 0;
    this.touchTimer = 0;
    this.pyreTimer = 0;

    // --- aim ---
    this.aimPull = { x: 0, z: 0 };
    this.aimDir = { x: 0, z: -1 };
    this.aimPower = 0;
    this.prediction = null;

    this._buildMesh();
  }

  _buildMesh() {
    this.group = new THREE.Group();

    this.bodyMat = new THREE.MeshStandardMaterial({
      color: PALETTE.player,
      emissive: new THREE.Color(PALETTE.player),
      emissiveIntensity: 0.75,
      roughness: 0.25,
      metalness: 0.15
    });
    this.body = new THREE.Mesh(new THREE.SphereGeometry(PLAYER.radius, 24, 18), this.bodyMat);
    this.body.position.y = PLAYER.radius;
    this.group.add(this.body);

    this.coreMat = new THREE.MeshBasicMaterial({ color: PALETTE.playerCore });
    this.core = new THREE.Mesh(new THREE.SphereGeometry(PLAYER.radius * 0.44, 16, 12), this.coreMat);
    this.core.position.y = PLAYER.radius;
    this.group.add(this.core);

    // Ground halo, doubles as the i-frame tell.
    this.haloMat = new THREE.MeshBasicMaterial({
      color: PALETTE.player,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.halo = new THREE.Mesh(
      new THREE.RingGeometry(PLAYER.radius * 1.05, PLAYER.radius * 1.42, 28),
      this.haloMat
    );
    this.halo.rotation.x = -Math.PI / 2;
    this.halo.position.y = 0.03;
    this.group.add(this.halo);

    this.trail = new TrailRibbon(PLAYER.trailPoints, PLAYER.trailWidth, PALETTE.trail);
    this.aimRenderer = new AimRenderer();

    this.scene.add(this.group);
    this.scene.add(this.trail.mesh);
    this.scene.add(this.aimRenderer.group);
  }

  /* ---------------------------------------------------------------- *
   * Derived values
   * ---------------------------------------------------------------- */

  get speed() {
    return Math.hypot(this.vx, this.vz);
  }

  get maxBounces() {
    return this.stats.maxBounces;
  }

  get invulnerable() {
    if (this.iFrameTimer > 0) return true;
    return this.state === PLAYER_STATE.LAUNCHED && this.speed > PLAYER.settleSpeed;
  }

  get focusMax() {
    return this.stats.focusMax;
  }

  get canAim() {
    return this.alive && this.focus >= FOCUS.minToAim;
  }

  /* ---------------------------------------------------------------- *
   * Aiming / launching
   * ---------------------------------------------------------------- */

  startAim() {
    if (!this.alive) return false;
    if (this.state !== PLAYER_STATE.DASHING) this.state = PLAYER_STATE.AIMING;
    this.aimPower = 0;
    this.aimPull.x = 0;
    this.aimPull.z = 0;
    return this.canAim;
  }

  updateAim(aim) {
    this.aimPull.x = aim.pullX;
    this.aimPull.z = aim.pullZ;
    this.aimDir.x = aim.dirX;
    this.aimDir.z = aim.dirZ;
    this.aimPower = aim.power;
  }

  cancelAim() {
    if (this.state === PLAYER_STATE.AIMING) {
      this.state = this.speed > PLAYER.settleSpeed ? PLAYER_STATE.LAUNCHED : PLAYER_STATE.IDLE;
    }
    this.aimPower = 0;
    this.prediction = null;
    this.aimRenderer.hide();
  }

  /**
   * Fire the slingshot.
   * @returns {{speed:number, dirX:number, dirZ:number}}
   */
  launch(aim, game) {
    const power = aim.power;
    const speed =
      (PLAYER.launchSpeedMin + (PLAYER.launchSpeedMax - PLAYER.launchSpeedMin) * power) *
      this.stats.launchSpeedMult;
    this.vx = aim.dirX * speed;
    this.vz = aim.dirZ * speed;
    this.state = PLAYER_STATE.LAUNCHED;
    this.drag = PLAYER.dragLaunched;
    this.bouncesUsed = 0;
    this.launchPower = power;
    this.iFrameTimer = PLAYER.iFrameGrace;
    this.pyreTimer = 0;
    this.aimPower = 0;
    this.prediction = null;
    this.aimRenderer.hide();

    game?.on?.playerLaunch?.({ player: this, x: this.x, z: this.z, speed, power });
    return { speed, dirX: aim.dirX, dirZ: aim.dirZ };
  }

  /** Emergency reposition — no slow-mo, no Focus cost, short cooldown. */
  dash(dirX, dirZ, game) {
    if (!this.alive || this.dashCooldown > 0) return false;
    const len = Math.hypot(dirX, dirZ) || 1;
    this.vx = (dirX / len) * PLAYER.dashSpeed;
    this.vz = (dirZ / len) * PLAYER.dashSpeed;
    this.state = PLAYER_STATE.DASHING;
    this.drag = PLAYER.dragLaunched;
    this.dashTimer = PLAYER.dashDuration;
    this.dashCooldown = PLAYER.dashCooldown;
    this.iFrameTimer = PLAYER.dashDuration * 0.8;
    this.bouncesUsed = 0;
    this.aimRenderer.hide();
    game?.on?.playerDash?.({ player: this });
    return true;
  }

  /** Called by PhysicsSystem when the bounce budget is spent. */
  endLaunch() {
    if (this.state === PLAYER_STATE.LAUNCHED || this.state === PLAYER_STATE.DASHING) {
      this.state = PLAYER_STATE.IDLE;
      this.drag = PLAYER.dragIdle;
    }
  }

  /* ---------------------------------------------------------------- *
   * Resources
   * ---------------------------------------------------------------- */

  addFocus(amount) {
    this.focus = Math.min(this.focus + amount, this.focusMax);
  }

  spendFocus(amount) {
    this.focus = Math.max(0, this.focus - amount);
    return this.focus > 0;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  takeDamage(amount, game, source = null) {
    if (!this.alive || this.invulnerable) return false;
    this.hp -= amount;
    this.flashTimer = 0.12;
    game?.on?.playerDamaged?.({ player: this, amount, source });
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      this.state = PLAYER_STATE.DEAD;
      this.group.visible = false;
      this.trail.clear();
      game?.on?.playerDeath?.({ player: this });
    }
    return true;
  }

  respawn(x, z) {
    this.x = x;
    this.z = z;
    this.vx = 0;
    this.vz = 0;
    this.state = PLAYER_STATE.IDLE;
    this.drag = PLAYER.dragIdle;
    this.alive = true;
    this.hp = this.maxHp;
    this.focus = this.focusMax;
    this.bouncesUsed = 0;
    this.iFrameTimer = 0.5;
    this.group.visible = true;
    this.trail.clear();
  }

  /** Reposition without resetting the build (used when entering a new room). */
  placeAt(x, z) {
    this.x = x;
    this.z = z;
    this.vx = 0;
    this.vz = 0;
    this.state = PLAYER_STATE.IDLE;
    this.drag = PLAYER.dragIdle;
    this.bouncesUsed = 0;
    this.iFrameTimer = 0.6;
    this.trail.clear();
  }

  /* ---------------------------------------------------------------- *
   * Frame update
   * ---------------------------------------------------------------- */

  /**
   * @param {number} dt   scaled seconds
   * @param {number} rawDt real seconds
   * @param {object} game
   * @param {boolean} aimingActive whether bullet-time is actually engaged
   */
  update(dt, rawDt, game, aimingActive) {
    // --- Focus economy runs on REAL time: slow-mo must feel expensive. ---
    if (aimingActive && this.state === PLAYER_STATE.AIMING) {
      this.focus = Math.max(0, this.focus - FOCUS.drainPerSecond * rawDt);
    } else if (this.focus < this.focusMax) {
      this.focus = Math.min(
        this.focusMax,
        this.focus + FOCUS.regenPerSecond * this.stats.focusRegenMult * rawDt
      );
    }

    // --- timers ---
    if (this.iFrameTimer > 0) this.iFrameTimer -= dt;
    if (this.flashTimer > 0) this.flashTimer -= rawDt;
    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    if (this.touchTimer > 0) this.touchTimer -= dt;
    if (this.pyreTimer > 0) this.pyreTimer -= dt;

    if (this.state === PLAYER_STATE.DASHING) {
      this.dashTimer -= dt;
      if (this.dashTimer <= 0) this.endLaunch();
    }

    if (this.state === PLAYER_STATE.LAUNCHED && this.speed < PLAYER.settleSpeed) {
      this.endLaunch();
    }

    this.drag =
      this.state === PLAYER_STATE.LAUNCHED || this.state === PLAYER_STATE.DASHING
        ? PLAYER.dragLaunched
        : PLAYER.dragIdle;

    // --- presentation ---
    const speed = this.speed;
    if (speed > PLAYER.trailMinSpeed) {
      this.trail.push(this.x, this.z, Math.min(1, speed / PLAYER.launchSpeedMax + 0.25));
    }
    this.trail.decay(Math.max(dt, rawDt * 0.25));
    this.trail.rebuild();

    this.group.position.set(this.x, 0, this.z);

    const hot = this.flashTimer > 0 ? 3.2 : 0.75 + Math.min(speed / 40, 1) * 1.4;
    this.bodyMat.emissiveIntensity = hot;
    this.coreMat.color.setHex(this.flashTimer > 0 ? 0xffffff : PALETTE.playerCore);

    // Velocity-aligned squash sells momentum without any animation data.
    if (speed > 1) {
      const stretch = 1 + Math.min(speed / PLAYER.launchSpeedMax, 1) * 0.35;
      const squash = 1 / Math.sqrt(stretch);
      this.body.scale.set(squash, squash, squash);
      this.group.rotation.y = Math.atan2(this.vx, this.vz);
      this.body.scale.z = stretch * squash;
    } else {
      this.body.scale.setScalar(1);
    }

    this.haloMat.opacity = this.invulnerable ? 0.55 + Math.sin(performance.now() / 60) * 0.2 : 0.22;
    this.halo.scale.setScalar(this.invulnerable ? 1.15 : 1);
  }

  /** Draw the three aim layers from a fresh prediction. */
  showTrajectory(prediction) {
    this.prediction = prediction;
    this.aimRenderer.show(prediction, this, this.aimPower);
  }

  hideTrajectory() {
    this.aimRenderer.hide();
  }

  dispose() {
    this.scene.remove(this.group);
    this.scene.remove(this.trail.mesh);
    this.scene.remove(this.aimRenderer.group);
    this.body.geometry.dispose();
    this.bodyMat.dispose();
    this.core.geometry.dispose();
    this.coreMat.dispose();
    this.halo.geometry.dispose();
    this.haloMat.dispose();
    this.trail.dispose();
    this.aimRenderer.dispose();
  }
}

export default Player;
