# Aiming & Touch — Implementation Spec

A complete description of how the pointer and touch system works, why it works
that way, and how to rebuild it from scratch. Written to be implementable
without reading the source.

**One-line summary:** the aim is a persistent heading, and dragging rotates it by
exactly the angle your thumb sweeps *around the ball*.

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

### 2.4 Cue rotation — what shipped

**The line tracks the thumb's rotation about the ball, 1:1.** This is the model
8 Ball Pool uses. It satisfies all four constraints, and the two properties that
make it feel good are consequences of the geometry rather than tuned constants.

---

## 3. The model

### 3.1 Coordinate conventions

The game is top-down with an orthographic camera whose `up` is `(0, 0, −1)`:

| screen | world |
| --- | --- |
| right | `+X` |
| down | `+Z` |
| up | `−Z` |

Therefore the on-screen angle `atan2(z, x)`:

- is `−90°` pointing **up** (12 o'clock)
- **increases clockwise** on screen

12 o'clock as a direction vector is `(0, −1)`.

### 3.2 State

The input layer owns four pieces of state that persist between shots:

```
heading      unit vector, the aim actually drawn        init (0, −1)
target       unit vector, the un-smoothed steering goal init (0, −1)
lastBearing  radians or null, thumb bearing last frame  init null
lastTime     timestamp for the smoothing step
```

`heading` is what the game reads. `target` exists only so the heading can be
eased toward it; without the split, tremor reaches the drawn line directly.

### 3.3 The algorithm

**On pointer down** — nothing about the aim changes. This is the single most
important line in the spec.

```
target   := heading
lastBearing := bearing()          // may be null
lastTime := now
```

**Every frame while held** (and on every pointermove):

```
b := bearing()                    // thumb bearing about the ball, or null

if b is not null:
    if lastBearing is not null:
        d := b − lastBearing
        while d >  π: d −= 2π     // shortest way round
        while d < −π: d += 2π
        target := rotate(target, d)
    lastBearing := b
else:
    lastBearing := null           // forget, do not hold

dt    := now − lastTime
alpha := 1 − exp(−dt / smoothing)
heading := normalize(lerp(heading, target, alpha))
lastTime := now
```

where

```
bearing():
    v := fingerWorldPos − ballWorldPos
    if |v| < minAimRadius: return null
    return atan2(v.z, v.x)

rotate((x, z), d):
    return (x·cos d − z·sin d,  x·sin d + z·cos d)
```

> **Implementation trap.** `rotate` must use temporaries. Writing
> `target.x = target.x·c − target.z·s` before computing `target.z` corrupts the
> second component with the already-updated first. This bug produces an aim that
> spirals or collapses and is easy to miss because small rotations still look
> approximately right.

**On pointer up** — fire. Every release launches, including a tap that never
moved. A gesture that silently does nothing is indistinguishable from a shot
that failed.

### 3.4 Why only the delta

Applying the *absolute* bearing would be scheme 2.2 and would snap the line onto
your thumb. Applying only the *change* means:

- touching down cannot move the line, so placement is irrelevant
- the thumb may sit anywhere comfortable, including below the ball
- your hand and the line rotate together, which is constraint 3

### 3.5 Why precision scales with reach — for free

Angular gain is `1/r` radians per unit of finger movement, where `r` is the
thumb's distance from the ball. The same movement subtends a smaller angle
further out, so **sliding away from the ball buys fine control** with no code.

Measured in the shipped build, 60 px of thumb travel turns the shot:

| thumb distance | rotation |
| --- | --- |
| close to the ball | 42° |
| at reach | 13° |

This is the property that makes the reference game feel good, and it is why
scheme 2.3's *uniform* gain — which sounds better on paper — feels worse.

### 3.6 The dead radius

Near the ball the bearing is undefined (`atan2` of ~zero) and wildly noisy.
Inside `minAimRadius`, rotation **suspends** and `lastBearing` is set to `null`
rather than held.

Dropping it rather than holding it matters: it lets the thumb cross over the ball
and resume steering on the far side without the accumulated bearing difference
snapping the line around.

### 3.7 Heading between shots

- **While the ball travels under its own power** and the player is not aiming,
  the heading follows the ball's velocity direction. When the ball settles, the
  heading is therefore left pointing the way the ball was last going.
- **On entering any room, and on starting a run**, the heading resets to 12
  o'clock `(0, −1)`. Carrying a heading across a room boundary meant arriving
  already pointed at a wall for no reason the player chose.

### 3.8 Power is a separate axis

Power is **hold duration**, not drag distance:

```
t     := clamp(holdSeconds / chargeTime, 0, 1)
power := minPower + (1 − minPower) · t
```

It starts at `minPower`, not zero, so an instant release is still a real shot.
Keeping power on the time axis is what leaves *all* of 2-D thumb movement
available for the angle — the two never compete for the same gesture.

---

## 4. Parameters

| name | value | meaning |
| --- | --- | --- |
| `INPUT.minAimRadius` | 1.8 world u | dead radius; below this the bearing is meaningless |
| `INPUT.aimSmoothing` | 0.055 s | exponential time constant on the heading |
| `PLAYER.chargeTime` | 0.85 s | hold time from `minPower` to full |
| `PLAYER.minPower` | 0.32 | power floor on instant release |
| `PLAYER.launchSpeedMin/Max` | 24 / 56 u/s | speed range power maps onto |

There is deliberately **no angular gain constant**. Gain is `1/r`, set by where
the player puts their thumb. Introducing a gain multiplier would break the 1:1
correspondence that constraint 3 requires.

---

## 5. Integration contract

The input layer needs exactly one thing from the game and offers three:

**Requires:** `getAnchor() → {x, z}`, the ball's world position.

**Provides:**
- `setHeading(x, z)` — seed the heading (used for velocity-following and the
  per-room 12 o'clock reset)
- `heading → {x, z}` — the authoritative aim
- `refresh()` — re-derive the aim; the game calls this once per frame **after**
  the physics step, so the bearing is measured against the ball's final position

Callbacks emitted: `onAimStart`, `onAimUpdate(aim)`, `onAimCancel`,
`onRelease(aim)`. The `aim` payload carries `dirX/dirZ`, `power`, `charge`
(0–1 fill fraction) and `hold`.

> **Debugging trap.** `player.aimDir` is a *copy* refreshed only while aiming, so
> between shots it is stale. Assert against `input.heading`, never `player.aimDir`
> — mistaking the two turns correct behaviour into a phantom 180° failure.

---

## 6. Drawing the line

`LineBasicMaterial.linewidth` is **a no-op on essentially every GPU** — line
width is clamped to 1 px. A thick aim line has to be geometry.

The beam is a ribbon mesh: `beamSlices` (48) quads along the predicted path,
with per-vertex colour and additive blending. Two things ride on it:

- **width** scales with charge, so the wind-up is visible on the line itself
- **a bright wavefront** fills from the ball outward to the `charge` fraction,
  with a travelling ripple behind it

The beam is gold when the predicted path connects with a body and cyan when it
does not, so hit-or-miss is readable without counting pixels.

---

## 7. Verification

These are the properties to test, with the numbers the shipped build produces.
Drive them by dispatching pointer events at real screen coordinates.

| property | how | expected |
| --- | --- | --- |
| touch never moves the line | touch down at 4 offsets around the ball | **0.00°** each |
| 1:1 tracking | sweep the thumb along an arc about the ball | +60° → **+60.1°**, −60° → **−60.0°**, −90° → **−89.6°** |
| side independence | same sweep from in front and from behind | agree to **0.0°** |
| reach buys precision | 60 px travel at two radii | **42°** close, **13°** far |
| charge | hold and sample | **0.32 → 1.00**, launching at 53.3 u/s |
| room reset | read heading at boot | exactly **−90°** |

**Two harness traps**, both of which produced false failures during development:

1. **The stage is letterboxed.** On a 430×932 viewport the 9:16 stage is 430×764
   at top offset 84. Touches outside `[84, 848]` land on the page, not the game,
   and silently do nothing.
2. **Hold the ball still during a sweep.** An enemy nudging the ball mid-gesture
   changes the bearing and is scored as control error. Pinning the ball's
   position each step turned an apparent −78.5° error into an exact −60.0°.

---

## 8. Known limitations

- **The ball moving while aiming** shifts the bearing without the thumb moving,
  producing a small spurious rotation. In practice the ball is settled whenever
  aiming begins, so this is not currently observable.
- **Turning the line a long way** takes a correspondingly long sweep, since there
  is no gain multiplier. Lifting and re-dragging is the intended remedy — the
  same as picking up a mouse — and works because touch-down never moves the line.
