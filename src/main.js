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
  FEEL,
  BOONS,
  INJECTOR,
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

  const t = ARENA.railThickness;
  const railMat = new THREE.MeshStandardMaterial({
    color: PALETTE.rail,
    roughness: 0.6,
    metalness: 0.35,
    emissive: new THREE.Color(PALETTE.railGlow),
    emissiveIntensity: 0.22
  });
  const railSpecs = [
    { w: ARENA.width + t * 2, d: t, x: 0, z: -ARENA.halfH - t / 2 },
    { w: ARENA.width + t * 2, d: t, x: 0, z: ARENA.halfH + t / 2 },
    { w: t, d: ARENA.height, x: -ARENA.halfW - t / 2, z: 0 },
    { w: t, d: ARENA.height, x: ARENA.halfW + t / 2, z: 0 }
  ];
  for (const spec of railSpecs) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(spec.w, 0.9, spec.d), railMat);
    rail.position.set(spec.x, 0.35, spec.z);
    table.add(rail);
  }

  const outline = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-ARENA.halfW, 0.02, -ARENA.halfH),
      new THREE.Vector3(ARENA.halfW, 0.02, -ARENA.halfH),
      new THREE.Vector3(ARENA.halfW, 0.02, ARENA.halfH),
      new THREE.Vector3(-ARENA.halfW, 0.02, ARENA.halfH)
    ]),
    new THREE.LineBasicMaterial({ color: PALETTE.railGlow, transparent: true, opacity: 0.75 })
  );
  table.add(outline);

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
        const px = (scratch.x * 0.5 + 0.5) * w;
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
  chain: { count: 0, timer: 0, best: 0 },
  /** Hits landed during the current launch (drives Break Pulse). */
  launchHits: 0,
  /** Damage bonus granted by flying through an amplifier pyre. */
  pyreBonus: 0,
  hazardAccum: 0,
  deathTimer: 0,
  on: {}
};

const boons = new BoonSystem(game);
game.boons = boons;

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
  heavy: PALETTE.heavy
};

/** Step the cascade multiplier and play its pentatonic note. */
function chainStep() {
  const idx = Math.min(game.chain.count, CHAIN.multipliers.length - 1);
  const mult = CHAIN.multipliers[idx];
  game.chain.count += 1;
  game.chain.timer = CHAIN.window;
  game.chain.best = Math.max(game.chain.best, game.chain.count);
  audio.chainNote(game.chain.count - 1);
  return mult;
}

function chainMultiplier() {
  const idx = clamp(game.chain.count - 1, 0, CHAIN.multipliers.length - 1);
  return CHAIN.multipliers[idx];
}

function speedRatio(speed, lo = 0.35, hi = 2.2) {
  return clamp(speed / PLAYER.referenceSpeed, lo, hi);
}

function killEnemy(enemy) {
  audio.enemyDeath();
  fx.burst(enemy.x, enemy.z, 20, ENEMY_COLOR[enemy.type], 11, 1.5);
  fx.shockwave(enemy.x, enemy.z, ENEMY_COLOR[enemy.type], enemy.radius * 4.5, 0.36);
  player.addFocus(FOCUS.onKill);
}

/**
 * The single damage funnel. Boons, fields and zaps all route through here so
 * kills are handled exactly once, in exactly one place.
 */
function dealDamage(enemy, amount, opts = {}) {
  if (!enemy || !enemy.alive) return { dealt: 0, killed: false };
  // While a lesson is running the tutorial director owns every life in the
  // room. A rep resolves only when the thing being taught actually happened,
  // so a half-finished attempt can never delete the target you still need to
  // practise on — which is what makes a lesson unfailable.
  if (game.tutorialGuard && !game.tutorialGuard(enemy, amount, opts)) {
    return { dealt: 0, killed: false, blocked: true };
  }
  const result = enemy.takeDamage(amount, {
    ...opts,
    backstabBonus: player.stats.backstabBonus
  });
  if (!opts.silent && result.dealt > 0) {
    fx.burst(enemy.x, enemy.z, 4, ENEMY_COLOR[enemy.type], 5, 0.5);
  }
  if (result.killed) killEnemy(enemy);
  return result;
}
game.dealDamage = dealDamage;

/**
 * Kill outright, bypassing the damage funnel — and therefore bypassing the
 * tutorial guard above. The lesson director is the only thing allowed to use
 * it, because it is the only thing that knows whether a rep counted.
 */
game.forceKill = (enemy) => {
  if (!enemy || !enemy.alive) return;
  // Force means force: a target still inside its spawn telegraph shrugs damage
  // off, which would make a lesson's kill silently fail to happen.
  if (enemy.state === ENEMY_STATE.SPAWNING) {
    enemy.state = ENEMY_STATE.ACTIVE;
    enemy.spawnTimer = 0;
  }
  const result = enemy.takeDamage(enemy.hp + 1);
  if (result.killed) killEnemy(enemy);
};
game.tutorialGuard = null;

/**
 * final = base × speedRatio × chain × damageMult × bankBonus × firstHitBonus
 * (backstab and shield mitigation are applied inside Enemy.takeDamage)
 */
function strikeDamage(speed, mult) {
  let damage = PLAYER.strikeDamage * speedRatio(speed) * mult * player.stats.damageMult;
  if (player.bouncesUsed > 0) {
    damage *= 1 + player.stats.bankDamageBonus * player.bouncesUsed;
  }
  if (game.launchHits === 0) damage *= 1 + player.stats.firstHitBonus;
  damage *= 1 + game.pyreBonus;
  return damage;
}

game.on = {
  /* --- the cue strike ------------------------------------------------ */
  cueStrike({ player: p, enemy, x, z, speed, banked }) {
    const mult = chainStep();
    const result = dealDamage(enemy, strikeDamage(speed, mult), {
      fromX: p.x,
      fromZ: p.z,
      banked,
      source: 'cue',
      silent: true
    });
    game.launchHits += 1;
    tutorial.notify('hit', { enemy, banked, index: game.launchHits });

    // Chaining is the point of the game, so it gets the loudest feedback in it.
    // Every extra body in one launch escalates the callout, pays Focus back and
    // punches the camera — the mechanic teaches itself by being celebrated.
    if (game.launchHits >= 2) {
      const praise = TUTORIAL.praise[Math.min(game.launchHits, TUTORIAL.praise.length - 1)];
      fx.floatText(p.x, p.z - 2.4, praise, 'crit');
      fx.shockwave(x, z, PALETTE.carom, 5.5 + game.launchHits * 0.6, 0.4);
      engine.zoomPunch();
      audio.chainNote(game.launchHits);
      p.addFocus(TUTORIAL.praiseFocus);
    }

    engine.hitStop(result.backstab ? TIME.hitStopCrit : TIME.hitStop);
    engine.shake(speed * enemy.mass * 0.9);
    audio.impact(clamp(speed / PLAYER.launchSpeed, 0, 1));
    fx.burst(x, z, 10, ENEMY_COLOR[enemy.type], speed * 0.45);

    if (result.backstab) {
      audio.backstab();
      engine.zoomPunch();
      fx.floatText(x, z, 'BACKSTAB', 'crit');
    } else if (result.shielded) {
      fx.floatText(x, z, 'SHIELDED', 'block');
    }
    if (mult > 1) fx.floatText(p.x, p.z - 1.2, `×${mult}`, 'combo');

    p.addFocus(FOCUS.onChainHit);
    boons.onImpact({ player: p, enemy, x, z, speed, banked, result });
    return result;
  },

  /* --- the carom ----------------------------------------------------- */
  carom({ striker, target, x, z, speed }) {
    const mult = chainStep();
    const scale = clamp(speed / PLAYER.referenceSpeed, 0.4, 2.0);
    const damage = PHYSICS.caromDamage * scale * mult * player.stats.damageMult;
    // An object ball counts as a banked hit: it ignores frontal shields.
    dealDamage(target, damage, {
      fromX: striker.x,
      fromZ: striker.z,
      banked: true,
      source: 'carom',
      silent: true
    });
    dealDamage(striker, damage * 0.55, { source: 'carom', silent: true });

    engine.hitStop(TIME.hitStopCrit);
    engine.shake(speed * 2.6);
    engine.zoomPunch();
    audio.carom();
    fx.floatText(x, z, 'CAROM!', 'carom');
    fx.burst(x, z, 24, PALETTE.carom, speed * 0.7, 1.2);
    fx.shockwave(x, z, PALETTE.carom, 4.2, 0.45);
    player.addFocus(FOCUS.onCarom);

    boons.onImpact({ player, enemy: target, x, z, speed, banked: true, result: null });
  },

  /* --- the wall-splat ------------------------------------------------ */
  wallSplat({ enemy, x, z, nx, nz, speed }) {
    const mult = chainStep();
    const scale = clamp(speed / PHYSICS.wallSplatSpeed, 1, 2.4);
    dealDamage(enemy, PHYSICS.wallSplatDamage * scale * mult, {
      source: 'splat',
      silent: true
    });

    engine.hitStop(TIME.hitStopCrit);
    engine.shake(speed * 2.1);
    engine.zoomPunch(FEEL.zoomPunch * 0.7);
    audio.wallSplat();
    fx.floatText(x, z, 'SPLAT!', 'splat');
    fx.spray(x, z, 18, ENEMY_COLOR[enemy.type], speed * 0.8, nx, nz);
    player.addFocus(FOCUS.onWallSplat);
  },

  /**
   * The discharge. Until now a shot had a death effect and an impact effect but
   * nothing at all at the muzzle, so the brightest moment near the enemy was
   * its charge ring switching off — the table got dimmer at the exact instant
   * it fired, and the bullet read as having appeared rather than been shot.
   */
  enemyFired({ x, z, dirX, dirZ }) {
    fx.burst(x, z, 9, PALETTE.projectile, 9, 0.34);
    fx.shockwave(x, z, PALETTE.projectile, 1.5, 0.16);
    // A short spit of sparks down the barrel line, so the shot has a direction
    // even in the frame before the bullet has travelled anywhere.
    fx.burst(x + dirX * 0.5, z + dirZ * 0.5, 5, PALETTE.spark, 13, 0.22);
    engine.shake(1.6);
  },

  enemyRebound({ enemy, x, z, speed }) {
    if (speed < 6) return;
    fx.burst(x, z, 3, ENEMY_COLOR[enemy.type], speed * 0.25, 0.6);
  },

  /* --- player events ------------------------------------------------- */
  playerRebound(event) {
    const { player: p, x, z, speed, kind } = event;
    audio.rebound(clamp(speed / PLAYER.launchSpeed, 0, 1));
    engine.shake(speed * 0.4);

    if (kind === 'bumper') {
      // Kinetic bumper: amplify, refund the bounce, keep the pinball alive.
      const current = Math.hypot(p.vx, p.vz) || 1;
      const target = Math.max(current * INJECTOR.bumper.boost, INJECTOR.bumper.minOut);
      const scale = target / current;
      p.vx *= scale;
      p.vz *= scale;
      if (INJECTOR.bumper.refundsBounce) p.bouncesUsed = Math.max(0, p.bouncesUsed - 1);
      p.addFocus(INJECTOR.bumper.focus);
      audio.bumper();
      fx.burst(x, z, 12, PALETTE.bumper, 11, 0.8);
      fx.shockwave(x, z, PALETTE.bumper, 2.6, 0.3);
    } else {
      fx.burst(x, z, 5, PALETTE.railGlow, speed * 0.3, 0.6);
    }

    boons.onRebound(event);
  },

  playerLaunch(event) {
    // The release is the payoff for the wind-up, so it scales with it: a
    // fully-charged shot gets a bigger burst, a ring, a camera punch and a
    // brief freeze, while a quick tap still snaps cleanly without ceremony.
    const p = event.power ?? 1;
    audio.slingshot(p);
    fx.burst(event.x, event.z, 8 + Math.round(p * 16), PALETTE.player, event.speed * 0.3, 0.7);
    fx.shockwave(event.x, event.z, PALETTE.player, 1.8 + p * 3.4, 0.22 + p * 0.16);
    engine.shake(event.speed * p * 1.3);
    if (p > 0.75) {
      engine.zoomPunch();
      engine.hitStop(TIME.hitStop * 0.7);
    }
    tutorial.notify('launch', { power: p, turned: game.lastTurn || 0 });
    game.launchHits = 0;
    game.pyreBonus = 0;
    boons.onLaunch(event);
  },

  playerDash() {
    audio.rebound(0.4);
    game.launchHits = 0;
    game.pyreBonus = 0;
  },

  playerTouched({ player: p, enemy }) {
    // Lessons are practice, not a fight: a target you are still learning to
    // hit does not get to chip away at you while you work it out.
    if (game.tutorialGuard) return;
    if (p.touchTimer > 0) return;
    if (p.takeDamage(enemy.config.contactDamage, game, enemy)) {
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
    hud.showBanner('Run Over', `Reached room ${game.level} · best chain ${game.chain.best}`, 2.4);
  },

  projectileHit({ projectile, player: p }) {
    fx.burst(projectile.x, projectile.z, 8, PALETTE.projectile, 7, 0.7);
    // A lesson shows you the shot; it does not charge you for it. The impact
    // still lands and still reads, but a tutorial you can lose is not one.
    if (game.tutorialGuard) {
      hud.flashDamage();
      engine.shake(6);
      return;
    }
    p.takeDamage(projectile.damage, game, projectile);
  },

  projectileExpired({ projectile }) {
    fx.burst(projectile.x, projectile.z, 4, PALETTE.projectile, 4, 0.5);
  },

  /* --- environmental injectors --------------------------------------- */
  zoneEnter({ zone, player: p }) {
    if (zone.kind !== 'pyre') return;
    if (p.pyreTimer > 0 || p.state !== PLAYER_STATE.LAUNCHED) return;
    const current = Math.hypot(p.vx, p.vz);
    if (current < 1) return;
    const target = Math.min(current * INJECTOR.pyre.boost, INJECTOR.pyre.maxSpeed);
    const scale = target / current;
    p.vx *= scale;
    p.vz *= scale;
    p.pyreTimer = INJECTOR.pyre.cooldown;
    game.pyreBonus = INJECTOR.pyre.damageBonus;
    audio.pyre();
    fx.shockwave(zone.x, zone.z, PALETTE.pyre, 4, 0.36);
    fx.burst(zone.x, zone.z, 14, PALETTE.pyre, 12, 0.9);
    fx.floatText(zone.x, zone.z, 'AMPLIFIED', 'crit');
  },

  hazardTick({ player: p, dt }) {
    if (p.invulnerable || !p.alive) return;
    game.hazardAccum += INJECTOR.hazard.dps * dt;
    if (game.hazardAccum >= 4) {
      const damage = game.hazardAccum;
      game.hazardAccum = 0;
      p.takeDamage(damage, game, 'hazard');
    }
  }
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
    case 'focus':
      return `+${PROGRESSION.statRewards.focusMax.toFixed(1)}s focus`;
    case 'power':
      return `+${Math.round(PROGRESSION.statRewards.damage * 100)}% damage`;
    case 'ricochet':
      return `+${PROGRESSION.statRewards.bounce} bounce`;
    default:
      return door.reward.label;
  }
}

const cssHex = (value) => `#${value.toString(16).padStart(6, '0')}`;

function handleRoomClear() {
  game.state = 'cleared';
  audio.roomClear();
  player.addFocus(FOCUS.onRoomClear);
  engine.zoomPunch(FEEL.zoomPunch * 1.4);
  hud.showBanner('Room Clear', 'Shoot into an exit', 2.4);
  hud.setDoors(
    rooms.doors.map((door) => ({
      x: door.x,
      // Labels sit below the gate so they never collide with the HUD band.
      z: door.z + door.hh + 1.0,
      text: doorLabelText(door),
      color: cssHex(door.color)
    }))
  );
}

function handleDoorEntered(door) {
  audio.doorOpen();
  hud.setDoors([]);
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
    case 'focus':
      boons.addRunBonus({ focusMax: PROGRESSION.statRewards.focusMax });
      hud.showBanner('Focus Up', `+${PROGRESSION.statRewards.focusMax.toFixed(1)}s bullet-time`, 1.6);
      break;
    case 'power':
      boons.addRunBonus({ damageMult: 1 + PROGRESSION.statRewards.damage });
      hud.showBanner('Power Up', `+${Math.round(PROGRESSION.statRewards.damage * 100)}% damage`, 1.6);
      break;
    case 'ricochet':
      boons.addRunBonus({ maxBounces: PROGRESSION.statRewards.bounce });
      hud.showBanner('Ricochet', `+${PROGRESSION.statRewards.bounce} wall bounce`, 1.6);
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
      advanceRoom();
    },
    { level: game.level, phase }
  );
}

function advanceRoom() {
  game.level += 1;
  game.chain.count = 0;
  game.chain.timer = 0;
  game.launchHits = 0;
  game.pyreBonus = 0;
  game.hazardAccum = 0;
  boons.clearFields();
  fx.clearTexts();
  hud.setDoors([]);

  rooms.generate(game.level);
  player.placeAt(rooms.layout.spawn.x, spawnZ());
  player.addFocus(player.focusMax);
  game.state = 'playing';
  // Every room opens facing 12 o'clock. Carrying the last room's heading over
  // meant arriving already pointed at a wall for no reason the player chose,
  // and a fixed start is one less thing to re-read on entry.
  input.setHeading(0, -1);
  showRoomBanner();
}

/**
 * Lead with the lesson while there is still one to teach, and only fall back to
 * the layout name once the player is past the tutorial rooms — by then the
 * table's shape is the interesting thing about a new room.
 */
/** Spawn height: PLAYER.spawnFromBottom of the table, measured up from the bottom. */
function spawnZ() {
  return ARENA.halfH - ARENA.height * PLAYER.spawnFromBottom;
}

function showRoomBanner() {
  const lesson = TUTORIAL.lessons[game.level];
  if (lesson) hud.showBanner(lesson.title, lesson.sub, 2.6);
  else hud.showBanner(`Room ${game.level}`, rooms.layout.name, 1.5);
}

/** Everything a fresh start clears, minus the room itself. */
function resetRunState() {
  boons.reset();
  boons.recompute();
  hud.setBuild(boons.owned);
  game.level = PROGRESSION.startRoom;
  game.chain.count = 0;
  game.chain.timer = 0;
  game.chain.best = 0;
  game.launchHits = 0;
  game.pyreBonus = 0;
  game.hazardAccum = 0;
  game.state = 'playing';
  hud.setDoors([]);
}

function startRun() {
  resetRunState();
  // Leaving the tutorial (or never entering it) hands the room back to the
  // normal rules, including the ones that can hurt you.
  game.tutorialGuard = null;
  rooms.runSeed = (Math.random() * 0xffffffff) >>> 0;
  rooms.generate(game.level);
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
  player.showTrajectory(prediction);
}

/** Heading when the current hold began; used to measure how far it turned. */
let aimStartDir = null;

const input = new InputManager(stage, {
  camera,
  isEnabled: () =>
    game.running && player.alive && game.state !== 'modal' && !menuOpen,
  // The ball is what the cursor aims from.
  getAnchor: () => ({ x: player.x, z: player.z }),
  onAimStart: () => {
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
    player.updateAim(aim);
    if (aim.valid) refreshPrediction();
    else player.hideTrajectory();
  },
  onAimCancel: () => {
    if (engine.inBulletTime) audio.focusExit();
    engine.setBulletTime(false);
    player.cancelAim();
  },
  onRelease: (aim) => {
    if (aimStartDir) {
      const dot = clamp(aimStartDir.x * aim.dirX + aimStartDir.z * aim.dirZ, -1, 1);
      game.lastTurn = (Math.acos(dot) * 180) / Math.PI;
      aimStartDir = null;
    }
    if (engine.inBulletTime) audio.focusExit();
    engine.setBulletTime(false);
    player.launch(aim, game);
  },
  onFlick: (aim) => {
    engine.setBulletTime(false);
    player.cancelAim();
    player.dash(aim.dirX, aim.dirZ, game);
  }
});

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
  spawnZ,
  resetRun: resetRunState,
  finish: () => startRun()
});
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

  if (game.chain.timer > 0) {
    game.chain.timer -= dt;
    if (game.chain.timer <= 0) game.chain.count = 0;
  }

  rooms.update(dt, game);
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

  const aiming = input.isAiming && player.state === PLAYER_STATE.AIMING;

  // Running out of Focus kicks you back to real time but does not cancel the
  // aim — you can still take the shot, you just lose the planning window.
  if (aiming && player.focus <= 0 && engine.inBulletTime) engine.setBulletTime(false);
  if (aiming && !engine.inBulletTime && player.focus > FOCUS.minToAim) engine.setBulletTime(true);

  if (game.running) {
    if (game.state === 'dead') {
      game.deathTimer -= rawDt;
      if (game.deathTimer <= 0) startRun();
    } else if (dt > 0) {
      simulate(dt, rawDt, aiming && engine.inBulletTime);
    } else if (game.state !== 'modal') {
      // Frozen (hit-stop): keep presentation alive, skip simulation.
      player.update(0, rawDt, game, aiming && engine.inBulletTime);
    }
    // While the ball is travelling under its own steam, the compass needle
    // follows it. When it settles the needle is simply left where the ball was
    // last heading, which is the default the next shot starts from.
    if (!aiming && player.speed > PLAYER.settleSpeed) {
      input.setHeading(player.vx, player.vz);
    }

    // Re-derive the aim now that the ball has finished moving, so a held thumb
    // keeps pointing at the ball rather than at where it was a frame ago.
    if (aiming) {
      const aim = input.refresh();
      if (aim) {
        player.updateAim(aim);
        if (aim.valid) refreshPrediction();
        else player.hideTrajectory();
        tutorial.notify('aiming', { draw: aim.pullLength || 0 });
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

    hud.update(
      {
        hp: player.hp,
        maxHp: player.maxHp,
        focus: player.focus,
        focusMax: player.focusMax,
        level: game.level,
        waveIndex: rooms.waveIndex,
        waveCount: rooms.cleared ? 0 : rooms.waves.length,
        layout: rooms.layout ? rooms.layout.name : '',
        chain: game.chain.count,
        chainMult: chainMultiplier()
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
