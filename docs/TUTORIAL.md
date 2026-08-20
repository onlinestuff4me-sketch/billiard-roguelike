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

## The lessons

| # | Card | Table | Complete when |
|---|------|-------|---------------|
| 1 | Aim and shoot at the red ball | one red ball straight ahead | the cue ball hits it |
| 2 | Hit the red ball into the goal | one red ball, red glowing goal bar on the top wall | the red ball enters the goal |
| 3 | Hit one ball into the other ball | two red balls in line up-table | the struck ball caroms into the second |
| 4 | Hit 2 in a row | two red balls in a column on the cue's line | one shot clears the rack |
| 5 | Hit 3 in a row | three red balls in a column 20° **off** vertical | one shot clears the rack |

Lessons 1–5 are all frozen tables. Nothing on any of them moves until the player
shoots.

### Notes per lesson

**1 — Aim and shoot.** The whole game in one action. Aiming and firing are taught
together because separately neither has a visible result.

**2 — The goal.** Teaches that enemies are objects you move, not just things you
delete. The goal bar is authored on the room (`goal` in the scripted room spec)
and only an *enemy* entering it counts — the cue ball passing through does not.

**3 — The carom.** Teaches that a struck ball is itself ammunition. Detected on
the `carom` event, which fires when a knocked enemy strikes another enemy;
striking both with the cue ball directly does not count.

**4 and 5 — Chaining.** Two, then three, cleared in a single launch. This is the
scoring mechanic, so it is the last thing taught and the only one repeated. It
works because the cue ball passes through anything it *kills* — so chain targets
must be mortal, unlike the goal and carom targets.

Judged on the rack being **cleared**, not on cue contacts. Counting contacts
rejected a shot that destroyed both targets — the cue ball killing the first and
the first cannoning into the second — while the HUD was printing `×1.4 2 CHAIN`
for the same shot. The coach must never contradict the scoreboard.

**5 is also the graduation.** Every earlier rack sits straight ahead, so the
whole tutorial could otherwise be beaten with five identical straight drags.
This one is offset 20°, so the player leaves having seen that "up the middle" is
not the only line there is. The cue still rests on the answer, as every lesson
does — the rack being off-centre is the lesson, not a hunt for it.

The Focus gauge is *not* introduced here. It was, briefly, and that broke goal 1:
a resource meter arriving under the hardest rack is a second idea. Focus stays
hidden and pinned for the whole tutorial and is met in room 1.

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
| Unfailability | `game.tutorialGuard` in `src/main.js` — blocks contact and projectile damage **to the player**. Targets are killed normally; the ones that must survive a hit carry `invulnerable` per body, and a partial attempt calls `RoomManager.reRackScripted` |
| Card markup and styling | `#coach` in `index.html` |
| Completion flag | `billiard-tutorial-done-v1` in localStorage; reset from Settings |
