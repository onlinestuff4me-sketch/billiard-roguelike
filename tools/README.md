# tools — measuring the boards instead of guessing at them

Every board in this game is a claim: *there is a shot here, a beginner can find
it, and it teaches the thing the card says.* Three times that claim shipped
false:

- **the bank board** asked for a shot that a sweep of every heading at every
  power could make **once in 2160 attempts**;
- **the walls board** lost its scoring rule in a rewrite and could never
  complete at all;
- **the budget board** demanded two balls in one stroke — **seven solutions in
  the same 2160** — and said nothing at all when you pocketed one.

None of those were visible from playing the board a few times. All three were
obvious within seconds of measuring it. So the boards are measured.

## `npm run verify`

```
npm run verify                     # every board
npm run verify -- --board bank     # one board
npm run verify -- --fine           # 0.25° sampling instead of 0.5°
npm run verify -- --json           # machine-readable
```

It boots the built game in a headless browser, drives its **actual**
`PhysicsSystem` — the same code a player's shots go through, not a
re-implementation that could drift — and for each board reports the contiguous
ranges of aim heading that satisfy that board's own pass rule.

A **range** is the unit that matters. A shot that works at exactly one sampled
heading is not a shot a human can play, and reporting it as a solution is how a
one-degree shot ends up in a tutorial.

Two thresholds, both drawn from what went wrong before:

| check | meaning | fails when |
|---|---|---|
| **WIDEST** | the widest working range | `< 2°` — real, but unteachable |
| **REACH** | how far the board's resting aim sits from a working range | `> 12°` — the board is unsigned, not hard |

Boards with a shot budget get a third check: a beam search over consecutive
strokes that confirms the rack can actually be **cleared inside the budget the
card promises**. Each stroke leaves the cue ball somewhere new, so stroke two is
played from a table stroke one chose — exactly the thing a player has to plan,
and exactly the thing a single-stroke sweep cannot see. It prints the route it
found.

Exit code is non-zero if any board fails, so this belongs in CI.

## `npm run coach`

`verify` proves a board **can be solved**. This proves the other half: what the
tutorial *does* when a stroke goes wrong, and whether the sentence the player
then reads describes the table in front of them.

```
npm run coach
```

It plays real strokes through the boards' own rules and reads the table and the
band afterwards. Both halves were wrong and neither was visible from a sweep:

- **the stroke was charged twice.** A scratch on the four-in-three board ran the
  ordinary miss path — cue home, *whole rack rebuilt* — so every ball already
  cleared stood back up while the shots spent clearing them stayed spent. The
  attempt was neither restarted nor continued; it was left in a position the
  board could not be won from.
- **the band said "Down"**, then said it again over the top of the scratch
  correction, because the progress line was written before the verdict was.

It also holds the boards to one vocabulary. A ball that goes in a pocket is
**pocketed** — not "down", not "potted" — and a band that reaches for a second
name for the same event fails the run, because a lesson that calls one thing
two things has taught the player a synonym instead of a game.

The scratch and the pot it needs are **found, not hard-coded** — the boards'
geometry is free to move, and a fixed heading quietly stops testing the thing it
was written for the first time it does.

It also holds the boards to their promises:

- **A lit pocket means "put a ball in here".** A board that lights one and
  passes the player for something else is lying. Two were: the angled
  combination and the bank, both judged on reaching a ball while their felt
  named a corner. The check found the second one the day it was written for the
  first.
- **A stored solution has to solve the board.** Every board carries `solve`, a
  heading, and the game teaches it twice — the cue swings onto it after a miss,
  and the coach route is drawn from it. Two boards had drifted off theirs: the
  bank's scratched at every power, and the four-in-three board's pocketed
  nothing at all.
- **Every board draws its route** before anything is asked of the player.

## `npm run layout`

Four viewports, from a 360px phone up. Nothing may cross the edge of the
screen, a row that is meant to be centred has to be, buttons sharing a row have
to be one width, and in a lesson the table must start below the coaching band.

The menu's three secondary buttons were a flex row of items each carrying
`width: 100%`. A flex item will not shrink below its min-content width, so
three buttons each asking for the whole row — one holding the unbreakable word
SETTINGS — could not fit and ran past the row's own right edge. On a 360px
phone that put SOUND ON off the side of the screen. Obvious in a screenshot,
invisible in a diff.

## `npm run palette`

Boots the game, renders a board, reads pixels. It measures three different
questions, and the first version of it measured none of them:

| | what | floor |
|---|---|---|
| **apart** | every pair of balls that can share a table, in normal vision and simulated protanopia, deuteranopia and tritanopia | CIE76 dE |
| **visible** | each ball against the felt and against the obsidian | WCAG 1.4.11, 3:1 |
| **readable** | each numeral against the ground it is printed on | WCAG 1.4.3, 4.5:1 |

The second and third are why a player could report a ball as unreadable while a
palette check passed: it was measuring only whether the balls differed from
*each other*. Sampling runs at a phone's pixel ratio, because a numeral four
device-pixels tall has no pure-ink pixel in it and a contrast measured there
reports the limits of the sampling rather than the design.

`npm run palette -- --pick` searches the **rendered** gamut: 432 candidates put
through the real renderer and sampled back, filtered by the floors above and by
the hue families the game has already spent (red means it hurts, green means a
pick-up, cyan is your ball), then the four with the widest worst-case
separation. Choosing hexes by eye, or by distance between source values, is how
this palette went wrong twice.

## `npm run scoring`

The only check here that needs no browser: `Rules.js` is plain arithmetic. It
exists because of a report that banks after a ball went down were counting as
extra multipliers.

They were not being *paid* — points are paid at the instant a ball drops, at
the multiplier standing then. But the stroke's ledger line reported the
multiplier the ladder had **reached**, and the run's best-multiplier stat
recorded it too. The number the player was shown was the number they were told
they had been paid at, and it was wrong — which is the same as being paid
wrongly, from where they sit.

## `npm run find-board -- <board>`

`verify` answers *is this board solvable as authored*. This answers the
question before it: **where should the balls go** so that the shot the card
describes is a shot a beginner can find. It sweeps candidate placements, and
for each one sweeps every heading at two powers through the real physics,
reporting the widest **contiguous window** of heading that satisfies the goal.

It exists because a board was caught claiming something it did not check, and
the honest fix — require the pot the card names — was rejected on a search of
*twenty* layouts that found nothing wider than 2°. Twenty layouts is not a
search. Run properly it produced two results worth having:

- **the plant board.** 320 placements over the middle of the table confirmed
  the verdict for combinations played the long way — a pot's tolerance falls
  off as one over the distance the object ball travels — and then found **6°**,
  three times the playable floor, the moment the second ball was parked a
  ball's width off a pocket mouth. The board requires the pot now.
- **the budget board.** Three families, about 550 placements, looking for two
  balls in one stroke: two in a line at a pocket, two in a line at the cue, two
  hanging on the mouth together. The widest window anywhere was **2°**. A
  knocked ball carries its own drag, so once the first ball has taken the
  impulse there is nothing left in the second. A board cannot ask for a shot
  the physics does not hand out, so that board's budget was changed to stop
  needing one.

## How it decides whether a stroke passed

Wherever the game already decides something, the harness **asks the game**. A
board's pass condition is evaluated by calling the board's own `pot` predicate
and reading its own flags (`handoff`, `bankThenHit`, `clearRack`) — not by
re-expressing what the board means. A verifier with its own opinion about the
rules will eventually be confidently wrong about a board that changed
underneath it.

## Files

- `sim.mjs` — boots the game, manages the preview server, exposes the driver.
- `harness.js` — injected into the page; snapshot/restore, one fully-resolved
  stroke, the sweep, and the multi-stroke beam search.
- `verify-boards.mjs` — the CLI and the thresholds.
- `check-coach.mjs` — what the boards say and do, and whether they mean it.
- `check-palette.mjs` — the ball colours and contrasts, out of the framebuffer.
- `check-layout.mjs` — nothing off the edge, at six viewports.
- `find-board.mjs` — where should the balls go, searched rather than guessed.
- `check-scoring.mjs` — the ladder pays for what happened (no browser needed).

## Beyond the tutorial

Nothing here is tutorial-specific except where it finds the board. `__simSweep`
and `__simPlan` take any table the game can be put into, so the same machinery
answers "is this generated room solvable in its stroke budget?" — which is the
question every procedurally generated room in the run silently assumes a
"yes" to.
