import { defineConfig } from '@playwright/test';

const shouldRunE2E = process.env.RUN_E2E === 'true';

if (!shouldRunE2E) {
  console.log('Skipping Playwright E2E tests (set RUN_E2E=true to enable the browser matrix).');
}

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  testIgnore: shouldRunE2E ? [] : ['**/*'],
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 }
  },
  projects: shouldRunE2E
    ? [
        {
          name: 'chromium-headless',
          use: {
            browserName: 'chromium',
            headless: true
          }
        },
        {
          name: 'firefox-headless',
          use: {
            browserName: 'firefox',
            headless: true
          }
        }
      ]
    : undefined,
  webServer: shouldRunE2E
    ? {
        command: 'pnpm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI
      }
    : undefined
});
