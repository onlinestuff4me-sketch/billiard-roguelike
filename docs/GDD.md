# Billiard Roguelike — Game Design Document

**Version:** 0.4 (prototype)
**Platform:** Mobile web, portrait 9:16, one-thumb play
**Engine:** Vite + Three.js (WebGL), Web Audio API
**Session length:** 6–12 minutes per run

---

## 1. High-Level Hook

> **You are the cue ball.**
> Real-time kinetic billiards meets a boon-stacking action roguelike.

Every room is a break shot. Threats close in *in real time*; the instant your thumb
touches the glass the world drops to 20% speed, trajectory lines bloom across the
felt, and you pull the slingshot back looking for the line that clears the rack in
one stroke. Release, and physics takes over — you are a projectile, the enemies you
hit become projectiles, and the rails turn a mediocre angle into a four-body carom.

The fantasy is the **billiards trick shot**, executed under pressure, with a Hades-style
boon economy layered on top so that by room 8 your cue ball is leaving fire at the
launch point, cutting a damage trail mid-flight, arcing lightning on impact, and
gaining +50% damage per rail.

**One-line pitch:** *Hades' boon stacking and slow-mo kinetics, played on a pool table
where everything you touch becomes ammunition.*

### Design Pillars

| Pillar | What it means | What it forbids |
| --- | --- | --- |
| **Every stroke is a decision** | Slow-mo is a *resource* (Focus), not a mode. Aiming costs the thing that keeps you alive. | Free, unlimited planning time. |
| **The table is the weapon** | Rails, pillars, bumpers and enemy bodies all do damage. Raw DPS is the worst way to play. | Homing, auto-aim, or "just point at the enemy". |
| **Legible physics** | The prediction lines never lie. If the preview shows a bank into a carom, that is what happens. | Hidden randomness in collision response. |
| **Builds that change verbs** | Boons must change *how you shoot*, not just how hard. | Pure "+5% damage" filler as the primary reward. |
| **Portrait, one thumb** | Everything reachable with a single thumb drag; no second input ever required. | Buttons, virtual sticks, two-finger gestures. |

---

## 2. Core Loop

```
        ┌──────────────────────────────────────────────────────────┐
        │                                                          │
        ▼                                                          │
  REAL-TIME THREAT ──► HOLD: BULLET-TIME AIM ──► DRAG: SLINGSHOT   │
  (enemies advance,     (time → 0.20, Focus       (pull vector,    │
   shots charge)         gauge drains)             3 preview lines)│
        │                                              │           │
        │                                              ▼           │
        │                                        RELEASE: LAUNCH   │
        │                                        (i-frames, cue    │
        │                                         ball flight)     │
        │                                              │           │
        │                                              ▼           │
        │                                   CHAIN COLLISIONS       │
        │                                   caroms · wall-splats · │
        │                                   pierces · banks        │
        │                                              │           │
        └───────────────── enemies remain ◄────────────┤           │
                                                       │           │
                                              room cleared         │
                                                       ▼           │
                                          2 DOORS ROLLED ──► BOON  │
                                          (slingshot into one)  ───┘
```

### Beat-by-beat

1. **Threat (real time, 1.0x).** Solids walk you down, Stripes line up a shot, an
   Eight-Ball turns its shield toward you. Standing still is death; the room is
   always pressuring the player to commit to a stroke.
2. **Focus (0.20x).** Pointer-down instantly dilates time. The Focus gauge (2.0s max)
   begins draining in *real* time, so a long aim costs roughly 10 seconds of enemy
   movement compressed into 2 seconds of thinking.
3. **Aim.** Dragging sets the pull vector. Three preview layers render: the primary
   cue path, ghosted rail reflections, and the carom deflection cone off the first
   body you would strike.
4. **Release.** The player becomes a high-velocity cue ball with invulnerability
   frames for the duration of the flight. This is the core risk inversion: *moving
   is safe, hesitating is not.*
5. **Cascade.** Struck enemies become lethal object balls. Enemy-into-enemy is a
   **Carom**. Enemy-into-rail at speed is a **Wall-Splat**. Light mobs are pierced
   through so a single stroke can chain 4+ bodies.
6. **Clear → Reward.** Two glowing doors spawn on the top rail. You must *slingshot
   into* the door you want — the reward choice is itself a shot.

### Failure & Death

- HP only decreases from contact with active (non-knocked) enemies, Stripe
  projectiles, and hazard strips.
- Death returns to room 1 with an empty build. Runs are short by design; the meta
  payload is knowledge of the layout pool and the boon synergies.

---

## 3. Multiplier & Momentum System

Damage in this game is a product, not a sum. The whole scoring layer exists to make
the *shape* of a shot matter more than its power.

```
final = baseStrike
      × chainMultiplier      (cascade, 1.0 → 2.5)
      × speedRatio           (impact speed / reference speed, clamped 0.35–2.2)
      × bankBonus            (+50% per rail with Trickshot)
      × backstab/crit        (×2.0 behind a shield, doubled again by Shatter Crit)
```

### 3.1 Cascade Multiplier

Every damaging event inside a single unbroken chain steps the multiplier:

| Chain index | Multiplier | Audio |
| --- | --- | --- |
| 1st hit | **1.0x** | pentatonic root |
| 2nd hit | **1.4x** | +3 semitones |
| 3rd hit | **1.8x** | +5 semitones |
| 4th and beyond | **2.5x** | +7, +10, then octave up |

The chain lapses after **1.6 s** of scaled time without a damaging event. Because the
window runs on *scaled* time, staying in bullet-time does not preserve a chain —
you have to keep the table moving.

### 3.2 Carom Breaks (collateral)

A knocked enemy above `caromMinSpeed` (12 u/s) that strikes another enemy triggers
**"CAROM!"**: both bodies take carom damage, momentum is redistributed (70% transfer),
the chain steps, hit-stop extends to 60 ms, and a sub-bass drop plays. This is the
highest-value play in the game and the reason positioning beats aiming.

### 3.3 Wall-Splats

A knocked enemy hitting a rail above `wallSplatSpeed` (16 u/s) takes flat bonus
damage and shatters into debris. Wall-splats refund **0.4 s of Focus** — the table
edges are a resource, not a boundary.

### 3.4 Backstabs & Shields

Heavy Eight-Balls carry a 180° frontal shield that mitigates damage to 12%. Two
counters exist, and both are *geometric*:

- **Backstab** — strike from behind the shield normal (×2.0 damage, crit hit-stop).
- **Bank** — any shot that has already touched at least one rail ignores the shield
  entirely. Banking is the mechanical answer to "I can't get behind it."

### 3.5 Momentum Feedback (game feel)

| Event | Hit-stop | Shake impulse | Zoom punch |
| --- | --- | --- | --- |
| Cue strike | 30 ms | momentum × 0.0075 | — |
| Carom / crit | 60 ms | momentum × 0.0075 (×1.6) | yes |
| Wall-splat | 60 ms | high | yes |
| Room clear | 350 ms pause | — | yes |

---

## 4. The 4-Phase Boon Engine

Boons are not stat lines; they are **hooks into the four phases of a stroke**. Any
boon registers into one of four dispatch points, and the build is simply the set of
hooks currently attached.

```
     LAUNCH            TRAJECTORY            IMPACT             REBOUND
  (release frame)    (every flight tick)   (on damaging hit)   (on rail contact)
        │                    │                    │                   │
   Ignition            Blade Rift            Chain Arc           Trickshot
   Recoil Nova         Aegis                 Shatter Crit        Ricochet Fuse
   Break Pulse         Phase Drift           Concussive          Kinetic Bank
```

| Phase | Fires when | Signature boons |
| --- | --- | --- |
| **Launch** | The instant the slingshot releases | **Ignition** — drops a burning hazard zone at the launch point. **Recoil Nova** — a knockback shockwave from the origin. **Break Pulse** — first hit of every launch deals bonus damage. |
| **Trajectory** | Every physics tick while airborne | **Blade Rift** — a damaging trail behind the cue ball. **Aegis** — a frontal deflection shield that destroys Stripe projectiles mid-flight. **Phase Drift** — pierce retention up, flight drag down. |
| **Impact** | On every damaging collision | **Chain Arc** — lightning zaps the nearest targets. **Shatter Crit** — +100% backstab crit damage. **Concussive** — impacts push a shockwave into neighbours, creating free caroms. |
| **Rebound** | On every rail / obstacle bounce | **Trickshot** — +2 max wall bounces and +50% damage per bank. **Ricochet Fuse** — each bank spawns a detonation at the contact point. **Kinetic Bank** — banks restore speed instead of bleeding it. |

### Rules of the engine

- Boons are **stackable to rank 3**. Re-offering an owned boon levels it instead of
  duplicating it.
- Rarity (Common / Rare / Epic) is a **scalar** on the boon's numbers, rolled at
  offer time, so the same boon can be a small or a build-defining pick.
- Boons may also contribute **passive stats** (`damageMult`, `maxBounces`,
  `focusMax`, `pierceRetention`) which are aggregated into a single stat block the
  systems read every frame.
- Because each phase has a distinct dispatch site, synergy is emergent and cheap to
  author: Trickshot (more bounces) multiplies Ricochet Fuse (bounce detonations)
  multiplies Chain Arc (each detonation is an impact).

### Intended build archetypes

| Build | Core boons | Play pattern |
| --- | --- | --- |
| **Pinball** | Trickshot + Kinetic Bank + Ricochet Fuse | Aim at rails, not enemies. Long routes, huge bank bonuses. |
| **Blender** | Blade Rift + Phase Drift + Chain Arc | Pierce everything, damage comes from the flight path. |
| **Executioner** | Shatter Crit + Break Pulse + Aegis | Single decisive backstab per stroke; survive the approach. |
| **Demolition** | Ignition + Concussive + Recoil Nova | Play for area denial and forced caroms. |

---

## 5. Hybrid Level Generation (The Hades Model)

Fully procedural geometry produces tables that are *unreadable* for bank shots — an
angle you cannot predict is not a decision. Fully handcrafted rooms get memorised in
three runs. So the generator splits responsibility exactly like Hades does:
**hand-authored space, procedural contents.**

```
 ┌──────────────────────────┐   ┌──────────────────────────┐
 │  HANDCRAFTED             │   │  PROCEDURAL              │
 │  ─────────────           │   │  ──────────              │
 │  · Table geometry pool   │   │  · Threat budget         │
 │  · Collision layout      │   │  · Archetype composition │
 │  · Spawn anchors         │──►│  · Environmental injectors│
 │  · Sightlines & angles   │   │  · Door rewards          │
 └──────────────────────────┘   └──────────────────────────┘
        stable, learnable              fresh every run
```

### 5.1 Handcrafted Table Geometry Pool

A pool of **10–15 fixed layout presets** (6 implemented in the prototype, all
authored for clean billiard geometry: symmetric obstacle placement, corner pockets
of open space, and at least two guaranteed two-rail routes).

| Preset | Shape | Designed for |
| --- | --- | --- |
| **Open Arena** | Empty felt | Pure carom chains; the tutorial table. |
| **Split Central Pillar** | One fat column mid-table | Forces committed left/right routing; blind-side backstabs. |
| **Triangle Bumper Grid** | 6 circular bumpers in a rack triangle | Pinball routes; every miss is still a bank. |
| **Choke Corridor** | Two walls forming a narrow throat | Line-up shots; punishes wide angles, rewards precision. |
| **Pinball Pillars** | Scattered circles + side bumpers | Chaotic multi-rebound routes; Trickshot heaven. |
| **Diamond Bank** | Four diagonal-ish blocks in a diamond | Textbook two-rail bank practice. |

Each preset declares:
- `obstacles[]` — circles and axis-aligned boxes with restitution
- `anchors[]` — validated enemy spawn points with clear sightlines
- `spawn` — the player's entry position (always lower third)
- `tags[]` — hints the director uses to bias composition (e.g. a corridor prefers
  Stripes at the far end; an open arena prefers dense Solids)

### 5.2 Procedural Threat Budget Director

For room level *L*:

```
budget = clamp(baseBudget + budgetPerLevel × (L − 1), …, maxBudget)      // 6 → 46
waves  = waveCountByLevel[min(L, len) − 1]                               // 1 → 3
```

The director spends the budget across waves, drawing archetypes by weight subject to
unlock gates (Solid: L1, Stripe: L2, Heavy: L3). Archetype costs are
Solid **2**, Stripe **3**, Heavy **6**, so a level-8 room might be
`3 Solids + 2 Stripes + 1 Heavy` in wave one and `4 Solids + 1 Heavy` in wave two.

Anchors are filtered against `safeSpawnRadius` (6.5 u) from the player, so no wave
ever materialises on top of you, and every spawn plays a 0.55 s telegraph ring.

### 5.3 Procedural Environmental Injectors

After the layout is chosen, the director rolls up to 3 dynamic props (from level 2):

- **Bumper Pads** — circular kickers that *amplify* rebound speed (×1.28) and refund
  a wall bounce. They turn the table into a pinball machine.
- **Kinetic Amplifier Pyres** — glowing discs that boost the cue ball's speed (×1.45,
  once per launch) and add +25% damage to the rest of the stroke.
- **Hazard Strips** — damage-over-time bands (14 dps) that carve the safe space and
  force committed routes.

Injectors are placed on free anchors, never inside obstacles, and never within the
player's spawn safety radius.

### 5.4 Procedural 2-Door Exit Routing

On room clear, **two** doors materialise on the top rail with independently rolled
reward types:

| Reward | Symbol | Effect |
| --- | --- | --- |
| **Boon** | phase glyph (Launch / Trajectory / Impact / Rebound) | Opens the 3-card boon modal |
| **Repair** | cross | Restores HP (guaranteed every 3rd room) |
| **Focus** | ring | +0.4 s max Focus |
| **Power** | chevron | +12% damage |
| **Ricochet** | arc | +1 max wall bounce |

Doors telegraph their reward *before* you commit, so the exit is a real choice, and
you must **slingshot into** the door — the reward selection is the last shot of the
room. Entering a door advances the room counter, restores Focus, and re-rolls the
whole generation pipeline.

---

## 6. Enemy Archetypes

| Archetype | Silhouette | HP | Behaviour | Counter |
| --- | --- | --- | --- | --- |
| **Solid** (Chaser) | Red cube | 34 | Steady pursuit, contact damage | Pierce straight through; the chain fodder that builds multipliers |
| **Stripe** (Shooter) | Violet octagon | 26 | Holds ~9.5 u range, charges a linear shot every 3 s | Close the gap in one stroke, or bank behind their line |
| **Heavy Eight-Ball** (Tank) | Amber cylinder | 130 | Slow advance, 180° frontal shield (88% mitigation) | Backstab (×2.0) or **bank** into it — a banked shot ignores the shield |

Design intent: each archetype teaches a different geometric lesson — *pierce lines*,
*range control*, and *approach angle* respectively. A mixed room asks you to solve
all three with a single vector.

---

## 7. Controls

| Input | Action |
| --- | --- |
| **Pointer down + hold** | Enter bullet-time (0.20x), start trajectory prediction |
| **Drag** | Pull the slingshot back; length = power, direction = inverse of launch |
| **Release** | Launch the cue ball with i-frames for the flight |
| **Quick flick (<150 ms)** | Emergency dash — no slow-mo, no Focus cost, 0.75 s cooldown |
| **Release inside the dead-zone** | Cancels the aim and refunds nothing but the drain |

---

## 8. Progression & Pacing

| Room | Budget | Waves | Introduces |
| --- | --- | --- | --- |
| 1 | 6 | 1 | Solids, the slingshot, the rail |
| 2 | 9 | 1 | Stripes, injectors |
| 3 | 11 | 2 | Heavies, shields, banking |
| 4–6 | 14–19 | 2 | Mixed compositions, hazard strips |
| 7+ | 22 → 46 | 3 | Dense racks; builds are expected to carry |

Focus fully refills on room clear. HP does not — repair doors are the only sustain,
which is why the door choice matters as much as the boon.

---

## 9. Prototype Scope & Non-Goals

**In scope (v0.4):** full stroke loop, 3 archetypes, caroms/splats/pierce/banks,
12 boons across 4 phases, 6 layout presets, threat director, injectors, 2-door
routing, HUD, boon modal, procedural audio.

**Explicitly out of scope:** meta-progression between runs, narrative, bosses,
persistent unlocks, multiplayer, tutorials beyond the boot card.

**Known open questions for playtesting:**
1. Is 2.0 s of Focus too generous once Trickshot routes get long?
2. Should Heavies telegraph their shield arc more loudly than the current emissive
   band?
3. Do 3 waves in a room overstay their welcome versus 2 denser ones?
