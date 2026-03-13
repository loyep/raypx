import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import mdx from "fumadocs-mdx/vite";
import { nitro } from "nitro/vite";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, type UserConfig } from "vite";
import * as MdxConfig from "./source.config";
import "./src/env.ts";

const isAnalyze = process.env.BUNDLE_ANALYZE === "true";

export default defineConfig(async ({ command, isSsrBuild }) => {
  const isBuild = command === "build";
  const isDev = command === "serve";
  const enableBundleAnalyze = isAnalyze && !isSsrBuild;
  const enableAnalyze = isBuild && enableBundleAnalyze;

  return {
    resolve: {
      tsconfigPaths: true,
    },
    ssr: {
      noExternal: isBuild ? true : undefined,
    },
    optimizeDeps: {
      include: [
        "@tanstack/react-query",
        "@tanstack/react-router",
        "@tabler/icons-react",
        "recharts",
      ],
      exclude: ["@tanstack/react-start"],
    },
    build: {
      cssCodeSplit: true,
      ssrEmitAssets: true,
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
      ...(enableAnalyze
        ? [
            visualizer({
              open: true,
            }),
          ]
        : []),
      devtools({
        enhancedLogs: { enabled: false },
        injectSource: { enabled: false },
        removeDevtoolsOnBuild: true,
      }),
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
