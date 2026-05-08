# 0004 - Static Data Contract

## Status

Accepted

## Context

Mode A has no scheduled data pipeline, but the app still has a stable local project schema and exported artifact formats.

## Decision

Use a versioned JSON project schema validated by Zod. The v1 schema version is `1`. Exported playtest builds are self-contained HTML files. Design docs are exported as Pandoc-ready Markdown.

## Consequences

- User projects can be backed up, shared, and imported without a server.
- Future schema migrations can be keyed by `schemaVersion`.
- There are no committed `/data/*.json` artifacts in v1.

## Alternatives Considered

- SQLite/Parquet artifacts: rejected because v1 does not need read-heavy public datasets.
- Runtime API contract: rejected by Mode A.
