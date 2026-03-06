import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import mdx from "fumadocs-mdx/vite";
import { createJiti } from "jiti";
import { nitro } from "nitro/vite";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, type UserConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import * as MdxConfig from "./source.config";

const jiti = createJiti(fileURLToPath(import.meta.url));

export default defineConfig(async ({ command, isSsrBuild }) => {
  const isBuild = command === "build";
  const isDev = command === "serve";
  const enableBundleAnalyze = process.env.BUNDLE_ANALYZE === "true" && !isSsrBuild;
  const enableTanstackDevtools = process.env.TANSTACK_DEVTOOLS === "true";

  if (isBuild) {
    await jiti.import<typeof import("./src/env.ts")>("./src/env.ts").then((m) => m.default);
  }

  return {
    ssr: {
      external: [
        "@tanstack/react-devtools",
        "@tanstack/react-router-devtools",
        "@tanstack/react-query-devtools",
      ],
      noExternal: isBuild ? true : undefined,
    },
    optimizeDeps: {
      include: [
        "@tanstack/react-query",
        "@tanstack/react-router",
        "@phosphor-icons/react",
        "recharts",
      ],
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
    ...(isDev && {
      server: {
        warmup: {
          clientFiles: ["./src/router.tsx", "./src/routes/__root.tsx", "./src/styles/globals.css"],
          ssrFiles: ["./src/routes/__root.tsx"],
        },
      },
    }),
    plugins: [
      mdx(MdxConfig),
      ...(enableBundleAnalyze
        ? [
            visualizer({
              open: true,
            }),
          ]
        : []),
      ...(enableTanstackDevtools
        ? [
            devtools({
              enhancedLogs: { enabled: false },
              injectSource: { enabled: false },
              removeDevtoolsOnBuild: true,
            }),
          ]
        : []),
      tsConfigPaths(),
      tanstackStart(),
      viteReact({
        ...(isBuild && {
          babel: {
            plugins: [
              [
                "babel-plugin-react-compiler",
                {
                  target: "19",
                },
              ],
            ],
          },
        }),
      }),
      tailwindcss(),
      nitro(),
    ],
  } satisfies UserConfig;
});
