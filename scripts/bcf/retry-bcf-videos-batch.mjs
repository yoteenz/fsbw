#!/usr/bin/env node
/**
 * Resume BCF video batch: regenerate failed + missing rows, refresh manifest, sync storefront.
 *
 * Prerequisites: FAL_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (see .env.wig-preview.example.txt)
 *
 * Usage:
 *   npm run bcf:videos:retry
 *   DRY_RUN=1 npm run bcf:videos:retry
 *   LIMIT=3 npm run bcf:videos:retry
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvFiles } from './bcfVideoEnv.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

loadEnvFiles();

const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
const falKey = process.env.FAL_KEY?.trim() || '';
const supabaseUrl = process.env.SUPABASE_URL?.trim() || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';

if (!dryRun && (!falKey || !supabaseUrl || !supabaseKey)) {
  console.error('[bcf:videos:retry] Missing credentials.');
  console.error('Set FAL_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in Cursor Cloud environment (or .env.local).');
  console.error('See .env.wig-preview.example.txt');
  process.exit(1);
}

function run(script, extraEnv = {}) {
  const env = {
    ...process.env,
    SKIP_WEBM: process.env.SKIP_WEBM || '1',
    RETRY_PENDING: '1',
    FORCE: process.env.FORCE || '1',
    ...extraEnv,
  };
  const r = spawnSync('node', [join(__dirname, script)], {
    cwd: ROOT,
    env,
    stdio: 'inherit',
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

console.log('[bcf:videos:retry] Phase 1 — regenerate failed + missing (RETRY_PENDING=1)');
run('pregenerate-bcf-videos.mjs');
console.log('[bcf:videos:retry] Phase 2 — rescan Supabase storage');
run('generate-bcf-video-manifest.mjs');
if (!dryRun) {
  console.log('[bcf:videos:retry] Phase 3 — sync public manifest + generated TS');
  run('sync-bcf-video-manifest.mjs');
} else {
  console.log('[bcf:videos:retry] Phase 3 skipped (DRY_RUN=1)');
}
console.log('[bcf:videos:retry] Done. Commit public/assets/bcf/videos/manifest.json and bcfPdpHeroVideos.generated.ts if changed.');
