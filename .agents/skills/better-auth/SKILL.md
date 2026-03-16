---
name: better-auth
description: |
  Better Auth integration guidance. Use for: authentication setup, session
  management, OAuth providers, email verification, password reset, hooks,
  plugins, and client integration.
---

# Better Auth Skill

Better Auth is a TypeScript-first, framework-agnostic authentication library.

**Always consult [better-auth.com/docs](https://better-auth.com/docs) for the latest API.**

## Quick Reference

### Environment Variables

```bash
BETTER_AUTH_SECRET=your-secret-min-32-chars  # Generate: openssl rand -base64 32
AUTH_URL=https://your-domain.com
```

### CLI Commands

```bash
npx @better-auth/cli migrate   # Apply schema (built-in adapter)
npx @better-auth/cli generate  # Generate schema for Drizzle/Prisma
```

**Re-run CLI after adding/changing plugins.**

## Core Configuration

```typescript
// packages/auth/src/index.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    // Add plugins here
  ],
});
```

## Client Setup

```typescript
// apps/web/src/lib/auth.ts
export { authClient, getSession, signIn, signOut, signUp, useSession } from "@raypx/auth";
```

## Usage Examples

### Sign Up

```typescript
await authClient.signUp.email({
  email: "user@example.com",
  password: "password123",
  name: "User Name",
});
```

### Sign In

```typescript
await authClient.signIn.email({
  email: "user@example.com",
  password: "password123",
});
```

### OAuth

```typescript
await authClient.signIn.social({
  provider: "google",
  callbackURL: "/dashboard",
});
```

### Sign Out

```typescript
await authClient.signOut();
```

### Get Session

```typescript
const { data: session } = authClient.useSession();
// or
const session = await authClient.getSession();
```

## Session Management

**Storage priority:**

1. If `secondaryStorage` defined → sessions go there (Redis/KV)
2. Set `session.storeSessionInDatabase: true` to also persist to DB

**Key options:**

- `session.expiresIn` - Default 7 days
- `session.updateAge` - Refresh interval
- `session.cookieCache.maxAge` - Cookie cache duration

## Hooks

```typescript
export const auth = betterAuth({
  hooks: {
    after: [
      {
        matcher: (ctx) => ctx.path === "/sign-in/email",
        handler: async (ctx) => {
          // Post sign-in logic
        },
      },
    ],
  },
});
```

## Database Hooks

```typescript
export const auth = betterAuth({
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Modify user before creation
          return { ...user, role: "user" };
        },
      },
    },
  },
});
```

## Popular Plugins

```typescript
import { twoFactor } from "better-auth/plugins/two-factor";
import { organization } from "better-auth/plugins/organization";
import { passkey } from "better-auth/plugins/passkey";
import { magicLink } from "better-auth/plugins/magic-link";
```

## Type Safety

```typescript
// Infer session type
type Session = typeof auth.$Infer.Session;

// For client with server types
export const authClient = createAuthClient<typeof auth>({
  baseURL: "...",
});
```

## Common Gotchas

1. **Model vs table name** - Config uses ORM model name, not DB table name
2. **Plugin schema** - Re-run CLI after adding plugins
3. **Secondary storage** - Sessions go there by default, not DB
4. **Cookie cache** - Custom session fields NOT cached, always re-fetched
