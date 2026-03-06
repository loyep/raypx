# AI Agent Guidelines

This document provides instructions for AI agents working on this codebase.

## Project Overview

Raypx is a modern fullstack monorepo built with:
- **Frontend**: React 19 + TanStack Router
- **Backend**: TanStack Start (Nitro)
- **API**: oRPC (type-safe RPC)
- **Auth**: Better Auth
- **Database**: PostgreSQL + Drizzle ORM
- **Styling**: Tailwind CSS v4
- **Monorepo**: Turborepo + pnpm

## Key Skills

Reference these skills when working on specific areas:

| Skill | Purpose |
|-------|---------|
| `turborepo` | Monorepo configuration, task pipelines, caching |
| `better-auth` | Authentication setup and best practices |
| `react-patterns` | React component patterns and best practices |
| `orpc` | Type-safe API patterns |

## Development Rules

### Before Making Changes

1. **Read existing code first** - Understand the current implementation
2. **Check related files** - Changes often affect multiple files
3. **Verify types** - Run `pnpm run typecheck` after changes

### Code Style

- Use TypeScript strict mode
- Prefer named exports over default exports
- Use `const` over `let`
- Keep functions small and focused
- Follow existing patterns in the codebase

### Git Commit Convention

- Every commit message must follow Conventional Commits.
- Commit message format: `<type>(optional-scope): <subject>`
- Allowed `type` values: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `build`, `perf`, `revert`
- Example: `feat(auth): add email login flow`
- Example: `chore(repo): update lint config`

### Package Dependencies

Follow the dependency hierarchy (only depend downward):

```
Layer 0: @raypx/tsconfig
Layer 1: @raypx/config
Layer 2: @raypx/logger, @raypx/shared, @raypx/core
Layer 3: @raypx/database, @raypx/email, @raypx/storage, @raypx/seo
Layer 4: @raypx/auth, @raypx/ai
Layer 5: @raypx/rpc
Layer 6: @raypx/design-system
Layer 7: apps/*
```

### Common Tasks

#### Adding a new API endpoint
1. Create router in `packages/rpc/src/routers/`
2. Register in `packages/rpc/src/index.ts`
3. Use via `orpc.routerName.method()`

#### Adding a new database table
1. Create schema in `packages/database/src/schemas/pg/`
2. Run `pnpm run push` from packages/database
3. Import from `@raypx/database`

#### Adding a new UI component
1. Create in `packages/design-system/components/ui/`
2. Export from package
3. Import from `@raypx/design-system`

### Avoid These Anti-Patterns

- Do not bypass Turborepo with direct scripts in root package.json
- Do not import from package internals (use package exports)
- Do not add app dependencies to root package.json
- Do not use `../` to traverse between packages

## Verification

After making changes:

```bash
pnpm run typecheck  # Type check
pnpm run lint       # Lint
pnpm run test       # Run tests (if applicable)
```
