import { DEFAULT_LOCALE, type Locale } from "../types";

/**
 * Get locale from browser
 */
export function getBrowserLocale(): Locale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  const browserLang = navigator.language;
  return normalizeLocale(browserLang);
}

/**
 * Store locale preference in localStorage
 */
export function storeLocale(locale: Locale): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem("locale", locale);
}

/**
 * Get stored locale preference
 */
export function getStoredLocale(): Locale | null {
  if (typeof window === "undefined") {
    return null;
  }
  const stored = localStorage.getItem("locale");
  return stored ? (stored as Locale) : null;
}

/**
 * Normalize locale string to supported locale
 */
function normalizeLocale(locale: string): Locale {
  const lower = locale.toLowerCase();
  if (lower.startsWith("zh-cn")) return "zh-CN";
  if (lower.startsWith("zh-tw") || lower.startsWith("zh-hant")) return "zh-TW";
  if (lower.startsWith("zh")) return "zh-CN";
  if (lower.startsWith("ja")) return "ja";
  if (lower.startsWith("ko")) return "ko";
  return "en";
}
