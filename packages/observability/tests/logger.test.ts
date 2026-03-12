import { afterEach, describe, expect, it, vi } from "vitest";

import { createStructuredLogger, StructuredLogger } from "../src/logger";
import type { LoggerPort } from "@raypx/core/logger";

afterEach(() => {
  vi.unstubAllEnvs();
});

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

  it("emits structured payloads instead of stringified context", () => {
    const info = vi.fn();
    const stubLogger: LoggerPort = {
      level: 3,
      trace: vi.fn(),
      debug: vi.fn(),
      info,
      warn: vi.fn(),
      error: vi.fn(),
      success: vi.fn(),
      log: vi.fn(),
      withTag: vi.fn(),
    };

    const logger = new StructuredLogger({
      serviceName: "api",
      context: { environment: "test" },
    }) as StructuredLogger & { logger: LoggerPort };

    logger.logger = stubLogger;

    logger.info("request completed", { requestId: "req-1", statusCode: 200 });

    expect(info).toHaveBeenCalledWith(
      {
        environment: "test",
        requestId: "req-1",
        service: "api",
        statusCode: 200,
      },
      "request completed",
    );
  });
});
