# 0006 - WASM Modules

## Status

Accepted

## Context

The prompt references WebGPU, Three.js, Web Audio, Tone.js, Yjs, a local LLM, libigl, and Pandoc. GitHub Pages cannot set arbitrary COOP/COEP headers.

## Decision

Do not ship mandatory WASM modules in v1. The app keeps WASM-facing extension points documented:

- WebGPU is detected in the browser and surfaced as capability information.
- Three.js is lazy-loaded for a lightweight preview.
- Tone.js is lazy-loaded for audio sketching.
- Yjs is lazy-loaded for local CRDT snapshots.
- Local LLM calls use a user-owned endpoint.
- libigl and Pandoc are treated as export/handoff targets, not required runtime payloads, until a browser-compatible WASM strategy is proven.

## Consequences

- First load stays small.
- GitHub Pages header limitations do not block v1.
- The app remains honest about what is native browser functionality versus future WASM enhancement.

## Alternatives Considered

- Bundle large WASM modules now: rejected due to payload and Pages header risk.
- Runtime backend for conversion: rejected by Mode A.
