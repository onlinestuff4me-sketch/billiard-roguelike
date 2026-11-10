/** notes.mjs — the plan's prose sections (how it was reviewed; performance). */
export const REVIEW = [
  '- **Played in the real build.** A headless Chromium at a phone viewport (390×780) played the built game: the home and play screens, a run from Table 1, shots (a straight pot, a two-rail bank at full power), the table result, the shop, the Boot transition into Table 2, a scratch, and all 13 tables through the tuning tool. Frames were captured on a virtual clock (`tools/capture/lib.mjs`), so what was reviewed frame by frame is what the game draws, at the speed it draws it.',
  '- **Read against the bible.** `docs/DESIGN_BIBLE.md` is the standard: its laws, its moment catalog, its record of past review picks, and its own gap table (§11), which already names two of the items below (the rail light-run and the balls flickering up at Boot).',
  '- **Levels were measured, not eyeballed.** Every table as authored, and every proposed layout, went through `tools/tune-tables.mjs` (beam search in the real physics) for its robust line, its ceiling and its widest openers.',
  '- **Sound builds on the sound pass.** `docs/SOUND.md` (branch `sound-pass`) audited all 37 sounds and its review page has no picks yet. Its proposals are folded in here by family rather than redone, and one item is added: sound for the new animation beats, in step with them.',
  '',
  '**What is already good and is left alone.** The count (plates, the slam, the tally), the result ledger and its skip, the shop\'s money travelling to and from the wallet, the Boot transition, the scratch glitch, the freeze frame, the table cards, and the cue stick. These are finished, specific and consistent; the plan does not touch them beyond their sounds.',
  '',
  '**What the review found, in short.**',
  '',
  '1. *The table under-reacts to the things that happen on it most.* Rails, contacts and pockets (the three events of every shot) get a handful of particles each, while rarer moments (the slam, CLEAR!, cut-ins) are lavish. Items A1, A2, F1.',
  '2. *Things appear without arriving.* The rack on a new table, the home screen, and every menu panel pop in on one frame, against the bible\'s own law 8. Items A3, U1.',
  '3. *Almost nothing moves at rest* (only the cue ball\'s glow). Item A4.',
  '4. *One win is unmarked.* Passing the target mid-table. Item U2.',
  '5. *The full-power strike whites out the screen.* Item A5.',
  '6. *The run repeats itself.* Several tables share a rack or a silhouette, and targets sit far below what a careful player scores, so "beat the target" is rarely a decision. Level items.',
  '7. *Sound has the hierarchy upside down* (the sound pass\'s finding): the pot is one of the quietest sounds, a hard rail one of the loudest, most weight is below what a phone can play, and old prototype voices stand in for a dozen events. Items S1 to S8.'
];

export const PERF = [
  'Measured in the built game at phone viewports. A software renderer cannot time a phone\'s GPU, so these are counts and sizes, not frame rates; the frame rate itself needs a device.',
  '',
  '| | Today |',
  '| --- | --- |',
  '| Drawing buffer on a 390×844 @3x phone | 780×1386 (pixel ratio capped at 2, `RENDER.maxPixelRatio`) |',
  '| Post-processing | Bloom (UnrealBloomPass, half-float target at full buffer size, 5 blur levels) whenever the device reports 4+ cores, then an output pass |',
  '| GPU resources on Table 1 | 74 geometries, 18 textures, 21 shader programs |',
  '| DOM at rest in play | about 390 nodes; a shot adds at most a few dozen short-lived ones and up to 6 running WAAPI animations |',
  '| Quality fallback | None at run time: bloom is decided once, from the core count |',
  '',
  'Findings:',
  '',
  '- The scene itself is light. The cost on a phone is fill rate: a 1.08-megapixel half-float buffer through a five-level bloom every frame, at every moment, including at rest on a still table.',
  '- The core-count test is a weak proxy. Budget Android phones report 8 cores with slow GPUs and get full bloom; nothing steps quality down if frames run long.',
  '- The polish prototypes are DOM and WAAPI only (transform and opacity), a few short-lived nodes each, and add no draw calls. The rail and pocket effects use `mix-blend-mode: screen`, which is the one thing to watch on low-end GPUs.',
  '',
  'Proposal (item F2): measure before changing. Add a frame-time probe (a rolling average of real frame time, visible with `?fps`), then an adaptive step: if the average stays above 22 ms for two seconds, drop the pixel ratio to 1.5, and if it still does, turn bloom off for the session; never step back up mid-table. Record the tier in the anonymous stats so the real distribution is known.'
];
