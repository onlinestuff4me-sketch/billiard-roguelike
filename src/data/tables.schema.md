# `tables.json` — the authored first tables of a run

Table N of a run is `tables[N - 1]` while one exists; after the last authored
table the run goes back to rolled tables (`RoomManager.generate`). Every field
is fixed: the same table, the same rack, the same shots and target, every run.
That is the point — a new player's first hour is designed and tuned, not
rolled.

```jsonc
{
  "tables": [
    {
      "id": "off-the-rail",                 // stable id, used by the tools
      "name": "Rails Add Mult",             // name AND rule: shown on the card and as the corner chip
      "intro": {                            // the banner the table opens with
        "title": "Table 3 · Rails Add Mult",
        "sub": "The 8 is behind the wall. Bounce off a rail: every rail adds Mult."
      },
      "spawn": { "x": 0, "z": 11 },         // only x is read; the cue ball sits at z 6.4
      "rack": [                             // the balls, by number, where they sit
        { "number": 1, "x": 5.6, "z": 1.2 },
        { "number": 8, "x": 0, "z": -8.5 }  // `type` is optional (archetype by number)
      ],
      "strokes": 4,                         // shots for the table
      "target": 450,                        // points to beat (tuned, see below)
      "eightLast": false,                   // the 8 must go last (a foul re-spots it)
      "obstacles": [ { "type": "box", "x": 0, "z": -3.5, "hw": 4.5, "hh": 0.4 } ],
      "objects":   [ { "kind": "double", "x": 2.6, "z": 2.6 } ],   // double, mine, freeze, shot, kicker
      "portals":   [ { "a": { "x": -5.6, "z": 5.4 }, "b": { "x": 5.6, "z": -9.6 } } ],
      "shop": ["corner-office", "soft-touch"]   // optional: cards the shop after this table opens with
    }
  ]
}
```

Coordinates are the lesson tables' (see `lessons.schema.md`): `x` in −9…9,
`z` in −16…16, −z is up the screen. Obstacles are boxes (`hw`, `hh`) or
circles (`radius`, optional `kind: "bumper"`).

## Tuning

`node tools/tune-tables.mjs [n…]` plays each table in the built game with a
beam search and prints two lines through it: **ROBUST**, where every shot sits
in a run of headings at least 3° wide (a line a new player can hit), and
**BEST**, the ceiling. Each table's `target` is set from the robust line, with
the margin shrinking as the run goes on.
