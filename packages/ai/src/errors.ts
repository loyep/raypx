import type { AIErrorCode } from "@raypx/shared/ai";

export class AIServiceError extends Error {
  readonly code: AIErrorCode;

  constructor(code: AIErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "AIServiceError";
  }
}

export function createAIServiceError(code: AIErrorCode, message: string): AIServiceError {
  return new AIServiceError(code, message);
}

function normalizeErrorMessage(input: unknown): string {
  if (input instanceof Error && input.message) {
    return input.message;
  }
  if (
    typeof input === "object" &&
    input !== null &&
    "message" in input &&
    typeof (input as { message?: unknown }).message === "string" &&
    (input as { message: string }).message.trim().length > 0
  ) {
    return (input as { message: string }).message;
  }
  if (typeof input === "string" && input.trim().length > 0) {
    return input;
  }
  return "Unknown AI error";
}

function inferCodeFromStatus(status: number): AIErrorCode {
  if (status === 400 || status === 404 || status === 422) {
    return "AI_BAD_REQUEST";
  }
  if (status === 408 || status === 504) {
    return "AI_TIMEOUT";
  }
  if (status === 429) {
    return "AI_RATE_LIMITED";
  }
  if (status === 401 || status === 403 || status >= 500) {
    return "AI_PROVIDER_UNAVAILABLE";
  }
  return "AI_INTERNAL";
}

export function toAIServiceError(input: unknown): AIServiceError {
  if (input instanceof AIServiceError) {
    return input;
  }

  const candidate = input as
    | {
        status?: number;
        statusCode?: number;
        code?: string | number;
        message?: string;
      }
    | undefined;

  const status = candidate?.status ?? candidate?.statusCode;
  if (typeof status === "number" && Number.isFinite(status)) {
    return new AIServiceError(inferCodeFromStatus(status), normalizeErrorMessage(input));
  }

  if (input instanceof Error) {
    const msg = input.message.toLowerCase();
    if (msg.includes("rate limit") || msg.includes("quota") || msg.includes("429")) {
      return new AIServiceError("AI_RATE_LIMITED", input.message);
    }
    if (msg.includes("timeout") || msg.includes("timed out") || msg.includes("408")) {
      return new AIServiceError("AI_TIMEOUT", input.message);
    }
    if (msg.includes("invalid") || msg.includes("bad request") || msg.includes("400")) {
      return new AIServiceError("AI_BAD_REQUEST", input.message);
    }
    if (
      msg.includes("provider unavailable") ||
      msg.includes("service unavailable") ||
      msg.includes("503")
    ) {
      return new AIServiceError("AI_PROVIDER_UNAVAILABLE", input.message);
    }
    return new AIServiceError("AI_INTERNAL", input.message);
  }

  return new AIServiceError("AI_INTERNAL", normalizeErrorMessage(input));
}
