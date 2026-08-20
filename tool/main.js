/**
 * tool/main.js — the table editor behind /tool.
 *
 * It reads the same two sources the game reads and nothing else:
 *
 *   src/data/layouts.json      the tables themselves
 *   src/systems/ThreatDirector the rules that decide what spawns on them
 *
 * That is the whole design constraint. An editor that keeps its own copy of the
 * arena size, the enemy radii or the spawn rules will eventually disagree with
 * the game, and it will be the editor that looks authoritative — you would be
 * placing an Eight-Ball against a footprint the game does not actually use. So
 * every number drawn here comes from config.js, and the "Roll" button runs the
 * real director rather than an approximation of it.
 *
 * A static page cannot write to the repository, so the output is a download (or
 * a clipboard copy) of the whole layouts.json, which replaces the file in-tree.
 */

import sourceDoc from '../src/data/layouts.json';
import lessonDoc from '../src/data/lessons.json';
import { ARENA, ENEMY, ROOM } from '../src/config.js';
import { makeRng, roomSeed, buildWaves, budgetFor, waveCountFor } from '../src/systems/ThreatDirector.js';

/* ------------------------------------------------------------------ *
 * Constants drawn from the game
 * ------------------------------------------------------------------ */

const TYPE_COLOR = { solid: '#ff3d6e', stripe: '#a05cff', heavy: '#ffb340' };
const TYPE_LABEL = { solid: 'Solid', stripe: 'Stripe', heavy: 'Eight-Ball' };
/** The cue ball's own radius — the safe-spawn ring is drawn around its spawn. */
const PLAYER_RADIUS = 0.62;
/** Where the ball actually starts: ARENA.halfH - height * PLAYER.spawnFromBottom. */
const BALL_SPAWN_Z = 6.4;
/**
 * The instruction card covers this band of the table. Racks placed inside it
 * are invisible to the player, which is the single easiest mistake to make when
 * authoring a lesson — so the editor draws it.
 */
const CARD_TOP_Z = -10.1;
const CARD_BOTTOM_Z = -5.4;

/* ------------------------------------------------------------------ *
 * State
 * ------------------------------------------------------------------ */

const clone = (v) => JSON.parse(JSON.stringify(v));

/**
 * Two documents, one editor. Rooms are the procedural pool; Lessons are the
 * tutorial's authored tables (src/data/lessons.json), which have a `rest`
 * heading and an optional goal bar instead of anchors and waves.
 */
const DOCS = {
  rooms: { source: sourceDoc, file: 'layouts.json', key: 'layouts', label: 'Tables' },
  lessons: { source: lessonDoc, file: 'lessons.json', key: 'lessons', label: 'Lessons' }
};

const state = {
  mode: 'rooms',
  docs: { rooms: clone(sourceDoc), lessons: clone(lessonDoc) },
  doc: clone(sourceDoc),
  layout: 0,
  wave: 0,
  /** { group: 'obstacle'|'anchor'|'enemy'|'spawn', index: number } */
  sel: null,
  snap: 0.25,
  showAnchors: true,
  level: 5,
  seed: 1337,
  rolled: null,
  drag: null
};

const undo = [];
const redo = [];

function snapshot() {
  undo.push(JSON.stringify(state.doc));
  if (undo.length > 120) undo.shift();
  redo.length = 0;
  refreshHistory();
}

function refreshHistory() {
  $('btn-undo').disabled = !undo.length;
  $('btn-redo').disabled = !redo.length;
}

const $ = (id) => document.getElementById(id);
const isLessons = () => state.mode === 'lessons';
const docKey = () => DOCS[state.mode].key;
const records = () => state.doc[docKey()] || [];
const layout = () => records()[state.layout] || {};
const round = (v) => Math.round(v * 1000) / 1000;

/** Where a lesson-free room's enemies live: authored waves, else the last roll. */
function waves() {
  const l = layout();
  // A lesson has one flat, always-authored set of balls — no waves, no rolls.
  if (isLessons()) return [l.enemies || (l.enemies = [])];
  if (l.waves && l.waves.length) return l.waves;
  return state.rolled || [];
}

function authored() {
  const l = layout();
  return !!(l.waves && l.waves.length);
}

/* ------------------------------------------------------------------ *
 * Canvas
 * ------------------------------------------------------------------ */

const cv = $('cv');
const ctx = cv.getContext('2d');
let scale = 20;

function fitCanvas() {
  const wrap = $('canvas-wrap');
  const h = Math.max(320, wrap.clientHeight - 4);
  const w = h * (ARENA.width / ARENA.height);
  scale = h / ARENA.height;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.style.width = `${w}px`;
  cv.style.height = `${h}px`;
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}

const sx = (x) => (x + ARENA.halfW) * scale;
const sy = (z) => (z + ARENA.halfH) * scale;
const wx = (px) => px / scale - ARENA.halfW;
const wz = (py) => py / scale - ARENA.halfH;

function draw() {
  const w = ARENA.width * scale;
  const h = ARENA.height * scale;
  ctx.clearRect(0, 0, w, h);

  // felt
  const felt = ctx.createLinearGradient(0, 0, 0, h);
  felt.addColorStop(0, '#06231d');
  felt.addColorStop(1, '#04150f');
  ctx.fillStyle = felt;
  ctx.fillRect(0, 0, w, h);

  // grid on world units
  ctx.strokeStyle = 'rgba(20, 98, 76, 0.55)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = -ARENA.halfW; x <= ARENA.halfW; x += 1) {
    const p = Math.round(sx(x)) + 0.5;
    ctx.moveTo(p, 0);
    ctx.lineTo(p, h);
  }
  for (let z = -ARENA.halfH; z <= ARENA.halfH; z += 1) {
    const p = Math.round(sy(z)) + 0.5;
    ctx.moveTo(0, p);
    ctx.lineTo(w, p);
  }
  ctx.stroke();

  // centre lines
  ctx.strokeStyle = 'rgba(53, 242, 255, 0.22)';
  ctx.beginPath();
  ctx.moveTo(Math.round(sx(0)) + 0.5, 0);
  ctx.lineTo(Math.round(sx(0)) + 0.5, h);
  ctx.moveTo(0, Math.round(sy(0)) + 0.5);
  ctx.lineTo(w, Math.round(sy(0)) + 0.5);
  ctx.stroke();

  // door band along the top rail, so nothing is authored underneath an exit
  const inset = ROOM.door.inset;
  ctx.fillStyle = 'rgba(53, 242, 255, 0.07)';
  ctx.fillRect(0, 0, w, sy(-ARENA.halfH + inset + ROOM.door.height));
  ctx.strokeStyle = 'rgba(53, 242, 255, 0.25)';
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(0, Math.round(sy(-ARENA.halfH + inset + ROOM.door.height)) + 0.5);
  ctx.lineTo(w, Math.round(sy(-ARENA.halfH + inset + ROOM.door.height)) + 0.5);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(53, 242, 255, 0.45)';
  ctx.font = '10px ui-monospace, monospace';
  ctx.fillText('EXIT DOORS', 8, 14);

  const l = layout();

  // --- safe spawn ring: the director will not place anything inside it ---
  if (!isLessons() && l.spawn) {
    ctx.strokeStyle = 'rgba(255, 179, 64, 0.28)';
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(sx(l.spawn.x), sy(l.spawn.z), ROOM.safeSpawnRadius * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // --- the band the instruction card covers, which nothing should sit under ---
  if (isLessons()) {
    ctx.fillStyle = 'rgba(255, 179, 64, 0.07)';
    ctx.fillRect(0, sy(CARD_TOP_Z), w, (CARD_BOTTOM_Z - CARD_TOP_Z) * scale);
    ctx.strokeStyle = 'rgba(255, 179, 64, 0.3)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, Math.round(sy(CARD_BOTTOM_Z)) + 0.5);
    ctx.lineTo(w, Math.round(sy(CARD_BOTTOM_Z)) + 0.5);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255, 179, 64, 0.55)';
    ctx.font = '10px ui-monospace, monospace';
    ctx.fillText('INSTRUCTION CARD', 8, sy(CARD_TOP_Z) + 14);
  }

  // --- the goal bar (lessons only) ---
  if (l.goal) {
    const on = isSel('goal', 0);
    ctx.fillStyle = 'rgba(255, 61, 110, 0.28)';
    ctx.strokeStyle = '#ff3d6e';
    ctx.lineWidth = on ? 3 : 1.8;
    ctx.beginPath();
    ctx.rect(sx(l.goal.x - l.goal.hw), sy(l.goal.z - l.goal.hh),
             l.goal.hw * 2 * scale, l.goal.hh * 2 * scale);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 61, 110, 0.9)';
    ctx.font = '10px ui-monospace, monospace';
    ctx.fillText('GOAL', sx(l.goal.x - l.goal.hw) + 6, sy(l.goal.z - l.goal.hh) + 14);
    if (on) drawSelection({ type: 'box', x: l.goal.x, z: l.goal.z, hw: l.goal.hw, hh: l.goal.hh });
  }

  // --- the resting cue: the line the lesson opens on ---
  if (isLessons() && l.rest) {
    const px = l.spawn ? l.spawn.x : 0;
    const pz = BALL_SPAWN_Z;
    ctx.strokeStyle = 'rgba(255, 226, 122, 0.75)';
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.moveTo(sx(px), sy(pz));
    ctx.lineTo(sx(px + l.rest.x * 40), sy(pz + l.rest.z * 40));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // --- obstacles ---
  (l.obstacles || []).forEach((o, i) => {
    const on = isSel('obstacle', i);
    const bumper = o.kind === 'bumper';
    ctx.fillStyle = bumper ? 'rgba(46, 242, 196, 0.22)' : 'rgba(29, 111, 122, 0.30)';
    ctx.strokeStyle = bumper ? '#2ef2c4' : '#1d6f7a';
    ctx.lineWidth = on ? 2.5 : 1.5;
    ctx.beginPath();
    if (o.type === 'circle') ctx.arc(sx(o.x), sy(o.z), o.radius * scale, 0, Math.PI * 2);
    else ctx.rect(sx(o.x - o.hw), sy(o.z - o.hh), o.hw * 2 * scale, o.hh * 2 * scale);
    ctx.fill();
    ctx.stroke();
    if (on) drawSelection(o);
  });

  // --- anchors: candidate spawn points for the director ---
  if (state.showAnchors && !isLessons()) {
    (l.anchors || []).forEach((a, i) => {
      const on = isSel('anchor', i);
      const sp0 = l.spawn || { x: 0, z: 11 };
      const dead = Math.hypot(a.x - sp0.x, a.z - sp0.z) < ROOM.safeSpawnRadius;
      ctx.strokeStyle = dead ? 'rgba(255, 90, 61, 0.6)' : 'rgba(234, 246, 255, 0.5)';
      ctx.lineWidth = on ? 2.5 : 1.2;
      ctx.beginPath();
      ctx.arc(sx(a.x), sy(a.z), 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sx(a.x) - 9, sy(a.z));
      ctx.lineTo(sx(a.x) + 9, sy(a.z));
      ctx.moveTo(sx(a.x), sy(a.z) - 9);
      ctx.lineTo(sx(a.x), sy(a.z) + 9);
      ctx.stroke();
      if (on) drawRing(a.x, a.z, 12);
    });
  }

  // --- enemies, current wave solid and the rest ghosted ---
  const ws = waves();
  ws.forEach((wave, wi) => {
    const current = wi === state.wave;
    wave.forEach((e, i) => {
      const cfg = ENEMY[e.type] || ENEMY.solid;
      const color = TYPE_COLOR[e.type] || '#ff3d6e';
      ctx.globalAlpha = current ? 1 : 0.22;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(sx(e.x), sy(e.z), cfg.radius * scale, 0, Math.PI * 2);
      ctx.globalAlpha = current ? 0.35 : 0.1;
      ctx.fill();
      ctx.globalAlpha = current ? 1 : 0.3;
      ctx.strokeStyle = color;
      ctx.lineWidth = current && isSel('enemy', i) ? 3 : 1.6;
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = '600 10px ui-sans-serif, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${wi + 1}`, sx(e.x), sy(e.z) + 3.5);
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
      if (current && isSel('enemy', i)) drawRing(e.x, e.z, cfg.radius * scale + 7);
    });
  });

  // --- player spawn ---
  // In a lesson the ball always starts at the same place — the racks are drawn
  // around it — so it is shown where it will actually be, not where the layout
  // record says.
  const spawnX = isLessons() ? 0 : (l.spawn ? l.spawn.x : 0);
  const spawnZ = isLessons() ? BALL_SPAWN_Z : (l.spawn ? l.spawn.z : 11);
  const on = isSel('spawn', 0);
  ctx.fillStyle = 'rgba(53, 242, 255, 0.35)';
  ctx.strokeStyle = '#35f2ff';
  ctx.lineWidth = on ? 3 : 1.8;
  ctx.beginPath();
  ctx.arc(sx(spawnX), sy(spawnZ), PLAYER_RADIUS * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  if (on) drawRing(spawnX, spawnZ, PLAYER_RADIUS * scale + 7);
}

function drawRing(x, z, r) {
  ctx.strokeStyle = '#ffb340';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.arc(sx(x), sy(z), r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

/** The bottom-right resize grip for a selected obstacle. */
function handlePos(o) {
  if (o.type === 'circle') return { x: o.x + o.radius, z: o.z };
  return { x: o.x + o.hw, z: o.z + o.hh };
}

function drawSelection(o) {
  const h = handlePos(o);
  ctx.fillStyle = '#ffb340';
  ctx.fillRect(sx(h.x) - 4, sy(h.z) - 4, 8, 8);
}

const isSel = (group, index) => state.sel && state.sel.group === group && state.sel.index === index;

/* ------------------------------------------------------------------ *
 * Hit testing and dragging
 * ------------------------------------------------------------------ */

function pick(x, z) {
  const l = layout();

  // The grip wins, so a small obstacle can still be resized.
  if (state.sel && state.sel.group === 'obstacle') {
    const o = l.obstacles[state.sel.index];
    if (o) {
      const h = handlePos(o);
      if (Math.hypot(x - h.x, z - h.z) * scale < 8) return { ...state.sel, resize: true };
    }
  }

  const wave = waves()[state.wave] || [];
  for (let i = wave.length - 1; i >= 0; i--) {
    const cfg = ENEMY[wave[i].type] || ENEMY.solid;
    if (Math.hypot(x - wave[i].x, z - wave[i].z) <= cfg.radius) return { group: 'enemy', index: i };
  }

  if (l.goal && Math.abs(x - l.goal.x) <= l.goal.hw && Math.abs(z - l.goal.z) <= l.goal.hh) {
    return { group: 'goal', index: 0 };
  }
  const sp = l.spawn || { x: 0, z: 11 };
  if (Math.hypot(x - sp.x, z - sp.z) <= PLAYER_RADIUS + 0.2) return { group: 'spawn', index: 0 };

  if (state.showAnchors) {
    for (let i = (l.anchors || []).length - 1; i >= 0; i--) {
      if (Math.hypot(x - l.anchors[i].x, z - l.anchors[i].z) * scale <= 10) {
        return { group: 'anchor', index: i };
      }
    }
  }

  for (let i = (l.obstacles || []).length - 1; i >= 0; i--) {
    const o = l.obstacles[i];
    const hit = o.type === 'circle'
      ? Math.hypot(x - o.x, z - o.z) <= o.radius
      : Math.abs(x - o.x) <= o.hw && Math.abs(z - o.z) <= o.hh;
    if (hit) return { group: 'obstacle', index: i };
  }
  return null;
}

/**
 * Resolve a selection to the object it points at.
 *
 * Enemies are the awkward case: until a table is authored they live in the
 * director's roll, which is a throwaway. Editing one there looks like it worked
 * and then vanishes on export. So any call that is about to *change* an enemy
 * pins the table first — `ensureAuthored` copies the roll into the document
 * preserving order, which keeps the index valid.
 *
 * @param {object|null} sel
 * @param {boolean} [mutate] true when the caller is about to write
 */
function target(sel, mutate = false) {
  const l = layout();
  if (!sel) return null;
  if (sel.group === 'obstacle') return (l.obstacles || [])[sel.index];
  if (sel.group === 'anchor') return (l.anchors || [])[sel.index];
  if (sel.group === 'spawn') return l.spawn || (l.spawn = { x: 0, z: 11 });
  if (sel.group === 'goal') return l.goal;
  if (sel.group === 'enemy') {
    if (mutate) ensureAuthored();
    return (waves()[state.wave] || [])[sel.index];
  }
  return null;
}

/** Write one field on the current selection, pinning the table if needed. */
function setField(key, value) {
  const o = target(state.sel, true);
  if (o) o[key] = value;
}

const snapTo = (v, free) => (free || !state.snap ? round(v) : round(Math.round(v / state.snap) * state.snap));

cv.addEventListener('pointerdown', (e) => {
  const r = cv.getBoundingClientRect();
  const x = wx(e.clientX - r.left);
  const z = wz(e.clientY - r.top);
  const hit = pick(x, z);
  state.sel = hit ? { group: hit.group, index: hit.index } : null;
  if (hit) {
    snapshot();
    const t = target(state.sel);
    state.drag = { resize: !!hit.resize, ox: x - t.x, oz: z - t.z };
    cv.setPointerCapture(e.pointerId);
  }
  renderInspector();
  draw();
});

cv.addEventListener('pointermove', (e) => {
  const r = cv.getBoundingClientRect();
  const x = wx(e.clientX - r.left);
  const z = wz(e.clientY - r.top);
  status(`x ${x.toFixed(2)}   z ${z.toFixed(2)}`);
  if (!state.drag) return;
  const t = target(state.sel, true);
  if (!t) return;

  if (state.drag.resize) {
    if (t.type === 'circle') t.radius = Math.max(0.3, snapTo(x - t.x, e.altKey));
    else {
      t.hw = Math.max(0.2, snapTo(x - t.x, e.altKey));
      t.hh = Math.max(0.2, snapTo(z - t.z, e.altKey));
    }
  } else {
    t.x = clampX(snapTo(x - state.drag.ox, e.altKey));
    t.z = clampZ(snapTo(z - state.drag.oz, e.altKey));
  }
  renderInspector();
  draw();
});

const endDrag = (e) => {
  if (!state.drag) return;
  state.drag = null;
  try { cv.releasePointerCapture(e.pointerId); } catch { /* already released */ }
  // A drag can pin a rolled table (see `target`), so the sidebar has to catch up.
  renderAll();
};
cv.addEventListener('pointerup', endDrag);
cv.addEventListener('pointercancel', endDrag);

const clampX = (v) => Math.min(Math.max(v, -ARENA.halfW), ARENA.halfW);
const clampZ = (v) => Math.min(Math.max(v, -ARENA.halfH), ARENA.halfH);

/* ------------------------------------------------------------------ *
 * Mutations
 * ------------------------------------------------------------------ */

function add(kind) {
  snapshot();
  const l = layout();
  if (kind === 'box' || kind === 'circle' || kind === 'bumper') {
    const o = kind === 'circle'
      ? { type: 'circle', x: 0, z: -2, radius: 1 }
      : { type: kind === 'bumper' ? 'circle' : 'box', x: 0, z: -2, ...(kind === 'bumper' ? { radius: 1, kind: 'bumper' } : { hw: 2, hh: 0.6 }) };
    if (!l.obstacles) l.obstacles = [];
    l.obstacles.push(o);
    state.sel = { group: 'obstacle', index: l.obstacles.length - 1 };
  } else if (kind === 'goal') {
    l.goal = { x: 0, z: -11.8, hw: 5.2, hh: 1.1 };
    state.sel = { group: 'goal', index: 0 };
  } else if (kind === 'anchor') {
    if (!l.anchors) l.anchors = [];
    l.anchors.push({ x: 0, z: -6 });
    state.sel = { group: 'anchor', index: l.anchors.length - 1 };
  } else {
    // Placing an enemy is an authoring decision: it pins this table's waves.
    ensureAuthored();
    const wave = isLessons() ? l.enemies : l.waves[state.wave];
    wave.push({ type: kind, x: 0, z: -2 });
    state.sel = { group: 'enemy', index: wave.length - 1 };
  }
  renderAll();
}

/**
 * Freeze whatever is currently on the table into authored waves. Until this
 * happens a table's contents are rolled fresh every run, so there is nothing
 * stable to edit — the first placed enemy is what makes it authored.
 */
function ensureAuthored() {
  const l = layout();
  if (isLessons()) return;
  if (l.waves && l.waves.length) return;
  const base = state.rolled && state.rolled.length ? clone(state.rolled) : [[]];
  l.waves = base;
  state.wave = Math.min(state.wave, l.waves.length - 1);
}

function removeSelected() {
  const sel = state.sel;
  if (!sel) return;
  const l = layout();
  if (sel.group === 'spawn') return status('The player spawn cannot be removed.');
  snapshot();
  if (sel.group === 'obstacle') (l.obstacles || []).splice(sel.index, 1);
  else if (sel.group === 'anchor') (l.anchors || []).splice(sel.index, 1);
  else if (sel.group === 'goal') delete l.goal;
  else if (sel.group === 'enemy') {
    ensureAuthored();
    (isLessons() ? l.enemies : l.waves[state.wave]).splice(sel.index, 1);
  }
  state.sel = null;
  renderAll();
}

function duplicateSelected() {
  const sel = state.sel;
  const t = target(sel);
  if (!t || sel.group === 'spawn') return;
  snapshot();
  const copy = { ...clone(t), x: clampX(t.x + 1), z: clampZ(t.z + 1) };
  const l = layout();
  if (sel.group === 'obstacle') { (l.obstacles ||= []).push(copy); state.sel = { group: 'obstacle', index: l.obstacles.length - 1 }; }
  else if (sel.group === 'anchor') { (l.anchors ||= []).push(copy); state.sel = { group: 'anchor', index: l.anchors.length - 1 }; }
  else {
    ensureAuthored();
    const wave = isLessons() ? l.enemies : l.waves[state.wave];
    wave.push(copy);
    state.sel = { group: 'enemy', index: wave.length - 1 };
  }
  renderAll();
}

/* ------------------------------------------------------------------ *
 * Panels
 * ------------------------------------------------------------------ */

function status(text) { $('status').textContent = text; }

function renderLayoutList() {
  const host = $('layout-list');
  host.textContent = '';
  records().forEach((l, i) => {
    const b = document.createElement('button');
    b.className = `layout-item${i === state.layout ? ' on' : ''}`;
    const n = (l.waves && l.waves.length)
      ? `${l.waves.reduce((s, w) => s + w.length, 0)} authored in ${l.waves.length} wave${l.waves.length > 1 ? 's' : ''}`
      : `${(l.anchors || []).length} anchors · rolled`;
    b.innerHTML = `<div class="nm"></div><div class="meta"></div>`;
    b.querySelector('.nm').textContent = l.name || l.id;
    b.querySelector('.meta').textContent = isLessons()
      ? `${(l.enemies || []).length} balls · ${(l.obstacles || []).length} obstacles${l.goal ? ' · goal' : ''}`
      : `${l.obstacles.length} obstacles · ${n}`;
    b.addEventListener('click', () => {
      state.layout = i;
      state.wave = 0;
      state.sel = null;
      // Re-roll on arrival: a table whose contents are still procedural would
      // otherwise open completely empty, which reads as "this room has no
      // enemies" rather than "its enemies have not been rolled yet".
      roll();
    });
    host.appendChild(b);
  });
}

function renderWaveTabs() {
  const host = $('wave-tabs');
  host.textContent = '';

  // A lesson has no wave queue — one authored set, always.
  if (isLessons()) {
    $('waves-title').textContent = 'Balls on the table';
    $('wave-note').textContent =
      'One authored set. Anything inside the amber band is hidden behind the instruction card.';
    return;
  }
  $('waves-title').textContent = 'Waves';
  const ws = waves();
  ws.forEach((w, i) => {
    const b = document.createElement('button');
    b.className = `btn wave-tab${i === state.wave ? ' on' : ''}`;
    b.textContent = `Wave ${i + 1} · ${w.length}`;
    b.addEventListener('click', () => { state.wave = i; state.sel = null; renderAll(); });
    host.appendChild(b);
  });
  const addBtn = document.createElement('button');
  addBtn.className = 'btn wave-tab';
  addBtn.textContent = '+ Wave';
  addBtn.addEventListener('click', () => {
    snapshot();
    ensureAuthored();
    layout().waves.push([]);
    state.wave = layout().waves.length - 1;
    renderAll();
  });
  host.appendChild(addBtn);

  if (!ws.length) {
    const p = document.createElement('span');
    p.className = 'note';
    p.textContent = 'Nothing placed yet — roll the director below, or drop an enemy on the table.';
    host.appendChild(p);
  }

  $('wave-note').textContent = authored()
    ? 'Authored: the game spawns exactly these, ignoring the threat budget.'
    : 'Rolled: the director fills this table from its anchors at run time. Editing an enemy pins the table to what you see.';
}

/**
 * @param {string} label
 * @param {string} key field on the selected object
 * @param {number} value current value
 * @param {(v: number) => number} [coerce] clamp / floor applied on write
 */
function numberRow(label, key, value, coerce = (v) => v) {
  const wrap = document.createElement('template');
  wrap.innerHTML = '<label></label><input type="number" step="0.25" />';
  const [lab, input] = wrap.content.children;
  lab.textContent = label;
  input.value = value;
  input.addEventListener('change', () => {
    snapshot();
    setField(key, coerce(parseFloat(input.value) || 0));
    renderAll();
  });
  return [lab, input];
}

function renderInspector() {
  const host = $('inspector');
  host.textContent = '';
  const sel = state.sel;
  const t = target(sel);
  if (!t) {
    const p = document.createElement('p');
    p.className = 'note';
    p.textContent = 'Nothing selected. Click something on the table.';
    host.appendChild(p);
    return;
  }

  const head = document.createElement('div');
  head.className = 'row';
  const chip = document.createElement('span');
  chip.className = 'chip';
  const dot = document.createElement('span');
  dot.className = 'dot';
  const names = {
    obstacle: t.kind === 'bumper' ? 'Bumper' : t.type === 'circle' ? 'Pillar' : 'Barrier',
    anchor: 'Spawn anchor',
    spawn: 'Player spawn',
    enemy: TYPE_LABEL[t.type] || 'Enemy'
  };
  dot.style.background = sel.group === 'enemy'
    ? TYPE_COLOR[t.type]
    : sel.group === 'spawn' ? '#35f2ff' : t.kind === 'bumper' ? '#2ef2c4' : '#1d6f7a';
  chip.append(dot, document.createTextNode(names[sel.group]));
  head.appendChild(chip);
  host.appendChild(head);

  const rows = document.createElement('div');
  rows.className = 'rows';
  rows.style.marginTop = '8px';
  rows.append(...numberRow('x', 'x', t.x, clampX));
  rows.append(...numberRow('z', 'z', t.z, clampZ));

  if (sel.group === 'obstacle') {
    const atLeast = (min) => (v) => Math.max(min, v);
    if (t.type === 'circle') rows.append(...numberRow('radius', 'radius', t.radius, atLeast(0.2)));
    else {
      rows.append(...numberRow('half width', 'hw', t.hw, atLeast(0.2)));
      rows.append(...numberRow('half height', 'hh', t.hh, atLeast(0.2)));
    }
    const lab = document.createElement('label');
    lab.textContent = 'Kind';
    const sel2 = document.createElement('select');
    for (const [v, name] of [['obstacle', 'Solid barrier'], ['bumper', 'Bumper (boosts)']]) {
      const o = document.createElement('option');
      o.value = v;
      o.textContent = name;
      sel2.appendChild(o);
    }
    sel2.value = t.kind === 'bumper' ? 'bumper' : 'obstacle';
    sel2.addEventListener('change', () => {
      snapshot();
      if (sel2.value === 'bumper') t.kind = 'bumper';
      else delete t.kind;
      renderAll();
    });
    rows.append(lab, sel2);
  }

  if (sel.group === 'enemy') {
    const lab = document.createElement('label');
    lab.textContent = 'Type';
    const pickEl = document.createElement('select');
    for (const key of Object.keys(TYPE_LABEL)) {
      const o = document.createElement('option');
      o.value = key;
      o.textContent = `${TYPE_LABEL[key]} · cost ${ENEMY[key].cost} · unlocks room ${ROOM.unlock[key]}`;
      pickEl.appendChild(o);
    }
    pickEl.value = t.type;
    pickEl.addEventListener('change', () => { snapshot(); setField('type', pickEl.value); renderAll(); });
    rows.append(lab, pickEl);
  }
  host.appendChild(rows);

  if (sel.group === 'anchor') {
    const l = layout();
    const sp1 = l.spawn || { x: 0, z: 11 };
    const dead = Math.hypot(t.x - sp1.x, t.z - sp1.z) < ROOM.safeSpawnRadius;
    const p = document.createElement('p');
    p.className = 'note';
    p.style.marginTop = '8px';
    p.textContent = dead
      ? `Inside the ${ROOM.safeSpawnRadius}-unit safe ring — the director will never use this anchor.`
      : 'Usable. The director shuffles anchors per room and jitters each pick slightly.';
    if (dead) p.style.color = '#ff5a3d';
    host.appendChild(p);
  }
}

function renderTableFields() {
  const l = layout();
  $('f-name').value = l.name || '';
  $('f-id').value = l.id || '';
  $('f-tags').value = (l.tags || []).join(', ');
  if (isLessons()) {
    $('context-title').textContent = 'This lesson';
    $('room-rule').textContent =
      `Lesson ${state.layout + 1} of ${records().length}. The dashed gold line is where the cue rests when the lesson opens — it should point at the solution.`;
    $('doc-note').textContent = `${records().length} lessons · arena ${ARENA.width}×${ARENA.height} units`;
    return;
  }
  $('context-title').textContent = 'Which room uses this';
  $('room-rule').textContent = state.layout === 0
    ? 'Rooms 1 and 2 always use this table — the opening is deliberately an empty rack. Rooms 3+ draw any table at random.'
    : 'Rooms 3 and up draw any table from the pool at random, seeded by (run seed, room number).';
  $('doc-note').textContent = `${records().length} tables · arena ${ARENA.width}×${ARENA.height} units`;
}

function renderAll() {
  renderLayoutList();
  renderTableFields();
  renderWaveTabs();
  renderInspector();
  refreshHistory();
  draw();
}

/* ------------------------------------------------------------------ *
 * Wiring
 * ------------------------------------------------------------------ */

for (const btn of document.querySelectorAll('[data-add]')) {
  btn.addEventListener('click', () => add(btn.dataset.add));
}
$('btn-del').addEventListener('click', removeSelected);
$('btn-dup').addEventListener('click', duplicateSelected);

$('btn-snap').addEventListener('click', () => {
  state.snap = state.snap ? 0 : 0.25;
  $('btn-snap').classList.toggle('on', !!state.snap);
  $('btn-snap').textContent = state.snap ? 'Snap ¼' : 'Snap off';
});
$('btn-anchors').addEventListener('click', () => {
  state.showAnchors = !state.showAnchors;
  $('btn-anchors').classList.toggle('on', state.showAnchors);
  state.sel = state.sel && state.sel.group === 'anchor' ? null : state.sel;
  renderAll();
});

for (const [id, key] of [['f-name', 'name'], ['f-id', 'id']]) {
  $(id).addEventListener('change', () => { snapshot(); layout()[key] = $(id).value.trim(); renderAll(); });
}
$('f-tags').addEventListener('change', () => {
  snapshot();
  layout().tags = $('f-tags').value.split(',').map((s) => s.trim()).filter(Boolean);
  renderAll();
});

$('btn-add-layout').addEventListener('click', () => {
  snapshot();
  if (isLessons()) {
    records().push({
      id: `lesson-${records().length + 1}`,
      name: 'New Lesson',
      rest: { x: 0, z: -1 },
      obstacles: [],
      enemies: [{ type: 'solid', x: 0, z: -1 }]
    });
    state.layout = records().length - 1;
    state.sel = null;
    renderAll();
    return;
  }
  records().push({
    id: `table-${records().length + 1}`,
    name: 'New Table',
    tags: [],
    obstacles: [],
    anchors: [{ x: -5, z: -8 }, { x: 5, z: -8 }, { x: 0, z: -11 }],
    spawn: { x: 0, z: 11 }
  });
  state.layout = records().length - 1;
  state.wave = 0;
  state.sel = null;
  roll();
});

/* --- the real director, run against the table being edited --- */
$('f-level').value = state.level;
$('f-seed').value = state.seed;
$('f-level').addEventListener('change', () => { state.level = Math.max(1, parseInt($('f-level').value, 10) || 1); roll(); });
$('f-seed').addEventListener('change', () => { state.seed = parseInt($('f-seed').value, 10) || 0; roll(); });

function roll() {
  // Lessons are fully authored — there is nothing to roll, and the director
  // would read anchors and a spawn point that a lesson record does not have.
  if (isLessons()) {
    state.rolled = null;
    $('roll-note').textContent = 'Lessons are hand-authored. The threat director does not run on them.';
    renderAll();
    return;
  }
  const l = clone(layout());
  delete l.waves;                                  // ask for a fresh roll, not the pins
  state.rolled = buildWaves(l, state.level, makeRng(roomSeed(state.seed >>> 0, state.level)));
  state.wave = 0;
  state.sel = null;
  const count = state.rolled.reduce((s, w) => s + w.length, 0);
  $('roll-note').textContent =
    `Room ${state.level}: budget ${budgetFor(state.level).toFixed(1)}, ` +
    `${waveCountFor(state.level)} wave(s), ${count} enemies. ` +
    (authored() ? 'This table is authored, so the roll is only a preview.' : 'Shown on the table.');
  renderAll();
}
$('btn-roll').addEventListener('click', roll);
$('btn-keep').addEventListener('click', () => {
  if (!state.rolled) return status('Roll something first.');
  snapshot();
  layout().waves = clone(state.rolled);
  renderAll();
  status('Roll kept — this table now spawns exactly these.');
});
$('btn-unkeep').addEventListener('click', () => {
  snapshot();
  delete layout().waves;
  state.wave = 0;
  state.sel = null;
  roll();
  status('Authored waves cleared — the director rolls this table again.');
});

/* --- history --- */
$('btn-undo').addEventListener('click', () => {
  if (!undo.length) return;
  redo.push(JSON.stringify(state.doc));
  state.doc = JSON.parse(undo.pop());
  state.layout = Math.min(state.layout, records().length - 1);
  state.sel = null;
  renderAll();
});
$('btn-redo').addEventListener('click', () => {
  if (!redo.length) return;
  undo.push(JSON.stringify(state.doc));
  state.doc = JSON.parse(redo.pop());
  state.sel = null;
  renderAll();
});

/* --- modes --- */

/**
 * Lessons and rooms are different documents with different furniture: a lesson
 * has a resting cue heading and may carry a goal bar; a room has anchors and
 * rolled waves. Switching swaps the whole document, so an edit to one can never
 * be exported into the other.
 */
function setMode(mode) {
  if (state.mode === mode) return;
  state.docs[state.mode] = state.doc;
  state.mode = mode;
  state.doc = state.docs[mode];
  state.layout = 0;
  state.wave = 0;
  state.sel = null;
  state.rolled = null;
  undo.length = 0;
  redo.length = 0;
  $('mode-rooms').classList.toggle('on', mode === 'rooms');
  $('mode-lessons').classList.toggle('on', mode === 'lessons');
  $('list-title').textContent = DOCS[mode].label;
  $('btn-add-layout').textContent = mode === 'lessons' ? '+ New lesson' : '+ New table';
  $('btn-export').textContent = `Download ${DOCS[mode].file}`;
  for (const el of document.querySelectorAll('[data-rooms-only]')) {
    el.style.display = mode === 'lessons' ? 'none' : '';
  }
  renderAll();
}
$('mode-rooms').addEventListener('click', () => setMode('rooms'));
$('mode-lessons').addEventListener('click', () => setMode('lessons'));

/* --- import / export --- */
const serialise = () => `${JSON.stringify(state.doc, null, 2)}\n`;

$('btn-export').addEventListener('click', () => {
  const blob = new Blob([serialise()], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = DOCS[state.mode].file;
  a.click();
  URL.revokeObjectURL(a.href);
  status(`Downloaded. Replace src/data/${DOCS[state.mode].file} with it.`);
});

$('btn-copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(serialise());
    status(`Copied. Paste over src/data/${DOCS[state.mode].file}.`);
  } catch {
    status('Clipboard blocked — use Download instead.');
  }
});

$('btn-import').addEventListener('click', () => $('file').click());
$('file').addEventListener('change', async () => {
  const f = $('file').files[0];
  if (!f) return;
  try {
    const parsed = JSON.parse(await f.text());
    if (!parsed || !Array.isArray(parsed[docKey()])) throw new Error(`no ${docKey()} array`);
    snapshot();
    state.doc = parsed;
    state.layout = 0;
    state.wave = 0;
    state.sel = null;
    roll();
    status(`Loaded ${parsed.layouts.length} tables from ${f.name}.`);
  } catch (err) {
    status(`Could not read that file: ${err.message}`);
  }
  $('file').value = '';
});

/* --- keys --- */
window.addEventListener('keydown', (e) => {
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); (e.shiftKey ? $('btn-redo') : $('btn-undo')).click(); return; }
  if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicateSelected(); return; }
  if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removeSelected(); return; }
  const step = e.shiftKey ? 1 : state.snap || 0.25;
  const nudge = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
  if (nudge) {
    const t = target(state.sel, true);
    if (!t) return;
    e.preventDefault();
    snapshot();
    setField('x', clampX(round(t.x + nudge[0])));
    setField('z', clampZ(round(t.z + nudge[1])));
    renderAll();
  }
});

window.addEventListener('resize', fitCanvas);
renderAll();
fitCanvas();
roll();
