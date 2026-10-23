# Puzzle Ramp — hard, fair, and never the same twice

**Version:** 0.1 (strategy, not built)
**Builds on:** [PROGRESSION.md](PROGRESSION.md) (the Gate Ladder) and
[MECHANICS.md](MECHANICS.md) (every noun and what it costs the preview)
**Research:** puzzle-design sources summarized in §10

The Gate Ladder already answers *where* a mechanic is introduced: an authored gate
for each new noun, procedural tables everywhere else. This document answers the
three questions it leaves open:

1. **How does difficulty climb** without the run turning into "more balls, fewer
   shots"?
2. **What keeps a table a puzzle** once the preview shows you every outcome?
3. **What keeps table 30 surprising** after you have seen every noun?

---

## 1. Fewer balls, harder questions

The ramp today raises difficulty by adding balls and taking shots (`RULES.ramp`:
rack 4 → 7, strokes 7 → 5). That makes rounds longer and the challenge mostly
endurance, the opposite of the brief (quicker rounds, fewer balls, tough spatial
puzzles).

**Flip the axis.** A table holds **2 to 4 balls and 1 to 3 shots**, and stays
there all run. Difficulty comes from what the table asks, not how much of it
there is. A three-ball table that needs a bank, a plant and the right order is
harder than a seven-ball rack, and it is over in under a minute.

---

## 2. The shape of a run: acts of three

Borrowed from Balatro's ante (small blind, big blind, boss) and from Hayashida's
four-beat stages (introduce, develop, twist, resolve).

| Beat | Table | Job |
| --- | --- | --- |
| 1 | **Open table** | Uses what you know, on a wide window. Short: often one shot. |
| 2 | **Target table** | A score target just above what the obvious shot earns (§4, greed gap). |
| 3 | **House table** | Bends exactly one rule (§6). Its rule is shown **two tables ahead**, so you can plan or buy for it. |
| — | **Victory lap** | After a house table, the next open table is deliberately easy. Rest beats stop hard tables stacking into fatigue. |

A new noun's authored gate (PROGRESSION.md) takes the place of beat 1 in the act
where it arrives. Its first procedural appearance is beat 2. It becomes ordinary
furniture from the next act on.

---

## 3. Every authored table states its catch first

Before a table is built, write its **catch**: one sentence naming the
contradiction the player has to see through.

> "The ball you must pot is shielded by the mine you must not touch, so go
> through the portal behind you."

If the sentence cannot be written, the table is a skill check, not a puzzle.
The catch goes into the board file next to its measured window, and the editor
shows it.

---

## 4. Four numbers that make a table a puzzle

The full preview means a player can sweep the aim until something drops. So the
solving window (how many degrees of heading clear the table) measures
*execution*. Three more numbers measure *insight*. All four are computed by the
solver and stored with each board, the same way `tools/verify-boards.mjs`
already stores windows.

| Measure | What it is | Puzzle wants |
| --- | --- | --- |
| **Window** | Degrees of heading that clear the table | ≥ 2.5° always (touch-aim floor). Never make a table harder by narrowing this alone. |
| **Greed gap** | Target score minus the best single-contact pot | > 0. The obvious straight pot drops, the preview shows it dropping, and it is not enough. |
| **Decoy ratio** | Share of headings that pot something but miss the target | High, 60–90%. Most shots look like progress. |
| **Families** | Distinct solution routes (by contact sequence) | 2–3. One is a lock; ten is open felt. |

Two more are stored for shot-to-shot tables:

- **Shot dependency:** whether shot 2 is only solvable after some shot-1
  outcomes. This is where three-shot tables get their depth.
- **Signature:** the contact sequence of the main solution, e.g.
  `wall · portal · ball · pocket`. Used for variety (§7).

---

## 5. One axis at a time, in a sawtooth

The axes a table can turn up:

1. score target / greed gap
2. shot count (fewer)
3. obstacle density (mines, barriers)
4. moving parts (portals, kickers)
5. contact count of the solution (cut → plant → bank → two in one)
6. shot dependency
7. preview length (see §6: Short preview)

**Rules:**

- Each table raises **one** axis over the last table of its kind.
- **A new noun loosens one other axis by one step.** Never a new noun and a
  tighter budget on the same table (players flagged exactly this in Snakebird
  level 7 and Stephen's Sausage Roll's Great Tower).
- After each house table, drop back down before climbing again.

Plotted over a run, difficulty is a sawtooth that trends up, not a ramp.

---

## 6. House rules: one bent rule per house table

Cheap to build (most are scoring or rule changes) and they change *which* shot is
right, not how precise it must be. Each one needs counterplay that some builds
have and others lack. A rule that simply cancels a build is not allowed (Balatro
learned this with its "anti-fun" boss blinds).

| Rule | What changes | Cost |
| --- | --- | --- |
| **Bank only** | Direct pots score 0; only bank pots count | rules |
| **Called pocket** | One pocket is live; the others act as cushions | rules |
| **Anchor** | One marked ball must stay up; potting it voids the shot | rules |
| **Ordered drops** | Out-of-order pots score 0 | exists (strict order) |
| **Wall tax** | Each cushion costs points instead of paying mult | rules |
| **Cold mult** | Every mult source halved, so it takes two zones or a two-in-one | rules |
| **One shot** | One shot, a lower target, a multi-ball solution | rules |
| **Exact** | Finish inside a score band; overshooting fails | rules |
| **Shifting pockets** | Each pot shifts pocket values one step (Pocket-Run Pool style), with the next state drawn | rules + HUD |
| **Spent rings** | + rings vanish after one touch, so shot 1's route competes with shot 2's | rules |
| **Arming mine** | A mine is harmless until the first contact, with a visible countdown | rules + HUD |
| **Swapping portals** | Portal pairs swap after each shot, with the next state drawn | rules |
| **Freeze or bust** | No direct window exists; the only route spends a freeze mid-roll | authored |
| **Short preview** | The preview draws only the first N contacts | preview (honest, partial) |

**Banned:** anything that makes the preview *wrong* (a random kicker direction, a
hidden ball that appears with no warning). If a loss could not be seen
beforehand, it reads as the game's fault, not the player's. Into the Breach
built its whole design on this.

---

## 7. Surprise without randomness

Five sources, in the order they should be built.

1. **Facts lists.** For every noun, list the distinct facts it implies, and give
   each fact its own table. Braid's puzzles each illustrate one consequence of
   a rule. Portal examples:
   - exit heading is preserved;
   - a ball can pass through twice;
   - a portal can feed a kicker;
   - a direct pot through a portal is a bank pot for scoring.
2. **Value that moves.** Zones, rings and pocket values shift between shots, in
   ways drawn on the table in advance. Shot 2's best plan then depends on where
   shot 1 left things.
3. **Signatures.** Reject a procedural table whose solution signature matches
   any of the last four. Variety becomes a checked property, not a hope (Desert
   Golfing's maker said he would have varied his later holes had he known how
   far players would go).
4. **Mutation remixes.** Take an authored table, nudge balls and obstacles, and
   re-measure. Small edits can change the solution completely (Sturtevant's
   Snakebird study). This gives cheap late-run variants of tables players
   already liked.
5. **Spice.** A procedural table sometimes draws a house rule from §6 at low
   odds. Never on a table that also introduces a noun.

**Curated seeds.** Run the generator offline, star the best boards by hand, and
mix the starred pool with live generation. It is also the obvious source for a
shared daily table.

---

## 8. Depth for experts without locking out everyone else

- **Stars, not narrower windows.** Each table has an optional objective:
  exact score, clear in one shot fewer (par), no cushions, or sweep in order.
  Stars pay currency. The required solve stays at a fair window; mastery
  lives on top.
- **Risky routes pay more.** Every shortcut that risks a scratch must out-earn
  the safe line, or nobody takes it twice.
- **Freeze as a refund.** A freeze pickup on the felt that you route through to
  earn a re-aim (Cursed to Golf's shot idols).

---

## 9. What to build, in order

1. **Short tables.** Replace `RULES.ramp` with 2–4 balls and 1–3 shots, and a
   score target per table (the greed-gap rule).
2. **Measures in the solver.** Window (exists), greed gap, decoy ratio,
   families and signature, stored per board, with `verify-boards` failing a
   board outside its slot's band.
3. **Acts of three.** Open, target, house; the house rule shown two tables
   ahead.
4. **Three house rules:** Bank only, Called pocket, Anchor. They are cheap and
   cover routing, geometry and restraint.
5. **Signature log** and the four-table no-repeat rule.
6. **Stars.**
7. Then the rest of §6, then mutation remixes.

---

## 10. Sources

- Mark Brown (GMTK), "What Makes a Good Puzzle?": mechanics, catch,
  assumptions, presentation, curve, revelation.
- Arvi Teikari (Baba Is You): each level's trick should be satisfying or
  devious, not generally difficult; levels tweaked to remove uninteresting
  alternate solutions.
- Koichi Hayashida (Super Mario 3D World): introduce, develop, twist,
  conclude; early beats make failure cheap.
- Jonathan Blow (Braid): explore every consequence of a rule; each puzzle
  illustrates one; misdirection toward the obvious move.
- Valve (Portal developer commentary): checklisting mechanics; closing
  trivial bypasses; rest beats between hard puzzles.
- Snakebird and Stephen's Sausage Roll player reports: new mechanics without
  lead-in, or several at once, read as unfair spikes.
- Sturtevant et al., AIIDE 2020: small layout edits can sharply change
  Snakebird solution length, and players rated the mutated levels
  interesting.
- Subset Games (Into the Breach): telegraph everything; every loss should
  feel like the player's own.
- LocalThunk (Balatro): the boss blind as a rule bend; reducing anti-fun
  gimmicks.
- Pocket-Run Pool: rotating pocket values that "never let you settle".
- Golf Peaks and Cursed to Golf: the shot budget as the puzzle, refunded
  inside the level.
- Desert Golfing: constrained procedural generation, an impossible hole
  from missing validation, and the maker's regret over late-game sameness.

These came from search summaries, not full pages. Treat specific numbers in
them as indicative.
