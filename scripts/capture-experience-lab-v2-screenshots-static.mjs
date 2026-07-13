#!/usr/bin/env node
/**
 * Capture Experience Lab V2 review screenshots via static CSS harness (no full SPA boot).
 * Produces layout review artifacts at required viewports using production V2 CSS.
 */
import { mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const HARNESS = resolve(ROOT, 'docs/studio-os/experience-lab/v2-screenshots/review-harness.html');
const OUT_DIRS = [
  resolve(ROOT, 'docs/studio-os/experience-lab/v2-screenshots'),
  '/opt/cursor/artifacts/screenshots/experience-lab-v2',
];

for (const dir of OUT_DIRS) mkdirSync(dir, { recursive: true });

const VIEWPORTS = [
  { name: 'mobile-390x844', width: 390, height: 844, mode: 'mobile' },
  { name: 'mobile-430x932', width: 430, height: 932, mode: 'mobile' },
  { name: 'tablet-portrait-768x1024', width: 768, height: 1024, mode: 'mobile' },
  { name: 'desktop-1920x1080', width: 1920, height: 1080, mode: 'desktop' },
  { name: 'ultrawide-2560x1080', width: 2560, height: 1080, mode: 'desktop' },
];

const chrome = process.env.CHROME_BIN || 'google-chrome';
const written = [];

const USER_DATA = resolve(ROOT, '.tmp/chrome-screenshots');
mkdirSync(USER_DATA, { recursive: true });

for (const vp of VIEWPORTS) {
  const filename = `experience-lab-v2-${vp.name}.png`;
  const fileUrl = `file://${HARNESS}?mode=${vp.mode}`;
  for (const dir of OUT_DIRS) {
    const out = resolve(dir, filename);
    const args = [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      `--user-data-dir=${USER_DATA}/${vp.name}`,
      `--window-size=${vp.width},${vp.height}`,
      `--screenshot=${out}`,
      '--hide-scrollbars',
      '--default-background-color=0',
      '--virtual-time-budget=5000',
      fileUrl,
    ];
    const result = spawnSync(chrome, args, { timeout: 60000, stdio: 'pipe' });
    if (!existsSync(out) || result.status !== 0) {
      console.error(`Failed ${vp.name} -> ${out}:`, result.stderr?.toString()?.slice(0, 400) || result.error?.message);
      process.exit(1);
    }
    written.push(out);
  }
}

console.log('Experience Lab V2 review screenshots captured:');
for (const p of [...new Set(written)]) console.log(`  ${p}`);
