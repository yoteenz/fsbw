import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/** Wait until app localStorage reflects a signed-in session (matches `adminAuth.ts`). */
export async function expectSignedIn(page: Page): Promise<void> {
  await expect
    .poll(async () => page.evaluate(() => localStorage.getItem('isSignedIn')), {
      timeout: 30_000,
    })
    .toBe('true');
}

export async function signInWithCredentials(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/sign-in');
  await page.locator('#signin-email').fill(email);
  await page.locator('#signin-password').fill(password);
  await page.getByRole('button', { name: 'SIGN IN', exact: true }).click();

  // Invalid credentials show a modal; valid sign-in sets localStorage and redirects.
  const invalidModal = page.getByText('INVALID EMAIL OR PASSWORD', { exact: true });
  const signedIn = await Promise.race([
    expectSignedIn(page).then(() => true as const),
    invalidModal.waitFor({ state: 'visible', timeout: 30_000 }).then(() => false as const),
  ]);

  if (!signedIn) {
    throw new Error(`Sign-in failed for ${email} (invalid email/password or unconfirmed email).`);
  }

  await page.waitForURL((url) => !url.pathname.startsWith('/sign-in'), { timeout: 30_000 });
}
