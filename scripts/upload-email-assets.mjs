#!/usr/bin/env node
/**
 * Upload reusable Frontal Slayer email assets to Supabase Storage (email-assets bucket).
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Run migration 20260703120000_email_assets_bucket.sql first (or script creates bucket).
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BUCKET = process.env.EMAIL_ASSETS_BUCKET?.trim() || 'email-assets';

const ASSETS = [
  { local: 'public/assets/marble-half.png', remote: 'marble-half.png', contentType: 'image/png' },
  { local: 'public/assets/email/icons/rose-accent.png', remote: 'email/icons/rose-accent.png', contentType: 'image/png' },
  { local: 'public/assets/email/icons/loyalty-points.png', remote: 'email/icons/loyalty-points.png', contentType: 'image/png' },
  { local: 'public/assets/email/icons/hub-icon.png', remote: 'email/icons/hub-icon.png', contentType: 'image/png' },
  { local: 'public/assets/email/icons/instagram-icon.png', remote: 'email/icons/instagram-icon.png', contentType: 'image/png' },
  { local: 'public/assets/email/icons/twitter-icon.png', remote: 'email/icons/twitter-icon.png', contentType: 'image/png' },
  { local: 'public/assets/email/icons/facebook-icon.png', remote: 'email/icons/facebook-icon.png', contentType: 'image/png' },
  { local: 'public/assets/email/slayer-logo.png', remote: 'email/slayer-logo.png', contentType: 'image/png' },
];

function collectHeroAssets() {
  const heroesDir = path.join(ROOT, 'public/assets/email/heroes');
  if (!fs.existsSync(heroesDir)) return [];
  return fs
    .readdirSync(heroesDir)
    .filter((f) => f.endsWith('.webp'))
    .map((f) => ({
      local: `public/assets/email/heroes/${f}`,
      remote: `heroes/${f}`,
      contentType: 'image/webp',
    }));
}

function mimeFromExt(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.svg') return 'image/svg+xml';
  return 'application/octet-stream';
}

async function main() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const { data: existing } = await supabase.storage.getBucket(BUCKET);
  if (!existing) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
    });
    if (error && !/already exists/i.test(error.message)) {
      console.error('Bucket create failed:', error.message);
      process.exit(1);
    }
    console.log(`Created bucket "${BUCKET}"`);
  }

  for (const entry of [...ASSETS, ...collectHeroAssets()]) {
    const abs = path.join(ROOT, entry.local);
    if (!fs.existsSync(abs)) {
      console.warn('Skip missing:', entry.local);
      continue;
    }
    const bytes = fs.readFileSync(abs);
    const contentType = entry.contentType || mimeFromExt(abs);
    const { error } = await supabase.storage.from(BUCKET).upload(entry.remote, bytes, {
      upsert: true,
      contentType,
    });
    if (error) {
      console.error('Upload failed', entry.remote, error.message);
      process.exit(1);
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(entry.remote);
    console.log('Uploaded', entry.remote, '→', data.publicUrl);
  }

  console.log('Done. Email templates will use Supabase public URLs when SUPABASE_URL is set.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
