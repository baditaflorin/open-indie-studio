# 0011 - Logging Strategy

## Status

Accepted

## Context

Mode A has no server logs. Browser console noise should be minimal in production.

## Decision

Production code avoids routine console logging. User-visible failures are displayed in the UI. Development-only errors remain available through browser devtools and test output.

## Consequences

- No telemetry or server-side log collection exists.
- Errors that matter to users must be rendered as text or toast-like status messages.

## Alternatives Considered

- Client log beacons: rejected because analytics are not needed in v1.
