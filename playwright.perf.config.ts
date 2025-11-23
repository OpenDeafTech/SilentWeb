import { defineConfig } from "@playwright/test";

const perfPort = process.env.PERF_SERVER_PORT ?? "4173";
const baseUrl = `http://127.0.0.1:${perfPort}`;
const healthcheckUrl = `${baseUrl}/tests/e2e/fixtures/index.html`;

export default defineConfig({
  testDir: "./tests/perf",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    headless: true,
    baseURL: baseUrl,
  },
  projects: [
    {
      name: "chromium-perf",
      use: {
        browserName: "chromium",
        headless: true,
      },
    },
  ],
  webServer: {
    command: "node tests/e2e/server.js",
    url: healthcheckUrl,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 60_000,
    env: {
      PORT: perfPort,
    },
  },
});
