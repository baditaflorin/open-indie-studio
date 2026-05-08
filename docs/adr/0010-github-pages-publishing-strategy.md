# 0010 - GitHub Pages Publishing Strategy

## Status

Accepted

## Context

The live URL must work from day one, and the repository must keep build output available for GitHub Pages.

## Decision

Publish from `main` branch `/docs`. Vite builds into `docs/` with base path `/open-indie-studio/`. `docs/404.html` is copied from `docs/index.html` for SPA fallback. Generated files in `docs/assets/` are committed. Documentation markdown and ADRs also live under `docs/`; the build clean script removes only generated Pages assets.

Live URL: https://baditaflorin.github.io/open-indie-studio/

## Consequences

- The Pages output is inspectable in git.
- `.gitignore` does not ignore `docs/`.
- Stale generated assets are cleaned before each build without deleting ADRs.

## Alternatives Considered

- `gh-pages` branch: workable, but less direct for local-only publishing.
- `main /` root: rejected because source files would share the Pages root.
