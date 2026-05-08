# 0009 - Configuration and Secrets Management

## Status

Accepted

## Context

The frontend must not contain secrets. GitHub Pages is public.

## Decision

Only public build-time configuration is allowed. `.env.example` documents placeholders. `.env*` files are ignored except `.env.example`. Optional local LLM settings are endpoint/model hints only and are user-owned.

## Consequences

- No API keys, tokens, passwords, private keys, or internal hostnames are committed.
- Secret scanning runs through the local pre-commit hook when `gitleaks` is installed.

## Alternatives Considered

- Encrypted frontend secrets: rejected because client-side secrets are still public.
- Server proxy: rejected by Mode A.
