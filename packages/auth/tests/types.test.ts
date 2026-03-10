import { describe, expect, it } from "vitest";
import { AuthError } from "../src/types";

describe("AuthError", () => {
  it("preserves type, message, and class name", () => {
    const error = new AuthError("UNAUTHORIZED", "login required");

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("AuthError");
    expect(error.type).toBe("UNAUTHORIZED");
    expect(error.message).toBe("login required");
  });
});
