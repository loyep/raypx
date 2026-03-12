import { ORPCError, os } from "@orpc/server";
import { hasPermission, type Permission } from "../rbac/permissions";
import type { Context } from "./context";
import { publicProcedure } from "./context";

export { publicProcedure } from "./context";

export const o = os.$context<Context>();

export const requireAuthMiddleware = o.middleware(async ({ context, next }) => {
  if (!context.session) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Authentication required",
    });
  }
  return next({
    context: {
      db: context.db,
      requestId: context.requestId,
      session: context.session,
      traceId: context.traceId,
      user: context.session.user,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireAuthMiddleware);

export const optionalAuthMiddleware = o.middleware(async ({ context, next }) => {
  return next({
    context: {
      db: context.db,
      requestId: context.requestId,
      session: context.session ?? null,
      traceId: context.traceId,
      user: context.session?.user ?? null,
    },
  });
});

export const optionalAuthProcedure = publicProcedure.use(optionalAuthMiddleware);

export const requireRoleMiddleware = (roles: readonly string[]) =>
  o.middleware(async ({ context, next }) => {
    if (!context.session) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "Authentication required",
      });
    }

    if (!roles.includes(context.session.user.role ?? "user")) {
      throw new ORPCError("FORBIDDEN", {
        message: "Insufficient role",
      });
    }

    return next({
      context: {
        db: context.db,
        requestId: context.requestId,
        session: context.session,
        traceId: context.traceId,
        user: context.session.user,
      },
    });
  });

export const requirePermissionMiddleware = (permission: Permission) =>
  o.middleware(async ({ context, next }) => {
    if (!context.session) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "Authentication required",
      });
    }

    const granted = hasPermission(context.session.user.role, permission);

    if (!granted) {
      throw new ORPCError("FORBIDDEN", {
        message: `Missing required permission: ${permission}`,
      });
    }

    return next({
      context: {
        db: context.db,
        requestId: context.requestId,
        session: context.session,
        traceId: context.traceId,
        user: context.session.user,
      },
    });
  });

export const requireRole = (...roles: string[]) =>
  publicProcedure.use(requireRoleMiddleware(roles));

export const requirePermission = (permission: Permission) =>
  publicProcedure.use(requirePermissionMiddleware(permission));

export const adminProcedure = requireRole("admin", "superadmin");
