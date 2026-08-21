# `lessons.json` — tutorial lesson tables

One file, two readers: `src/systems/Tutorial.js` builds the tutorial from it, and
the level tool at `/tool` edits it under the **Lessons** tab.

This file holds **geometry only** — where the balls, barriers and goal sit, and
where the cue rests. What each lesson *asks for*, and how it is judged, lives in
`RULES` in `Tutorial.js`, keyed by the same `id`. The two are merged at load, so
**an `id` here must match an `id` there** or the lesson will have a table and no
instruction.

```jsonc
{
  "lessons": [
    {
      "id": "pass-angled",              // must match a key in Tutorial.js RULES
      "name": "The Cut",                // shown in the HUD's TABLE slot
      "rest": { "x": 0.17, "z": -0.985 },
      "obstacles": [ { "type": "box", "x": 0, "z": 2.6, "hw": 4.4, "hh": 0.5 } ],
      "enemies":   [ { "type": "solid", "x": 2.4, "z": -1.0, "invulnerable": true } ],
      "goal":      { "x": 0, "z": -11.8, "hw": 5.2, "hh": 1.1 }
    }
  ]
}
```

## The vertical budget

Coordinates are world units — `x` in [−9, 9], `z` in [−16, 16], **−z is up the
screen**. Three fixed landmarks constrain every rack:

| z | what |
|---|---|
| **6.4** | where the ball spawns, always. Racks are read relative to this. |
| **−5.4 … −10.1** | behind the **instruction card**. Anything here is invisible. |
| **−16** | the top rail. |

So a rack belongs in roughly **z −5.0 … 5.5**, and a goal bar above **z −10.5**.
The tool shades the card band in amber for exactly this reason.

## `rest`

The heading the cue parks on when the lesson opens, as a unit vector.
`{x: 0, z: -1}` is straight up. Every lesson rests on **its own solution** — the
answer is drawn on the table before the player touches anything, and they
reproduce it. A lesson whose rest points somewhere the shot cannot go is worse
than no resting heading at all.

The tool draws this as a dashed gold line from the ball.

## `enemies`

`type` is `solid`, `stripe` or `heavy`. Two optional flags matter here:

- **`invulnerable: true`** — cannot be damaged. Required for any ball that has to
  *survive being hit*: you cannot knock a ball into the goal, or cannon it into
  another, if the knock destroys it.
- **`frozen`** — defaults to true for lesson tables. Holds position; full physics.

The cue ball only passes **through a body it kills**, so the reverse is also
load-bearing: a lesson about running your own ball through a rack needs its
targets *mortal*, or the ball bounces off the first one.

## `goal`

Optional. A lit bar an enemy must be driven into — an axis-aligned box
`{x, z, hw, hh}`. It is **not** a collider: balls pass through it, because the
lesson is about where a struck ball ends up. Only an *enemy* entering scores; the
cue ball passing through does not.

## Editing

The tool is a static page and cannot write to the repository, so its **Download
lessons.json** button produces a replacement for this file. Drop it in over the
top and rebuild.
