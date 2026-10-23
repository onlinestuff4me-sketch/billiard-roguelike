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
import { PLAYER, PHYSICS, FOCUS, PALETTE, TRAJECTORY, ARENA, RULES, LAYER } from '../config.js';

const clamp = (value, lo, hi) => Math.min(Math.max(value, lo), hi);

/**
 * Does the cue ball's departure line run into a pocket? Tested as a segment
 * against each pocket's capture circle, not just the endpoint — a line that
 * passes through a mouth on its way somewhere else is still a scratch.
 */
/**
 * Does this leg of the cue ball's projected path pass down a pocket?
 *
 * Closest approach from a point to a finite segment. It has to be the segment
 * and not the infinite ray, because the path now STOPS where the ball stops:
 * a pocket sitting beyond the end of the roll is not a scratch, and warning
 * about one was the loudest way the old preview lied.
 */
function segmentScratches(seg, pockets) {
  if (!pockets || !pockets.length) return false;
  const dx = seg.bx - seg.ax;
  const dz = seg.bz - seg.az;
  const len2 = dx * dx + dz * dz;
  if (len2 < 1e-9) return false;
  for (const pocket of pockets) {
    const t = clamp(((pocket.x - seg.ax) * dx + (pocket.z - seg.az) * dz) / len2, 0, 1);
    const cx = seg.ax + dx * t;
    const cz = seg.az + dz * t;
    if (Math.hypot(pocket.x - cx, pocket.z - cz) <= pocket.radius) return true;
  }
  return false;
}

/**
 * A POLYLINE WITH WIDTH, BECAUSE A LINE HAS NONE.
 *
 * GPU line width is capped at one physical pixel on virtually every platform.
 * On a phone at three device pixels to the CSS pixel that is a THIRD of a
 * pixel of coverage, and the aim preview — the thing the player is actually
 * steering — was drawn out of those while the coach road beside it is drawn
 * out of triangles. Reported as "it's hard to see the aiming guide lines of
 * the ball trajectories": they were there, at a third of a pixel.
 *
 * The main beam has been geometry for exactly this reason since it was
 * written. This is the same answer for every other predicted line: each
 * segment becomes a quad of a real world-space width, so a line is as thick as
 * it is asked to be on any screen.
 */
class Ribbon {
  /** @param {THREE.Object3D} group @param {{color:number, opacity:number}} look */
  constructor(group, look, quads = 96) {
    this.positions = new Float32Array(quads * 6 * 3);
    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geo.setDrawRange(0, 0);
    this.mat = new THREE.MeshBasicMaterial({
      color: look.color,
      transparent: true,
      opacity: look.opacity,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    this.mesh = new THREE.Mesh(this.geo, this.mat);
    this.mesh.frustumCulled = false;
    this.mesh.visible = false;
    group.add(this.mesh);
  }

  /**
   * @param {Array<{ax:number,az:number,bx:number,bz:number}>} segs
   * @param {{y:number, width:number, color?:number, opacity?:number,
   *          dash?:number, gap?:number}} look
   */
  set(segs, look) {
    let v = 0;
    const half = look.width / 2;
    const quad = (ax, az, bx, bz, nx, nz) => {
      if ((v + 6) * 3 > this.positions.length) return;
      const y = look.y;
      this.positions.set(
        [
          ax + nx, y, az + nz, bx + nx, y, bz + nz, bx - nx, y, bz - nz,
          ax + nx, y, az + nz, bx - nx, y, bz - nz, ax - nx, y, az - nz
        ],
        v * 3
      );
      v += 6;
    };
    // Dashes are cut here rather than by LineDashedMaterial, which needs line
    // primitives. Carried across segments so a bank does not restart the
    // pattern in the middle of a dash.
    let phase = 0;
    for (const seg of segs || []) {
      const dx = seg.bx - seg.ax;
      const dz = seg.bz - seg.az;
      const len = Math.hypot(dx, dz);
      if (len < 1e-5) continue;
      const ux = dx / len;
      const uz = dz / len;
      const nx = -uz * half;
      const nz = ux * half;
      if (!look.dash) {
        quad(seg.ax, seg.az, seg.bx, seg.bz, nx, nz);
        continue;
      }
      const period = look.dash + look.gap;
      let at = -phase;
      while (at < len) {
        const from = Math.max(at, 0);
        const to = Math.min(at + look.dash, len);
        if (to > from) quad(seg.ax + ux * from, seg.az + uz * from, seg.ax + ux * to, seg.az + uz * to, nx, nz);
        at += period;
      }
      phase = (phase + len) % period;
    }
    if (look.color != null) this.mat.color.setHex(look.color);
    if (look.opacity != null) this.mat.opacity = look.opacity;
    this.geo.setDrawRange(0, v);
    this.geo.attributes.position.needsUpdate = true;
    this.mesh.visible = v > 0;
    return v > 0;
  }

  hide() {
    this.geo.setDrawRange(0, 0);
    this.mesh.visible = false;
  }

  dispose() {
    this.geo.dispose();
    this.mat.dispose();
  }
}

export const PLAYER_STATE = {
  IDLE: 'idle',
  AIMING: 'aiming',
  LAUNCHED: 'launched',
  DASHING: 'dashing',
  DEAD: 'dead'
};

/* ------------------------------------------------------------------ *
 * Motion ribbon — an indexed quad strip rebuilt every frame.
 * Additive blending + per-vertex color means fading the tail to black
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

/**
 * THE CUE, AS A STICK.
 *
 * A full-length tapered cue drawn ABOVE the rails, so it carries on past the
 * table's edge the way a real cue does (and the way 8 Ball Pool draws one):
 * the thing in your hand is longer than the table is wide. Lightline style: a
 * dark shaft with lit cyan edges, a white ferrule at the tip and two light
 * bands at the butt. Under it, a flat stylised shadow falls across the felt
 * and the rail, offset as if lit from the top left — weight you can see.
 *
 * Rebuilt every frame from (tip, direction), as one of three looks
 * (TRAJECTORY.stickLook): rod, classic or hardlight.
 */
class CueStick {
  constructor(parent) {
    this.group = new THREE.Group();
    this.group.renderOrder = 6;
    parent.add(this.group);
    const QUADS = 28;
    this.QUADS = QUADS;
    const make = (count, vertexColors, opacity, order) => {
      const positions = new Float32Array(count * 4 * 3);
      const colors = new Float32Array(count * 4 * 3);
      const index = new Uint16Array(count * 6);
      for (let q = 0; q < count; q += 1) {
        const v = q * 4;
        index.set([v, v + 1, v + 2, v, v + 2, v + 3], q * 6);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      if (vertexColors) geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geo.setIndex(new THREE.BufferAttribute(index, 1));
      const mat = new THREE.MeshBasicMaterial({
        color: vertexColors ? 0xffffff : 0x000000,
        vertexColors,
        transparent: true,
        opacity,
        depthTest: false,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.frustumCulled = false;
      mesh.renderOrder = order;
      this.group.add(mesh);
      return { positions, colors, geo, mat, mesh };
    };
    // Two shadow layers (a soft wide one and a firmer core), then the stick.
    this.shadowSoft = make(1, false, 0.3, 5);
    this.shadow = make(1, false, 0.62, 5);
    this.body = make(QUADS, true, 1, 7);
    // The smear: on the strike, a streak of light over the ground the stick
    // just covered, the one-frame blur an animator would draw.
    this.smear = make(1, false, 0, 6);
    this.smear.mat.color.set(PALETTE.player);
    this.smear.mat.blending = THREE.AdditiveBlending;
    this.smear.mesh.visible = false;
    this.group.visible = false;
    this._c = new THREE.Color();
    this._hot = new THREE.Color(PALETTE.scoreMult ?? 0xff8a1e);
    this._white = new THREE.Color(0xffffff);
    this._look = null;
  }

  /**
   * THE LOOKS. Each is a list of quads along the stick: [d0, d1, f0, f1, hex]
   * runs from d0 to d1 units back from the tip, and across from f0 to f1 of
   * the half-width at that point (-1 is one edge, 1 the other). Lengths ending
   * in 'L' are fractions of the stick's length.
   */
  static quads(look, L, ferrule) {
    const Q = [];
    const at = (v) => (typeof v === 'string' ? parseFloat(v) * L : v);
    const q = (d0, d1, f0, f1, hex, mul = 0) => Q.push([at(d0), at(d1), f0, f1, hex, mul]);
    if (look === 'classic') {
      // A real cue: maple shaft shaded round, white ferrule, blue tip, a cyan
      // joint ring, an ebony butt with inlay bands, a black bumper.
      q(ferrule, '0.56L', -1, 1, 0xc9a46b);
      q(ferrule, '0.56L', -1, -0.45, 0x9c7a46);
      q(ferrule, '0.56L', 0.15, 0.42, 0xf1dcae);
      q(0.06, ferrule, -1, 1, 0xf3f1ea);
      q(0, 0.06, -1, 1, 0x3d7fe0);
      q('0.56L', '0.575L', -1, 1, PALETTE.player);
      q('0.575L', L - 0.28, -1, 1, 0x3b2a20);
      q('0.575L', L - 0.28, -1, -0.5, 0x26190f);
      q('0.575L', L - 0.28, 0.1, 0.4, 0x6a4e3b);
      for (const f of [0.66, 0.78, 0.9]) q(`${f}L`, `${f + 0.012}L`, -0.9, 0.9, 0xb8c8d0);
      q('0.6L', '0.64L', -0.25, 0.25, PALETTE.player);
      q(L - 0.28, L, -1, 1, 0x101012);
    } else if (look === 'hardlight') {
      // Light, not wood: a faint fill, segmented edges like a light-cycle's
      // wall, a white-hot core, and an emitter at the tip.
      q(0, L, -1, 1, 0x0a3a50);
      const seg = 1.5;
      const gap = 0.22;
      for (let d = 0.4; d < L - 0.2; d += seg + gap) {
        const e = Math.min(L - 0.2, d + seg);
        q(d, e, -1, -0.66, PALETTE.player);
        q(d, e, 0.66, 1, PALETTE.player);
      }
      q(0.4, '0.8L', -0.1, 0.1, 0xd9feff);
      q(0, 0.4, -1, 1, 0xffffff);
      q(L - 0.2, L, -1, 1, PALETTE.player);
    } else {
      // ROD, the first one built: dark steel, lit cyan edges, a lit streak,
      // two bands at the butt and a dark cap.
      q(ferrule, L, -1, 1, TRAJECTORY.stickShaft);
      q(0, ferrule, -1, 1, PALETTE.bone);
      q(ferrule, L, -1, -0.8, PALETTE.player, 0.75);
      q(ferrule, L, 0.8, 1, PALETTE.player, 0.75);
      q(L * 0.7, L * 0.7 + 0.16, -1, 1, PALETTE.player);
      q(L * 0.7 + 0.32, L * 0.7 + 0.48, -1, 1, PALETTE.player);
      q(L - 0.5, L, -1, 1, TRAJECTORY.stickButt);
      q(ferrule + 0.1, '0.66L', -0.18, 0.18, TRAJECTORY.stickShine);
    }
    return Q;
  }

  /**
   * @param {number} tx,tz  the tip, on the table
   * @param {number} ux,uz  the shot direction (the stick points back along -u)
   * @param {{len:number, tipLit:boolean, opacity:number, heat?:number,
   *          widthScale?:number, jitter?:number}} o
   *   heat 0..1 crawls a glow from the butt to the tip (1 is fully lit);
   *   widthScale thins the stick (the pierce strike); jitter shakes it sideways
   */
  set(tx, tz, ux, uz, o) {
    const look = TRAJECTORY.stickLook || 'rod';
    if (look !== this._look) {
      this._look = look;
      this.body.mat.blending = look === 'hardlight' ? THREE.AdditiveBlending : THREE.NormalBlending;
      this.body.mat.needsUpdate = true;
    }
    const y = TRAJECTORY.stickHeight;
    const L = o.len;
    const nx = -uz;
    const nz = ux;
    const ws = o.widthScale ?? 1;
    const w0 = TRAJECTORY.stickWidth * 0.55 * ws;
    const w1 = TRAJECTORY.stickWidth * 1.9 * ws;
    const wAt = (d) => w0 + (w1 - w0) * (Math.max(0, d) / L);
    const j = o.jitter || 0;
    tx += nx * j;
    tz += nz * j;
    const ferrule = 0.32;
    const quads = CueStick.quads(look, L, ferrule);
    const heat = o.heat || 0;
    const b = this.body;
    const p = b.positions;
    const col = b.colors;
    const c = this._c;
    for (let qi = 0; qi < this.QUADS; qi += 1) {
      const spec = quads[qi];
      if (!spec || spec[0] === spec[1]) {
        for (let i = 0; i < 12; i += 1) p[qi * 12 + i] = 0;
        continue;
      }
      const [d0, d1, f0, f1, hex] = spec;
      const pts = [
        [d0, f0 * wAt(d0)],
        [d1, f0 * wAt(d1)],
        [d1, f1 * wAt(d1)],
        [d0, f1 * wAt(d0)]
      ];
      c.setHex(hex);
      if (spec[5]) c.multiplyScalar(spec[5]);
      // the tip lights at full power, whatever the look
      if (o.tipLit && d1 <= ferrule + 0.01) c.lerp(this._white, 0.6);
      // HEAT crawls from the butt to the tip: a quad warms once the front
      // passes its middle, and a fully heated stick burns toward white.
      if (heat > 0) {
        const mid = (d0 + d1) / 2 / L;
        const h = Math.min(1, Math.max(0, (heat * 1.25 - (1 - mid)) * 3));
        if (h > 0) c.lerp(this._hot, h * 0.6);
        if (heat >= 1) c.lerp(this._white, 0.08);
      }
      for (let i = 0; i < 4; i += 1) {
        const [d, s] = pts[i];
        const o3 = (qi * 4 + i) * 3;
        p[o3] = tx - ux * d + nx * s;
        p[o3 + 1] = y;
        p[o3 + 2] = tz - uz * d + nz * s;
        col[o3] = c.r;
        col[o3 + 1] = c.g;
        col[o3 + 2] = c.b;
      }
    }
    // the tip's halo at full power
    if (o.tipLit) {
      const qi = this.QUADS - 1;
      const g = 0.22;
      const pts = [[-g, -w0 - g], [ferrule * 0.6, -w0 - g], [ferrule * 0.6, w0 + g], [-g, w0 + g]];
      c.setHex(PALETTE.playerCore);
      pts.forEach(([d, s], i) => {
        const o3 = (qi * 4 + i) * 3;
        p[o3] = tx - ux * d + nx * s;
        p[o3 + 1] = y;
        p[o3 + 2] = tz - uz * d + nz * s;
        col[o3] = c.r;
        col[o3 + 1] = c.g;
        col[o3 + 2] = c.b;
      });
    }
    b.geo.attributes.position.needsUpdate = true;
    b.geo.attributes.color.needsUpdate = true;
    b.mat.opacity = o.opacity;

    // The shadow: the whole stick, offset down and to the right. Light casts
    // only a faint one.
    const sx = TRAJECTORY.stickShadow[0];
    const sz = TRAJECTORY.stickShadow[1];
    const shade = look === 'hardlight' ? 0.4 : 1;
    const flat = (buf, d0, d1, a0, a1, b0, b1, ox, oz) => {
      const pts = [[d0, a0], [d1, b0], [d1, b1], [d0, a1]];
      pts.forEach(([d, s], i) => {
        buf.positions.set([tx - ux * d + nx * s + ox, y, tz - uz * d + nz * s + oz], i * 3);
      });
      buf.geo.attributes.position.needsUpdate = true;
    };
    flat(this.shadow, 0, L, -w0, w0, -w1, w1, sx, sz);
    flat(this.shadowSoft, -0.1, L + 0.2, -w0 - 0.14, w0 + 0.14, -w1 - 0.2, w1 + 0.2, sx * 1.25, sz * 1.25);
    this.shadow.mat.opacity = 0.62 * o.opacity * shade;
    this.shadowSoft.mat.opacity = 0.3 * o.opacity * shade;
    this.group.visible = true;
  }

  /** A point `d` units back from the tip of the stick as last drawn. */
  pointAt(tx, tz, ux, uz, d) {
    return { x: tx - ux * d, z: tz - uz * d };
  }

  /** A streak from `from` to `to` units behind the ball along -u (0 hides it). */
  setSmear(bx, bz, ux, uz, from, to, opacity) {
    const m = this.smear;
    m.mesh.visible = opacity > 0 && from > to;
    if (!m.mesh.visible) return;
    const y = TRAJECTORY.stickHeight - 0.01;
    const nx = -uz;
    const nz = ux;
    const w = TRAJECTORY.stickWidth * 0.75;
    const pts = [[to, -w * 0.6], [from, -w * 1.4], [from, w * 1.4], [to, w * 0.6]];
    pts.forEach(([d, sx], i) => {
      m.positions.set([bx - ux * d + nx * sx, y, bz - uz * d + nz * sx], i * 3);
    });
    m.geo.attributes.position.needsUpdate = true;
    m.mat.opacity = opacity;
  }

  hide() {
    this.group.visible = false;
    this.smear.mesh.visible = false;
  }
}

class AimRenderer {
  constructor() {
    this.group = new THREE.Group();
    this.group.visible = false;
    this.group.renderOrder = 3;

    // 0. The beam — a ribbon mesh under the hairline core.
    //    Real thickness needs geometry: GPU line width is clamped to 1px on
    //    essentially every platform, so LineBasicMaterial.linewidth is a no-op.
    const SLICES = TRAJECTORY.beamSlices;
    this.beamPositions = new Float32Array(SLICES * 2 * 3);
    this.beamColors = new Float32Array(SLICES * 2 * 3);
    const beamIdx = new Uint16Array((SLICES - 1) * 6);
    for (let i = 0; i < SLICES - 1; i++) {
      const o = i * 6;
      const v = i * 2;
      beamIdx[o] = v;
      beamIdx[o + 1] = v + 1;
      beamIdx[o + 2] = v + 2;
      beamIdx[o + 3] = v + 1;
      beamIdx[o + 4] = v + 3;
      beamIdx[o + 5] = v + 2;
    }
    this.beamGeo = new THREE.BufferGeometry();
    this.beamGeo.setAttribute('position', new THREE.BufferAttribute(this.beamPositions, 3));
    this.beamGeo.setAttribute('color', new THREE.BufferAttribute(this.beamColors, 3));
    this.beamGeo.setIndex(new THREE.BufferAttribute(beamIdx, 1));
    this.beamMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    this.beam = new THREE.Mesh(this.beamGeo, this.beamMat);
    this.beam.frustumCulled = false;
    this.group.add(this.beam);

    // 0b. THE QUIETER AIM STYLES (TRAJECTORY.aimStyle).
    //
    // The beam does two jobs: it is the first leg of the shot, and it is the
    // only thing that says how hard you are pulling, by swelling to nearly two
    // ball-widths of additive light. That made it the brightest object on the
    // table while the player is reading everything else on it. The other
    // styles draw the first leg like every other predicted line and move the
    // power read somewhere it does not cover the felt:
    //   slim  — a ring around the cue ball that fills as the draw grows
    //   pulse — a spark that runs the first leg, faster the harder you pull,
    //           flaring the ghost ball each time it arrives
    // Both spend the brightness the beam used to spend on the RELEASE instead:
    // a beam that fires down the line once, as the shot is taken.
    this.lead = new Ribbon(this.group, { color: PALETTE.aim, opacity: 0.95 });
    this.gaugeTrack = new Ribbon(this.group, { color: PALETTE.aim, opacity: 0.16 }, 48);
    this.gauge = new Ribbon(this.group, { color: PALETTE.aim, opacity: 0.95 }, 48);
    this.comet = new Ribbon(this.group, { color: PALETTE.playerCore, opacity: 0.95 }, 8);
    // cue — the stick itself, behind the ball, drawn back as far as the
    // thumb has pulled. What 8 Ball Pool and the golf games do: power is
    // shown behind the ball, never on the line ahead of it.
    this.stick = new Ribbon(this.group, { color: PALETTE.bone, opacity: 0.85 }, 8);
    this.stickTip = new Ribbon(this.group, { color: PALETTE.aim, opacity: 0.95 }, 8);
    // THE STICK COMES BACK IN LIGHT (from review: it reappeared abruptly). A
    // line of light shoots out from the ball along where the stick will lie,
    // and the stick fills in along it. Every time it returns: after a shot,
    // after a freeze, at the start of a table.
    this.beamIn = new Ribbon(this.group, { color: PALETTE.aim, opacity: 1 }, 8);
    this.beamIn.mat.blending = THREE.AdditiveBlending;
    /** seconds into the stick's return, or null once it is fully back */
    this.revealT = 0;
    this.comet.mat.blending = THREE.AdditiveBlending;
    this.cometPhase = 0;
    this._lastShow = 0;

    // The release flash lives outside the aim group, because a launch hides
    // the aim and the flash is what plays after it.
    this.fxGroup = new THREE.Group();
    this.fxGroup.renderOrder = 3;
    this.flash = new Ribbon(this.fxGroup, { color: PALETTE.aim, opacity: 1 }, 8);
    this.flash.mat.blending = THREE.AdditiveBlending;
    this.flashCore = new Ribbon(this.fxGroup, { color: PALETTE.playerCore, opacity: 1 }, 8);
    this.flashCore.mat.blending = THREE.AdditiveBlending;
    this.cue = new CueStick(this.fxGroup);
    this.cueState = null;
    this.strike = null;
    /** Seconds since a 'lock' max-power moment fired (null when idle). */
    this.lockT = null;
    this.sparkT = 0;
    /** Hooks main.js fills: the stick reaching the ball, and a spark off a hot stick. */
    this.onContact = null;
    this.onSpark = null;
    this.flashState = null;

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

    // 2. THE REST OF THE CUE'S JOURNEY — every leg after the first cushion.
    //
    // This was the last `LineSegments` in the preview. GPU line width is
    // clamped to one PHYSICAL pixel, so on a phone at 3x the whole of a bank
    // shot past the wall — which on the banking lesson is the entire point of
    // the shot — was a third of a CSS pixel of dimmed color. Reported as
    // "when aiming the cue at a wall for a bank shot, the dotted line at the
    // wall is very faint, which is strange".
    //
    // It is a ribbon now, like every other predicted line, and it carries the
    // dash phase on from the beam rather than restarting at each cushion.
    this.reflections = new Ribbon(this.group, { color: PALETTE.aim, opacity: 0.9 }, 220);

    // 3. Carom deflection cone.
    // Two legs, each allowed one bank, plus headroom. See main.js
    // projectObjectPath — the object ball's route is a chain, not a stub.
    // WHOSE PATH IS WHOSE — ONE LINE PER BALL.
    //
    // This was a single line object holding the whole chain in one amber. Two
    // balls' routes in one color, crossing the same felt, is a picture that
    // cannot answer the only question being asked of it: which of these is the
    // 4 and which is the 1. Each leg gets its own line now, carrying that
    // ball's own hue (PALETTE.ballInk).
    //
    // And each successive leg is DIMMER than the one before it. A leg past the
    // first is on the far side of a collision — the shot has already committed
    // by then and the prediction is compounding one impulse solution on top of
    // another. Drawing it at the same strength as the first would promise a
    // confidence the physics does not have; drawing it not at all would hide
    // the second half of every combination.
    this.legLines = [];
    // the played shot draws every ball it moves (main.js simulateAim)
    for (let i = 0; i < 10; i += 1) {
      this.legLines.push(new Ribbon(this.group, { color: PALETTE.solid, opacity: 0.9 }));
    }

    // 4. The cue ball's own departure path — where YOU end up.
    //    A polyline, not a ray: it is the projected velocity marched through
    //    the table for the distance the shot actually carries, so it banks off
    //    rails and stops where the ball stops. Turning "why did I end up
    //    there?" into a decision made before releasing is the single most
    //    useful aid real pool players train with, and it only works if the
    //    line is the truth. See main.js `projectCuePath`.
    //    Room for one segment per previewed bank, plus the first.
    this.tangent = new Ribbon(this.group, { color: PALETTE.player, opacity: 0.75 });

    // Ghost ball — a full outline of the cue ball at its contact position.
    // Aiming at a whole shape reads faster than aiming at an abstract point,
    // which is why the ghost-ball method is what beginners are taught first.
    // YOUR ball's ghost, at YOUR ball's first collision — so it wears the
    // player's cyan rather than a neutral bone. Every other ghost on the table
    // is the color of the ball it belongs to; this one was the exception for
    // no reason but that it predated them.
    this.markerMat = new THREE.MeshBasicMaterial({
      color: PALETTE.player,
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

    // WHERE EACH BALL COMES TO REST, AS THE BALL.
    //
    // A line says which way something goes; it does not say where it stops,
    // and a label saying so is a word the eye has to leave the table to read.
    // A translucent copy of the ball, sitting at the end of its own route in
    // its own color, is the same fact as a shape — so the plan can be read
    // without reading. Cyan is yours, amber is the rack, bone is a pocket, red
    // is a pocket about to eat your own ball.
    //
    // Disc plus ring rather than either alone: the disc is what makes it read
    // as a BALL at a glance, and the ring is what keeps it legible over the
    // felt's own gradient, where a low-opacity disc alone disappears.
    this.endGhosts = [];
    for (let i = 0; i < 4; i += 1) {
      // A GHOST IS HOLLOW, AND DIMMER THAN THE BALL IT IS A GHOST OF.
      //
      // The previous pass over-corrected: a heavy fill at full-brightness ring
      // read as another ball on the table rather than as a projection of one,
      // which is worse than being too faint — a solid shape where no ball is
      // is a lie about the state of the table. So: no fill to speak of, a ring
      // kept clearly below the real balls' brightness, and enough ring WIDTH
      // to stay findable at thirteen pixels across. Hollow, present, and
      // obviously not a ball.
      const fillMat = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.07,
        depthWrite: false
      });
      const ringMat = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.62,
        depthWrite: false
      });
      // THE COLLAR, for a ghost that sits inside a lit pocket.
      //
      // A called pocket is bone-white and blooming, and the bloom lays a
      // blurred copy of that glow back over anything inside its radius — the
      // same mechanism that erased the numerals off the balls. A hollow ring
      // in the ball's own hue simply vanishes into it: "you can't see that the
      // 2 is going to land inside the side pocket because the ball's ghost is
      // obstructed by the brightness of the highlighted pocket". This is a
      // near-black annulus drawn just outside the ring, so the ring has a dark
      // ground of its own to read against whatever it is standing on.
      const collarMat = new THREE.MeshBasicMaterial({
        color: 0x05070a,
        transparent: true,
        opacity: 0.86,
        depthWrite: false
      });
      const fill = new THREE.Mesh(new THREE.CircleGeometry(1, 28), fillMat);
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.76, 1.0, 28), ringMat);
      const collar = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.34, 28), collarMat);
      fill.rotation.x = -Math.PI / 2;
      ring.rotation.x = -Math.PI / 2;
      collar.rotation.x = -Math.PI / 2;
      fill.visible = false;
      ring.visible = false;
      collar.visible = false;
      fill.frustumCulled = false;
      ring.frustumCulled = false;
      collar.frustumCulled = false;
      // Drawn in this order so the collar is under the ring it is backing.
      this.group.add(collar);
      this.group.add(fill);
      this.group.add(ring);
      this.endGhosts.push({ fill, ring, collar, fillMat, ringMat, collarMat });
    }

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

  /**
   * Place a translucent copy of each ball at the end of its own route.
   *
   * Driven from the SAME list the coaching labels are drawn from (main.js
   * `aimTags`), so the shape on the felt and the words beside it always name
   * the same place. Geometry is a unit circle scaled to the ball's radius,
   * which keeps one geometry for every ball size on the table.
   */
  _showEndGhosts(list, y) {
    for (let i = 0; i < this.endGhosts.length; i += 1) {
      const ghost = this.endGhosts[i];
      const spec = list?.[i];
      if (!spec || !Number.isFinite(spec.r)) {
        ghost.fill.visible = false;
        ghost.ring.visible = false;
        ghost.collar.visible = false;
        continue;
      }
      // The ball's own hue, decided in main.js next to the geometry, so a
      // ghost is always the color of the ball it is a ghost of.
      ghost.fillMat.color.setHex(spec.ink);
      ghost.ringMat.color.setHex(spec.ink);
      // A GHOST IN A POCKET IS NOT A NEUTRAL PROJECTION, whichever ball it
      // belongs to. A scratch is the outcome the player must not discover
      // afterward; a ball dropping is the outcome they are trying to cause,
      // and on a lit pocket both were being lost in the glow. Either way the
      // ghost stops being a hollow maybe and becomes a filled statement, with
      // a dark collar behind it and drawn after the bloom composite so nothing
      // can bleed across it.
      const warn = !!spec.text;
      const inPocket = warn || !!spec.sink;
      ghost.fillMat.opacity = warn ? 0.42 : spec.sink ? 0.55 : 0.07;
      ghost.ringMat.opacity = inPocket ? 1 : 0.62;
      ghost.collar.visible = inPocket;
      for (const mesh of [ghost.fill, ghost.ring, ghost.collar]) {
        mesh.position.set(spec.x, y, spec.z);
        mesh.scale.setScalar(spec.r);
        // OUT OF THE LIT SCENE when it is standing in a pocket. Same move as
        // the numerals on the balls: the overlay layer is drawn after the
        // composite, so the pocket's bloom is already behind it.
        mesh.layers.set(inPocket ? LAYER.overlay : LAYER.world);
        mesh.material.depthTest = !inPocket;
        mesh.visible = true;
      }
    }
  }

  hide() {
    this.group.visible = false;
    if (!this.strike) {
      this.cue.hide();
      this.cueState = null;
      // the next time it is drawn, it comes back in light (or fades in under
      // the thumb)
      this.revealT = 0;
      this.heldFade = 0;
    }
    this.beamIn.hide();
  }

  /**
   * How far into its return the stick is: the beam's length and glow, and the
   * stick's own opacity. `TRAJECTORY.stickReveal` is [beam, fill] seconds.
   */
  _reveal(dt) {
    if (this.revealT == null) return { beam: 0, glow: 0, stick: 1 };
    const [tb, tf] = TRAJECTORY.stickReveal || [0.22, 0.3];
    // the first frame back carries the time it was hidden; it starts from zero
    this.revealT += this.revealT === 0 ? 0.0001 : dt;
    const t = this.revealT;
    if (t >= tb + tf) {
      this.revealT = null;
      return { beam: 0, glow: 0, stick: 1 };
    }
    if (t < tb) {
      const u = t / tb;
      return { beam: 1 - Math.pow(1 - u, 3), glow: 1, stick: 0 };
    }
    const u = (t - tb) / tf;
    return { beam: 1, glow: 1 - u, stick: u * u * (3 - 2 * u) };
  }

  /**
   * THE POWER RING around the cue ball: centered on the shot's direction, it
   * opens both ways as the thumb pulls back and closes completely at full
   * power, where it FLASHES once — a quick swell of white light — and then
   * stays white for as long as the draw is held there.
   */
  _ring(player, ux, uz, t, y, now) {
    const r = player.radius + TRAJECTORY.gaugeGap;
    const base = Math.atan2(uz, ux);
    const full = t >= TRAJECTORY.fullDraw;
    if (full && !this._ringFull) this._ringFlashAt = now;
    this._ringFull = full;
    const since = full ? now - (this._ringFlashAt || 0) : 1;
    // The flash: a hard swell that eases out over a third of a second...
    const flash = since < 0.35 ? Math.pow(1 - since / 0.35, 2) : 0;
    // ...and then a slow breath for as long as full power is held.
    const breath = full ? 0.5 + 0.5 * Math.sin(now * 9) : 0;
    const arc = (from, to, n, radius) => {
      const segs = [];
      for (let i = 0; i < n; i += 1) {
        const a0 = from + ((to - from) * i) / n;
        const a1 = from + ((to - from) * (i + 1)) / n;
        segs.push({
          ax: player.x + Math.cos(a0) * radius,
          az: player.z + Math.sin(a0) * radius,
          bx: player.x + Math.cos(a1) * radius,
          bz: player.z + Math.sin(a1) * radius
        });
      }
      return segs;
    };
    this.gaugeTrack.set(arc(0, Math.PI * 2, 40, r), { y, width: TRAJECTORY.gaugeWidth * 0.7, opacity: 0.16 });
    const half = Math.max(0.04, t) * Math.PI;
    this.gauge.set(arc(base - half, base + half, Math.max(2, Math.round(40 * t)), r * (1 + 0.32 * flash)), {
      y,
      width: TRAJECTORY.gaugeWidth * (full ? 1.5 + 0.35 * breath + 3.5 * flash : 1),
      color: full ? PALETTE.playerCore : PALETTE.aim,
      opacity: 0.95
    });
  }

  /**
   * THE RELEASE. In the quiet styles the brightness the beam used to spend
   * on aiming is spent here instead: a beam that fires down the first leg in
   * a tenth of a second and fades, as the shot is taken.
   */
  fire(segment, power) {
    if ((TRAJECTORY.aimStyle || 'beam') === 'beam' || !segment) return;
    this.flashState = { s: segment, power, t: 0 };
    // THE STRIKE: the stick snaps forward through where the ball was, then
    // fades. The ball is already moving; the stick is the reason it is.
    if (this.cueState && TRAJECTORY.aimStyle === 'cue') {
      this.strike = { ...this.cueState, t: 0, power, contacted: false, style: TRAJECTORY.strikeStyle || 'snap' };
    }
    this.lockT = null;
  }

  /** Full power was just reached. */
  maxed() {
    if ((TRAJECTORY.maxStyle || 'flash') === 'lock') this.lockT = 0;
  }

  /** Per frame, on real time: the release flash. */
  tick(rawDt) {
    if (this.lockT != null) {
      this.lockT += rawDt;
      if (this.lockT > 0.5) this.lockT = null;
    }
    // Sparks shed by a burning stick, while it is held at full power.
    const cs = this.cueState;
    if (cs && cs.full && !this.strike && (TRAJECTORY.maxStyle || 'flash') === 'ignite' && this.onSpark) {
      this.sparkT += rawDt;
      while (this.sparkT > 0.045) {
        this.sparkT -= 0.045;
        const d = cs.gap + 0.6 + Math.random() * TRAJECTORY.stickLength * 0.55;
        this.onSpark(cs.bx - cs.ux * d, cs.bz - cs.uz * d);
      }
    }
    const k = this.strike;
    if (k) {
      k.t += rawDt;
      // THE STRIKE. Every style opens with the snap (accelerating: the stick
      // is thrown, not slid); what happens at the ball is the style.
      //   snap    follow through past the ball, then ease back as it fades
      //   impact  bounce off the ball, hard, as the table freezes on contact
      //   pierce  carry on through as a bolt of light, thinning to nothing
      const snap = TRAJECTORY.stickStrike;
      const contact = k.r * 0.2;
      let gap;
      let fade = 1;
      let widthScale = 1;
      if (k.t <= snap) {
        const u = k.t / snap;
        gap = k.gap + (contact - k.gap) * u * u;
      } else {
        if (!k.contacted) {
          k.contacted = true;
          this.onContact?.({ x: k.bx, z: k.bz, ux: k.ux, uz: k.uz, full: k.full, power: k.power, style: k.style });
        }
        const t = k.t - snap;
        if (k.style === 'impact') {
          const rec = 0.16;
          if (t <= rec) {
            const u = t / rec;
            gap = contact + 1.3 * (1 - Math.pow(1 - u, 3));
          } else {
            const u = Math.min(1, (t - rec) / 0.26);
            gap = contact + 1.3 + 0.25 * u;
            fade = 1 - u;
          }
        } else if (k.style === 'pierce') {
          const u = Math.min(1, t / 0.2);
          gap = contact - 7 * Math.pow(u, 0.6);
          widthScale = 1 - 0.85 * u;
          fade = 1 - u * u;
        } else {
          const through = 0.09;
          if (t <= through) {
            const u = t / through;
            gap = contact - 0.45 * (1 - (1 - u) * (1 - u));
          } else {
            const u = Math.min(1, (t - through) / 0.3);
            gap = contact - 0.45 + 0.35 * u * u;
            fade = 1 - u;
          }
        }
      }
      if (fade <= 0) {
        this.strike = null;
        this.cue.hide();
        this.cueState = null;
      } else {
        this.cue.set(k.bx - k.ux * gap, k.bz - k.uz * gap, k.ux, k.uz, {
          len: TRAJECTORY.stickLength,
          tipLit: k.full,
          opacity: fade,
          heat: k.heat || 0,
          widthScale
        });
        // the smear covers the snap, and is gone a beat after contact
        const after = Math.max(0, k.t - snap);
        const sm = Math.max(0, 1 - after / (k.style === 'pierce' ? 0.2 : 0.12));
        this.cue.setSmear(k.bx, k.bz, k.ux, k.uz, k.gap + 1.2, gap, sm * (k.full ? 0.55 : 0.35));
      }
    }
    const f = this.flashState;
    if (!f) return;
    f.t += rawDt;
    const life = TRAJECTORY.releaseFlash;
    if (f.t >= life) {
      this.flash.hide();
      this.flashCore.hide();
      this.flashState = null;
      return;
    }
    const s = f.s;
    const dx = s.bx - s.ax;
    const dz = s.bz - s.az;
    const reach = Math.min(1, f.t / 0.09);
    const fade = 1 - Math.max(0, (f.t - 0.09) / (life - 0.09));
    const seg = [{ ax: s.ax, az: s.az, bx: s.ax + dx * reach, bz: s.az + dz * reach }];
    const width = TRAJECTORY.beamWidth + (TRAJECTORY.beamWidthMax - TRAJECTORY.beamWidth) * f.power;
    // A soft body and a white-hot core: a shot of light, not a bar.
    this.flash.set(seg, { y: 0.14, width, color: PALETTE.aim, opacity: 0.45 * fade });
    this.flashCore.set(seg, { y: 0.15, width: width * 0.28, color: PALETTE.playerCore, opacity: fade });
  }

  /**
   * @param {object} prediction result of PhysicsSystem.predictTrajectory
   * @param {object} player
   * @param {number} power 0..1
   */
  show(prediction, player, power, charge = 1, context = {}) {
    const power0 = power;
    this.group.visible = true;
    const y = 0.12;
    const segments = prediction.segments;

    const style = TRAJECTORY.aimStyle || 'beam';
    const quiet = style !== 'beam';
    const now = performance.now() / 1000;
    const frameDt = Math.min(0.1, Math.max(0, now - (this._lastShow || now)));
    this._lastShow = now;
    this.markerFlare = 0;

    // --- the quiet styles: a line, and the power read off the felt ---
    if (quiet && segments.length > 0) {
      const s = segments[0];
      const dx = s.bx - s.ax;
      const dz = s.bz - s.az;
      const L = Math.hypot(dx, dz) || 1;
      const ux = dx / L;
      const uz = dz / L;
      this.lead.set([s], { y, width: TRAJECTORY.leadWidth, color: PALETTE.aim, opacity: 0.6 + 0.35 * power });

      if (style !== 'cue' && !this.strike) {
        this.cue.hide();
        this.cueState = null;
      }
      if (style === 'slim') {
        this._ring(player, ux, uz, charge, y, now);
        this.comet.hide();
        this.stick.hide();
        this.stickTip.hide();
      } else if (style === 'cue') {
        this.comet.hide();
        this._ring(player, ux, uz, charge, y, now);
        // THE STICK MOVES WITH THE THUMB, ONE FOR ONE. `charge` is how far the
        // thumb has traveled across the pad (0 to 1), and `stickTravel` is
        // that same travel in table units, so a centimetre of thumb is a
        // centimetre of cue. At full power the tip lights.
        let gap = player.radius + 0.2 + TRAJECTORY.stickTravel * charge;
        const full = charge >= TRAJECTORY.fullDraw;
        const maxStyle = TRAJECTORY.maxStyle || 'flash';
        // IGNITE: heat crawls up the stick from the butt as you pull, and at
        // full power the whole cue burns and trembles.
        let heat = 0;
        let jitter = 0;
        if (maxStyle === 'ignite') {
          heat = full ? 1 : Math.max(0, Math.min(1, (charge - 0.4) / (TRAJECTORY.fullDraw - 0.4)));
          if (full) jitter = Math.sin(now * 57) * 0.03 + Math.sin(now * 96) * 0.02;
        }
        // LOCK: at full power the stick kicks back a little further and
        // settles, like a mechanism catching.
        if (maxStyle === 'lock' && this.lockT != null) {
          const u = Math.min(1, this.lockT / 0.32);
          gap += 0.55 * Math.sin(Math.PI * Math.min(1, u * 1.6)) * (1 - u);
        }
        this.stick.hide();
        this.stickTip.hide();
        if (!this.strike) {
          let R;
          if ((TRAJECTORY.stickShow || 'rest') === 'drag') {
            // THE STICK IS UNDER THE THUMB (from review, after Ultrapool): it
            // fades in as you press and out when you let go without shooting.
            const step = Math.min(frameDt, 1 / 30) / (TRAJECTORY.stickFade || 0.16);
            const want = context.held ? 1 : 0;
            const f = this.heldFade ?? 0;
            this.heldFade = want > f ? Math.min(1, f + step) : Math.max(0, f - step);
            R = { beam: 0, glow: 0, stick: this.heldFade * this.heldFade * (3 - 2 * this.heldFade) };
          } else {
            R = this._reveal(frameDt);
          }
          const tx = player.x - ux * gap;
          const tz = player.z - uz * gap;
          if (R.stick > 0) {
            this.cue.set(tx, tz, ux, uz, {
              len: TRAJECTORY.stickLength,
              tipLit: full,
              opacity: R.stick,
              heat,
              jitter
            });
          } else {
            this.cue.hide();
          }
          if (R.glow > 0) {
            const reach = TRAJECTORY.stickLength * R.beam;
            this.beamIn.set([{ ax: tx, az: tz, bx: tx - ux * reach, bz: tz - uz * reach }], {
              y: TRAJECTORY.stickHeight + 0.03,
              width: TRAJECTORY.stickWidth * 1.4,
              opacity: R.glow
            });
          } else {
            this.beamIn.hide();
          }
        }
        this.cueState = { bx: player.x, bz: player.z, ux, uz, gap, full, heat, r: player.radius };
      } else {
        this.stick.hide();
        this.stickTip.hide();
        // The spark: one short packet of light running the first leg. How
        // fast it runs IS the power, and it flares the ghost ball on arrival.
        this.gaugeTrack.hide();
        this.gauge.hide();
        this.cometPhase = (this.cometPhase + frameDt * (0.45 + 1.6 * power)) % 1;
        const head = this.cometPhase;
        const tail = Math.max(0, head - 0.16);
        this.comet.set(
          [{ ax: s.ax + ux * L * tail, az: s.az + uz * L * tail, bx: s.ax + ux * L * head, bz: s.az + uz * L * head }],
          { y: y + 0.01, width: TRAJECTORY.leadWidth * (2.2 + 1.6 * power), opacity: 0.95 }
        );
        this.markerFlare = head > 0.82 ? (head - 0.82) / 0.18 : 0;
      }
    } else {
      this.lead.hide();
      this.gaugeTrack.hide();
      this.gauge.hide();
      this.comet.hide();
      this.stick.hide();
      this.stickTip.hide();
      if (!this.strike) this.cue.hide();
    }

    // --- the beam ---
    if (!quiet && segments.length > 0) {
      const s = segments[0];
      const dx = s.bx - s.ax;
      const dz = s.bz - s.az;
      const L = Math.hypot(dx, dz) || 1;
      const ux = dx / L;
      const uz = dz / L;
      // Perpendicular in the XZ plane.
      const px = -uz;
      const pz = ux;

      const SLICES = TRAJECTORY.beamSlices;
      // The last few percent of draw widen the beam disproportionately, so the
      // top of the range is visible in the line itself and not only on the cue.
      const over = power >= 0.985 ? 1 : 0;
      const wBase =
        (TRAJECTORY.beamWidth + (TRAJECTORY.beamWidthMax - TRAJECTORY.beamWidth) * power) *
        (1 + over * 0.45);
      const hue = new THREE.Color(prediction.hit ? PALETTE.aim : PALETTE.aim);
      const t = performance.now() / 1000;

      for (let i = 0; i < SLICES; i++) {
        const f = i / (SLICES - 1);
        // Taper to a point so the beam reads as a direction, not a rectangle.
        const w = wBase * (1 - 0.2 * f) * 0.5;
        const cx = s.ax + ux * L * f;
        const cz = s.az + uz * L * f;
        const o = i * 6;
        this.beamPositions[o] = cx + px * w;
        this.beamPositions[o + 1] = y;
        this.beamPositions[o + 2] = cz + pz * w;
        this.beamPositions[o + 3] = cx - px * w;
        this.beamPositions[o + 4] = y;
        this.beamPositions[o + 5] = cz - pz * w;

        // A charged wavefront fills the beam from the ball outward, with a
        // traveling ripple behind it: the wind-up is the animation.
        // Brightness carries the charge state, but never far enough to make the
        // beam hard to see: the unfilled section stays legible, and the ripple
        // rides on top of a high floor rather than dimming the line.
        const filled = f <= charge ? 1 : 0.45;
        const ripple = 0.86 + 0.14 * Math.sin((f * 5 - t * 3.4) * Math.PI * 2);
        const edge = charge < 1 && Math.abs(f - charge) < 0.06 ? 2.1 : 1;
        const g = filled * ripple * edge;
        this.beamColors[o] = hue.r * g;
        this.beamColors[o + 1] = hue.g * g;
        this.beamColors[o + 2] = hue.b * g;
        this.beamColors[o + 3] = this.beamColors[o];
        this.beamColors[o + 4] = this.beamColors[o + 1];
        this.beamColors[o + 5] = this.beamColors[o + 2];
      }
      this.beamGeo.attributes.position.needsUpdate = true;
      this.beamGeo.attributes.color.needsUpdate = true;
      this.beam.visible = true;
    } else {
      this.beam.visible = false;
    }

    // --- primary path (hairline core over the beam) ---
    if (!quiet && segments.length > 0) {
      const s = segments[0];
      this.primaryPositions.set([s.ax, y, s.az, s.bx, y, s.bz]);
      this.primaryGeo.attributes.position.needsUpdate = true;
      this.primary.visible = true;
      this.primaryMat.opacity = 0.45 + 0.5 * power;
      // The line states outright whether this shot connects: gold means it
      // lands on a body, cyan means it does not. No counting pixels.
      this.primaryMat.color.setHex(prediction.hit ? PALETTE.aim : PALETTE.aim);
    } else {
      this.primary.visible = false;
    }

    // --- the rest of the cue's journey, past the first cushion ---
    const past = segments.slice(1);
    if (past.length) {
      this.reflections.set(past, {
        y,
        // THE SAME WEIGHT AS THE LINE IT CONTINUES. This was drawn in a
        // desaturated slate at a hairline's width, on the reasoning that a
        // path past a cushion is less certain than the path to it. On the
        // banking lesson that reasoning is exactly inverted: the leg past the
        // cushion IS the shot, and the player was being asked to plan it from
        // the faintest thing on the felt. It stays DASHED, which is what says
        // "after a bounce"; it no longer whispers.
        width: TRAJECTORY.lineWidth,
        dash: TRAJECTORY.dashLength,
        gap: TRAJECTORY.dashGap,
        color: PALETTE.aim,
        opacity: 0.9
      });
    } else {
      this.reflections.hide();
    }

    this._showEndGhosts(context.ghosts, y);

    // --- object-ball departure + ghost ball + cue tangent ---
    if (prediction.hit && prediction.caromDir) {
      const h = prediction.hit;
      const cd = prediction.caromDir;
      const angle = Math.atan2(cd.z, cd.x);
      const L = TRAJECTORY.caromConeLength;
      const ox = h.body ? h.body.x : h.x;
      const oz = h.body ? h.body.z : h.z;
      // ONE line, not a fan of three — the collision solver is deterministic,
      // so this is a promise rather than a hedge.
      //
      // And it is the WHOLE route where one is supplied: a combination is two
      // collisions, and a board whose lesson is "the 6 runs into the 2 and the
      // 2 goes in the corner" has to draw the second half of that sentence.
      // EACH BALL, TWICE: up to its collision, and on past it.
      //
      // Slots alternate leg / tail / leg / tail. The leg is the part the
      // player is choosing — bright, in that ball's color. The tail is where
      // the same ball carries on after it hands off, in the same color at
      // half the strength, because it is a solution stacked on a solution.
      const legs = context.objectPath ?? [];
      const inks = context.legInks ?? [];
      const draw = [];
      for (let i = 0; i < legs.length; i += 1) {
        const ink = inks[i] ?? PALETTE.solid;
        // The leg the player is choosing is a full-width line; what the same
        // ball does after handing off is narrower as well as fainter, so the
        // two read apart at a glance rather than by brightness alone.
        if (legs[i]?.segs?.length) {
          draw.push({ segs: legs[i].segs, ink, opacity: i === 0 ? 0.95 : 0.62, width: TRAJECTORY.lineWidth });
        }
        if (legs[i]?.tail?.length) {
          draw.push({ segs: legs[i].tail, ink, opacity: 0.34, width: TRAJECTORY.lineWidth * 0.62 });
        }
      }
      for (let i = 0; i < this.legLines.length; i += 1) {
        const item = draw[i];
        if (!item) {
          this.legLines[i].hide();
          continue;
        }
        this.legLines[i].set(item.segs, {
          y,
          width: item.width,
          color: item.ink,
          opacity: item.opacity
        });
      }
      // No chain at all: a stub in the carom direction, so a first-contact
      // shot still shows which way the ball it touches is going.
      if (!draw.length) {
        this.legLines[0].set(
          [{ ax: ox, az: oz, bx: ox + Math.cos(angle) * L, bz: oz + Math.sin(angle) * L }],
          { y, width: TRAJECTORY.lineWidth, color: context.legInks?.[0] ?? PALETTE.solid, opacity: 0.95 }
        );
      }

      // The ghost ball sits where the cue ball's center stops at contact, which
      // is exactly the point the swept-circle predictor solved for.
      this.marker.visible = true;
      this.marker.position.set(h.x, y, h.z);
      // In the pulse style the ghost ball is where the light lands.
      const flare = this.markerFlare || 0;
      this.markerMat.opacity = 0.5 + 0.5 * flare;
      this.marker.scale.setScalar(1 + 0.35 * flare);

      // THE TANGENT LINE TELLS THE TRUTH ABOUT ITS OWN CONFIDENCE.
      //
      // It used to be drawn at a fixed 4.6 units whatever the shot, and that
      // is where the preview was lying: on a near-full-ball hit the cue ball
      // keeps almost nothing and stops dead, while the line still promised a
      // full-length departure. For equal masses the cue leaves along the
      // tangent with exactly the tangential share of its speed — sin of the
      // cut angle — so that number is both the length AND the confidence.
      //
      // Thin cut  -> the cue keeps most of its speed, the direction is stable,
      //              and the line is long, bright and near-solid.
      // Full hit  -> the cue barely moves and a degree of aim error swings the
      //              departure wildly. The line is short, faint and broken,
      //              which is not a hedge — it is what actually happens.
      const last = segments[segments.length - 1];
      let inX = last ? last.bx - last.ax : 0;
      let inZ = last ? last.bz - last.az : 0;
      const inLen = Math.hypot(inX, inZ);
      const path = context.cuePath;
      if (inLen > 1e-5 && path && path.segments.length) {
        inX /= inLen;
        inZ /= inLen;
        let tx = -cd.z;
        let tz = cd.x;
        if (tx * inX + tz * inZ < 0) {
          tx = -tx;
          tz = -tz;
        }

        // WHAT THE LINE SAYS vs HOW LOUDLY IT SAYS IT.
        //
        // The path itself is solved physics — length, direction and banks all
        // come from `projectCuePath`. What is left for the drawing to express
        // is how much a small aim error would move that path, and the honest
        // measure of that is the tangential share of the hit: sin(cut angle).
        // On a thin cut the departure is stable, so the line is bright and
        // near-solid. On a near-full hit a degree of aim swings the outcome
        // wildly, so it falls apart into faint wide-gapped dashes. The line is
        // never lying about WHERE — only about how sure it is.
        const share = clamp(Math.abs(inX * tx + inZ * tz), 0, 1);

        let scratch = false;
        for (const seg of path.segments) {
          if (!scratch) scratch = segmentScratches(seg, context.pockets);
        }
        this.tangent.set(path.segments, {
          y,
          width: TRAJECTORY.lineWidth,
          color: scratch ? PALETTE.bad : PALETTE.aimGhost,
          // The FLOOR is the fix, not the ramp. Confidence is still encoded —
          // a full hit is dimmer and more broken up than a thin cut — but the
          // bottom of the range was 0.25, which on this felt is a line you have
          // to already know is there to see. A line nobody can find carries no
          // information at all, however honest its opacity.
          opacity: scratch ? 0.95 : 0.5 + share * 0.45,
          // Confident lines are nearly solid; unconfident ones fall apart.
          dash: 0.12 + share * 1.15,
          gap: 0.5 - share * 0.34
        });
      } else {
        // Emptied, not just hidden: the buffer still holds the last path, and
        // anything that turns the line back on would draw an old shot.
        this.tangent.hide();
      }
    } else {
      for (const slot of this.legLines) slot.hide();
      this.marker.visible = false;
      this.tangent.hide();
    }

    // --- the cue shaft, behind the ball ---
    // Drawn from the ball back to the thumb, so the whole stick is visible:
    // shaft behind, ball at the tip, predicted path ahead. Seeing the draw is
    // what makes power legible without a meter — the further back the butt,
    // the harder the shot.
    const cue = player.aimCue;
    this.pullPositions.set([player.x, y, player.z, cue.x, y, cue.z]);
    this.pullGeo.attributes.position.needsUpdate = true;
    this.pull.visible = true;
    // The draw-point dot predates the full cue stick, which now shows the draw
    // itself; in review it read as a distracting pulsing ball on the shaft.
    this.anchor.visible = false;
    this.anchor.position.set(cue.x, y, cue.z);

    // MAXED OUT. Power is draw distance and nothing announced when the draw ran
    // out, so the top of the range was invisible: players stopped pulling at
    // whatever felt far enough, which on the three-ball lesson was reliably too
    // little. At full power the whole cue goes gold and pulses, so "pull back
    // further" has somewhere to arrive.
    const maxed = power >= 0.985;
    // Faster and deeper than a gentle throb — at full draw the cue should look
    // like it is straining, not idling.
    const beat = maxed ? 0.55 + 0.45 * Math.sin(performance.now() / 42) : 0;

    this.pullMat.color.setHex(maxed ? PALETTE.aim : PALETTE.aim);
    this.pullMat.opacity = maxed ? 0.85 + 0.15 * beat : 0.35 + 0.5 * power;
    this.anchorMat.color.setHex(maxed ? PALETTE.aim : PALETTE.player);
    this.anchor.scale.setScalar((0.7 + power * 0.9) * (maxed ? 1.6 + 0.5 * beat : 1));
  }

  dispose() {
    this.beamGeo.dispose();
    this.beamMat.dispose();
    this.primaryGeo.dispose();
    this.primaryMat.dispose();
    this.reflections.dispose();
    for (const slot of this.legLines) slot.dispose();
    this.tangent.dispose();
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
    this.scratchGuard = 0;
    this.pyreTimer = 0;

    // --- aim ---
    this.aimPull = { x: 0, z: 0 };
    this.aimCue = { x: 0, z: 0 };
    this.aimDir = { x: 0, z: -1 };
    this.aimPower = 0;
    this.aimCharge = 1;
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
    this.scene.add(this.aimRenderer.fxGroup);
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
    // Aiming is free on a static table. There is nothing to slow down between
    // strokes, so there is nothing to charge for — the budget that limits you
    // is the stroke count, not a gauge that drains while you think.
    if (RULES.staticTable) return this.alive;
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
    this.aimCharge = aim.charge ?? 1;
    // Butt of the cue, so the shaft can be drawn behind the ball.
    this.aimCue.x = aim.cueX ?? this.x;
    this.aimCue.z = aim.cueZ ?? this.z;
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
    const { speed, power } = this.launchMotion(aim);
    this.aimPower = 0;
    this.aimRenderer.fire(this.prediction?.segments?.[0] ?? null, power);
    this.prediction = null;
    this.aimRenderer.hide();

    game?.on?.playerLaunch?.({
      player: this,
      x: this.x,
      z: this.z,
      speed,
      power,
      dirX: aim.dirX,
      dirZ: aim.dirZ
    });
    return { speed, dirX: aim.dirX, dirZ: aim.dirZ };
  }

  /**
   * THE STRIKE, AS MOTION ONLY: what a launch does to the ball and nothing it
   * does to the screen. The aim preview plays the shot with this (main.js
   * simulateAim), so it and the stroke start from the same numbers.
   */
  launchMotion(aim) {
    // Power is how far the stick is drawn back.
    const power = aim.power ?? 1;
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
    return { speed, power };
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
    this.resetAt(x, z);
    this.trail.clear();
  }

  /** placeAt without the ribbon: the motion half, shared with the preview. */
  resetAt(x, z) {
    this.x = x;
    this.z = z;
    this.prevX = x;
    this.prevZ = z;
    this.vx = 0;
    this.vz = 0;
    this.state = PLAYER_STATE.IDLE;
    this.drag = PLAYER.dragIdle;
    this.bouncesUsed = 0;
    this.iFrameTimer = 0.6;
  }

  /**
   * ONE FIXED STEP OF THE BALL'S OWN RULES: its timers, settling out of a
   * launch, and the drag that goes with its state. Run once per physics step,
   * never per frame, so a stroke plays the same at any frame rate and under
   * any slow motion, and the aim preview (which runs these same steps) draws
   * exactly the stroke that will be played.
   */
  /**
   * WHERE TO DRAW THE BALL: between its last two physics steps, by how far
   * this frame is into the next one (main.js sets `renderAlpha`). The table
   * steps at a fixed rate, so under slow motion a frame can fall between two
   * steps; drawn at the step it would move in jumps. A jump the ball really
   * made (a portal, a respot) is drawn as a jump.
   */
  renderAt() {
    const a = this.renderAlpha;
    if (!(a >= 0 && a < 1) || !Number.isFinite(this.prevX)) return [this.x, 0, this.z];
    const dx = this.x - this.prevX;
    const dz = this.z - this.prevZ;
    if (dx * dx + dz * dz > 4) return [this.x, 0, this.z];
    return [this.prevX + dx * a, 0, this.prevZ + dz * a];
  }

  stepMotion(h) {
    if (this.iFrameTimer > 0) this.iFrameTimer -= h;
    if (this.dashCooldown > 0) this.dashCooldown -= h;
    if (this.touchTimer > 0) this.touchTimer -= h;
    if (this.pyreTimer > 0) this.pyreTimer -= h;

    if (this.state === PLAYER_STATE.DASHING) {
      this.dashTimer -= h;
      if (this.dashTimer <= 0) this.endLaunch();
    }

    if (this.state === PLAYER_STATE.LAUNCHED && this.speed < PLAYER.settleSpeed) {
      this.endLaunch();
    }

    this.drag =
      this.state === PLAYER_STATE.LAUNCHED || this.state === PLAYER_STATE.DASHING
        ? PLAYER.dragLaunched
        : PLAYER.dragIdle;
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
    this.aimRenderer.tick(rawDt);
    // --- Focus economy runs on REAL time: slow-mo must feel expensive. ---
    if (RULES.staticTable) {
      this.focus = this.focusMax;
    } else if (aimingActive && this.state === PLAYER_STATE.AIMING) {
      this.focus = Math.max(0, this.focus - FOCUS.drainPerSecond * rawDt);
    } else if (this.focus < this.focusMax) {
      this.focus = Math.min(
        this.focusMax,
        this.focus + FOCUS.regenPerSecond * this.stats.focusRegenMult * rawDt
      );
    }

    // --- timers --- (the ones that change how the ball moves are in
    // stepMotion, run per physics step; these are presentation)
    if (this.flashTimer > 0) this.flashTimer -= rawDt;
    // Stops one scratch being reported on every sub-step while the cue ball
    // is still sitting inside the pocket's capture radius.
    if (this.scratchGuard > 0) this.scratchGuard -= rawDt;

    // --- presentation ---
    const speed = this.speed;
    if (speed > PLAYER.trailMinSpeed) {
      this.trail.push(this.x, this.z, Math.min(1, speed / PLAYER.launchSpeed + 0.25));
    }
    this.trail.decay(Math.max(dt, rawDt * 0.25));
    this.trail.rebuild();

    this.group.position.set(...this.renderAt());

    const hot = this.flashTimer > 0 ? 3.2 : 0.75 + Math.min(speed / 40, 1) * 1.4;
    this.bodyMat.emissiveIntensity = hot;
    this.coreMat.color.setHex(this.flashTimer > 0 ? 0xffffff : PALETTE.playerCore);

    // Velocity-aligned squash sells momentum without any animation data.
    if (speed > 1) {
      const stretch = 1 + Math.min(speed / PLAYER.launchSpeed, 1) * 0.35;
      const squash = 1 / Math.sqrt(stretch);
      this.body.scale.set(squash, squash, squash);
      this.group.rotation.y = Math.atan2(this.vx, this.vz);
      this.body.scale.z = stretch * squash;
    } else {
      this.body.scale.setScalar(1);
    }

    // --- armed / vulnerable tell --------------------------------------
    // While flying you are both untouchable and the thing doing the damage;
    // once you settle, the exact opposite is true. That inversion is the core
    // risk rule of the game and it was previously only a faint opacity shift,
    // so it now changes color as well: cyan halo = armed and safe, amber ring
    // = you can be hit.
    const armed = this.invulnerable;
    this.haloMat.color.setHex(armed ? PALETTE.player : PALETTE.aimGhost);
    this.haloMat.opacity = armed ? 0.55 + Math.sin(performance.now() / 60) * 0.2 : 0.34;
    this.halo.scale.setScalar(armed ? 1.15 : 1);
  }

  /** Draw the aim layers from a fresh prediction. */
  showTrajectory(prediction, context = {}) {
    this.prediction = prediction;
    this.aimRenderer.show(prediction, this, this.aimPower, this.aimCharge, context);
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
