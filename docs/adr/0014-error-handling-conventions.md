# 0014 - Error Handling Conventions

## Status

Accepted

## Context

The app performs local storage, export, dynamic imports, and optional network calls.

## Decision

Return typed results where practical, validate project data with Zod, and surface user-facing failures inline. Optional feature failures should not break the main editor.

## Consequences

- Import/storage failures can show clear recovery paths.
- Lazy-loaded module failures are isolated to the initiating workflow.
- No `panic` equivalent exists in frontend code.

## Alternatives Considered

- Global catch-all only: rejected because feature-level recovery is clearer.
