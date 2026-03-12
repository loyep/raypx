import { describe, expect, it } from "vitest";
import { getLogContext, runWithLogContext } from "../src/log-context";

describe("log context", () => {
  it("keeps context across async boundaries", async () => {
    await runWithLogContext({ requestId: "req-1", traceId: "req-1" }, async () => {
      await Promise.resolve();

      expect(getLogContext()).toMatchObject({
        requestId: "req-1",
        traceId: "req-1",
      });
    });
  });

  it("merges nested contexts", () => {
    runWithLogContext({ requestId: "req-1" }, () => {
      runWithLogContext({ userId: "user-1" }, () => {
        expect(getLogContext()).toMatchObject({
          requestId: "req-1",
          userId: "user-1",
        });
      });
    });
  });
});
