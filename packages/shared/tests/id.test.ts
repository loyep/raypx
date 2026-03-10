import { describe, expect, it } from "vitest";
import { generateLongId, generateShortId, nanoid } from "../src/utils/id";

describe("nanoid", () => {
  it("generates a 16-character ID by default", () => {
    const id = nanoid();
    expect(id.length).toBe(16);
  });

  it("generates unique IDs", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      ids.add(nanoid());
    }
    expect(ids.size).toBe(1000);
  });

  it("only uses safe alphabet characters", () => {
    const safeAlphabet = "6789BCDFGHJKLMNPQRTWbcdfghjkmnpqrtwz";
    const id = nanoid();
    for (const char of id) {
      expect(safeAlphabet.includes(char)).toBe(true);
    }
  });
});

describe("generateLongId", () => {
  it("generates a 32-character ID by default", () => {
    const id = generateLongId();
    expect(id.length).toBe(32);
  });

  it("generates ID with custom length", () => {
    const id = generateLongId(64);
    expect(id.length).toBe(64);
  });

  it("generates unique IDs", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateLongId());
    }
    expect(ids.size).toBe(100);
  });

  it("only uses safe alphabet characters", () => {
    const safeAlphabet = "6789BCDFGHJKLMNPQRTWbcdfghjkmnpqrtwz";
    const id = generateLongId();
    for (const char of id) {
      expect(safeAlphabet.includes(char)).toBe(true);
    }
  });
});

describe("generateShortId", () => {
  it("generates an 8-character ID by default", () => {
    const id = generateShortId();
    expect(id.length).toBe(8);
  });

  it("generates ID with custom length", () => {
    const id = generateShortId(4);
    expect(id.length).toBe(4);
  });

  it("generates unique IDs", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      ids.add(generateShortId());
    }
    expect(ids.size).toBe(1000);
  });

  it("only uses safe alphabet characters", () => {
    const safeAlphabet = "6789BCDFGHJKLMNPQRTWbcdfghjkmnpqrtwz";
    const id = generateShortId();
    for (const char of id) {
      expect(safeAlphabet.includes(char)).toBe(true);
    }
  });
});
