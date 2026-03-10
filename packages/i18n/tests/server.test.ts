import { describe, expect, it } from "vitest";

import { getLocaleFromCookie, getLocaleFromHeaders } from "../src/server";

describe("i18n server helpers", () => {
  it("prefers the highest-quality supported locale from Accept-Language", () => {
    const headers = new Headers({
      "accept-language": "fr-FR;q=0.3, ja-JP;q=0.9, en-US;q=0.8",
    });

    expect(getLocaleFromHeaders(headers)).toBe("ja");
  });

  it("falls back to default locale when Accept-Language is missing", () => {
    expect(getLocaleFromHeaders(new Headers())).toBe("en");
  });

  it("reads supported locales from the locale cookie only", () => {
    expect(getLocaleFromCookie("theme=dark; locale=zh-CN; path=/")).toBe("zh-CN");
    expect(getLocaleFromCookie("locale=fr-FR")).toBeNull();
    expect(getLocaleFromCookie(null)).toBeNull();
  });
});
