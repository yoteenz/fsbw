#!/usr/bin/env node
/**
 * Batch: remove baked room title/subtitle text from desktop tower backgrounds via Fal edit,
 * upload clean WebPs to Supabase, validate fidelity, patch route constants, emit report.
 *
 * Prerequisites:
 *   FAL_KEY
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   source .env.wig-preview 2>/dev/null || true
 *   npm run desktop:clean-room-backgrounds
 *
 * Options (env):
 *   DRY_RUN=1              — queue + report only
 *   LIMIT=N                — process first N rooms
 *   ROOM_IDS=id1,id2       — subset
 *   SKIP_EXISTING=1        — skip when clean object exists (default 1)
 *   UPDATE_CONSTANTS=1     — patch TS constants after upload (default 1)
 *   MAX_RETRIES=3          — Fal retries on validation failure
 *   SLEEP_MS=1200          — pause between rooms
 *   FAL_RESOLUTION=4K      — nano-banana-pro/edit resolution
 *   MAD_THRESHOLD=14       — mean abs RGB diff; reject if higher (room drift)
 *   MIN_CHANGE_THRESHOLD=0.15 — reject if output too similar to source (text not removed)
 *   DISCOVER_SUPABASE=1    — append unknown Desktop/*.png|jpg assets to queue
 *   REPORT_PATH=tmp/desktop-clean-backgrounds-report.json
 */
import { createClient } from '@supabase/supabase-js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { DESKTOP_ROOM_TEXT_REMOVAL_PROMPT } from './desktop/desktop-room-text-removal-prompt.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

const manifestPath =
  process.argv[2] || join(__dirname, 'desktop', 'desktop-room-background-manifest.json');
const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
const limit = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : 0;
const sleepMs = parseInt(process.env.SLEEP_MS || '1200', 10);
const maxRetries = parseInt(process.env.MAX_RETRIES || '3', 10);
const skipExisting = process.env.SKIP_EXISTING !== '0';
const updateConstants = process.env.UPDATE_CONSTANTS !== '0';
const discoverSupabase = process.env.DISCOVER_SUPABASE === '1';
const madThreshold = parseFloat(process.env.MAD_THRESHOLD || '14');
const minChangeThreshold = parseFloat(process.env.MIN_CHANGE_THRESHOLD || '0.15');
const falResolution = process.env.FAL_RESOLUTION || '4K';
const reportPath =
  process.env.REPORT_PATH || join(repoRoot, 'tmp/desktop-clean-backgrounds-report.json');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const falKey = process.env.FAL_KEY || '';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function slugify(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function publicUrl(bucket, storagePath) {
  return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${storagePath}`;
}

async function downloadBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function getImageMeta(buf) {
  const meta = await sharp(buf).metadata();
  if (!meta.width || !meta.height) throw new Error('Could not read image dimensions');
  return {
    width: meta.width,
    height: meta.height,
    format: meta.format,
    bytes: buf.length,
    aspectRatio: meta.width / meta.height,
  };
}

async function objectExists(supabase, bucket, path) {
  const { error } = await supabase.storage.from(bucket).download(path);
  return !error;
}

async function falUploadUrl(url) {
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  return fal.storage.upload(url);
}

async function falEditRemoveText(sourceUrl) {
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  const uploaded = await falUploadUrl(sourceUrl);
  const result = await fal.subscribe('fal-ai/nano-banana-pro/edit', {
    input: {
      prompt: DESKTOP_ROOM_TEXT_REMOVAL_PROMPT,
      image_urls: [uploaded],
      aspect_ratio: 'auto',
      resolution: falResolution,
      output_format: 'png',
      num_images: 1,
    },
    logs: false,
  });
  const imageUrl = result?.data?.images?.[0]?.url;
  if (!imageUrl) {
    throw new Error(`Unexpected Fal response: ${JSON.stringify(result?.data).slice(0, 600)}`);
  }
  return imageUrl;
}

async function normalizeToSourceDimensions(sourceBuf, outputBuf, sourceMeta) {
  const outMeta = await getImageMeta(outputBuf);
  const srcRatio = sourceMeta.aspectRatio;
  const outRatio = outMeta.aspectRatio;
  if (Math.abs(srcRatio - outRatio) > 0.012) {
    throw new Error(
      `Aspect ratio changed: source ${srcRatio.toFixed(4)} vs output ${outRatio.toFixed(4)}`,
    );
  }

  if (outMeta.width === sourceMeta.width && outMeta.height === sourceMeta.height) {
    return outputBuf;
  }

  return sharp(outputBuf)
    .resize(sourceMeta.width, sourceMeta.height, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();
}

async function computeMeanAbsDiff(sourceBuf, outputBuf) {
  const { width, height } = await getImageMeta(sourceBuf);
  const srcRaw = await sharp(sourceBuf).ensureAlpha().raw().toBuffer();
  const outRaw = await sharp(outputBuf).resize(width, height).ensureAlpha().raw().toBuffer();
  const pixels = width * height * 4;
  let sum = 0;
  for (let i = 0; i < pixels; i += 1) sum += Math.abs(srcRaw[i] - outRaw[i]);
  return sum / pixels;
}

async function validateGeneration(sourceBuf, outputBuf, sourceMeta) {
  const outMeta = await getImageMeta(outputBuf);
  if (outMeta.width !== sourceMeta.width || outMeta.height !== sourceMeta.height) {
    throw new Error(
      `Dimensions mismatch after normalize: ${sourceMeta.width}x${sourceMeta.height} vs ${outMeta.width}x${outMeta.height}`,
    );
  }

  const sizeRatio = outMeta.bytes / Math.max(1, sourceMeta.bytes);
  if (sizeRatio < 0.08 || sizeRatio > 6) {
    throw new Error(`Unreasonable file size ratio: ${sizeRatio.toFixed(2)}x source`);
  }

  const mad = await computeMeanAbsDiff(sourceBuf, outputBuf);
  if (mad < minChangeThreshold) {
    throw new Error(`Output too similar to source (mad=${mad.toFixed(3)}) — text may remain`);
  }
  if (mad > madThreshold) {
    throw new Error(`Output differs too much outside text area (mad=${mad.toFixed(3)})`);
  }

  return { mad, outMeta };
}

async function toWebp(buf) {
  return sharp(buf).webp({ quality: 92, effort: 6 }).toBuffer();
}

function loadManifest() {
  const raw = readFileSync(manifestPath, 'utf8');
  return JSON.parse(raw);
}

function filterItems(items) {
  const roomFilter = (process.env.ROOM_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  let filtered = items;
  if (roomFilter.length) {
    filtered = filtered.filter((row) => roomFilter.includes(row.id));
  }
  if (limit > 0) filtered = filtered.slice(0, limit);
  return filtered;
}

async function discoverDesktopFolder(supabase, manifest) {
  const knownUrls = new Set(manifest.items.map((i) => i.sourceUrl));
  const { data, error } = await supabase.storage.from(manifest.bucket).list('Desktop', {
    limit: 500,
  });
  if (error) throw new Error(`Supabase list Desktop/: ${error.message}`);

  const skipNames = new Set([
    'backgrounds',
    'openart-d19d94364e879943ccc984d3098cb2ce-bb9476a9-210f-44a0-bbe1-a1804c5eeee8_1782168829542_3c9c8d0f.mp4',
  ]);
  const discovered = [];

  for (const entry of data || []) {
    if (!entry?.name || entry.name.includes('/')) continue;
    const lower = entry.name.toLowerCase();
    if (!/\.(png|jpe?g|webp)$/.test(lower)) continue;
    if (lower.startsWith('img_406')) continue;
    if (lower.includes('0a372ba0')) continue;
    if (skipNames.has(entry.name)) continue;

    const sourceUrl = publicUrl(manifest.bucket, `Desktop/${entry.name}`);
    if (knownUrls.has(sourceUrl)) continue;

    const id = slugify(entry.name.replace(/\.[^.]+$/, ''));
    discovered.push({
      id,
      name: entry.name,
      route: '(discovered — wire manually)',
      sourceUrl,
      cleanFileName: `${id}-clean.webp`,
      constantFile: null,
      constantKey: null,
      discovered: true,
    });
  }

  return discovered;
}

function patchZoneBackgrounds(content, updates) {
  let next = content;
  for (const { key, url } of updates.zone) {
    const re = new RegExp(`'${key}': \\x60[^\\x60]+\\x60`, 'g');
    const patched = next.replace(re, `'${key}': \`${url}\``);
    if (patched === next) {
      throw new Error(`Could not find zone key '${key}' in desktopFloorZoneBackgrounds.ts`);
    }
    next = patched;
  }

  if (updates.zone.length > 0) {
    const cleanBase = updates.zone[0].url.replace(/\/[^/]+$/, '');
    next = next.replace(
      /const DESKTOP_ZONE_BG_BASE =\s*\n\s*'[^']+';/,
      `const DESKTOP_ZONE_BG_BASE =\n  '${cleanBase}';`,
    );
  }

  return next;
}

function patchPenthouseRooms(content, updates) {
  let next = content;
  for (const { key, url } of updates.penthouse) {
    const re = new RegExp(
      `(id:\\s*'${key}'[\\s\\S]*?background:\\s*\\n\\s*)'[^']+'`,
      'm',
    );
    if (!re.test(next)) {
      throw new Error(`Could not find penthouse room id '${key}' in desktopPenthouseRooms.ts`);
    }
    next = next.replace(re, `$1'${url}'`);
  }
  return next;
}

function applyConstantUpdates(successRows) {
  if (!updateConstants || successRows.length === 0) return [];

  const zonePath = join(repoRoot, 'src/constants/desktopFloorZoneBackgrounds.ts');
  const penthousePath = join(repoRoot, 'src/constants/desktopPenthouseRooms.ts');

  const updates = { zone: [], penthouse: [] };
  for (const row of successRows) {
    if (row.constantFile?.includes('desktopFloorZoneBackgrounds')) {
      updates.zone.push({ key: row.constantKey, url: row.publicUrl });
    } else if (row.constantFile?.includes('desktopPenthouseRooms')) {
      updates.penthouse.push({ key: row.constantKey, url: row.publicUrl });
    }
  }

  const patched = [];
  if (updates.zone.length) {
    const content = readFileSync(zonePath, 'utf8');
    writeFileSync(zonePath, patchZoneBackgrounds(content, updates), 'utf8');
    patched.push(zonePath);
  }
  if (updates.penthouse.length) {
    const content = readFileSync(penthousePath, 'utf8');
    writeFileSync(penthousePath, patchPenthouseRooms(content, updates), 'utf8');
    patched.push(penthousePath);
  }
  return patched;
}

function printReportTable(rows) {
  console.log('\n=== Desktop clean background processing report ===\n');
  console.log(
    padRow(['Room', 'Original', 'Generated', 'Public URL', 'Route', 'Status'], [22, 28, 28, 52, 34, 12]),
  );
  console.log('-'.repeat(180));
  for (const row of rows) {
    console.log(
      padRow(
        [
          row.name,
          row.originalFile,
          row.generatedFile || '—',
          row.publicUrl || '—',
          row.route,
          row.status,
        ],
        [22, 28, 28, 52, 34, 12],
      ),
    );
    if (row.error) console.log(`  ↳ ${row.error}`);
  }
}

function padRow(cells, widths) {
  return cells.map((cell, i) => String(cell ?? '').slice(0, widths[i]).padEnd(widths[i])).join(' ');
}

async function processRoom(supabase, manifest, row) {
  const storagePath = `${manifest.cleanStoragePrefix}/${row.cleanFileName}`;
  const report = {
    id: row.id,
    name: row.name,
    route: row.route,
    originalFile: row.sourceUrl.split('/').pop(),
    generatedFile: row.cleanFileName,
    storagePath,
    publicUrl: null,
    constantFile: row.constantFile,
    constantKey: row.constantKey,
    status: 'pending',
    error: null,
    attempts: 0,
    mad: null,
  };

  if (!dryRun && skipExisting && (await objectExists(supabase, manifest.bucket, storagePath))) {
    report.status = 'skipped_exists';
    report.publicUrl = publicUrl(manifest.bucket, storagePath);
    return report;
  }

  if (dryRun) {
    report.status = 'dry_run';
    return report;
  }

  const sourceBuf = await downloadBuffer(row.sourceUrl);
  const sourceMeta = await getImageMeta(sourceBuf);

  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    report.attempts = attempt;
    try {
      const falUrl = await falEditRemoveText(row.sourceUrl);
      const rawOut = await downloadBuffer(falUrl);
      const normalized = await normalizeToSourceDimensions(sourceBuf, rawOut, sourceMeta);
      const validation = await validateGeneration(sourceBuf, normalized, sourceMeta);
      const webpBuf = await toWebp(normalized);

      const { error: upErr } = await supabase.storage.from(manifest.bucket).upload(storagePath, webpBuf, {
        contentType: 'image/webp',
        upsert: true,
      });
      if (upErr) throw new Error(`Upload: ${upErr.message}`);

      report.mad = validation.mad;
      report.publicUrl = publicUrl(manifest.bucket, storagePath);
      report.status = 'ok';
      return report;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        console.warn(`[retry ${attempt}/${maxRetries}] ${row.id}: ${err?.message || err}`);
        await sleep(Math.min(4000, sleepMs * attempt));
      }
    }
  }

  report.status = 'failed';
  report.error = lastError?.message || String(lastError);
  return report;
}

async function main() {
  if (!dryRun) {
    if (!falKey) {
      console.error('Missing FAL_KEY');
      process.exit(1);
    }
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      process.exit(1);
    }
  }

  const manifest = loadManifest();
  let queue = [...manifest.items];

  const supabase = dryRun ? null : createClient(supabaseUrl, supabaseKey);

  if (!dryRun && discoverSupabase) {
    const discovered = await discoverDesktopFolder(supabase, manifest);
    if (discovered.length) {
      console.log(`Discovered ${discovered.length} additional Desktop/ assets`);
      queue = queue.concat(discovered);
    }
  }

  queue = filterItems(queue);
  console.log(`Processing queue: ${queue.length} room(s) | dryRun=${dryRun} | bucket=${manifest.bucket}`);

  const reports = [];
  for (let i = 0; i < queue.length; i += 1) {
    const row = queue[i];
    console.log(`\n[${i + 1}/${queue.length}] ${row.name} (${row.id})`);
    const report = await processRoom(supabase, manifest, row);
    reports.push(report);
    console.log(`  → ${report.status}${report.publicUrl ? ` ${report.publicUrl}` : ''}`);
    if (!dryRun && sleepMs > 0 && i < queue.length - 1) await sleep(sleepMs);
  }

  const successRows = reports.filter((r) => r.status === 'ok' || r.status === 'skipped_exists');
  const patchedFiles = dryRun ? [] : applyConstantUpdates(successRows);

  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        dryRun,
        manifestPath,
        patchedFiles,
        rows: reports,
      },
      null,
      2,
    ),
    'utf8',
  );

  printReportTable(reports);
  console.log(`\nReport saved: ${reportPath}`);
  if (patchedFiles.length) {
    console.log('Constants updated:', patchedFiles.map((p) => p.replace(repoRoot + '/', '')).join(', '));
  }

  const failed = reports.filter((r) => r.status === 'failed').length;
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
