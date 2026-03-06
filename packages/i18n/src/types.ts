/**
 * Supported locales
 */
export type Locale = "en" | "zh-CN" | "zh-TW" | "ja" | "ko";

/**
 * Default locale
 */
export const DEFAULT_LOCALE: Locale = "en";

/**
 * All supported locales
 */
export const SUPPORTED_LOCALES: Locale[] = ["en", "zh-CN", "zh-TW", "ja", "ko"];

/**
 * Translation key type (to be extended)
 */
export type TranslationKey = string;

/**
 * Translation values for interpolation
 */
export type TranslationValues = Record<string, string | number>;
