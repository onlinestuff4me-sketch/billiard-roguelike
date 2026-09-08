/**
 * Table.js — pockets and the lit objects on the felt.
 *
 * The one rule the whole redesign turns on lives here: a ball is never
 * destroyed by being hit, only by being driven into a target. So this file
 * owns every way a ball can leave the table, and nothing else may remove one.
 *
 * POCKETS ARE ARCHITECTURE, so they are not built here — `buildTable()` in
 * main.js draws them once, into the static table, with the frame swelling
 * around each mouth and the cushions breaking into it. All six are identical,
 * in the same six places, every room. This file keeps only the capture data.
 *
 * FELT OBJECTS are the opposite: rolled per room, and the only things on the
 * table allowed to carry a semantic colour. One form — a dashed outline
 * around a hollow interior — and two meanings. Mint is a pick-up you want to
 * hit; red is a hazard to route around. The glyph says which.
 */

import * as THREE from 'three';
import { ARENA, PALETTE, TABLE } from '../config.js';

/** Pick-ups pay you. Hazards charge you. Nothing is in both lists. */
export const PICKUPS = Object.keys(TABLE.object.pickups);
export const HAZARDS = Object.keys(TABLE.object.hazards);

export const isPickup = (kind) => PICKUPS.includes(kind);

/** Plain-English name, in the same words the lesson cards use. */
export function objectLabel(kind) {
  return TABLE.object.pickups[kind]?.label || TABLE.object.hazards[kind]?.label || kind;
}

/**
 * The six fixed pocket positions, corners first then sides. Constant for the
 * whole game: a pocket the player has to go looking for is not architecture.
 */
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

/* ------------------------------------------------------------------ *
 * Glyphs
 *
 * Drawn to a canvas and worn as a camera-facing sprite, the same way ball
 * numbers are. Two rules from the design system hold here: the glyph never
 * scales with the shape it sits in, and every one is a single closed
 * silhouette with no detail finer than a tenth of its width — these are about
 * 40 screen pixels on a phone, over a bloomed table.
 * ------------------------------------------------------------------ */

const GLYPHS = new Map();

function glyphTexture(kind, hex) {
  const key = `${kind}:${hex}`;
  if (GLYPHS.has(key)) return GLYPHS.get(key);
  const size = 128;
  const c = size / 2;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = hex;
  ctx.fillStyle = hex;
  ctx.lineWidth = size * 0.09;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const k = size * 0.27;

  if (kind === 'double') {
    ctx.font = `700 ${size * 0.72}px Rajdhani, "Segoe UI", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('×2', c, c + size * 0.03);
  } else if (kind === 'freeze') {
    ctx.beginPath();
    ctx.moveTo(c, c - k); ctx.lineTo(c + k, c); ctx.lineTo(c, c + k); ctx.lineTo(c - k, c);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    const j = k * 0.46;
    ctx.moveTo(c, c - j); ctx.lineTo(c + j, c); ctx.lineTo(c, c + j); ctx.lineTo(c - j, c);
    ctx.closePath(); ctx.fill();
  } else if (kind === 'upgrade') {
    for (const dy of [-k * 0.34, k * 0.24]) {
      ctx.beginPath();
      ctx.moveTo(c - k, c + dy + k * 0.34);
      ctx.lineTo(c, c + dy - k * 0.36);
      ctx.lineTo(c + k, c + dy + k * 0.34);
      ctx.stroke();
    }
  } else if (kind === 'shot') {
    ctx.fillRect(c - k * 0.72, c - k, size * 0.1, k * 2);
    ctx.beginPath();
    ctx.moveTo(c + k * 0.16, c); ctx.lineTo(c + k * 0.95, c);
    ctx.moveTo(c + k * 0.56, c - k * 0.4); ctx.lineTo(c + k * 0.56, c + k * 0.4);
    ctx.stroke();
  } else if (kind === 'mine') {
    // A warning triangle: the only pointed silhouette on the felt.
    ctx.beginPath();
    ctx.moveTo(c, c - k * 1.08); ctx.lineTo(c + k, c + k * 0.74); ctx.lineTo(c - k, c + k * 0.74);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(c, c - k * 0.3); ctx.lineTo(c, c + k * 0.18);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(c, c + k * 0.46, size * 0.035, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'kicker') {
    ctx.beginPath();
    ctx.moveTo(c + k * 0.72, c - k); ctx.lineTo(c - k * 0.82, c); ctx.lineTo(c + k * 0.72, c + k);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(c + k * 0.98, c - k * 0.9); ctx.lineTo(c + k * 0.98, c + k * 0.9);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  GLYPHS.set(key, texture);
  return texture;
}

const hexOf = (value) => `#${value.toString(16).padStart(6, '0')}`;

/* ------------------------------------------------------------------ *
 * Table
 * ------------------------------------------------------------------ */

export class Table {
  /** @param {THREE.Group} parent the room group meshes are added to */
  constructor(parent) {
    this.parent = parent;
    this.group = new THREE.Group();
    this.group.name = 'table-objects';
    parent.add(this.group);

    /** Capture data only. The meshes live in the static table. */
    this.pockets = pocketSlots().map((slot) => ({
      ...slot,
      radius: slot.radius ?? TABLE.pocket.radius
    }));
    /** @type {Array<object>} */
    this.objects = [];
  }

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
    this.objects = [];
  }

  /* ---------------------------------------------------------------- *
   * Felt objects
   * ---------------------------------------------------------------- */

  addObject(kind, x, z, opts = {}) {
    const good = isPickup(kind);
    if (!good && !TABLE.object.hazards[kind]) return null;
    const object = {
      kind,
      good,
      label: objectLabel(kind),
      x,
      z,
      radius: opts.radius ?? TABLE.object.radius,
      color: good ? PALETTE.good : PALETTE.bad,
      armed: true,
      pulse: Math.random() * Math.PI * 2,
      ...opts
    };
    object.meshes = this._buildMesh(object);
    this.objects.push(object);
    return object;
  }

  /**
   * A dashed ring around nothing. The dash is what says "you pass through
   * this"; the hollow interior is what stops it reading as a wall. Neither is
   * decoration — they are the family markers, so both survive at any size.
   */
  _buildMesh(object) {
    const group = new THREE.Group();
    group.position.set(object.x, 0, object.z);
    const hex = hexOf(object.color);
    const r = object.radius;

    const ringMat = new THREE.MeshBasicMaterial({
      color: object.color,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const segments = 8;
    const arc = (Math.PI * 2) / segments;
    for (let i = 0; i < segments; i++) {
      const dash = new THREE.Mesh(
        new THREE.RingGeometry(r * 0.9, r, 8, 1, i * arc, arc * 0.58),
        ringMat
      );
      dash.rotation.x = -Math.PI / 2;
      dash.position.y = 0.14;
      group.add(dash);
    }
    object.ringMaterial = ringMat;

    // The 8% tint. Enough to read as an area, never enough to read as a fill.
    const tint = new THREE.Mesh(
      new THREE.CircleGeometry(r * 0.9, 28),
      new THREE.MeshBasicMaterial({
        color: object.color,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    tint.rotation.x = -Math.PI / 2;
    tint.position.y = 0.13;
    group.add(tint);
    object.tintMaterial = tint.material;

    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glyphTexture(object.kind, hex),
        transparent: true,
        depthWrite: false
      })
    );
    // Deliberately wider than the ring: at this camera scale a glyph confined
    // to the outline is about ten pixels tall on a phone.
    const s = r * 1.75;
    sprite.scale.set(s, s, s);
    sprite.position.set(0, 0.5, 0);
    group.add(sprite);
    object.sprite = sprite;

    this.group.add(group);
    return group;
  }

  /* ---------------------------------------------------------------- *
   * Tests
   * ---------------------------------------------------------------- */

  /**
   * Has this body dropped? Capture is on the CENTRE, so a ball has to reach
   * the pocket rather than brush past it — and the drawn mouth is wider than
   * this, so anything that looks in, is in.
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
      if (Math.hypot(x - object.x, z - object.z) < object.radius + radius * 0.4) hits.push(object);
    }
    return hits;
  }

  /** Spend an object: it stops being live and visibly dims. */
  consume(object) {
    object.armed = false;
    if (object.ringMaterial) object.ringMaterial.opacity = 0.14;
    if (object.tintMaterial) object.tintMaterial.opacity = 0.02;
    if (object.sprite) object.sprite.material.opacity = 0.2;
  }

  /** The double comes back every stroke. Everything else stays spent. */
  rearmForStroke() {
    for (const object of this.objects) {
      if (object.kind !== 'double' || object.armed) continue;
      object.armed = true;
      if (object.ringMaterial) object.ringMaterial.opacity = 0.95;
      if (object.tintMaterial) object.tintMaterial.opacity = 0.08;
      if (object.sprite) object.sprite.material.opacity = 1;
    }
  }

  /** Is this point clear of every pocket and object? Used when racking. */
  blocked(x, z, radius = 0) {
    for (const pocket of this.pockets) {
      if (Math.hypot(x - pocket.x, z - pocket.z) < pocket.radius + radius + 1.1) return true;
    }
    for (const object of this.objects) {
      if (Math.hypot(x - object.x, z - object.z) < object.radius + radius + 0.6) return true;
    }
    return false;
  }

  /** Idle shimmer, so a live table never looks like a screenshot. */
  update(dt) {
    for (const object of this.objects) {
      if (!object.armed || !object.meshes) continue;
      object.pulse += dt * 2.2;
      const s = 1 + Math.sin(object.pulse) * 0.05;
      object.meshes.scale.set(s, 1, s);
    }
  }

  dispose() {
    this.clear();
    this.parent.remove(this.group);
  }
}

/** How fast a kicker sends a ball back at you. */
export const KICKBACK_SPEED = 26;

export default Table;
