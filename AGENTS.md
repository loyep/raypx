# Raypx Project Rules

A modern fullstack monorepo built with TanStack Start, Better Auth, and oRPC.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Apps Layer                               │
│  ┌─────────┐                                                   │
│  │   web   │                                                   │
│  └────┬────┘                                                   │
└───────┼────────────────────────────────────────────────────────┘
        │
┌───────┼────────────────────────────────────────────────────────┐
│       │    Packages Layer       │                               │
│  ┌────┴────┐       │       ┌────┴────┐                          │
│  │   RPC   │       │       │  Design │                          │
│  │ (oRPC)  │       │       │ System  │                          │
│  └────┬────┘       │       └────┬────┘                          │
│       │       ┌────┴────┐       │                               │
│       │       │   Auth  │───────┘                               │
│       │       │(Better) │                                       │
│       │       └────┬────┘                                       │
│  ┌────┴────┐  ┌────┴────┐  ┌─────────┐  ┌─────────┐            │
│  │Database │  │ Storage │  │  Email  │  │   SEO   │            │
│  │(Drizzle)│  │   (R2)  │  │(Resend) │  │         │            │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘            │
│       └───────┬────┴───────────┴──────────┴────┘                │
│           ┌───┴──────────────┐                                  │
│           │ Shared / Core    │─────┐                            │
│           └───┬──────────────┘     │                            │
│               │                 ┌──┴──────────────┐             │
│               │                                                  │
│               │                                                  │
│          ┌────┴────┐                                            │
│          │ Config  │                                            │
│          │ (Env)   │                                            │
│          └────┬────┘                                            │
│               │                                                  │
│          ┌────┴────┐                                            │
│          │TSConfig │                                            │
│          └─────────┘                                            │
└─────────────────────────────────────────────────────────────────┘
```

## Server / Client Package Convention

Packages use a consistent server/client split:

- **Default entry (`index`)** = server-only (Node.js, database, etc.)
- **`/client` subpath** = client-safe (browser bundle)

| Package                  | Main (`@raypx/pkg`)          | Client (`@raypx/pkg/client`)                                       |
| ------------------------ | ---------------------------- | ------------------------------------------------------------------ |
| auth                     | createAuth, getServerSession | authClient, signIn, signOut, useSession, AuthProvider, OAuthButton |
| rpc                      | appRouter, createContext     | client, orpc                                                       |
| core                     | logger (pino)                | logger (console stub)                                              |
| database, email, storage, stripe | server-only          | —                                                                  |
| design-system            | client-only                  | —                                                                  |

**Rule**: Import `@raypx/auth/client` in React components; import `@raypx/auth` in API routes and server code.

## Package Exports Convention

All packages follow a unified `exports` order and naming (except design-system, which uses path-based exports).

### Export key order

1. `"."` - main entry
2. `"./client"` - client entry (for packages with server/client split)
3. `"./server"` - explicit server entry for packages with a real client/server split
4. `"./types"` - types-only entry
5. Other feature subpaths (alphabetically)

### Naming

- **env**: package-local env definitions use `/env`; aggregated config package exports use `/envs`
- **types**: types-only entry uses `/types`
- **apps**: each app owns its runtime env aggregation in `src/env.ts`
- **aliases**: avoid adding compatibility aliases unless they are truly needed for a migration

### Server-only Packages

For server-only packages, the main export `"."` is the canonical server entry.

- Do not add a redundant `"./server"` alias for packages that have no client-safe surface.
- Use explicit `./server` entries only for packages that also expose `./client` or otherwise need a separate public server path.

### Env Conventions

- Keep env schema ownership close to the package that uses it: for example `@raypx/email/env`, `@raypx/storage/env`, `@raypx/stripe/env`, `@raypx/ai/env`.
- Prefer exporting `envs()` from package env modules instead of exporting a shared `env` singleton by default.
- App code should import runtime env from local `@/env`, not directly from `@raypx/config`.

### design-system

Uses path-based exports (`./components/*`, `./lib/*`, etc.), no main entry; exempt from the generic convention.

## Project Structure

```
raypx/
├── apps/
│   ├── web/                    # Main fullstack app (TanStack Start)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── admin/      # Admin-specific components
│   │   │   │   └── dashboard/  # Dashboard layout components
│   │   │   ├── routes/
│   │   │   │   └── (app)/
│   │   │   │       ├── dashboard.tsx
│   │   │   │       └── admin/
│   │   │   │           └── users.tsx   # Admin user management
│   │   │   ├── types/          # App-specific types
│   │   │   └── utils/          # Utility functions
│   │   └── ...
│   └── (api routes in web)     # src/routes/api/*
├── packages/
│   ├── tsconfig/               # Shared TypeScript configs
│   ├── config/                 # Environment validation & app config
│   ├── core/                   # Base runtime contracts and logger entrypoint
│   ├── shared/                 # Shared utilities and helpers
│   ├── database/               # Database schema & queries (Drizzle)
│   ├── email/                  # Email templates & sending (Resend)
│   ├── storage/                # File storage (Cloudflare R2)
│   ├── seo/                    # SEO utilities
│   ├── auth/                   # Authentication (Better Auth)
│   ├── rpc/                    # API layer (oRPC)
│   │   └── src/
│   │       ├── middleware.ts   # Procedure definitions (public, protected, admin)
│   │       └── routers/        # API routers
│   └── design-system/          # UI components (shadcn-based)
├── turbo.json                  # Turborepo configuration
├── pnpm-workspace.yaml
└── biome.json                  # Linting & formatting
```

## Dependency Hierarchy

Packages must only depend on packages at the same layer or lower layers:

| Layer | Package                | Dependencies     |
| ----- | ---------------------- | ---------------- |
| 0     | `@raypx/tsconfig`      | -                |
| 1     | `@raypx/config`        | -                |
| 2     | `@raypx/core`          | -                |
| 2     | `@raypx/shared`        | -                |
| 3     | `@raypx/database`      | config, shared   |
| 3     | `@raypx/email`         | config           |
| 3     | `@raypx/storage`       | config           |
| 3     | `@raypx/seo`           | -                |
| 4     | `@raypx/auth`          | config, database |
| 5     | `@raypx/rpc`           | auth, database   |
| 6     | `@raypx/design-system` | shared           |
| 7     | `apps/*`               | any packages     |

**Rule**: Never create circular dependencies. Always depend downward.

## Adding New Features

### Adding a New API Endpoint

1. **Create the router file** in `packages/rpc/src/server/routers/`:

```typescript
// packages/rpc/src/server/routers/feature.ts
import { z } from "zod";
import { publicProcedure, protectedProcedure, adminProcedure } from "../middleware";

export const featureRouter = {
  // Public endpoint - no auth required
  getPublic: publicProcedure.input(z.object({ id: z.string() })).handler(async ({ input }) => {
    // Implementation
  }),

  // Protected endpoint - requires authentication
  getPrivate: protectedProcedure.handler(async ({ context }) => {
    const userId = context.user.id;
    // ...
  }),

  // Admin endpoint - requires admin role
  adminOnly: adminProcedure.handler(async ({ context }) => {
    // Only admins can access
  }),
};
```

2. **Register the router** in `packages/rpc/src/server/routers/index.ts`:

```typescript
import { featureRouter } from "./feature";

export const appRouter = {
  // ...existing routers
  feature: featureRouter,
};
```

3. **Use in the client**:

```typescript
import { client } from "@/utils/orpc";

// Type-safe client calls
const publicData = await client.feature.getPublic({ id: "123" });
const privateData = await client.feature.getPrivate();
const adminData = await client.feature.adminOnly();
```

### Adding a New UI Component

1. **Create component** in `packages/design-system/components/ui/`:

```typescript
// packages/design-system/components/ui/my-component.tsx
import { cn } from '@raypx/shared'

export function MyComponent({ className, ...props }) {
  return <div className={cn('base-styles', className)} {...props} />
}
```

2. **Export from package** in `packages/design-system/exports`:

```typescript
export { MyComponent } from "./components/ui/my-component";
```

3. **Use in app**:

```typescript
import { MyComponent } from "@raypx/design-system";
```

### Adding a New Package

1. **Create the package directory**:

```bash
mkdir -p packages/my-package/src
```

2. **Create package.json**:

```json
{
  "name": "@raypx/my-package",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    // Only depend on lower layers
  },
  "devDependencies": {
    "@raypx/tsconfig": "workspace:*"
  }
}
```

3. **Add TypeScript config** `packages/my-package/tsconfig.json`:

```json
{
  "extends": "@raypx/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

4. **Register in workspace** (already auto-included by pnpm)

### Adding a New Environment Variable

1. **Add to config schema** in `packages/config/src/envs.ts`:

```typescript
export const envSchema = z.object({
  // ...existing vars
  MY_NEW_VAR: z.string().optional(),
});
```

2. **Add to `.env.example`** in root:

```bash
MY_NEW_VAR=example_value
```

3. **Use in code**:

```typescript
import { env } from "@raypx/config";

const value = env.MY_NEW_VAR;
```

## Available Scripts

### Development

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `pnpm dev`      | Start web app in development mode    |
| `pnpm dev:web`  | Start web app in development mode    |
| `pnpm dev:full` | Start the same workflow as `dev:web` |

### Build & Start

| Command          | Description                       |
| ---------------- | --------------------------------- |
| `pnpm build`     | Build all apps and packages       |
| `pnpm build:web` | Build web app only                |
| `pnpm start`     | Start all apps in production mode |

### Code Quality

| Command              | Description               |
| -------------------- | ------------------------- |
| `pnpm typecheck`     | Type check all packages   |
| `pnpm lint`          | Lint all packages (Biome) |
| `pnpm lint:fix`      | Lint and fix issues       |
| `pnpm format`        | Format code (Biome)       |
| `pnpm test`          | Run all tests             |
| `pnpm test:watch`    | Run tests in watch mode   |
| `pnpm test:coverage` | Run tests with coverage   |

### Database Commands

| Command            | Description                     |
| ------------------ | ------------------------------- |
| `pnpm db`          | Interactive database CLI        |
| `pnpm db:push`     | Push schema changes to database |
| `pnpm db:studio`   | Open Drizzle Studio             |
| `pnpm db:generate` | Generate migrations             |
| `pnpm db:migrate`  | Run migrations                  |
| `pnpm db:seed`     | Seed the database               |

### Project Management

| Command          | Description                         |
| ---------------- | ----------------------------------- |
| `pnpm clean`     | Clean build artifacts               |
| `pnpm setup`     | Setup project dependencies          |
| `pnpm bump-ui`   | Update all design-system components |
| `pnpm deps:bump` | Update all dependencies             |
| `pnpm changeset` | Create a changeset                  |
| `pnpm release`   | Version packages for release        |

## Code Standards

### General

- Use TypeScript strict mode
- Prefer `const` over `let`
- Use named exports over default exports
- Keep functions small and focused

### Naming Conventions

| Type       | Convention      | Example            |
| ---------- | --------------- | ------------------ |
| Files      | kebab-case      | `user-profile.tsx` |
| Components | PascalCase      | `UserProfile`      |
| Functions  | camelCase       | `getUserById`      |
| Constants  | SCREAMING_SNAKE | `MAX_RETRIES`      |
| Types      | PascalCase      | `UserProfile`      |

### Import Order

1. External packages (React, etc.)
2. Internal packages (`@raypx/*`)
3. Local imports (relative)

```typescript
import { useState } from "react";
import { z } from "zod";

import { Button } from "@raypx/design-system";
import { auth } from "@raypx/auth";

import { LocalComponent } from "./local-component";
```

## Tech Stack

| Layer    | Technology                |
| -------- | ------------------------- |
| Frontend | React 19, TanStack Router |
| Backend  | TanStack Start (Nitro)    |
| API      | oRPC (type-safe RPC)      |
| Auth     | Better Auth               |
| Database | PostgreSQL + Drizzle ORM  |
| Styling  | Tailwind CSS v4           |
| Linting  | Biome                     |
| Monorepo | Turborepo + pnpm          |

## FAQ

### How do I run the app locally?

```bash
pnpm install
pnpm dev
```

### How do I add a new database table?

1. Create schema in `packages/database/src/schemas/pg/`
2. Run `pnpm run push` to sync with database
3. Use in code: `import { myTable } from '@raypx/database'`

### How do I add a new authenticated route?

Use the `protectedProcedure` in your oRPC router:

```typescript
import { protectedProcedure } from "../middleware";

export const protectedRouter = {
  getData: protectedProcedure.handler(async ({ context }) => {
    const userId = context.user.id;
    // ...
  }),
};
```

### How do I add an admin-only endpoint?

Use the `adminProcedure` which requires both authentication and admin role:

```typescript
import { adminProcedure } from "../middleware";

export const adminRouter = {
  adminAction: adminProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      // Only admins can access this
      const adminUser = context.user;
      // ...
    }),
};
```

### How do I debug database queries?

Open Drizzle Studio:

```bash
pnpm run db:studio
```

## Admin Features

### Admin User Management

The project includes a complete admin user management system at `/admin/users`.

**Features:**

- User list with pagination, search, and filters
- Role management (admin/user)
- User ban/unban with reason
- User statistics dashboard

**Access Control:**

- Only users with `role: "admin"` can access admin routes
- Non-admin users are redirected to dashboard
- Admin navigation link only visible to admins

**Key Files:**

```
packages/rpc/src/server/
├── transport/middleware.ts    # adminProcedure definition
└── modules/admin/router.ts   # Admin API

apps/web/src/
├── routes/(app)/admin/
│   └── users.tsx              # Admin users page
├── components/admin/
│   ├── users-table.tsx        # Users table component
│   ├── user-edit-dialog.tsx   # Edit user dialog
│   └── index.ts               # Exports
└── types/auth.ts              # Extended user type
```

**User Schema Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `role` | `string` | User role ("admin" or "user") |
| `banned` | `boolean` | Whether user is banned |
| `banReason` | `string` | Reason for ban |
| `banExpires` | `Date` | Ban expiration date |

**API Endpoints:**
| Endpoint | Input | Description |
|----------|-------|-------------|
| `users.list` | `{ page?, pageSize?, search?, role?, banned? }` | List users |
| `users.getById` | `{ id }` | Get user by ID |
| `users.update` | `{ id, role?, banned?, banReason? }` | Update user |
| `users.stats` | - | Get user statistics |

### Setting Admin Role

To set a user as admin, update the database directly:

```sql
UPDATE "user" SET role = 'admin' WHERE email = 'admin@example.com';
```

Or use Drizzle Studio:

```bash
pnpm run db:studio
```

## Key Points

- This is a Turborepo monorepo using pnpm workspaces
- Each app has its own `package.json` and dependencies
- Run commands from the root to execute across all workspaces
- Run workspace-specific commands with `pnpm run command-name`
- Turborepo handles build caching and parallel execution
- Git hooks are configured with Lefthook for pre-commit checks
