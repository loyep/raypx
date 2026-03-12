import { describe, expect, it } from "vitest";
import {
  getRequestTraceLogContext,
  resolveRequestTrace,
  withTraceHeaders,
} from "@raypx/core/logger";

describe("request tracing", () => {
  it("reuses incoming request and trace identifiers", () => {
    const request = new Request("https://example.com/api/rpc", {
      headers: {
        "x-request-id": "req-123",
        traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
      },
    });

    expect(resolveRequestTrace(request)).toEqual({
      requestId: "req-123",
      traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
    });
  });

  it("defaults traceId to requestId when no upstream trace exists", () => {
    const request = new Request("https://example.com/api/rpc", {
      headers: {
        "x-request-id": "req-123",
      },
    });

    expect(resolveRequestTrace(request)).toEqual({
      requestId: "req-123",
      traceId: "req-123",
    });
  });

  it("adds trace headers to responses", () => {
    const response = withTraceHeaders(new Response("ok"), {
      requestId: "req-123",
      traceId: "trace-123",
    });

    expect(response.headers.get("x-request-id")).toBe("req-123");
    expect(response.headers.get("x-trace-id")).toBe("trace-123");
  });

  it("builds logger context from a request", () => {
    const request = new Request("https://example.com/api/rpc", {
      method: "POST",
    });

    expect(
      getRequestTraceLogContext(request, {
        requestId: "req-123",
        traceId: "req-123",
      }),
    ).toEqual({
      method: "POST",
      path: "/api/rpc",
      requestId: "req-123",
      traceId: "req-123",
    });
  });
});
