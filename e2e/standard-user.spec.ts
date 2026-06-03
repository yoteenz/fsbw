import { test, expect } from '@playwright/test';
import { SIGNED_IN_ACCOUNT_ROUTES } from './helpers/routes';

test.describe('Standard user — signed-in mobile journeys', () => {
  test.beforeEach(async ({ page }) => {
    await expect
      .poll(async () => page.evaluate(() => localStorage.getItem('isSignedIn')))
      .toBe('true');
  });

  for (const route of SIGNED_IN_ACCOUNT_ROUTES) {
    test(`${route.label} (${route.path}) loads`, async ({ page }) => {
      const response = await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBeLessThan(500);
      await expect(page.getByText('ERROR: COMPONENT FAILED TO LOAD')).toHaveCount(0);
      // Account routes should not bounce to sign-in when storage state is valid.
      await expect(page).not.toHaveURL(/\/sign-in/);
    });
  }

  test('standard user: add NOIR to bag from PDP (client cart)', async ({ page }) => {
    await page.goto('/straight/noir');
    const addBtn = page.getByRole('button', { name: 'ADD TO BAG', exact: true });
    if (!(await addBtn.isVisible().catch(() => false))) {
      test.skip(true, 'NOIR is sold out in this environment');
    }
    await addBtn.click();
    await page.goto('/bag');
    await expect(page.getByText(/NOIR/i).first()).toBeVisible();
  });

  test('standard user: Build-a-Wig hub reachable when signed in', async ({ page }) => {
    await page.goto('/build-a-wig');
    await expect(page.getByText('ERROR: COMPONENT FAILED TO LOAD')).toHaveCount(0);
    await expect(page).not.toHaveURL(/\/sign-in/);
  });
});
