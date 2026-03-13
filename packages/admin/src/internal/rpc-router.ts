import { and, count, db, eq, ilike, or, sql } from "@raypx/database";
import {
  aiCallLogs,
  aiProfiles,
  aiProviderKeys,
  aiProviders,
  subscription,
  user,
} from "@raypx/database/schemas";
import { USER_ROLES } from "@raypx/shared";
import { z } from "zod";
import { ok } from "../api-response";

const userListInput = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  role: z.enum(USER_ROLES).optional(),
  banned: z.boolean().optional(),
});

const userGetByIdInput = z.object({
  id: z.string(),
});

const userUpdateInput = z.object({
  id: z.string(),
  role: z.enum(USER_ROLES).optional(),
  banned: z.boolean().optional(),
  banReason: z.string().optional(),
  banExpires: z.date().nullable().optional(),
});

type Procedure = {
  input: (schema: unknown) => {
    handler: (resolver: any) => unknown;
  };
  handler: (resolver: any) => unknown;
};

type CreateAdminUsersRouterProps = {
  requirePermission: (permission: string) => Procedure;
};

export function createAdminUsersRouter({ requirePermission }: CreateAdminUsersRouterProps) {
  return {
    list: requirePermission("users:read")
      .input(userListInput)
      .handler(async ({ input }: { input: any }) => {
        const { page, pageSize, search, role, banned } = input;
        const offset = (page - 1) * pageSize;

        const conditions = [];

        if (search) {
          conditions.push(or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`)));
        }

        if (role) {
          conditions.push(eq(user.role, role));
        }

        if (banned !== undefined) {
          conditions.push(eq(user.banned, banned));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const [users, totalResult] = await Promise.all([
          db
            .select()
            .from(user)
            .where(whereClause)
            .orderBy(sql`${user.createdAt} DESC`)
            .limit(pageSize)
            .offset(offset),
          db.select({ count: count() }).from(user).where(whereClause),
        ]);

        const total = totalResult[0]?.count ?? 0;
        const totalPages = Math.ceil(total / pageSize);

        return ok({
          users,
          pagination: {
            page,
            pageSize,
            total,
            totalPages,
          },
        });
      }),

    getById: requirePermission("users:read")
      .input(userGetByIdInput)
      .handler(async ({ input }: { input: any }) => {
        const result = await db.select().from(user).where(eq(user.id, input.id)).limit(1);

        return ok(result[0] ?? null);
      }),

    update: requirePermission("users:update")
      .input(userUpdateInput)
      .handler(async ({ input }: { input: any }) => {
        const { id, ...updates } = input;

        const updateData: Record<string, unknown> = {};
        if (updates.role !== undefined) updateData.role = updates.role;
        if (updates.banned !== undefined) updateData.banned = updates.banned;
        if (updates.banReason !== undefined) updateData.banReason = updates.banReason;
        if (updates.banExpires !== undefined) updateData.banExpires = updates.banExpires;

        if (Object.keys(updateData).length === 0) {
          const existing = await db.select().from(user).where(eq(user.id, id)).limit(1);
          return ok(existing[0] ?? null);
        }

        const result = await db.update(user).set(updateData).where(eq(user.id, id)).returning();

        return ok(result[0] ?? null);
      }),

    stats: requirePermission("users:read").handler(async () => {
      const [totalResult, adminResult, bannedResult, verifiedResult] = await Promise.all([
        db.select({ count: count() }).from(user),
        db
          .select({ count: count() })
          .from(user)
          .where(or(eq(user.role, "admin"), eq(user.role, "superadmin"))),
        db.select({ count: count() }).from(user).where(eq(user.banned, true)),
        db.select({ count: count() }).from(user).where(eq(user.emailVerified, true)),
      ]);

      return ok({
        total: totalResult[0]?.count ?? 0,
        admins: adminResult[0]?.count ?? 0,
        banned: bannedResult[0]?.count ?? 0,
        verified: verifiedResult[0]?.count ?? 0,
      });
    }),
  };
}

export function createAdminKeyPoolRouter({ requirePermission }: CreateAdminUsersRouterProps) {
  return {
    summary: requirePermission("users:read").handler(async () => {
      const [providers, keys] = await Promise.all([
        db.select().from(aiProviders).where(eq(aiProviders.scope, "system")),
        db.select().from(aiProviderKeys),
      ]);

      const defaultProvider = providers.find((provider) => provider.isDefault) ?? null;

      return ok({
        totalProviders: providers.length,
        configuredKeys: keys.filter((item) => item.status === "active").length,
        enabledProviders: providers.filter((provider) => provider.isEnabled).length,
        defaultProviderName: defaultProvider?.name ?? null,
      });
    }),
  };
}

export function createAdminPromptPoliciesRouter({
  requirePermission,
}: CreateAdminUsersRouterProps) {
  return {
    summary: requirePermission("users:read").handler(async () => {
      const profiles = await db.select().from(aiProfiles);

      return ok({
        totalProfiles: profiles.length,
        systemProfiles: profiles.filter((profile) => profile.scope === "system").length,
        modeProfiles: profiles.filter((profile) => profile.scope === "mode").length,
        spaceProfiles: profiles.filter((profile) => profile.scope === "space").length,
        userProfiles: profiles.filter((profile) => profile.scope === "user").length,
      });
    }),
  };
}

export function createAdminUsageOverviewRouter({ requirePermission }: CreateAdminUsersRouterProps) {
  return {
    summary: requirePermission("users:read").handler(async () => {
      const [calls, subscriptions, providers] = await Promise.all([
        db.select().from(aiCallLogs),
        db.select().from(subscription),
        db.select().from(aiProviders).where(eq(aiProviders.scope, "user")),
      ]);

      const totals = calls.reduce(
        (acc, call) => ({
          totalCalls: acc.totalCalls + 1,
          totalTokens: acc.totalTokens + (call.totalTokens ?? 0),
          totalCostUsdCents: acc.totalCostUsdCents + (call.costUsdCents ?? 0),
        }),
        {
          totalCalls: 0,
          totalTokens: 0,
          totalCostUsdCents: 0,
        },
      );

      return ok({
        ...totals,
        activeSubscriptions: subscriptions.filter(
          (item) => item.status === "active" || item.status === "trialing",
        ).length,
        userProviders: providers.length,
      });
    }),
  };
}
