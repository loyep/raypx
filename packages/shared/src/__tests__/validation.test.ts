import { describe, expect, it } from "vitest";
import { isNotEmpty, isValidEmail, isValidUrl } from "../utils/validation";

describe("isValidEmail", () => {
  it("returns true for valid email addresses", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("user+tag@sub.domain.com")).toBe(true);
    expect(isValidEmail("test123@test.org")).toBe(true);
    expect(isValidEmail("a@b.c")).toBe(true);
  });

  it("returns false for invalid email addresses", () => {
    expect(isValidEmail("invalid")).toBe(false);
    expect(isValidEmail("missing@domain")).toBe(false);
    expect(isValidEmail("@nodomain.com")).toBe(false);
    expect(isValidEmail("spaces in@email.com")).toBe(false);
  });

  it("returns false for empty or whitespace strings", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("  ")).toBe(false);
  });
});

describe("isValidUrl", () => {
  it("returns true for valid URLs", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("http://localhost:3000")).toBe(true);
    expect(isValidUrl("ftp://files.server.com")).toBe(true);
    expect(isValidUrl("https://sub.domain.com/path?query=value")).toBe(true);
  });

  it("returns false for invalid URLs", () => {
    expect(isValidUrl("not-a-url")).toBe(false);
    expect(isValidUrl("example.com")).toBe(false);
    expect(isValidUrl("://missing-protocol.com")).toBe(false);
  });

  it("returns false for empty strings", () => {
    expect(isValidUrl("")).toBe(false);
  });
});

describe("isNotEmpty", () => {
  it("returns true for non-empty strings", () => {
    expect(isNotEmpty("hello")).toBe(true);
    expect(isNotEmpty("  hello  ")).toBe(true);
    expect(isNotEmpty("a")).toBe(true);
  });

  it("returns false for empty or whitespace-only strings", () => {
    expect(isNotEmpty("")).toBe(false);
    expect(isNotEmpty("   ")).toBe(false);
    expect(isNotEmpty("\t\n")).toBe(false);
  });
});
