# 0008 - Go Backend Project Layout

## Status

Accepted

## Context

The bootstrap rules define a Go layout for Mode B/C.

## Decision

Skip Go backend scaffolding in v1 because the project is Mode A.

## Consequences

- No `cmd/`, `internal/`, `pkg/`, `api/`, or `configs/` directories are created.
- No Go dependencies, `go.mod`, Dockerfile, or server health endpoints exist.

## Alternatives Considered

- Add empty Go folders: rejected because it implies a backend surface that does not exist.
