import { createRequire } from "node:module";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const require = createRequire(import.meta.url);

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react({
      babel: {
        plugins: [[require.resolve("babel-plugin-react-compiler"), { target: "19" }]],
      },
    }),
  ],
  test: {
    environment: "jsdom",
    exclude: ["**/node_modules/**", "**/dist/**", "**/.turbo/**", "**/e2e/**", "**/src/**"],
    globals: true,
    include: ["tests/**/*.test.{ts,tsx}"],
    passWithNoTests: true,
    setupFiles: [],
  },
});
