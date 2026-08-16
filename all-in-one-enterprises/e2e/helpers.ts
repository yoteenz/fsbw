import type { Page } from '@playwright/test';

const BASE = '';

export async function useOfficeSecurityStaff(page: Page): Promise<void> {
  await page.goto(`${BASE}/office`);
  await page.waitForSelector('.aio-office');
  const staffSelect = page.getByLabel('Office staff identity');
  await staffSelect.selectOption('staff-1');
  await page.waitForTimeout(300);
}
