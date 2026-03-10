import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/.turbo/**"],
    passWithNoTests: true,
    environment: "node",
    env: {
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
      BETTER_AUTH_SECRET: "test-secret-for-testing-purposes-only",
      NODE_ENV: "test",
    },
  },
});
