import { defineConfig } from "rolldown";

import { dependencies } from "./package.json";

export default defineConfig({
  input: {
    main: "src/main.ts",
    core: "src/core/index.ts",
    adapters: "src/adapters/index.ts",
  },
  output: {
    cleanDir: true,
    entryFileNames: "[name]/index.js",
    chunkFileNames: "chunks/[name].js",
    sourcemap: true,
  },
  external: Object.keys(dependencies),

  platform: "node",
});
