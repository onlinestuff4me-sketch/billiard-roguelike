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
| **Strokes saved** | 500 × room number, per unspent stroke, paid at room end |
| **Multipliers picked up** | Gold rings and gold pockets *double* what has been built |
| **Multipliers earned** | Banks, balls touched, balls dropped — the trick ladder |

### 3.1 The multiplier ladder

Every stroke opens at ×1 and climbs while the table is still moving:

| Event | Effect |
| --- | --- |
| Each rail the cue ball banks off | **+1** |
| Each ball the cue ball touches | **+1** |
| Each ball sunk, or driven through a gate | **+1** |
| A gold ring or gold pocket | **×2** on what has been built |

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

### 4.1 Pockets

Six, where a real table has them: four corners and the middle of each long rail.
They are **capture zones, not holes cut in the geometry** — the rails still reflect,
and a body is taken the moment its centre gets inside the capture radius. That keeps
the trajectory preview exactly as trustworthy as it was, while still letting a ball
rolling along a cushion drop.

| Type | Colour | Effect |
| --- | --- | --- |
| **Score** | Cyan | Takes the ball, pays its number |
| **Gold** | Carom gold | Doubles the multiplier, then pays at the doubled rate |
| **Upgrade** | Magenta | Pays nothing; adds a boon pick to the room's reward |
| **Live** | Hazard red | Pays double, then fires the ball back onto the table at you |
| **Scratch** | — | The *cue ball* into any pocket: the stroke's score is voided, cue re-spots |

Types are re-rolled every room, and arrive one at a time: gold is always present,
upgrade unlocks at room 3, live at room 4. Colour never encodes a mechanic alone —
each type also carries a distinct glyph.

### 4.2 Lit objects on the felt

| Object | Effect | From |
| --- | --- | --- |
| **Gold ring** | Doubles the multiplier when anything runs through it. Re-arms every stroke. | Room 2 |
| **Shatter gate** | Destroys an object ball driven through it and pays 60% of a pot. Harmless to the cue ball. | Room 3 |
| **Freeze cell** | Shoot the cue ball into it for 3 freeze charges. One use. | Room 4 |
| **Mine** | Costs hull on contact with the cue ball. One use. | Room 6 |

Everything except the gold ring stays spent for the room, so clearing a table
visibly changes it.

### 4.3 The rack

Every ball is numbered, because the contract talks about them by name and because
the number *is* the ball's worth. Silhouettes are unchanged — shape still encodes
behaviour, the number encodes value:

| Numbers | Archetype | Silhouette |
| --- | --- | --- |
| 1–4 | Solid | Red cube |
| 5–7 | Stripe | Violet octagon |
| **8** | Heavy | Amber cylinder — always the last ball of a rack |

---

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
2. Should a scratch cost a stroke as well as the score, or is voiding enough?
3. Is one freeze cell per room the right supply, or should charges be scarcer?
4. Does the live pocket read as a risk worth taking, or as a trap to avoid?
