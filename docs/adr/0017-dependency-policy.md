# 0017 - Dependency Policy

## Status

Accepted

## Context

The prompt asks for battle-tested libraries and a small first-load payload.

## Decision

Use production-ready libraries only, pin through `package-lock.json`, and lazy-load expensive libraries. Run `npm audit` and keep high/critical vulnerabilities out of committed dependencies.

## Consequences

- The initial app shell stays lean.
- Dependency updates should be deliberate and verified locally.
- Custom implementations are limited to product-specific glue code.

## Alternatives Considered

- Build every subsystem from scratch: rejected.
- Pull in full editors/engines early: rejected until v1 proves the workflow.
