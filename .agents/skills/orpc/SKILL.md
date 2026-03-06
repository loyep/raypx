---
name: orpc
description: |
  oRPC type-safe API guidance. Use for: creating routers, defining procedures,
  middleware, error handling, client integration, and type safety.
---

# oRPC Skill

oRPC is a type-safe RPC framework for TypeScript. It provides end-to-end type safety between server and client.

## Core Concepts

### Defining Procedures

```typescript
// packages/rpc/src/routers/user.ts
import { o } from "../orpc"
import { z } from "zod"

export const userRouter = {
  // Query (read operation)
  getById: o
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string(), name: z.string(), email: z.string() }))
    .handler(async ({ input }) => {
      const user = await db.user.findUnique({ where: { id: input.id } })
      if (!user) throw new Error("User not found")
      return user
    }),

  // Mutation (write operation)
  create: o
    .input(z.object({ name: z.string(), email: z.string().email() }))
    .handler(async ({ input }) => {
      return db.user.create({ data: input })
    }),
}
```

### Router Composition

```typescript
// packages/rpc/src/index.ts
import { userRouter } from "./routers/user"
import { postRouter } from "./routers/post"

export const appRouter = {
  user: userRouter,
  post: postRouter,
}

export type AppRouter = typeof appRouter
```

## Middleware

### Authentication Middleware

```typescript
// packages/rpc/src/middleware/auth.ts
import { o } from "../orpc"

export const authMiddleware = o.middleware(async ({ context, next }) => {
  const session = await getSession(context.request)

  if (!session) {
    throw new Error("Unauthorized")
  }

  return next({
    context: {
      ...context,
      session,
    },
  })
})
```

### Using Middleware

```typescript
export const protectedRouter = {
  getProfile: o
    .use(authMiddleware)
    .handler(async ({ context }) => {
      return context.session.user
    }),
}
```

### Chaining Middleware

```typescript
export const adminRouter = {
  deleteUser: o
    .use(authMiddleware)
    .use(adminMiddleware)
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      await db.user.delete({ where: { id: input.id } })
    }),
}
```

## Error Handling

### Custom Errors

```typescript
class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "NotFoundError"
  }
}

export const userRouter = {
  getById: o
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const user = await db.user.findUnique({ where: { id: input.id } })
      if (!user) {
        throw new NotFoundError("User not found")
      }
      return user
    }),
}
```

### Error Formatting

```typescript
// In your server setup
app.use("/api/rpc", (req, res) => {
  return handleRPC(req, res, appRouter, {
    onError: (error) => {
      console.error("RPC Error:", error)
    },
  })
})
```

## Client Integration

### Creating Client

```typescript
// apps/web/src/utils/orpc.ts
import { createORPCClient } from "@orpc/client"
import type { AppRouter } from "@raypx/rpc"

export const orpc = createORPCClient<AppRouter>({
  baseUrl: "/api/rpc",
})
```

### Usage in Components

```typescript
import { orpc } from "@/utils/orpc"

function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => orpc.user.getById({ id: userId }),
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>{data.name}</div>
}
```

### With TanStack Query

```typescript
import { orpc } from "@/utils/orpc"

// Query
const { data } = useQuery({
  queryKey: ["users"],
  queryFn: () => orpc.user.list({}),
})

// Mutation
const mutation = useMutation({
  mutationFn: orpc.user.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["users"] })
  },
})
```

## Type Safety

### Infer Types

```typescript
import type { AppRouter } from "@raypx/rpc"
import type { inferProcedureInput, inferProcedureOutput } from "@orpc/server"

// Infer input type
type CreateUserInput = inferProcedureInput<AppRouter["user"]["create"]>
// { name: string, email: string }

// Infer output type
type User = inferProcedureOutput<AppRouter["user"]["getById"]>
// { id: string, name: string, email: string }
```

### Shared Types

```typescript
// packages/rpc/src/types.ts
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.date(),
})

export type User = z.infer<typeof userSchema>
```

## Best Practices

1. **Use `.input()` for validation** - Always validate with Zod
2. **Use `.output()` for documentation** - Makes return types explicit
3. **Group related procedures** - Use nested routers
4. **Handle errors properly** - Throw meaningful errors
5. **Use middleware for cross-cutting concerns** - Auth, logging, etc.

## Common Patterns

### Pagination

```typescript
const listWithPagination = o
  .input(z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
  }))
  .output(z.object({
    items: z.array(itemSchema),
    total: z.number(),
    hasMore: z.boolean(),
  }))
  .handler(async ({ input }) => {
    const skip = (input.page - 1) * input.limit
    const [items, total] = await Promise.all([
      db.item.findMany({ skip, take: input.limit }),
      db.item.count(),
    ])
    return {
      items,
      total,
      hasMore: skip + items.length < total,
    }
  })
```

### Filtering

```typescript
const searchItems = o
  .input(z.object({
    query: z.string().optional(),
    status: z.enum(["active", "inactive"]).optional(),
    sortBy: z.enum(["name", "createdAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }))
  .handler(async ({ input }) => {
    return db.item.findMany({
      where: {
        ...(input.query && { name: { contains: input.query } }),
        ...(input.status && { status: input.status }),
      },
      orderBy: { [input.sortBy]: input.sortOrder },
    })
  })
```
