import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "./src/index.ts",
  },
  deps: {
    // Bundle all third-party deps into the output.
    alwaysBundle: () => true,
  },
  format: ["esm"],
  dts: false,
  clean: true,
  sourcemap: true,
  target: "es2022",
  logLevel: "error",
});
