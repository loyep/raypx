export const PRODUCT_CONFIG = {
  name: "Raypx",
  author: "Raypx",
  github: "https://github.com/raypx/raypx",
  image: "/og.png",
} as const;

export const SITE_METADATA = {
  marketing: {
    name: PRODUCT_CONFIG.name,
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
  },
  app: {
    name: "Raypx App",
    title: "Raypx App",
    description: "The Raypx product app for authenticated chat and AI provider workflows.",
    keywords: ["Raypx", "AI", "chat", "TanStack Start", "oRPC"],
  },
} as const;

export const BILLING_PATHS = {
  success: "/billing/success",
  cancel: "/billing/cancel",
} as const;
