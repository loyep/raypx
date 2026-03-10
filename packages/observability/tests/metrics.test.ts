import { describe, expect, it, vi } from "vitest";

import { createMetrics, MetricsManager, ObservabilityError, startTimer } from "../src";

describe("observability metrics", () => {
  it("returns the wrapped result when no tracer is initialized", async () => {
    const metrics = new MetricsManager({
      serviceName: "api",
      enabled: false,
    });

    await expect(metrics.withSpan({ name: "load-user" }, async () => "ok")).resolves.toBe("ok");
  });

  it("normalizes env configuration in createMetrics", () => {
    vi.stubEnv("SERVICE_NAME", "worker");
    vi.stubEnv("OTLP_ENDPOINT", "https://otel.example.com");
    vi.stubEnv("OTEL_ENABLED", "true");

    const metrics = createMetrics() as MetricsManager & {
      config: { serviceName: string; otlpEndpoint?: string; enabled?: boolean };
    };

    expect(metrics.config).toEqual({
      serviceName: "worker",
      otlpEndpoint: "https://otel.example.com",
      enabled: true,
    });
  });

  it("records timer durations through the provided logger", () => {
    const debug = vi.fn();
    const timer = startTimer("db-query");

    const elapsed = timer.end({ debug });

    expect(elapsed).toBeGreaterThanOrEqual(0);
    expect(debug).toHaveBeenCalledWith("Timer: db-query", {
      durationMs: expect.any(Number),
    });
  });

  it("preserves custom error type details", () => {
    const error = new ObservabilityError("INITIALIZATION_FAILED", "boom");

    expect(error.name).toBe("ObservabilityError");
    expect(error.type).toBe("INITIALIZATION_FAILED");
    expect(error.message).toBe("boom");
  });
});
