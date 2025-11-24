import { defineConfig } from "@playwright/test";

const shouldRunE2E = process.env.RUN_E2E === "true";
const e2ePort = process.env.E2E_SERVER_PORT ?? "3000";
const baseUrl = `http://127.0.0.1:${e2ePort}`;
const healthcheckUrl = `${baseUrl}/tests/e2e/fixtures/index.html`;

if (!shouldRunE2E) {
  console.log("Skipping Playwright E2E tests (set RUN_E2E=true to enable the browser matrix).");
}

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30 * 1000,
  testIgnore: shouldRunE2E ? [] : ["**/*"],
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    baseURL: baseUrl,
  },
  projects: shouldRunE2E
    ? [
        {
          name: "chromium-headless",
          use: {
            browserName: "chromium",
            headless: true,
          },
        },
        {
          name: "firefox-headless",
          use: {
            browserName: "firefox",
            headless: true,
          },
        },
      ]
    : undefined,
  webServer: shouldRunE2E
    ? {
        command: "node tests/e2e/server.js",
        url: healthcheckUrl,
        reuseExistingServer: !process.env.CI,
        env: {
          PORT: e2ePort,
        },
      }
    : undefined,
});
