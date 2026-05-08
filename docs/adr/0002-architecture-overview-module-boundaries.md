# 0002 - Architecture Overview and Module Boundaries

## Status

Accepted

## Context

The app must replace parts of an indie game workflow without becoming a full Unity clone.

## Decision

Use a single static frontend with feature-oriented modules:

- `features/studio`: project state, persistence, scene editing, workflow UI.
- `features/audio`: Web Audio and lazy Tone.js sketching.
- `features/rendering`: canvas preview and lazy Three.js preview.
- `features/export`: project JSON, static playtest HTML, Pandoc-ready Markdown.
- `features/ai`: optional BYO local LLM prompt flow.

## Consequences

- The v1 architecture stays simple and inspectable.
- Heavy dependencies stay out of the first-load path.
- Future modules can be added without changing deployment mode.

## Alternatives Considered

- Backend-first monolith: rejected for Mode A.
- Engine-first architecture: rejected because the immediate goal is a lightweight casual-game workflow.
