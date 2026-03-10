import { describe, expect, it, vi } from "vitest";

import { createStructuredLogger, StructuredLogger } from "../src/logger";

describe("observability logger", () => {
  it("merges default and child context while preserving the service name", () => {
    const logger = new StructuredLogger({
      serviceName: "api",
      level: "debug",
      context: { environment: "test", requestId: "req-1" },
    });

    const child = logger.child({ userId: "user-1" }) as StructuredLogger & {
      defaultContext: Record<string, unknown>;
      serviceName: string;
    };

    expect(child.serviceName).toBe("api");
    expect(child.defaultContext).toMatchObject({
      environment: "test",
      requestId: "req-1",
      userId: "user-1",
    });
  });

  it("creates env-driven loggers with level and tagged sub-loggers", () => {
    vi.stubEnv("LOG_LEVEL", "trace");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SERVICE_NAME", "worker");

    const logger = createStructuredLogger(undefined, { feature: "queue" }) as StructuredLogger & {
      logger: { level: number; withTag: (tag: string) => unknown };
      defaultContext: Record<string, unknown>;
    };

    expect(logger.defaultContext).toMatchObject({
      environment: "production",
      feature: "queue",
    });
    expect(logger.logger.level).toBe(5);
    expect(logger.withTag("jobs")).toBeDefined();
  });
});
