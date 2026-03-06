# Raypx Project Rules

A modern fullstack monorepo built with TanStack Start, Better Auth, and oRPC.

## Project Structure

This is a monorepo with the following structure:

### Apps

- **`apps/web/`** - Main fullstack application (TanStack Start)
- **`apps/app/`** - Secondary app with auth (port 3001)
- **`apps/docs/`** - Documentation site

### Packages

| Package | Description |
|---------|-------------|
| `packages/tsconfig/` | Shared TypeScript configurations |
| `packages/config/` | Environment validation & app config |
| `packages/logger/` | Logging utilities (consola) |
| `packages/shared/` | Shared utilities and helpers |
| `packages/database/` | Database schema & queries (Drizzle ORM) |
| `packages/email/` | Email templates & sending (Resend) |
| `packages/storage/` | File storage (Cloudflare R2) |
| `packages/seo/` | SEO utilities |
| `packages/auth/` | Authentication (Better Auth) |
| `packages/rpc/` | API layer (oRPC) |
| `packages/design-system/` | UI components (shadcn-based) |
| `packages/i18n/` | Internationalization |
| `packages/observability/` | Monitoring & observability |

## Available Scripts

### Development

- `pnpm dev` - Start web app in development mode
- `pnpm dev:web` - Start web app in development mode
- `pnpm dev:app` - Start app in development mode (port 3001)
- `pnpm dev:docs` - Start docs site in development mode
- `pnpm dev:email` - Start email preview server

### Build & Quality

- `pnpm build` - Build all apps and packages
- `pnpm lint` - Lint all packages (Biome)
- `pnpm lint:fix` - Lint and fix issues
- `pnpm typecheck` - Type check all packages
- `pnpm test` - Run all tests

## Database Commands

All database operations are run from the root:

- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open Drizzle Studio
- `pnpm db:generate` - Generate migrations
- `pnpm db:migrate` - Run migrations
- `pnpm db:seed` - Seed the database

Database schema files are located in `packages/database/src/schemas/pg/`

## API Structure

- oRPC routers are in `packages/rpc/src/routers/`
- Middleware and procedures in `packages/rpc/src/middleware.ts`
- Client-side oRPC client is in `apps/web/src/utils/orpc.ts`

## Authentication

Authentication is powered by Better Auth:

- Auth configuration is in `packages/auth/src/`
- Web app auth client is in `apps/web/src/lib/auth.ts`

## Key Points

- This is a Turborepo monorepo using pnpm workspaces
- Each app has its own `package.json` and dependencies
- Run commands from the root to execute across all workspaces
- Run workspace-specific commands with `pnpm run command-name`
- Turborepo handles build caching and parallel execution
- Git hooks are configured with Lefthook for pre-commit checks
