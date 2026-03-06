import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import mdx from "fumadocs-mdx/vite";
import { createJiti } from "jiti";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import Inspect from "vite-plugin-inspect";
import tsConfigPaths from "vite-tsconfig-paths";
import * as MdxConfig from "./source.config";

const jiti = createJiti(fileURLToPath(import.meta.url));

const env = await jiti.import<typeof import("./src/env.ts")>("./src/env.ts").then((m) => m.default);

const isDev = env.NODE_ENV === "development";

const base = "/docs";

export default defineConfig(({ command }) => ({
  base,
  server: {
    port: 3004,
  },
  ssr: {
    noExternal: command === "build" ? true : undefined,
  },
  plugins: [
    // Conditionally load MDX for faster startup (use SKIP_DOCS=true to skip)
    mdx(MdxConfig),
    // Always include for production tree-shaking
    devtools({
      enhancedLogs: { enabled: false },
      injectSource: { enabled: false },
    }),
    // Vite plugin inspector (dev only)
    ...(isDev ? [Inspect()] : []),
    tsConfigPaths(),
    tanstackStart(),
    // Must come after tanstackStart
    viteReact({
      // https://react.dev/learn/react-compiler
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
    tailwindcss(),
    nitro({
      baseURL: base,
    }),
  ],
}));
