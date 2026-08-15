# Style Guide — Aesthetic, Audio & Thematic Blueprint

**Theme name:** *Dark Velvet Cyber-Billiards*
**Reference feel:** a high-end pool hall at 3 a.m., lit only by the table lamp and a
neon sign — rendered as an abstract arcade.

---

## 1. Visual Direction

### 1.1 The one-sentence brief

> Deep, moody, velvet-dark table; everything that *matters mechanically* glows.

The felt and the room recede. The cue ball, the enemies, the trajectory lines, the
doors, and the impact sparks are the only bright objects on screen. If a player's
eye is drawn to something, that something must be actionable.

### 1.2 Palette

All values live in `src/config.js` (`PALETTE` for WebGL, `CSS_PALETTE` for DOM) so
the shader colours and the HUD never drift apart.

| Role | Hex | Usage |
| --- | --- | --- |
| Obsidian | `#05070a` | Scene clear colour, letterbox, modal scrim |
| Felt Deep | `#06231d` | Under-panel vignette; corners fall into this |
| Felt | `#0b3a2e` | The bed of the table |
| Felt Line | `#14624c` | Guide grid ("diamonds"), 28% opacity |
| Rail | `#0a1a24` | Cushion bodies |
| Rail Glow | `#1d6f7a` | Cushion emissive + boundary outline |
| **Player Cyan** | `#35f2ff` | Cue ball, Focus gauge, primary aim line |
| Player Core | `#d9feff` | Hot inner core of the cue ball |
| Trail | `#1fd7ff` | Motion ribbon |
| Aim Ghost | `#4a8fa5` | Predicted reflections (dotted, dimmer) |
| Carom Gold | `#ffe27a` | Carom cone preview, "CAROM!" text |
| **Solid Red** | `#ff3d6e` | Chaser cubes |
| **Stripe Violet** | `#a05cff` | Shooter octagons |
| **Heavy Amber** | `#ffb340` | Tank cylinders |
| Shield | `#fff0c2` | The Eight-Ball's 180° frontal band |
| Projectile | `#ff8ad4` | Stripe shots |
| Bumper | `#2ef2c4` | Kinetic bumper pads |
| Pyre | `#ffd166` | Amplifier pyres |
| Hazard | `#ff5a3d` | Hazard strips |
| Door | `#35f2ff` / `#ff5ce1` | The two exits (always different hues) |
| Spark | `#fff6d8` | Impact particles |
| Bone | `#eaf6ff` | All HUD text |

**Colour law:** *hue encodes threat class, brightness encodes state.*
A dim magenta cube is a spawning Solid; a full-brightness one is active; a
white-hot one is knocked and lethal to its own allies.

### 1.3 Form language

- **Everything is a primitive.** Boxes, cylinders, octagonal prisms, spheres, discs.
  No organic shapes, no textures, no imported assets — the whole game ships as
  geometry + emissive materials.
- **Flat-shaded neon over dark.** `MeshStandardMaterial` with high roughness on the
  table, `MeshBasicMaterial`/`emissive` on anything that glows. Scene lighting is
  deliberately dim — everything the player must read is *emissive*, not lit.
- **Silhouette first.** Every entity must be identifiable at 60 px tall on a phone,
  in motion, in peripheral vision.
- **Additive glow, never additive clutter.** Bloom is tuned to threshold 0.34 /
  strength 0.70 — the lit felt sits *below* the threshold, so only emissive
  objects halo and the table never washes out.

### 1.4 Motion & feel vocabulary

| Element | Behaviour |
| --- | --- |
| **Motion ribbon** | A 26-point tapering trail behind the cue ball, alpha-faded from head to tail, only drawn above 4 u/s. It is the primary read for "how fast am I going". |
| **Directional squash** | Enemies scale slightly along their velocity vector while knocked, selling momentum without animation. |
| **Impact sparks** | 8–20 short-lived points fired along the reflected normal; colour inherits the *struck* entity. |
| **Shatter debris** | Wall-splats and deaths spray longer-lived fragments in the impact hemisphere. |
| **Screen shake** | Impulse proportional to collision momentum, decaying exponentially (7.5/s), applied as a camera *offset* — never rotation, which breaks aim reading. |
| **Hit-stop** | 30 ms standard / 60 ms on carom & crit. The whole simulation freezes; audio does not. This is the single most important feel parameter in the game. |
| **Zoom punch** | 2.8% ortho-height compression on caroms, splats and room clears, released over ~170 ms. |
| **Bullet-time transition** | 70 ms into 0.20x, 160 ms back out. Fast in, slow out — entering must feel instant, leaving must feel like a released spring. |
| **Floating text** | "CAROM!", "SPLAT!", "BACKSTAB", "×2.5" — DOM elements projected from world space, rising 70 px and fading over 0.85 s. Runs on real time, so a hit-stop never stalls the read. |
| **Door labels** | Persistent world-projected chips under each exit naming its reward, so the choice is legible before the shot is committed. |

### 1.5 Layout & framing

- Hard **9:16 portrait** stage, letterboxed and centred on desktop, full-height on
  mobile. The playfield never crops: the orthographic frustum is fixed in world
  units, so every device sees the *same* table with the same angles.
- HUD occupies the top ~12% and bottom ~10%; the middle 78% is untouched play space.
- The player spawns in the lower third, doors appear on the top rail — the run reads
  bottom-to-top, matching thumb ergonomics.

---

## 2. Procedural Audio Palette

There are **no audio files**. Everything is synthesised at runtime through the Web
Audio API (`src/core/AudioManager.js`), which keeps the build tiny and lets pitch,
filter and gain react continuously to game state.

### 2.1 Signal chain

```
 [ oscillators / noise buffers ]
              │
              ├── per-voice gain envelope (ADSR-ish, exponential release)
              ▼
      master low-pass filter  ◄── driven by time dilation
              │                   (18 kHz open → 620 Hz in bullet-time,
              ▼                    90 ms glide)
        master gain  ◄── 0.55 normal, ×0.78 in bullet-time
              │
              ▼
         destination
```

The context is created **lazily on the first user gesture** (the boot veil tap), as
required by mobile autoplay policies, and suspended when the tab is hidden.

### 2.2 The palette

| Event | Synthesis | Intent |
| --- | --- | --- |
| **Slingshot release** | White-noise burst through a band-pass sweeping 900 → 180 Hz over 140 ms + a short square blip | A crisp *snap*, the tension leaving the band |
| **Chain hit** | Triangle + sine pair on a **pentatonic minor scale** (0, 3, 5, 7, 10 semitones from A3), stepping up one degree per unbroken chain hit and jumping an octave every 5 | Turns a long combo into a melodic phrase — the chain literally sounds like it's climbing |
| **Cue impact / crunch** | Filtered noise burst (200 ms) + detuned sine thump; brightness and gain scale with impact momentum | Weight. Small taps click, big hits crunch |
| **Carom ("The Break")** | Sub-bass sine sweeping 130 → 38 Hz over 380 ms, layered under a noise crack | The money sound. Felt in the chest, not the ears |
| **Wall-Splat** | Short low-passed noise slam + pitch-down sine, tuned darker than a carom | Terminal, final |
| **Backstab / crit** | Adds a bright 5th above the chain note | Rewards precision with consonance |
| **Bullet-time enter/exit** | Master filter glides to 620 Hz, gain to ×0.78; a soft descending sine on entry, ascending on exit | Everything goes underwater while you think |
| **Bumper / pyre** | Short bright FM blip (bumper) / rising saw swell (pyre) | Pinball feedback |
| **Enemy shot fired** | Two-tone descending square | A warning you can hear off-screen |
| **Room clear** | Sub-bass drop + an ascending root–5th–octave arpeggio | Release of tension |
| **Boon selected** | Warm triad with a slow attack | Ceremony |
| **Damage taken** | Detuned low square, harsh and short | Unambiguous, never pretty |

### 2.3 Mixing rules

- **The chain owns the mid-range.** Impact crunches are filtered to leave 200–800 Hz
  free so chain notes always cut through.
- **Sub-bass is rationed.** Only caroms, wall-splats and room clears touch it, so it
  never stops meaning "something big happened".
- **Voice cap.** Transient voices are fire-and-forget and self-disconnect on `ended`;
  simultaneous impacts collapse into one crunch per 30 ms window to avoid clipping.
- **Silence is a tool.** During hit-stop the simulation freezes but audio continues —
  the gap between the impact transient and the world resuming *is* the punch.

---

## 3. Character & Enemy Language

Enemies must be read by **shape at a glance**, because during bullet-time the player
is parsing the whole table in under two seconds.

| Billiard name | Primitive | Colour | Role read | Behavioural tell |
| --- | --- | --- | --- | --- |
| **Solids** | Cube (boxy, grounded) | Red `#ff3d6e` | *Chaser* — comes to you | Constant forward lean; slight roll toward the player |
| **Stripes** | Octagonal prism (many-sided, "aimed") | Violet `#a05cff` | *Shooter* — keeps distance | Charge ring closes for 0.75 s before firing; body faces you |
| **Heavy Eight-Balls** | Large cylinder (a literal eight-ball on its side) | Amber `#ffb340` | *Tank* — must be out-angled | A bright shield band covers the frontal 180°; the band is the aim instruction |

### Supporting cast

| Object | Primitive | Colour | Read |
| --- | --- | --- | --- |
| Player | Sphere with a hot inner core + ribbon | Cyan | "This is me, and this is my speed" |
| Stripe projectile | Small sphere with a tail | Pink | Slow enough to dodge, fast enough to punish standing still |
| Bumper pad | Torus/disc, pulsing | Mint | "Hit me, I pay you back" |
| Amplifier pyre | Flat disc with a rising ring | Gold | "Fly through me" |
| Hazard strip | Flat band with scan lines | Orange-red | "Do not linger" |
| Door | Vertical glowing gate + reward glyph | Cyan / Pink | "Shoot me to continue" |

### State encoding (applies to every enemy)

| State | Visual |
| --- | --- |
| Spawning | 0.55 s expanding telegraph ring; body at 25% opacity, no collision |
| Active | Full colour, gentle idle bob |
| Charging (Stripe) | Closing ring + brightening emissive |
| Knocked (lethal object ball) | Emissive pushed toward white, velocity-aligned squash, trail sparks |
| Damaged | 90 ms white flash |
| Dying | Shatter debris in the impact hemisphere + a fading shockwave ring |

**Anti-goal:** never communicate a mechanic with colour alone. Shields have a band,
charging has a ring, knocked bodies have a trail. Colour-blind players read shape
and motion first.

---

## 4. UI & Typography

- **Type:** a single condensed geometric sans (`Rajdhani`/`Chakra Petch` with a
  system stack fallback), uppercase, wide letter-spacing (0.16–0.32 em) for labels.
- **Numbers are the loudest UI element** — combo multiplier and room counter are the
  only large glyphs.
- **HUD components:**
  - *Health bar* — top-left, segmented, drains with a lagging "damage ghost" fill.
  - *Radial Focus gauge* — bottom-centre ring around the thumb's resting zone; it
    depletes clockwise and pulses when it can no longer sustain an aim.
  - *Room counter* — top-centre, `ROOM 07` with a depth ramp in colour.
  - *Combo counter* — centre-right, scales up on each step and drifts back down.
- **Boon modal** — three portrait cards, each stamped with its phase glyph and
  rarity border (Common: bone, Rare: cyan, Epic: magenta). The modal freezes time
  completely (timeScale 0) and is the only screen with a scrim.
- **Motion for reduced-motion users:** shake and zoom punch scale to zero when
  `prefers-reduced-motion` is set; hit-stop and colour feedback remain.
