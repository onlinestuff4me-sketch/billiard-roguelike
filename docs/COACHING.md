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
| **Missed** | table at rest, rep not met | what happened in one line, naming a cause; the board resets, then the cue swings from the line that failed to one that works |
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

## What already existed

Not all of this was new work. Before C the game already had: the called-pocket
glow (single and multi-pocket), the chained object-ball route, the cue's own
departure line with a red scratch warning, the scratch demonstration, per-stroke
verdicts held until the table is at rest, and a completion state that dims the
felt and refuses shots. What C added is the band, the endpoint tags, the miss
demonstration on every miss, and moving the instruction out of the play area
for good.
