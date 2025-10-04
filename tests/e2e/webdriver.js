/* ============================================================================
   tests/e2e/webdriver.js
   WebDriver client setup for SilentWeb E2E tests (fallback if Playwright not used)
   ============================================================================ */

import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import firefox from "selenium-webdriver/firefox.js";

let driver;

/**
 * Start WebDriver with Chrome or Firefox.
 * @param {"chrome"|"firefox"} browser
 */
export async function startDriver(browser = "chrome") {
  if (browser === "chrome") {
    driver = await new Builder().forBrowser("chrome").setChromeOptions(new chrome.Options()).build();
  } else if (browser === "firefox") {
    driver = await new Builder().forBrowser("firefox").setFirefoxOptions(new firefox.Options()).build();
  } else {
    throw new Error(`Unsupported browser: ${browser}`);
  }
  return driver;
}

/**
 * Stop WebDriver session.
 */
export async function stopDriver() {
  if (driver) {
    await driver.quit();
    driver = null;
  }
}

/**
 * Navigate to a given URL.
 * @param {string} url
 */
export async function openPage(url) {
  if (!driver) throw new Error("Driver not started. Call startDriver() first.");
  await driver.get(url);
}

/**
 * Click element by CSS selector.
 * @param {string} selector
 */
export async function click(selector) {
  const el = await driver.findElement(By.css(selector));
  await el.click();
}

/**
 * Wait until element is visible.
 * @param {string} selector
 */
export async function waitVisible(selector) {
  const el = await driver.wait(until.elementLocated(By.css(selector)), 5000);
  await driver.wait(until.elementIsVisible(el), 5000);
  return el;
}
