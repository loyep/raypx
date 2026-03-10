import { afterEach, describe, expect, it, vi } from "vitest";

import { getBrowserLocale, getStoredLocale, storeLocale } from "../src/client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("i18n client helpers", () => {
  it("falls back to default locale when window is unavailable", () => {
    expect(getBrowserLocale()).toBe("en");
    expect(getStoredLocale()).toBeNull();
  });

  it("normalizes browser locales to supported locales", () => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("navigator", { language: "zh-Hant-HK" });

    expect(getBrowserLocale()).toBe("zh-TW");
  });

  it("stores and reads locale preference from localStorage", () => {
    const store = new Map<string, string>();
    const localStorage = {
      getItem: vi.fn((key: string) => store.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store.set(key, value);
      }),
    };

    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", localStorage);

    storeLocale("ja");

    expect(localStorage.setItem).toHaveBeenCalledWith("locale", "ja");
    expect(getStoredLocale()).toBe("ja");
  });
});
