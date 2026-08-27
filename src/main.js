/**
 * main.js — application bootstrap and orchestrator.
 *
 * Responsibilities:
 *  - Size the fixed 9:16 portrait stage and keep the renderer in sync.
 *  - Build the static table and the bloom composer.
 *  - Own the frame loop and the real-time / scaled-time split.
 *  - Own world-space FX: particle pool, shockwave rings, zaps, floating text.
 *  - Resolve combat rules: chain multipliers, the damage model, boon dispatch,
 *    and every feedback beat (hit-stop, shake, audio, text).
 *  - Drive the run state machine: playing → cleared → modal → next room.
 *
 * PhysicsSystem detects collisions and hands them here through `game.on.*`;
 * this file decides what they *mean*. Systems never talk to each other
 * directly — everything moves through the shared `game` context.
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import {
  ARENA,
  PALETTE,
  RENDER,
  TIME,
  TRAJECTORY,
  FOCUS,
  PLAYER,
  PHYSICS,
  CHAIN,
  ENEMY,
  FEEL,
  BOONS,
  INJECTOR,
  RULES,
  TABLE,
  TUTORIAL,
  PROGRESSION
} from './config.js';
import { Engine } from './core/Engine.js';
import { InputManager } from './core/InputManager.js';
import { AudioManager } from './core/AudioManager.js';
import { Player, PLAYER_STATE } from './entities/Player.js';
import { PhysicsSystem } from './systems/PhysicsSystem.js';
import { BoonSystem } from './systems/BoonSystem.js';
import { RoomManager } from './systems/RoomManager.js';
import { Rules } from './systems/Rules.js';
import { KICKBACK_SPEED, pocketSlots } from './systems/Table.js';
import { HUD } from './ui/HUD.js';
import { BoonModal } from './ui/BoonModal.js';
import { ENEMY_STATE } from './entities/Enemy.js';
import { Tutorial } from './systems/Tutorial.js';

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

/* ------------------------------------------------------------------ *
 * Stage sizing — a hard 9:16 portrait box, centered in the viewport.
 * ------------------------------------------------------------------ */

const stage = document.getElementById('stage');
const canvas = document.getElementById('stage-canvas');
const uiLayer = document.getElementById('ui-layer');
const bootVeil = document.getElementById('boot-veil');

function layoutStage() {
  const vw = window.innerWidth;
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  let h = vh;
  let w = h * ARENA.aspect;
  if (w > vw) {
    w = vw;
    h = w / ARENA.aspect;
  }
  stage.style.width = `${Math.round(w)}px`;
  stage.style.height = `${Math.round(h)}px`;
  return { width: Math.round(w), height: Math.round(h) };
}

/* ------------------------------------------------------------------ *
 * Renderer / scene / camera
 * ------------------------------------------------------------------ */

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance'
});
renderer.setClearColor(PALETTE.obsidian, 1);
renderer.toneMapping = THREE.NoToneMapping;

const scene = new THREE.Scene();
scene.background = new THREE.Color(PALETTE.obsidian);

const viewHeight = RENDER.viewHeight;
const viewWidth = viewHeight * ARENA.aspect;
const camera = new THREE.OrthographicCamera(
  -viewWidth / 2,
  viewWidth / 2,
  viewHeight / 2,
  -viewHeight / 2,
  0.1,
  400
);
// Top-down: +X is screen-right, -Z is screen-up.
camera.position.set(0, RENDER.cameraHeight, 0);
camera.up.set(0, 0, -1);
camera.lookAt(0, 0, 0);
scene.add(camera);

/* ------------------------------------------------------------------ *
 * Post-processing
 * ------------------------------------------------------------------ */

function bloomAllowed() {
  if (!RENDER.bloom.enabled) return false;
  const cores = navigator.hardwareConcurrency || 4;
  return cores >= RENDER.bloom.minHardwareConcurrency;
}

let composer = null;

function buildComposer(width, height) {
  if (!bloomAllowed()) return;
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(
    new UnrealBloomPass(
      new THREE.Vector2(width, height),
      RENDER.bloom.strength,
      RENDER.bloom.radius,
      RENDER.bloom.threshold
    )
  );
  composer.addPass(new OutputPass());
}

/* ------------------------------------------------------------------ *
 * Static table geometry
 * ------------------------------------------------------------------ */

/**
 * The table, as architecture.
 *
 * Pockets are not drawn on the felt — they are cut into it. The frame is one
 * continuous band that SWELLS into a full circle at each pocket, and the
 * cushions BREAK, their ends splaying open into the mouth, exactly as a real
 * table's jaws do. All of it is static: identical in every room, built once,
 * and drawn only in the table's own materials so it can never compete with a
 * mint pick-up or a red hazard for the player's glance.
 *
 * The drawn mouth is deliberately wider than the capture radius the physics
 * uses. A ball that looks like it is going in, goes in — the visual promise
 * has to be more generous than the rule, never less.
 */
/**
 * Live handles on each pocket's "called" ring, so a contract or a lesson can
 * point at one. Brightness is the only channel a pocket has.
 */
const calledRings = [];

/** Light one pocket by slot id, or none. */
let calledSlot = null;
function callPocket(slotId) {
  calledSlot = slotId || null;
  for (const entry of calledRings) {
    entry.material.opacity = entry.slot === calledSlot ? 1 : 0;
  }
}

/**
 * The called pocket breathes. Six identical mouths is exactly the point of the
 * architecture, so the one being pointed at has to move to be found — a static
 * brightness step reads as a lighting accident at this scale.
 */
function pulseCalledPocket(rawDt) {
  if (!calledSlot) return;
  calledPulse += rawDt * 3.4;
  const glow = 0.62 + Math.sin(calledPulse) * 0.38;
  for (const entry of calledRings) {
    if (entry.slot === calledSlot) entry.material.opacity = glow;
  }
}
let calledPulse = 0;

function buildTable(target) {
  const table = new THREE.Group();
  table.name = 'table';

  const felt = new THREE.Mesh(
    new THREE.PlaneGeometry(ARENA.width, ARENA.height),
    new THREE.MeshStandardMaterial({ color: PALETTE.felt, roughness: 0.95, metalness: 0.0 })
  );
  felt.rotation.x = -Math.PI / 2;
  felt.position.y = -0.02;
  table.add(felt);

  const vignette = new THREE.Mesh(
    new THREE.PlaneGeometry(ARENA.width * 1.02, ARENA.height * 1.02),
    new THREE.MeshBasicMaterial({ color: PALETTE.feltDeep })
  );
  vignette.rotation.x = -Math.PI / 2;
  vignette.position.y = -0.06;
  table.add(vignette);

  const gridPoints = [];
  const cols = 6;
  const rows = 10;
  for (let i = 1; i < cols; i++) {
    const x = -ARENA.halfW + (ARENA.width * i) / cols;
    gridPoints.push(x, 0.01, -ARENA.halfH, x, 0.01, ARENA.halfH);
  }
  for (let j = 1; j < rows; j++) {
    const z = -ARENA.halfH + (ARENA.height * j) / rows;
    gridPoints.push(-ARENA.halfW, 0.01, z, ARENA.halfW, 0.01, z);
  }
  const gridGeo = new THREE.BufferGeometry();
  gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPoints, 3));
  table.add(
    new THREE.LineSegments(
      gridGeo,
      new THREE.LineBasicMaterial({ color: PALETTE.feltLine, transparent: true, opacity: 0.28 })
    )
  );

  const slots = pocketSlots();
  const frameT = ARENA.railThickness * 2.1;
  const cushT = ARENA.railThickness;

  /* -- the frame: one continuous band, swelling at every pocket ------- */
  const frameMat = new THREE.MeshStandardMaterial({
    color: PALETTE.frame,
    roughness: 0.65,
    metalness: 0.3,
    emissive: new THREE.Color(PALETTE.lip),
    emissiveIntensity: 0.1
  });
  const frameSpecs = [
    { w: ARENA.width + frameT * 2, d: frameT, x: 0, z: -ARENA.halfH - frameT / 2 },
    { w: ARENA.width + frameT * 2, d: frameT, x: 0, z: ARENA.halfH + frameT / 2 },
    { w: frameT, d: ARENA.height, x: -ARENA.halfW - frameT / 2, z: 0 },
    { w: frameT, d: ARENA.height, x: ARENA.halfW + frameT / 2, z: 0 }
  ];
  for (const spec of frameSpecs) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(spec.w, 0.5, spec.d), frameMat);
    band.position.set(spec.x, 0.2, spec.z);
    table.add(band);
  }

  /* -- cushions: broken runs whose ends splay into the mouths --------- */
  const cushMat = new THREE.MeshStandardMaterial({
    color: PALETTE.cushion,
    roughness: 0.5,
    metalness: 0.25,
    emissive: new THREE.Color(PALETTE.lip),
    emissiveIntensity: 0.62
  });

  /**
   * A cushion run as an extruded trapezoid. `quad` is four world-space
   * (x, z) corners; the outer pair are longer than the inner pair, which is
   * what makes the end flare open toward the pocket.
   */
  const cushion = (quad, height = 0.72) => {
    const shape = new THREE.Shape();
    shape.moveTo(quad[0][0], -quad[0][1]);
    for (let i = 1; i < quad.length; i++) shape.lineTo(quad[i][0], -quad[i][1]);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    return new THREE.Mesh(geo, cushMat);
  };

  const mouth = (slot) => (slot.radius ?? TABLE.pocket.radius) * TABLE.pocket.mouthScale;
  const jawOf = (slot) => mouth(slot) * TABLE.pocket.jaw;
  const [tl, tr, ml, mr, bl, br] = slots;
  const gapX = (a) => mouth(a) + jawOf(a);
  const W = ARENA.halfW;
  const H = ARENA.halfH;

  // Long rails (left and right) are interrupted by the side pockets, so each
  // becomes two runs; the short rails are one run each.
  const runs = [
    // top
    [[tl.x + gapX(tl), -H], [tr.x - gapX(tr), -H], [tr.x - gapX(tr) - jawOf(tr), -H + cushT], [tl.x + gapX(tl) + jawOf(tl), -H + cushT]],
    // bottom
    [[bl.x + gapX(bl), H], [bl.x + gapX(bl) + jawOf(bl), H - cushT], [br.x - gapX(br) - jawOf(br), H - cushT], [br.x - gapX(br), H]],
    // left, above and below the side pocket
    [[-W, -H + gapX(tl)], [-W + cushT, -H + gapX(tl) + jawOf(tl)], [-W + cushT, ml.z - gapX(ml) - jawOf(ml)], [-W, ml.z - gapX(ml)]],
    [[-W, ml.z + gapX(ml)], [-W + cushT, ml.z + gapX(ml) + jawOf(ml)], [-W + cushT, H - gapX(bl) - jawOf(bl)], [-W, H - gapX(bl)]],
    // right, likewise
    [[W, -H + gapX(tr)], [W, mr.z - gapX(mr)], [W - cushT, mr.z - gapX(mr) - jawOf(mr)], [W - cushT, -H + gapX(tr) + jawOf(tr)]],
    [[W, mr.z + gapX(mr)], [W, H - gapX(br)], [W - cushT, H - gapX(br) - jawOf(br)], [W - cushT, mr.z + gapX(mr) + jawOf(mr)]]
  ];
  for (const quad of runs) table.add(cushion(quad));

  /* -- the pockets themselves ----------------------------------------- *
   *
   * ONE ARC, ONE ORIENTATION, SIX POCKETS.
   *
   * Drawn as a full circle these were being cropped by whatever happened to
   * sit over them — a corner pocket overlapped two frame bands, a side pocket
   * one — so every mouth had a different bite taken out of it and none of it
   * meant anything. The arc is authored now: 300 degrees, with the 60-degree
   * gap always facing the middle of the table. That is the throat the ball
   * comes in through, so the opening points at where the ball comes from, and
   * every pocket reads identically wherever it sits.
   *
   * The whole assembly is lifted above the cushions so nothing can crop it.
   * The camera looks straight down, so height is only draw order; the inset
   * read comes from the void and the arc, not from depth.
   */
  const lip = new THREE.Color(PALETTE.lip);
  const bright = new THREE.Color(PALETTE.aim);
  const GAP = Math.PI / 3;           // 60 degrees of opening
  const SWEEP = Math.PI * 2 - GAP;   // 300 degrees of rim

  for (const slot of slots) {
    const m = mouth(slot);

    // The gap faces the centre of the table. atan2 is taken in the same frame
    // RingGeometry uses (theta from +x, counter-clockwise in XY before the
    // -90° rotation puts it flat), which is why z is negated here.
    const toCentre = Math.atan2(-(0 - slot.z), 0 - slot.x);
    const start = toCentre + GAP / 2;

    const swell = new THREE.Mesh(
      new THREE.CircleGeometry(m + frameT * TABLE.pocket.swell, 44),
      frameMat
    );
    swell.rotation.x = -Math.PI / 2;
    swell.position.set(slot.x, 0.78, slot.z);
    table.add(swell);

    // The void. Absence reads faster than any colour.
    const hole = new THREE.Mesh(
      new THREE.CircleGeometry(m, 40),
      new THREE.MeshBasicMaterial({ color: PALETTE.void })
    );
    hole.rotation.x = -Math.PI / 2;
    hole.position.set(slot.x, 0.82, slot.z);
    table.add(hole);

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(m * 1.02, m * 1.44, 44, 1, start, SWEEP),
      new THREE.MeshBasicMaterial({
        color: lip,
        transparent: true,
        opacity: 0.24,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.set(slot.x, 0.84, slot.z);
    table.add(halo);

    // The lit mouth, in the pale end of the table's own teal: a pocket has to
    // pull the eye, and the frame it sits in is deliberately dark.
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(m * 0.95, m * 1.05, 48, 1, start, SWEEP),
      new THREE.MeshBasicMaterial({
        color: bright,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(slot.x, 0.86, slot.z);
    table.add(ring);

    // The called state: the contract names this pocket. Brightness and nothing
    // else — no hue, because hue belongs to the felt objects.
    const called = new THREE.Mesh(
      new THREE.RingGeometry(m * 0.86, m * 1.2, 48, 1, start, SWEEP),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(PALETTE.bone),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );
    called.rotation.x = -Math.PI / 2;
    called.position.set(slot.x, 0.88, slot.z);
    table.add(called);
    calledRings.push({ slot: slot.slot, x: slot.x, z: slot.z, material: called.material });
  }

  target.add(table);
  return table;
}

function buildLights(target) {
  // Deliberately dim: the felt should sit well below the bloom threshold so
  // only emissive objects glow. Everything readable is emissive, not lit.
  target.add(new THREE.AmbientLight(0x22414d, 0.85));
  const key = new THREE.DirectionalLight(0xbfefff, 0.8);
  key.position.set(6, 24, -10);
  target.add(key);
  const rimA = new THREE.PointLight(PALETTE.player, 12, 34, 2);
  rimA.position.set(-7, 9, 12);
  target.add(rimA);
  const rimB = new THREE.PointLight(PALETTE.solid, 9, 34, 2);
  rimB.position.set(7, 9, -12);
  target.add(rimB);
}

buildLights(scene);
buildTable(scene);

/* ------------------------------------------------------------------ *
 * FX — particle pool, shockwave rings, zaps, floating text
 * ------------------------------------------------------------------ */

function createFX() {
  const max = FEEL.particles.max;
  const positions = new Float32Array(max * 3);
  const colors = new Float32Array(max * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const points = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      size: 0.26,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    })
  );
  points.frustumCulled = false;
  points.renderOrder = 4;
  scene.add(points);

  const parts = [];
  for (let i = 0; i < max; i++) {
    parts.push({ x: 0, z: 0, vx: 0, vz: 0, life: 0, maxLife: 1, r: 0, g: 0, b: 0, drag: 2.4 });
    positions[i * 3 + 1] = 0.45;
  }
  let cursor = 0;

  // --- shockwave ring pool ---
  const RING_COUNT = 10;
  const rings = [];
  const ringGeo = new THREE.RingGeometry(0.86, 1.0, 40);
  for (let i = 0; i < RING_COUNT; i++) {
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(ringGeo, ringMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.09;
    mesh.visible = false;
    mesh.renderOrder = 4;
    scene.add(mesh);
    rings.push({ mesh, mat: ringMat, life: 0, maxLife: 1, maxRadius: 3 });
  }
  let ringCursor = 0;

  // --- zap pool (Chain Arc) ---
  const ZAP_COUNT = 14;
  const zapPositions = new Float32Array(ZAP_COUNT * 6);
  const zapColors = new Float32Array(ZAP_COUNT * 6);
  const zapGeo = new THREE.BufferGeometry();
  zapGeo.setAttribute('position', new THREE.BufferAttribute(zapPositions, 3));
  zapGeo.setAttribute('color', new THREE.BufferAttribute(zapColors, 3));
  const zaps = new THREE.LineSegments(
    zapGeo,
    new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  zaps.frustumCulled = false;
  zaps.renderOrder = 4;
  scene.add(zaps);
  const zapSlots = [];
  for (let i = 0; i < ZAP_COUNT; i++) zapSlots.push({ life: 0, maxLife: 0.2, r: 0, g: 0, b: 0 });
  let zapCursor = 0;

  const texts = [];
  const scratch = new THREE.Vector3();
  const scratchColor = new THREE.Color();

  return {
    burst(x, z, count, color, speed, lifeScale = 1) {
      scratchColor.set(color);
      for (let i = 0; i < count; i++) {
        const p = parts[cursor];
        cursor = (cursor + 1) % max;
        const a = Math.random() * Math.PI * 2;
        const s = speed * (0.25 + Math.random() * 0.95);
        p.x = x;
        p.z = z;
        p.vx = Math.cos(a) * s;
        p.vz = Math.sin(a) * s;
        p.maxLife = FEEL.particles.sparkLife * lifeScale * (0.6 + Math.random() * 0.8);
        p.life = p.maxLife;
        p.drag = 2.4 + Math.random() * 2;
        p.r = scratchColor.r;
        p.g = scratchColor.g;
        p.b = scratchColor.b;
      }
    },

    /** Directional spray biased along a normal — used for wall-splats. */
    spray(x, z, count, color, speed, nx, nz) {
      scratchColor.set(color);
      const base = Math.atan2(nz, nx);
      for (let i = 0; i < count; i++) {
        const p = parts[cursor];
        cursor = (cursor + 1) % max;
        const a = base + (Math.random() - 0.5) * Math.PI;
        const s = speed * (0.3 + Math.random());
        p.x = x;
        p.z = z;
        p.vx = Math.cos(a) * s;
        p.vz = Math.sin(a) * s;
        p.maxLife = FEEL.particles.shatterLife * (0.6 + Math.random() * 0.8);
        p.life = p.maxLife;
        p.drag = 1.6 + Math.random() * 1.6;
        p.r = scratchColor.r;
        p.g = scratchColor.g;
        p.b = scratchColor.b;
      }
    },

    shockwave(x, z, color, maxRadius = 3, life = 0.42) {
      const r = rings[ringCursor];
      ringCursor = (ringCursor + 1) % RING_COUNT;
      r.mesh.position.set(x, 0.09, z);
      r.mat.color.set(color);
      r.life = life;
      r.maxLife = life;
      r.maxRadius = maxRadius;
      r.mesh.visible = true;
    },

    zap(x1, z1, x2, z2, color, life = 0.22) {
      const slot = zapSlots[zapCursor];
      const o = zapCursor * 6;
      zapCursor = (zapCursor + 1) % ZAP_COUNT;
      zapPositions[o] = x1;
      zapPositions[o + 1] = 0.5;
      zapPositions[o + 2] = z1;
      zapPositions[o + 3] = x2;
      zapPositions[o + 4] = 0.5;
      zapPositions[o + 5] = z2;
      scratchColor.set(color);
      slot.r = scratchColor.r;
      slot.g = scratchColor.g;
      slot.b = scratchColor.b;
      slot.life = life;
      slot.maxLife = life;
      zapGeo.attributes.position.needsUpdate = true;
    },

    floatText(x, z, text, kind = '') {
      if (texts.length >= 16) return;
      const node = document.createElement('div');
      node.className = kind ? `float-text ${kind}` : 'float-text';
      node.textContent = text;
      uiLayer.appendChild(node);
      texts.push({ el: node, x, z, life: FEEL.floatText.life, maxLife: FEEL.floatText.life });
    },

    clearTexts() {
      for (const t of texts) t.el.remove();
      texts.length = 0;
    },

    update(dt, rawDt) {
      // Particles run on scaled time so slow-mo also slows the sparks.
      for (let i = 0; i < max; i++) {
        const p = parts[i];
        const o = i * 3;
        if (p.life <= 0) {
          colors[o] = 0;
          colors[o + 1] = 0;
          colors[o + 2] = 0;
          continue;
        }
        p.life -= dt;
        const damp = Math.exp(-p.drag * dt);
        p.vx *= damp;
        p.vz *= damp;
        p.x += p.vx * dt;
        p.z += p.vz * dt;
        const fade = Math.max(p.life / p.maxLife, 0);
        positions[o] = p.x;
        positions[o + 2] = p.z;
        colors[o] = p.r * fade;
        colors[o + 1] = p.g * fade;
        colors[o + 2] = p.b * fade;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;

      for (const r of rings) {
        if (r.life <= 0) {
          if (r.mesh.visible) r.mesh.visible = false;
          continue;
        }
        r.life -= dt;
        const t = 1 - Math.max(r.life, 0) / r.maxLife;
        r.mesh.scale.setScalar(0.3 + t * r.maxRadius);
        r.mat.opacity = (1 - t) * 0.8;
        if (r.life <= 0) r.mesh.visible = false;
      }

      for (let i = 0; i < ZAP_COUNT; i++) {
        const slot = zapSlots[i];
        const o = i * 6;
        if (slot.life <= 0) {
          zapColors[o] = 0;
          zapColors[o + 1] = 0;
          zapColors[o + 2] = 0;
          zapColors[o + 3] = 0;
          zapColors[o + 4] = 0;
          zapColors[o + 5] = 0;
          continue;
        }
        slot.life -= dt;
        const fade = Math.max(slot.life / slot.maxLife, 0);
        zapColors[o] = slot.r * fade;
        zapColors[o + 1] = slot.g * fade;
        zapColors[o + 2] = slot.b * fade;
        zapColors[o + 3] = zapColors[o];
        zapColors[o + 4] = zapColors[o + 1];
        zapColors[o + 5] = zapColors[o + 2];
      }
      zapGeo.attributes.color.needsUpdate = true;

      // Floating text runs on real time so hit-stop never stalls the read.
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      for (let i = texts.length - 1; i >= 0; i--) {
        const t = texts[i];
        t.life -= rawDt;
        if (t.life <= 0) {
          t.el.remove();
          texts.splice(i, 1);
          continue;
        }
        const progress = 1 - t.life / t.maxLife;
        scratch.set(t.x, 0.7, t.z).project(camera);
        // A pot or a scratch happens AT a pocket, and every pocket is in a
        // corner or hard against a rail — so the unclamped label runs off the
        // edge exactly when it matters most ("SCRATCH" read as "CRATCH").
        // Half the label's own width is the margin.
        const half = t.el.offsetWidth * 0.5 + 6;
        const px = clamp((scratch.x * 0.5 + 0.5) * w, half, w - half);
        const py = (-scratch.y * 0.5 + 0.5) * h - progress * FEEL.floatText.rise;
        t.el.style.transform = `translate(${px}px, ${py}px) translate(-50%, -50%) scale(${
          1 + (1 - progress) * 0.25
        })`;
        t.el.style.opacity = String(Math.min(1, (1 - progress) * 2.2));
      }
    }
  };
}

/* ------------------------------------------------------------------ *
 * Systems
 * ------------------------------------------------------------------ */

const reducedMotion =
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const engine = new Engine(camera, { reducedMotion });
const physics = new PhysicsSystem();
const audio = new AudioManager();
const player = new Player(scene);
const fx = createFX();
const hud = new HUD(uiLayer, { camera, stage });
const modal = new BoonModal(uiLayer);

/** The shared context every system reads from. */
const game = {
  scene,
  camera,
  engine,
  physics,
  audio,
  player,
  fx,
  hud,
  enemies: [],
  projectiles: [],
  zones: [],
  level: PROGRESSION.startRoom,
  running: false,
  /** 'playing' | 'cleared' | 'modal' | 'dead' */
  state: 'playing',
  /**
   * THE CLOCK.
   *
   * 'aim'     the table is frozen solid. Nothing integrates, nothing decides
   *           anything, the player has all the time in the world.
   * 'resolve' a stroke is running. Physics owns the table until it settles.
   *
   * A freeze flips 'resolve' back to 'aim' WITHOUT ending the stroke, which is
   * the whole trick: the multiplier, the bodies and their velocities all stay
   * exactly where they were.
   */
  phase: 'aim',
  /** True from the release that opens a stroke until the table settles. */
  midStroke: false,
  strokeTimer: 0,
  settleTimer: 0,
  /** Boon offers earned by potting into an upgrade pocket. */
  pendingBoons: 0,
  /** Extra strokes per room, won at a door. */
  strokeBonus: 0,
  chain: { count: 0, timer: 0, best: 0 },
  /** Hits landed during the current launch (drives Break Pulse). */
  launchHits: 0,
  /** Damage bonus granted by flying through an amplifier pyre. */
  pyreBonus: 0,
  hazardAccum: 0,
  deathTimer: 0,
  /** Contact damage is suppressed while this runs — see TUTORIAL.graceSeconds. */
  graceTimer: 0,
  on: {}
};

const boons = new BoonSystem(game);
game.boons = boons;

const rules = new Rules();
game.rules = rules;
game.callPocket = callPocket;
// A handle for the console and for automated smoke runs. Read-only in spirit:
// nothing in the game reads it back.
if (typeof window !== 'undefined') window.__game = game;

const rooms = new RoomManager(game, {
  onRoomClear: handleRoomClear,
  onDoorEntered: handleDoorEntered,
  onWaveSpawned: ({ index, total }) =>
    hud.showBanner('Wave', `${index + 1} of ${total}`, 1.1)
});
game.rooms = rooms;

/* ------------------------------------------------------------------ *
 * Combat rules
 * ------------------------------------------------------------------ */

const ENEMY_COLOR = {
  solid: PALETTE.solid,
  stripe: PALETTE.stripe,
  heavy: PALETTE.bone
};

/** Step the cascade multiplier and play its pentatonic note. */
/**
 * One step of the multiplier ladder, with the note that goes with it.
 *
 * Every rung — a bank, a ball touched, a ball down — routes through here, so
 * the escalating pentatonic run and the number on screen can never disagree
 * about how deep the stroke is.
 */
function ladder(kind) {
  if (!game.midStroke) return rules.multiplier;
  let value;
  if (kind === 'bank') value = rules.bank();
  else if (kind === 'gold') value = rules.gold();
  else value = rules.touch();
  game.chain.count += 1;
  game.chain.best = Math.max(game.chain.best, game.chain.count);
  audio.chainNote(game.chain.count - 1);
  return value;
}

/**
 * The one scoring phrase in the game: what the stroke is worth right now.
 * `×6  ·  1 BANK · 2 BALLS`
 */
function multCallout() {
  const parts = [];
  if (rules.banks) parts.push(`${rules.banks} BANK${rules.banks > 1 ? 'S' : ''}`);
  if (rules.ballsTouched) parts.push(`${rules.ballsTouched} BALL${rules.ballsTouched > 1 ? 'S' : ''}`);
  return parts.join(' · ');
}

/**
 * The moment the draw runs out.
 *
 * Power no longer decides whether anything breaks — nothing breaks from being
 * hit any more — so max power now means the one thing it still honestly means:
 * this is as far as the cue goes.
 */
let wasMaxed = false;

function noteAimPower(aim) {
  const maxed = (aim?.power ?? 0) >= 0.97;
  if (maxed && !wasMaxed) {
    const p = player;
    fx.shockwave(p.aimCue.x, p.aimCue.z, PALETTE.bone, 3.4, 0.3);
    fx.burst(p.aimCue.x, p.aimCue.z, 14, PALETTE.bone, 13, 0.6);
    fx.floatText(p.x, p.z + 1.9, 'MAX POWER', 'crit');
    engine.shake(5);
    audio.bumper?.();
  }
  wasMaxed = maxed;
}

function speedRatio(speed, lo = 0.35, hi = 2.2) {
  return clamp(speed / PLAYER.referenceSpeed, lo, hi);
}

/**
 * Take a ball off the table. This is the ONLY way a ball leaves, and it is
 * always because a target consumed it — never because something hit it hard
 * enough.
 */
function removeBall(ball) {
  // Idempotent: a pot removes the ball, and the lesson director may then score
  // the same ball. Two shatter bursts for one pot is a tell that the game does
  // not know what happened.
  if (!ball || !ball.alive) return;
  ball.alive = false;
  audio.enemyDeath();
  fx.burst(ball.x, ball.z, 20, ENEMY_COLOR[ball.type], 11, 1.5);
  fx.shockwave(ball.x, ball.z, ENEMY_COLOR[ball.type], ball.radius * 4.5, 0.36);
}

/**
 * Damage is still in the game, but it no longer decides what breaks — it only
 * decides how long the run lasts. Kept as a funnel so boons and hazards have
 * one door to come through.
 */
function dealDamage(enemy, amount, opts = {}) {
  if (!enemy || !enemy.alive) return { dealt: 0, killed: false };
  if (enemy.invulnerable) return { dealt: 0, killed: false, blocked: true };
  const result = enemy.takeDamage(amount, {
    ...opts,
    backstabBonus: player.stats.backstabBonus
  });
  if (!opts.silent && result.dealt > 0) {
    fx.burst(enemy.x, enemy.z, 4, ENEMY_COLOR[enemy.type], 5, 0.5);
  }
  if (result.killed) removeBall(enemy);
  return result;
}
game.dealDamage = dealDamage;

/**
 * Kill outright, bypassing the damage funnel. The lesson director is the only
 * thing allowed to use it, because it is the only thing that knows whether a
 * rep counted.
 */
game.forceKill = (enemy) => {
  if (!enemy || !enemy.alive) return;
  if (enemy.state === ENEMY_STATE.SPAWNING) {
    enemy.state = ENEMY_STATE.ACTIVE;
    enemy.spawnTimer = 0;
  }
  removeBall(enemy);
};
game.tutorialGuard = null;

/* ------------------------------------------------------------------ *
 * The stroke
 * ------------------------------------------------------------------ */

/** Is every body on the table at rest? */
function tableSettled() {
  if (player.alive && player.speed > RULES.settleSpeed) return false;
  for (const ball of game.enemies) {
    if (ball.alive && ball.speed > RULES.settleSpeed) return false;
  }
  return true;
}

/** Open a stroke: the ladder resets, the gold rings come back. */
function beginStroke() {
  game.midStroke = true;
  game.phase = 'resolve';
  game.strokeTimer = 0;
  game.settleTimer = 0;
  game.chain.count = 0;
  game.launchHits = 0;
  rules.beginStroke();
  rooms.table.rearmForStroke();
}

/** Resume a frozen stroke. Same stroke, same ladder — no reset, no cost. */
function resumeStroke() {
  game.phase = 'resolve';
  game.settleTimer = 0;
}

/**
 * The table has stopped. Bank what the stroke paid, spend one from the budget,
 * and ask the contract whether the room is over.
 */
function finishStroke() {
  game.midStroke = false;
  game.phase = 'aim';
  game.settleTimer = 0;

  // Shooting into a door is not a shot off the budget. The room is already decided; the
  // exit shot must not be able to bankrupt you.
  if (game.state === 'cleared') return;
  // Neither is a lesson rep. A tutorial with a budget is a tutorial you can
  // fail, and every board here is meant to be repeatable until it lands.
  if (game.tutorialGuard) {
    rules.resetStroke();
    rooms.table.rearmForStroke();
    return;
  }

  const summary = rules.endStroke();
  if (summary.voided) {
    fx.floatText(player.x, player.z - 2.4, `VOID −${summary.lost.toLocaleString()}`, 'splat');
  } else if (summary.paid > 0) {
    fx.floatText(player.x, player.z - 2.4, `+${summary.paid.toLocaleString()}`, 'crit');
  }

  if (rules.filled) {
    completeRoom();
  } else if (rules.strokesLeft <= 0) {
    failRoom();
  } else if (rules.strokesLeft === 1) {
    hud.showBanner('Last shot', `${rules.contract.rack - rules.ballsDown} still on the table`, 1.8);
  }
}

/**
 * Freeze: stop the table mid-stroke and re-aim from wherever the cue ball got
 * to. Costs a charge, never a stroke — and every other ball keeps the velocity
 * it had, so releasing again resumes exactly the shot you interrupted.
 */
function tryFreeze() {
  if (game.phase !== 'resolve' || !game.midStroke) return false;
  if (game.state === 'modal' || !player.alive) return false;
  if (!rules.spendFreeze()) {
    fx.floatText(player.x, player.z - 2.2, 'NO FREEZE', 'block');
    return false;
  }
  game.phase = 'aim';
  // The cue ball stops where it is; it is about to be re-aimed from here.
  player.vx = 0;
  player.vz = 0;
  player.endLaunch();
  input.setHeading(0, -1);
  engine.zoomPunch();
  engine.shake(4);
  audio.focusEnter?.();
  fx.shockwave(player.x, player.z, PALETTE.player, 7, 0.5);
  fx.floatText(player.x, player.z - 2.2, 'FREEZE', 'crit');
  hud.showBanner('Freeze', 'Re-aim — this does not cost a shot', 1.6);
  return true;
}
game.tryFreeze = tryFreeze;

/**
 * A live pocket pays double, then fires the ball straight back out at you.
 *
 * The ball is kept rather than replaced: it is marked spent — no number, no
 * value, no longer part of the contract — so it counts once, comes back as a
 * pure hazard, and can still carom into whatever is in its way. Which is the
 * risk you accepted when you chose that pocket.
 */
function kickBack(source) {
  // The kicker takes the nearest ball on the table and sends it at you. It
  // does not consume it — the ball is still worth its number if you can get it
  // down — but while it is travelling it is the one thing on a static table
  // that can hurt you.
  let target = null;
  let best = Infinity;
  for (const ball of game.enemies) {
    if (!ball.alive) continue;
    const d = Math.hypot(ball.x - source.x, ball.z - source.z);
    if (d < best) {
      best = d;
      target = ball;
    }
  }
  if (!target) return;

  const dx = player.x - target.x;
  const dz = player.z - target.z;
  const len = Math.hypot(dx, dz) || 1;
  target.applyKnock((dx / len) * KICKBACK_SPEED, (dz / len) * KICKBACK_SPEED);
  target.vx = (dx / len) * KICKBACK_SPEED;
  target.vz = (dz / len) * KICKBACK_SPEED;
  target.hostile = true;

  fx.shockwave(target.x, target.z, PALETTE.bad, 5, 0.45);
  fx.floatText(target.x, target.z, 'INCOMING', 'splat');
}

game.on = {
  /* --- the cue strike ------------------------------------------------ */
  /**
   * Contact, not damage.
   *
   * The cue ball no longer carries a damage number: hitting a ball moves it,
   * full stop. What the strike buys is a rung on the ladder and, if the line
   * was good, a ball on its way to a pocket. Returning an empty result is what
   * tells the physics layer to resolve a real two-body impulse rather than
   * passing through a corpse.
   */
  cueStrike({ player: p, enemy, x, z, speed, banked }) {
    game.launchHits += 1;

    // A ball fired back out of a live pocket is the one thing on a static
    // table that can still hurt you.
    if (enemy.hostile) {
      if (!game.tutorialGuard && speed > 8) p.takeDamage(RULES.damage.kickback, game, enemy);
      enemy.hostile = false;
    } else {
      ladder('touch');
    }

    tutorial.notify('hit', {
      enemy,
      banked,
      index: game.launchHits,
      bounces: p.bouncesUsed,
      killed: false
    });

    if (rules.multiplier > 1 && game.midStroke) {
      fx.floatText(p.x, p.z - 2.4, `×${rules.multiplier}  ${multCallout()}`, 'crit');
      fx.shockwave(x, z, PALETTE.good, 4.4 + game.launchHits * 0.5, 0.36);
    }

    engine.hitStop(TIME.hitStop);
    engine.shake(speed * enemy.mass * 0.9);
    audio.impact(clamp(speed / PLAYER.launchSpeed, 0, 1));
    fx.burst(x, z, 10, ENEMY_COLOR[enemy.type], speed * 0.45);

    boons.onImpact({ player: p, enemy, x, z, speed, banked, result: {} });
    return {};
  },

  /* --- ball into ball ------------------------------------------------- */
  carom({ striker, target, x, z, speed }) {
    tutorial.notify('pass', { striker, target, x, z, speed });
    ladder('touch');

    engine.hitStop(TIME.hitStopCrit);
    engine.shake(speed * 2.6);
    engine.zoomPunch();
    audio.carom();
    fx.floatText(x, z, `×${rules.multiplier}`, 'carom');
    fx.burst(x, z, 24, PALETTE.good, speed * 0.7, 1.2);
    fx.shockwave(x, z, PALETTE.good, 4.2, 0.45);

    boons.onImpact({ player, enemy: target, x, z, speed, banked: true, result: null });
  },

  /* --- a ball meeting a rail hard ------------------------------------ */
  /**
   * A wall-splat used to shatter the ball. It cannot any more — rails do not
   * destroy anything — so what is left is the sound and the shove, which is
   * exactly what a ball slamming a cushion should be.
   */
  wallSplat({ enemy, x, z, speed }) {
    audio.wallSplat();
    engine.hitStop(TIME.hitStop);
    engine.shake(speed * 1.4);
    fx.burst(x, z, 12, ENEMY_COLOR[enemy.type], speed * 0.4, 0.9);
  },

  enemyFired({ x, z, dirX, dirZ }) {
    fx.burst(x, z, 9, PALETTE.bad, 9, 0.34);
    fx.shockwave(x, z, PALETTE.bad, 1.5, 0.16);
    fx.burst(x + dirX * 0.5, z + dirZ * 0.5, 5, PALETTE.spark, 13, 0.22);
    engine.shake(1.6);
  },

  enemyRebound({ enemy, x, z, speed }) {
    if (speed < 6) return;
    fx.burst(x, z, 3, ENEMY_COLOR[enemy.type], speed * 0.25, 0.6);
  },

  /* --- pockets -------------------------------------------------------- */
  /**
   * A ball goes down. This is the whole game in one function.
   */
  potted({ ball, pocket }) {
    if (!ball.alive) return;

    // An unnumbered body is not part of the contract and pays nothing.
    if (ball.number <= 0) {
      removeBall(ball);
      return;
    }

    // The 8 down early under an "8 last" contract: a foul. It comes back and
    // the shot it happened on pays nothing.
    if (rules.isFoul(ball.number)) {
      rules.scratch();
      audio.playerHurt();
      engine.shake(9);
      fx.shockwave(pocket.x, pocket.z, PALETTE.bad, 6, 0.5);
      fx.floatText(ball.x, ball.z, 'THE 8 GOES LAST', 'splat');
      hud.showBanner('Too early', 'The 8 goes last — back on the table', 1.8);
      rooms.respot(ball);
      return;
    }

    const paid = rules.pot(ball.number);
    tutorial.notify('potted', { ball, pocket, paid, bounces: player.bouncesUsed });

    audio.chainNote(game.chain.count + 2);
    engine.hitStop(TIME.hitStopCrit);
    engine.zoomPunch();
    engine.shake(10);
    fx.shockwave(pocket.x, pocket.z, PALETTE.lip, 5.5, 0.5);
    fx.burst(pocket.x, pocket.z, 24, PALETTE.lip, 12, 1.1);
    fx.floatText(pocket.x, pocket.z, `+${paid.value.toLocaleString()}`, 'crit');

    removeBall(ball);
  },

  /** The cue ball down a pocket. The stroke pays nothing. */
  scratch({ player: p, pocket }) {
    if (!game.midStroke && game.state !== 'cleared') return;
    if (p.scratchGuard > 0) return;
    p.scratchGuard = 0.6;
    rules.scratch();
    audio.playerHurt();
    engine.shake(14);
    engine.zoomPunch();
    fx.shockwave(pocket.x, pocket.z, PALETTE.bad, 7, 0.55);
    fx.floatText(pocket.x, pocket.z, 'SCRATCH', 'splat');
    hud.showBanner('Scratch', 'Your own ball went in — this shot pays nothing', 1.9);
    // Back to the spot, at rest. The stroke ends here.
    p.vx = 0;
    p.vz = 0;
    p.placeAt(rooms.layout.spawn.x, spawnZ());
    tutorial.notify('scratch', { pocket });
  },

  /* --- the lit objects ------------------------------------------------ */
  /**
   * A pick-up or a hazard. One form, two meanings: mint helps you, red costs
   * you. Only the cue ball triggers them — an object ball rolling over a mine
   * would make routing unreadable, and half the point of the felt is that YOUR
   * ball's path is the thing you are choosing.
   */
  objectHit({ object, body, isCue }) {
    if (!object.armed || !isCue) return;
    rooms.table.consume(object);
    const colour = object.good ? PALETTE.good : PALETTE.bad;
    fx.shockwave(object.x, object.z, colour, 5, 0.42);
    fx.burst(object.x, object.z, 18, colour, 12, 0.9);
    tutorial.notify('object', { object });

    switch (object.kind) {
      case 'double': {
        const value = ladder('gold');
        audio.pyre?.();
        fx.floatText(object.x, object.z, `×${value}`, 'crit');
        return;
      }
      case 'freeze': {
        const charges = rules.grantFreeze();
        audio.boonPick?.();
        engine.zoomPunch();
        fx.floatText(object.x, object.z, `FREEZE ×${charges}`, 'crit');
        hud.showBanner('Freeze', 'Tap while the table is still moving', 2);
        return;
      }
      case 'upgrade': {
        game.pendingBoons += 1;
        audio.boonPick?.();
        fx.floatText(object.x, object.z, 'UPGRADE', 'crit');
        return;
      }
      case 'shot': {
        rules.strokesLeft += 1;
        audio.boonPick?.();
        fx.floatText(object.x, object.z, '+1 SHOT', 'crit');
        return;
      }
      case 'kicker': {
        audio.wallSplat();
        engine.shake(12);
        engine.zoomPunch();
        fx.floatText(object.x, object.z, 'KICKER', 'splat');
        kickBack(object);
        return;
      }
      case 'mine':
      default: {
        audio.wallSplat();
        engine.shake(14);
        engine.zoomPunch();
        if (!game.tutorialGuard) player.takeDamage(RULES.damage.mine, game, 'mine');
        fx.floatText(object.x, object.z, 'MINE', 'splat');
      }
    }
  },

  /* --- player events ------------------------------------------------- */
  playerRebound(event) {
    const { player: p, x, z, speed, kind } = event;
    audio.rebound(clamp(speed / PLAYER.launchSpeed, 0, 1));
    engine.shake(speed * 0.4);

    // EVERY RAIL IS A RUNG.
    //
    // Banking is the cheapest way to build a multiplier and the most skilful,
    // so it pays on contact rather than on some later condition. A dying kiss
    // does not count — but the bar sits just under the creep threshold, since
    // below that a ball is already being dragged to a stop and cannot ladder
    // its way up on cushions for free.
    if (speed > RULES.creepSpeed - 1) ladder('bank');

    if (kind === 'bumper') {
      const current = Math.hypot(p.vx, p.vz) || 1;
      const target = Math.max(current * INJECTOR.bumper.boost, INJECTOR.bumper.minOut);
      const scale = target / current;
      p.vx *= scale;
      p.vz *= scale;
      if (INJECTOR.bumper.refundsBounce) p.bouncesUsed = Math.max(0, p.bouncesUsed - 1);
      audio.bumper();
      fx.burst(x, z, 12, PALETTE.lip, 11, 0.8);
      fx.shockwave(x, z, PALETTE.lip, 2.6, 0.3);
    } else {
      fx.burst(x, z, 5, PALETTE.railGlow, speed * 0.3, 0.6);
    }

    boons.onRebound(event);
  },

  playerLaunch(event) {
    const p = event.power ?? 1;
    audio.slingshot(p);
    fx.burst(event.x, event.z, 8 + Math.round(p * 16), PALETTE.player, event.speed * 0.3, 0.7);
    fx.shockwave(event.x, event.z, PALETTE.player, 1.8 + p * 3.4, 0.22 + p * 0.16);
    engine.shake(event.speed * p * 1.3);
    if (p > 0.75) {
      engine.zoomPunch();
      engine.hitStop(TIME.hitStop * 0.7);
    }
    tutorial.notify('launch', {
      power: p,
      turned: game.lastTurn || 0,
      dirX: event.dirX ?? 0,
      dirZ: event.dirZ ?? 0
    });
    boons.onLaunch(event);
  },

  playerDash() {
    audio.rebound(0.4);
  },

  playerTouched({ player: p, enemy }) {
    if (game.tutorialGuard) return;
    if (game.graceTimer > 0) return;
    if (p.touchTimer > 0) return;
    if (!enemy.hostile) return;
    enemy.hostile = false;
    if (p.takeDamage(RULES.damage.kickback, game, enemy)) {
      p.touchTimer = PLAYER.touchInterval;
    }
  },

  playerDamaged({ player: p, amount }) {
    audio.playerHurt();
    engine.shake(amount * 1.4);
    hud.flashDamage();
    fx.floatText(p.x, p.z, `-${Math.round(amount)}`, 'splat');
  },

  playerDeath() {
    audio.playerDeath();
    engine.shake(24);
    engine.zoomPunch(FEEL.zoomPunch * 2);
    fx.burst(player.x, player.z, 40, PALETTE.player, 16, 2);
    game.state = 'dead';
    game.deathTimer = 2.4;
    hud.showBanner('Run Over', `Room ${game.level} · ${rules.runScore.toLocaleString()} points`, 2.4);
  },

  projectileHit({ projectile, player: p }) {
    fx.burst(projectile.x, projectile.z, 8, PALETTE.bad, 7, 0.7);
    if (game.tutorialGuard) {
      hud.flashDamage();
      engine.shake(6);
      return;
    }
    p.takeDamage(projectile.damage, game, projectile);
  },

  projectileExpired({ projectile }) {
    fx.burst(projectile.x, projectile.z, 4, PALETTE.bad, 4, 0.5);
  },

};

/* ------------------------------------------------------------------ *
 * Run / room flow
 * ------------------------------------------------------------------ */

/** What a door promises, spelled out before the player commits the shot. */
function doorLabelText(door) {
  switch (door.reward.id) {
    case 'boon':
      return `${door.phase} boon`;
    case 'repair':
      return `+${PROGRESSION.healAmount} hull`;
    case 'stroke':
      return `+${PROGRESSION.statRewards.stroke} shot every room`;
    case 'freeze':
      return `+${PROGRESSION.statRewards.freeze} freeze`;
    case 'ricochet':
      return `+${PROGRESSION.statRewards.bounce} bounce`;
    default:
      return door.reward.label;
  }
}

const cssHex = (value) => `#${value.toString(16).padStart(6, '0')}`;

/**
 * The contract is filled. Pay for every stroke left in the budget — the skill
 * income — put the scorecard up, and open the exits.
 */
function completeRoom() {
  if (game.state === 'cleared') return;
  game.state = 'cleared';
  const result = rules.endRoom();
  audio.roomClear();
  engine.zoomPunch(FEEL.zoomPunch * 1.4);
  hud.showScorecard({
    level: game.level,
    filled: true,
    ledger: rules.ledger,
    roomScore: result.roomScore,
    runScore: result.runScore
  });
  openExits();
}

/**
 * Out of strokes with balls still standing. The rack breaks loose and every
 * ball left takes a bite out of the hull — then the exits open anyway. A bad
 * room costs you the next few rooms, not the run on the spot.
 */
function failRoom() {
  if (game.state === 'cleared') return;
  game.state = 'cleared';
  const standing = rooms.ballsRemaining;
  const damage = standing * RULES.damage.looseBall;
  const result = rules.endRoom();

  audio.playerDeath?.();
  engine.shake(18);
  engine.zoomPunch(FEEL.zoomPunch * 1.6);
  for (const ball of game.enemies) {
    if (!ball.alive || ball.number <= 0) continue;
    fx.shockwave(ball.x, ball.z, ENEMY_COLOR[ball.type], 4.5, 0.5);
  }
  if (damage > 0 && !game.tutorialGuard) player.takeDamage(damage, game, 'loose');

  hud.showScorecard({
    level: game.level,
    filled: false,
    ledger: rules.ledger,
    roomScore: result.roomScore,
    runScore: result.runScore,
    penalty: { standing, damage }
  });
  openExits();
}

function openExits(title, sub) {
  rooms.openExits();
  hud.setDoors(
    rooms.doors.map((door) => ({
      x: door.x,
      z: door.z + door.hh + 1.0,
      text: doorLabelText(door),
      color: cssHex(door.color)
    }))
  );
}

function handleRoomClear() {
  // Kept for the RoomManager handler contract; the contract decides clears now.
  completeRoom();
}

function handleDoorEntered(door) {
  audio.doorOpen();
  hud.setDoors([]);
  hud.hideScorecard();
  fx.shockwave(door.x, door.z, door.color, 6, 0.5);
  fx.burst(door.x, door.z, 22, door.color, 12, 1.2);

  if (door.reward.id === 'boon') {
    openBoonModal(door.phase);
    return;
  }

  switch (door.reward.id) {
    case 'repair':
      player.heal(PROGRESSION.healAmount);
      hud.showBanner('Repaired', `+${PROGRESSION.healAmount} hull`, 1.6);
      break;
    case 'stroke':
      game.strokeBonus += PROGRESSION.statRewards.stroke;
      hud.showBanner('More Shots', `+${PROGRESSION.statRewards.stroke} shot every room`, 1.8);
      break;
    case 'freeze':
      rules.grantFreeze(PROGRESSION.statRewards.freeze);
      hud.showBanner('Freeze', `+${PROGRESSION.statRewards.freeze} charges`, 1.6);
      break;
    case 'ricochet':
      boons.addRunBonus({ maxBounces: PROGRESSION.statRewards.bounce });
      hud.showBanner('Bounce', `+${PROGRESSION.statRewards.bounce} wall bounce`, 1.6);
      break;
    default:
      break;
  }
  advanceRoom();
}

function openBoonModal(phase) {
  game.state = 'modal';
  engine.pause();
  input.cancel();
  player.hideTrajectory();
  const offers = boons.rollOffer(BOONS.offerCount, rooms.rng, phase);
  modal.show(
    offers,
    (offer) => {
      if (offer) {
        boons.grant(offer);
        audio.boonPick();
        hud.setBuild(boons.owned);
      }
      engine.resume();
      if (game.pendingBoons > 0) {
        game.pendingBoons -= 1;
        openBoonModal(null);
        return;
      }
      advanceRoom();
    },
    { level: game.level, phase }
  );
}

function advanceRoom() {
  // An upgrade pocket buys a boon pick, cashed on the way out of the room.
  if (game.pendingBoons > 0) {
    game.pendingBoons -= 1;
    openBoonModal(null);
    return;
  }

  game.level += 1;
  game.chain.count = 0;
  game.launchHits = 0;
  game.pendingBoons = 0;
  boons.clearFields();
  fx.clearTexts();
  hud.setDoors([]);
  hud.hideScorecard();

  rooms.generate(game.level);
  callPocket(null);
  rules.beginRoom(game.level, game.strokeBonus
    ? { strokes: rooms.contract.strokes + game.strokeBonus }
    : null);
  player.placeAt(rooms.layout.spawn.x, spawnZ());
  game.state = 'playing';
  game.phase = 'aim';
  game.midStroke = false;
  input.setHeading(0, -1);
  showRoomBanner();
}

/** Spawn height: PLAYER.spawnFromBottom of the table, measured up from the bottom. */
function spawnZ() {
  return ARENA.halfH - ARENA.height * PLAYER.spawnFromBottom;
}

/**
 * Lead with the lesson while there is still one to teach, and otherwise state
 * the contract — which is the one thing the player has to know to play.
 */
function showRoomBanner() {
  const lesson = TUTORIAL.lessons[game.level];
  if (lesson) {
    hud.showBanner(lesson.title, lesson.sub, 2.6);
    return;
  }
  const c = rules.contract;
  hud.showBanner(`Room ${game.level}`, `${rules.snapshot().contractText} · ${c.strokes} shots`, 2.4);
}

/** Everything a fresh start clears, minus the room itself. */
function resetRunState() {
  boons.reset();
  boons.recompute();
  hud.setBuild(boons.owned);
  game.level = PROGRESSION.startRoom;
  game.chain.count = 0;
  game.chain.best = 0;
  game.launchHits = 0;
  game.pendingBoons = 0;
  game.strokeBonus = 0;
  game.state = 'playing';
  game.phase = 'aim';
  game.midStroke = false;
  game.graceTimer = 0;
  hud.setDoors([]);
  hud.hideScorecard();
  rules.runScore = 0;
  rules.freezeCharges = 0;
}

function startRun() {
  resetRunState();
  game.graceTimer = TUTORIAL.graceSeconds;
  game.tutorialGuard = null;
  rooms.runSeed = (Math.random() * 0xffffffff) >>> 0;
  rooms.generate(game.level);
  callPocket(null);
  rules.beginRoom(game.level);
  player.respawn(rooms.layout.spawn.x, spawnZ());
  input.setHeading(0, -1);
  showRoomBanner();
}

/* ------------------------------------------------------------------ *
 * Input wiring
 * ------------------------------------------------------------------ */

function refreshPrediction() {
  if (!player.alive) return;
  const prediction = physics.predictTrajectory({ x: player.x, z: player.z }, player.aimDir, {
    radius: player.radius,
    // Never preview more banks than the launch can actually survive — the
    // prediction lines are a promise, not a suggestion.
    maxBounces: Math.min(TRAJECTORY.previewBounces, player.maxBounces),
    bodies: game.enemies
  });
  // The pockets go in so the preview can warn about a scratch: a line that
  // ends down a hole is the one prediction the player most needs in advance.
  player.showTrajectory(prediction, { pockets: rooms.table.pockets, power: player.aimPower });
}

/** Heading when the current hold began; used to measure how far it turned. */
let aimStartDir = null;

const input = new InputManager(stage, {
  camera,
  // Aiming is only possible while the table is frozen. During a stroke the
  // pointer means something else entirely — see the freeze tap below.
  isEnabled: () =>
    game.running && player.alive && game.state !== 'modal' && !menuOpen && game.phase === 'aim',
  // The ball is what the cursor aims from.
  getAnchor: () => ({ x: player.x, z: player.z }),
  onAimStart: () => {
    uiLayer.classList.add('aiming');
    const h = input.heading;
    aimStartDir = { x: h.x, z: h.z };
    game.lastTurn = 0;
    const hasFocus = player.startAim();
    if (hasFocus) {
      engine.setBulletTime(true);
      audio.focusEnter();
    }
  },
  onAimUpdate: (aim) => {
    noteAimPower(aim);
    player.updateAim(aim);
    if (aim.valid) refreshPrediction();
    else player.hideTrajectory();
  },
  onAimCancel: () => {
    uiLayer.classList.remove('aiming');
    wasMaxed = false;
    if (engine.inBulletTime) audio.focusExit();
    engine.setBulletTime(false);
    player.cancelAim();
  },
  onRelease: (aim) => {
    uiLayer.classList.remove('aiming');
    wasMaxed = false;
    if (aimStartDir) {
      const dot = clamp(aimStartDir.x * aim.dirX + aimStartDir.z * aim.dirZ, -1, 1);
      game.lastTurn = (Math.acos(dot) * 180) / Math.PI;
      aimStartDir = null;
    }
    if (engine.inBulletTime) audio.focusExit();
    engine.setBulletTime(false);
    player.launch(aim, game);
    // A release either opens a stroke or resumes the one a freeze interrupted.
    // Resuming keeps the ladder, the budget and every other ball's velocity.
    if (game.midStroke) resumeStroke();
    else beginStroke();
  },
  onFlick: (aim) => {
    uiLayer.classList.remove('aiming');
    // THERE IS NO FREE MOVE.
    //
    // The dash used to be a no-cost reposition, which is fine when the threat
    // is real-time and fatal when the budget is strokes: you could walk the
    // cue ball anywhere for nothing. A flick is now simply a soft shot, and it
    // costs the same one stroke every other shot does.
    engine.setBulletTime(false);
    player.cancelAim();
    player.launch({ ...aim, power: PLAYER.minPower }, game);
    if (game.midStroke) resumeStroke();
    else beginStroke();
  }
});

/**
 * THE FREEZE TAP.
 *
 * While a stroke is resolving the pointer does not aim — it stops the table.
 * The gesture is deliberately the same one that aims, because it is the same
 * instinct ("I want to do something about this") and the game already knows
 * which of the two you can mean from the phase it is in.
 */
stage.addEventListener(
  'pointerdown',
  (event) => {
    if (!game.running || menuOpen || game.state === 'modal') return;
    if (game.phase !== 'resolve') return;
    event.preventDefault();
    tryFreeze();
  },
  { passive: false }
);

/* ------------------------------------------------------------------ *
 * Resize handling
 * ------------------------------------------------------------------ */

function resize() {
  const { width, height } = layoutStage();
  const pr = Math.min(window.devicePixelRatio || 1, RENDER.maxPixelRatio);
  renderer.setPixelRatio(pr);
  renderer.setSize(width, height, false);
  if (composer) {
    composer.setPixelRatio(pr);
    composer.setSize(width, height);
  }
  camera.updateProjectionMatrix();
}

const initial = layoutStage();
buildComposer(initial.width, initial.height);
resize();

window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 120));
if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);

/* ------------------------------------------------------------------ *
 * Boot
 * ------------------------------------------------------------------ */

const tutorial = new Tutorial({
  layer: uiLayer,
  game,
  player,
  rooms,
  input,
  fx,
  hud,
  engine,
  spawnZ,
  resetRun: resetRunState,
  finish: () => startRun()
});
if (typeof window !== 'undefined') game.tutorial = tutorial;
const menuMain = document.getElementById('menu-main');
const menuSettings = document.getElementById('menu-settings');
const $ = (id) => document.getElementById(id);

/**
 * The menu runs the real game behind it rather than a video: attract mode is
 * the actual simulation with input disabled and a bot taking shots, so the
 * background can never drift out of sync with how the game currently looks.
 */
let menuOpen = true;
let attractTimer = 0;

let muted = false;
try {
  muted = localStorage.getItem('billiard-muted') === '1';
} catch {
  /* private mode */
}

function applyMute() {
  audio.setMuted(muted);
  $('btn-mute').textContent = muted ? 'Sound off' : 'Sound on';
  $('btn-mute').setAttribute('aria-pressed', String(muted));
  $('set-mute').textContent = muted ? 'Sound: Off' : 'Sound: On';
  try {
    localStorage.setItem('billiard-muted', muted ? '1' : '0');
  } catch {
    /* no-op */
  }
}

function showTutorialState() {
  $('set-tutorial-state').textContent = Tutorial.completed
    ? 'Tutorial finished — it will not show again'
    : 'Tutorial will play on your next run';
}

function openMenu() {
  menuOpen = true;
  input.cancel();
  tutorial.stop();
  bootVeil.classList.remove('hidden');
  uiLayer.classList.add('attract');
  menuMain.hidden = false;
  menuSettings.hidden = true;
  showTutorialState();
}

function play() {
  menuOpen = false;
  bootVeil.classList.add('hidden');
  uiLayer.classList.remove('attract');
  audio.unlock();
  applyMute();
  input.cancel();
  // A first-time player gets the lesson rooms; everyone else gets the game.
  if (Tutorial.completed) startRun();
  else tutorial.start();
}

$('btn-play').addEventListener('click', play);
$('btn-settings').addEventListener('click', () => {
  menuMain.hidden = true;
  menuSettings.hidden = false;
  showTutorialState();
});
$('set-back').addEventListener('click', () => {
  menuSettings.hidden = true;
  menuMain.hidden = false;
});
$('btn-mute').addEventListener('click', () => {
  muted = !muted;
  audio.unlock();
  applyMute();
});
$('set-mute').addEventListener('click', () => {
  muted = !muted;
  audio.unlock();
  applyMute();
});
$('set-tutorial').addEventListener('click', () => {
  Tutorial.reset();
  showTutorialState();
  $('set-tutorial').textContent = 'Tutorial reset';
  setTimeout(() => {
    $('set-tutorial').textContent = 'Replay tutorial';
  }, 1400);
});

/**
 * Attract mode. Keeps at least two bodies on the table so the room never
 * actually clears — that would hand control to the door / reward flow, which
 * has no business running behind a menu.
 */
function attract(rawDt) {
  if (!menuOpen) return;
  attractTimer -= rawDt;
  const alive = game.enemies.filter((e) => e.alive);

  if (alive.length <= 1) {
    if (attractTimer > 0) return;
    game.level = 2 + Math.floor(Math.random() * 6);
    rooms.generate(game.level);
    player.placeAt(rooms.layout.spawn.x, spawnZ());
    player.hp = player.maxHp;
    hud.setDoors([]);
    attractTimer = 0.9;
    return;
  }

  if (attractTimer > 0 || player.state !== PLAYER_STATE.IDLE) return;
  const target = alive[Math.floor(Math.random() * alive.length)];
  const dx = target.x - player.x;
  const dz = target.z - player.z;
  const len = Math.hypot(dx, dz) || 1;
  const dirX = dx / len;
  const dirZ = dz / len;
  input.setHeading(dirX, dirZ);
  player.launch({ dirX, dirZ, power: 0.72 + Math.random() * 0.28 }, game);
  attractTimer = 1.15 + Math.random() * 0.8;
}

applyMute();
game.running = true;
startRun();
openMenu();
window.addEventListener('blur', () => input.cancel());

/* ------------------------------------------------------------------ *
 * Frame loop
 * ------------------------------------------------------------------ */

function sweepEntities() {
  for (let i = game.enemies.length - 1; i >= 0; i--) {
    const enemy = game.enemies[i];
    if (!enemy.alive) {
      enemy.dispose();
      game.enemies.splice(i, 1);
    }
  }
  for (let i = game.projectiles.length - 1; i >= 0; i--) {
    const projectile = game.projectiles[i];
    if (!projectile.alive) {
      projectile.dispose();
      game.projectiles.splice(i, 1);
    }
  }
}

function simulate(dt, rawDt, aiming) {
  player.update(dt, rawDt, game, aiming);

  if (player.state === PLAYER_STATE.LAUNCHED || player.state === PLAYER_STATE.DASHING) {
    boons.onTrajectory({ player, dt, game });
  }

  for (const enemy of game.enemies) enemy.update(dt, game);
  for (const projectile of game.projectiles) projectile.update(dt);

  physics.update(dt, game);
  boons.update(dt, game);
  sweepEntities();

  if (game.graceTimer > 0) game.graceTimer -= dt;

  // THE STROKE ENDS WHEN THE TABLE STOPS, NOT WHEN A TIMER RUNS OUT.
  //
  // A short grace after everything settles keeps a ball that is still creeping
  // toward a pocket from having its pot stolen by the bookkeeping.
  if (game.midStroke) {
    game.strokeTimer += dt;
    if (tableSettled()) {
      game.settleTimer += dt;
      if (game.settleTimer >= RULES.settleGrace) finishStroke();
    } else {
      game.settleTimer = 0;
    }
    // A ball trapped in a bumper loop must not be able to hang the room.
    if (game.midStroke && game.strokeTimer > RULES.strokeTimeout) finishStroke();
  }
}

let last = performance.now();

function frame(now) {
  requestAnimationFrame(frame);
  const rawFrame = (now - last) / 1000;
  last = now;

  const { dt, rawDt } = engine.update(rawFrame);
  input.update(rawDt);
  audio.setTimeDilation(engine.timeScale);

  attract(rawDt);
  tutorial.update(rawDt);
  pulseCalledPocket(rawDt);

  const aiming = input.isAiming && player.state === PLAYER_STATE.AIMING;

  if (game.running) {
    // Pockets shimmer and doors pulse whether or not the table is moving —
    // a frozen table still has to look alive.
    rooms.update(rawDt, game);

    if (game.state === 'dead') {
      game.deathTimer -= rawDt;
      if (game.deathTimer <= 0) startRun();
    } else if (game.phase === 'resolve' && dt > 0) {
      simulate(dt, rawDt, false);
    } else if (game.state !== 'modal') {
      // Frozen (hit-stop): keep presentation alive, skip simulation.
      player.update(0, rawDt, game, aiming && engine.inBulletTime);
    }
    // While the ball is travelling under its own steam, the compass needle
    // follows it. When it settles the needle is simply left where the ball was
    // last heading, which is the default the next shot starts from.
    // Only while the ball is travelling under its OWN steam. Being body-checked
    // also clears settleSpeed, and that silently swung the resting cue to point
    // wherever the player had just been shoved — the one heading that is
    // supposed to be a fixed, re-readable default.
    if (
      !aiming &&
      player.state === PLAYER_STATE.LAUNCHED &&
      player.speed > PLAYER.settleSpeed
    ) {
      input.setHeading(player.vx, player.vz);
    }

    // Re-derive the aim now that the ball has finished moving, so a held thumb
    // keeps pointing at the ball rather than at where it was a frame ago.
    if (aiming) {
      const aim = input.refresh();
      if (aim) {
        noteAimPower(aim);
        player.updateAim(aim);
        if (aim.valid) refreshPrediction();
        else player.hideTrajectory();
      }
    } else if (
      game.state === 'playing' &&
      player.alive &&
      player.state === PLAYER_STATE.IDLE
    ) {
      // THE CUE AT REST.
      //
      // A room resets the heading to 12 o'clock, but that was invisible: no
      // line is drawn until a thumb goes down, so the ball looked like it had
      // no aim at all. Worse, the ball spawns low, so the first touch tends to
      // land in the open space *above* it — which in the cue model correctly,
      // but unhelpfully, fires downward.
      //
      // Showing the resting cue fixes both. The default is now something you
      // can see and nudge rather than something you discover by firing.
      const h = input.heading;
      player.aimDir.x = h.x;
      player.aimDir.z = h.z;
      player.aimPower = 0;
      player.aimCharge = 0;
      player.aimCue.x = player.x - h.x * 3.4;
      player.aimCue.z = player.z - h.z * 3.4;
      refreshPrediction();
    } else {
      player.hideTrajectory();
    }

    const snapshot = rules.snapshot();
    hud.update(
      {
        hp: player.hp,
        maxHp: player.maxHp,
        level: game.level,
        layout: rooms.layout ? rooms.layout.name : '',
        phase: game.phase,
        midStroke: game.midStroke,
        cleared: game.state === 'cleared',
        ...snapshot
      },
      rawDt
    );
  }

  fx.update(dt, rawDt);

  if (composer) composer.render();
  else renderer.render(scene, camera);
}

requestAnimationFrame(frame);

// Expose the context for console-side tuning during playtests. The UI handles
// come too, so a reward screen can be summoned without clearing a room first.
if (import.meta.env?.DEV) {
  game.ui = { modal, hud, input, advanceRoom, openBoonModal, tutorial, rooms, player };
  window.__billiard = game;
}
