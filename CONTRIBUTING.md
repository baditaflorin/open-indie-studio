# Contributing

Thanks for helping improve Open Indie Studio.

## Local Setup

```bash
npm install
make install-hooks
make dev
```

## Workflow

- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `ops:`, `data:`.
- Run `make test`, `make build`, and `make smoke` before pushing.
- Do not commit secrets, real `.env` files, private keys, or tokens.
- Keep v1 static-first: GitHub Pages is the runtime surface.

## Architecture Decisions

Write an ADR in `docs/adr/` before making significant architecture changes.
