import { test as setup } from '@playwright/test';
import { signInWithCredentials } from './helpers/auth';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const authFile = 'e2e/.auth/standard.json';

setup('standard user session', async ({ page }) => {
  const email = process.env.E2E_STANDARD_EMAIL?.trim();
  const password = process.env.E2E_STANDARD_PASSWORD;
  if (!email || !password) {
    setup.skip(true, 'Set E2E_STANDARD_EMAIL and E2E_STANDARD_PASSWORD in .env.e2e.local');
  }

  mkdirSync(dirname(authFile), { recursive: true });
  await signInWithCredentials(page, email!, password!);
  await page.context().storageState({ path: authFile });
});
