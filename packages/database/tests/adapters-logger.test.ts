import { describe, expect, it } from "vitest";

process.env.DATABASE_URL ??= "postgres://localhost:5432/raypx_test";
process.env.DB_LOG_SQL ??= "true";
process.env.DB_LOG_PARAMS ??= "masked";

describe("database logger helpers", async () => {
  const { formatLogParams, sanitizeParams } = await import("../src/adapters");

  it("masks and truncates sensitive params", () => {
    const params = [
      "normal-value",
      "verylongvalue".repeat(30),
      {
        email: "user@example.com",
        token: "abcdef1234567890token",
        nested: { password: "super-secret-password" },
      },
    ];

    const sanitized = sanitizeParams(params);

    expect(sanitized[0]).toBe("normal-value");
    expect(String(sanitized[1]).length).toBeLessThanOrEqual(121);
    expect(sanitized[2]).toEqual({
      email: "u***@example.com",
      token: "ab***en",
      nested: { password: "su***rd" },
    });
  });

  it("supports off/masked/full param modes", () => {
    const params = ["user@example.com"];

    expect(formatLogParams(params, "off")).toBeUndefined();
    expect(formatLogParams(params, "full")).toEqual(params);
    expect(formatLogParams(params, "masked")).toEqual(["u***@example.com"]);
  });
});
