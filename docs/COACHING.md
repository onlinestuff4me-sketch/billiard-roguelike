# Coaching a board

Six boards, each with one idea on it. `npm run verify` already proves every one
is *playable* — that a findable range of aim headings satisfies it. This
document is about the other half: whether the player can **understand** it,
which no sweep can tell us.

Design canvas with three directions drawn out:
<https://claude.ai/code/artifact/b69ce13c-d01e-443f-80c3-fec2fc1ff8cf>

**Direction C is built.** What shipped, and where it differs from the drawing,
is under "What was built" at the end.

## What a board owes the player

**1 — One line, and it names the target and the pocket.**
A single sentence a player can hold while aiming. Not a paragraph, not two
facts, not a rule and an example. If a board needs two sentences, the board is
teaching two things and should be two boards.

Plain instruction, in the order the shot happens: hit WHAT, so it does WHAT, to
end up WHERE. "Angle your shot at the 6, so it knocks the 2 toward the lit
corner", not "cut the 6 across into the 2". Billiards has a vocabulary — cut,
thread, carom, full ball, cushion — and every word of it is a word the player
has to already know to be taught anything. None of it appears in a lesson: the
rail is the bottom wall, and the thing in the way is a barrier.

**And the sentence has to be TRUE.** Naming a pocket is a claim about where a
ball ends up, and it is as checkable as the board's pass condition — `__simShot`
in the harness plays one stroke and reports where every ball came to rest. The
angled combination told the player the 2 went in the side pocket; measured
across its whole solve window, the 2 reaches a pocket at exactly one heading,
and that pocket is the far corner. The board now lights the corner and the
sentence names it.

One SENTENCE, which is not the same as one visual line — on a 390px phone a
sentence of any substance wraps, and pretending otherwise just means it gets
clipped. The band is sized for two wrapped lines and holds that height whether
it uses them or not, so the sentence can breathe without the layout moving.
Sixty-four characters is the budget; every string in `RULES` is written to it.

A board whose rep is not a pot names the target and the route instead of a
pocket — the bank is judged on reaching the 3 off a cushion, and naming a
pocket there would be describing a shot the board does not ask for.
*Passes when:* a stranger can restate the goal after reading it once.

**2 — The board points, it does not describe.**
A highlighted region says which pieces the sentence is about, the lit pocket
says where they go, and where a route is worth showing, the guide line shows
it — including the ricochet and what happens to each ball after contact.

**One hue per ball — and only four, on purpose.** The rack used to be a single
amber channel, on the reasoning that a ball is neither good nor bad. That held
while targets were interchangeable and stopped the moment a lesson named one:
"hit the 4, so it knocks the 1" is a sentence about two specific balls, and on
an all-amber table the only thing telling them apart is a numeral ten pixels
tall. Two amber routes crossing the same felt are worse — the picture cannot
say whose is whose. This is why real pool balls are coloured. A ball named in
coaching copy is inked in its own colour too, so the word and the object match.

Four, because four is what the space holds. Red is danger, mint a pick-up, cyan
your own ball, teal the table, bone a called pocket — every one of those is a
meaning a ball must not accidentally wear. What is left is a little over half
the wheel, and under red-green colour blindness it collapses further onto a
blue-yellow axis. Five hues that survive all of that do not exist; four do, and
a generated rack holds exactly four solids. One board was using a fifth number
purely as a label — it was renumbered rather than given a fifth colour that
could not be defended.

**The palette is measured, not eyeballed.** `npm run palette`
(`tools/check-palette.mjs`) checks every pair of balls that can share a table —
read from the rack rules and from `lessons.json`, because two colours only have
to be told apart if a player can see both at once — in normal vision and in
simulated protanopia, deuteranopia and tritanopia, plus each ball against the
reserved meanings and against the cloth. It fails the build rather than the
player. Two floors, not one: chase the colour-blind number alone and every ball
is herded into blue-violet, where dichromats keep the most separation —
technically accessible, useless as a set of billiard balls.

Tritanopia carries a lower floor than protanopia and deuteranopia. It is on the
order of one person in ten thousand against roughly one man in twelve, and it
is the deficiency that makes magenta approach red; holding all three to the same
number costs the palette its whole warm half to protect against the rarest, which
is a worse outcome for everyone including the people it is meant to protect.

**Colour is never the only channel.** Every ball carries its number in bone on
its face — that is the identifier WCAG 1.4.1 asks for, and it does not care
about hue. Colour is here to make the numeral unnecessary at a glance, not to
replace it.

**The ghost goes where the journey commits, not where it ends.** A line says
which way a ball travels; the moment that matters is the collision — that is
where the choice is spent. So each ball gets a hollow copy of itself, in its own
colour, at its first contact; and its route carries on past that point at a
fraction of the strength. Still shown, no longer a promise.

Into a pocket, the ghost goes **in the pocket** — not where the predicted path
happens to end. A ball that drops is removed at the mouth and its path carries
on past it, so "the end of the route" is a place the ball never reaches. That is
how a SCRATCH warning came to be drawn a foot clear of the pocket it was warning
about, which reads as a broken prediction rather than a warning.

A ghost must never read as another ball: hollow, and dimmer than the ball it
projects. A solid shape where no ball is is a lie about the state of the felt.

**Words are the last resort, not the first.** The felt carried a label at every
route endpoint — YOUR BALL, 2 STOPS HERE, 1 → SIDE POCKET — each naming a place
the picture was already showing, in type the eye had to leave the table to read,
and each then needing to be kept clear of everything it might cover. They are
gone. SCRATCH survives alone, because it is a consequence rather than a place
and no arrangement of shapes says it; it rides on the ghost inside the pocket
the cue ball will drop into.

The one label that remains is still placed by a solve (`Tutorial._updateTags`):
eight positions at three distances, scored against every ball, pocket and ghost
on screen, nearest clean one wins. **A label never covers a ball, a pocket or a
ghost.**
*Passes when:* cover the text and the goal is still guessable from the table.

**3 — Coaching stays up until the player acts, and never covers the act.**
Readable for as long as it is needed, out of the way for as long as the shot
lasts. Nothing expires on a timer; nothing sits on the felt the shot will cross.
*Passes when:* at every moment of a shot, both the words and the balls they
name are visible.

This is the goal the direction was chosen for, so it is worth being exact about
what "not on the felt" means. The camera frames the arena edge to edge: the
felt runs from the top of the layer to the bottom and the far corner pockets
sit up under the HUD. There is one horizontal strip with nothing in it, between
those corner pockets and anything a board can place, and the band is measured
into it from the live pocket geometry on every resize rather than parked at a
percentage that happened to work on one phone.

**4 — A miss is explained, and the next attempt is coached.**
Failure states what happened in the player's terms — which ball, which pocket,
what went in that should not have — then shows, on the table, what to do
differently. The board resets and the player goes again.
*Passes when:* the correction names a cause, not just an outcome, and the fix
is visible on the felt.

**5 — Success is celebrated and clearly over.**
A passed board says so, in that lesson's own words, and offers exactly one
thing to do next. The table stops accepting shots so a finished board cannot be
mistaken for a live one.
*Passes when:* there is exactly one control on screen, and it moves forward.

## Rules that follow

- **One voice at a time.** While a board is coaching, the HUD banner stands
  down. Two voices on one event are worse than either alone.
- **Nothing expires.** No coaching text is on a timer. It is replaced by the
  next thing that happens, or dismissed by the player.
- **Never a silent stroke.** Every stroke is answered, including one that
  matched no rule — it is told so. The absence of a response is
  indistinguishable from the game being broken.
- **Judged at rest.** A rep is judged when the table stops, not while it is
  still moving — so a stroke that pots and then scratches is a miss, and says
  why.
- **A board that is over is not put back.** A reset is preparation for another
  attempt, and a passed board has no next attempt, so re-racking one is the
  game tidying the table out from under a player who is still watching what
  they did. The felt stays as the winning shot left it; the next board rebuilds
  it when it loads.
- **A failed stroke is given back, not charged.** On a board played over
  several strokes, a scratch or a miss rewinds to the table as it stood when
  that stroke was fired: the balls that were up are up, where they were, the
  cue is back on the spot it was played from, and the shot is unspent. The
  alternative — rebuilding the rack — takes back the balls the player earned
  while keeping the shots they spent earning them, which leaves an attempt that
  cannot be finished. Running out of shots is the one way such a board can be
  got wrong, and it is said out loud before the attempt starts again.
- **Say what happened, then what to do.** Every correction is two halves: the
  event in the player's own terms, and the next thing to try. "Scratched — your
  own ball went in the pocket. Try the 6 into the side pocket, but hit it
  off-centre." Not "Down", not "Not quite". A correction with no instruction in
  it is a scoreboard.

  Nothing else goes in. The table putting itself back is not narrated — it has
  already happened by the time the line is read, and a sentence that describes
  what the player can see spends one of its two lines on it.
- **One event, one word — and it is the word on the table.** A ball that goes
  in a pocket is **pocketed**. Not "down", which is the game talking to itself,
  and not "potted", which is a second name for the same event: a lesson that
  calls one thing two things has taught a synonym instead of a game. Same for
  every other event the boards name.

`npm run coach` checks all three the way `npm run verify` checks solvability:
it plays real strokes, reads the table and the band afterwards, and fails on a
band that reaches for a word the game has not taught.
- **Three highlights, and only three.** Bone-white is the called pocket. Green
  is a thing that helps you and the way forward. Red is a thing that costs you
  and a miss. These layer on top of the table's own channels — cyan is always
  your ball, amber always the rack — and nothing else gets a highlight.
  Coaching text obeys the same allocation, so a word and the object it names
  are the same colour: a ball named in the band is amber, the good thing is
  green, and a pocket named in the band is the band's own bone-white, which is
  what the lit pocket on the felt is. An endpoint tag takes the channel of the
  ball whose route it ends, except at a pocket, where it takes bone-white — or
  red, when the pocket is about to eat your own ball.
- **Say what is on screen.** Only words for things the player can see and has
  been shown: the white circle, the lit pocket, the 4. No jargon the game has
  not taught.

## The four states

| State | Trigger | What it must carry |
|---|---|---|
| **Instruct** | board loads | the one line, the highlighted region, the lit pocket, a resting aim near a real solution |
| **Aiming** | thumb down | the instruction, unchanged and unfaded; the routes — your ball, the struck ball — each ending in a tag naming where it goes |
| **Missed** | table at rest, rep not met | what happened in one line, naming a cause, and what to do next; the table is put back — a whole board on a single-stroke lesson, one stroke on a multi-stroke one — and then the cue swings from the line that failed to one that works |
| **Complete** | table at rest, rep met | the lesson's own praise, the felt dimmed, shots refused, one CTA forward |

## The three directions

| | Words live | Coaching carried by | Cost |
|---|---|---|---|
| **A — the docked card** | a light card under the HUD, collapsing to one line while aiming | ring + lit pocket | smallest; it is today's component |
| **B — the on-felt callout** | a chip on the table tethered to what it names | the chip's own position | largest; needs a placement solve per board and per aim |
| **C — the rail and the route** | one line on a fixed band above the felt | the drawn routes, each ending in a tag naming where it goes | medium; mostly wires up what exists |

**Chosen: C.** It is the only one that satisfies goal 3 *by
construction* rather than by animating out of the way, and it leans on the two
pieces already built — the chained route lines (`main.js projectObjectPath`)
and the called-pocket glow (`main.js callPocket`). A is the cheapest change and
the weakest link between word and object. B is the strongest link and the most
code, and its placement solve is the part most likely to misbehave on a board
nobody authored. Worth stealing from B either way: C's endpoint tags are its
leader-line idea without the solve.

## What was built

C shipped across all six boards. The pieces, and where each lives:

**The band** (`#coach` in index.html, driven by `Tutorial._say`). A strip of
fixed height between the HUD and the felt, holding the sentence on the left and
either the progress chip or the forward CTA on the right. Four states, one
component: instruct is teal, missed is red, complete is green, and aiming is
instruct unchanged — the band is not on the felt, so it has nothing to get out
of the way of. It replaced a light card that floated over the table at 12.5% of
the screen and dropped to nine per cent opacity whenever a thumb went down;
that fade was the goal-3 problem stated as a workaround, and it is gone.

**Where the band sits** (`layoutBand` in main.js). Measured from the live
pocket geometry on every resize, not set as a percentage. See goal 3 above for
why the strip it lands in is the only one available.

**Endpoint tags** (`aimTags` in main.js, rendered by `Tutorial._updateTags`).
The per-aim half of the instruction, and the half a fixed sentence cannot
carry: "→ SIDE POCKET" where the rack ball's route ends, "YOUR BALL" or
"SCRATCH" where yours does. The pocket test is the same closest-approach
predicate `Player.js` uses to turn the departure line red, so a tag and the
line under it can never disagree. They show only while a thumb is down — a tag
with no line under it is a label for nothing.

**One sentence per board** (`RULES` in Tutorial.js). Each board's `say` and
`hint` were merged into one sentence naming the ball and the pocket; the
material worth keeping from the old hint became `nudge`, which REPLACES the
instruction after two honest misses rather than sitting next to it.

**The miss demonstration** (`Tutorial._resolveShot`). It used to run on a
scratch alone — the one miss where the mistake is unmissable anyway, because
the player just watched their own ball disappear. It now runs on every miss
that put the cue back on its spawn: hold on the heading that failed, then swing
to the board's measured solution, on the real cue with the real preview
redrawing the whole way. A board mid-way through a rack is skipped, since
`solve` is measured from the spawn and the cue is not there.

**Three fixes the states forced.** A scratch's message was being overwritten a
moment later by the board's generic scold, so the sharpest correction the game
has never reached the screen; it is held now and written once, when the table
stops. The completion celebration threw the lesson's whole cheer across the
felt in display type, which ran off both edges now that the cheers are
sentences — the band has the words, the felt has the fireworks. And the resting
preview is redrawn every frame, so hiding it on completion lasted exactly one
frame; it is gated on `awaitingNext` now, because a bright cue line lying
across a dimmed table is the loudest way a finished board goes on looking live.

**Two things moved to make room.** The hull readout joins the contract, score
and stroke readouts in hiding during a lesson — it states a number nothing
enforces on an unfailable board, and its band is where the two far corner
pockets live, which two of the six boards call. Skip moved out of the top-right
corner to the top centre for the same reason: a control parked in a corner of
that band is a control sitting in a pocket.

**One board moved.** `budget`'s ball 2 was against the top rail, close enough
that the band clipped its top edge; it came down to `z: -10.6`. `npm run
verify` says all six boards are still playable, and that board's aim window got
wider (4.5° to 6°) — it now needs all three of its three shots for a full
clear, which is the budget the board is named after.

### What C still costs

The one-sentence budget is real and it bites. `cut-combo` and `bank` both
wanted to name a pocket and a technique and had to give one up. The two-line
band is the concession that keeps them honest; a third line would be the point
at which the direction has stopped being one line on a rail.

## The old design is a mode, not a branch

The real-time build this replaced is still playable, at `/classic`, reachable
from **Modes** on the main menu. It is a frozen build of the commit it shipped
as, produced by `scripts/snapshot-classic.mjs`, not a configuration of this
one. `RULES.staticTable` looks like the whole difference between the two and is
not: the old design also had nine lessons instead of six, a goal bar, a gun on
the stripes, chain targets and doors to shoot through, none of which this
codebase still contains. A flag flip would produce a hybrid nobody designed. A
previous design is a previous version, so it is served as one.

## What already existed

Not all of this was new work. Before C the game already had: the called-pocket
glow (single and multi-pocket), the chained object-ball route, the cue's own
departure line with a red scratch warning, the scratch demonstration, per-stroke
verdicts held until the table is at rest, and a completion state that dims the
felt and refuses shots. What C added is the band, the endpoint tags, the miss
demonstration on every miss, and moving the instruction out of the play area
for good.
