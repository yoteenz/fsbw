#!/usr/bin/env node
/**
 * Generate **BAW base mannequin** images (Step 1 style) for one or more units via
 * **fal-ai/nano-banana-pro/edit** + upload WebP to Supabase Storage.
 *
 * Uses `BAW_BASE_MANNEQUIN_PROMPT_TWO_ATTACHMENTS` from `scripts/wig-preview/promptTemplate.mjs`.
 * Reference images: (1) **mannequin shot to recreate** (defaults: unit front — override per angle for 3-angle batches), (2) white/rose backdrop — both uploaded to fal storage.
 *
 * Env (required unless DRY_RUN=1):
 *   FAL_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   BAW_BACKDROP_IMAGE — absolute or repo-relative path to white/rose backdrop PNG/JPEG (same for all units unless overridden per unit)
 *
 * Optional:
 *   STORAGE_BUCKET=wig-preview
 *   PROMPT_VERSION=v1          — path segment `baw-base/{PROMPT_VERSION}/{UNIT}.webp`
 *   UNITS=NOIR,BLANCO,SOFT_WAVE  — comma-separated unit keys (default: all three)
 *   NOIR_BRICK_IMAGE=...       — override brick mannequin path for NOIR (same pattern for BLANCO_, SOFT_WAVE_)
 *   DRY_RUN=1, SLEEP_MS=1200
 *
 * Defaults (repo-relative from cwd) if override env not set:
 *   NOIR:      public/assets/NOIR/noir front.png
 *   BLANCO:    public/assets/2D BLANCO FRONT.png
 *   SOFT_WAVE: public/assets/SOFT-WAVE FRONT.png
 *
 * Usage:
 *   DRY_RUN=1 node scripts/generate-baw-base-images.mjs
 *   FAL_KEY=... SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... BAW_BACKDROP_IMAGE=/path/to/backdrop.png node scripts/generate-baw-base-images.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { BAW_BASE_MANNEQUIN_PROMPT_TWO_ATTACHMENTS } from './wig-preview/promptTemplate.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

const bucket = process.env.STORAGE_BUCKET || 'wig-preview';
const promptVersion = process.env.PROMPT_VERSION || 'v1';
const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
const sleepMs = parseInt(process.env.SLEEP_MS || '1200', 10);
const falKey = process.env.FAL_KEY || '';
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const DEFAULT_BRICK_BY_UNIT = {
  NOIR: join(repoRoot, 'public/assets/NOIR/noir front.png'),
  BLANCO: join(repoRoot, 'public/assets/2D BLANCO FRONT.png'),
  SOFT_WAVE: join(repoRoot, 'public/assets/SOFT-WAVE FRONT.png'),
};

function resolvePath(p) {
  if (!p || !String(p).trim()) return '';
  const s = String(p).trim();
  if (s.startsWith('/') && existsSync(s)) return s;
  return join(repoRoot, s.replace(/^\//, ''));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function storagePathForUnit(unitKey) {
  return `baw-base/${promptVersion}/${unitKey}.webp`;
}

async function objectExists(supabase, path) {
  const { error } = await supabase.storage.from(bucket).download(path);
  return !error;
}

async function downloadUrlToBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download generated image failed ${res.status} ${res.statusText || ''}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

/**
 * @param {string} absPath
 * @param {string} mime
 */
async function falUploadFile(absPath, mime) {
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  const buf = readFileSync(absPath);
  const blob = new Blob([buf], { type: mime });
  const name = absPath.split(/[/\\]/).pop() || 'ref.png';
  const file = new File([blob], name, { type: mime });
  const url = await fal.storage.upload(file);
  return url;
}

function mimeForPath(absPath) {
  const lower = absPath.toLowerCase();
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/png';
}

async function generateBawBaseEdit(imageUrls) {
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  const result = await fal.subscribe('fal-ai/nano-banana-pro/edit', {
    input: {
      prompt: BAW_BASE_MANNEQUIN_PROMPT_TWO_ATTACHMENTS,
      image_urls: imageUrls,
      aspect_ratio: 'auto',
      resolution: '2K',
      output_format: 'webp',
      num_images: 1,
    },
    logs: false,
  });
  const url = result?.data?.images?.[0]?.url;
  if (!url) throw new Error(`fal edit: unexpected response: ${JSON.stringify(result?.data).slice(0, 500)}`);
  return downloadUrlToBuffer(url);
}

async function main() {
  const unitsRaw = process.env.UNITS || 'NOIR,BLANCO,SOFT_WAVE';
  const units = unitsRaw
    .split(',')
    .map((s) => s.trim().toUpperCase().replace(/\s+/g, '_'))
    .filter(Boolean);

  const backdropEnv = process.env.BAW_BACKDROP_IMAGE || process.env.WIG_CONSULT_BACKDROP_IMAGE || '';
  const backdropPath = resolvePath(backdropEnv);

  if (!dryRun && (!supabaseUrl || !supabaseKey)) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (omit for DRY_RUN=1)');
    process.exit(1);
  }
  if (!dryRun && !falKey) {
    console.error('Missing FAL_KEY');
    process.exit(1);
  }
  if ((!backdropPath || !existsSync(backdropPath)) && !dryRun) {
    console.error(
      'Set BAW_BACKDROP_IMAGE to the path of your white/rose backdrop file (PNG/JPEG/WebP), e.g.\n' +
        '  BAW_BACKDROP_IMAGE=public/assets/your-backdrop.png\n' +
        `Resolved: "${backdropPath || backdropEnv}" — not found.`
    );
    process.exit(1);
  }
  if (dryRun && (!backdropPath || !existsSync(backdropPath))) {
    console.warn(
      '[dry-run] BAW_BACKDROP_IMAGE not set or file missing — would fail on real run. Example: BAW_BACKDROP_IMAGE=public/assets/your-backdrop.png'
    );
  }

  const supabase = dryRun ? null : createClient(supabaseUrl, supabaseKey);

  console.log(
    `baw-base | units=${units.join(',')} | bucket=${bucket} | path=baw-base/${promptVersion}/<UNIT>.webp | dryRun=${dryRun}`
  );

  for (const unit of units) {
    const envBrick = process.env[`${unit}_BRICK_IMAGE`] || process.env[`${unit.replace(/_/g, '')}_BRICK_IMAGE`];
    const brickPath = resolvePath(envBrick) || DEFAULT_BRICK_BY_UNIT[unit];
    if (!brickPath || !existsSync(brickPath)) {
      console.error(`[skip] ${unit}: brick image not found: ${brickPath || '(no default)'}`);
      continue;
    }

    const path = storagePathForUnit(unit);
    const label = `${unit} → ${path}`;

    try {
      if (dryRun) {
        console.log(`[dry-run] ${label}`);
        console.log(`  brick:   ${brickPath}`);
        console.log(`  backdrop: ${backdropPath}`);
        continue;
      }

      if (await objectExists(supabase, path)) {
        console.log(`[skip exists] ${label}`);
        continue;
      }

      const brickMime = mimeForPath(brickPath);
      const backdropMime = mimeForPath(backdropPath);
      const url1 = await falUploadFile(brickPath, brickMime);
      const url2 = await falUploadFile(backdropPath, backdropMime);
      const buf = await generateBawBaseEdit([url1, url2]);

      const { error: upErr } = await supabase.storage.from(bucket).upload(path, buf, {
        contentType: 'image/webp',
        upsert: true,
      });
      if (upErr) {
        throw new Error(
          `Supabase upload: ${upErr.message || 'unknown'}${upErr.statusCode != null ? ` (HTTP ${upErr.statusCode})` : ''}`
        );
      }
      console.log(`[ok] ${label}`);
      if (sleepMs > 0) await sleep(sleepMs);
    } catch (e) {
      console.error(`[fail] ${label}`, e?.message || e);
    }
  }

  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
