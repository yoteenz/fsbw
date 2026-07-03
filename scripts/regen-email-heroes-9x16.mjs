#!/usr/bin/env node
/**
 * Regenerate all 41 email hero WebPs at 9:16 and sync repo assets.
 *
 * Mode A (local Fal):
 *   FAL_KEY + SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *   FORCE=1 batch → public/assets/email/heroes/*.webp
 *
 * Mode B (production Vercel Fal):
 *   EMAIL_SEND_SECRET — calls /api/admin/generate-email-hero per template
 *   then downloads WebPs from public Supabase storage into the repo.
 *
 * Usage:
 *   npm run email:regen-heroes:9x16
 *   DRY_RUN=1 npm run email:regen-heroes:9x16
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

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

function run(nodeArgs, extraEnv = {}) {
  const r = spawnSync('node', nodeArgs, {
    cwd: ROOT,
    env: { ...process.env, ...extraEnv },
    stdio: 'inherit',
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

loadEnvFiles();

const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
const falKey = process.env.FAL_KEY?.trim() || '';
const supabaseUrl = process.env.SUPABASE_URL?.trim() || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';
const emailSendSecret = process.env.EMAIL_SEND_SECRET?.trim() || '';

const localReady = Boolean(falKey && supabaseUrl && supabaseKey);
const productionReady = Boolean(emailSendSecret);

if (!dryRun && !localReady && !productionReady) {
  console.error('[email:regen-heroes:9x16] Missing credentials.');
  console.error('Local:  FAL_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  console.error('Or production: EMAIL_SEND_SECRET (uses Vercel FAL_KEY + uploads to Supabase)');
  console.error('See .env.wig-preview.example.txt and Cursor Cloud environment secrets.');
  process.exit(1);
}

if (dryRun) {
  console.log('[dry-run] Would regenerate 41 email heroes at 9:16');
  console.log('mode=', localReady ? 'local' : productionReady ? 'production' : 'none');
  process.exit(0);
}

if (localReady) {
  console.log('[email:regen-heroes:9x16] Local Fal batch (FORCE=1)…');
  run(['scripts/batch-email-heroes.mjs'], { FORCE: '1', SLEEP_MS: process.env.SLEEP_MS || '2000' });
  console.log('[email:regen-heroes:9x16] Upload heroes + icons to Supabase…');
  run(['scripts/upload-email-assets.mjs']);
} else {
  console.log('[email:regen-heroes:9x16] Production batch via Vercel API…');
  run(['scripts/batch-email-heroes.mjs'], {
    BATCH_MODE: 'production',
    PRODUCTION_URL: process.env.PRODUCTION_URL || 'https://fsbw.vercel.app',
    SLEEP_MS: process.env.SLEEP_MS || '2500',
  });
  console.log('[email:regen-heroes:9x16] Download heroes from Supabase into repo…');
  run(['scripts/download-email-heroes-from-storage.mjs']);
}

console.log('[email:regen-heroes:9x16] Sync hero manifest TS…');
run(['scripts/sync-email-hero-manifest.mjs']);
console.log('[email:regen-heroes:9x16] Done. Commit public/assets/email/heroes/*.webp + manifest + heroManifestReady.ts');
