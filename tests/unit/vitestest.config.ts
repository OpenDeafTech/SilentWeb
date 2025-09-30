// /home/vincentdev/Documents/GitHub/SilentWeb/tests/unit/vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,                // describe/it/expect dispo globalement
    environment: "node",          // environnement par défaut
    include: ["**/*.spec.ts"],    // tous les tests unitaires *.spec.ts
    exclude: ["dist", "node_modules"],
    watchExclude: ["dist", "node_modules"],
    coverage: {
      enabled: true,
      provider: "v8",             // couverture via V8 natif
      reporter: ["text", "html", "json-summary"],
      reportsDirectory: "./coverage"
    },
    reporters: ["default"],
    silent: false,
    restoreMocks: true,
    clearMocks: true
  },
  resolve: {
    alias: {
      "@silentweb/core": "../../packages/core/src",
      "@silentweb/extension": "../../packages/extension/src",
      "@silentweb/ui": "../../packages/ui/src"
    }
  }
});
