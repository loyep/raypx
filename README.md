# Raypx

[![CI](https://github.com/raypx/raypx/actions/workflows/ci.yml/badge.svg)](https://github.com/raypx/raypx/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

Raypx is an open-source SaaS template monorepo. It is built for fast product shipping with a stable platform core (`core/auth/ai/rpc/design-system`) and optional AI capabilities.

## Product Shape

- `apps/web`: main web app (dashboard + app routes + chat + settings)
- `apps/docs`: docs content is served via `apps/web` docs routes
- `apps/api`: API app/runtime entry for backend surface

## Architecture Principles

- Single API layer: `oRPC` only.
- Frontend accesses backend only through RPC.
- AI is provider-pluggable (default path: Qwen, optional Zhipu).
- Package boundaries are enforced by dependency layers.

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
│   ├── web/     # Main app (dashboard, chat, settings, docs routes)
│   └── api/     # API app/runtime entry
├── packages/
│   ├── admin/           # Admin plugin (UI/API helpers)
│   ├── ai/              # AI domain services (providers, stream, logs)
│   ├── auth/            # Better Auth integration + rpc helpers
│   ├── config/          # Runtime/env config
│   ├── core/            # Cross-package context + base contracts
│   ├── database/        # Drizzle schemas + adapters
│   ├── design-system/   # Shared UI
│   ├── forge/           # Internal command tooling
│   ├── rpc/             # oRPC transport layer
│   ├── shared/          # Cross-end pure types/constants
│   └── ...
└── scripts/             # Internal automation scripts
```

## Tech Stack

| Category | Technology |
| --- | --- |
| App Framework | TanStack Start + React 19 + TypeScript |
| API Layer | oRPC |
| Auth | Better Auth |
| Database | PostgreSQL + Drizzle ORM |
| AI | AI SDK + provider adapters |
| UI | Tailwind CSS v4 + design-system |
| Monorepo | Turborepo + pnpm workspaces |
| Tooling | Biome + Vitest + Changesets |

## Commands

### Development

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the default app workflow (`apps/web`) |
| `pnpm dev:web` | Start `apps/web` |
| `pnpm dev:api` | Start `apps/api` |
| `pnpm dev:docs` | Start `apps/docs` |
| `pnpm dev:full` | Start `web`, `api`, and `docs` together |
| `pnpm build` | Build all workspaces |
| `pnpm build:web` | Build `apps/web` |
| `pnpm build:api` | Build `apps/api` |
| `pnpm build:docs` | Build `apps/docs` |
| `pnpm lint` | Run Biome checks |
| `pnpm lint:fix` | Apply Biome fixes |
| `pnpm typecheck` | Run TypeScript checks |
| `pnpm test` | Run test tasks |
| `pnpm test:watch` | Run Vitest in watch mode |
| `pnpm test:coverage` | Run coverage locally |
| `pnpm boundaries` | Validate workspace dependency boundaries |

### Platform

| Command | Description |
| --- | --- |
| `pnpm setup` | Run initial local setup |
| `pnpm doctor` | Run workspace health checks |
| `pnpm db` | Open the database command group |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:push` | Push schema changes directly |
| `pnpm db:pull` | Pull schema from the database |
| `pnpm db:seed` | Run database seeds |
| `pnpm db:studio` | Open Drizzle Studio |

### Maintenance

| Command | Description |
| --- | --- |
| `pnpm clean` | Remove Turbo caches and Vite workspace caches |
| `pnpm bump-deps` | Update dependency versions with `taze` |
| `pnpm deps:bump` | Alias for `pnpm bump-deps` |
| `pnpm bump-ui` | Refresh design-system primitives from `shadcn` |
| `pnpm ui:bump` | Alias for `pnpm bump-ui` |
| `pnpm changeset` | Create or manage changesets |
| `pnpm release` | Apply changeset version updates |

Tooling commands provided by `forge` are also discoverable directly:

```bash
forge --help
forge db --help
forge doctor --help
```

## License

Apache-2.0
