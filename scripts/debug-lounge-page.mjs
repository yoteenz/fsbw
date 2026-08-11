import { chromium } from 'playwright';

const BASE = 'http://localhost:3001';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(`${BASE}/lobby/lounge`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(3000);
await page.screenshot({ path: '/opt/cursor/artifacts/screenshots/slay-tip-editorial/debug-lobby.png', fullPage: true });
const text = await page.locator('body').innerText();
console.log('BODY TEXT SAMPLE:', text.slice(0, 800));
const buttons = await page.locator('button').allTextContents();
console.log('BUTTONS:', buttons.slice(0, 30));
await browser.close();
