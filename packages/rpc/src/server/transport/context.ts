import { ORPCError, os } from "@orpc/server";
import { getRpcSessionFromRequest } from "@raypx/auth/rpc";
import type { AuthSession as Session, AuthUser as User } from "@raypx/auth/types";
import { type RequestTraceContext, resolveRequestTrace } from "@raypx/core/logger";
import { db } from "@raypx/database";
import { createORPCContext } from "./orpc-context";
import { createRPCContext, type RPCContext } from "./rpc-context";

const DEFAULT_TIMEOUT_MS = 30_000;

const timeoutMiddleware = (ms: number = DEFAULT_TIMEOUT_MS) => {
  return os.middleware(async ({ next }) => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(
          new ORPCError("INTERNAL", {
            message: `Request timeout after ${ms}ms`,
          }),
        );
      }, ms);
    });

    try {
      const result = await Promise.race([next(), timeoutPromise]);
      return result;
    } finally {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    }
  });
};

export interface SessionContext {
  session: Session;
  user: User & {
    role?: string | null;
    banned?: boolean | null;
    banReason?: string | null;
    banExpires?: Date | null;
  };
}

export type Context = RPCContext<SessionContext, typeof db>;

export async function createContext({
  req,
  trace = resolveRequestTrace(req),
}: {
  req: Request;
  trace?: RequestTraceContext;
}) {
  return createRPCContext({
    req,
    db,
    getSession: getRpcSessionFromRequest,
    requestId: trace.requestId,
    traceId: trace.traceId,
  });
}

export const publicProcedure = createORPCContext<Context>().use(timeoutMiddleware());
