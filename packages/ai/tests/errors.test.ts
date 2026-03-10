import { describe, expect, it } from "vitest";
import { AIServiceError, toAIServiceError } from "../src/errors";

describe("toAIServiceError", () => {
  it("returns AIServiceError input directly", () => {
    const original = new AIServiceError("AI_TIMEOUT", "timeout");
    expect(toAIServiceError(original)).toBe(original);
  });

  it("maps status/statusCode to expected AI error code", () => {
    expect(toAIServiceError({ status: 429, message: "rate limit" }).code).toBe("AI_RATE_LIMITED");
    expect(toAIServiceError({ statusCode: 408, message: "timeout" }).code).toBe("AI_TIMEOUT");
    expect(toAIServiceError({ status: 400, message: "bad request" }).code).toBe("AI_BAD_REQUEST");
    expect(toAIServiceError({ status: 503, message: "service unavailable" }).code).toBe(
      "AI_PROVIDER_UNAVAILABLE",
    );
  });

  it("maps message keywords when status is unavailable", () => {
    expect(toAIServiceError(new Error("quota exceeded")).code).toBe("AI_RATE_LIMITED");
    expect(toAIServiceError(new Error("request timed out")).code).toBe("AI_TIMEOUT");
    expect(toAIServiceError(new Error("bad request payload")).code).toBe("AI_BAD_REQUEST");
    expect(toAIServiceError(new Error("service unavailable now")).code).toBe(
      "AI_PROVIDER_UNAVAILABLE",
    );
  });

  it("falls back to AI_INTERNAL with normalized message", () => {
    expect(toAIServiceError(123).code).toBe("AI_INTERNAL");
    expect(toAIServiceError("raw error").message).toBe("raw error");
  });
});
