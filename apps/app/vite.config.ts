import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, type UserConfig } from "vite";
import "./src/env.ts";

export default defineConfig(async ({ command, isSsrBuild }) => {
  const isBuild = command === "build";
  const isDev = command === "serve";
  const enableBundleAnalyze = process.env.BUNDLE_ANALYZE === "true" && !isSsrBuild;
  const enableTanstackDevtools = process.env.TANSTACK_DEVTOOLS === "true";

  return {
    resolve: {
      tsconfigPaths: true,
    },
    ssr: {
      noExternal: isBuild ? true : undefined,
    },
    optimizeDeps: {
      include: ["@tanstack/react-query", "@tanstack/react-router", "@tabler/icons-react"],
      exclude: ["@tanstack/react-start"],
    },
    build: {
      cssCodeSplit: true,
      ssrEmitAssets: true,
      rolldownOptions: isBuild
        ? undefined
        : {
            output: {
              chunkFileNames: "assets/chunks/[name]-[hash].js",
            },
          },
    },
    ...(isDev
      ? {
          server: {
            warmup: {
              clientFiles: [
                "./src/router.tsx",
                "./src/routes/__root.tsx",
                "./src/styles/globals.css",
              ],
              ssrFiles: ["./src/routes/__root.tsx"],
            },
          },
        }
      : {}),
    plugins: [
      ...(enableBundleAnalyze ? [visualizer({ open: true })] : []),
      ...(enableTanstackDevtools
        ? [
            devtools({
              enhancedLogs: { enabled: false },
              injectSource: { enabled: false },
              removeDevtoolsOnBuild: true,
            }),
          ]
        : []),
      tanstackStart(),
      viteReact(),
      ...(isBuild
        ? [
            babel({
              parserOpts: { plugins: ["typescript", "jsx"] },
              presets: [reactCompilerPreset({ target: "19" })],
            } as Parameters<typeof babel>[0]),
          ]
        : []),
      tailwindcss(),
      nitro(),
    ],
  } satisfies UserConfig;
});
