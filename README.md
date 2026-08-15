# Billiard Roguelike

**Real-time kinetic billiards meets a boon-stacking action roguelike.**
A portrait (9:16) mobile web prototype built with Vite + Three.js.

> You are the cue ball. Hold to drop the world into 20% speed, drag back to load the
> slingshot, release to break the rack. Every enemy you hit becomes a lethal object
> ball; every rail is a damage multiplier; every room ends with a shot into one of
> two doors that decides your build.

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
| **Hold** | Bullet-time (0.20x) + trajectory prediction |
| **Drag** | Pull the slingshot — length is power, direction is inverted |
| **Release** | Launch with invulnerability frames for the flight |
| **Quick flick** (<150 ms) | Emergency dash, no slow-mo, no Focus cost |

Clear the room, then **slingshot into a door** to take its reward.

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
│   ├── PhysicsSystem.js sweeps, rebounds, caroms, trajectory prediction
│   ├── BoonSystem.js    4-phase hook registry + card offers
│   └── RoomManager.js   layout pool + threat director + injectors + doors
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

See [`docs/ARCHITECTURE.md#7-git-versioning--rollback-workflow`](docs/ARCHITECTURE.md#7-git-versioning--rollback-workflow)
for the rollback recipes.

## Tuning

Everything that affects feel lives in [`src/config.js`](src/config.js) — time
dilation, focus economy, chain multipliers, hit-stop, shake, enemy stat blocks,
threat budgets and the palette. A balance pass should be a one-file diff.
