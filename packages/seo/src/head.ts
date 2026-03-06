import { generateCanonicalLink, generateFaviconLinks } from "./links";
import {
  generateArticleMeta,
  generateOpenGraphMeta,
  generateSeoMeta,
  generateThemeMeta,
  generateTwitterCardMeta,
} from "./meta";
import { generateWebSiteSchema } from "./schema";
import type { HeadConfig, MetaTags, SiteConfig } from "./types";

/**
 * Generate complete head configuration for root route
 */
export function generateRootHead(config: SiteConfig): HeadConfig {
  return {
    meta: [
      { title: config.title },
      ...generateSeoMeta(config),
      ...generateOpenGraphMeta(config),
      ...generateTwitterCardMeta(config),
      ...generateThemeMeta(),
    ],
    links: [...generateFaviconLinks(), generateCanonicalLink(config.url)],
    scripts: [generateWebSiteSchema(config)],
  };
}

/**
 * Generate page head configuration (for individual pages)
 */
export function generatePageHead(
  config: SiteConfig,
  options: {
    title?: string;
    description?: string;
    url?: string;
    ogType?: "website" | "article" | "product";
    noindex?: boolean;
    publishedTime?: string | Date;
    modifiedTime?: string | Date;
    author?: string;
    section?: string;
    tags?: string[];
  } = {},
): HeadConfig {
  const title = options.title ?? config.title;
  const description = options.description ?? config.description;
  const url = options.url ?? config.url;

  let hostname: string | null = null;
  try {
    hostname = new URL(url).hostname;
  } catch {
    hostname = null;
  }
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  const shouldIncludeCanonical = !isLocalhost;
  const ogUrl = shouldIncludeCanonical ? url : config.url;

  const meta: MetaTags[] = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: options.ogType ?? "website" },
    { property: "og:url", content: ogUrl },
    { property: "og:image", content: `${config.url}${config.image}` },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: `${config.url}${config.image}` },
  ];

  if (options.ogType === "article") {
    const articleMeta = generateArticleMeta({
      publishedTime: options.publishedTime,
      modifiedTime: options.modifiedTime,
      author: options.author ?? config.author,
      section: options.section,
      tags: options.tags,
    });
    meta.push(...articleMeta);
  }

  if (options.noindex) {
    meta.push({ name: "robots", content: "noindex, nofollow" });
  }

  return {
    meta,
    links: shouldIncludeCanonical ? [generateCanonicalLink(url)] : [],
  };
}
