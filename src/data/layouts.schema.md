# `layouts.json` — table geometry

One file, two readers: `RoomManager` builds rooms from it at run time, and the
table editor at `/tool` edits it. Nothing else defines a table, so the editor and
the game cannot drift apart.

The editor cannot write to the repository (it is a static page), so its
**Download layouts.json** button produces a replacement for this file. Drop it in
over the top and rebuild.

```jsonc
{
  "layouts": [
    {
      "id": "open-arena",              // stable key, unique
      "name": "Open Arena",            // shown in the HUD and the editor
      "tags": ["dense", "carom"],      // bias what the director rolls here
      "obstacles": [ /* see below */ ],
      "anchors":  [ { "x": 0, "z": -8 } ],
      "spawn":    { "x": 0, "z": 11 },
      "waves":    [ /* optional — see below */ ]
    }
  ]
}
```

## Coordinates

World units, matching `ARENA` in `src/config.js`:

| axis | range      | direction                  |
| ---- | ---------- | -------------------------- |
| `x`  | −9 … 9     | −9 is screen-left          |
| `z`  | −16 … 16   | **−16 is the top** of the screen |

The table is 18 × 32 units — the same 9:16 as the portrait viewport. One unit is
roughly the radius of a small enemy.

## `obstacles`

Collision geometry, drawn as neon-rimmed blocks and pillars. Two shapes:

```jsonc
{ "type": "box",    "x": 0, "z": 0, "hw": 2.0, "hh": 0.6 }   // half-extents
{ "type": "circle", "x": 0, "z": 0, "radius": 1.0 }
{ "type": "circle", "x": 0, "z": 0, "radius": 1.0, "kind": "bumper" }
```

`kind: "bumper"` gives the obstacle a restitution of 1.0 and the kinetic-bumper
behaviour (amplifies the ball, refunds a bounce). Anything else is a plain wall.

## `anchors`

Candidate spawn points. The director shuffles them per room with the room's
seeded RNG and jitters each pick slightly, so the same anchor never produces the
same arrangement twice.

Anchors within `ROOM.safeSpawnRadius` (6.5 units) of `spawn` are discarded — the
editor draws that ring and marks dead anchors red.

## `spawn`

Where the room places the cue ball's column. Note that the **height** comes from
`PLAYER.spawnFromBottom`, not from `spawn.z`: the game reads `spawn.x` and puts
the ball 30% of the table up from the bottom rail. `spawn.z` is what the
safe-spawn ring is measured from.

## `waves` (optional)

When present, the layout is **authored**: the game spawns exactly these, in this
order, and ignores the threat budget, the unlock gates and the anchors entirely.

```jsonc
"waves": [
  [ { "type": "solid",  "x": -3, "z": -6 },
    { "type": "solid",  "x":  3, "z": -6 } ],   // wave 1, cleared before wave 2
  [ { "type": "heavy",  "x":  0, "z": -9 } ]    // wave 2
]
```

`type` is one of `solid`, `stripe`, `heavy` (see `ENEMY` in `src/config.js` for
radius, cost and unlock room).

Omit `waves` and the room is procedural: the director spends
`baseBudget + budgetPerLevel × (level − 1)` on archetypes weighted by the
layout's tags and the room number, then binds each pick to an anchor. Both paths
live in `src/systems/ThreatDirector.js`, which the editor imports directly so its
**Roll** button shows the real thing rather than an approximation of it.
