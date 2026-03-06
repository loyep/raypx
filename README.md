# Raypx

A modern full-stack monorepo built with TanStack Start, React 19, and Drizzle ORM.

## Tech Stack

- **Framework**: TanStack Start 1.135+ + React 19 + TypeScript 5.9
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Better Auth with OAuth, Magic Link, Email OTP
- **API**: ORPC for type-safe APIs
- **UI**: Tailwind CSS v4 + 60+ shadcn/ui components
- **Tooling**: Biome (linter/formatter), Vitest, Turborepo

## Project Structure

```
raypx/
├── apps/
│   ├── web/          # Main web application
│   ├── app/          # Secondary app
│   └── docs/         # Documentation site (Fumadocs)
├── packages/
│   ├── api/          # ORPC API layer
│   ├── config/       # Environment & configuration
│   ├── database/     # Drizzle ORM + PostgreSQL
│   ├── seo/          # SEO utilities
│   ├── shared/       # Shared utilities
│   ├── tsconfig/     # TypeScript configurations
│   └── ui/           # UI component library
└── scripts/          # Build & dev scripts
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Setup environment
pnpm setup

# Start development server
pnpm dev:web
```

## Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev:web` | Start web app in dev mode |
| `pnpm dev:docs` | Start docs in dev mode |
| `pnpm build` | Production build |
| `pnpm test` | Run tests |
| `pnpm typecheck` | TypeScript validation |
| `pnpm check` | Lint with Biome |
| `pnpm format` | Format code with Biome |
| `pnpm db` | Database commands |

## Documentation

Visit the [docs](./apps/docs) for detailed guides on:
- Getting started
- Deployment
- Authentication
- API reference

## License

Apache-2.0
