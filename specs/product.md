# Lightline: Billiard Roguelike — product spec

The source of truth for what the game is supposed to do. Kept current as scope changes. The longer design history lives in `docs/`; where the two disagree, this file wins.

Companion pages (private links, owner only):
- Proposal one-pager: https://claude.ai/artifact/B3LMk8apuXkprXR3sCCSzR
- Lightline design system: https://claude.ai/artifact/DrQbXnz43EMvveKWKGsVWq
- Design bible (in the repo): `docs/DESIGN_BIBLE.md`

## The game

A classic billiards game that feels good in the ways classic billiards does: aiming, picturing the route, planning shots that sink the most balls for the most points, and watching the physics play out into the pockets. On top of that: quick rounds with few balls, tough spatial puzzles, and Balatro-style point-earning animations for every trick (banking off a wall, hitting several balls, passing through multiplier zones).

Name: **Lightline: Billiard Roguelike**. Look: Tron, held to the Lightline design system.

## The bar for everything

**Every moment should feel exciting and satisfying.** Anything the player does or earns gets a reaction you can see, hear and (where the phone allows) feel. That includes pulling to full power, a wall, a contact, a pot, a lock-in and a slam. Each reaction comes from its cause, lands one at a time, and never covers the aim preview. New features are not done until their moment has been given this treatment.

## Must keep

- **The aiming system, unchanged.** Touch anywhere and drag to aim. The preview shows where the cue ball goes, where it collides, where it travels after the collision, where the struck ball goes and where it lands, with colour warnings for scratches and fouls. The drawn line is the shot the table plays.
- **How the first leg is drawn is a setting** (Settings → Aim line), because the original glowing beam was overwhelming. Picked in review: **Cue** is the default.
  - **Cue** (default): a thin line. Power is a full-length cue stick that runs back off the table past the rail like 8 Ball Pool: tapered, with lit edges and a shadow cast on the felt and rail. It slides back one-for-one with the thumb, and a ring around the ball fills as you pull.
  - **The strike:** on release the table holds for a few frames while the stick snaps into the ball with a light smear. The ball leaves when it is hit, then the stick follows through and fades.
  - **Full power is a moment:** the ring flashes and swells, then breathes while held; the stick's tip lights; a ring of light bursts from the ball; a **MAX POWER** badge pops out of the ring and flies away from the aim line; a bright two-note riser plays; phones that allow it give a short buzz. All of it triggers at one threshold (`TRAJECTORY.fullDraw`).
  - **Slim:** a thin line; power is the ring alone.
  - **Pulse:** a thin line with a spark running it, faster the harder you pull, flaring the contact ring.
  - **Beam:** the original swelling ribbon.
  - Cue, Slim and Pulse fire a short beam down the line on release, so the intensity lands on taking the shot.
  - Only the drawing changes. What the preview shows, and that it matches the shot, is the same in all three.

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

## Moments between shots

The full spec is in `docs/DESIGN_BIBLE.md` §8 (`src/ui/Moments.js`, `MOMENTS` in `src/config.js`).

- **Table clear / out of shots** (two on trial, Settings → Table clear): every shot's pay counts in, bonuses land, the table total slams and flies into RUN, then the next-table choices arrive. *Ledger* (a receipt panel) or *Tally* (plates on the felt flying into one huge number).
- **Scratch** (picked: Glitch): red alert, the screen tears, SCRATCH jitters in; a beam drops onto the spot, the ball rezzes in, and the cue takes form under it, pointing straight up.
- **Freeze frame** (picked; the mechanic's name everywhere): mid-roll, time stops so the cue ball can be re-aimed; costs a charge, not a shot. A white flash, an ice wave, frost rings with direction arrows, and a shatter on release.
- **Next table** (picked: Boot): strips close; the room number rolls over and holds, with the exit's reward under it; the rails trace in; the strips open.
- **Cue options** (on trial, Settings → Stick, Full power, Strike): stick *rod / classic / hardlight*; full power *flash / ignite / lock*; strike *snap / impact / pierce*.

**Freeze frame charges** (proposed, not built): halves, up to 3, earned only on shots that pay. You get +½ for a combination, +½ for each extra ball in one shot, and +½ for ×5 mult or more. Charges can also be bought in the shop with credits that banked points earn, so the score itself is never spent.

## Puzzle ramp (strategy agreed for review, not built)

`docs/PUZZLE_RAMP.md`. Fewer balls and harder questions instead of more balls; acts of three (open, target, house table that bends one rule); every authored table states its catch; the solver measures window, greed gap, decoys and solution families; one dial at a time, in a sawtooth; surprise from facts lists, moving value, solution signatures and remixes; nothing that makes the preview lie.

## Later (agreed direction, not started)

- Short tables: 2–4 balls, 2–3 shots, a score to beat; three tables a round, the third hand-built.
- Unused shots become money; a shop between tables (upgrades like "walls are worth double").
- The full Tron visual pass from Lightline (void floor, reactive grid, pockets dimmer than the cue ball).
