#!/usr/bin/env node
/**
 * Batch-generate email hero scenes by category (Account → Orders → Rewards → Affiliate → Shop).
 *
 * Mode A — local Fal (needs FAL_KEY in env or .env.local / .env.wig-preview):
 *   npm run email:generate-heroes:batch
 *
 * Mode B — production Vercel (uses FAL_KEY on Vercel; needs EMAIL_SEND_SECRET):
 *   PRODUCTION_URL=https://fsbw.vercel.app EMAIL_SEND_SECRET=... npm run email:generate-heroes:batch:production
 *
 * Optional:
 *   CATEGORY=orders          — single category only (account|orders|rewards|affiliate|shop|all)
 *   FORCE=1                  — regenerate even if file exists (local mode)
 *   SLEEP_MS=2000            — delay between templates
 */
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const CATEGORY_ORDER = ['account', 'orders', 'rewards', 'affiliate', 'shop'];

const CATEGORY_TEMPLATES = {
  account: [
    'welcome', 'email_verification', 'email_confirmed', 'password_reset', 'password_reset_success',
    'password_changed', 'profile_updated', 'email_updated', 'account_login_alert', 'newsletter',
  ],
  orders: [
    'order_received', 'order_confirmed', 'order_processing', 'order_shipped', 'order_out_for_delivery',
    'order_delivered', 'order_delayed', 'order_canceled', 'payment_received', 'partially_shipped',
  ],
  rewards: [
    'points_earned', 'points_redeemed', 'points_expiring', 'voucher_expiring', 'referral_redeemed',
    'digital_cash_update', 'membership_welcome', 'tier_upgraded', 'birthday_reward', 'special_offer',
  ],
  affiliate: [
    'affiliate_content_received', 'affiliate_content_pending', 'affiliate_content_approved',
    'affiliate_content_denied', 'affiliate_points_earned', 'affiliate_payment_sent',
  ],
  shop: [
    'back_in_stock', 'wishlist_price_drop', 'consult_offer_sent', 'meeting_reschedule', 'meeting_cancel',
  ],
};

function loadEnvFiles() {
  for (const name of ['.env.local', '.env.wig-preview', '.env.wig-preview.txt', '.env']) {
    const path = join(ROOT, name);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      if (process.env[key]) continue;
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

function templatesForRun() {
  const cat = (process.env.CATEGORY || 'all').trim().toLowerCase();
  if (cat === 'all') {
    return CATEGORY_ORDER.flatMap((c) => CATEGORY_TEMPLATES[c]);
  }
  return CATEGORY_TEMPLATES[cat] || [];
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function runLocalGenerate(templates) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env, TEMPLATES: templates.join(',') };
    const child = spawn('node', ['scripts/generate-email-hero-assets.mjs'], {
      cwd: ROOT,
      env,
      stdio: 'inherit',
    });
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))));
  });
}

async function runProductionBatch(templates) {
  const base = (process.env.PRODUCTION_URL || 'https://fsbw.vercel.app').replace(/\/$/, '');
  const secret = process.env.EMAIL_SEND_SECRET?.trim();
  if (!secret) {
    console.error('Production batch requires EMAIL_SEND_SECRET');
    process.exit(1);
  }
  const sleepMs = parseInt(process.env.SLEEP_MS || '2500', 10);
  const manifestPath = join(ROOT, 'public/assets/email/heroes/manifest.json');
  let ready = loadManifest(manifestPath);
  let ok = 0;
  let fail = 0;

  for (const templateType of templates) {
    console.log(`\n[production] ${templateType}…`);
    try {
      const res = await fetch(`${base}/api/admin/generate-email-hero`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Email-Send-Secret': secret,
        },
        body: JSON.stringify({ templateType }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error('  FAIL', res.status, data.error || data);
        fail += 1;
      } else {
        console.log('  OK', data.publicUrl || '');
        ready.add(templateType);
        writeManifest(manifestPath, ready);
        ok += 1;
      }
    } catch (e) {
      console.error('  FAIL', e instanceof Error ? e.message : e);
      fail += 1;
    }
    if (sleepMs > 0) await sleep(sleepMs);
  }
  console.log(`\nProduction batch done: ${ok} ok, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

function loadManifest(manifestPath) {
  const ready = new Set();
  if (!existsSync(manifestPath)) return ready;
  try {
    const raw = JSON.parse(readFileSync(manifestPath, 'utf8'));
    for (const t of raw.ready || []) ready.add(t);
  } catch {
    /* empty */
  }
  return ready;
}

function writeManifest(manifestPath, ready) {
  mkdirSync(dirname(manifestPath), { recursive: true });
  writeFileSync(
    manifestPath,
    JSON.stringify({ ready: [...ready].sort(), updatedAt: new Date().toISOString() }, null, 2)
  );
}

async function runLocalByCategory() {
  const categories =
    (process.env.CATEGORY || 'all').trim().toLowerCase() === 'all'
      ? CATEGORY_ORDER
      : [(process.env.CATEGORY || 'all').trim().toLowerCase()];

  for (const category of categories) {
    const templates = CATEGORY_TEMPLATES[category];
    if (!templates) {
      console.error('Unknown category:', category);
      process.exit(1);
    }
    console.log(`\n========== ${category.toUpperCase()} (${templates.length}) ==========\n`);
    await runLocalGenerate(templates);
  }
}

async function main() {
  loadEnvFiles();
  const mode = (process.env.BATCH_MODE || 'local').trim().toLowerCase();
  const templates = templatesForRun();

  if (templates.length === 0) {
    console.error('No templates for CATEGORY=', process.env.CATEGORY);
    process.exit(1);
  }

  console.log(`Batch email heroes — mode=${mode}, count=${templates.length}`);

  if (mode === 'production') {
    await runProductionBatch(templates);
    return;
  }

  if (!process.env.FAL_KEY?.trim()) {
    console.error(
      'FAL_KEY not set. Add to Cursor Cloud Agent secrets (.env.local) or run production batch:\n' +
        '  BATCH_MODE=production EMAIL_SEND_SECRET=... npm run email:generate-heroes:batch'
    );
    process.exit(1);
  }

  if ((process.env.CATEGORY || 'all').trim().toLowerCase() === 'all') {
    await runLocalByCategory();
  } else {
    await runLocalGenerate(templates);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
