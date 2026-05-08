# 0003 - Frontend Framework and Build Tooling

## Status

Accepted

## Context

The frontend needs strict TypeScript, fast local development, GitHub Pages output, and a component structure that can grow.

## Decision

Use React, TypeScript, Vite, Tailwind CSS, TanStack Query, Zod, and lucide-react. Vite builds directly into `docs/` for GitHub Pages.

## Consequences

- React provides a familiar component model.
- Vite gives fast local builds and simple static output.
- Tailwind keeps the UI cohesive without a custom design system.
- Heavy game/audio/collaboration libraries are dynamically imported.

## Alternatives Considered

- Vanilla TypeScript: smaller, but slower to build the expected workflow UI.
- Next.js/Astro: not needed for a fully client-side app.
