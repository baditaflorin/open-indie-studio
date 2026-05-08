# 0015 - Deployment Topology

## Status

Accepted

## Context

Mode C topology is not needed. Mode A still needs a clear deployment boundary.

## Decision

Deploy only through GitHub Pages from `main /docs`.

Public URL: https://baditaflorin.github.io/open-indie-studio/

Repository: https://github.com/baditaflorin/open-indie-studio

## Consequences

- No `deploy/` directory is required.
- Rollback is a git revert of the publishing commit.
- GitHub Pages limitations such as no `_headers` support are accepted.

## Alternatives Considered

- Docker Compose + nginx: rejected because no runtime backend exists.
