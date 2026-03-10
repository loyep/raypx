import { createConsola } from "consola";
import { afterEach, describe, expect, it } from "vitest";
import { createLogger, getLogger, logger, setLogger, withTag } from "../src/logger";

const originalLogger = getLogger();

afterEach(() => {
  setLogger(originalLogger);
});

describe("core logger", () => {
  it("creates tagged loggers with the requested level", () => {
    const taggedLogger = createLogger({ level: "trace", tag: "core" });

    expect(taggedLogger.level).toBe(5);
  });

  it("proxies the active logger instance", () => {
    const customLogger = createConsola({ level: 2 });

    setLogger(customLogger);

    expect(getLogger()).toBe(customLogger);
    expect(logger.level).toBe(2);
    expect(withTag("rpc")).toBeDefined();
  });
});
