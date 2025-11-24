// vitest.config.ts
import { defineConfig, configDefaults } from "vitest/config";
import { fileURLToPath } from "node:url";

const setupFile = fileURLToPath(new URL("./tests/setup.js", import.meta.url));

export default defineConfig({
  test: {
    environment: "jsdom",
    environmentMatchGlobs: [["tests/unit/locales.snap.spec.*", "node"]],
    setupFiles: [setupFile],
    globals: true,
    exclude: [...configDefaults.exclude, "tests/e2e/**", "tests/perf/**"],
  },
});
