import { test, expect } from '@playwright/test';
import { GUEST_SMOKE_ROUTES } from './helpers/routes';

test.describe('Guest — mobile smoke', () => {
  for (const route of GUEST_SMOKE_ROUTES) {
    test(`${route.label} (${route.path}) loads without crash`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      const response = await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), `HTTP status for ${route.path}`).toBeLessThan(500);

      // App error boundary — full-screen red failure screen.
      await expect(page.getByText('ERROR: COMPONENT FAILED TO LOAD')).toHaveCount(0);
      await expect(page.getByText('UPDATING THE APP')).toHaveCount(0);

      // Allow chunk/network noise; fail on obvious React/runtime throws only.
      const fatal = consoleErrors.filter(
        (t) =>
          /Uncaught|TypeError|ReferenceError|ChunkLoadError|Failed to fetch dynamically imported module/i.test(
            t,
          ) && !/favicon|404.*assets/i.test(t),
      );
      expect(fatal, `Console errors on ${route.path}`).toEqual([]);
    });
  }

  test('guest can open NOIR PDP and see primary CTA', async ({ page }) => {
    await page.goto('/straight/noir');
    await expect(page.getByRole('button', { name: /ADD TO BAG|OUT OF STOCK/i }).first()).toBeVisible();
  });

  test('guest bag page renders checkout path', async ({ page }) => {
    await page.goto('/bag');
    await expect(page.getByText(/SHOPPING BAG|YOUR BAG IS EMPTY|BAG/i).first()).toBeVisible();
  });
});
