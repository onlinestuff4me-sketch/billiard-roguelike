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
  INPUT,
  BOONS,
  INJECTOR,
  RULES,
  TABLE,
  TUTORIAL,
  PROGRESSION,
  LAYER
} from './config.js';
import { Engine } from './core/Engine.js';
import { InputManager } from './core/InputManager.js';
import { AudioManager } from './core/AudioManager.js';
import { Player, PLAYER_STATE } from './entities/Player.js';
import { PhysicsSystem, carryDistance, speedAfterDistance } from './systems/PhysicsSystem.js';
import { BoonSystem } from './systems/BoonSystem.js';
import { RoomManager } from './systems/RoomManager.js';
import { Rules } from './systems/Rules.js';
import { KICKBACK_SPEED, pocketSlots } from './systems/Table.js';
import { HUD, HOLD } from './ui/HUD.js';
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

/** Screen pixels at the top of the stage that the table is not drawn in. */
let bandReserve = 0;
let bandReserveTarget = 0;
/** Where the current easing started, and how far through it is. */
let bandReserveFrom = 0;
let bandReserveT = 1;
const BAND_RESERVE_TIME = 0.55;

function layoutStage() {
  const vw = window.innerWidth;
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  // THE STAGE IS THE ARENA PLUS WHATEVER IS RESERVED ABOVE IT. The arena keeps
  // its aspect and fits the height that is left; the strip is added back on so
  // the framed box still reaches the bottom of the screen. See setBandReserve.
  //
  // Sized to the TARGET rather than to the value currently easing towards it,
  // so the canvas and its post-processing targets are reallocated once per
  // change instead of once per frame of the animation. Taking the strip is
  // instant, so nothing is ever drawn into a stage that is too small for it;
  // giving it back is animated, and there the arena simply grows into a box
  // that is already the right size.
  const reserve = Math.min(Math.max(0, bandReserveTarget), vh * 0.42);
  let h = Math.max(120, vh - reserve);
  let w = h * ARENA.aspect;
  if (w > vw) {
    w = vw;
    h = w / ARENA.aspect;
  }
  const width = Math.round(w);
  const height = Math.round(h + reserve);
  stage.style.width = `${width}px`;
  stage.style.height = `${height}px`;
  return { width, height };
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
  // THE COMPOSER GETS AN EXPLICITLY LINEAR TARGET.
  //
  // EffectComposer's default render target inherits the renderer's output
  // colour space, which is sRGB. RenderPass then writes sRGB-encoded values
  // into it and OutputPass encodes them a second time on the way to the
  // screen. A double encode lifts every mid-tone toward white, which is why
  // the balls measured as four near-identical greys — #afacaf, #a2a9b7,
  // #a2aabe, #a2aaaf, a worst-case separation of dE 3.3 — while their source
  // colours were 32 apart. Darks survive it and very bright saturated colours
  // clip and survive it, so the cue ball and the felt looked fine and only the
  // mid-tones, which is every ball, were destroyed.
  //
  // The passes want linear light in and OutputPass wants to be the only thing
  // that encodes. Measured with tools/check-palette.mjs, which samples the
  // real framebuffer.
  const target = new THREE.WebGLRenderTarget(width, height, {
    type: THREE.HalfFloatType,
    colorSpace: THREE.LinearSRGBColorSpace
  });
  composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    RENDER.bloom.strength,
    RENDER.bloom.radius,
    RENDER.bloom.threshold
  );
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());
  // Exposed for tools/check-palette.mjs, which measures the colours the player
  // actually sees. Bloom is part of that answer — it was the whole answer, the
  // first time this was measured — so the check has to be able to reach it.
  if (typeof window !== 'undefined') {
    window.__bloom = bloomPass;
    window.__composer = composer;
    window.__renderer = renderer;
    window.__THREE = THREE;
  }
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

/**
 * Light the pockets the board is about — one, several, or none.
 *
 * A shot that ends in two different pockets has two goals, and pointing at
 * only one of them describes half a plan. Accepts a slot id, an array of them,
 * or null.
 */
let calledSlots = [];
function callPocket(slots) {
  calledSlots = slots == null ? [] : Array.isArray(slots) ? slots.filter(Boolean) : [slots];
  for (const entry of calledRings) {
    const on = calledSlots.includes(entry.slot);
    entry.material.opacity = on ? 1 : 0;
    entry.halo.opacity = on ? 0.22 : 0;
  }
}

/**
 * CELEBRATIONS STACK.
 *
 * A pot is rarely one thing that happened. It can be a pot AND a bank AND a
 * green AND a ball that touched two others, and each of those is a separate
 * rung of the multiplier the player earned separately. Firing them as one
 * number collapses four decisions into a single "+2,400" and throws away every
 * bit of feedback about WHICH of them paid.
 *
 * So they arrive as beats, a quarter-second apart, each with its own note a
 * step higher than the last. The run climbs, and the player hears their own
 * plan being counted back to them.
 */
const beats = [];

/** @param {Array<{at:number, run:() => void}>} steps seconds from now */
function celebrate(steps) {
  for (const step of steps) beats.push({ t: step.at, run: step.run });
}

function pumpCelebrations(rawDt) {
  for (let i = beats.length - 1; i >= 0; i--) {
    const beat = beats[i];
    beat.t -= rawDt;
    if (beat.t > 0) continue;
    beats.splice(i, 1);
    beat.run();
  }
}

/**
 * The called pocket breathes. Six identical mouths is exactly the point of the
 * architecture, so the one being pointed at has to move to be found — a static
 * brightness step reads as a lighting accident at this scale.
 */
function pulseCalledPocket(rawDt) {
  if (!calledSlots.length) return;
  calledPulse += rawDt * 3.4;
  const wave = Math.sin(calledPulse);
  const glow = 0.72 + wave * 0.28;
  for (const entry of calledRings) {
    if (!calledSlots.includes(entry.slot)) continue;
    entry.material.opacity = glow;
    entry.halo.opacity = 0.2 + wave * 0.14;
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

    // A soft outer bloom on the same arc. The rim alone reads at the pocket
    // but not from the far end of the table, which is exactly where the player
    // is looking from when they need to know which one is being pointed at.
    const callHalo = new THREE.Mesh(
      new THREE.RingGeometry(m * 1.15, m * 1.75, 48, 1, start, SWEEP),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(PALETTE.bone),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );
    callHalo.rotation.x = -Math.PI / 2;
    callHalo.position.set(slot.x, 0.84, slot.z);
    table.add(callHalo);

    calledRings.push({
      slot: slot.slot,
      x: slot.x,
      z: slot.z,
      material: called.material,
      halo: callHalo.material
    });
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
        //
        // Half the label's own width is the margin AT REST, and the label is
        // not at rest: it is drawn `scale(1 + (1 - progress) * 0.25)`, which
        // is where it is widest at the moment it appears — so the first and
        // loudest frames of a scratch were still overhanging the edge by an
        // eighth of the word. The margin is the peak width, not the resting
        // one. `offsetWidth` can also read 0 before the element has laid out;
        // an estimate from the string keeps that frame on screen too.
        const rest = t.el.offsetWidth || t.el.textContent.length * 11;
        const half = rest * 0.5 * 1.25 + 6;
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
// Handed to tools/check-palette.mjs, which measures these colours as the
// renderer draws them rather than as they are written down.
game.ballInk = PALETTE.ballInk;
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
/** Balls part-way down a pocket, shrinking and dropping. */
const sinking = [];

/**
 * A POT SHOULD LOOK LIKE THE BALL WENT IN.
 *
 * It used to be a shatter: the ball vanished in a burst of its own colour, at
 * the pocket, on the same frame the score text appeared over the top of it. The
 * one moment the whole game is about was the one moment you could not see.
 *
 * The ball now falls INTO the mouth — pulled to the pocket centre, shrinking
 * and dropping below the felt over a fifth of a second — and the score text is
 * thrown clear of the pocket rather than sitting on it.
 */
function sinkBall(ball, pocket) {
  const group = ball.group;
  if (!group) return;
  // The sweep disposes a dead body on the very next frame, so the sink takes
  // ownership of it for the length of the animation. See sweepEntities.
  ball.sinking = true;
  sinking.push({
    ball,
    group,
    t: 0,
    life: 0.24,
    fromX: ball.x,
    fromZ: ball.z,
    toX: pocket ? pocket.x : ball.x,
    toZ: pocket ? pocket.z : ball.z,
    baseY: group.position.y
  });
}

function pumpSinking(rawDt) {
  for (let i = sinking.length - 1; i >= 0; i--) {
    const s = sinking[i];
    s.t += rawDt;
    const k = Math.min(s.t / s.life, 1);
    // Accelerating: it is falling, not fading.
    const ease = k * k;
    s.group.position.x = s.fromX + (s.toX - s.fromX) * ease;
    s.group.position.z = s.fromZ + (s.toZ - s.fromZ) * ease;
    s.group.position.y = s.baseY - ease * 2.4;
    s.group.scale.setScalar(Math.max(0.08, 1 - ease * 0.9));
    if (k >= 1) {
      s.ball.sinking = false;
      sinking.splice(i, 1);
    }
  }
}

function removeBall(ball, pocket) {
  // Idempotent: a pot removes the ball, and the lesson director may then score
  // the same ball. Two shatter bursts for one pot is a tell that the game does
  // not know what happened.
  if (!ball || !ball.alive) return;
  ball.alive = false;
  audio.enemyDeath();
  if (pocket) {
    sinkBall(ball, pocket);
    fx.shockwave(pocket.x, pocket.z, ENEMY_COLOR[ball.type], ball.radius * 3.2, 0.3);
  } else {
    fx.burst(ball.x, ball.z, 20, ENEMY_COLOR[ball.type], 11, 1.5);
    fx.shockwave(ball.x, ball.z, ENEMY_COLOR[ball.type], ball.radius * 4.5, 0.36);
  }
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
  game.strokeTookGreen = false;
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

    const banks = rules.banks;
    const touched = rules.ballsTouched;
    const tookGreen = game.strokeTookGreen;
    const paid = rules.pot(ball.number);
    tutorial.notify('potted', { ball, pocket, paid, bounces: player.bouncesUsed });

    // THE TEXT GOES WHERE THE BALL IS NOT.
    //
    // Every pocket is in a corner or against a rail, so a label centred on one
    // sits directly over the ball dropping into it — the score covered the very
    // event it was reporting. Each beat is thrown back toward the middle of the
    // table, along the line from the pocket to the centre, and stacked further
    // in as the run climbs.
    const inward = (() => {
      const len = Math.hypot(pocket.x, pocket.z) || 1;
      return { x: -pocket.x / len, z: -pocket.z / len };
    })();
    const away = (n) => ({
      x: pocket.x + inward.x * (2.6 + n * 1.5),
      z: pocket.z + inward.z * (2.6 + n * 1.5)
    });

    audio.chainNote(game.chain.count + 2);
    engine.hitStop(TIME.hitStopCrit);
    engine.zoomPunch();
    engine.shake(10);
    fx.shockwave(pocket.x, pocket.z, PALETTE.lip, 5.5, 0.5);
    const head = away(0);
    fx.floatText(head.x, head.z, `+${paid.value.toLocaleString()}`, 'crit');

    const steps = [];
    let note = game.chain.count + 3;
    let at = 0.26;
    const beat = (text, colour) => {
      const when = at;
      const tone = note;
      const spot = away(steps.length + 1);
      steps.push({
        at: when,
        run: () => {
          audio.chainNote(tone);
          engine.zoomPunch(FEEL.zoomPunch * 0.5);
          fx.shockwave(spot.x, spot.z, colour, 3.4, 0.3);
          fx.floatText(spot.x, spot.z, text, 'crit');
        }
      });
      at += 0.26;
      note += 1;
    };
    if (banks > 0) beat(`${banks} BANK${banks > 1 ? 'S' : ''} ×${1 + banks}`, PALETTE.player);
    if (tookGreen) beat('GREEN ×2', PALETTE.good);
    if (touched > 1) beat(`${touched} BALLS ×${touched}`, PALETTE.solid);
    if (steps.length) celebrate(steps);

    removeBall(ball, pocket);
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
        game.strokeTookGreen = true;
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
    // The advice is over the moment the shot is chosen.
    retireCoachRoute();
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
  openExits();
  hud.showScorecard({
    level: game.level,
    filled: true,
    ledger: rules.ledger,
    roomScore: result.roomScore,
    runScore: result.runScore,
    choices: exitChoices()
  });
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

  openExits();
  hud.showScorecard({
    level: game.level,
    filled: false,
    ledger: rules.ledger,
    roomScore: result.roomScore,
    runScore: result.runScore,
    penalty: { standing, damage },
    choices: exitChoices()
  });
}

function openExits(title, sub) {
  rooms.openExits();
}

/** The reward name a button shows, short enough to be a label. */
function doorName(door) {
  switch (door.reward.id) {
    case 'boon':
      return 'Upgrade';
    case 'repair':
      return 'Repair';
    case 'stroke':
      return 'More shots';
    case 'freeze':
      return 'Freeze';
    case 'ricochet':
      return 'Bounce';
    default:
      return 'Onward';
  }
}

/**
 * One button per exit, in the exit's own colour.
 *
 * The doors still exist in the room — they are what carries the reward and
 * decides the next level — but the player no longer has to shoot the cue ball
 * into one, because at the end of a room there is no cue ball on the table to
 * shoot. See HUD.showScorecard.
 */
function exitChoices() {
  return rooms.doors.map((door) => ({
    name: doorName(door),
    detail: doorLabelText(door),
    color: cssHex(door.color),
    pick: () => handleDoorEntered(door)
  }));
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
  // EVERY ONE OF THESE INTRODUCES A RULE, so every one of them waits to be
  // read. They are not reports on something the player just watched; they are
  // the terms of the room, and a rule that scrolled past unread is a rule the
  // player does not have.
  const lesson = TUTORIAL.lessons[game.level];
  if (lesson) {
    hud.showBanner(lesson.title, lesson.sub, HOLD);
    return;
  }
  const c = rules.contract;
  // The contract holds until it is tapped away. It is the terms of the room,
  // not a report on something already watched, and it decides every shot.
  hud.showBanner(`Room ${game.level}`, `${rules.snapshot().contractText} · ${c.strokes} shots`, HOLD);
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

/**
 * Put the ghost pad under the thumb.
 *
 * The pad's geometry is in world units so it tracks the table exactly, and is
 * projected with the same camera maths the coach spotlight and door labels use.
 * It draws only once the pad is SEATED — before that the gesture is still
 * inside the dead zone and there is no pivot to show yet.
 */
function showPad(aim) {
  const pad = INPUT.floatingPad ? aim.pad : null;
  if (!pad) {
    hud.setPad(null);
    return;
  }
  // Client pixels to stage-local pixels. No camera involved: the pad is a
  // control under the thumb, and it must not scale, drift or rotate with the
  // table it happens to be drawn over.
  const rect = uiLayer.getBoundingClientRect();
  hud.setPad({
    px: pad.x - rect.left,
    py: pad.y - rect.top,
    kx: pad.knobX - rect.left,
    ky: pad.knobY - rect.top,
    radius: pad.radius,
    power: clamp(pad.power, 0, 1)
  });
}

/** The speed this shot would leave the cue at, given how long it is held. */
function launchSpeed() {
  return (
    (PLAYER.launchSpeedMin + (PLAYER.launchSpeedMax - PLAYER.launchSpeedMin) * player.aimPower) *
    player.stats.launchSpeedMult
  );
}

/**
 * WHERE THE CUE BALL ACTUALLY ENDS UP.
 *
 * Not a tangent ray — the real thing. Take the speed the cue still has when it
 * arrives at the object ball, run the SAME two-body impulse the collision will
 * run (`resolveBallImpulse`, mass 1.6 against a 1.0 solid, restitution 0.96),
 * and march the resulting velocity back through the same predictor that drew
 * the approach, for exactly as far as that speed carries under drag.
 *
 * The 90° tangent is a special case of this — equal masses, perfect
 * restitution — and the cue ball is heavier than everything it hits, so it
 * always drifts forward of the tangent. Drawing the special case was the bug.
 *
 * @returns {{segments: Array}|null} null when the departure is not worth drawing
 */
function projectCuePath(prediction) {
  const hit = prediction?.hit;
  if (!hit || !hit.body) return null;
  const last = prediction.segments[prediction.segments.length - 1];
  if (!last) return null;

  // Speed at contact: what is left of the launch after coasting to the ball.
  const arrival = speedAfterDistance(launchSpeed(), prediction.totalDistance);
  if (arrival <= 0) return null;

  let dx = last.bx - last.ax;
  let dz = last.bz - last.az;
  const dl = Math.hypot(dx, dz);
  if (dl < 1e-5) return null;
  dx /= dl;
  dz /= dl;

  const vx = dx * arrival;
  const vz = dz * arrival;
  const vn = vx * hit.nx + vz * hit.nz;
  if (vn <= 0) return null;

  const invA = 1 / player.mass;
  const invB = 1 / (hit.body.mass || 1);
  const j = (-(1 + PHYSICS.ballRestitution) * vn) / (invA + invB);
  const ox = vx + j * invA * hit.nx;
  const oz = vz + j * invA * hit.nz;
  const outSpeed = Math.hypot(ox, oz);

  const carry = carryDistance(outSpeed);
  if (carry < TRAJECTORY.minDraw) return null;

  return physics.predictTrajectory(
    { x: hit.x, z: hit.z },
    { x: ox / outSpeed, z: oz / outSpeed },
    {
      radius: player.radius,
      maxBounces: Math.min(TRAJECTORY.previewBounces, player.maxBounces),
      maxDistance: carry,
      // The ball we just struck is leaving; it is not in our way any more.
      bodies: game.enemies.filter((b) => b !== hit.body)
    }
  );
}

/**
 * WHAT HAPPENS TO EVERY BALL, NOT JUST YOURS.
 *
 * A combination is two collisions and the player has to see both before they
 * commit. The object-ball line used to be a single stub of fixed length that
 * said "it goes that way" and stopped — so on a board whose entire lesson is
 * "the 6 runs across into the 2, and the 2 goes in the corner", the second
 * half of the sentence was never drawn.
 *
 * This runs the chain: the struck ball's real post-impulse velocity, marched
 * through the same predictor for as far as it actually carries under its own
 * drag; and if it reaches another ball, that ball's departure too. Two links is
 * the limit on purpose — a third is below the noise floor of a real shot, and
 * drawing it would be promising precision the table does not have.
 *
 * @returns {Array<{segs:Array, ball:object|null}>} legs, nearest first
 */
function projectObjectPath(prediction) {
  const legs = [];
  const first = prediction?.hit;
  if (!first || !first.body || !prediction.caromDir) return legs;

  const last = prediction.segments[prediction.segments.length - 1];
  if (!last) return legs;
  let dx = last.bx - last.ax;
  let dz = last.bz - last.az;
  const dl = Math.hypot(dx, dz);
  if (dl < 1e-5) return legs;
  dx /= dl;
  dz /= dl;

  const arrival = speedAfterDistance(launchSpeed(), prediction.totalDistance);
  let struck = first.body;
  let nx = first.nx;
  let nz = first.nz;
  let vx = dx * arrival;
  let vz = dz * arrival;
  let strikerMass = player.mass;
  let exclude = [struck];

  for (let link = 0; link < 2; link += 1) {
    const vn = vx * nx + vz * nz;
    if (vn <= 0) break;
    const invA = 1 / strikerMass;
    const invB = 1 / (struck.mass || 1);
    const j = (-(1 + PHYSICS.ballRestitution) * vn) / (invA + invB);
    // The struck ball starts at rest, so its whole velocity is the impulse.
    const bx = -j * invB * nx;
    const bz = -j * invB * nz;
    const speed = Math.hypot(bx, bz);
    const carry = carryDistance(speed, PHYSICS.knockedDrag);
    if (carry < TRAJECTORY.minDraw) break;

    const path = physics.predictTrajectory(
      { x: struck.x, z: struck.z },
      { x: bx / speed, z: bz / speed },
      {
        // No banks on an object leg. A struck ball that reaches a cushion is
        // past the part of the shot the player is choosing, and drawing its
        // rebound turns a two-line answer into a scribble across the table.
        maxBounces: 0,
        radius: struck.radius,
        maxDistance: carry,
        bodies: game.enemies.filter((b) => !exclude.includes(b))
      }
    );
    // The contact position is the swept-circle solution the predictor already
    // has: where THIS ball's centre sits at the moment it reaches the next one.
    // It is the point the ghost marks, and it is not the end of the route —
    // the route carries on past it, dimmer, to where the ball would have gone.
    legs.push({
      segs: path.segments,
      ball: struck,
      contact: path.hit ? { x: path.hit.x, z: path.hit.z } : null
    });

    // Hand on to the next ball, if this one reaches one.
    const next = path.hit;
    if (!next || !next.body) break;
    const leg = path.segments[path.segments.length - 1];
    let ex = leg.bx - leg.ax;
    let ez = leg.bz - leg.az;
    const el = Math.hypot(ex, ez) || 1;
    ex /= el;
    ez /= el;
    const at = speedAfterDistance(speed, path.totalDistance);

    // WHERE THIS BALL GOES AFTER IT HANDS OFF.
    //
    // A collision is not the end of the ball that caused it — it deflects and
    // keeps rolling, exactly as the cue ball does, and that is the half of a
    // combination a player has to see before they can plan the shot AFTER this
    // one. The maths is the same two-body impulse used everywhere else: the
    // striker keeps its velocity plus its share of the impulse along the
    // contact normal.
    //
    // Drawn dimmer than the leg it continues, because by then the prediction
    // is a solution stacked on a solution.
    const legMass = struck.mass || 1;
    const nextMass = next.body.mass || 1;
    const vn2 = ex * at * next.nx + ez * at * next.nz;
    if (vn2 > 0) {
      const invA = 1 / legMass;
      const invB = 1 / nextMass;
      const j2 = (-(1 + PHYSICS.ballRestitution) * vn2) / (invA + invB);
      const tx = ex * at + j2 * invA * next.nx;
      const tz = ez * at + j2 * invA * next.nz;
      const tailSpeed = Math.hypot(tx, tz);
      const tailCarry = carryDistance(tailSpeed, PHYSICS.knockedDrag);
      if (tailSpeed > 1e-5 && tailCarry >= TRAJECTORY.minDraw) {
        legs[legs.length - 1].tail = physics.predictTrajectory(
          { x: next.x, z: next.z },
          { x: tx / tailSpeed, z: tz / tailSpeed },
          {
            maxBounces: 0,
            radius: struck.radius,
            maxDistance: tailCarry,
            bodies: game.enemies.filter((b) => !exclude.includes(b) && b !== next.body)
          }
        ).segments;
      }
    }

    strikerMass = legMass;
    struck = next.body;
    nx = next.nx;
    nz = next.nz;
    vx = ex * at;
    vz = ez * at;
    exclude = [...exclude, struck];
  }
  return legs;
}

/**
 * WHERE EACH BALL GOES, AS A GHOST OF THE BALL.
 *
 * A line says which way something travels; it does not say where the travelling
 * stops mattering. The moment that matters is the COLLISION — that is where the
 * player's choice is spent, where the shot becomes committed, and where every
 * plan is actually made. So each ball the shot moves gets a hollow copy of
 * itself at its first contact, in its own colour, and the part of its route
 * beyond that contact is drawn dimmer: still shown, no longer a promise.
 *
 * This replaces a set of endpoint LABELS ("YOUR BALL", "2 STOPS HERE"). Words
 * were the wrong tool: they name a place the picture could simply show, they
 * have to be kept clear of everything they might cover, and they put the eye on
 * the type instead of the felt. The one label that survives is SCRATCH, because
 * that is not a place — it is a consequence, and no arrangement of shapes says
 * it.
 */
/**
 * The pocket a path runs into, or null. Closest approach to a finite segment,
 * the same test Player.js uses to turn the departure line red — a shared
 * predicate, so the ghost and the line can never disagree about a scratch.
 */
function pathPocket(segments, pockets) {
  if (!segments || !pockets) return null;
  for (const seg of segments) {
    const dx = seg.bx - seg.ax;
    const dz = seg.bz - seg.az;
    const len2 = dx * dx + dz * dz;
    if (len2 < 1e-9) continue;
    for (const pocket of pockets) {
      const t = clamp(((pocket.x - seg.ax) * dx + (pocket.z - seg.az) * dz) / len2, 0, 1);
      const cx = seg.ax + dx * t;
      const cz = seg.az + dz * t;
      if (Math.hypot(pocket.x - cx, pocket.z - cz) <= pocket.radius) return pocket;
    }
  }
  return null;
}

/** The far end of a path, in world space. */
function pathEnd(segments) {
  const last = segments?.[segments.length - 1];
  return last ? { x: last.bx, z: last.bz } : null;
}

/** A ball's own hue, so its ghost and its route match the ball on the felt. */
function inkOf(ball) {
  return PALETTE.ballInk?.[ball?.number] ?? PALETTE.solid;
}

/**
 * Build the ghosts for the aim currently drawn.
 *
 * Placement, in order of precedence:
 *   1. INTO A POCKET — the ghost goes in the POCKET, not where the ball came
 *      to rest. A ball that drops is removed at the mouth and its predicted
 *      path carries on past it, so "the end of the route" is a place the ball
 *      never reaches. That is how a SCRATCH warning came to be drawn a foot
 *      away from the pocket it was warning about, which reads as a bug in the
 *      prediction rather than a warning about the shot.
 *   2. INTO ANOTHER BALL — the ghost goes at the contact position, which is
 *      the swept-circle solution the predictor already has.
 *   3. NEITHER — the ghost goes where the ball stops.
 *
 * @returns {Array<{x:number,z:number,r:number,ink:number,text?:string,dim?:boolean}>}
 */
function aimGhosts(prediction, cuePath, objectPath) {
  const ghosts = [];
  const pockets = rooms.table.pockets;

  // YOUR BALL, but only when it is about to be lost. Where the cue ball comes
  // to rest is already drawn — the departure line ends there — and a ghost on
  // it was one more shape competing with the balls. A scratch is different: it
  // is the one outcome the player must not discover afterwards.
  const cueSegs = cuePath?.segments?.length ? cuePath.segments : prediction?.segments;
  const down = pathPocket(cueSegs, pockets);
  if (down) {
    ghosts.push({
      x: down.x,
      z: down.z,
      r: player.radius,
      ink: PALETTE.bad,
      text: 'SCRATCH'
    });
  }

  // EVERY BALL THE SHOT MOVES, at the moment its own journey commits.
  for (const leg of objectPath ?? []) {
    if (!leg?.segs?.length) continue;
    const potted = pathPocket(leg.segs, pockets);
    const contact = leg.contact;
    const rest = pathEnd(leg.segs);
    const at = potted ? { x: potted.x, z: potted.z } : contact || rest;
    if (!at) continue;
    ghosts.push({
      x: at.x,
      z: at.z,
      r: leg.ball?.radius ?? player.radius,
      ink: inkOf(leg.ball)
    });
  }
  return ghosts;
}

/* ------------------------------------------------------------------ *
 * THE COACH ROUTE — the answer, drawn on the felt and left there
 *
 * A lesson can say which ball goes in which pocket, and the player still has
 * to work out the LINE. On the four-in-three board they have to work out three
 * of them, in order, before the first stroke — and a sentence cannot carry
 * that. Reported as "I still have no idea how to complete this lesson".
 *
 * So the board draws it. Not a hint that appears when you fail: a faint dashed
 * route, up the whole time, showing where each ball travels on a shot that
 * works. It reads as a diagram rather than as a prediction — dashed where the
 * live preview is solid, dim where the live preview is bright — so it can sit
 * under an aim without being mistaken for one.
 *
 * The route is SOLVED, not authored. A stored line would be right until the
 * first time a board moved, and on a board played over several strokes it
 * would be wrong from the second stroke onward, because by then the cue is
 * wherever the player left it. This projects from where the cue is now.
 * ------------------------------------------------------------------ */

/**
 * CHEVRONS, NOT A LINE AND NOT A BAND.
 *
 * The route was dashed first, and so is half of what the aim preview draws —
 * two kinds of dash on one felt, one a prediction of this shot and one a
 * diagram of a different one. Then it was a solid translucent band, which was
 * unmistakable and too much: laid over the aim lines in additive blending it
 * washed them out, and the player could no longer see the thing they were
 * actually steering.
 *
 * So the road is a row of small arrows marching along it, with a larger one at
 * the end. It says the same thing the band said — this way, to here — using a
 * fraction of the ink, and it says one thing the band could not: WHICH WAY.
 * The march is the animation; the arrowhead is the destination. And because it
 * is mostly empty felt, the crisp lines of the live preview read straight
 * through it.
 *
 * It fades out over a third of a second the moment a stroke is fired. The road
 * is advice about a shot you are choosing; once it is chosen the advice is
 * over, and leaving it up puts a diagram of a shot that has already happened
 * across the shot that is happening.
 */
const ROUTE_SLOTS = 4;
/** World units between chevrons, and how fast they march along the path. */
const ROUTE_SPACING = 0.8;
const ROUTE_MARCH = 1.35;
const routeGroup = new THREE.Group();
routeGroup.renderOrder = -1;
scene.add(routeGroup);
const routeSlots = [];
for (let i = 0; i < ROUTE_SLOTS; i += 1) {
  const positions = new Float32Array(96 * 3 * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setDrawRange(0, 0);
  const mat = new THREE.MeshBasicMaterial({
    color: PALETTE.bone,
    transparent: true,
    opacity: 0.5,
    // NOT additive. Additive is what made the band drown the aim lines: it adds
    // its own light to whatever is under it regardless of draw order, so the
    // brighter the thing beneath, the more it was washed out.
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.visible = false;
  routeGroup.add(mesh);
  routeSlots.push({ positions, geo, mat, mesh });
}

/** The route currently being shown, and how far through its march it is. */
let routeBands = null;
let routePhase = 0;
/** 1 while the route is advice; falls to 0 once the stroke is under way. */
let routeFade = 1;

/** Hand the felt a solved route, or take it off with no argument. */
function drawCoachRoute(list) {
  routeBands = list?.length ? list : null;
  if (routeBands) routeFade = 1;
  paintCoachRoute();
}

/** Fade the road out — the advice is over the moment the shot is taken. */
function retireCoachRoute() {
  if (routeBands) routeFade = Math.max(routeFade, 0.999);
  routeBands = routeBands && routeFade > 0 ? routeBands : null;
  routeFade = routeBands ? routeFade : 0;
  routeRetiring = true;
}
let routeRetiring = false;

function updateCoachRoute(dt) {
  if (!routeBands) return;
  routePhase = (routePhase + dt * ROUTE_MARCH) % ROUTE_SPACING;
  if (routeRetiring) {
    routeFade -= dt / 0.33;
    if (routeFade <= 0) {
      routeFade = 0;
      routeBands = null;
      routeRetiring = false;
      paintCoachRoute();
      return;
    }
  }
  paintCoachRoute();
}

/** Walk each band's polyline and drop an arrow every ROUTE_SPACING units. */
function paintCoachRoute() {
  const y = (TRAJECTORY.height ?? 0.12) - 0.02;
  for (let i = 0; i < routeSlots.length; i += 1) {
    const slot = routeSlots[i];
    const band = routeBands?.[i];
    if (!band?.segs?.length || routeFade <= 0) {
      slot.geo.setDrawRange(0, 0);
      slot.mesh.visible = false;
      continue;
    }
    let v = 0;
    const put = (px, pz, dx, dz, len, wide) => {
      if ((v + 3) * 3 > slot.positions.length) return;
      const nx = -dz;
      const nz = dx;
      slot.positions.set(
        [
          px + dx * len, y, pz + dz * len,
          px - dx * len * 0.35 + nx * wide, y, pz - dz * len * 0.35 + nz * wide,
          px - dx * len * 0.35 - nx * wide, y, pz - dz * len * 0.35 - nz * wide
        ],
        v * 3
      );
      v += 3;
    };

    const size = band.size ?? 1;
    let carried = ROUTE_SPACING - routePhase;
    let last = null;
    for (const seg of band.segs) {
      const dx = seg.bx - seg.ax;
      const dz = seg.bz - seg.az;
      const len = Math.hypot(dx, dz);
      if (len < 1e-5) continue;
      const ux = dx / len;
      const uz = dz / len;
      let at = carried;
      while (at <= len) {
        put(seg.ax + ux * at, seg.az + uz * at, ux, uz, 0.32 * size, 0.21 * size);
        at += ROUTE_SPACING;
      }
      carried = at - len;
      last = { x: seg.bx, z: seg.bz, ux, uz };
    }
    // THE POINTER AT THE END. A row of arrows says which way; this says where.
    if (last) put(last.x, last.z, last.ux, last.uz, 0.58 * size, 0.38 * size);

    slot.mat.color.setHex(band.ink ?? PALETTE.bone);
    slot.mat.opacity = (band.opacity ?? 0.5) * routeFade;
    slot.geo.setDrawRange(0, v);
    slot.geo.attributes.position.needsUpdate = true;
    slot.mesh.visible = v > 0;
  }
}

/**
 * Project one heading at one power from where the cue is now, without
 * disturbing the aim the player is holding.
 */
function projectShot(dir, power) {
  const held = player.aimPower;
  player.aimPower = power;
  try {
    const prediction = physics.predictTrajectory({ x: player.x, z: player.z }, dir, {
      radius: player.radius,
      maxBounces: Math.min(TRAJECTORY.previewBounces, player.maxBounces),
      maxDistance: Math.min(TRAJECTORY.maxDistance, carryDistance(launchSpeed())),
      bodies: game.enemies
    });
    return {
      prediction,
      cuePath: projectCuePath(prediction),
      objectPath: projectObjectPath(prediction)
    };
  } finally {
    player.aimPower = held;
  }
}

/**
 * THE RULE FOR CHOOSING WHICH SHOT TO COACH.
 *
 * The route used to be the projection of the board's stored `solve` heading,
 * with every leg it produced drawn — which put lines on the felt for balls the
 * card was not talking about, running off the table past the shot the player
 * was being asked to play. It read as wrong because it was answering a
 * different question.
 *
 * The rule now, stated once and applied to every board:
 *
 *   1. THE GOAL comes from the board — a ball into a named pocket, or a ball
 *      to be reached. It is the goal the card's sentence describes.
 *   2. EVERY HEADING is projected, at two powers, and marked as achieving the
 *      goal or not.
 *   3. THE SHOT IS THE MIDDLE OF THE WIDEST CONTIGUOUS RUN of headings that
 *      achieve it. Not the first that works and not the stored one: the middle
 *      of the widest window is the shot with the most room for error either
 *      side, which is the shot worth teaching.
 *   4. ONLY THE GOAL IS DRAWN — the cue's path to its first contact, and the
 *      target ball's path to its pocket. What the other balls do afterwards is
 *      true and irrelevant, and drawing it is what made the picture unreadable.
 *
 * @param {{number?: number, slot?: string, reach?: number}} want
 * @returns {Array|null} route bands, or null if the goal cannot be reached
 */
function solveCoachRoute(want = {}) {
  const pockets = rooms.table.pockets;
  if (!pockets?.length) return null;

  const STEP = 1.5;
  // ONE SWEEP, GROUPED BY WHAT IT ACHIEVES. Asking "can this particular ball
  // reach that particular pocket" one candidate at a time is the same sweep
  // over and over; sweeping once and filing each heading under the goal it
  // achieves answers every candidate at the price of one — which is what makes
  // it affordable for a board to ask "what CAN be done from here" before it
  // opens its mouth.
  const goals = new Map();
  for (let deg = 0; deg < 360; deg += STEP) {
    const th = (deg * Math.PI) / 180;
    const dir = { x: Math.sin(th), z: -Math.cos(th) };
    for (const power of [0.65, 0.95]) {
      const shot = projectShot(dir, power);
      if (!shot.objectPath.length) continue;
      // Losing the cue is judged on where it GOES after contact; the road is
      // drawn along how it gets there.
      const departure = shot.cuePath?.segments?.length
        ? shot.cuePath.segments
        : shot.prediction?.segments;
      if (pathPocket(departure, pockets)) continue;
      const found = goalLeg(shot, want, pockets);
      if (found.at < 0) continue;
      const key = `${found.number}|${found.slot ?? ''}`;
      let goal = goals.get(key);
      if (!goal) {
        goal = { hits: [], shots: new Map(), number: found.number, slot: found.slot };
        goals.set(key, goal);
      }
      goal.hits.push(deg);
      goal.shots.set(deg, { shot, at: found.at, approach: shot.prediction?.segments });
      break;
    }
  }
  if (!goals.size) return null;

  const chosen = bestGoal([...goals.values()], want);
  if (!chosen) return null;
  const mid = widestMiddle(chosen.hits, STEP);
  const picked = chosen.shots.get(mid);
  if (!picked) return null;

  const bands = [];
  // THE LINE TO AIM ALONG, not the one the cue leaves on. Where your ball ends
  // up after contact is what the live preview is for and what the ghost marks;
  // the road is the half of the shot the player has to choose, which is the
  // run from the cue to the ball it has to start on.
  if (picked.approach?.length) {
    bands.push({ segs: picked.approach, ink: PALETTE.player, opacity: 0.4, size: 0.85 });
  }
  // THE WHOLE CHAIN UP TO THE GOAL, and not one leg further. On a combination
  // the interesting part is the middle — the ball that turns and passes the
  // shot on — and stopping at the goal leg is what keeps the road a plan
  // rather than a scribble: everything past it is true, irrelevant, and what
  // made the first version of this unreadable.
  for (let i = 0; i <= picked.at; i += 1) {
    const leg = picked.shot.objectPath[i];
    if (leg?.segs?.length) bands.push({ segs: leg.segs, ink: inkOf(leg.ball), opacity: 0.62 });
  }
  // WHAT THE ROAD SAYS, in the same object as the road. A board that coaches
  // the shot in words and draws it on the felt has to take both from one
  // search, or the two eventually describe different strokes — which is how a
  // board came to tell a player to pot a ball that could not be reached from
  // where their cue was standing.
  bands.plan = { number: chosen.number, slot: chosen.slot };
  return bands;
}

/**
 * Which goal to coach, when the board has not named one.
 *
 * The shortest ball-to-pocket run on the table, because the angular tolerance
 * of a pot falls off as one over that distance — so the easiest shot is the
 * one the geometry supports rather than a preference. Among goals that tie,
 * the one with more working headings.
 */
function bestGoal(list, want) {
  if (want.number != null || want.reach != null) return list[0];
  let best = null;
  for (const goal of list) {
    const ball = game.enemies.find((e) => e.alive && e.number === goal.number);
    const pocket = rooms.table.pockets.find((p) => p.slot === goal.slot);
    if (!ball || !pocket) continue;
    const d = Math.hypot(pocket.x - ball.x, pocket.z - ball.z);
    if (!best || d < best.d - 0.01 || (Math.abs(d - best.d) <= 0.01 && goal.hits.length > best.goal.hits.length)) {
      best = { d, goal };
    }
  }
  return best?.goal ?? list[0];
}

/**
 * The middle of the widest contiguous run of working headings.
 *
 * Not the first that works and not a stored one: the middle of the widest
 * window is the shot with the most room for error either side, which is the
 * shot worth teaching.
 */
function widestMiddle(hits, step) {
  let best = { from: hits[0], to: hits[0] };
  let run = { from: hits[0], to: hits[0] };
  for (let i = 1; i < hits.length; i += 1) {
    if (hits[i] - hits[i - 1] <= step * 1.5) run.to = hits[i];
    else {
      if (run.to - run.from >= best.to - best.from) best = run;
      run = { from: hits[i], to: hits[i] };
    }
  }
  if (run.to - run.from >= best.to - best.from) best = run;
  const centre = (best.from + best.to) / 2;
  return hits.reduce((a, d) => (Math.abs(d - centre) < Math.abs(a - centre) ? d : a), hits[0]);
}

/**
 * The leg of this projection that achieves the goal, if any.
 *
 * @param {object} shot     a projection from projectShot
 * @param {object} want     {number, slot} | {reach} | {} for "any pot at all"
 * @param {Array}  pockets
 */
function goalLeg(shot, want, pockets) {
  const miss = { at: -1 };
  for (let i = 0; i < shot.objectPath.length; i += 1) {
    const leg = shot.objectPath[i];
    if (!leg?.segs?.length) continue;
    if (want.reach != null) {
      // "Reach this ball" boards: the shot has to move it, which is what a leg
      // in the chain means.
      if (leg.ball?.number === want.reach) return { at: i, number: want.reach };
      continue;
    }
    if (want.number != null && leg.ball?.number !== want.number) continue;
    const at = pathPocket(leg.segs, pockets);
    if (!at) continue;
    if (want.slot && at.slot !== want.slot) continue;
    return { at: i, number: leg.ball?.number, slot: at.slot };
  }
  return miss;
}

function refreshPrediction() {
  if (!player.alive) return;
  const prediction = physics.predictTrajectory({ x: player.x, z: player.z }, player.aimDir, {
    radius: player.radius,
    // Never preview more banks than the launch can actually survive — the
    // prediction lines are a promise, not a suggestion.
    maxBounces: Math.min(TRAJECTORY.previewBounces, player.maxBounces),
    // Nor more DISTANCE than the launch can survive. A preview that runs 46
    // units when the shot only carries 12 promises a shot nobody played.
    maxDistance: Math.min(TRAJECTORY.maxDistance, carryDistance(launchSpeed())),
    bodies: game.enemies
  });
  // The pockets go in so the preview can warn about a scratch: a line that
  // ends down a hole is the one prediction the player most needs in advance.
  const cuePath = projectCuePath(prediction);
  const objectPath = projectObjectPath(prediction);
  // ONE LIST, TWO RENDERERS. The ghost balls on the felt and the labels on the
  // UI layer are both drawn from these, so the shape you see and the words
  // next to it can never end up describing different places.
  game.aimTags = aimGhosts(prediction, cuePath, objectPath);
  player.showTrajectory(prediction, {
    pockets: rooms.table.pockets,
    power: player.aimPower,
    cuePath,
    objectPath,
    // One hue per leg, taken from the ball travelling it.
    legInks: objectPath.map((leg) => inkOf(leg.ball)),
    ghosts: game.aimTags
  });
}

/** Heading when the current hold began; used to measure how far it turned. */
let aimStartDir = null;

// THE DISMISSING PRESS IS ALSO THE FIRST AIM.
//
// This used to swallow the tap so a player could not read nothing and shoot
// immediately. But the banner already waits indefinitely — the tap IS the
// signal that they are done reading — and eating it meant the first press
// after every room did nothing at all. That does not read as "banner
// dismissed", it reads as the controls having stopped working, which is
// exactly how it was reported. The press clears the banner and goes on to
// start the aim, so the game answers every touch.
stage.addEventListener(
  'pointerdown',
  () => {
    if (hud.bannerWaiting) hud.hideBanner();
  },
  { capture: true }
);

const input = new InputManager(stage, {
  camera,
  // Aiming is only possible while the table is frozen. During a stroke the
  // pointer means something else entirely — see the freeze tap below.
  isEnabled: () =>
    game.running &&
    player.alive &&
    game.state !== 'modal' &&
    // A cleared room is decided. The exits are buttons on the scorecard now,
    // so there is nothing left to shoot at and a stray drag can only take the
    // cue ball somewhere confusing.
    game.state !== 'cleared' &&
    !menuOpen &&
    // A finished lesson is FINISHED: the table stops taking shots so the
    // completion card is not competing with a live cue.
    !tutorial?.awaitingNext &&
    game.phase === 'aim',
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
    showPad(aim);
    if (aim.valid) {
      refreshPrediction();
    } else {
      player.hideTrajectory();
      game.aimTags = null;
    }
  },
  onAimCancel: () => {
    uiLayer.classList.remove('aiming');
    wasMaxed = false;
    hud.setPad(null);
    if (engine.inBulletTime) audio.focusExit();
    engine.setBulletTime(false);
    player.cancelAim();
  },
  onRelease: (aim) => {
    uiLayer.classList.remove('aiming');
    wasMaxed = false;
    hud.setPad(null);
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
    hud.setPad(null);
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

/**
 * PUT THE COACHING BAND WHERE THERE IS NO TABLE.
 *
 * The camera frames the arena edge to edge — `viewHeight` is the arena's
 * height, not the arena plus a margin — so the felt runs from the top of the
 * layer to the bottom and the two far corner pockets sit up under the HUD.
 * There is exactly one horizontal strip with nothing in it: below those
 * corner pockets, above everything a board can place.
 *
 * The band is put there, measured rather than guessed. A percentage got it
 * right on a 9:16 phone by arithmetic accident and would have drifted onto
 * the felt on the next aspect ratio — and "it never overlaps play" is the one
 * property the whole direction rests on, so it should be true by construction.
 */
function layoutBand() {
  const pockets = rooms?.table?.pockets;
  const h = uiLayer.clientHeight;
  if (!pockets?.length || !h) return;
  // A lesson buys its own strip and puts the band in it (Tutorial._layoutCoach),
  // so there is nothing to anchor to the felt. Outside a lesson the band still
  // has to find the one gap in a table drawn edge to edge.
  if (bandReserve > 0.5) return;
  const visZ = (camera.top - camera.bottom) / camera.zoom;
  const toY = (z) => ((z - camera.position.z) / visZ + 0.5) * h;
  // The lowest edge of anything in the top row of pockets, plus a hair.
  let floor = 0;
  for (const p of pockets) {
    const y = toY(p.z);
    if (y > h * 0.25) continue; // not a far-side pocket
    floor = Math.max(floor, y + (p.radius / visZ) * h * TABLE.pocket.mouthScale);
  }
  uiLayer.style.setProperty('--coach-top', `${Math.round(floor + 4)}px`);
}

/* ------------------------------------------------------------------ *
 * THE RESERVE — screen given to the coach, taken off the table
 *
 * The band used to sit ON the felt, in the one strip a board could not place
 * anything in: below the far corner pockets, above the rack. That strip is
 * real, and it is still where the band goes with no reserve — but "a board
 * cannot place a ball there" is not the same as "a ball cannot END there",
 * and a ball that rolls up under the band is a ball the player cannot see.
 * Reported exactly that way: the yellow one went behind the bar.
 *
 * So a lesson buys the space instead of borrowing it. `bandReserve` is a strip
 * of screen at the top that the table is not drawn in; the arena shrinks to
 * fit what is left, and the band lives in the strip with nothing behind it.
 *
 * IT IS THE CAMERA, NOT THE CANVAS. Resizing the drawing buffer to make room
 * would reallocate the framebuffer and every post-processing target on each
 * frame of the animation. An orthographic frustum can be widened instead: the
 * canvas stays exactly as it is, the world simply maps into fewer of its
 * pixels. So the transition is free, and everything that projects world to
 * screen — the spotlight, the tags, the band's own anchor — already reads the
 * camera and follows without knowing anything happened.
 * ------------------------------------------------------------------ */

/**
 * Ask for a reserve. Animated, because the table growing back to full screen
 * at the end of the tutorial is the moment the game hands itself over — a jump
 * cut there reads as a bug rather than as a curtain going up.
 *
 * @param {number} px      how much screen to hold back
 * @param {boolean} [now]  skip the easing (entering the tutorial, a resize)
 */
function setBandReserve(px, now = false) {
  const want = Math.max(0, px || 0);
  if (Math.abs(want - bandReserveTarget) < 0.5 && !now) return;
  bandReserveTarget = want;
  if (now) {
    bandReserve = want;
    bandReserveT = 1;
  } else {
    bandReserveFrom = bandReserve;
    bandReserveT = 0;
  }
  // The stage changes shape once, here, for the value being moved TO.
  resize();
}

// Readable from a check, like the rest of the game's state — tools/ measures
// the strip the table gave up rather than inferring it from a screenshot.
if (typeof window !== 'undefined') {
  window.__reserve = () => ({ now: bandReserve, target: bandReserveTarget, eased: bandReserveT });
}

function updateBandReserve(dt) {
  if (bandReserveT >= 1) return;
  bandReserveT = Math.min(1, bandReserveT + dt / BAND_RESERVE_TIME);
  const u = bandReserveT;
  const k = u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2; // ease in-out cubic
  bandReserve = bandReserveFrom + (bandReserveTarget - bandReserveFrom) * k;
  applyReserve();
}

/**
 * Map the arena into the stage MINUS the reserve, and push it to the bottom.
 *
 * The stage is aspect-locked to the arena, so with no reserve the frustum is
 * the arena exactly and every world unit is the same number of pixels it has
 * always been. With one, the same arena has to fit in a shorter box: world
 * units per pixel goes up, the frustum grows to cover the whole canvas at that
 * scale, and the camera slides up-world by half the reserve so the surplus
 * lands above the table rather than around it.
 */
function applyReserve() {
  const h = stage.clientHeight;
  const w = stage.clientWidth;
  if (!h || !w) return;
  // A cap, so a band that somehow measured huge cannot squeeze the felt into
  // a letterbox. Past this the band overlaps again, which is the lesser fault.
  const reserve = Math.min(bandReserve, h * 0.42);
  const perPixel = viewHeight / Math.max(1, h - reserve);
  camera.top = (perPixel * h) / 2;
  camera.bottom = -camera.top;
  camera.right = (perPixel * w) / 2;
  camera.left = -camera.right;
  // -z is screen-up: moving the camera up-world pushes the table down-screen.
  // NOT via lookAt — the orientation was set once at boot and re-aiming at a
  // moved centre would tilt a camera whose whole job is to be straight down.
  //
  // AND THE ENGINE HAS TO BE TOLD, because it owns this position: it rewrites
  // camera.position from its own `basePosition` every frame to apply shake.
  // Setting only the camera meant the reserve was undone on the next frame —
  // and the guard that watched for the table intruding then bought the same
  // strip again, every frame, forever. That is what the table creeping down at
  // the start of every board actually was.
  const z = -(perPixel * reserve) / 2;
  camera.position.z = z;
  if (engine?.basePosition) engine.basePosition.z = z;
  camera.updateProjectionMatrix();
  layoutBand();
}

function resize() {
  const { width, height } = layoutStage();
  const pr = Math.min(window.devicePixelRatio || 1, RENDER.maxPixelRatio);
  renderer.setPixelRatio(pr);
  renderer.setSize(width, height, false);
  if (composer) {
    composer.setPixelRatio(pr);
    composer.setSize(width, height);
  }
  applyReserve();
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
  setBandReserve,
  solveCoachRoute,
  drawCoachRoute,
  resetRun: resetRunState,
  finish: () => startRun()
});
if (typeof window !== 'undefined') game.tutorial = tutorial;
const menuMain = document.getElementById('menu-main');
const menuSettings = document.getElementById('menu-settings');
const menuModes = document.getElementById('menu-modes');
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
  menuModes.hidden = true;
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
// MODES. Each mode is its own built page, so choosing one is a navigation and
// not a state change — `#mode-classic` is a plain link and needs no handler.
// The card for the mode already running is inert; it is there to say what you
// have, not to be pressed.
// The one-file build has no sibling pages to switch to, so it does not offer
// the door.
//
// This has to be the BARE identifier. Vite's `define` substitutes identifiers,
// not member expressions, so the first version of this read
// `globalThis.__SINGLE_FILE__`, was never substituted, read undefined, and
// left the button showing in exactly the build it was written to hide it in.
// The `typeof` guard survives a config that forgets to define it, and is
// itself substituted down to a constant in every build that does.
if (typeof __SINGLE_FILE__ !== 'undefined' && __SINGLE_FILE__) {
  $('btn-modes').hidden = true;
}
$('btn-modes').addEventListener('click', () => {
  menuMain.hidden = true;
  menuModes.hidden = false;
});
$('mode-back').addEventListener('click', () => {
  menuModes.hidden = true;
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
    // A body still dropping into a pocket keeps its mesh until it is out of
    // sight; disposing it on the frame it died is what made a pot a vanishing.
    if (!enemy.alive && !enemy.sinking) {
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
  updateBandReserve(rawDt);
  updateCoachRoute(rawDt);
  tutorial.update(rawDt);
  pulseCalledPocket(rawDt);
  pumpCelebrations(rawDt);
  pumpSinking(rawDt);

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
      // A FINISHED LESSON HAS NO AIM. The resting preview is redrawn every
      // frame, so hiding it once when the board completed lasted exactly one
      // frame — and a bright cue line still lying across the felt is the
      // loudest way a finished board goes on looking playable, dimmed table
      // and CTA notwithstanding.
      !tutorial?.awaitingNext &&
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

  // THE NUMERALS GO ON AFTER THE BLOOM, and that is the whole reason they can
  // be read at all.
  //
  // A ball is twenty pixels across and it is emissive, so the bloom pass pulls
  // its glow out and lays a blurred copy back over everything inside its own
  // silhouette. A numeral stroke on a ball that size is one or two pixels
  // wide; the blur fills it in completely. Measured out of the framebuffer, a
  // near-black digit on the yellow ball came back at 1.7:1 and on the blue one
  // at 1.1:1 — which is to say the numeral was not there. Every attempt to fix
  // that in the SPRITE failed for the same reason from a different direction:
  // dark ink is erased by the glow, and light ink is above the bloom threshold
  // and blows the whole ball out to white.
  //
  // So the numeral stops being part of the lit scene. It is drawn in a second
  // pass, straight onto the composited image, where nothing can bleed into it.
  if (composer) {
    camera.layers.disable(LAYER.overlay);
    composer.render();
    camera.layers.set(LAYER.overlay);
    const clear = renderer.autoClear;
    // autoClear alone is not enough: a scene BACKGROUND is painted on every
    // render whatever autoClear says, and this one is opaque obsidian — the
    // overlay pass wiped the composite it was supposed to be drawn on top of.
    const background = scene.background;
    scene.background = null;
    renderer.autoClear = false;
    renderer.render(scene, camera);
    renderer.autoClear = clear;
    scene.background = background;
    camera.layers.set(LAYER.world);
  } else {
    camera.layers.enableAll();
    renderer.render(scene, camera);
  }
}

requestAnimationFrame(frame);

// Expose the context for console-side tuning during playtests. The UI handles
// come too, so a reward screen can be summoned without clearing a room first.
if (import.meta.env?.DEV) {
  game.ui = { modal, hud, input, advanceRoom, openBoonModal, tutorial, rooms, player };
  window.__billiard = game;
}
