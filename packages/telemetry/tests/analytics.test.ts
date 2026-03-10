import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Analytics, getAnalytics } from "../src/analytics";

describe("telemetry analytics", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("tracks page views, actions, and api metrics with timestamps", () => {
    const analytics = new Analytics() as Analytics & {
      events: Array<{ name: string; timestamp: Date }>;
      metrics: Array<{ name: string; timestamp: Date; tags?: Record<string, string> }>;
    };

    analytics.pageView("/docs", { source: "nav" });
    analytics.action("clicked-cta");
    analytics.apiCall("/api/health", 42, 200);

    expect(analytics.events).toHaveLength(2);
    expect(analytics.events[0]?.name).toBe("page_view");
    expect(analytics.events[0]?.timestamp).toBeInstanceOf(Date);
    expect(analytics.events[1]?.name).toBe("user_action");

    expect(analytics.metrics).toHaveLength(1);
    expect(analytics.metrics[0]?.name).toBe("api_call_duration");
    expect(analytics.metrics[0]?.tags).toEqual({
      endpoint: "/api/health",
      status: "200",
    });
  });

  it("returns a stable singleton instance", () => {
    expect(getAnalytics()).toBe(getAnalytics());
  });

  it("starts a periodic flush when window is available", () => {
    vi.stubGlobal("window", {});

    const analytics = new Analytics() as Analytics & {
      flushInterval: ReturnType<typeof setInterval> | null;
    };

    expect(analytics.flushInterval).not.toBeNull();

    analytics.destroy();
  });
});
