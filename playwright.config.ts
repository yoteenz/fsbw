import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/** Optional local secrets (gitignored): copy from `.env.e2e.example`. */
for (const file of ['.env.e2e.local', '.env.local']) {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) continue;
  process.loadEnvFile?.(path);
}

/**
 * Mobile-first E2E (Build-a-Wig).
 *
 * Default target: deployed preview/production (`https://fsbw.vercel.app`).
 * Local: set `E2E_BASE_URL=http://localhost:3001` and `E2E_LOCAL_SERVER=1`.
 */
const baseURL = (process.env.E2E_BASE_URL || 'https://fsbw.vercel.app').replace(/\/$/, '');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    ...devices['iPhone 13'],
    locale: 'en-US',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup-standard',
      testMatch: /auth\.standard\.setup\.ts/,
    },
    {
      name: 'setup-premium',
      testMatch: /auth\.premium\.setup\.ts/,
    },
    {
      name: 'guest',
      testMatch: /guest\.spec\.ts/,
    },
    {
      name: 'standard-user',
      testMatch: /standard-user\.spec\.ts/,
      dependencies: ['setup-standard'],
      use: { storageState: 'e2e/.auth/standard.json' },
    },
    {
      name: 'premium-user',
      testMatch: /premium-user\.spec\.ts/,
      dependencies: ['setup-premium'],
      use: { storageState: 'e2e/.auth/premium.json' },
    },
  ],
  webServer:
    process.env.E2E_LOCAL_SERVER === '1'
      ? {
          command: 'npm run dev:no-proxy',
          url: 'http://localhost:3001',
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        }
      : undefined,
});
