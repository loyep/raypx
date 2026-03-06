import { createLogger } from "@raypx/logger";
import type { AIErrorCode, AIUsage, ChatProvider } from "@raypx/shared/ai";
import type { StreamTrace } from "../types";

const log = createLogger({ tag: "ai:chat" });

function traceMetrics(trace: StreamTrace) {
  const now = trace.finishedAt ?? Date.now();
  return {
    traceId: trace.traceId,
    requestId: trace.requestId,
    route: trace.route,
    provider: trace.provider,
    model: trace.model,
    userId: trace.userId,
    promptLength: trace.promptLength,
    ttftMs: trace.firstChunkAt ? trace.firstChunkAt - trace.startedAt : null,
    latencyMs: now - trace.startedAt,
    chunkCount: trace.chunkCount,
    charCount: trace.charCount,
    inputTokens: trace.usage.inputTokens,
    outputTokens: trace.usage.outputTokens,
    totalTokens: trace.usage.totalTokens,
    costUsdCents: trace.usage.costUsdCents,
    status: trace.status,
    errorCode: trace.errorCode,
  };
}

export function createStreamTrace(input: {
  route: string;
  provider: ChatProvider;
  model: string;
  userId: string;
  promptLength: number;
}): StreamTrace {
  return {
    traceId: crypto.randomUUID(),
    requestId: crypto.randomUUID(),
    route: input.route,
    provider: input.provider,
    model: input.model,
    userId: input.userId,
    promptLength: input.promptLength,
    startedAt: Date.now(),
    firstChunkAt: null,
    finishedAt: null,
    chunkCount: 0,
    charCount: 0,
    usage: {
      inputTokens: null,
      outputTokens: null,
      totalTokens: null,
      costUsdCents: null,
    },
    status: "success",
    errorCode: null,
  };
}

export function markFirstChunk(trace: StreamTrace) {
  if (trace.firstChunkAt === null) {
    trace.firstChunkAt = Date.now();
    log.info("chatStream first chunk", traceMetrics(trace));
  }
}

export function markChunk(trace: StreamTrace, text: string) {
  trace.chunkCount += 1;
  trace.charCount += text.length;
}

export function markSuccess(trace: StreamTrace, usage?: Partial<AIUsage>) {
  trace.finishedAt = Date.now();
  trace.status = "success";
  if (usage) {
    trace.usage = {
      inputTokens: usage.inputTokens ?? trace.usage.inputTokens,
      outputTokens: usage.outputTokens ?? trace.usage.outputTokens,
      totalTokens: usage.totalTokens ?? trace.usage.totalTokens,
      costUsdCents: usage.costUsdCents ?? trace.usage.costUsdCents,
    };
  }

  log.info("chatStream completed", traceMetrics(trace));
}

export function markError(trace: StreamTrace, errorCode: AIErrorCode, error: unknown) {
  trace.finishedAt = Date.now();
  trace.status = "error";
  trace.errorCode = errorCode;

  log.error("chatStream failed", {
    ...traceMetrics(trace),
    error,
  });
}

export function logStreamStarted(trace: StreamTrace) {
  log.info("chatStream started", traceMetrics(trace));
}
