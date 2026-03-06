# Raypx

[![CI](https://github.com/raypx/raypx/actions/workflows/ci.yml/badge.svg)](https://github.com/raypx/raypx/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

Raypx is an open-source SaaS template monorepo. It is built for fast product shipping with a stable platform core (`core/auth/ai/rpc/design-system`) and optional AI capabilities.

## Product Shape

- `apps/app`: SaaS console (admin + business features)
- `apps/web`: marketing/site shell + sign-in entry
- `apps/docs`: standalone docs app for separate deployment

Recommended production domains:

- `raypx.com` -> `apps/web`
- `app.raypx.com` -> `apps/app`
- `docs.raypx.com` -> `apps/docs`

## Architecture Principles

- Single API layer: `oRPC` only.
- Frontend accesses backend only through RPC.
- AI is provider-pluggable (default path: Qwen, optional Zhipu).
- Package boundaries are enforced by dependency layers.

See [ROADMAP.md](./ROADMAP.md) and [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the execution plan.

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
│   ├── app/     # SaaS dashboard app
│   ├── web/     # Marketing/main web app
│   └── docs/    # Documentation app
├── packages/
│   ├── core/            # Cross-package context + base contracts
│   ├── config/          # Runtime/env config
│   ├── shared/          # Cross-end pure types/constants
│   ├── database/        # Drizzle schemas + adapters
│   ├── auth/            # Better Auth integration + rpc helpers
│   ├── ai/              # AI domain services (providers, stream, logs)
│   ├── rpc/             # oRPC transport layer
│   ├── design-system/   # Shared UI
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
| `pnpm dev:app` | Start `apps/app` |
| `pnpm dev:web` | Start `apps/web` |
| `pnpm dev:docs` | Start `apps/docs` |
| `pnpm build` | Build all workspaces |
| `pnpm typecheck` | Run TypeScript checks |
| `pnpm lint` | Run Biome checks |
| `pnpm test` | Run test tasks |
| `pnpm db:migrate` | Run DB migrations |

## License

Apache-2.0
