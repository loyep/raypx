import type { ScriptTag, SiteConfig } from "./types";

/**
 * Generate JSON-LD structured data for WebSite
 */
export function generateWebSiteSchema(config: SiteConfig): ScriptTag {
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

/**
 * Generate JSON-LD structured data for SoftwareSourceCode
 */
export function generateSoftwareSchema(config: SiteConfig): ScriptTag {
  return {
    type: "application/ld+json",
    innerHTML: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareSourceCode",
      name: config.name,
      description: config.description,
      url: config.url,
      codeRepository: config.github,
      programmingLanguage: ["TypeScript", "React", "JavaScript"],
      runtimePlatform: ["Node.js", "Browser"],
      applicationCategory: "DeveloperApplication",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      license: config.github ? `${config.github}/blob/main/LICENSE` : undefined,
    }),
  };
}

/**
 * Generate JSON-LD structured data for Article/Blog post
 */
export function generateArticleSchema(
  title: string,
  description: string,
  url: string,
  publishedTime: string,
  author: string,
): ScriptTag {
  return {
    type: "application/ld+json",
    innerHTML: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description,
      url,
      datePublished: publishedTime,
      author: {
        "@type": "Person",
        name: author,
      },
    }),
  };
}
