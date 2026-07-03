#!/usr/bin/env node
/**
 * Detect BCF hero videos whose first frame is darker than the source still (hair region).
 * Writes scripts/bcf/manifests/bcf-video-color-drift-v1.json for selective regen.
 *
 * Usage:
 *   node scripts/bcf/detect-bcf-video-color-drift.mjs
 *
 * Env:
 *   DRIFT_LUMA_DELTA=12     — flag when video hair luma is this many levels below source (0–255)
 *   DRIFT_LIMIT=0           — scan at most N rows (0 = all)
 *   INCLUDE_LEGACY=1        — also scan ready_legacy .mov defaults
 */
import { createClient } from '@supabase/supabase-js';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';
import { loadEnvFiles, publicStorageUrl } from './bcfVideoEnv.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = join(__dirname, 'manifests', 'bcf-videos-v1.json');
const REPORT_PATH = join(__dirname, 'manifests', 'bcf-video-color-drift-v1.json');
const WORK_DIR = join(__dirname, '.work', 'drift-scan');

loadEnvFiles();

const bucket = process.env.STORAGE_BUCKET?.trim() || 'live-preview';
const supabaseUrl = process.env.SUPABASE_URL?.trim() || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';
const lumaDeltaThreshold = parseFloat(process.env.DRIFT_LUMA_DELTA || '12');
const limit = process.env.DRIFT_LIMIT ? parseInt(process.env.DRIFT_LIMIT, 10) : 0;
const includeLegacy = process.env.INCLUDE_LEGACY === '1' || process.env.INCLUDE_LEGACY === 'true';

function ffmpegAvailable() {
  return spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0;
}

async function downloadBuffer(supabase, path) {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error) throw new Error(`Download ${path}: ${error.message}`);
  return Buffer.from(await data.arrayBuffer());
}

function extractFrameAt(videoBuf, outPng, seconds = 0) {
  const input = join(WORK_DIR, `_in_${Date.now()}_${seconds}.mp4`);
  writeFileSync(input, videoBuf);
  const args =
    seconds > 0
      ? ['-y', '-ss', String(seconds), '-i', input, '-frames:v', '1', '-f', 'image2', outPng]
      : ['-y', '-i', input, '-frames:v', '1', '-f', 'image2', outPng];
  const r = spawnSync('ffmpeg', args, { stdio: 'ignore' });
  try {
    unlinkSync(input);
  } catch {
    /* ignore */
  }
  if (r.status !== 0 || !existsSync(outPng)) {
    throw new Error(`ffmpeg frame extract failed at ${seconds}s`);
  }
}

async function maxHairLumaDelta(sourcePng, videoBuf, productKey) {
  const sampleTimes = [0, 0.5, 1, 2, 2.5];
  const sourceStats = await hairRegionMeanLuma(sourcePng);
  let maxDelta = 0;
  let worstAt = 0;
  let worstFrameLuma = sourceStats.meanLuma;

  for (const t of sampleTimes) {
    const framePng = join(WORK_DIR, `${productKey}-frame-${t}.png`);
    extractFrameAt(videoBuf, framePng, t);
    const frameStats = await hairRegionMeanLuma(framePng);
    const delta = sourceStats.meanLuma - frameStats.meanLuma;
    if (delta > maxDelta) {
      maxDelta = delta;
      worstAt = t;
      worstFrameLuma = frameStats.meanLuma;
    }
  }

  return {
    sourceMeanLuma: Math.round(sourceStats.meanLuma * 10) / 10,
    worstFrameMeanLuma: Math.round(worstFrameLuma * 10) / 10,
    lumaDelta: Math.round(maxDelta * 10) / 10,
    worstAtSeconds: worstAt,
    sourcePixels: sourceStats.pixelCount,
  };
}

/** Mean luma of non-white product pixels (hair + lace), ignoring pure #FFFFFF background. */
async function hairRegionMeanLuma(imagePath) {
  const { data, info } = await sharp(imagePath)
    .ensureAlpha()
    .resize(512, 512, { fit: 'inside' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  let sum = 0;
  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Skip near-pure-white background
    if (r > 248 && g > 248 && b > 248) continue;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    sum += luma;
    count++;
  }
  if (count === 0) return { meanLuma: 0, pixelCount: 0 };
  return { meanLuma: sum / count, pixelCount: count };
}

async function compareRow(supabase, row) {
  const videoPath =
    row.hasMp4 && row.mp4StoragePath
      ? row.mp4StoragePath
      : row.status === 'ready_legacy'
        ? row.legacyVideoStoragePath
        : null;
  if (!videoPath || !row.sourcePhotoStoragePath) {
    return { skipped: true, reason: 'no_video_or_source' };
  }

  const sourcePng = join(WORK_DIR, `${row.productKey}-source.png`);
  const [sourceBuf, videoBuf] = await Promise.all([
    downloadBuffer(supabase, row.sourcePhotoStoragePath),
    downloadBuffer(supabase, videoPath),
  ]);
  writeFileSync(sourcePng, sourceBuf);
  const stats = await maxHairLumaDelta(sourcePng, videoBuf, row.productKey);
  const darkened = stats.lumaDelta >= lumaDeltaThreshold;

  return {
    skipped: false,
    ...stats,
    darkened,
  };
}

async function main() {
  if (!existsSync(MANIFEST_PATH)) {
    console.error('Missing manifest:', MANIFEST_PATH);
    process.exit(1);
  }
  if (!supabaseUrl || !supabaseKey) {
    console.error('Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  if (!ffmpegAvailable()) {
    console.error('Requires ffmpeg on PATH');
    process.exit(1);
  }

  mkdirSync(WORK_DIR, { recursive: true });
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  let items = (manifest.items || []).filter((row) => {
    if (row.colorId === 'DEFAULT' && !includeLegacy) return false;
    if (row.status === 'missing' || row.status === 'failed') return false;
    if (row.status === 'ready_legacy') return includeLegacy;
    return row.hasMp4 || row.status === 'ready_mp4_only' || row.status === 'ready';
  });
  if (limit > 0) items = items.slice(0, limit);

  const supabase = createClient(supabaseUrl, supabaseKey);
  const results = [];
  let darkCount = 0;

  console.log(
    `BCF video drift scan: rows=${items.length} threshold=${lumaDeltaThreshold} (source luma − frame luma)`,
  );

  for (let i = 0; i < items.length; i++) {
    const row = items[i];
    const label = `${i + 1}/${items.length} ${row.productKey}`;
    try {
      const stats = await compareRow(supabase, row);
      if (stats.skipped) {
        console.log(`[skip] ${label} — ${stats.reason}`);
        continue;
      }
      const hit = stats.darkened;
      if (hit) darkCount++;
      console.log(
        `[${hit ? 'DARK' : 'ok'}] ${label} source=${stats.sourceMeanLuma} worst=${stats.worstFrameMeanLuma} Δ=${stats.lumaDelta} @${stats.worstAtSeconds}s`,
      );
      results.push({
        productKey: row.productKey,
        category: row.category,
        texture: row.texture,
        colorId: row.colorId,
        mp4StoragePath: row.mp4StoragePath,
        sourcePhotoStoragePath: row.sourcePhotoStoragePath,
        ...stats,
      });
    } catch (e) {
      console.error(`[fail] ${label}`, e instanceof Error ? e.message : e);
      results.push({
        productKey: row.productKey,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  const darkened = results.filter((r) => r.darkened);
  const report = {
    version: 1,
    scannedAt: new Date().toISOString(),
    lumaDeltaThreshold,
    totalScanned: results.filter((r) => !r.error).length,
    darkenedCount: darkened.length,
    okCount: results.filter((r) => !r.darkened && !r.error).length,
    darkenedProductKeys: darkened.map((r) => r.productKey),
    items: results,
  };

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`\nWrote ${REPORT_PATH}`);
  console.log(`Darkened (Δ≥${lumaDeltaThreshold}): ${darkened.length}`);
  if (darkened.length) {
    console.log(darkened.map((r) => r.productKey).join(', '));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
