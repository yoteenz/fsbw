#!/usr/bin/env node
/**
 * Generate PSA avatar expression PNGs via **fal-ai/nano-banana-pro/edit** (NBP).
 *
 * Default: only PSA **v5** expressions (9 new slugs). Original v1 set available with ALL=1.
 * After NBP export, optionally runs **fal-ai/ideogram/remove-background** (skip with SKIP_IDEOGRAM=1).
 *
 * Env:
 *   FAL_KEY — required unless DRY_RUN=1
 *
 * Optional:
 *   PSA_BASE_IMAGE — repo-relative path to NBP base (default: public/assets/psa-avatar-neutral-smiling.png)
 *   EXPRESSIONS — comma-separated slugs (default: all v5 slugs)
 *   ALL=1 — include original 11 expressions in default batch
 *   SKIP_IDEOGRAM=1 — save raw NBP PNG only (run Ideogram manually — recommended workflow)
 *   OUT_DIR — default public/assets
 *   DRY_RUN=1 — print prompts/paths only
 *   SLEEP_MS — delay between Fal calls (default 1500)
 *   OVERWRITE=1 — replace existing files (default: skip if file exists)
 *
 * Usage:
 *   DRY_RUN=1 node scripts/generate-psa-avatar-expressions.mjs
 *   FAL_KEY=... node scripts/generate-psa-avatar-expressions.mjs
 *   FAL_KEY=... SKIP_IDEOGRAM=1 EXPRESSIONS=red-carpet,celebrating node scripts/generate-psa-avatar-expressions.mjs
 *
 * After dropping Ideogram-cut PNGs into public/assets/, bump PSA_AVATAR_ASSET_VERSION in psaConfig.ts.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  PSA_AVATAR_EXPRESSION_MANIFEST,
  PSA_AVATAR_NEGATIVE_PROMPT,
  buildPsaAvatarNbpPrompt,
} from './psa-avatar-expression-manifest.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

const falKey = process.env.FAL_KEY || '';
const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
const skipIdeogram = process.env.SKIP_IDEOGRAM === '1' || process.env.SKIP_IDEOGRAM === 'true';
const overwrite = process.env.OVERWRITE === '1' || process.env.OVERWRITE === 'true';
const sleepMs = parseInt(process.env.SLEEP_MS || '1500', 10);
const allExpressions = process.env.ALL === '1' || process.env.ALL === 'true';
const outDir = resolvePath(process.env.OUT_DIR || 'public/assets');
const baseImagePath = resolvePath(
  process.env.PSA_BASE_IMAGE || 'public/assets/psa-avatar-neutral-smiling.png'
);

const IDEOGRAM_MODEL = 'fal-ai/ideogram/remove-background';
const NBP_MODEL = 'fal-ai/nano-banana-pro/edit';

function resolvePath(p) {
  if (!p || !String(p).trim()) return '';
  const s = String(p).trim();
  if (s.startsWith('/') && existsSync(s)) return s;
  return join(repoRoot, s.replace(/^\//, ''));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function downloadUrlToBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download failed ${res.status} ${res.statusText || ''}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function falUploadFile(absPath) {
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  const buf = readFileSync(absPath);
  const blob = new Blob([buf], { type: 'image/png' });
  const name = absPath.split(/[/\\]/).pop() || 'psa-base.png';
  const file = new File([blob], name, { type: 'image/png' });
  return fal.storage.upload(file);
}

async function runNbpEdit(imageUrl, prompt) {
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  const result = await fal.subscribe(NBP_MODEL, {
    input: {
      prompt,
      image_urls: [imageUrl],
      aspect_ratio: '1:1',
      resolution: '2K',
      output_format: 'png',
      num_images: 1,
      negative_prompt: PSA_AVATAR_NEGATIVE_PROMPT,
    },
    logs: false,
  });
  const url = result?.data?.images?.[0]?.url;
  if (!url) {
    throw new Error(`NBP edit: unexpected response: ${JSON.stringify(result?.data).slice(0, 500)}`);
  }
  return downloadUrlToBuffer(url);
}

async function runIdeogramCutout(imageBuffer) {
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  const blob = new Blob([imageBuffer], { type: 'image/png' });
  const file = new File([blob], 'psa-nbp-export.png', { type: 'image/png' });
  const falUrl = await fal.storage.upload(file);
  const result = await fal.subscribe(IDEOGRAM_MODEL, {
    input: { image_url: falUrl },
    logs: false,
  });
  const url = result?.data?.image?.url || result?.data?.images?.[0]?.url;
  if (!url) {
    throw new Error(`Ideogram: unexpected response: ${JSON.stringify(result?.data).slice(0, 500)}`);
  }
  return downloadUrlToBuffer(url);
}

function selectedExpressions() {
  const raw = (process.env.EXPRESSIONS || '').trim();
  if (raw) {
    const slugs = raw.split(',').map((s) => s.trim()).filter(Boolean);
    return PSA_AVATAR_EXPRESSION_MANIFEST.filter((e) => slugs.includes(e.slug));
  }
  if (allExpressions) return PSA_AVATAR_EXPRESSION_MANIFEST;
  return PSA_AVATAR_EXPRESSION_MANIFEST.filter((e) => e.v5);
}

async function main() {
  const expressions = selectedExpressions();
  if (!expressions.length) {
    console.error('No expressions matched. Check EXPRESSIONS or ALL=1.');
    process.exit(1);
  }

  if (!dryRun && !falKey) {
    console.error('Missing FAL_KEY (use DRY_RUN=1 to preview)');
    process.exit(1);
  }
  if (!dryRun && (!baseImagePath || !existsSync(baseImagePath))) {
    console.error(`PSA_BASE_IMAGE not found: ${baseImagePath || '(empty)'}`);
    process.exit(1);
  }
  if (!outDir) {
    console.error('OUT_DIR could not be resolved');
    process.exit(1);
  }
  mkdirSync(outDir, { recursive: true });

  console.log(
    `psa-avatar-expressions | count=${expressions.length} | base=${baseImagePath} | out=${outDir} | ideogram=${!skipIdeogram} | dryRun=${dryRun}`
  );

  let baseFalUrl = null;
  if (!dryRun) {
    console.log('Uploading base image to Fal storage…');
    baseFalUrl = await falUploadFile(baseImagePath);
  }

  for (const entry of expressions) {
    const outPath = join(outDir, entry.filename);
    const label = `${entry.slug} → ${entry.filename}`;
    const prompt = buildPsaAvatarNbpPrompt(entry.promptLine);

    if (!overwrite && existsSync(outPath)) {
      console.log(`[skip exists] ${label}`);
      continue;
    }

    if (dryRun) {
      console.log(`[dry-run] ${label}`);
      console.log(`  prompt: ${prompt.slice(0, 120)}…`);
      continue;
    }

    try {
      console.log(`[nbp] ${label}`);
      let buf = await runNbpEdit(baseFalUrl, prompt);

      if (!skipIdeogram) {
        console.log(`[ideogram] ${label}`);
        buf = await runIdeogramCutout(buf);
      } else {
        console.log(`[skip ideogram] ${label} — run Ideogram manually, then replace file`);
      }

      writeFileSync(outPath, buf);
      console.log(`[saved] ${outPath} (${buf.length} bytes)`);
    } catch (err) {
      console.error(`[error] ${label}:`, err instanceof Error ? err.message : err);
    }

    if (sleepMs > 0) await sleep(sleepMs);
  }

  console.log('\nDone. If you replaced PNGs, bump PSA_AVATAR_ASSET_VERSION in src/constants/psaConfig.ts.');
  if (skipIdeogram) {
    console.log('Ideogram was skipped — see motherboard/golden-prompts/psa-avatar-background-removal-ideogram.md');
  } else {
    console.log('Do not run psa-flatten or psa-solidify on Ideogram-cut PSA avatars.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
