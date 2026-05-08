# 0005 - Client-Side Storage Strategy

## Status

Accepted

## Context

Projects must persist between sessions without auth or server storage.

## Decision

Use IndexedDB through `idb-keyval` for the current project. Use Blob downloads for portable exports. Avoid localStorage for project data because project JSON can grow.

## Consequences

- State is local-first and private by default.
- Users can clear browser storage and remove projects completely.
- Cross-device sync remains out of scope.

## Alternatives Considered

- OPFS: useful for larger assets later, but overkill for the v1 starter project.
- localStorage: too small and synchronous for project payloads.
