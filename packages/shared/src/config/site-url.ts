/**
 * Site URL Configuration
 * Centralized site URL management using environment variables
 */

/**
 * Get the site URL from environment variable
 * Falls back to localhost for development
 */
export const SITE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL) ||
  process.env.SITE_URL ||
  process.env.VITE_SITE_URL ||
  "http://localhost:3000";

/**
 * Get the site domain (without protocol)
 */
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, "");
