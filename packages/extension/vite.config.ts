// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      input: {
        background: "src/background.ts",
        content: "src/content.ts",
        options: "src/options.ts"
      }
    }
  }
});
