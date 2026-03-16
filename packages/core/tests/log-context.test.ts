import { describe, expect, it } from "vitest";
import { getLogContext, runWithLogContext } from "../src/log-context";

describe("log context", () => {
  it("runWithLogContext executes the callback", async () => {
    const result = await runWithLogContext({ requestId: "req-1", traceId: "req-1" }, async () => {
      await Promise.resolve();
      return "done";
    });
    expect(result).toBe("done");
  });

  it("getLogContext always returns empty object (no async_hooks)", () => {
    runWithLogContext({ requestId: "req-1" }, () => {
      runWithLogContext({ userId: "user-1" }, () => {
        expect(getLogContext()).toEqual({});
      });
    });
  });
});
