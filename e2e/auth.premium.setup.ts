import { test as setup } from '@playwright/test';
import { signInWithCredentials } from './helpers/auth';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const authFile = 'e2e/.auth/premium.json';

setup('premium user session', async ({ page }) => {
  const email = process.env.E2E_PREMIUM_EMAIL?.trim();
  const password = process.env.E2E_PREMIUM_PASSWORD;
  if (!email || !password) {
    setup.skip(true, 'Set E2E_PREMIUM_EMAIL and E2E_PREMIUM_PASSWORD in .env.e2e.local');
  }

  mkdirSync(dirname(authFile), { recursive: true });
  await signInWithCredentials(page, email!, password!);
  await page.context().storageState({ path: authFile });
});
