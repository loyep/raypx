import { describe, expect, it } from "vitest";

import { themeConfig, themeIcons } from "../lib/theme-config";

describe("design-system theme config", () => {
  it("defines icons for each supported theme mode", () => {
    expect(Object.keys(themeIcons)).toEqual(["light", "dark", "system"]);
    expect(themeIcons.light).toBeDefined();
    expect(themeIcons.dark).toBeDefined();
    expect(themeIcons.system).toBeDefined();
  });

  it("keeps theme config aligned with icon mapping", () => {
    expect(themeConfig.map((item) => item.value)).toEqual(["light", "dark", "system"]);
    expect(themeConfig.map((item) => item.label)).toEqual(["Light", "Dark", "System"]);
    expect(themeConfig[0]?.icon).toBe(themeIcons.light);
    expect(themeConfig[1]?.icon).toBe(themeIcons.dark);
    expect(themeConfig[2]?.icon).toBe(themeIcons.system);
  });
});
