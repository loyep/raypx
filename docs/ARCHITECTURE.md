# Raypx Architecture (2026-03-10)

This document is the maintainability baseline for the monorepo.
Any structural refactor should update this file first.

## System Shape

- `apps/web`: main product surface (TanStack Start + React 19).
- `apps/web/src/routes/api/*`: backend route handlers on the web runtime.
- `apps/web/content/docs` + `apps/web/src/routes/docs/*`: documentation source and routes.
- `packages/*`: domain modules and shared platform capabilities.
- `tooling/*`: internal development tooling (`forge`, `tsconfig`).

## Layering Rules

Dependency direction must stay top-down:

1. `@raypx/tsconfig`
2. `@raypx/config`
3. `@raypx/core`, `@raypx/shared`
4. `@raypx/database`, `@raypx/email`, `@raypx/storage`, `@raypx/seo`
5. `@raypx/auth`, `@raypx/ai`
6. `@raypx/rpc`
7. `@raypx/design-system`
8. `apps/*`

Rules:

- No upward imports.
- No cross-package internal path imports.
- `@raypx/shared` only contains pure types/constants.
- `@raypx/rpc` remains transport-only (no hidden domain logic).

## Domain Ownership

- AI domain logic: `@raypx/ai`
- Auth/session domain logic: `@raypx/auth`
- DB schema + persistence infra: `@raypx/database`
- API transport + contracts binding: `@raypx/rpc`
- UI primitives: `@raypx/design-system`
- Product workflows/pages: `apps/web`

## Current Hotspots

- `packages/ai/src/chat-service.ts` is oversized and owns too many responsibilities.
- Chat flow logic is split across backend service and frontend controller with high cognitive load.
- Architecture docs were missing and TODO referenced non-existent files.

## Refactor Constraints

- Keep API compatibility for `ai.chat` and `ai.chatStream`.
- Preserve event protocol contract (`eventVersion=1`) until a versioned migration exists.
- Prefer incremental refactor (strangler pattern) over big-bang rewrite.
- Every phase must pass:
  - `pnpm run typecheck`
  - `pnpm run lint`
  - `pnpm run test` (scope-aware)
