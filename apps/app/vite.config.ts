import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
// @ts-ignore
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { createJiti } from "jiti";
import { nitro } from "nitro/vite";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, type UserConfig } from "vite";

const jiti = createJiti(fileURLToPath(import.meta.url));

export default defineConfig(async ({ command, isSsrBuild }) => {
  const isBuild = command === "build";
  const isDev = command === "serve";
  const enableBundleAnalyze = process.env.BUNDLE_ANALYZE === "true" && !isSsrBuild;
  const enableTanstackDevtools = process.env.TANSTACK_DEVTOOLS === "true";

  if (isBuild) {
    await jiti
      .import<typeof import("./src/env.ts")>("./src/env.ts")
      .then((module) => module.default);
  }

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
