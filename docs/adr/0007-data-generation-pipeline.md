# 0007 - Data Generation Pipeline

## Status

Accepted

## Context

Mode B would require a static data generation pipeline.

## Decision

No data generation pipeline is required for Mode A. `make data` exists as a no-op target documenting that choice.

## Consequences

- No generator binaries, artifact metadata, or release-hosted datasets are created.
- Future Mode B work must add a new ADR before introducing generated data.

## Alternatives Considered

- Add sample generated data anyway: rejected as unnecessary maintenance.
