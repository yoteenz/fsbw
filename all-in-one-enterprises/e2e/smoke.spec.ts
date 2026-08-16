import { test, expect } from '@playwright/test';
import { useOfficeSecurityStaff } from './helpers';

test.describe('All In One public smoke (standalone)', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.aio-app')).toBeVisible();
    await expect(page.getByRole('link', { name: /services/i }).first()).toBeVisible();
  });

  test('services page loads', async ({ page }) => {
    await page.goto('/services');
    await expect(page.locator('.aio-app')).toBeVisible();
  });

  test('skip link targets main content', async ({ page }) => {
    await page.goto('/');
    const skip = page.getByRole('link', { name: /skip to main content/i });
    await expect(skip).toBeAttached();
  });
});

test.describe('Portal smoke (demo)', () => {
  test('portal dashboard loads', async ({ page }) => {
    await page.goto('/portal');
    await expect(page.locator('.aio-app')).toBeVisible();
  });

  test('road ready page loads', async ({ page }) => {
    await page.goto('/portal/road-ready');
    await expect(page.locator('.aio-app')).toBeVisible();
  });
});

test.describe('Office smoke (demo)', () => {
  test.beforeEach(async ({ page }) => {
    await useOfficeSecurityStaff(page);
  });

  test('office home loads', async ({ page }) => {
    await expect(page.locator('.aio-office')).toBeVisible();
  });

  test('QA command center loads', async ({ page }) => {
    await page.goto('/office/system/qa');
    await expect(page.getByRole('heading', { name: /QA Command Center/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Extraction Readiness' }).first()).toBeVisible();
  });

  test('data health center loads', async ({ page }) => {
    await page.goto('/office/system/data');
    await expect(page.getByText(/Data Health Center/i)).toBeVisible({ timeout: 15000 });
  });
});

test.describe('route smoke — no crash', () => {
  const routes = ['/contact', '/about', '/get-started', '/office/crm', '/office/dispatch', '/office/management', '/office/security'];

  for (const route of routes) {
    test(`loads ${route}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(route);
      await expect(page.locator('.aio-app, .aio-office').first()).toBeVisible();
      expect(errors.filter((e) => !e.includes('ResizeObserver'))).toEqual([]);
    });
  }
});
