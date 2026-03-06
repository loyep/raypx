import { DEFAULT_LOCALE, type Locale, SUPPORTED_LOCALES } from "../types";

/**
 * Get locale from request headers
 */
export function getLocaleFromHeaders(headers: Headers): Locale {
  const acceptLanguage = headers.get("accept-language");
  if (!acceptLanguage) {
    return DEFAULT_LOCALE;
  }

  return parseAcceptLanguage(acceptLanguage);
}

/**
 * Get locale from cookie
 */
export function getLocaleFromCookie(cookieHeader: string | null): Locale | null {
  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader.match(/locale=([^;]+)/);
  if (!match) {
    return null;
  }

  const locale = match[1] as Locale;
  return SUPPORTED_LOCALES.includes(locale) ? locale : null;
}

/**
 * Parse Accept-Language header
 */
function parseAcceptLanguage(header: string): Locale {
  const languages = header.split(",").map((lang) => {
    const parts = lang.trim().split(";q=");
    const locale = parts[0]?.trim() ?? "";
    const q = parts[1] ?? "1";
    return {
      locale,
      quality: Number.parseFloat(q) || 0,
    };
  });

  languages.sort((a, b) => b.quality - a.quality);

  for (const { locale } of languages) {
    const normalized = normalizeLocale(locale);
    if (SUPPORTED_LOCALES.includes(normalized)) {
      return normalized;
    }
  }

  return DEFAULT_LOCALE;
}

/**
 * Normalize locale string
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
