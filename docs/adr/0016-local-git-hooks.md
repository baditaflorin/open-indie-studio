# 0016 - Local Git Hooks

## Status

Accepted

## Context

No GitHub Actions are allowed, so local hooks carry the quality gate.

## Decision

Use plain `.githooks/` scripts wired by `make install-hooks`. Hooks run linting, type checks, formatting checks, tests, build, smoke checks, Conventional Commit validation, and staged secret scanning when `gitleaks` is installed.

## Consequences

- Contributors must run `make install-hooks` locally.
- Hook scripts remain inspectable and shell-native.
- Missing optional tools are documented rather than hidden.

## Alternatives Considered

- lefthook: useful, but plain hooks are enough for v1.
