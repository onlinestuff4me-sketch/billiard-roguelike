# Every noun on the table — mechanics, hazards, upgrades

**Version:** 0.1
**Companion to:** [PROGRESSION.md](PROGRESSION.md), the gate ladder
**Counted from:** the code, not the design doc
**Companion artifact:** https://claude.ai/artifact/9rueNogQDHaPMHwiQ9dEBP

44 entries — **35 shipped, 3 designed, 6 proposed**. Everything the game can put in
front of a player, sorted by the two questions that decide where any of it can go:
*does it change how you aim or in what order you shoot*, and *can the projection line
still tell the truth about it*.

---

## 1. How to read it

**Gate?** is the rule from the progression doc: a mechanic earns its own authored room
only if it changes **how you aim** or **in what order you shoot**. Everything that only
changes what a pot is *worth* rides into a procedural room with no ceremony, because
the scorecard already explains it.

**Preview cost** is the column this project keeps learning the hard way. The pillar is
that the prediction lines never lie, and holding to it took agreement between the drawn
line and the played shot from 90.1% to 99.5% — banked shots from 71.5% to 99.4%. Every
new toy is measured against that number first: a mechanic the preview cannot draw is
not a hard mechanic, it is an unfair one.

| Preview cost | Means | Examples |
| --- | --- | --- |
| **free** | The projection already draws it, or it is resolved by code the preview shares with the table. | pockets, mines, barriers, a swallowing black hole |
| **a new line** | A deterministic extra segment rule. Real work, but a line stays a line. | teleporter, phantom cue balls |
| **integrate** | The path stops being straight segments and reflections; the predictor has to step physics, and `npm run aim` has to prove it still agrees. | a black hole that bends a rolling ball |

---

## 2. Mechanics — the rules of the table

| Noun | What it does | Status | Gate? | Preview |
| --- | --- | --- | --- | --- |
| Draw-the-cue aim | Thumb below the ball; the shot runs `ball − thumb`. Draw distance is power, and the lever arm is longest exactly when the shot matters. | Shipped | the control | free |
| Projection lines | Four layers: cue path, ghosted rail reflections, a ghost ball at the contact position, the departure line of the ball you would strike, with the cue's tangent at right angles. | Shipped | the promise | free |
| The mission | A sentence at the top of the screen: *SINK ALL 5 · 8 LAST*. Never inferred, never a number to decode. Called the mission because it is addressed to the player. | Shipped | yes — gate 1 | free |
| Called pocket | A bone-white lip on the pocket the mission names. The only extra state a pocket has. | Shipped | with the mission | free |
| Stroke budget | Strokes minus balls is *spare*: +3 in room 1, −2 from room 11. | Shipped | the pressure | free |
| Saved strokes | 500 × room for every stroke left unspent. The only score source that pays for *not* doing something. | Shipped | payout only | free |
| Bank multiplier | +1 on the ladder per rail the cue ball takes. | Shipped | payout only | free |
| Contact multiplier | +1 per ball touched, +1 per ball knocked down. | Shipped | payout only | free |
| Paid at the drop | A ball pays number × 100 at the multiplier standing *the instant it drops*. Bank before you pot and the same shape pays 40% more. | Shipped | payout only | free |
| Multi-ball in one stroke | Two balls down on one stroke pay at two different rungs — the first steps the ladder before the second drops. No separate bonus. | Shipped | yes — archetype | free |
| The 8 goes last | From room 5. Potting it early is a foul: re-spotted, stroke pays nothing. | Shipped | yes — order | free |
| Scratch | Your own ball down a pocket. The shot pays nothing and you re-spot. | Shipped | with the mission | free |
| Pockets | Six, identical, colourless, in the same six places. Capture zones: the drawn mouth is 1.18× the radius that takes a ball, so what looks in, goes in. | Shipped | architecture | free |
| Rails | Cushions that reflect, resolved at the exact time of impact rather than out of whatever overlap a frame ended in. | Shipped | architecture | free |
| Piece scale | One multiplier on every piece radius, 0.78 today, 0.66 the floor. The difficulty axis that teaches nothing new. | Shipped | tuning | free |
| Hull | Damage only lands while a stroke resolves: mine 12, kickback 10, 8 per ball still standing at the end. | Shipped | payout only | free |
| Coach road | Arrows along the solving line that brighten as the aim arrives on it, inside a measured window. Tutorial only. | Shipped | teaching | free |
| Rails count double | A boon making banks worth +2. | **Designed** | payout only | free |
| The order | Every rack has one — 1, 2, 3, and the 8 last, because the 8 wears the highest number. Sinking them in it is **never required**: the first in order is +1 on the ladder, the second +2, the third and after +3, and breaking it takes nothing away but the streak. | Shipped | yes — gate 1 | free |
| Clean sweep | A whole rack with nothing out of place pays `500 × room` on its own line of the scorecard. Small on purpose — the order's real income is the ladder it built on the way. | Shipped | payout only | free |
| Strict order | The same order, made mandatory: out of turn is a foul, the way an early 8 is. A **mode**, never a default, unlocked by sweeping a room in order of your own accord. | Shipped, locked | yes — a mode | free |
| The refusal, drawn | A pot the mission would turn away is drawn in red before the stroke — the ball's line, its ghost in the pocket, and the words naming the ball to take instead. Covers the 8-last rule too, which had the same unfairness and nobody had noticed. | Shipped | with the order | free |

**The order was the cheapest new mechanic here and it is now built.** No physics and no
new line: the ladder already existed, so the order pays in rungs rather than in a
separate pot of money, and the HUD names the ball it wants next rather than describing a
rule. It pays rather than demands because a rule that only takes things away teaches
nothing — a player who has not yet seen the order just loses to it, where a bonus tells
them the moment it lands what the game was hoping for.

Still unbuilt on it: the **preview turning red** under strict order before the stroke is
spent. The projection already knows which ball the cue reaches first, so a refusal never
has to come as a surprise — see §6.

---

## 3. Hazards — things on the felt that cost you

One form and one rule: a dashed outline round a hollow interior means you drive through
it, red means it costs you, and the glyph says which. **Only the cue ball triggers a
felt object** — an object ball rolling over a mine would make routing unreadable.

| Noun | What it does | Status | Gate? | Preview |
| --- | --- | --- | --- | --- |
| Mine | 12 hull, cue ball only. Rolls from room 3 at 0.55 chance. | Shipped | yes — routing | free |
| Kicker | Sends the nearest ball back at you at speed; 10 hull on contact. Room 7+. | Shipped | yes — aim | **blind** |
| Barriers | Solid boxes and pillars, authored per table. | Shipped | architecture | free |
| Bumpers | A barrier that gives back more than it takes. | Shipped | payout only | free |
| Loose balls | 8 hull each for every ball still standing when the budget runs out. | Shipped | no | free |
| The 8, early | A foul rather than a loss: re-spotted, stroke pays nothing. | Shipped | yes — order | free |
| **Teleporter** | A pair of rings; a ball entering one leaves the other with the same speed and heading, so a pocket with no route suddenly has exactly one. | **Proposed** | yes — aim | a new line |
| **Black hole · swallower** | A seventh hole that is not yours: takes any ball, cue or object, and pays nothing. A pocket's code with a different verdict. | **Proposed** | yes — routing | free |
| **Black hole · gravity** | A radial pull that bends a rolling ball as it passes. The most interesting thing here and the most expensive. | **Proposed** | yes — aim | integrate |
| Out of turn | The hazard face of the order, under strict mode: the out-of-turn ball is the trap, and it is usually the easiest ball on the table to hit. Comes straight back, and the shot pays nothing. | Shipped, locked | yes — a mode | free |

**The kicker is already the exception, and it should stay the only one.** Every other
hazard is visible to the projection before the stroke is spent; the kicker fires a ball
back *after* the line ends, which is the one shape a static projection cannot draw.
Survivable once — it is what makes it the last gate — but a second mechanic with the
same property turns "the lines never lie" into "the lines mostly don't lie", and that
is the pillar the whole aiming rewrite was paid for.

---

## 4. Upgrades — things you earn

| Noun | What it does | From | Status | Preview |
| --- | --- | --- | --- | --- |
| Freeze | Stop the table mid-stroke, re-aim from wherever the cue ball got to, release again — no stroke spent. Three charges a cell, six the ceiling. *This is "re-aim mid-shot + freeze time", and it already exists.* | felt cell room 4+, door | Shipped | free |
| Double | Multiplies what the stroke has built. Comes back every stroke, so the question is *when* you cross it. | felt, room 2+ | Shipped | free |
| Upgrade pocket | An extra boon pick, cashed at the door — a reward you routed for rather than rolled for. | felt, room 6+ | Shipped | free |
| Extra shot | +1 stroke, this room only. | felt, room 8+ | Shipped | free |
| Stroke | +1 stroke every room for the rest of the run. The strongest reward in the pool, because it moves *spare*. | door | Shipped | free |
| Ricochet | +1 maximum wall bounce, so longer routes stay legal and the preview draws one more segment. | door | Shipped | free |
| Repair | Hull back. Guaranteed every third room. | door | Shipped | free |
| Boon | A 3-card pick hooked into one of four stroke phases — launch, trajectory, impact, rebound — stackable to rank 3, rarity as a scalar. | door | Shipped | varies |
| Shatter on contact | A full-power strike destroys a ball outright. | boon | **Designed** | free |
| Multiplier survives | The ladder carries into the next stroke instead of resetting to ×1. | boon | **Designed** | free |
| **Phantom cue balls** | Release fires two ghost copies mirrored a few degrees either side of the aim line. They strike, bank and pot like the real one and feed the same ladder; they cannot scratch. One stroke, three lines. | boon or felt cell | **Proposed** | a new line |
| **Freeze, deeper** | Freeze that re-aims at full power rather than at the speed the ball had. A rank-3 version of something that already works. | boon | **Proposed** | free |

**The shipped boon pool is from the game this one replaced.** Twelve cards — Ignition,
Recoil Nova, Break Pulse, Blade Rift, Aegis, Phase Drift, Chain Arc, Shatter Crit,
Concussive, Trickshot, Ricochet Fuse, Kinetic Bank — all written when the cue ball
carried a damage number and hitting a ball could destroy it. Under the current rule, *a
ball is never destroyed by being hit*, so most of them modify a quantity that no longer
decides anything. The phase engine is sound; the cards on top of it need rewriting to
the four things a player actually wants now: another stroke, another freeze, another
bank on the ladder, or a rule bent.

---

## 5. The reveal map

Act I is the ladder already designed: twelve rooms, gates on the odd ones, nothing in it
that is not already in the game. Act II is where everything marked **Proposed** goes,
and it holds the stroke budget flat at −2 on purpose — a room that tightens the budget
*and* introduces a noun is a room where a failure teaches nothing, because the player
cannot tell which of the two beat them.

> **Act II spends its difficulty on nouns, not on strokes.**

### Act I · rooms 1–12 — built from what ships today

| Room | Gate | Window floor |
| --- | --- | --- |
| 1 | The mission, and the order that pays | 5.0° |
| 3 | The Double | 3.0° |
| 5 | The Mine | 3.5° |
| 7 | Freeze | 3.0° |
| 9 | The 8 goes last | ≥3 clearing orders |
| 11 | The Kicker | 2.0° |
| 2 · 4 · 6 · 8 · 10 · 12 | Procedural — only cleared nouns, every seed checked | per the gate before it |

### Act II · rooms 13–24 — everything proposed here

| Room | Gate | Why here |
| --- | --- | --- |
| 13 | **The teleporter** | One pocket with no route, one pair of rings, exactly one heading that uses them. The exit must be on screen with the entrance. |
| 15 | **The black hole** (swallower) | A hazard *and* a way to lose a target you need. Ships first because it is a pocket with a different verdict. |
| 17 | **Phantom cue balls** | Three lines from one stroke. Introduced as a felt cell the room can take back, before it is ever a boon you keep. |
| 19 · 21 · 23 | Combinations — no new nouns | Strict order on a table with a teleporter is a different puzzle from either alone. |
| — | **Strict order** | Not a room. It is a mode the player unlocks by sweeping a room in order, and from then on it is their choice, on any run. |
| 14 · 16 · 18 · 20 · 22 · 24 | Procedural | `maxPerRoom: 3` matters far more with ten kinds of object than with six. |

**The room banners in the code still name the old order.** `TUTORIAL.lessons` keys its
one-line banners to rooms 1–9 with the Double at 2, Mines at 3, Freeze at 4. The
sequence is right and the room numbers are not, once gates sit on the odd rooms.
Re-keying that table is part of building the ladder, not a separate job.

---

## 6. Before any of it is built

- **Strict order, and the preview** — both built. A refusal costs what an early 8 costs:
  the ball comes back and the shot pays nothing. And the warning arrives *before* the
  stroke — the ball the mission would turn away travels in red, its ghost sits red in the
  pocket it would drop into, and the mission block reads `THE 1 FIRST` (or `8 GOES LAST`).
  The preview asks the mission the same question the pot will ask, over the table each
  earlier pot leaves behind, so a line that sinks the 1 and then the 2 is two legal pots
  rather than one refusal. `npm run foul` sweeps every heading and holds the drawn line to
  the mission's verdict in words and in colour.
- **The teleporter** — preserve heading, or mirror it? Preserving makes the pair a
  wormhole and is readable; mirroring is not. Preserve. And does it move object balls,
  or only the cue ball? Every felt object today triggers on the cue ball alone, and
  breaking that rule here means a rack that can vanish while you watch.
- **The black hole** — swallower or gravity. Two mechanics wearing one name, and only
  one is cheap. Ship the swallower, play it for a week, and only then decide whether
  curved paths are worth making the predictor integrate — which means every board in the
  game re-measured, because a projection that steps physics is a different projection.
- **Phantom cue balls** — what is the spread, and is it fixed? A fixed ±4° is a tool; a
  spread that widens with rank is a build. Either way they cannot scratch, or the upgrade
  is a liability the player cannot see coming. And does each phantom's rail count on the
  ladder, or only the real ball's? Counting all three makes it the strongest thing in
  the game by a distance.
- **The boon pool** — twelve cards to rewrite. The engine keeps its four phases; the
  cards stop being about damage. A design job with no code in it, and it blocks nothing
  else here.

---

*Shipped rows were read out of the code, not the design doc: `RULES` and `TABLE` in
`src/config.js`, the effect switch in `src/main.js`, `BoonSystem`'s card list, and the
reveal rooms in `TUTORIAL.lessons`. Room numbers for proposed nouns are proposals; every
window figure is a target to be measured in the editor, not a measurement.*
