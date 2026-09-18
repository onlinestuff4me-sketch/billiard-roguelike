# The Gate Ladder — the run after the lessons

**Version:** 0.1 (designed, not built)
**Revises:** GDD §9, Level Generation
**Depends on:** lessons 1–6, shipped
**Companion artifact:** https://claude.ai/artifact/CzjZZDpgJc9mGPW8sbgFz4

Six lessons teach you to aim. What comes after is a run of twelve rooms in which
**every odd room is an authored puzzle that introduces exactly one new noun**, and
every even room is a procedural table that makes you use it somewhere you have
never stood before.

---

## 1. The shape

Authored where a mechanic is first met. Procedural everywhere else.

The tutorial works because each of its six boards has exactly one idea and a
measured window of headings that solves it. The run has no such thing today:
`RoomManager` picks a layout at random from room 3 onward (`src/systems/RoomManager.js`,
`this.layout = level <= 2 ? LAYOUTS[0] : pick(rng, LAYOUTS)`) and deals a rack into
its anchors — so the first time a player meets a mine it is in a room nobody
designed and nothing verified.

The fix is not to author twelve rooms. Authoring everything kills the reason to play
a second run; rolling everything means the moment a mechanic is introduced is the one
moment the game cannot control. So: **author the introductions, roll the rest.**

> **A mechanic earns a gate only if it changes how you aim, or in what order you shoot.**

That criterion settles the list. The **Double**, the **Mine**, **Freeze**, the
8-goes-last clause and the **Kicker** all change the shot you pick, so each gets a
gate. The **Upgrade pocket**, **Extra shot**, Repair and every boon change only what a
pot is *worth* — the scorecard already explains those, and they ride into procedural
rooms and door rolls with no ceremony.

---

## 2. The ladder

Rack and stroke counts follow the ramp in GDD §5 unchanged. **Spare** is strokes
minus balls. **Window** is the measured width, in degrees, of the run of cue headings
that fills the contract: the floor a board must clear before it ships.

| # | Kind | Name | New noun | Rack | Strokes | Spare | Window floor |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Gate | Calling It | the contract | 4 | 7 | +3 | 5.0° |
| 2 | Procedural | Open felt | — | 4 | 7 | +3 | 5.0° |
| 3 | Gate | Pay Twice | Double | 5 | 7 | +2 | 3.0° (paying line) |
| 4 | Procedural | Doubles on the roll | — | 5 | 7 | +2 | 4.0° |
| 5 | Gate | The Live Lane | Mine | 5 | 6 | +1 | 3.5° |
| 6 | Procedural | Mixed felt | upgrade pocket | 5 | 6 | +1 | 3.5° |
| 7 | Gate | Second Thoughts | Freeze | 6 | 6 | 0 | 3.0° |
| 8 | Procedural | Budget squeeze | extra shot | 6 | 6 | 0 | 3.0° |
| 9 | Gate | Last Word | the 8 goes last | 7 | 6 | −1 | ≥3 clearing orders |
| 10 | Procedural | Over budget | — | 7 | 6 | −1 | 2.5° |
| 11 | Gate | It Shoots Back | Kicker | 7 | 6 | −1 | 2.0° |
| 12 | Finale | Full vocabulary | — | 7 | 5 | −2 | 2.0° |

**01 · Calling It.** One pocket lit bone-white, four balls on an empty table, three
spare strokes. The 3 sits in front of the called pocket and the 1 in front of an
uncalled one, so the easiest pot on the table pays nothing. The lesson is the sentence
at the top of the screen, not the angle.

**03 · Pay Twice.** The called pocket has a clean straight-in line and the double sits
off it at forty degrees. Taking the pot pays once; banking through the double and then
potting pays what the room is scored on. Two windows, deliberately: the cheap line is
wide, the paying line is narrow, and the scorecard shows afterwards which one was taken.

**05 · The Live Lane.** A mine bar across the straight route to the only called pocket;
the way round is one cushion. The mine is wide enough that a player aiming straight
cannot miss it — the obvious line is the punished one, and the preview says so before
the stroke is spent.

**07 · Second Thoughts.** Three freeze charges and a rack where no single stroke clears
two balls — but a cue ball stopped at the right instant, re-aimed and released, does.
The shot is legible only while it is rolling, which is the one thing the preview cannot
draw. Spare is zero, so the room is unclearable without spending a charge.

**09 · Last Word.** The 8 is parked in the mouth of the widest pocket, where it is the
easiest ball to pot and a foul to pot. Every other ball has to be cleared around it.
The only gate whose difficulty is the *order* of six strokes rather than the width of
one window — so the only one measured in sequences rather than degrees.

**11 · It Shoots Back.** The last thing a player learns is that the table can move
without them. The kicker sits between the rack and the only called pocket; the ball it
throws is the ball that plants the pair. It is last because it is the only room where a
good plan depends on something happening after the preview ends.

**12 · Full vocabulary.** Every noun unlocked, two spare strokes gone, widest object
budget. Nothing new is introduced — a finale that teaches is a finale that was
mis-placed.

**Run two onward.** The gates are scaffolding, not content. Once a mechanic has been
introduced it never needs introducing again: on a second run every slot is procedural,
and the ladder survives only as the window floors and the object budget per room.

---

## 3. What a gate is allowed to do

1. **One new noun.** A gate introducing the mine may not also introduce the 8-last
   clause. That constraint, not a room count, is what fixed the ladder at six gates.
2. **The obvious line is the wrong one.** The shot a player takes without reading pays
   less than the shot that uses the new noun. The room teaches by making the cheap
   answer visibly cheap on the scorecard, never by refusing it.
3. **Measured before it ships.** A gate carries its solving window in the board file the
   way the six lessons do, and `tools/verify-boards.mjs` fails the build if the stored
   window is not the window the table actually plays.
4. **Never the only solution.** Every gate is swept for secondary windows. A board with
   exactly one line is a lock, not a puzzle; the intended line should be the widest and
   the best-paying, not the only one.
5. **Daylight between balls.** At least 0.55 units of clear felt between any two balls
   the player has to read — the number that fixed lessons 5 and 6.
6. **Nothing under the band.** A ball hidden behind the instruction card is a bug the
   editor can see and a playtest usually cannot.

---

## 4. Puzzle archetypes

Each gate is one archetype crossed with one noun, and no pairing repeats inside a run.
These are not difficulty tiers — a bank can be easier than a cut — they are the
distinct questions a billiards puzzle knows how to ask.

| Archetype | What it asks | Proven on |
| --- | --- | --- |
| **The cut** | One ball, one pocket, an angle that is not a straight line. | lesson 1, The Angle |
| **The plant** | The cue ball never touches the scoring ball; error doubles across the gap. | lesson 2, Ball On Ball |
| **The bank** | A cushion between you and the ball. Where the preview earns its keep. | lesson 4, Off The Cushion |
| **Two in one** | One stroke, two pockets. Compulsory from room 9, so taught long before. | lesson 5, Two In One Stroke |
| **The routed lane** | The pot is trivial; getting there without touching the red thing is not. | lesson 6, Green And Red |
| **The order** | Every stroke is makeable and only one sequence clears inside the budget. | new at gate 09 |

---

## 5. Difficulty is a number

The six lesson boards were tuned until each had a measured window, and those six
numbers are the calibration for everything above. A gate at 3.0° is exactly as hard to
aim as *Ball On Ball*, whatever it looks like.

| Board | Window | Degrees |
| --- | --- | --- |
| The Angle | 23.5–29.5 | 6.0° |
| Two In A Row | 71–75 | 4.0° |
| Ball On Ball | 51–54 | 3.0° |
| Two In One Stroke | 312–315 | 3.0° |
| Off The Cushion | 190–192.5 | 2.5° |
| Green And Red | 285.5–288 | 2.5° |

So the run's curve is written the same way: 5.0° at the first gate down to 2.0° at the
last, with procedural rooms held to the floor of the gate before them.

| Axis | Wider | Tighter | Measured by |
| --- | --- | --- | --- |
| Aim window | 6.0° | 2.0° | sweep at 0.5°, longest solving run |
| Daylight | 1.10 u | 0.55 u | closest pair the player must read |
| Spare strokes | +3 | −2 | strokes minus balls |
| Scratch risk | 0% | ~30% | share of solving headings that also pocket the cue |
| Piece scale | 0.78 | 0.66 | floor is legibility of the number on a ball |

**Scratch risk is the axis to spend last.** A board where the solving line also drops
the cue ball a third of the time does not feel harder, it feels arbitrary — the player
did the thing the preview drew. Tighten the window and the budget first; reach for
scratch risk only when a room is meant to be a genuine risk–reward fork, and say so in
the contract.

---

## 6. What the generator is allowed to deal

A procedural room draws from the set of nouns whose gate has been cleared and nothing
else. That is the whole of the sequencing logic, and it replaces the flat `level <= 2`
test in `RoomManager`.

Before a seed is accepted it is played headlessly against the same solver the preview
uses:

- **Solvable inside the budget.** A sequence of strokes fills the contract with the
  strokes the room deals.
- **Wide enough to aim.** The first stroke of that sequence sits in a run of headings
  at least as wide as the room's window floor.
- **More than one way in.** At least two distinct solving runs.
- **Readable.** Every pair of balls the solution needs reads apart by 0.55 units or
  more, and no ball sits behind the instruction band.
- **No dead hazard.** A mine may not sit in the only solving lane; a kicker may not
  throw a ball into the cue ball's rest position.

A seed failing any of these is rerolled, up to forty times, and then the slot falls
back to the last verified seed for that room number — a known-good board is always
better than a room the player cannot clear. Every accepted seed carries its measured
window with it, so a room that plays wrong is a board you can open in the editor and
look at, not a bug report that starts with "sometimes".

---

## 7. The tool

Placement tuning already has a GUI: **`/tool`** in this repo. It loads the lesson and
layout files, drags balls, objects and obstacles around a real table with quarter-unit
snapping, keeps undo, draws the instruction band so you cannot hide a ball behind it,
and hands back JSON to paste or download. It imports the game's own `src/config.js`,
which is the reason it agrees with the game about where a pocket is — and the reason
the tuning surface should not be rebuilt as a standalone page. A copy of the table
constants is a copy that drifts, and the day it drifts is the day the editor is
confidently wrong.

The gap was measurement, and it is now closed. The editor drives the real game
in a frame beside the canvas — the same probes `npm run verify` and `npm run aim`
drive — so every number below is the game's answer, not the editor's opinion:

| In the editor | What it answers | Built on |
| --- | --- | --- |
| **Measure** | Sweeps at 0.5° and draws every solving run round a dial: the widest, where `solve` falls, how far the resting aim is from one. | `__simSweep`, an arc at a time |
| **Daylight** | The closest pair of balls, live while you drag — plus the gap to the cue ball and how many balls sit behind the instruction card. | the radii in `config.js` |
| **Play it** | One heading played on the real table: what went down, how many rails, and whether the preview drew the same shot. | `__simAim` |
| **Clear the rack** | Whether the rack comes down inside the board's budget, and the route that does it. | `__simPlan` |
| **Ship** | Writes the measured run into the lesson as its `window`. | the sweep it just ran |

At 0.5° — the step `verify` uses — a board takes about fifteen seconds and comes
back with the number `verify` will come back with. `npm run editor` holds it to
exactly that: it drives the editor's own buttons headlessly and fails if the run
it measures is not the stored window, if the stored solve does not pot, or if
**Ship** cannot be clicked.

So the editor is now the place a gate is *designed* rather than merely
positioned: drag, measure, see the window narrow, drag back. Two things it still
cannot do — place felt objects (it draws them, read-only, so a board is never
measured against something invisible), and roll a procedural seed to run the
acceptance rules in §6 against. Both are the same machinery pointed at a
different document.

## 8. Open

- **Twelve rooms or ten.** Twelve is what six gates plus alternation gives you, and a
  6–12 minute session is what the GDD promises. If a run reads long in play, the even
  rooms are what to cut — losing a procedural room costs a repetition, losing a gate
  costs an introduction.
- **Where boons sit on the ladder.** A boon that bends a rule the player met two rooms
  ago is a much better boon, which argues for weighting the pool by cleared vocabulary.
- **Whether gate 11 survives its own preview.** The kicker is the one mechanic that
  moves the table after the line is drawn, and the aim work is built on the promise that
  the line does not lie. It may need a preview of its own, or it may need to be the
  moment the game says plainly that this one is not predictable.
- **Run two's floor.** Replacing gates with procedural rooms at the same window floors
  keeps the curve but loses the authored beats entirely. A middle setting — gates kept,
  contracts rerolled — is probably better, and is worth a playtest before either is
  built.

---

*Window figures for lessons 1–6 are the measured values stored in
`src/data/lessons.json`. Every figure attached to a gate or a procedural slot is a
target to be measured, not a measurement.*
