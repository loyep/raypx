import { AI_EVENT_VERSION } from "@raypx/shared/ai";
import { describe, expect, it } from "vitest";
import {
  deltaEvent,
  doneEvent,
  errorEvent,
  metaEvent,
  statusEvent,
  usageEvent,
} from "../../src/stream";

describe("stream event builders", () => {
  it("builds versioned events with expected types", () => {
    const events = [
      statusEvent("queued"),
      statusEvent("started"),
      metaEvent({
        requestId: "req-1",
        provider: "qwen",
        model: "qwen/qwen3.5-plus",
        conversationId: "conv-1",
      }),
      deltaEvent("hello"),
      usageEvent({
        inputTokens: 10,
        outputTokens: 20,
        totalTokens: 30,
        costUsdCents: 1,
      }),
      doneEvent("qwen/qwen3.5-plus", "msg-1"),
    ];

    for (const event of events) {
      expect(event.eventVersion).toBe(AI_EVENT_VERSION);
    }

    expect(events.map((event) => event.type)).toEqual([
      "status",
      "status",
      "meta",
      "delta",
      "usage",
      "done",
    ]);
  });

  it("builds standardized error event", () => {
    const event = errorEvent({
      code: "AI_RATE_LIMITED",
      message: "rate limit hit",
    });

    expect(event).toEqual({
      eventVersion: AI_EVENT_VERSION,
      type: "error",
      code: "AI_RATE_LIMITED",
      message: "rate limit hit",
    });
  });
});
