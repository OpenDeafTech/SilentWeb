import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const harnessPath = fileURLToPath(new URL("./harness/injection-harness.js", import.meta.url));
const injectionHarness = readFileSync(harnessPath, "utf8");

const INJECTION_BUDGET_MS = Number(process.env.SILENTWEB_INJECTION_BUDGET_MS ?? "150");
const FIXTURE_PAGES = [
  "/tests/e2e/fixtures/index.html",
  "/tests/e2e/fixtures/video.html",
  "/tests/e2e/fixtures/audio.html",
];

test.describe("SilentWeb injection performance", () => {
  for (const route of FIXTURE_PAGES) {
    test(`overlay mounts within ${INJECTION_BUDGET_MS}ms on ${route}`, async ({ page }) => {
      await page.addInitScript({ content: injectionHarness });
      const response = await page.goto(route);
      expect(response, `Failed to load ${route}`).not.toBeNull();

      const perfHandle = await page.waitForFunction(
        () => {
          const perf = window.__silentwebPerf;
          if (!perf) return null;
          return perf.ready || perf.error ? perf : null;
        },
        undefined,
        { timeout: 5_000 }
      );

      const perf = await perfHandle.jsonValue();

      expect(perf.error).toBeUndefined();
      expect(perf.latency).toBeLessThanOrEqual(INJECTION_BUDGET_MS);
      expect(perf.mountDuration).toBeLessThanOrEqual(INJECTION_BUDGET_MS);

      await expect(page.locator("#silentweb-overlay")).toBeVisible();
    });
  }
});
