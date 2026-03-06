import {
  AI_EVENT_VERSION,
  type AIChatStreamEvent,
  type AIErrorCode,
  type AIUsage,
  type ChatProvider,
} from "@raypx/shared/ai";

export function statusEvent(status: "queued" | "started" | "completed"): AIChatStreamEvent {
  return {
    eventVersion: AI_EVENT_VERSION,
    type: "status",
    status,
  };
}

export function metaEvent(input: {
  requestId: string;
  provider: ChatProvider;
  model: string;
  conversationId?: string;
  messageId?: string;
}): AIChatStreamEvent {
  return {
    eventVersion: AI_EVENT_VERSION,
    type: "meta",
    requestId: input.requestId,
    provider: input.provider,
    model: input.model,
    conversationId: input.conversationId,
    messageId: input.messageId,
  };
}

export function deltaEvent(text: string): AIChatStreamEvent {
  return {
    eventVersion: AI_EVENT_VERSION,
    type: "delta",
    text,
  };
}

export function usageEvent(usage: AIUsage): AIChatStreamEvent {
  return {
    eventVersion: AI_EVENT_VERSION,
    type: "usage",
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    totalTokens: usage.totalTokens,
    costUsdCents: usage.costUsdCents,
  };
}

export function doneEvent(model: string, messageId?: string, title?: string): AIChatStreamEvent {
  return {
    eventVersion: AI_EVENT_VERSION,
    type: "done",
    model,
    messageId,
    title,
  };
}

export function errorEvent(input: { code: AIErrorCode; message: string }): AIChatStreamEvent {
  return {
    eventVersion: AI_EVENT_VERSION,
    type: "error",
    code: input.code,
    message: input.message,
  };
}
