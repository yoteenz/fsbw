#!/usr/bin/env node
/**
 * Batch-generate missing closure/frontal color hero PNGs via Fal image edit.
 * Bundles are excluded — closures and frontals only.
 *
 * Prerequisites:
 *   FAL_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   node scripts/bcf/generate-bcf-cf-photo-manifest.mjs
 *   node scripts/bcf/pregenerate-bcf-cf-photos.mjs
 *   node scripts/bcf/sync-bcf-cf-photo-manifest.mjs
 *
 * Or: npm run bcf:cf-photos:batch
 *
 * Env:
 *   STORAGE_BUCKET=live-preview
 *   BCF_CF_PHOTO_FAL_MODEL=fal-ai/nano-banana-pro/edit
 *   DRY_RUN=1
 *   LIMIT=5
 *   FORCE=1
 *   SLEEP_MS=2000
 */
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvFiles, publicStorageUrl, sleep } from './bcfVideoEnv.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = join(__dirname, 'manifests', 'bcf-cf-photos-v1.json');

loadEnvFiles();

const bucket = process.env.STORAGE_BUCKET?.trim() || 'live-preview';
const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
const force = process.env.FORCE === '1' || process.env.FORCE === 'true';
const limit = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : 0;
const sleepMs = parseInt(process.env.SLEEP_MS || '2000', 10);
const falKey = process.env.FAL_KEY?.trim() || '';
const supabaseUrl = process.env.SUPABASE_URL?.trim() || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';
const falModel = process.env.BCF_CF_PHOTO_FAL_MODEL?.trim() || 'fal-ai/nano-banana-pro/edit';
const resolution = process.env.BCF_CF_PHOTO_RESOLUTION?.trim() || '2K';

async function downloadUrlToBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function objectExists(supabase, path) {
  const { error } = await supabase.storage.from(bucket).download(path);
  return !error;
}

async function uploadBuffer(supabase, path, buf, contentType) {
  const { error } = await supabase.storage.from(bucket).upload(path, buf, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`Upload ${path}: ${error.message}`);
}

async function generateColorPhoto(fal, sourcePhotoUrl, prompt) {
  const result = await fal.subscribe(falModel, {
    input: {
      prompt,
      image_urls: [sourcePhotoUrl],
      aspect_ratio: 'auto',
      resolution,
      output_format: 'png',
      num_images: 1,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS' && update.logs?.length) {
        update.logs.slice(-1).forEach((log) => console.log('  fal:', log.message));
      }
    },
  });
  const url = result?.data?.images?.[0]?.url;
  if (!url) {
    throw new Error(`Fal returned no image URL: ${JSON.stringify(result?.data).slice(0, 400)}`);
  }
  return url;
}

async function main() {
  if (!existsSync(MANIFEST_PATH)) {
    console.error('Missing manifest — run: node scripts/bcf/generate-bcf-cf-photo-manifest.mjs');
    process.exit(1);
  }
  if (!dryRun && (!falKey || !supabaseUrl || !supabaseKey)) {
    console.error('Requires FAL_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or DRY_RUN=1)');
    process.exit(1);
  }

  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  let items = manifest.items || [];
  if (!force) {
    items = items.filter((row) => row.status === 'missing' || (!row.hasPhoto && row.status !== 'ready'));
  }
  if (limit > 0) items = items.slice(0, limit);

  const supabase = dryRun ? null : createClient(supabaseUrl, supabaseKey);
  const { fal } = dryRun ? { fal: null } : await import('@fal-ai/client');
  if (!dryRun) fal.config({ credentials: falKey });

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  console.log(
    `BCF CF photo batch: rows=${items.length} model=${falModel} resolution=${resolution} dryRun=${dryRun} force=${force}`
  );

  for (let i = 0; i < items.length; i++) {
    const row = items[i];
    const label = `${i + 1}/${items.length} ${row.productKey}`;
    try {
      if (!force && supabase) {
        const exists = await objectExists(supabase, row.photoStoragePath);
        if (exists) {
          skipped++;
          row.status = 'ready';
          row.hasPhoto = true;
          console.log(`[skip exists] ${label} → ${row.photoStoragePath}`);
          continue;
        }
      }

      if (dryRun) {
        console.log(`[dry-run] ${label} ← ${row.sourcePhotoStoragePath}`);
        continue;
      }

      const sourceUrl =
        row.sourcePhotoUrl || publicStorageUrl(supabaseUrl, bucket, row.sourcePhotoStoragePath);
      console.log(`[gen] ${label}`);
      const imageUrl = await generateColorPhoto(fal, sourceUrl, row.prompt);
      const pngBuf = await downloadUrlToBuffer(imageUrl);
      await uploadBuffer(supabase, row.photoStoragePath, pngBuf, 'image/png');

      row.status = 'ready';
      row.hasPhoto = true;
      row.generatedAt = new Date().toISOString();
      generated++;
      console.log(`[ok] ${label} → ${row.photoStoragePath}`);
      if (sleepMs > 0) await sleep(sleepMs);
    } catch (e) {
      failed++;
      row.status = 'failed';
      row.lastError = e instanceof Error ? e.message : String(e);
      console.error(`[fail] ${label}`, row.lastError);
    }
  }

  if (!dryRun) {
    manifest.updatedAt = new Date().toISOString();
    manifest.summary = {
      total: manifest.items.length,
      ready: manifest.items.filter((i) => i.status === 'ready').length,
      missing: manifest.items.filter((i) => i.status === 'missing').length,
      failed: manifest.items.filter((i) => i.status === 'failed').length,
    };
    writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  }

  console.log(`Done. generated=${generated} skipped=${skipped} failed=${failed} dryRun=${dryRun}`);
  if (generated > 0 && !dryRun) {
    console.log('Run: node scripts/bcf/sync-bcf-cf-photo-manifest.mjs');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
