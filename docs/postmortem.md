# Postmortem

## What Was Built

Open Indie Studio v0.1.0 is a static GitHub Pages app for prototyping small 2D/casual indie games. It includes local project storage, a scene canvas, asset controls, Web Audio/Tone.js sketches, Yjs snapshot export, local LLM assistance, static playtest export, Pandoc-ready Markdown export, and visible version/commit metadata.

## Was Mode A Correct?

Yes. The implemented v1 does not need auth, secrets, a runtime database, or server-side mutations. GitHub Pages plus browser APIs was enough.

## What Worked

- Vite can publish directly to `docs/` while preserving ADR markdown.
- Dynamic imports keep Three.js, Tone.js, and Yjs out of the initial load path.
- The app remains understandable and portable.

## What Did Not Work

- GitHub Pages cannot provide custom COOP/COEP headers, so heavy WASM modules such as browser Pandoc or libigl need more validation before becoming runtime dependencies.

## Surprises

- The static-only approach covers more of the casual-game workflow than expected when exports are treated as first-class artifacts.

## Accepted Tech Debt

- The scene model is intentionally simple.
- libigl and Pandoc are implemented as handoff/export targets rather than bundled runtime modules.
- The local LLM flow depends on user-owned endpoint CORS behavior.

## Next Improvements

1. Add import for previously exported project JSON.
2. Add a sprite-sheet editor backed by OPFS for larger binary assets.
3. Add a tiny plugin API for custom export templates.

## Time Spent vs Estimate

Initial v0.1.0 scaffold and implementation fit in a single build session. A production-grade Unity replacement remains far beyond v1 scope.
