import type { HeadConfig, LinkTag, MetaTags, ScriptTag, SiteConfig } from "./types";

// ---- Internal helpers ----

function toIso(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value;
}

function faviconLinks(): LinkTag[] {
  return [
    { rel: "icon", type: "image/png", href: "/favicon.png" },
    { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
    { rel: "manifest", href: "/manifest.webmanifest" },
  ];
}

function canonicalLink(url: string): LinkTag {
  return { rel: "canonical", href: url };
}

function seoMeta(config: SiteConfig): MetaTags[] {
  return [
    { charSet: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { name: "description", content: config.description },
    ...(config.keywords?.length ? [{ name: "keywords", content: config.keywords.join(", ") }] : []),
    { name: "author", content: config.author },
  ];
}

function openGraphMeta(config: SiteConfig): MetaTags[] {
  return [
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: config.name },
    { property: "og:title", content: config.title },
    { property: "og:description", content: config.description },
    { property: "og:url", content: config.url },
    { property: "og:image", content: `${config.url}${config.image}` },
  ];
}

function twitterMeta(
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

function themeMeta(
  themeColor = "#ffffff",
  colorScheme: "light" | "dark" | "light dark" = "light dark",
): MetaTags[] {
  return [
    { name: "theme-color", content: themeColor },
    { name: "color-scheme", content: colorScheme },
  ];
}

function articleMeta(options: {
  publishedTime?: string | Date;
  modifiedTime?: string | Date;
  author?: string;
  section?: string;
  tags?: string[];
}): MetaTags[] {
  const tags: MetaTags[] = [];
  if (options.publishedTime)
    tags.push({ property: "article:published_time", content: toIso(options.publishedTime) });
  if (options.modifiedTime)
    tags.push({ property: "article:modified_time", content: toIso(options.modifiedTime) });
  if (options.author) tags.push({ property: "article:author", content: options.author });
  if (options.section) tags.push({ property: "article:section", content: options.section });
  for (const tag of options.tags ?? []) {
    tags.push({ property: "article:tag", content: tag });
  }
  return tags;
}

function webSiteSchema(config: SiteConfig): ScriptTag {
  return {
    type: "application/ld+json",
    innerHTML: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: config.name,
      url: config.url,
      description: config.description,
      ...(config.github
        ? {
            sameAs: [
              config.github,
              ...(config.twitter ? [`https://twitter.com/${config.twitter}`] : []),
            ],
          }
        : {}),
    }),
  };
}

// ---- Public API ----

export function generateRootHead(config: SiteConfig): HeadConfig {
  return {
    meta: [
      { title: config.title },
      ...seoMeta(config),
      ...openGraphMeta(config),
      ...twitterMeta(config),
      ...themeMeta(),
    ],
    links: [...faviconLinks(), canonicalLink(config.url)],
    scripts: [webSiteSchema(config)],
  };
}

export interface PageHeadOptions {
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
}

export function generatePageHead(config: SiteConfig, options: PageHeadOptions = {}): HeadConfig {
  const title = options.title ?? config.title;
  const description = options.description ?? config.description;
  const url = options.url ?? config.url;

  let hostname: string | null = null;
  try {
    hostname = new URL(url).hostname;
  } catch {
    hostname = null;
  }
  const isLocalhost =
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0";
  const shouldIncludeCanonical = !isLocalhost;
  const ogUrl = shouldIncludeCanonical ? url : config.url;

  const meta: MetaTags[] = [
    { title },
    { name: "description", content: description },
    { name: "twitter:card", content: "summary_large_image" },
    { property: "og:site_name", content: config.name },
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
    meta.push(
      ...articleMeta({
        publishedTime: options.publishedTime,
        modifiedTime: options.modifiedTime,
        author: options.author ?? config.author,
        section: options.section,
        tags: options.tags,
      }),
    );
  }

  if (options.noindex) {
    meta.push({ name: "robots", content: "noindex, nofollow" });
  }

  return {
    meta,
    links: shouldIncludeCanonical ? [canonicalLink(url)] : [],
  };
}
