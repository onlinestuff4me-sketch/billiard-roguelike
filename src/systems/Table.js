/**
 * Table.js — pockets and the lit objects on the felt.
 *
 * The one rule the whole redesign turns on lives here: a ball is never
 * destroyed by being hit, only by being driven into a target. So this file
 * owns every way a ball can leave the table, and nothing else may remove one.
 *
 * Six pockets sit where a real table has them — four corners and the middle of
 * each long rail. They are *capture zones*, not holes cut in the geometry: the
 * rails still reflect, and a body is taken the moment its centre gets inside
 * the capture radius. That keeps the trajectory preview honest (it can predict
 * rails exactly) while still letting a ball rolling along a cushion drop.
 *
 * Felt objects are one-shot. A gold ring re-arms at the top of every stroke
 * because doubling is the thing the player routes around; everything else
 * stays spent for the room, so clearing a table visibly changes it.
 */

import * as THREE from 'three';
import { ARENA, PALETTE, TABLE, RULES } from '../config.js';

/** Pocket types, in the order they are drawn into a room's six slots. */
export const POCKET_TYPES = {
  score: { id: 'score', label: 'Score', color: PALETTE.player },
  gold: { id: 'gold', label: 'Gold ×2', color: PALETTE.carom },
  upgrade: { id: 'upgrade', label: 'Upgrade', color: PALETTE.doorAlt },
  live: { id: 'live', label: 'Live', color: PALETTE.hazard }
};

export const OBJECT_TYPES = {
  gold: { id: 'gold', color: PALETTE.carom },
  gate: { id: 'gate', color: PALETTE.hazard },
  freeze: { id: 'freeze', color: PALETTE.player },
  mine: { id: 'mine', color: PALETTE.hazard }
};

/** The six fixed pocket positions, corners first then sides. */
export function pocketSlots() {
  const cx = ARENA.halfW - TABLE.pocket.cornerInset;
  const cz = ARENA.halfH - TABLE.pocket.cornerInset;
  const sx = ARENA.halfW - TABLE.pocket.sideInset;
  return [
    { x: -cx, z: -cz, slot: 'tl' },
    { x: cx, z: -cz, slot: 'tr' },
    { x: -sx, z: 0, slot: 'ml', radius: TABLE.pocket.sideRadius },
    { x: sx, z: 0, slot: 'mr', radius: TABLE.pocket.sideRadius },
    { x: -cx, z: cz, slot: 'bl' },
    { x: cx, z: cz, slot: 'br' }
  ];
}

/**
 * Which pocket is which, this room.
 *
 * Deliberately not a free-for-all roll. Gold is always present because the
 * multiplier pocket is the thing routes are built around; upgrade and live
 * arrive one room at a time so each has a room of its own to be learned in.
 */
export function rollPocketTypes(level, rng) {
  const slots = pocketSlots();
  const order = slots.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const types = slots.map(() => 'score');
  types[order[0]] = 'gold';
  if (level >= 3) types[order[1]] = 'upgrade';
  if (level >= 4) types[order[2]] = 'live';
  return slots.map((slot, i) => ({ ...slot, type: types[i] }));
}

/* ------------------------------------------------------------------ *
 * Table
 * ------------------------------------------------------------------ */

export class Table {
  /** @param {THREE.Group} parent the room group meshes are added to */
  constructor(parent) {
    this.parent = parent;
    this.group = new THREE.Group();
    this.group.name = 'table-targets';
    parent.add(this.group);

    /** @type {Array<{x:number,z:number,type:string,color:number}>} */
    this.pockets = [];
    /** @type {Array<object>} */
    this.objects = [];
  }

  /* ---------------------------------------------------------------- *
   * Building
   * ---------------------------------------------------------------- */

  clear() {
    for (let i = this.group.children.length - 1; i >= 0; i--) {
      const child = this.group.children[i];
      this.group.remove(child);
      child.traverse?.((node) => {
        if (node.geometry) node.geometry.dispose();
        if (node.material) {
          if (Array.isArray(node.material)) node.material.forEach((m) => m.dispose());
          else node.material.dispose();
        }
      });
    }
    this.pockets = [];
    this.objects = [];
  }

  /** Lay out the six pockets for a room. */
  buildPockets(level, rng, override = null) {
    const spec = override || rollPocketTypes(level, rng);
    this.pockets = spec.map((entry) => {
      const def = POCKET_TYPES[entry.type] || POCKET_TYPES.score;
      const pocket = {
        ...entry,
        type: def.id,
        label: def.label,
        color: def.color,
        radius: entry.radius ?? TABLE.pocket.radius,
        pulse: 0
      };
      pocket.meshes = this._buildPocketMesh(pocket);
      return pocket;
    });
    return this.pockets;
  }

  _buildPocketMesh(pocket) {
    const group = new THREE.Group();
    group.position.set(pocket.x, 0, pocket.z);

    // The hole itself: a flat black disc that reads as absence, not as an object.
    const hole = new THREE.Mesh(
      new THREE.CircleGeometry(pocket.radius * 0.82, 26),
      new THREE.MeshBasicMaterial({ color: PALETTE.obsidian })
    );
    hole.rotation.x = -Math.PI / 2;
    hole.position.y = 0.03;
    group.add(hole);

    // The rim carries the type. Colour alone never encodes a mechanic here, so
    // each type also gets a distinct glyph inside the ring.
    const rim = new THREE.Mesh(
      new THREE.RingGeometry(pocket.radius * 0.82, pocket.radius, 30),
      new THREE.MeshBasicMaterial({
        color: pocket.color,
        transparent: true,
        opacity: 0.62,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );
    rim.rotation.x = -Math.PI / 2;
    rim.position.y = 0.05;
    group.add(rim);

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(pocket.radius, pocket.radius * 1.5, 30),
      new THREE.MeshBasicMaterial({
        color: pocket.color,
        transparent: true,
        opacity: 0.09,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.04;
    group.add(halo);
    pocket.halo = halo;

    const glyph = this._pocketGlyph(pocket);
    if (glyph) group.add(glyph);

    this.group.add(group);
    return group;
  }

  /**
   * A shape per type, so the table is readable without colour. Gold gets a
   * doubled ring, upgrade a diamond, live an arrowhead pointing back out at
   * you — which is exactly what it does.
   */
  _pocketGlyph(pocket) {
    const mat = new THREE.MeshBasicMaterial({
      color: pocket.color,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    let mesh = null;
    if (pocket.type === 'gold') {
      mesh = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.44, 22), mat);
    } else if (pocket.type === 'upgrade') {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0.44);
      shape.lineTo(0.4, 0);
      shape.lineTo(0, -0.44);
      shape.lineTo(-0.4, 0);
      shape.closePath();
      mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), mat);
    } else if (pocket.type === 'live') {
      const shape = new THREE.Shape();
      shape.moveTo(-0.3, 0.4);
      shape.lineTo(0.42, 0);
      shape.lineTo(-0.3, -0.4);
      shape.closePath();
      mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), mat);
    }
    if (!mesh) return null;
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.07;
    return mesh;
  }

  /* ---------------------------------------------------------------- *
   * Felt objects
   * ---------------------------------------------------------------- */

  addObject(kind, x, z, opts = {}) {
    const def = OBJECT_TYPES[kind];
    if (!def) return null;
    const object = {
      kind,
      x,
      z,
      color: def.color,
      armed: true,
      pulse: 0,
      ...opts
    };
    if (kind === 'gold') object.radius = opts.radius ?? TABLE.gold.radius;
    else if (kind === 'freeze') object.radius = opts.radius ?? TABLE.freezeCell.radius;
    else if (kind === 'mine') object.radius = opts.radius ?? TABLE.mine.radius;
    else if (kind === 'gate') {
      object.hw = (opts.width ?? TABLE.gate.width) / 2;
      object.hh = (opts.thickness ?? TABLE.gate.thickness) / 2;
    }
    object.meshes = this._buildObjectMesh(object);
    this.objects.push(object);
    return object;
  }

  _buildObjectMesh(object) {
    const group = new THREE.Group();
    group.position.set(object.x, 0, object.z);
    const glow = (opacity) =>
      new THREE.MeshBasicMaterial({
        color: object.color,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });

    if (object.kind === 'gold' || object.kind === 'freeze') {
      const segments = object.kind === 'freeze' ? 4 : 30;
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(object.radius * 0.74, object.radius, segments),
        glow(0.85)
      );
      ring.rotation.x = -Math.PI / 2;
      if (object.kind === 'freeze') ring.rotation.z = Math.PI / 4;
      ring.position.y = 0.05;
      group.add(ring);

      const fill = new THREE.Mesh(
        new THREE.CircleGeometry(object.radius * 0.74, segments),
        glow(0.13)
      );
      fill.rotation.x = -Math.PI / 2;
      if (object.kind === 'freeze') fill.rotation.z = Math.PI / 4;
      fill.position.y = 0.04;
      group.add(fill);
      object.rim = ring;
      object.fill = fill;
    } else if (object.kind === 'mine') {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(object.radius * 0.8, object.radius, 20),
        glow(0.8)
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.05;
      group.add(ring);
      for (const rot of [0, Math.PI / 2]) {
        const bar = new THREE.Mesh(
          new THREE.PlaneGeometry(object.radius * 1.2, 0.13),
          glow(0.9)
        );
        bar.rotation.x = -Math.PI / 2;
        bar.rotation.z = rot;
        bar.position.y = 0.06;
        group.add(bar);
      }
      object.rim = ring;
    } else if (object.kind === 'gate') {
      const beam = new THREE.Mesh(
        new THREE.PlaneGeometry(object.hw * 2, object.hh * 2),
        glow(0.22)
      );
      beam.rotation.x = -Math.PI / 2;
      beam.position.y = 0.045;
      group.add(beam);

      const line = new THREE.Mesh(new THREE.PlaneGeometry(object.hw * 2, 0.09), glow(0.95));
      line.rotation.x = -Math.PI / 2;
      line.position.y = 0.06;
      group.add(line);
      object.rim = line;

      const postGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.9, 10);
      const postMat = new THREE.MeshStandardMaterial({
        color: PALETTE.rail,
        emissive: new THREE.Color(object.color),
        emissiveIntensity: 1.5,
        roughness: 0.4
      });
      for (const sx of [-1, 1]) {
        const post = new THREE.Mesh(postGeo, postMat);
        post.position.set(sx * object.hw, 0.45, 0);
        group.add(post);
      }
      object.postMaterial = postMat;
    }

    this.group.add(group);
    return group;
  }

  /* ---------------------------------------------------------------- *
   * Tests
   * ---------------------------------------------------------------- */

  /**
   * Has this body dropped? Capture is on the CENTRE, not on overlap, so a ball
   * has to actually reach the pocket rather than brush past it.
   */
  pocketAt(x, z) {
    for (const pocket of this.pockets) {
      if (Math.hypot(x - pocket.x, z - pocket.z) <= pocket.radius) return pocket;
    }
    return null;
  }

  /** Every armed object this body is currently inside. */
  objectsAt(x, z, radius = 0) {
    const hits = [];
    for (const object of this.objects) {
      if (!object.armed) continue;
      if (object.kind === 'gate') {
        if (
          Math.abs(x - object.x) < object.hw + radius &&
          Math.abs(z - object.z) < object.hh + radius
        ) {
          hits.push(object);
        }
      } else if (Math.hypot(x - object.x, z - object.z) < object.radius + radius * 0.4) {
        hits.push(object);
      }
    }
    return hits;
  }

  /** Spend an object: it stops being live and visibly dims. */
  consume(object) {
    object.armed = false;
    if (object.rim) object.rim.material.opacity = 0.16;
    if (object.fill) object.fill.material.opacity = 0.03;
    if (object.postMaterial) object.postMaterial.emissiveIntensity = 0.25;
  }

  /** Gold rings come back every stroke; everything else stays spent. */
  rearmForStroke() {
    for (const object of this.objects) {
      if (object.kind !== 'gold' || object.armed) continue;
      object.armed = true;
      if (object.rim) object.rim.material.opacity = 0.85;
      if (object.fill) object.fill.material.opacity = 0.13;
    }
  }

  /** Is this point clear of every pocket and object? Used when racking. */
  blocked(x, z, radius = 0) {
    for (const pocket of this.pockets) {
      if (Math.hypot(x - pocket.x, z - pocket.z) < pocket.radius + radius + 0.6) return true;
    }
    for (const object of this.objects) {
      if (object.kind === 'gate') {
        if (
          Math.abs(x - object.x) < object.hw + radius + 0.4 &&
          Math.abs(z - object.z) < object.hh + radius + 0.8
        ) {
          return true;
        }
      } else if (Math.hypot(x - object.x, z - object.z) < object.radius + radius + 0.5) {
        return true;
      }
    }
    return false;
  }

  /** Idle shimmer, so a live table never looks like a screenshot. */
  update(dt) {
    for (const pocket of this.pockets) {
      pocket.pulse += dt * 1.7;
      if (pocket.halo) pocket.halo.material.opacity = 0.08 + Math.sin(pocket.pulse) * 0.035;
    }
    for (const object of this.objects) {
      if (!object.armed || !object.meshes) continue;
      object.pulse += dt * 2.4;
      const s = 1 + Math.sin(object.pulse) * 0.045;
      object.meshes.scale.set(s, 1, s);
    }
  }

  dispose() {
    this.clear();
    this.parent.remove(this.group);
  }
}

/** How much a live pocket kicks a ball back out at. */
export const KICKBACK_SPEED = 26;

export default Table;
