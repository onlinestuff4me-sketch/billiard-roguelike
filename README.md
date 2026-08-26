# Billiard Roguelike

**Strategic billiards with a scorecard and a boon-stacking roguelike on top.**
A portrait (9:16) mobile web prototype built with Vite + Three.js.

> You are the cue ball. Every room is a static rack: nothing moves until you shoot,
> so read it for as long as you like — then spend one of the few strokes you have.
> A ball is never destroyed by being hit, only by being driven into a pocket. The
> contract says what has to go down; the strokes you *don't* spend are worth more
> than most of the ones you do.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173  (also served on your LAN for phone testing)
```

```bash
npm run build    # production bundle in dist/
npm run preview  # serve the built bundle
```

Requires Node 20.19+ (or 22.12+). No other setup, no assets to download — all
geometry is procedural and all audio is synthesised at runtime.

## Controls (one thumb)

| Input | Action |
| --- | --- |
| **Hold** | Aim. The table is already frozen — there is no clock on this |
| **Drag** | Pull the cue — distance from the ball is power, direction is `ball − thumb` |
| **Release** | Fire. One stroke |
| **Tap while the table is moving** | Spend a freeze charge: stop it, re-aim, resume. No stroke |

Fill the contract, then **slingshot into a door** to take its reward.

## Documentation

| Doc | Contents |
| --- | --- |
| [`docs/GDD.md`](docs/GDD.md) | Core loop, multiplier & momentum system, 4-phase boon engine, hybrid level generation |
| [`docs/STYLE_GUIDE.md`](docs/STYLE_GUIDE.md) | "Dark Velvet Cyber-Billiards" visual language, procedural audio palette, enemy silhouettes |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Module graph, loop/physics separation, git milestone & rollback workflow |

## Project layout

```
src/
├── main.js              bootstrap · loop · system wiring · FX
├── config.js            every balance constant, the palette, all feel curves
├── core/
│   ├── Engine.js        time dilation · hit-stop · camera shake
│   ├── InputManager.js  pointer state machine (aim / drag / flick)
│   └── AudioManager.js  procedural Web Audio synthesis
├── entities/
│   ├── Player.js        cue ball, focus gauge, ribbon trail
│   └── Enemy.js         Solids · Stripes · Heavy Eight-Balls
├── systems/
│   ├── PhysicsSystem.js sweeps, rebounds, caroms, pockets, trajectory prediction
│   ├── Rules.js         contracts, the stroke budget, the multiplier ladder, score
│   ├── Table.js         six typed pockets + the lit objects on the felt
│   ├── BoonSystem.js    4-phase hook registry + card offers
│   ├── Tutorial.js      the six teaching boards
│   └── RoomManager.js   layout pool + racking + doors
└── ui/
    ├── HUD.js           health · radial focus · room · combo · door labels
    └── BoonModal.js     3-card reward overlay
```

## Milestones

| Tag | Contents |
| --- | --- |
| `v0.1-docs-scaffold` | Design docs, project scaffold, table rendering |
| `v0.2-core-physics` | Input, slingshot, bullet-time, trajectory prediction |
| `v0.3-combat-carom` | Enemy archetypes, billiard collisions, caroms, audio |
| `v0.4-boons-progression` | 4-phase boon engine, hybrid rooms, HUD & boon modal |
| _(unreleased)_ `v0.5` | Static rack, contracts, stroke budget, pockets, scorecard, freeze |

See [`docs/ARCHITECTURE.md#7-git-versioning--rollback-workflow`](docs/ARCHITECTURE.md#7-git-versioning--rollback-workflow)
for the rollback recipes.

## Tuning

Everything that affects feel lives in [`src/config.js`](src/config.js) — time
dilation, focus economy, chain multipliers, hit-stop, shake, enemy stat blocks,
threat budgets and the palette. A balance pass should be a one-file diff.
