# tools — measuring the boards instead of guessing at them

Every board in this game is a claim: *there is a shot here, a beginner can find
it, and it teaches the thing the card says.* Three times that claim shipped
false:

- **the bank board** asked for a shot that a sweep of every heading at every
  power could make **once in 2160 attempts**;
- **the walls board** lost its scoring rule in a rewrite and could never
  complete at all;
- **the budget board** demanded two balls in one stroke — **seven solutions in
  the same 2160** — and said nothing at all when you potted one.

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

## Beyond the tutorial

Nothing here is tutorial-specific except where it finds the board. `__simSweep`
and `__simPlan` take any table the game can be put into, so the same machinery
answers "is this generated room solvable in its stroke budget?" — which is the
question every procedurally generated room in the run silently assumes a
"yes" to.
