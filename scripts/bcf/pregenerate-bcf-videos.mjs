#!/usr/bin/env node
/**
 * Batch-generate missing BCF product hero videos via Fal Kling v3 image-to-video.
 *
 * Prerequisites:
 *   FAL_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   node scripts/bcf/generate-bcf-video-manifest.mjs
 *   node scripts/bcf/pregenerate-bcf-videos.mjs
 *   node scripts/bcf/sync-bcf-video-manifest.mjs
 *
 * Or: npm run bcf:videos:batch
 *
 * Env:
 *   STORAGE_BUCKET=live-preview
 *   BCF_VIDEO_PREFIX=BCF/videos/v1
 *   BCF_VIDEO_FAL_MODEL=fal-ai/kling-video/v3/pro/image-to-video
 *   BCF_VIDEO_DURATION=5          — 4–6 supported by Kling v3
 *   DRY_RUN=1                   — no API calls
 *   LIMIT=5                     — process at most N missing items
 *   FORCE=1                     — regenerate even when mp4 exists
 *   SLEEP_MS=2000               — delay between jobs
 *   SKIP_PRODUCT_KEYS=bundles-curly-copper
 *   ONLY_PRODUCT_KEYS=bundles-wavy-cherry,bundles-straight-plum
 *   ONLY_COLOR_IDS=GINGER,CHERRY,RASPBERRY,TEAL,SLIME,CITRINE
 *   ONLY_FAILED=1               — retry manifest rows with status failed (circle back)
 *   RETRY_PENDING=1             — retry failed + missing rows only (safe resume batch)
 *   JOB_TIMEOUT_MS=600000         — max ms per Fal job before skip (default 10 min)
 *   DOWNLOAD_TIMEOUT_MS=120000  — max ms to download rendered MP4 (default 2 min)
 */
import { createClient } from '@supabase/supabase-js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { BCF_VIDEO_NEGATIVE_PROMPT, BCF_VIDEO_PROMPT } from './bcfVideoPrompt.mjs';
import { loadEnvFiles, publicStorageUrl, sleep, withTimeout } from './bcfVideoEnv.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const MANIFEST_PATH = join(__dirname, 'manifests', 'bcf-videos-v1.json');
const WORK_DIR = join(__dirname, '.work');

loadEnvFiles();

const bucket = process.env.STORAGE_BUCKET?.trim() || 'live-preview';
const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
const force = process.env.FORCE === '1' || process.env.FORCE === 'true';
const limit = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : 0;
const sleepMs = parseInt(process.env.SLEEP_MS || '2000', 10);
const skipWebm = process.env.SKIP_WEBM === '1' || process.env.SKIP_WEBM === 'true';
const falKey = process.env.FAL_KEY?.trim() || '';
const supabaseUrl = process.env.SUPABASE_URL?.trim() || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';
const falModel = process.env.BCF_VIDEO_FAL_MODEL?.trim() || 'fal-ai/kling-video/v3/pro/image-to-video';
const duration = process.env.BCF_VIDEO_DURATION?.trim() || '5';
const skipProductKeys = new Set(
  (process.env.SKIP_PRODUCT_KEYS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);
const onlyProductKeys = new Set(
  (process.env.ONLY_PRODUCT_KEYS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);
const onlyColorIds = new Set(
  (process.env.ONLY_COLOR_IDS || '')
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean),
);
const onlyFailed = process.env.ONLY_FAILED === '1' || process.env.ONLY_FAILED === 'true';
const retryPending = process.env.RETRY_PENDING === '1' || process.env.RETRY_PENDING === 'true';
const jobTimeoutMs = parseInt(process.env.JOB_TIMEOUT_MS || '600000', 10);
const downloadTimeoutMs = parseInt(process.env.DOWNLOAD_TIMEOUT_MS || '120000', 10);

function ffmpegAvailable() {
  const r = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  return r.status === 0;
}

async function downloadUrlToBuffer(url, label = 'download') {
  const res = await withTimeout(fetch(url), downloadTimeoutMs, `${label} fetch`);
  if (!res.ok) throw new Error(`Download failed ${res.status} ${url}`);
  return Buffer.from(await withTimeout(res.arrayBuffer(), downloadTimeoutMs, `${label} body`));
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

async function generateKlingVideo(fal, sourcePhotoUrl, prompt) {
  const result = await fal.subscribe(falModel, {
    input: {
      prompt,
      start_image_url: sourcePhotoUrl,
      duration,
      aspect_ratio: '9:16',
      generate_audio: false,
      negative_prompt: BCF_VIDEO_NEGATIVE_PROMPT,
      cfg_scale: 0.55,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS' && update.logs?.length) {
        update.logs.slice(-1).forEach((log) => console.log('  fal:', log.message));
      }
    },
  });
  const url = result?.data?.video?.url;
  if (!url) throw new Error(`Fal returned no video URL: ${JSON.stringify(result?.data).slice(0, 400)}`);
  return url;
}

function convertMp4ToWebm(mp4Path, webmPath) {
  const args = [
    '-y',
    '-i',
    mp4Path,
    '-c:v',
    'libvpx-vp9',
    '-b:v',
    '0',
    '-crf',
    '32',
    '-pix_fmt',
    'yuv420p',
    '-an',
    '-movflags',
    '+faststart',
    webmPath,
  ];
  const r = spawnSync('ffmpeg', args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error('ffmpeg WebM conversion failed');
}

function summarizeManifest(manifest) {
  manifest.updatedAt = new Date().toISOString();
  manifest.summary = {
    total: manifest.items.length,
    ready: manifest.items.filter((i) => i.status !== 'missing' && i.status !== 'failed').length,
    missing: manifest.items.filter((i) => i.status === 'missing').length,
    failed: manifest.items.filter((i) => i.status === 'failed').length,
  };
}

function persistManifest(manifest) {
  summarizeManifest(manifest);
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

async function main() {
  if (!existsSync(MANIFEST_PATH)) {
    console.error('Missing manifest — run: node scripts/bcf/generate-bcf-video-manifest.mjs');
    process.exit(1);
  }
  if (!dryRun && (!falKey || !supabaseUrl || !supabaseKey)) {
    console.error('Requires FAL_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or DRY_RUN=1)');
    process.exit(1);
  }

  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  let items = manifest.items || [];
  if (retryPending) {
    items = items.filter((row) => row.status === 'failed' || row.status === 'missing');
  } else if (!force) {
    items = items.filter((row) => row.status === 'missing' || (!row.hasMp4 && row.status !== 'ready_legacy'));
  }
  if (skipProductKeys.size > 0) {
    items = items.filter((row) => !skipProductKeys.has(row.productKey));
  }
  if (onlyProductKeys.size > 0) {
    items = items.filter((row) => onlyProductKeys.has(row.productKey));
  }
  if (onlyColorIds.size > 0) {
    items = items.filter((row) => onlyColorIds.has(String(row.colorId || '').toUpperCase()));
  }
  if (onlyFailed) {
    items = items.filter((row) => row.status === 'failed');
  }
  if (limit > 0) items = items.slice(0, limit);

  const supabase = dryRun ? null : createClient(supabaseUrl, supabaseKey);
  const { fal } = dryRun ? { fal: null } : await import('@fal-ai/client');
  if (!dryRun) fal.config({ credentials: falKey });

  const canWebm = !skipWebm && ffmpegAvailable();
  if (!skipWebm && !canWebm) {
    console.warn('ffmpeg not found — WebM outputs will be skipped (MP4 only).');
  }

  mkdirSync(WORK_DIR, { recursive: true });

  let ok = 0;
  let skipped = 0;
  let failed = 0;
  const failedKeys = [];

  console.log(
    `BCF video batch: rows=${items.length} model=${falModel} duration=${duration}s dryRun=${dryRun} force=${force} jobTimeoutMs=${jobTimeoutMs}`,
  );

  for (let i = 0; i < items.length; i++) {
    const row = items[i];
    const label = `${i + 1}/${items.length} ${row.productKey}`;
    try {
      if (!force && supabase) {
        const exists = await objectExists(supabase, row.mp4StoragePath);
        if (exists) {
          skipped++;
          console.log(`[skip exists] ${label}`);
          continue;
        }
        if (row.legacyVideoStoragePath && row.colorId === 'DEFAULT') {
          const hasLegacy = await objectExists(supabase, row.legacyVideoStoragePath);
          if (hasLegacy) {
            skipped++;
            console.log(`[skip legacy mov] ${label}`);
            continue;
          }
        }
      }

      if (dryRun) {
        console.log(`[dry-run] ${label} ← ${row.sourcePhotoStoragePath}`);
        continue;
      }

      const sourceUrl =
        row.sourcePhotoUrl || publicStorageUrl(supabaseUrl, bucket, row.sourcePhotoStoragePath);
      console.log(`[gen] ${label}`);
      const videoUrl = await withTimeout(
        generateKlingVideo(fal, sourceUrl, row.prompt || BCF_VIDEO_PROMPT),
        jobTimeoutMs,
        label,
      );
      const mp4Buf = await downloadUrlToBuffer(videoUrl, label);
      await uploadBuffer(supabase, row.mp4StoragePath, mp4Buf, 'video/mp4');

      if (canWebm) {
        const localMp4 = join(WORK_DIR, `${row.productKey}.mp4`);
        const localWebm = join(WORK_DIR, `${row.productKey}.webm`);
        writeFileSync(localMp4, mp4Buf);
        convertMp4ToWebm(localMp4, localWebm);
        const webmBuf = readFileSync(localWebm);
        await uploadBuffer(supabase, row.webmStoragePath, webmBuf, 'video/webm');
      }

      row.status = canWebm ? 'ready' : 'ready_mp4_only';
      row.hasMp4 = true;
      row.hasWebm = canWebm;
      row.generatedAt = new Date().toISOString();

      ok++;
      console.log(`[ok] ${label} → ${row.mp4StoragePath}`);
      if (!dryRun) persistManifest(manifest);
      if (sleepMs > 0) await sleep(sleepMs);
    } catch (e) {
      failed++;
      row.status = 'failed';
      row.lastError = e instanceof Error ? e.message : String(e);
      row.failedAt = new Date().toISOString();
      failedKeys.push(row.productKey);
      console.error(`[fail] ${label} — skipping, continuing batch`, row.lastError);
      if (!dryRun) persistManifest(manifest);
    }
  }

  if (!dryRun) persistManifest(manifest);

  console.log(`Done. generated=${ok} skipped=${skipped} failed=${failed} dryRun=${dryRun}`);
  if (failed > 0) {
    console.log('Failed product keys (circle back later):');
    console.log(failedKeys.join(','));
    console.log('Retry: ONLY_FAILED=1 FORCE=1 npm run bcf:videos:generate');
    console.log('Resume: RETRY_PENDING=1 FORCE=1 npm run bcf:videos:retry');
  }
  if (ok > 0 && !dryRun) {
    console.log('Run: node scripts/bcf/sync-bcf-video-manifest.mjs');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
