import type { MetaTags, SiteConfig } from "./types";

/**
 * Generate standard SEO meta tags
 */
export function generateSeoMeta(config: SiteConfig): MetaTags[] {
  return [
    { charSet: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { name: "description", content: config.description },
    { name: "keywords", content: config.keywords.join(", ") },
    { name: "author", content: config.author },
  ];
}

/**
 * Generate Open Graph meta tags for social media sharing
 */
export function generateOpenGraphMeta(config: SiteConfig): MetaTags[] {
  const tags: MetaTags[] = [
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: config.name },
    { property: "og:title", content: config.title },
    { property: "og:description", content: config.description },
    { property: "og:url", content: config.url },
    { property: "og:image", content: `${config.url}${config.image}` },
  ];

  if (config.twitter) {
    tags.push({ property: "og:article:author", content: config.twitter });
  }

  return tags;
}

/**
 * Generate Twitter Card meta tags
 */
export function generateTwitterCardMeta(
  config: SiteConfig,
  cardType: "summary" | "summary_large_image" | "app" | "player" = "summary_large_image",
): MetaTags[] {
  return [
    { name: "twitter:card", content: cardType },
    { name: "twitter:title", content: config.title },
    { name: "twitter:description", content: config.description },
    { name: "twitter:image", content: `${config.url}${config.image}` },
    ...(config.twitter ? [{ name: "twitter:site", content: config.twitter } as MetaTags] : []),
  ];
}

/**
 * Generate theme meta tags
 */
export function generateThemeMeta(
  themeColor = "#ffffff",
  colorScheme: "light" | "dark" | "light dark" = "light dark",
): MetaTags[] {
  return [
    { name: "theme-color", content: themeColor },
    { name: "color-scheme", content: colorScheme },
  ];
}

/**
 * Generate article-specific meta tags
 */
export function generateArticleMeta(options: {
  publishedTime?: string | Date;
  modifiedTime?: string | Date;
  author?: string;
  section?: string;
  tags?: string[];
}): MetaTags[] {
  const tags: MetaTags[] = [];

  if (options.publishedTime) {
    const publishedTime =
      options.publishedTime instanceof Date
        ? options.publishedTime.toISOString()
        : options.publishedTime;
    tags.push({ name: "article:published_time", content: publishedTime });
  }

  if (options.modifiedTime) {
    const modifiedTime =
      options.modifiedTime instanceof Date
        ? options.modifiedTime.toISOString()
        : options.modifiedTime;
    tags.push({ name: "article:modified_time", content: modifiedTime });
  }

  if (options.author) {
    tags.push({ name: "article:author", content: options.author });
  }

  if (options.section) {
    tags.push({ name: "article:section", content: options.section });
  }

  if (options.tags && options.tags.length > 0) {
    options.tags.forEach((tag) => {
      tags.push({ name: "article:tag", content: tag });
    });
  }

  return tags;
}
