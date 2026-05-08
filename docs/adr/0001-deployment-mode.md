# 0001 - Deployment Mode

## Status

Accepted

## Context

The v1 product is a local-first browser studio for small 2D/casual indie games. The user explicitly prefers GitHub Pages unless a runtime backend is genuinely required.

## Decision

Use Mode A: Pure GitHub Pages. The app runs as static HTML, CSS, JavaScript, Web Workers/service worker assets, and browser APIs. Persistence uses browser storage. Heavy modules are lazy-loaded in the browser. Optional local LLM assistance is BYO endpoint and never stores secrets in the frontend.

## Consequences

- No backend, Docker, nginx, runtime database, server metrics, or server secrets exist in v1.
- GitHub Pages is the only public runtime surface.
- Cross-device sync, hosted multiplayer collaboration, and authenticated cloud storage are not v1 features.
- All state stays on the user's device unless they export it.

## Alternatives Considered

- Mode B: unnecessary because v1 has no offline data-generation pipeline.
- Mode C: rejected because auth, mutations, secrets-at-runtime, and hosted real-time APIs are not v1 requirements.
