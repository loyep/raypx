import type { SiteConfig } from "@raypx/seo";
import { SITE_URL } from "@raypx/shared/config";

export const siteConfig: SiteConfig = {
  name: "Raypx",
  title: "Raypx - Type-Safe Full-Stack Starter",
  description:
    "Raypx is a production-ready starter with TanStack Start, Better Auth, oRPC, and Drizzle. Ship type-safe web products faster with a modern monorepo foundation.",
  keywords: [
    "React",
    "React 19",
    "TypeScript",
    "TanStack Start",
    "full-stack",
    "Better Auth",
    "Drizzle ORM",
    "shadcn/ui",
    "SSR",
    "SSG",
  ],
  url: SITE_URL,
  author: "Raypx",
  image: "/og.png",
  github: "https://github.com/raypx/raypx",
};
