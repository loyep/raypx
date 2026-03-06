export const AI_PROVIDER_DRIVERS = [
  "openai",
  "alibaba",
  "zhipu",
  "anthropic",
  "google",
  "azure-openai",
] as const;

export type AIProviderDriver = (typeof AI_PROVIDER_DRIVERS)[number];
export type ChatProvider = string;

export const AI_ERROR_CODES = [
  "AI_PROVIDER_UNAVAILABLE",
  "AI_RATE_LIMITED",
  "AI_TIMEOUT",
  "AI_BAD_REQUEST",
  "AI_INTERNAL",
] as const;
export type AIErrorCode = (typeof AI_ERROR_CODES)[number];

export const AI_ERROR_MESSAGES: Record<AIErrorCode, string> = {
  AI_PROVIDER_UNAVAILABLE: "AI provider is unavailable. Please try again later.",
  AI_RATE_LIMITED: "Rate limit reached. Please retry in a moment.",
  AI_TIMEOUT: "Request timed out. Please retry.",
  AI_BAD_REQUEST: "Invalid request. Please check your input.",
  AI_INTERNAL: "Internal AI error. Please retry later.",
};

export function getAIErrorMessage(code: AIErrorCode, fallback?: string): string {
  return AI_ERROR_MESSAGES[code] ?? fallback ?? "Unknown AI error";
}

export const AI_EVENT_VERSION = 1 as const;

export type AIUsage = {
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  costUsdCents: number | null;
};

export type AIChatStreamEvent =
  | {
      eventVersion: typeof AI_EVENT_VERSION;
      type: "status";
      status: "queued" | "started" | "completed";
    }
  | {
      eventVersion: typeof AI_EVENT_VERSION;
      type: "meta";
      requestId: string;
      provider: ChatProvider;
      model: string;
      conversationId?: string;
      messageId?: string;
    }
  | {
      eventVersion: typeof AI_EVENT_VERSION;
      type: "delta";
      text: string;
    }
  | {
      eventVersion: typeof AI_EVENT_VERSION;
      type: "usage";
      inputTokens: number | null;
      outputTokens: number | null;
      totalTokens: number | null;
      costUsdCents: number | null;
    }
  | {
      eventVersion: typeof AI_EVENT_VERSION;
      type: "done";
      model: string;
      messageId?: string;
      title?: string;
    }
  | {
      eventVersion: typeof AI_EVENT_VERSION;
      type: "error";
      code: AIErrorCode;
      message: string;
    }
  | {
      eventVersion: typeof AI_EVENT_VERSION;
      type: "tool_call";
      toolName: string;
      input: Record<string, unknown>;
    }
  | {
      eventVersion: typeof AI_EVENT_VERSION;
      type: "tool_result";
      toolName: string;
      output: Record<string, unknown>;
      error?: string | null;
    };
