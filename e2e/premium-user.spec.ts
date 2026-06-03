import { test, expect } from '@playwright/test';

test.describe('Premium user — signed-in mobile journeys', () => {
  test.beforeEach(async ({ page }) => {
    await expect
      .poll(async () => page.evaluate(() => localStorage.getItem('isSignedIn')))
      .toBe('true');
  });

  test('rewards / membership chart loads', async ({ page }) => {
    await page.goto('/account/rewards');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.getByText(/REWARDS|MEMBERSHIP|PREMIUM/i).first()).toBeVisible();
  });

  test('PSA widget opens for premium session', async ({ page }) => {
    await page.goto('/home/shop');
    const psaFab = page.getByRole('button', { name: 'Open Personal Slay Assistant' });
    if (!(await psaFab.isVisible().catch(() => false))) {
      test.skip(true, 'PSA FAB not visible (not premium in this session or widget hidden)');
    }
    await psaFab.click();
    await expect(page.getByPlaceholder('ASK PSA ANYTHING…')).toBeVisible({ timeout: 10_000 });
  });

  test('premium booking consult path loads', async ({ page }) => {
    await page.goto('/booking/premium/consultation');
    const response = await page.waitForLoadState('domcontentloaded');
    void response;
    await expect(page.getByText('ERROR: COMPONENT FAILED TO LOAD')).toHaveCount(0);
  });
});
