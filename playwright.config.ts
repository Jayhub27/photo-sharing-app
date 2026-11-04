import { defineConfig, devices } from '@playwright/test'

/**
 * Smoke tests run against a deployed URL, never a local server: the point is
 * to prove the thing people will open actually works. SHIP_URL lets CI point
 * the same suite at a preview deployment.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.SHIP_URL || 'https://take-the-shot-api.vercel.app',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } },
    },
  ],
})
