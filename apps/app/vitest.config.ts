import { createRequire } from "node:module";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const require = createRequire(import.meta.url);

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            require.resolve("babel-plugin-react-compiler"),
            {
              target: "19",
            },
          ],
        ],
      },
    }),
  ],
  test: {
    globals: true,
    // Test files are located in tests/ directory (co-located with src/)
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.turbo/**",
      "**/e2e/**",
      "**/src/**", // Exclude src directory (tests are in tests/ directory)
    ],
    passWithNoTests: true,
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: [],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["**/node_modules/**", "**/dist/**", "**/*.config.*"],
    },
  },
});
