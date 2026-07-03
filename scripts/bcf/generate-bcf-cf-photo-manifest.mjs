#!/usr/bin/env node
/**
 * Scan closure/frontal color photo catalog and detect missing PNG assets.
 * Writes scripts/bcf/manifests/bcf-cf-photos-v1.json
 *
 * Usage:
 *   node scripts/bcf/generate-bcf-cf-photo-manifest.mjs
 *
 * Env:
 *   STORAGE_BUCKET=live-preview
 *   DRY_RUN=1 — summary only, no write
 */
import { createClient } from '@supabase/supabase-js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BCF_CF_PHOTO_PROMPT_VERSION } from './bcfCfPhotoPrompt.mjs';
import { loadBcfCfPhotoCatalog } from './bcfCfPhotoCatalog.mjs';
import { buildBcfCfPhotoPrompt } from './bcfCfPhotoPrompt.mjs';
import { loadEnvFiles } from './bcfVideoEnv.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = join(__dirname, 'manifests', 'bcf-cf-photos-v1.json');

loadEnvFiles();

const bucket = process.env.STORAGE_BUCKET?.trim() || 'live-preview';
const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
const supabaseUrl = process.env.SUPABASE_URL?.trim() || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';
const falModel = process.env.BCF_CF_PHOTO_FAL_MODEL?.trim() || 'fal-ai/nano-banana-pro/edit';

async function objectExists(supabase, path) {
  const { error } = await supabase.storage.from(bucket).download(path);
  return !error;
}

async function resolveStatus(supabase, row) {
  let hasPhoto = false;
  if (supabase) {
    hasPhoto = await objectExists(supabase, row.photoStoragePath);
  }
  const status = hasPhoto ? 'ready' : 'missing';
  return {
    ...row,
    status,
    hasPhoto,
    prompt: buildBcfCfPhotoPrompt(row.colorName, row.hexCode),
  };
}

async function main() {
  const catalog = loadBcfCfPhotoCatalog();
  const supabase =
    supabaseUrl && supabaseKey && !dryRun ? createClient(supabaseUrl, supabaseKey) : null;

  if (!dryRun && !supabase) {
    console.warn('No Supabase credentials — manifest will mark all items as missing (offline mode).');
  }

  const items = [];
  for (const row of catalog) {
    items.push(await resolveStatus(supabase, row));
  }

  const summary = {
    total: items.length,
    ready: items.filter((i) => i.status === 'ready').length,
    missing: items.filter((i) => i.status === 'missing').length,
    failed: items.filter((i) => i.status === 'failed').length,
  };

  console.log(
    `BCF CF photo manifest: total=${summary.total} ready=${summary.ready} missing=${summary.missing}`
  );
  if (summary.missing > 0) {
    console.log(
      'Missing:',
      items
        .filter((i) => i.status === 'missing')
        .slice(0, 8)
        .map((i) => i.productKey)
        .join(', '),
      summary.missing > 8 ? '…' : ''
    );
  }

  if (dryRun) return;

  mkdirSync(dirname(MANIFEST_PATH), { recursive: true });
  writeFileSync(
    MANIFEST_PATH,
    JSON.stringify(
      {
        version: 1,
        promptVersion: BCF_CF_PHOTO_PROMPT_VERSION,
        generatedAt: new Date().toISOString(),
        bucket,
        falModel,
        resolution: '2K',
        outputFormat: 'png',
        items,
        summary,
      },
      null,
      2
    )
  );
  console.log('Wrote', MANIFEST_PATH);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
