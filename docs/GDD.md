# Billiard Roguelike — Game Design Document

**Version:** 0.5 (the static-rack redesign)
**Platform:** Mobile web, portrait 9:16, one-thumb play
**Engine:** Vite + Three.js (WebGL), Web Audio API
**Session length:** 6–12 minutes per run

---

## 1. High-Level Hook

> **You are the cue ball.**
> A rack, a contract, and fewer strokes than you would like.

Every room is a static puzzle. Nothing moves until you shoot, so you have all the
time in the world to read the table — and a stroke budget that shrinks as the rack
grows. The contract names what has to go down; the pockets decide what it pays.

**One-line pitch:** *Billiards with a scorecard and a Hades boon economy, where the
skill being scored is how few strokes it took.*

### The rule the whole design turns on

> **A ball is never destroyed by being hit. It is destroyed by being driven into a
> target.**

The cue ball carries no damage number. Hitting a ball moves it; that is all. Pockets
and shatter gates are the only things that take a ball off the table. That single
change is what makes the *shot* — not the power — the thing the player is choosing,
and it retires the damage maths (`strikeDamage × speedRatio × chainMultiplier`) that
used to decide, invisibly, whether a ball survived contact.

### Design Pillars

| Pillar | What it means | What it forbids |
| --- | --- | --- |
| **Nothing moves between strokes** | The table is a puzzle you may study for as long as you like. | Timers, drains, and anything walking at you while you plan. |
| **The budget is the pressure** | Strokes are finite and get scarcer. Every one is a decision with a price. | Free repositioning. There is no dash. |
| **The table is the weapon** | Rails, rings and gates all pay. Raw power is the worst way to play. | Homing, auto-aim, "just point at the ball". |
| **Legible physics** | The prediction lines never lie. A preview that shows a bank into a cut is what happens. | Hidden randomness in collision response. |
| **Nothing is inferred** | The contract is a sentence. The budget is countable marks. | Numbers the player has to decode mid-shot. |
| **Portrait, one thumb** | Everything reachable with a single thumb drag. | Buttons, virtual sticks, two-finger gestures. |

---

## 2. Core Loop

```
        ┌──────────────────────────────────────────────────────────┐
        │                                                          │
        ▼                                                          │
   STATIC RACK ──► AIM (no clock) ──► RELEASE ──► RESOLVE          │
   contract +      drag the cue,      one stroke   physics owns    │
   stroke budget   4 preview layers   spent        the table       │
        │                                              │           │
        │                          ┌───────────────────┤           │
        │                          ▼                   ▼           │
        │                    FREEZE (earned)      TABLE SETTLES    │
        │                    stop it, re-aim,     bank the stroke  │
        │                    no stroke spent      step the budget  │
        │                          │                   │           │
        │                          └───────────────────┤           │
        │                                              ▼           │
        │                                    contract filled?      │
        │                                              │           │
        └──────── strokes left ◄───────────────────────┤           │
                                                       │           │
                                            SCORECARD ─┴─► 2 DOORS │
                                            pots + strokes saved ──┘
```

### Beat-by-beat

1. **The rack.** A room deals a contract — *"SINK ALL 6 · THE 8 LAST"* — and a stroke
   budget. Both are on screen from the first frame. Nothing on the table moves.
2. **Aim.** The shot rotates about the cue ball: drag anywhere and the launch line
   runs from your finger through the ball, so pulling further out both raises power
   and sharpens the angle. Four preview layers render — the cue path, ghosted rail
   reflections, a **ghost ball** at the contact position, and the departure line of
   the body you would strike, with the cue ball's own **tangent** at right angles.
   There is no clock on any of this.
3. **Release.** One stroke is spent. Physics takes the table and the player has no
   further say — unless they have a freeze charge.
4. **Resolve.** Balls carom, bank, run rings, and drop. The multiplier climbs while
   the table is still moving, and the pentatonic run climbs with it.
5. **Settle.** The stroke banks what it paid. The budget steps down.
6. **Fill → Scorecard → Doors.** When the contract is filled, unspent strokes pay
   out, the scorecard shows the ledger, and two doors open. You must *slingshot into*
   the door you want — the reward choice is itself a shot, and it costs no stroke.

### Failure

Run out of strokes with the contract unfilled and the rack **breaks loose**: every
ball still standing takes a bite out of the hull, and the exits open anyway. A bad
room costs you the next few rooms, not the run on the spot. The run ends when the
hull reaches zero.

---

## 3. Scoring

Score comes from four places, and only four.

| Source | Rate |
| --- | --- |
| **Pots** | The ball's number × 100, at the multiplier standing when it drops |
| **Shots saved** | 500 × room number, per unspent shot, paid at room end |
| **Multipliers picked up** | The green **double** on the felt multiplies what has been built |
| **Multipliers earned** | Bounces, balls touched, balls dropped — the trick ladder |

Every pocket pays the same. There are no pocket types: the multiplier, the
upgrade and the risk all live on the felt, where colour is allowed to mean
something.

### 3.1 The multiplier ladder

Every stroke opens at ×1 and climbs while the table is still moving:

| Event | Effect |
| --- | --- |
| Each wall the cue ball bounces off | **+1** |
| Each ball the cue ball touches | **+1** |
| Each ball knocked in | **+1** |
| The green double | **×2** on what has been built |

Points are paid **at the instant a ball drops**, at the multiplier standing then. So
the order of a route is worth real money: bank before you pot, and take the gold ring
late rather than early. A worked example, matching the design canvas:

| # | What happens | Mult | Pays |
| --- | --- | --- | --- |
| 01 | Release | ×1 | — |
| 02 | Cue ball crosses the gold ring | ×2 | — |
| 03 | Banks off the left rail | ×3 | — |
| 04 | Cuts the 5 | ×4 | — |
| 05 | The 5 drops | ×5 | **2,500** |
| 06 | Cue rides the tangent into the 3 | ×6 | — |

Taking the ring *after* the bank would have doubled a ×2 into a ×4 and paid **3,500**
for the same shape. That gap is the game.

### 3.2 Why strokes saved is the headline

A saved stroke pays `500 × room`. In room 2 that is 1,000 and barely registers; in
room 12 it is 6,000 and beats most pots. Efficiency becomes more valuable exactly as
it becomes harder to achieve — and it is the only score source that rewards *not*
doing something.

---

## 4. The Table

### 4.1 Pockets are architecture

Six, where a real table has them: four corners and the middle of each long rail.
The **frame swells outward into a full circle around every mouth** and the
**cushions break and flare into it**, exactly as a real table's jaws do. A pocket
is not a lit target painted on the felt; it is a hole with a railing round it,
in the same six places every room.

They are **capture zones, not holes cut in the geometry** — the rails still
reflect, and a body is taken the moment its centre gets inside the capture
radius. The drawn mouth is deliberately *wider* than that radius, so a ball that
looks like it is going in, goes in: the visual promise is always more generous
than the rule. The throat is drawn, not simulated — no jaw rattles, and no
near-miss the trajectory preview did not show.

**All six are identical and carry no colour at all.** They are drawn in the
table's own materials, which is what stops them competing with the mint and red
objects for the same glance: the eye can look for "a hole" without parsing hue.
A pocket has exactly one extra state — **called**, a bone-white lip, when a
contract names it — and any future state is expressed in brightness, geometry or
motion, never in a new hue.

Knocking your own ball in is a **foul**: the shot pays nothing and you re-spot.

### 4.2 Pick-ups and hazards

One form and two meanings. A **dashed outline around a hollow interior** is what
says "you drive through this"; **mint** means hitting it helps you and **red**
means it costs you. The glyph says which. Nothing about the silhouette is
load-bearing, so bars, lanes, gates and irregular shapes are all legal.

| | Effect | From |
| --- | --- | --- |
| **Double** (mint) | Multiplies what the shot has built. Comes back every shot. | Room 2 |
| **Mine** (red) | Costs hull. Only bites the cue ball. | Room 3 |
| **Freeze** (mint) | Three freeze charges. | Room 4 |
| **Upgrade** (mint) | A free boon pick at the door. | Room 6 |
| **Kicker** (red) | Sends the nearest ball back at you at speed. | Room 7 |
| **Extra shot** (mint) | +1 shot this room. | Room 8 |

Only the cue ball triggers them. An object ball rolling over a mine would make
routing unreadable, and half the point of the felt is that *your* ball's path is
the thing you are choosing.

### 4.3 The rack

Every ball is numbered, because the contract talks about them by name and the
number *is* the ball's worth. The rack is its own colour channel — never red,
never mint, because a ball is neither good nor bad:

| Numbers | Look |
| --- | --- |
| 1–4 | Amber |
| 5–7 | A bone ball with a violet band, like a real striped ball |
| **8** | Black with a bone rim. Always the last ball of a rack. |

The 8 is exactly the same size as every other ball. It is special by colour, not
bulk — at nearly double a normal ball it was eating the felt.

### 4.4 Scale

Every piece radius — balls, the cue ball, pocket mouths, felt objects — passes
through one multiplier, `RULES.pieceScale`. Nothing else moves: the arena, the
obstacles and every authored layout stay exactly as written, and the table gets
roomier because the things on it got smaller.

| | Before | Now (0.78) | A real 7ft table |
| --- | --- | --- | --- |
| Table width, in ball diameters | 14.5 | **18.6** | 17.6 |
| Table length, in ball diameters | 25.8 | **33.1** | 35.1 |
| Pocket mouth, in ball diameters | 2.02 | **2.02** | ~2.0 |
| Ball on a 390px phone | 23 px | **18 px** | — |

**0.66 is the floor**, because below about 15px across the number on a ball
stops being readable. Going smaller means numbers come off the ball entirely.
Stepping this down with the room ramp is the obvious difficulty axis — more fits
on the table, angles tighten, nothing new to learn — and waits until the flat
version has been played.

## 5. The Stroke Ramp

The rack grows and the budget shrinks. **Spare** — strokes minus balls — is what the
player actually feels.

| Rooms | Rack | Strokes | Spare | What it forces |
| --- | --- | --- | --- | --- |
| 1–2 | 4 | 7 | +3 | Room to miss. Learn the table. |
| 3–4 | 5 | 7 | +2 | One wasted stroke is affordable. |
| 5–6 | 5 | 6 | +1 | Every stroke but one has to pot. |
| 7–8 | 6 | 6 | 0 | Every stroke has to pot. |
| 9–10 | 7 | 6 | −1 | One stroke has to pot twice. |
| 11+ | 7 | 5 | −2 | Two doubles, or a gate and a pocket in one. |

From room 5 the contract adds **the 8 goes last**. Potting it early is a foul: it is
re-spotted and the stroke it happened on pays nothing.

---

## 6. Freeze — the earned power

Between strokes the table is already frozen, so there is nothing to slow down. The
thing worth earning is the *other* freeze: **stopping the table mid-stroke**, while
the cue ball is still travelling, and re-aiming from wherever it has got to.

- Spending a charge stops every body where it is. The cue ball comes to rest and is
  re-aimed; every other ball keeps the velocity it had.
- Releasing again **resumes the same stroke**: the multiplier, the budget and every
  other ball's momentum carry straight on.
- It costs a charge. It never costs a stroke.

Two ways in: shoot the cue ball into a **freeze cell** on the felt (3 charges, and it
costs you a stroke and a good position to go and get it), or take **Freeze** at a
door, where it competes head-on with the stroke and bounce rewards.

Freeze-and-re-aim is the best-feeling thing in the game, which makes it a poor
default and a superb prize. Moving it behind a cost is also what lets the base game
be honestly, calmly static.

---

## 7. Rewards

On room clear, **two** doors materialise on the top rail with independently rolled
rewards, telegraphed before you commit the shot.

| Reward | Effect |
| --- | --- |
| **Boon** | Opens the 3-card boon modal (see §8) |
| **Repair** | Restores hull (guaranteed every 3rd room) |
| **Stroke** | +1 stroke every room, for the rest of the run |
| **Freeze** | +2 freeze charges |
| **Ricochet** | +1 max wall bounce |

Focus and raw damage are gone from the pool: neither decides anything now that balls
do not die to hits. What a player wants is another stroke, another freeze, or another
bank on the multiplier.

Potting into an **upgrade pocket** buys an extra boon pick, cashed on the way out of
the room — a second reward the player routed for rather than rolled for.

---

## 8. The 4-Phase Boon Engine

Boons are hooks into the four phases of a stroke — **launch**, **trajectory**,
**impact**, **rebound** — stackable to rank 3, with rarity as a scalar on their
numbers. The engine is unchanged from v0.4; what changed is what a good boon *does*.

Under the new rules the strongest picks are the ones that bend a rule the player has
already learned:

- **Shatter on contact** — a full-power strike destroys a ball outright. Genuinely
  build-changing precisely because the base game forbids it.
- **+1 stroke** per room.
- **Rails count double** on the ladder.
- **The multiplier survives** into the next stroke.

*(Status: the phase engine and the v0.4 boon list ship as-is. The rule-bending picks
above are designed but not yet implemented.)*

---

## 9. Level Generation

**Hand-authored space, procedural contents** — the Hades model, unchanged in shape.

- **Handcrafted:** a pool of table geometry presets (6 implemented), each authored for
  clean billiard angles, with obstacles, spawn anchors and at least two viable
  two-rail routes. Rooms 1–2 are always the empty table.
- **Procedural:** pocket types, felt objects, and where the rack sits — drawn from the
  layout's validated anchors, filtered against the spawn radius, the obstacles and
  every pocket and object already placed.

Balls are spread across anchors rather than racked in a triangle: a tight rack is a
lovely opening break and a terrible puzzle, because every ball after the first is
behind another one.

---

## 10. Controls

| Input | Action |
| --- | --- |
| **Touch below the ball** | A cue appears under your thumb, its line running through the ball and out the top. The shot fires up |
| **Slide the thumb right** | The butt swings right, so the shot swings left — exactly as a real cue does |
| **Pull straight back along the line** | Loads power. The angle does not move |
| **Release** | Fire, at the drawn speed. One stroke |
| **Tap while the table is moving** | Spend a freeze charge (if you have one) |

You are holding a cue. Your thumb is the butt, the ball is the tip, and the shot runs
out the far side: the direction is simply `ball − thumb`. Sensitivity is bounded the
way a real cue bounds it — turning gets finer the further back you draw, so the lever
arm is longest exactly when the shot matters.

There is no dash. A flick is simply a soft shot, and it costs the same one stroke
every other shot does.

---

## 11. Prototype Scope & Non-Goals

**In scope (v0.5):** static rack, contracts, the stroke ramp, six typed pockets,
four felt objects, the multiplier ladder, strokes-saved scoring, the room scorecard,
freeze as an earned power, 6 layout presets, 2-door routing, 6 tutorial boards.

**Explicitly out of scope:** meta-progression between runs, narrative, bosses,
persistent unlocks, multiplayer.

**Known open questions for playtesting:**
1. Is the ramp too generous early? Rooms 1–4 have +3 and +2 spare.
2. Should a foul cost a shot as well as the score, or is voiding enough?
3. Is `pieceScale` 0.78 right, and should it step down with the room ramp?
4. Does the kicker read as a risk worth routing around, or just as noise?
5. Amber solids sit near red hazards in hue. Does form carry it on a phone?
