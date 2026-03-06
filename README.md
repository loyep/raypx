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

## Common Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start default dev workflow (`web`) |
| `pnpm dev:api` | Start `apps/api` |
| `pnpm dev:web` | Start `apps/web` |
| `pnpm build` | Build all workspaces |
| `pnpm typecheck` | Run TypeScript checks |
| `pnpm lint` | Run Biome checks |
| `pnpm test` | Run test tasks |
| `pnpm db:migrate` | Run DB migrations |

## License

Apache-2.0
