import type { SiteConfig } from "@raypx/seo";
import { PRODUCT_CONFIG, SITE_METADATA } from "@raypx/shared/config";
import env from "@/env";

export const siteConfig: SiteConfig = {
  name: SITE_METADATA.app.name,
  title: SITE_METADATA.app.title,
  description: SITE_METADATA.app.description,
  keywords: [...SITE_METADATA.app.keywords],
  url: env.SITE_URL,
  author: PRODUCT_CONFIG.author,
  image: PRODUCT_CONFIG.image,
  github: PRODUCT_CONFIG.github,
};
