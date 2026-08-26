# Tutorial design

The contract for `src/systems/Tutorial.js`. Read this before changing a lesson.
If a change conflicts with a goal below, the goal wins.

## The four goals

These are absolute. Every one of them has been broken at least once by a change
that seemed locally reasonable, so each is written as a rule with the failure it
prevents.

### 1. Teach one lesson at a time

A lesson introduces exactly one idea. Not one idea plus the thing that makes it
work, not one idea plus a complication that arrives while you are practising it.

*Broken by:* a "hold to stop time" lesson that also introduced chasing enemies,
so a player who missed was learning to dodge and to freeze and to aim at once.

### 2. Keep the message on screen until the lesson is complete

The instruction is visible for the entire lesson and disappears only when the
task has been done. Feedback goes on a separate status line underneath; it never
replaces the instruction.

*Broken by:* a lesson whose completion condition was drag distance, so the text
changed as soon as the player pulled back — before they had aimed at anything,
hit anything, or fired.

### 3. Only what the lesson needs is on the table

No spare enemies, no decorative geometry, no obstacle that is not the subject of
the lesson. If the player can see it, it is part of what they are being taught.

*Broken by:* running lessons over normal generated rooms, which could contain
anything and often did not contain the shot being described.

### 4. Progress only on success

The next table loads only when the current lesson has actually been completed.
Nothing advances on a timer, a retry count, or "close enough". A lesson cannot
be failed either — a wrong attempt costs a re-rack, never the lesson — so the
only way out is through.

*Broken by:* the original caption track, which advanced on whatever the player
happened to do next.

## Rules that follow from the goals

**Everything is frozen while aiming.** `TIME.bullet` is `0`, so time stops dead
the moment a thumb goes down. Movement is a consequence of the shot, never
something happening *to* the player while they aim.

**Lesson enemies do not drive.** They are `frozen`: no AI steering, full physics.
They are billiard balls. A rack that walks away from its own diagram teaches
nothing.

**The cue rests on the lesson's own solution.** Each lesson sets a resting
heading, so the answer is drawn on the table before the player touches anything.
They still have to reproduce it.

**Every rep starts from the same place.** After a shot resolves, the ball returns
to its spawn and surviving targets are re-racked to their authored coordinates.
The geometry is drawn around the spawn, so a rep that began elsewhere would be
aiming at a diagram that no longer applies.

**The player decides when to move on.** A finished lesson detonates, holds its
celebration, and shows a **Next lesson** button. It does not advance on a timer:
the reward for finishing used to last 1.0s while the telling-off for missing
lasted 2.2s, so the game was more emphatic about failure than success.

**Feedback waits for the player, not a clock.** The status line stays up until
the next shot is fired. On a timer it expired before it could be read, looked at
against the table, and understood — the same failure as the instruction
vanishing, just quieter.

**Full power announces itself.** Draw distance is the only power control, and
the end of its range used to be invisible, so players stopped pulling at
whatever felt far enough. Reaching it now fires once: a burst at the cue butt, a
MAX POWER callout, a wider beam and a camera kick.

**There is always a way out.** A **Skip** control sits on every lesson card.
The tutorial cannot be failed, so a player who has not found a gesture has no
other exit — without this it is a wall, not a tutorial. Skipping marks the
tutorial complete and starts a normal run.

**Card buttons take `pointerdown`, not `click`, and stop propagation.** The
stage captures the pointer on its own `pointerdown` and calls `preventDefault`,
so a bubbling press never becomes a click — a button wired to `click` looks
live and does nothing.

**Success is loud, then the table resets.** A completed lesson detonates what it
killed, holds a beat, then swaps card and table on the *same frame*. Deferring
the build left the next instruction over an empty table for ~2s, and a shot
fired into that gap was judged against a lesson that had never been playable.

**Feedback lives outside the card.** The status line is absolutely positioned
below it, so the card's height does not depend on whether anything is being
said. Reserving a line for it made the card permanently taller and grew it again
under a two-line scold — over the very ball the lesson was about.

**The card points as well as tells.** Naming a thing is only half an
instruction; the player still has to find it. Each lesson declares a `spot`, and
`Tutorial._focus` turns it into an ellipse in world space that
`Tutorial._updateSpot` projects onto the card layer — dimming the table around
it and drawing a ring on it. An ellipse, not a circle, because the two things
most worth pointing at are a goal bar three times wider than it is tall and a
rack strung out in a line; a circle big enough to hold either spills over half
the table and, for the goal, up behind the card.

The dim lifts the moment a thumb goes down and stays off until the rep has been
called. Darkening the felt helps while the player is *reading* about the table
and hurts while they are aiming across it.

**One word carries the sentence.** `say` and `hint` are markup: the target is
red (`<b>`), the gesture is green (`<em>`), the same two colours on every
lesson, so the colour is readable before the sentence is. Never more than one of
each per line — highlighting everything highlights nothing.

## The lessons

Geometry lives in `src/data/lessons.json` and is editable in the level tool at
`/tool`. What each lesson asks for, and how it is judged, lives in `RULES` in
`src/systems/Tutorial.js`, keyed by the same id and merged at load.

| # | id | Card | Complete when |
|---|----|------|---------------|
| 1 | `aim` | Aim and shoot the red ball | the cue ball hits it |
| 2 | `goal` | Knock it into the goal | the red ball enters the lit bar |
| 3 | `pass-straight` | Hit one ball into the other | the struck ball reaches the second |
| 4 | `pass-angled` | Same shot, on an angle | the struck ball is cut into a second off to the side |
| 5 | `pass-three` | Now run it through three | one strike, and all three end up somewhere else |
| 6 | `power` | Pull back further | one shot clears a rack of three |
| 7 | `bank-1` | Bounce off a wall first | a rail is touched before the ball |
| 8 | `bank-2` | Again, other side | as above, mirrored |
| 9 | `bank-two-rails` | Two bounces, then hit | 2+ bounces before the ball |

`spot` picks what the lesson's spotlight frames: `player`, `goal`, `first` (the
ball nearest the cue), `rack` (all of them in one shape) or `blocked` (the rack
together with whatever is in the way of it — a bank lesson's barrier is half its
sentence, and "the red ball is blocked" is unreadable with the barrier dimmed
into the felt).

Every table is frozen. Nothing moves until the player shoots.

The sequence is deliberate: 3 and 4 give the *same instruction* on a different
rack, so the player discovers for themselves that the shot can be angled. 5 is
the game in one table — each contact sets up the next. 6 separates *power* from
*aim* by keeping the shape and changing only the technique. 7–9 teach reading
angles, and 8 exists only to repeat 7, because one success is not a skill.

### Rules worth knowing

**Judge the outcome, not the events.** Two lessons were rewritten after being
judged on physics events that did not survive contact with real play:

- Chain lessons counted cue *contacts*, so a shot that destroyed both targets —
  cue ball killing the first, the first cannoning into the second — was
  rejected while the HUD printed `2 HITS ×1.4` for the same shot. They now
  count the rack being cleared, however it was cleared. The coach must never
  contradict the scoreboard.
- The relay wanted two registered carom events, but the last hand-off arrives
  near `PHYSICS.caromMinSpeed`, so the same shot scored about half the time
  depending on frame timing. It now asks for one hand-off and every ball having
  moved. Note also that a cue ball is *not* still after a stop shot — it creeps
  forward and taps another ball seconds later, which is why strike counts are a
  bad basis for anything.

**Every ball is mortal. There is no `invulnerable` flag any more.**

It used to exist because the cue only passes through a body it *kills*, so a
"knock this ball into that one" lesson needed its target to survive the hit. The
flag bought that by making the body unkillable — and produced a tutorial that
flipped between two incompatible rules four times using identical-looking balls.
Lesson 1's ball died, lessons 2-4's could not die at all, lesson 6's died again.
Nothing on screen distinguished them, and once knocked loose an immortal ball
pinballed around the table forever throwing SPLAT.

**Power does that job now, and it is a rule the player can learn:** a basic solid
takes two hits, and only a direct hit at 89.2% power or above breaks it in one.
So a softer shot leaves the ball alive and moving — which is exactly the pass
shot — and a full-power shot shatters it and rides through. Hit it hard and it
breaks; hit it softer and it moves.

This required taking the chain multiplier out of the damage product (see
`strikeDamage` in `src/main.js`). It used to multiply damage, so contact 2 of a
launch hit *harder* than contact 1 despite the cue being slower — 44 into a 34hp
solid where contact 1 did 36 — and one max-power shot cleared a whole line. The
chain pays points now; the cue's own speed decides lethality.

**Every lesson is solvable from its own resting heading, at its own power.**
Verified by firing along each `rest` and checking the director scores it. The
"at its own power" half is new and matters: lessons 2, 3 and 4 now teach a
*softer* hit and are **supposed** to fail at full power, so a solver run that
only fires at 1.0 reports them broken when they are working correctly.

| lesson | passes at | fails at |
|---|---|---|
| 2 `goal`, 3 `pass-straight`, 4 `pass-angled` | 0.85 and below | 1.00 — the ball shatters instead of travelling |
| 5 `pass-three` | 1.00 only | 0.85 and below — the first ball survives, so the cue stops there |

Three lessons were unsolvable when first authored: one bank was geometrically
impossible because its barrier blocked the *return* leg as well as the direct
one.

**Verify with repeats, not one shot.** The integration step is frame-rate
dependent (`PhysicsSystem.update` divides `dt` by the substep count instead of
carrying an accumulator), so a lesson tuned near its margin resolves differently
on different devices. `pass-angled` was certified "solvable" by a single-shot run
while actually scoring 2 times in 4 at its own resting heading.

**Say what the gesture is, including power.** Power is the hidden requirement in
most of these — the goal shot must carry a ball the length of the table, the
relay needs enough left after two hand-offs — so the hints name the draw, not
just the line.

## The handoff

The tutorial ends and room 1 begins. Three things make that a visible event
rather than a hard cut:

- The room counter reads `––` during lessons (`game.level` is 0) so that `01`
  appearing *is* the boundary.
- The Focus gauge fades rather than pops when it appears (`transition` on
  `.hud-focus`), so its arrival in room 1 is not a hard cut.
- Contact damage is suppressed for `TUTORIAL.graceSeconds` at the start of room
  1, so the banner explaining that enemies now move is readable. Before this, a
  standing player lost 63% of their hull in the first four seconds.

Room banners (`TUTORIAL.lessons` in `src/config.js`) run *after* the tutorial, so
each may only introduce something the tutorial did not. Rooms 1–3 used to repeat
lessons the player had just finished, and room 1's said "hold to charge", which
has never been true — power is draw distance alone.

## What is deliberately not in the tutorial

- **Moving enemies.** They break goal 1 — see the failure noted above. The first
  live enemy the player meets is in room 1 of a real run.
- **Shooters.** Same reason. The Stripe's wind-up is readable on its own terms
  now (a barrel that runs out and lights up); it does not need a lesson before
  the player has learned to aim.
- **Doors, rewards, waves, injectors.** `RoomManager.loadScripted()` builds a
  room with none of them, and `RoomManager.update()` returns immediately for a
  scripted room so no wave or door logic can run.

## Implementation map

| Concern | Where |
|---|---|
| Lesson list and rules | `LESSONS` in `src/systems/Tutorial.js` |
| Room building, re-rack, ball homing | `Tutorial._buildRoom` / `_reRack` / `_homeBall` |
| Scripted tables (no waves/doors/injectors) | `RoomManager.loadScripted` |
| Goal bar geometry and hit test | `RoomManager.loadScripted` + `Tutorial._checkGoal` |
| Unfailability | `game.tutorialGuard` in `src/main.js` — blocks contact and projectile damage **to the player**. Targets are killed normally; a lesson that needs one to survive asks for a softer shot, and a partial attempt calls `RoomManager.reRackScripted` |
| Re-entering a lesson | `Tutorial._enter` re-racks *and* re-homes. Re-entry used to only re-home, so a replay opened with dead bodies still dead and a scored goal still closed — unpassable until a failed attempt happened to re-rack |
| Card markup and styling | `#coach` in `index.html` |
| Spotlight | `Tutorial._focus` / `_updateSpot`; `#coach-spot` and `#coach-ring` in `index.html` |
| Completion flag | `billiard-tutorial-done-v1` in localStorage; reset from Settings |
