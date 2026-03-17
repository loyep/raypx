import { ORPCError } from "@orpc/server";
import {
  type AIServiceContext,
  AIServiceError,
  chatService,
  toAIServiceError,
} from "@raypx/ai/server";
import type { AIErrorCode } from "@raypx/shared/ai";

function toORPCStatus(code: AIErrorCode) {
  switch (code) {
    case "AI_BAD_REQUEST":
      return "BAD_REQUEST" as const;
    case "AI_TIMEOUT":
      return "TIMEOUT" as const;
    case "AI_RATE_LIMITED":
      return "TOO_MANY_REQUESTS" as const;
    case "AI_PROVIDER_UNAVAILABLE":
    case "AI_INTERNAL":
      return "INTERNAL_SERVER_ERROR" as const;
  }
}

function toORPCError(error: unknown) {
  if (error instanceof ORPCError) {
    return error;
  }

  const normalized = error instanceof AIServiceError ? error : toAIServiceError(error);

  return new ORPCError(toORPCStatus(normalized.code), {
    message: normalized.message,
  });
}

function createServiceContext(context: {
  db: AIServiceContext["db"];
  session: { user: { id: string } };
}) {
  return {
    db: context.db,
    userId: context.session.user.id,
  };
}

async function withAIErrorHandling<T>(executor: () => Promise<T>): Promise<T> {
  try {
    return await executor();
  } catch (error) {
    throw toORPCError(error);
  }
}

export const aiFacade = {
  withAIErrorHandling,
  createServiceContext,
  chatService,
};
