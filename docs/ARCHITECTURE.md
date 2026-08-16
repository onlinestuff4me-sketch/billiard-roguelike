# Architecture — Technical & File Structure Spec

**Stack:** Vite 7 · Three.js 0.185 · Web Audio API · vanilla ES modules
**Target:** mobile web, portrait 9:16, 60 fps on mid-range phones
**No framework, no state library, no physics engine.** Everything below is ~6.5k
lines of dependency-free game code plus Three.js for rendering.

---

## 1. Overview

The project is a **decoupled system graph** with one owner per concern and a single
orchestrator (`main.js`) that wires them together and drives the loop.

```
                            ┌────────────────┐
                            │    main.js     │  bootstrap · loop · wiring
                            │  (orchestrator)│
                            └───────┬────────┘
             ┌───────────────┬──────┴───────┬────────────────┐
             ▼               ▼              ▼                ▼
      ┌────────────┐  ┌────────────┐ ┌────────────┐  ┌─────────────┐
      │  core/     │  │ entities/  │ │ systems/   │  │    ui/      │
      │            │  │            │ │            │  │             │
      │ Engine     │  │ Player     │ │ Physics    │  │ HUD         │
      │ Input      │  │ Enemy      │ │ Boon       │  │ BoonModal   │
      │ Audio      │  │            │ │ Room       │  │             │
      └────────────┘  └────────────┘ └────────────┘  └─────────────┘
             ▲               ▲              ▲                ▲
             └───────────────┴──────┬───────┴────────────────┘
                                    │
                             ┌──────────────┐
                             │  config.js   │  balance · palette · feel
                             └──────────────┘
```

### Dependency rules

1. **`config.js` imports nothing.** Every other module may import it.
2. **Entities never import systems.** `Player` and `Enemy` are state + mesh + local
   behaviour. They expose data; systems act on them.
3. **Systems never import each other directly.** They communicate through the
   `game` context object that `main.js` passes into every `update()`.
4. **UI never touches gameplay state directly.** `HUD.update(snapshot)` and
   `BoonModal.open(offers, onPick)` take plain data and callbacks.
5. **Only `main.js` knows about all four layers.** That is what makes any single
   system replaceable in isolation.

### The `game` context

A single mutable object passed everywhere, containing: `scene`, `camera`, `engine`,
`audio`, `input`, `player`, `enemies[]`, `projectiles[]`, `physics`, `boons`,
`rooms`, `hud`, `fx` (particle + floating-text helpers) and the run state
(`level`, `chain`, `state`). It is deliberately a plain object rather than a class —
systems destructure what they need and nothing more.

---

## 2. File Structure

```
billiard-roguelike/
├── index.html                 portrait stage shell, boot veil, CSS tokens
├── package.json               vite + three, scripts: dev / build / preview
├── vite.config.js             base './', LAN host, es2020 target
├── docs/
│   ├── GDD.md                 design: loop, multipliers, boons, generation
│   ├── STYLE_GUIDE.md         visual, audio and enemy-language blueprint
│   ├── AIMING.md              pointer/touch spec: model, rationale, verification
│   └── ARCHITECTURE.md        this document
└── src/
    ├── main.js                bootstrap · loop · combat rules · FX · run flow
    ├── config.js              all balance constants, palette, feel curves
    ├── core/
    │   ├── Engine.js          time dilation · hit-stop · shake · zoom punch
    │   ├── InputManager.js    pointer state machine: aim / drag / flick
    │   └── AudioManager.js    procedural Web Audio synthesis + slow-mo filter
    ├── entities/
    │   ├── Player.js          cue-ball state, focus gauge, ribbon trail
    │   └── Enemy.js           archetypes: Solid · Stripe · Heavy Eight-Ball
    ├── systems/
    │   ├── PhysicsSystem.js   sweeps · rebounds · caroms · trajectory prediction
    │   ├── BoonSystem.js      4-phase hook registry · build state · offer roller
    │   └── RoomManager.js     layout pool · threat director · injectors · doors
    └── ui/
        ├── HUD.js             health · radial focus · room · combo · door labels
        └── BoonModal.js       3-card reward overlay
```

---

## 3. The Loop

### 3.1 Frame anatomy

```
requestAnimationFrame(now)
  │
  ├─ rawDt   = clamp((now - last)/1000, 0, TIME.maxFrameDt)      // 40 ms ceiling
  ├─ engine.update(rawDt)
  │     ├─ hit-stop countdown  → returns dt = 0 while frozen
  │     ├─ timeScale blend     → 1.0 ⇄ 0.20 (70 ms in / 160 ms out)
  │     ├─ shake + zoom decay
  │     └─ returns { dt (scaled), rawDt, frozen }
  │
  ├─ input.update(rawDt)              // pointer state machine, real time
  ├─ if (dt > 0) simulate(dt)         // fixed sub-steps, see below
  ├─ hud.update(snapshot)             // DOM writes, once per frame
  └─ composer.render()                // bloom → output pass
```

**Real time vs scaled time.** Two clocks exist and mixing them is the classic bug
source, so the split is explicit:

| Uses **real** time | Uses **scaled** time |
| --- | --- |
| Focus drain, hit-stop, dilation blending, input timing, HUD animation, audio envelopes | Entity movement, physics sweeps, chain window, cooldowns, spawn telegraphs, boon durations |

### 3.2 Fixed sub-stepping

`simulate(dt)` splits the scaled delta into `TIME.fixedStep` (1/180 s) slices, capped
at `maxSubSteps` (8). At 48 u/s the cue ball moves 0.27 u per step — well under its
0.62 u radius — so discrete collision checks cannot tunnel through a rail or a body
even at maximum launch power.

Note the deliberate consequence of the 40 ms frame clamp: below ~25 fps the game
runs in slow motion rather than skipping ahead. For a physics game where a dropped
frame could mean a tunnelled shot or an unfair death, degrading speed is the right
trade — and on a device that can hold 60 fps the clamp never engages.

---

## 4. Physics

There is no third-party physics engine. `PhysicsSystem` implements exactly the three
interactions the game needs, deterministically.

### 4.1 Shapes

| Shape | Used by | Test |
| --- | --- | --- |
| Circle | player, enemies, projectiles, bumpers, pyres | circle–circle |
| Axis-aligned box | obstacles, hazard strips, doors | circle–AABB (closest-point) |
| Half-plane | the four rails | position vs `±half extent ∓ radius` |

Everything is solved in the **XZ plane**; the Y axis is presentation only (mesh
height, hover, squash). This keeps every test 2-D and cheap.

### 4.2 Resolution order (per sub-step)

```
1. integrate velocities            (drag per state, per entity)
2. player  ↔ rails / obstacles     → reflect, decrement bounce budget, onRebound
3. player  ↔ enemies               → cue strike: damage, then a two-body impulse
4. enemies ↔ enemies               → carom when the striker is KNOCKED and fast
5. enemies ↔ rails / obstacles     → wall-splat when fast, else damped reflect
6. projectiles ↔ player / geometry
7. zones (bumper / pyre / hazard)  → speed amplification, DoT
8. resolve residual overlaps       (positional bias, PHYSICS.skin)
```

Collision response is **impulse-based and deterministic**. Static geometry reflects
with `v' = (v − 2(v·n)n) · restitution`. Ball-vs-ball — cue into enemy, and enemy
into enemy — is solved as a real two-body collision along the line of centres:

```
j = −(1 + e)(v_rel · n) / (1/mA + 1/mB)        n = unit vector from A to B
vA += (j/mA) n        vB −= (j/mB) n
```

Only the normal component is exchanged; each body keeps its tangential velocity.
That single rule reproduces the results a player already expects from a pool table
without any of them being special-cased: equal masses head-on give a stop shot, a
cut sends the object ball down the centre line while the cue ball departs along the
tangent (the **90° rule**), and momentum is conserved exactly. A heavier Eight-Ball
throws the cue ball back purely because of its mass.

The one pass-through case is a body the strike *destroyed* — there is nothing left
to bounce off. Surviving bodies always collide, so "why did I go through that one
but not this one?" has an answer visible on screen.

No random jitter is ever added — the prediction preview and the actual outcome run
the same math, which is a hard requirement of the "legible physics" pillar.

### 4.3 Trajectory prediction

`PhysicsSystem.predictTrajectory(origin, dir, opts)` is a **pure function**: it never
mutates world state and is safe to call every frame while aiming. It performs an
iterative swept-circle march:

```
for segment in 0..maxBounces:
    tEnemy    = earliest swept circle–circle hit  (quadratic, smallest positive root)
    tObstacle = earliest swept circle–AABB / circle–circle hit
    tRail     = earliest ray–plane hit against the 4 inset rails
    take the minimum:
      · enemy hit    → stop; emit caromDir = normalise(enemyCentre − contactPoint)
      · geometry hit → emit segment, reflect dir about n, continue
      · nothing      → emit the remaining distance and stop
```

It returns `{ segments[], hit, caromDir, totalDistance, bounces }`, which the aim
renderer draws as three distinct layers (primary path, ghosted dotted reflections,
carom deflection cone). Because prediction and simulation share the same intersection
helpers, the preview is exact for the first body — divergence only appears after the
struck body itself starts colliding, which is intentional (the cone shows a
*direction*, not a guarantee).

---

## 5. Systems

### 5.1 `core/Engine.js`
Owns all time and camera-feel state: `timeScale` blending, `hitStop(duration)`,
`shake(impulse)`, `zoomPunch(amount)`, and `pause()/resume()` for modals. Returns a
scaled delta each frame and applies the camera offset/ortho-zoom directly. It is the
only module allowed to touch `camera.position` and `camera.zoom`.

### 5.2 `core/InputManager.js`
A pointer state machine (`IDLE → AIMING`) over unified Pointer Events with a touch
fallback, emitting `onAimStart / onAimUpdate / onRelease / onAimCancel / onFlick`.
It never touches the player directly — it is handed an anchor and returns aim data.

**Turn the cue: the line tracks the thumb's rotation about the ball, 1:1.** This is
the 8 Ball Pool model. The heading persists between shots — 12 o'clock on the
first, thereafter the ball's last travel direction — and dragging rotates it.

Two earlier attempts failed on this exact point. An absolute scheme snapped the
line to the thumb, which put the thumb on the forward path and hid the table being
read. A horizontal-travel-only scheme fixed the occlusion but meant sweeping the
thumb in an arc did not turn the line in an arc, which is what made it feel wrong.

Steering applies the **angular delta of the thumb about the ball**: each frame the
bearing `atan2(fz - bz, fx - bx)` is taken, the shortest-way-round difference from
last frame is computed, and the heading is rotated by it. Sweep the thumb 30°
around the ball and the line turns 30°.

Only the delta is used, never the absolute bearing, so touching down moves nothing
and placement is irrelevant. Inside `INPUT.minAimRadius` the bearing is undefined,
so rotation suspends and the stored bearing is dropped — re-emerging on the far
side then resumes cleanly instead of snapping.

Precision scales with reach for free: the same finger movement subtends a smaller
angle further out. Measured, 60 px of travel turns the shot 42° close to the ball
and 13° at reach.

Power charges over `PLAYER.chargeTime` from `PLAYER.minPower` to full, and drives
launch speed between `launchSpeedMin` and `launchSpeedMax`.

The aim beam is a **ribbon mesh**, not a line: GPU line width is clamped to 1 px on
essentially every platform, so `LineBasicMaterial.linewidth` is a no-op and real
thickness has to be geometry. Its width scales with charge and a bright wavefront
fills it from the ball outward, so the wind-up is legible without a separate meter.

The emergency dash is a **double tap**, not a flick. Sharing the aim gesture meant
any quick, decisive shot was silently reinterpreted as a dash; separating them means
neither gesture can be mistaken for the other.

### 5.3 `core/AudioManager.js`
Lazy `AudioContext`, a master gain → low-pass chain, a cached white-noise buffer, and
one method per game event. `setTimeDilation(scale)` glides the filter cutoff and
master gain, which is the entire slow-mo audio treatment. All voices are
fire-and-forget and disconnect themselves.

### 5.4 `entities/Player.js`
State machine (`IDLE / AIMING / LAUNCHED / DASHING`), Focus gauge accounting,
i-frames, the ribbon trail mesh (a dynamically rebuilt indexed quad strip with
per-vertex alpha), and the aim-preview line objects.

### 5.5 `entities/Enemy.js`
A base class with three archetype configurations. Each enemy owns its mesh, its AI
tick (`chase` / `standoff+charge` / `advance+face`), its damage handling with shield
mitigation and backstab detection, and its `KNOCKED` object-ball state.

### 5.6 `systems/PhysicsSystem.js`
Section 4. Stateless apart from a scratch-vector pool; all mutation happens on the
entities passed in.

### 5.7 `systems/BoonSystem.js`
A registry of boon definitions, an owned-build list with ranks, an aggregated stat
block, and four dispatchers (`onLaunch`, `onTrajectory`, `onImpact`, `onRebound`)
that iterate only the hooks actually registered. `rollOffer(n)` produces the modal's
cards, weighted by rarity and filtered against rank caps.

### 5.8 `systems/RoomManager.js`
The hybrid generator: a handcrafted `LAYOUTS` pool, a seeded RNG (`mulberry32`), the
threat-budget director, environmental injectors, wave sequencing, and the two-door
exit. Owns a `THREE.Group` per room so teardown is a single `dispose` walk.

### 5.9 `ui/HUD.js` & `ui/BoonModal.js`
Pure DOM, built imperatively into `#ui-layer`. The HUD writes only changed values
(cached last-frame numbers) to keep layout thrash off the main thread. It also owns
the world-projected exit-door reward labels, positioned each frame via
`Vector3.project(camera)` into stage-relative pixels. The modal freezes time
completely (`Engine.pause()`) and is the only screen with a scrim.

### 5.10 FX (in `main.js`)
Particles, shockwave rings, Chain Arc zaps and floating combat text ("CAROM!",
"SPLAT!") live with the orchestrator rather than in a system, because they are
pure presentation with no state of their own. Particles use a single ring-buffered
`THREE.Points` pool; floating text is DOM projected from world space and runs on
*real* time so a hit-stop never stalls the read.

---

## 6. Rendering

- **Orthographic top-down camera** at `y = 60`, `up = (0, 0, −1)`, frustum fixed in
  world units (`ARENA.height + 2 × padding` tall). Consequence: every device sees the
  identical table — no competitive or readability variance across screen sizes.
- **Post-processing:** `EffectComposer → RenderPass → UnrealBloomPass → OutputPass`.
  Bloom is auto-disabled on devices reporting `< 4` logical cores, falling back to a
  plain `renderer.render()`.
- **Pixel ratio** clamped to 2.
- **Geometry/material reuse:** archetype geometries and materials are created once
  and shared; entity meshes clone materials only when they need per-instance emissive
  flashing.
- **Disposal:** every room teardown walks its group and calls `geometry.dispose()` /
  `material.dispose()`, so a 30-room run does not leak GPU memory.

---

## 7. Git Versioning & Rollback Workflow

Game feel is found by *iterating and reverting*. The repository is therefore
organised so that any experiment can be thrown away in one command.

### 7.1 Milestone tags

| Tag | Contains | Rollback answers |
| --- | --- | --- |
| `v0.1-docs-scaffold` | `/docs`, project scaffold, table rendering | "Start the code over from a clean shell" |
| `v0.2-core-physics` | Engine, InputManager, Player, rails, sweeps, trajectory preview | "The slingshot felt better before" |
| `v0.3-combat-carom` | Enemy archetypes, cue strikes, caroms, wall-splats, audio | "The carom tuning was better before" |
| `v0.4-boons-progression` | Boon engine, RoomManager, HUD, BoonModal | "The build economy was better before" |

Naming convention: `v<minor>-<kebab-slug>`, where the slug names the *system* the
milestone introduced, not the date. Tags are immutable; if a milestone needs a fix,
it gets a new tag (`v0.3.1-carom-tuning`).

### 7.2 Everyday workflow

```bash
# Inspect the milestone ladder
git tag -n

# Play an older build without touching the branch
git checkout v0.2-core-physics && npm run dev
git switch -                      # back to work

# Diff a whole system across two milestones
git diff v0.3-combat-carom..HEAD -- src/systems/PhysicsSystem.js

# Branch an experiment off a known-good feel
git switch -c feel/heavier-caroms v0.3-combat-carom
#   … tune, playtest …
git switch main && git merge feel/heavier-caroms   # or just delete the branch
```

### 7.3 Rollback recipes

| Situation | Command |
| --- | --- |
| Uncommitted tuning went bad | `git restore src/config.js` |
| Revert one bad commit, keep history | `git revert <sha>` |
| Reset the branch to a milestone (destructive) | `git reset --hard v0.3-combat-carom` |
| Recover one file from a milestone | `git checkout v0.3-combat-carom -- src/systems/PhysicsSystem.js` |
| Compare balance only | `git diff v0.3-combat-carom..HEAD -- src/config.js` |

### 7.4 Why the code is shaped for rollback

- **All tuning lives in `config.js`.** Feel experiments are usually a one-file diff,
  which makes `git diff -- src/config.js` a complete changelog of a balance pass.
- **Systems are additive.** Each milestone adds files rather than rewriting them, so
  `git revert` of a milestone rarely conflicts.
- **No generated state in the repo.** `dist/`, `node_modules/` and `.vite/` are
  ignored, so every tag is a clean, runnable source tree after `npm install`.

### 7.5 Commit conventions

```
<scope>: <imperative summary>

scope ∈ {docs, core, entities, systems, ui, build, feel}
```

Feel-only changes use the `feel:` scope so they can be filtered out of a code review:
`git log --oneline --grep '^feel:'`.

---

## 8. Performance Budget

| Budget | Target | Strategy |
| --- | --- | --- |
| Draw calls | < 120 | Shared geometry/materials, merged static table, one ribbon mesh |
| Entities | ≤ 40 active | Threat budget caps composition; projectiles pooled |
| Particles | ≤ 320 points | Single `THREE.Points` pool with a ring-buffer allocator |
| Physics | ≤ 8 sub-steps/frame | `maxSubSteps` clamp; O(n²) pair tests over ≤ 40 bodies is ~800 checks worst case |
| DOM writes | ≤ 10/frame | HUD caches last values; floating text is capped and recycled |
| Bundle | < 900 kB gzipped | ~165 kB gzipped in practice; Three.js is the only dependency |

---

## 9. Extension Points

| To add… | Touch only… |
| --- | --- |
| A new boon | `BOON_DEFS` in `systems/BoonSystem.js` |
| A new table layout | `LAYOUTS` in `systems/RoomManager.js` |
| A new enemy archetype | `ENEMY` in `config.js` + one branch in `entities/Enemy.js` |
| A new environmental injector | `INJECTOR` in `config.js` + `spawnInjector()` |
| A new reward type | `DOOR_REWARDS` in `systems/RoomManager.js` |
| A balance pass | `config.js` only |
