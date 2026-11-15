# CLAUDE.md: Lightline: Billiard Roguelike

Portrait mobile web billiards roguelike. Vite + Three.js, vanilla JS modules, no
framework, no audio or texture files (all procedural). Live at
https://billiard-roguelike.vercel.app. What the game must do: `specs/product.md`.
Look, moments and every review decision: `docs/DESIGN_BIBLE.md`. Read the bible's
section for anything you touch before changing it.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/; most checks play this build, not the dev server
npm test           # build + the fast checks (below); run before every push
```

## Checks

Plain Node scripts in `tools/`. Most drive the **built** game in headless Chromium
through Playwright via `vite preview` on port 4173, so build first (`npm test`
does). Exit code is non-zero on failure.

| Command | Checks | Build? | Time |
| --- | --- | --- | --- |
| `npm run scoring` | Points × Mult, targets, cash, shop maths (pure Node) | no | 1 s |
| `npm run layout` | Nothing off-screen at phone sizes; coach never covers the felt | yes | ~75 s |
| `npm run analytics` | Events, API and dashboard end to end against local mocks | yes | |
| `npm run release` | Release fires the drawn shot, and only that one | yes | |
| `npm run foul` | The line goes red for a scratch or foul before the stroke | yes | |
| `npm run portal` | A line through a portal still matches the shot | yes | |
| `npm run editor` | The table editor's measurements match the CLI tools | yes | |
| `npm run palette` | Balls are told apart on screen (sampled from the render) | yes | |
| `npm run aim` | The preview's shot is the played shot (lesson boards) | yes | |
| `node tools/check-aim-run.mjs` | Same, on all 13 run tables (must stay 100%) | yes | minutes |
| `npm run coach`, `npm run flash` | Lesson coaching after a failed stroke; nothing drawn between a drop and the next card | yes | |
| `npm run verify` | Every lesson board is solvable by an aimable shot | yes | minutes |
| `node tools/tune-tables.mjs [n] --beam=3 --step=2` | Plays a run table, prints robust/best lines vs its target | yes | ~40 s per table |

`npm test` runs: build, scoring, layout, analytics, release, foul, portal. Before
merging anything that touches physics, aiming, tables or lessons, also run
`aim`, `check-aim-run` and `verify`. The full tuner search at default settings
can run out of memory in a cloud container; use `--beam=3 --step=2`.

**Browser path:** `tools/sim.mjs` uses `CHROMIUM_PATH` if set, else
`/opt/pw-browsers/chromium` (cloud containers), else Playwright's default.
Never run `playwright install`.

## Must never regress

- **The line shown is the shot played.** The aim preview runs the real physics
  (`simulateAim`, fixed `SIM_H` steps). No change may make them disagree, and
  aiming itself (touch anywhere, drag, release) stays as it is.
- **Tables and lessons are measured, not eyeballed.** A shot must be aimable
  (a window several degrees wide), and a table's target sits under the score of
  the robust line the tuner finds. Record the numbers in the commit.
- **Upgrades never change physics or the preview**, only scoring and what a
  table gives.
- **One new thing per table**, introduced on its card with a picture
  (`public/mechanics/`) and a one-line rule that fits a 360px-wide phone.
- **No camera zoom while aiming** (`JUICE_DEFAULTS.push: 'off'`): it hid parts of
  the table on phones.
- Juice and moments come from their cause, land one at a time, and never cover
  the aim preview. Prototypes go behind a toggle (see `JUICE_OPTIONS` in
  `src/ui/Juice.js`) and stay off until approved.
- US spellings in anything a player reads.

## Where things are

`src/main.js` (wiring, the loop, most game flow), `src/config.js` (every tuning
number and the palette), `src/systems/PhysicsSystem.js`, `Rules.js` (scoring,
hearts, targets), `RoomManager.js`, `Upgrades.js`, `src/ui/` (HUD, ScoreFeed,
Moments, Juice, ShotTray), `src/core/AudioManager.js` (all sound),
`src/data/tables.json` (the 13 run tables; schema next to it). Test hooks for
tools: `window.__run`, `window.__aim`, `window.__game`.

## Deploy

Vercel builds `main` on every push (`vercel.json`: `npm run build` → `dist/`).
Branches get preview deployments. `/classic` is a **committed** build snapshot in
`public/classic/` of the earlier real-time design; regenerate it only with
`node scripts/snapshot-classic.mjs [ref]`, never by hand.

## Analytics

Client: `src/analytics/Analytics.js` (hooks in `main.js` marked `// analytics`).
Server: `api/events.js`, `api/stats.js` on Upstash Redis over REST. Dashboard:
`/dashboard.html#token=<STATS_TOKEN>`. Env vars on Vercel: `KV_REST_API_URL`,
`KV_REST_API_TOKEN` (from the Upstash integration), `STATS_TOKEN`; optional
`ANALYTICS_SALT`, `ANALYTICS_ORIGINS`, `ANALYTICS_MONTHLY_COMMANDS`. **Cost
cap:** commands are counted per month; ingest stops at 297,500 and reads at
350,000 (about $0.70). Without storage configured the API answers 503 and
devices keep events locally. Details: `docs/ANALYTICS.md`.

## Working with the owner

- The owner, Mischa, is a **non-technical PM**. Explain outcomes in plain
  language: what changed in the game, not which function.
- Decisions are made on **review pages** (claude.ai artifacts): one card per
  item, lettered options or Approve/Reject, a note box, picks saved, and a
  **Send all to Claude** button. Show real captures from the game, side by side
  with what is there now. Log each decision with its date in
  `docs/DESIGN_BIBLE.md`.
- Handoffs describe the current state only, short.

## Git

- One branch per task from `origin/main`. Never force-push; bring `main` in by
  merging. Open a PR only when asked; it is squash-merged into `main`.
- Commit messages say what changed for the player and why, with measured
  numbers for any table or tuning change.
