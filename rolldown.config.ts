import { defineConfig } from "rolldown";
import pkg from "./package.json" assert { type: "json" };

const external = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
];

export default defineConfig({
  input: {
    core: "src/core/index.ts",
    adapters: "src/adapters/index.ts",
  },
  output: {
    cleanDir: true,
    entryFileNames: "[name]/index.js",
    chunkFileNames: "chunks/[name].js",
    sourcemap: true,
  },
  external,
  platform: "node",
});
