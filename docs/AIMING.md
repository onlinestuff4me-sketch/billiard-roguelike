# Aiming & Touch — Implementation Spec

A complete description of how the pointer and touch system works, why it works
that way, and how to rebuild it from scratch. Written to be implementable
without reading the source.

**One-line summary:** the thumb is the butt of a cue whose axis runs through the
ball — direction is `ball − thumb`, and how far back you pull is the power.

---

## 1. The problem this solves

A top-down game on a phone has to answer one awkward question: **your thumb is
opaque and it is on the playfield.** Anything that ties the aim to your thumb's
*position* puts your thumb on the line you are trying to read.

There is a second, less obvious constraint. On a 9:16 screen the ball is often
near the bottom, so the interesting part of the table — everything the shot will
cross — is *above* it. That is exactly where a pointing gesture wants your thumb
to go.

The control therefore has to satisfy four things at once:

1. **Fine angular control.** Shots are decided by degrees, not by which enemy you
   tapped. A bank across the table amplifies a 2° error into a miss.
2. **The thumb must be able to sit off the shot line.** Ideally below the ball,
   where a thumb naturally rests.
3. **The gesture must match what happens on screen.** If the hand turns, the line
   turns, the same way, by the same amount.
4. **Uniform behaviour.** The same movement should do the same thing everywhere
   on screen, so the control can be learned once.

---

## 2. Four schemes, and why the first three fail

This history is the most useful part of this document: each failure isolates one
of the constraints above, and a reimplementation will rediscover them otherwise.

### 2.1 Slingshot — drag back, release to fire

Aim runs *opposite* the drag; drag distance sets power.

**Fails constraint 3 and partly 1.** The heading came from `finger − touchdown`,
a lever arm that **starts at zero**: the first few pixels of movement swing the
aim through tens of degrees, so it can never settle. It also bundles power into
the same drag, so one gesture answers two questions when only one is interesting.
And the inversion means aiming away from your target, which nobody predicts.

### 2.2 Absolute pointing — the ball aims at your finger

**Fails constraint 2, fatally.** It is intuitive for one shot and then unusable,
because your thumb sits directly on the forward path. This is not tunable; the
anchor has to leave the target line.

It also has a subtler defect. "Aim toward my finger" is well defined from every
side, but the *inverse* ("aim away") is not — and any scheme that runs the aim
away from the touch has a 180° discontinuity where in-front becomes behind. That
discontinuity is what makes an absolute scheme feel unpredictable, not the
absoluteness itself.

### 2.3 Floating stick / horizontal-travel rotation

Two variants were tried. A relative stick (aim follows a displacement vector from
a trailing anchor) and a one-dimensional version (horizontal thumb travel rotates
the aim by a fixed gain).

Both fix occlusion. Both **fail constraint 3**: sweeping the thumb in an arc does
not turn the line in an arc. The hand and the screen are describing different
things, and it reads as "unintuitive" even though every individual property —
uniform gain, no snap, thumb off the line — is satisfied.

### 2.4 Cue rotation about the ball

The line rotated by the angle the thumb swept *around* the ball, delta-only.
Correct on every constraint above, and still the wrong feel: nothing on screen
corresponded to a cue. The thumb was a steering wheel, not a stick, so the
mental model stayed abstract and re-aiming meant winding rather than placing.

### 2.5 The cue through the ball — what shipped

**The thumb is the butt of a cue whose axis runs through the ball.** Direction
is `ball − thumb`; the draw is the power. This satisfies all four constraints
*and* supplies the missing thing: a physical object the player is holding.

---

## 3. The model

### 3.1 Coordinate conventions

Top-down orthographic camera with `up = (0, 0, −1)`:

| screen | world |
| --- | --- |
| right | `+X` |
| down | `+Z` |
| up | `−Z` |

So `atan2(z, x)` is `−90°` pointing **up** (12 o'clock) and **increases
clockwise** on screen. 12 o'clock as a vector is `(0, −1)`.

### 3.2 The whole algorithm

```
cue():
    v    := ballPos − thumbPos        // thumb → through the ball → outward
    draw := |v|
    return v, draw

on pointer down:                      // placing a stick, not nudging one
    if draw > minAimRadius:
        heading := target := normalize(v)      // snap, no easing

every frame while held:
    if draw > minAimRadius:
        target := normalize(v)
    heading := normalize(lerp(heading, target, 1 − exp(−dt / aimSmoothing)))

    t     := clamp((draw − minDraw) / (maxDraw − minDraw), 0, 1)
    power := minPower + (1 − minPower) · t

on pointer up:
    fire along heading at lerp(launchSpeedMin, launchSpeedMax, power)
```

That is the entire control. It is *absolute* — no accumulated state, no deltas —
which is what makes re-aiming feel like lifting the stick and setting it down
somewhere else.

### 3.3 Why this direction, and not its opposite

`ball − thumb`, not `thumb − ball`. The consequences are worth stating because
they are the whole design:

- **The thumb is behind the shot by construction.** It can never sit on the
  stretch of table the ball will cross, which is what killed every
  point-at-the-target scheme on a phone.
- **Sliding the butt right swings the tip left**, exactly as a real cue does.
  Thumb below the ball fires up; slide right and the shot goes up-and-left.
- **Drawing straight back adds power without touching the angle**, because
  moving along the axis changes `draw` and leaves `normalize(v)` unchanged.
  Measured: a 2 u → 9.5 u draw moves the angle **0.00°**.

### 3.4 Sensitivity

Angular gain is `1/draw`. A real cue bounds sensitivity the same way, and it
bounds it in the right place: a committed shot is drawn well back, so the lever
arm is longest exactly when accuracy matters most. Inside `minAimRadius` the
axis is degenerate, so the last good heading is held rather than allowed to spin.

### 3.5 Heading between shots

- While the ball travels under its own power and the player is not aiming, the
  heading follows its velocity, so it ends up pointing the way the ball last went.
- **On entering any room and on starting a run, the heading resets to 12 o'clock.**
- The stored heading only matters for what is drawn before the first touch —
  once a thumb is down, the cue defines the line absolutely.

---

## 4. Parameters

| name | value | meaning |
| --- | --- | --- |
| `INPUT.minAimRadius` | 0.7 u | below this the axis is degenerate; heading holds |
| `INPUT.minDraw` | 1.6 u | draw at which power is at its floor |
| `INPUT.maxDraw` | 9.5 u | draw at which the cue is fully loaded |
| `INPUT.aimSmoothing` | 0.055 s | exponential time constant on the heading |
| `PLAYER.minPower` | 0.32 | power floor, so a short draw is still a real shot |
| `PLAYER.launchSpeedMin/Max` | 24 / 56 u/s | speed range power maps onto |

There is deliberately **no angular gain constant**. Gain is `1/draw`, set by how
far back the player pulls.

---

## 5. Integration contract

**Requires:** `getAnchor() → {x, z}`, the ball's world position.

**Provides:** `setHeading(x, z)` (used for velocity-following and the per-room
12 o'clock reset), `heading → {x, z}`, and `refresh()` — called once per frame
**after** the physics step so the cue is measured against the ball's final
position.

Callbacks: `onAimStart`, `onAimUpdate(aim)`, `onAimCancel`, `onRelease(aim)`.
The `aim` payload carries `dirX/dirZ`, `power`, `charge` (0–1 draw fraction),
`pullLength` (the draw in world units) and `cueX/cueZ` (the butt position, for
drawing the shaft).

> **Debugging trap.** `player.aimDir` is a *copy* refreshed only while aiming, so
> between shots it is stale. Assert against `input.heading`, never
> `player.aimDir` — mistaking the two turns correct behaviour into a phantom
> 180° failure.

---

## 6. Drawing it

`LineBasicMaterial.linewidth` is **a no-op on essentially every GPU** — width is
clamped to 1 px. A thick line has to be geometry.

The whole stick is drawn, which is what sells the metaphor:

- **shaft** — a line from the ball back to the thumb, brightening with power
- **ball** — the tip
- **beam** — a ribbon mesh (`beamSlices` quads) along the predicted path, widening
  with power, with a bright wavefront filling from the ball outward. Gold when
  the predicted path connects with a body, cyan when it does not.

---

## 7. Verification

| property | expected |
| --- | --- |
| thumb below the ball | fires **−90°** (12 o'clock) |
| thumb above the ball | fires **+90°** (6 o'clock) |
| slide thumb right, from below | shot swings counter-clockwise, **−23.7°**, now up-and-left |
| draw 2 u → 9.5 u straight back | angle moves **0.00°**, power **0.355 → 1.00** |
| release at full draw | **55.5 u/s** |
| heading at boot | exactly **−90°** |

**Three harness traps**, all of which produced false failures during development:

1. **The stage is letterboxed.** On a 430×932 viewport the 9:16 stage is 430×764
   at top offset 84. Touches outside `[84, 848]` hit the page, not the game.
2. **The first touch also starts the run**, which respawns the ball at the room
   spawn point. Measuring on that touch reads the ball's *old* position — this
   made a correct implementation look 180° wrong. Spend one touch booting.
3. **Hold the ball still during a gesture.** An enemy nudging it changes the cue
   axis and is scored as control error.

---

## 8. Known limitations

- **Aiming along a screen edge.** To fire up, the thumb must be below the ball;
  if the ball is against the bottom rail there is little room left. `minDraw` is
  low enough that a short draw still works, but the shot is weak there. A future
  option is to let the cue butt clamp to the stage edge and keep the angle.
- **The ball moving while aiming** changes the axis without the thumb moving. In
  practice the ball is settled whenever aiming begins, so it is not observable.
