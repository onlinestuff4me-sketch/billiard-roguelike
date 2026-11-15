# Tech stack

Inferred from the existing codebase; no change planned.

- Vite + Three.js (WebGL), vanilla JavaScript modules. Portrait 9:16 mobile web.
- Web Audio API for all sound (synthesised, no audio files).
- `src/config.js` holds every tuning number and the palette.
- Checks are plain Node scripts in `tools/`, most driving the built game in headless Chromium through Playwright. `npm test` builds and runs the fast set; see `CLAUDE.md` for the full list and which need a build.
