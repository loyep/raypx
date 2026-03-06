import type { LinkTag } from "./types";

/**
 * Generate favicon and app icon links
 */
export function generateFaviconLinks(): LinkTag[] {
  return [
    { rel: "icon", type: "image/png", href: "/favicon.png" },
    { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
    { rel: "manifest", href: "/manifest.webmanifest" },
  ];
}

/**
 * Generate canonical URL link
 */
export function generateCanonicalLink(url: string): LinkTag {
  return { rel: "canonical", href: url };
}
