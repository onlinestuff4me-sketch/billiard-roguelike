# Coaching a board

Six boards, each with one idea on it. `npm run verify` already proves every one
is *playable* — that a findable range of aim headings satisfies it. This
document is about the other half: whether the player can **understand** it,
which no sweep can tell us.

Design canvas with three directions drawn out:
<https://claude.ai/code/artifact/b69ce13c-d01e-443f-80c3-fec2fc1ff8cf>

## What a board owes the player

**1 — One line, and it names the target and the pocket.**
A single sentence a player can hold while aiming. Not a paragraph, not two
facts, not a rule and an example. If a board needs two sentences, the board is
teaching two things and should be two boards.
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
  down. Two components reporting one event is worse than either alone.
- **Nothing expires.** No coaching text is on a timer. It is replaced by the
  next thing that happens, or dismissed by the player.
- **Never a silent stroke.** Every stroke gets a verdict. The absence of a
  response is indistinguishable from the game being broken, so the absence of a
  verdict is itself a verdict.
- **Judged at rest.** A rep is judged when the table stops, not while it is
  still moving — so a stroke that pots and then scratches is a miss, and says
  why.
- **Two highlight colours, fixed.** Bone-white is the called pocket. Green is a
  thing that helps you and the way forward. Red is a thing that costs you and a
  miss. Nothing else gets a highlight.
- **Say what is on screen.** Only words for things the player can see and has
  been shown: the white circle, the lit pocket, the 4. No jargon the game has
  not taught.

## The four states

| State | Trigger | What it must carry |
|---|---|---|
| **Instruct** | board loads | the one line, the highlighted region, the lit pocket, a resting aim near a real solution |
| **Aiming** | thumb down | the instruction, still readable, out of the shot; the routes — your ball, the struck ball, where each ends |
| **Missed** | table at rest, rep not met | what happened in one line; the line that was played and the line to play instead; board resets |
| **Complete** | table at rest, rep met | the lesson's own praise, the felt dimmed, shots refused, one CTA forward |

## The three directions

| | Words live | Coaching carried by | Cost |
|---|---|---|---|
| **A — the docked card** | a light card under the HUD, collapsing to one line while aiming | ring + lit pocket | smallest; it is today's component |
| **B — the on-felt callout** | a chip on the table tethered to what it names | the chip's own position | largest; needs a placement solve per board and per aim |
| **C — the rail and the route** | one line on a fixed band above the felt | the drawn routes, each ending in a tag naming where it goes | medium; mostly wires up what exists |

**Recommendation: C.** It is the only one that satisfies goal 3 *by
construction* rather than by animating out of the way, and it leans on the two
pieces already built — the chained route lines (`main.js projectObjectPath`)
and the called-pocket glow (`main.js callPocket`). A is the cheapest change and
the weakest link between word and object. B is the strongest link and the most
code, and its placement solve is the part most likely to misbehave on a board
nobody authored. Worth stealing from B either way: C's endpoint tags are its
leader-line idea without the solve.

## What already exists

Not all of this is new work. Today the game has: the called-pocket glow (single
and multi-pocket), the chained object-ball route, the cue's own departure line
with a red scratch warning, the scratch demonstration that swings the cue from
the line that failed to one that does not, per-stroke verdicts held until the
table is at rest, and a completion state that dims the felt and refuses shots.
What C adds is the band, the endpoint tags, and moving the instruction out of
the play area for good.
