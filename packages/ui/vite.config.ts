import { defineConfig } from "vite";
import * as path from "node:path";

export default defineConfig({
  root: __dirname,
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: { input: { main: path.resolve(__dirname, "src/index.ts") } }
  },
  resolve: { alias: { "@": path.resolve(__dirname, "../../src") } }
});
