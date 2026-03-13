import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import babel from "@rolldown/plugin-babel";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    react(),
    babel({
      parserOpts: { plugins: ["typescript", "jsx"] },
      presets: [reactCompilerPreset({ target: "19" })],
    } as Parameters<typeof babel>[0]),
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
