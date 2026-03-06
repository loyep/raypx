import type { KnipConfig } from "knip";

const config: KnipConfig = {
  workspaces: {
    // Apps - TanStack Start uses file-based routing
    "apps/web": {
      entry: ["src/routes/**/*.{ts,tsx}", "src/router.tsx", "src/components/not-found.tsx"],
      project: ["src/**/*.{ts,tsx}"],
    },
    "apps/app": {
      entry: ["src/routes/**/*.{ts,tsx}", "src/router.tsx", "src/components/not-found.tsx"],
      project: ["src/**/*.{ts,tsx}"],
    },
    "apps/docs": {
      entry: [
        "src/routes/**/*.{ts,tsx}",
        "source.config.ts",
        "src/router.tsx",
        "src/components/not-found.tsx",
      ],
      project: ["src/**/*.{ts,tsx}", "content/**/*.mdx"],
    },
    // Scripts - CLI tools
    scripts: {
      entry: ["bin/*.mjs", "cli.ts", "cmd/*.ts"],
      project: ["**/*.ts"],
    },
    // Packages - knip auto-detects from package.json exports
    "packages/auth": {
      project: ["src/**/*.{ts,tsx}"],
    },
    "packages/config": {
      project: ["src/**/*.ts"],
    },
    "packages/database": {
      project: ["src/**/*.ts", "config/**/*.ts"],
    },
    "packages/design-system": {
      project: ["**/*.{ts,tsx}"],
    },
    "packages/email": {
      project: ["src/**/*.ts", "src/**/*.tsx"],
    },
    "packages/i18n": {
      project: ["src/**/*.ts"],
    },
    "packages/logger": {
      project: ["src/**/*.ts"],
    },
    "packages/observability": {
      project: ["src/**/*.ts"],
    },
    "packages/rpc": {
      project: ["src/**/*.ts"],
    },
    "packages/seo": {
      project: ["src/**/*.ts"],
    },
    "packages/shared": {
      project: ["src/**/*.ts"],
    },
    "packages/storage": {
      project: ["src/**/*.ts"],
    },
  },
  ignoreDependencies: [
    "@types/*",
    "@dotenvx/dotenvx",
    // Config file dependencies (not detected by knip)
    "babel-plugin-react-compiler",
    "tailwindcss",
    "drizzle-kit",
    "drizzle-seed",
    "jiti",
    "type-fest",
    // Devtools (runtime browser dependencies)
    "@tanstack/react-devtools",
    "@tanstack/react-query-devtools",
    "@tanstack/react-router-devtools",
  ],
  ignoreBinaries: [
    // Preinstall script (used via npx)
    "only-allow",
  ],
};

export default config;
