/* ============================================================================
   tests/e2e/helper.js
   Utility helpers for SilentWeb E2E tests
   ============================================================================ */

/**
 * Wait for media (audio or video) to reach a specific readyState.
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 * @param {number} state 0=HAVE_NOTHING, 4=HAVE_ENOUGH_DATA
 */
export async function waitForReadyState(page, selector, state = 4) {
  await page.waitForFunction(
    ([sel, st]) => {
      const el = document.querySelector(sel);
      return el && el.readyState >= st;
    },
    [selector, state]
  );
}

/**
 * Play a media element and confirm it is playing.
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 */
export async function playMedia(page, selector) {
  await page.click("#playBtn");
  await page.waitForTimeout(500);
  return page.locator(selector).evaluate((el) => !el.paused);
}

/**
 * Pause a media element and confirm it is paused.
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 */
export async function pauseMedia(page, selector) {
  await page.click("#pauseBtn");
  await page.waitForTimeout(500);
  return page.locator(selector).evaluate((el) => el.paused);
}
