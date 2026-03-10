import type { SiteConfig } from "@raypx/seo";
import { SITE_URL } from "@raypx/shared/config";

export const siteConfig: SiteConfig = {
  name: "Raypx App",
  title: "Raypx App",
  description: "The Raypx product app for authenticated chat and AI provider workflows.",
  keywords: ["Raypx", "AI", "chat", "TanStack Start", "oRPC"],
  url: SITE_URL,
  author: "Raypx",
  image: "/og.png",
  github: "https://github.com/raypx/raypx",
};
