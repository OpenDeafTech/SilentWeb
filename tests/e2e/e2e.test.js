/* ============================================================================
   tests/e2e/e2e.test.js
   End-to-end tests for SilentWeb extension using Playwright
   ============================================================================ */

import { test, expect } from "@playwright/test";

test.describe("SilentWeb E2E Fixtures", () => {
  test("index.html toggles message", async ({ page }) => {
    await page.goto("/tests/e2e/fixtures/index.html");
    const message = page.locator("#message");
    const toggle = page.locator("#toggle");

    await expect(message).toBeHidden();
    await toggle.click();
    await expect(message).toBeVisible();
  });

  test("video.html plays and pauses", async ({ page }) => {
    await page.goto("/tests/e2e/fixtures/video.html");
    const video = page.locator("#testVideo");
    const playBtn = page.locator("#playBtn");
    const pauseBtn = page.locator("#pauseBtn");

    await expect(video).toHaveAttribute("data-ready", "true");

    await playBtn.click();
    await expect.poll(async () => await video.evaluate((v) => v.dataset.state)).toBe("playing");

    await pauseBtn.click();
    await expect.poll(async () => await video.evaluate((v) => v.dataset.state)).toBe("paused");
  });

  test("audio.html plays and pauses", async ({ page }) => {
    await page.goto("/tests/e2e/fixtures/audio.html");
    const audio = page.locator("#testAudio");
    const playBtn = page.locator("#playBtn");
    const pauseBtn = page.locator("#pauseBtn");

    await expect(audio).toHaveAttribute("data-ready", "true");

    await playBtn.click();
    await expect.poll(async () => await audio.evaluate((a) => a.dataset.state)).toBe("playing");

    await pauseBtn.click();
    await expect.poll(async () => await audio.evaluate((a) => a.dataset.state)).toBe("paused");
  });
});
