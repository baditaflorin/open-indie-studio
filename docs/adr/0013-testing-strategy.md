# 0013 - Testing Strategy

## Status

Accepted

## Context

The static app should be testable locally without GitHub Actions.

## Decision

Use Vitest for unit tests and Playwright for a happy-path smoke test. `make test`, `make build`, and `make smoke` are the main verification commands.

## Consequences

- Checks run locally and in git hooks.
- The smoke test verifies the GitHub Pages base path.
- Coverage is focused on project schema/export logic and the core UI path.

## Alternatives Considered

- GitHub Actions: rejected by the prompt.
- Manual-only testing: rejected because Pages base-path regressions are easy to miss.
