#!/usr/bin/env node
/**
 * Scan BCF hero photo catalog and detect missing video assets.
 * Writes scripts/bcf/manifests/bcf-videos-v1.json for the batch generator.
 *
 * Usage:
 *   node scripts/bcf/generate-bcf-video-manifest.mjs
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/bcf/generate-bcf-video-manifest.mjs
 *
 * Env:
 *   STORAGE_BUCKET=live-preview
 *   BCF_VIDEO_PREFIX=BCF/videos/v1
 *   DRY_RUN=1 — print summary only, do not write manifest
 */
import { createClient } from '@supabase/supabase-js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bcfVideoStoragePaths, loadBcfProductCatalog } from './bcfVideoCatalog.mjs';
import { BCF_VIDEO_PROMPT, BCF_VIDEO_PROMPT_VERSION } from './bcfVideoPrompt.mjs';
import { loadEnvFiles, publicStorageUrl } from './bcfVideoEnv.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = join(__dirname, 'manifests', 'bcf-videos-v1.json');

loadEnvFiles();

const bucket = process.env.STORAGE_BUCKET?.trim() || 'live-preview';
const prefix = process.env.BCF_VIDEO_PREFIX?.trim() || 'BCF/videos/v1';
const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
const supabaseUrl = process.env.SUPABASE_URL?.trim() || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';

async function objectExists(supabase, path) {
  const { error } = await supabase.storage.from(bucket).download(path);
  return !error;
}

async function resolveStatus(supabase, row) {
  const { mp4StoragePath, webmStoragePath } = bcfVideoStoragePaths(row.productKey, prefix);
  let hasMp4 = false;
  let hasWebm = false;
  let hasLegacy = false;

  if (supabase) {
    hasMp4 = await objectExists(supabase, mp4StoragePath);
    hasWebm = await objectExists(supabase, webmStoragePath);
    if (row.legacyVideoStoragePath) {
      hasLegacy = await objectExists(supabase, row.legacyVideoStoragePath);
    }
  }

  const ready = hasMp4 || hasLegacy;
  const status = ready ? (hasMp4 && hasWebm ? 'ready' : hasMp4 ? 'ready_mp4_only' : 'ready_legacy') : 'missing';

  return {
    ...row,
    mp4StoragePath,
    webmStoragePath,
    status,
    hasMp4,
    hasWebm,
    hasLegacy,
    prompt: BCF_VIDEO_PROMPT,
  };
}

async function main() {
  const catalog = loadBcfProductCatalog();
  const supabase =
    supabaseUrl && supabaseKey && !dryRun ? createClient(supabaseUrl, supabaseKey) : null;

  if (!dryRun && !supabase) {
    console.warn('No Supabase credentials — manifest will mark all items as missing (offline mode).');
  }

  const items = [];
  for (const row of catalog) {
    items.push(await resolveStatus(supabase, row));
  }

  const missing = items.filter((i) => i.status === 'missing');
  const ready = items.filter((i) => i.status !== 'missing');

  const manifest = {
    version: 1,
    promptVersion: BCF_VIDEO_PROMPT_VERSION,
    generatedAt: new Date().toISOString(),
    bucket,
    storagePrefix: prefix,
    falModel: process.env.BCF_VIDEO_FAL_MODEL?.trim() || 'fal-ai/kling-video/v3/pro/image-to-video',
    aspectRatio: '9:16',
    durationSeconds: process.env.BCF_VIDEO_DURATION?.trim() || '5',
    items,
    summary: {
      total: items.length,
      ready: ready.length,
      missing: missing.length,
      readyLegacy: items.filter((i) => i.status === 'ready_legacy').length,
      readyMp4Only: items.filter((i) => i.status === 'ready_mp4_only').length,
    },
  };

  console.log(
    `BCF video manifest: total=${manifest.summary.total} ready=${manifest.summary.ready} missing=${manifest.summary.missing}`
  );
  if (missing.length) {
    console.log('Missing:', missing.slice(0, 8).map((i) => i.productKey).join(', '), missing.length > 8 ? '…' : '');
  }

  if (dryRun) {
    console.log('[dry-run] not writing', MANIFEST_PATH);
    return;
  }

  mkdirSync(dirname(MANIFEST_PATH), { recursive: true });
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log('Wrote', MANIFEST_PATH);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
