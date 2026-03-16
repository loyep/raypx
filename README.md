# Raypx

[![CI](https://github.com/raypx/raypx/actions/workflows/ci.yml/badge.svg)](https://github.com/raypx/raypx/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

Raypx is an open-source SaaS template monorepo. It is built for fast product shipping with a stable platform core (`core/auth/ai/rpc/design-system`) and optional AI capabilities.

## Product Shape

- `apps/web`: main web app (dashboard + app routes + chat + settings)
- API routes are served from `apps/web/src/routes/api/*`

## Architecture Principles

- Single API layer: `oRPC` only.
- Browser-facing modules access backend capabilities through RPC or client-safe wrappers.
- AI is provider-pluggable through database-managed provider records and encrypted credentials.
- Package boundaries are enforced by dependency layers.
- `@raypx/core/logger` is the shared logger entrypoint.

See [ROADMAP.md](./ROADMAP.md) for the execution plan.

## Requirements

- Node.js >= 22
- pnpm >= 10.26.0

## Quick Start

```bash
pnpm install
pnpm setup
pnpm dev
```

## Workspace Layout

```text
raypx/
├── apps/
│   └── web/     # Main app (dashboard, chat, settings, docs routes, api routes)
├── packages/
│   ├── admin/           # Admin plugin (UI/API helpers)
│   ├── ai/              # AI domain services (providers, stream, logs)
│   ├── auth/            # Better Auth integration + rpc helpers
│   ├── config/          # Runtime/env config
│   ├── core/            # Base runtime contracts and logger entrypoint
│   ├── database/        # Drizzle schemas + adapters
│   ├── design-system/   # Shared UI
│   ├── rpc/             # oRPC transport layer
│   ├── shared/          # Cross-end pure types/constants
│   └── ...
└── tooling/
    ├── forge/           # Internal command tooling
    └── tsconfig/        # Shared TypeScript presets
```

## Tech Stack

| Category      | Technology                             |
| ------------- | -------------------------------------- |
| App Framework | TanStack Start + React 19 + TypeScript |
| API Layer     | oRPC                                   |
| Auth          | Better Auth                            |
| Database      | PostgreSQL + Drizzle ORM               |
| AI            | AI SDK + provider adapters             |
| UI            | Tailwind CSS v4 + design-system        |
| Monorepo      | Turborepo + pnpm workspaces            |
| Tooling       | Biome + Vitest + Changesets            |

## Commands

### Development

| Command              | Description                                 |
| -------------------- | ------------------------------------------- |
| `pnpm dev`           | Start the default app workflow (`apps/web`) |
| `pnpm dev:web`       | Start `apps/web`                            |
| `pnpm dev:full`      | Start the same workflow as `dev:web`        |
| `pnpm build`         | Build all workspaces                        |
| `pnpm build:web`     | Build `apps/web`                            |
| `pnpm lint`          | Run Biome checks                            |
| `pnpm lint:fix`      | Apply Biome fixes                           |
| `pnpm typecheck`     | Run TypeScript checks                       |
| `pnpm test`          | Run test tasks                              |
| `pnpm test:watch`    | Run Vitest in watch mode                    |
| `pnpm test:coverage` | Run coverage locally                        |
| `pnpm coverage`      | Alias for `pnpm test:coverage`              |
| `pnpm boundaries`    | Validate workspace dependency boundaries    |

### Platform

| Command            | Description                     |
| ------------------ | ------------------------------- |
| `pnpm setup`       | Run initial local setup         |
| `pnpm doctor`      | Run workspace health checks     |
| `pnpm db`          | Open the database command group |
| `pnpm db:generate` | Generate Drizzle migrations     |
| `pnpm db:migrate`  | Run database migrations         |
| `pnpm db:push`     | Push schema changes directly    |
| `pnpm db:pull`     | Pull schema from the database   |
| `pnpm db:seed`     | Run database seeds              |
| `pnpm db:studio`   | Open Drizzle Studio             |

### Maintenance

| Command          | Description                                    |
| ---------------- | ---------------------------------------------- |
| `pnpm clean`     | Remove Turbo caches and Vite workspace caches  |
| `pnpm bump-deps` | Update dependency versions with `taze`         |
| `pnpm deps:bump` | Alias for `pnpm bump-deps`                     |
| `pnpm bump-ui`   | Refresh design-system primitives from `shadcn` |
| `pnpm ui:bump`   | Alias for `pnpm bump-ui`                       |
| `pnpm changeset` | Create or manage changesets                    |
| `pnpm release`   | Apply changeset version updates                |

Tooling commands provided by `forge` are also discoverable directly:

```bash
forge --help
forge db --help
forge doctor --help
```

## Test Policy

- Workspace tests live under `tests/`.
- Each workspace with a `test` script must be classified in [`tooling/forge/repo-policy.ts`](./tooling/forge/repo-policy.ts) under `testing.required` or `testing.allowNoTests`.
- `forge doctor` enforces both the layout and the policy classification.

## Operability Policy

- Every workspace is classified in [`tooling/forge/repo-policy.ts`](./tooling/forge/repo-policy.ts) as either `buildable` or `sourceOnly`.
- `buildable` workspaces must provide `build`, `clean`, `typecheck`, and `test` coverage according to repo policy.
- `sourceOnly` workspaces are expected to stay installable and testable, but they do not publish or emit standalone build artifacts.
- `forge doctor` enforces both the workspace classification and the presence of build scripts for `buildable` workspaces.

## License

Apache-2.0
