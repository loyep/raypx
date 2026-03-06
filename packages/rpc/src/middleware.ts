import { ORPCError, os } from "@orpc/server";

import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

/**
 * Authentication middleware that requires a valid session
 * Throws UNAUTHORIZED error if no session exists
 */
const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Authentication required",
    });
  }
  return next({
    context: {
      session: context.session,
      user: context.session.user,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);

/**
 * Optional auth middleware - session is available but not required
 */
const optionalAuth = o.middleware(async ({ context, next }) => {
  return next({
    context: {
      session: context.session ?? null,
      user: context.session?.user ?? null,
    },
  });
});

export const optionalAuthProcedure = publicProcedure.use(optionalAuth);
