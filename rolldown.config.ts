import { defineConfig } from "rolldown";

export default defineConfig({
  input: {
    core: "src/core/index.ts",
    "adapters/cloudflare": "src/adapters/cloudflare/index.ts",
  },
  output: {
    cleanDir: true,
    entryFileNames: "[name]/index.js",
    sourcemap: true,
  },
  platform: "node",
});
