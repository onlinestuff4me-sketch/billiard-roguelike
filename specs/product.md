# Lightline: Billiard Roguelike — product spec

The source of truth for what the game is supposed to do. Kept current as scope changes. The longer design history lives in `docs/`; where the two disagree, this file wins.

Companion pages (private links, owner only):
- Proposal one-pager: https://claude.ai/artifact/B3LMk8apuXkprXR3sCCSzR
- Lightline design system: https://claude.ai/artifact/DrQbXnz43EMvveKWKGsVWq

## The game

A classic billiards game that feels good in the ways classic billiards does: aiming, picturing the route, planning shots that sink the most balls for the most points, and watching the physics play out into the pockets. On top of that: quick rounds with few balls, tough spatial puzzles, and Balatro-style point-earning animations for every trick (banking off a wall, hitting several balls, passing through multiplier zones).

Name: **Lightline: Billiard Roguelike**. Look: Tron, held to the Lightline design system.

## Must keep

- **The aiming system, unchanged.** Touch anywhere and drag to aim. The preview shows where the cue ball goes, where it collides, where it travels after the collision, where the struck ball goes and where it lands, with colour warnings for scratches and fouls. The drawn line is the shot the table plays.

## Scoring (building now)

- Every shot builds two numbers, **Points** and **Mult**, multiplied together at the end.
  - Points: hit a ball +5; sink a ball +10 × its number.
  - Mult: cue off a wall +1; ball drives ball +1; bank pot +2; each extra pot in one shot +2; bonus zone ×2.
- **Nothing counts until a ball drops.** Events are pending until a ball sinks, which locks in everything up to then. Anything after the last pot is taken back. A shot that sinks nothing scores 0. A scratch or foul voids the shot.
- **Build live.** Points appear as each thing happens, one at a time:
  - the table freezes briefly, then runs in slow motion while the number presents;
  - the cause (wall, zone, ball, pocket) lights up and wiggles;
  - a big labelled plate pops beside the cause and holds (0.8s, a bit quicker each time, never under 0.4s);
  - the plate flies into its box and the box jumps;
  - the boxes stay faded until a ball drops, then go solid ("Locked in"). On a miss, plates fly back to their causes and shatter.
  - Tap during a shot to speed the presentation up.

## Later (agreed direction, not started)

- Short tables: 2–4 balls, 2–3 shots, a score to beat; three tables a round, the third hand-built.
- Unused shots become money; a shop between tables (upgrades like "walls are worth double").
- The full Tron visual pass from Lightline (void floor, reactive grid, pockets dimmer than the cue ball).
