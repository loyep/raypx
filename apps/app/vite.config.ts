import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, type Plugin, type UserConfig } from "vite";
import "./src/env.ts";

async function VisualizerPlugin(enable: boolean): Promise<Plugin[]> {
  if (!enable) return [];
  const { default: visualizer } = await import("rollup-plugin-visualizer");
  return [visualizer({ open: true })];
}

export default defineConfig(async ({ command, isSsrBuild }) => {
  const isBuild = command === "build";
  const isServeMode = command === "serve"; // dev or preview
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
    },
    ...(isServeMode
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
      VisualizerPlugin(enableBundleAnalyze),
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
