# Tech stack

Inferred from the existing codebase; no change planned.

- Vite + Three.js (WebGL), vanilla JavaScript modules. Portrait 9:16 mobile web.
- Web Audio API for all sound (synthesised, no audio files).
- `src/config.js` holds every tuning number and the palette.
- Checks are plain Node scripts in `tools/`, most driving the built game in headless Chromium through Playwright (`npm run verify`, `aim`, `foul`, `portal`, `scoring`, `flash`, and others). `npm run build` must pass before any of them.
