# 0012 - Metrics and Observability

## Status

Accepted

## Context

Mode A has no server metrics. Analytics are optional and privacy-sensitive.

## Decision

Ship no analytics in v1. Observability consists of local tests, smoke tests, and visible UI status.

## Consequences

- No PII is collected.
- There is no usage dashboard.
- Product decisions rely on GitHub issues, stars, and direct feedback.

## Alternatives Considered

- Plausible or custom beacon: deferred until there is a clear need and an explicit privacy ADR.
