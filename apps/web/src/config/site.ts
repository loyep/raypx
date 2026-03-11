import type { SiteConfig } from "@raypx/seo";
import { PRODUCT_CONFIG, SITE_METADATA, SITE_URL } from "@raypx/shared/config";

export const siteConfig: SiteConfig = {
  name: SITE_METADATA.marketing.name,
  title: SITE_METADATA.marketing.title,
  description: SITE_METADATA.marketing.description,
  keywords: [...SITE_METADATA.marketing.keywords],
  url: SITE_URL,
  author: PRODUCT_CONFIG.author,
  image: PRODUCT_CONFIG.image,
  github: PRODUCT_CONFIG.github,
};
