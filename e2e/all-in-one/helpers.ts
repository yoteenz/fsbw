import type { Page } from '@playwright/test';

const DEMO_STORE_KEY = 'aio_debug_store';
const BASE = '/all-in-one';

/** Select office staff with security.read (manager/admin) for gated system pages */
export async function useOfficeSecurityStaff(page: Page): Promise<void> {
  await page.goto(`${BASE}/office`);
  await page.waitForSelector('.aio-office');
  const staffSelect = page.getByLabel('Office staff identity');
  await staffSelect.selectOption('staff-1');
  await page.waitForTimeout(300);
}
