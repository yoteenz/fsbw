import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = 'http://127.0.0.1:5173';
const OUT = '/opt/cursor/artifacts/ifta-three-mode';

const shots = [
  { name: 'public-mobile', url: '/services/ifta-filing', w: 393, h: 852 },
  { name: 'public-desktop', url: '/services/ifta-filing', w: 1440, h: 900 },
  { name: 'client-mobile', url: '/portal/workspaces/ifta/2026-Q3', w: 393, h: 852 },
  { name: 'client-tablet', url: '/portal/workspaces/ifta/2026-Q3', w: 834, h: 1194 },
  { name: 'client-desktop', url: '/portal/workspaces/ifta/2026-Q3', w: 1440, h: 900 },
  { name: 'staff-queue-mobile', url: '/office/workspaces/ifta', w: 393, h: 852 },
  { name: 'staff-queue-tablet', url: '/office/workspaces/ifta', w: 834, h: 1194 },
  { name: 'staff-queue-desktop', url: '/office/workspaces/ifta', w: 1440, h: 900 },
  { name: 'staff-case-mobile', url: '/office/workspaces/ifta/client-c/2026-Q3', w: 393, h: 852 },
  { name: 'staff-case-tablet', url: '/office/workspaces/ifta/client-c/2026-Q3', w: 834, h: 1194 },
  { name: 'staff-case-desktop', url: '/office/workspaces/ifta/client-c/2026-Q3', w: 1440, h: 900 },
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
async function primePioneer(page) {
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => {
    const key = 'aio_debug_store';
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const s = JSON.parse(raw);
    s.portalClientId = 'client-c';
    localStorage.setItem(key, JSON.stringify(s));
  });
}

for (const s of shots) {
  const page = await browser.newPage({ viewport: { width: s.w, height: s.h } });
  if (s.url.includes('/portal/workspaces/ifta')) await primePioneer(page);
  await page.goto(`${BASE}${s.url}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: true });
  await page.close();
  console.log('captured', s.name);
}
await browser.close();
