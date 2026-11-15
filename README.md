# Lightline: Billiard Roguelike

**Trick-shot billiards on a grid of light, with Points × Mult scoring and a roguelike run on top.**
Portrait (9:16) mobile web, built with Vite and Three.js. Live at
**https://billiard-roguelike.vercel.app**.

What the game is meant to do lives in [`specs/product.md`](specs/product.md); the
look, the rules and every decision made in review are in
[`docs/DESIGN_BIBLE.md`](docs/DESIGN_BIBLE.md).

---

## The game

You are the cue ball. Every table is a static rack: nothing moves until you
shoot, so take as long as you like to aim, then spend one of the few shots you
have.

- **A run** starts with two short lessons, then **13 authored tables**
  (`src/data/tables.json`), each opening on a card with its rule in one line and a
  picture of anything new on it. Clearing Table 13 completes the run.
- **Scoring:** every shot builds **Points** and **Mult**, multiplied at the end.
  Nothing counts until a ball drops; a scratch or foul voids the shot. Each number
  lands beside its cause, one at a time.
- **Between tables:** a result screen, then a **shop** (buy, hold or reroll
  cards; cash carries over). Upgrades change scoring and what a table gives, never
  physics or the aim preview.
- **Hearts:** you have three. Running out of shots with balls still on the table
  costs one and the table is played again; out of hearts, the run is over.
- **New things on the table, one per table:** ×2 ring, mines, ice (Freeze
  charges), portals, bumpers, the 1+ free-shot ring, and "the 8 goes last".

## Controls (one thumb)

| Input | Action |
| --- | --- |
| **Touch and drag** | Aim and set power. The line drawn is exactly the shot the table will play |
| **Release** | Shoot |
| **FREEZE** (bottom right, while balls roll) | Spend a charge: the table stops for up to 6 s so you can aim a second shot; it resumes on its own |
| **Shot tray** (once bought in the shop) | Spin, Curve (hold the shot, then bend it) and Bomb |
| **Tap during a shot** | Speed up the score presentation |

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173 (also served on your LAN for phone testing)
npm run build    # production bundle in dist/
npm run preview  # serve the built bundle
npm test         # build, then the fast checks (see CLAUDE.md for the full list)
```

Requires Node 20.19+ (or 22.12+). There are no assets to download: geometry is
procedural and every sound is synthesised at runtime with Web Audio.

## Project layout

```
src/
├── main.js                bootstrap, the frame loop, and the wiring between systems
├── config.js              every tuning number, the palette, feel curves
├── core/                  Engine (time dilation, hit-stop, shake), input, AudioManager
├── entities/              Player (cue ball, aim, cue stick), Enemy (the object balls)
├── systems/
│   ├── PhysicsSystem.js   fixed-step physics; the aim preview plays this same code
│   ├── Rules.js           missions, shots, Points × Mult, targets, hearts
│   ├── RoomManager.js     authored tables, rolled layouts, racking
│   ├── Table.js           pockets and the objects on the felt
│   ├── Upgrades.js        the shop's cards
│   ├── Tutorial.js        the two lessons
│   └── Achievements.js
├── ui/                    HUD, ScoreFeed, Moments (cards, results, shop), Juice, ShotTray
├── analytics/             gameplay events (no-op until storage is configured)
└── data/                  tables.json (the run), lessons.json, layouts.json + schemas
api/                       Vercel functions for analytics (events in, stats out)
public/                    fonts, mechanic pictures, the /classic snapshot, dashboard.html
tools/                     checks and table tools that drive the real game (see tools/README.md)
docs/                      design bible, aiming, analytics, mechanics, history
specs/                     product and tech-stack specs
```

## Documentation

| Doc | Contents |
| --- | --- |
| [`CLAUDE.md`](CLAUDE.md) | How to run and check the game, rules that must never regress, deploy and analytics |
| [`specs/product.md`](specs/product.md) | What the game is supposed to do (wins over everything below) |
| [`docs/DESIGN_BIBLE.md`](docs/DESIGN_BIBLE.md) | The look, every moment, and the decisions made in review |
| [`docs/AIMING.md`](docs/AIMING.md) | Why the drawn line is the shot played, and how that is measured |
| [`docs/ANALYTICS.md`](docs/ANALYTICS.md) | Analytics setup, the dashboard, and the monthly cost cap |
| [`tools/README.md`](tools/README.md) | Measuring tables instead of eyeballing them |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Module graph and the loop (parts describe the earlier prototype) |
| [`docs/GDD.md`](docs/GDD.md), [`docs/STYLE_GUIDE.md`](docs/STYLE_GUIDE.md) | History: the original real-time slingshot design |

## The classic version

`/classic` serves the earlier real-time design, frozen from its own commit. It is a
committed build snapshot in `public/classic/`; regenerate it only with
`node scripts/snapshot-classic.mjs [ref]`.
