import { describe, expect, it } from "vitest";

import { capitalize, cn } from "../lib/utils";

describe("design-system utils", () => {
  it("merges class names with tailwind precedence", () => {
    expect(cn("px-2", false && "hidden", "px-4", "font-medium")).toBe("px-4 font-medium");
  });

  it("capitalizes strings without altering the remaining characters", () => {
    expect(capitalize("raypx")).toBe("Raypx");
    expect(capitalize("rAYPX")).toBe("RAYPX");
    expect(capitalize("")).toBe("");
  });
});
