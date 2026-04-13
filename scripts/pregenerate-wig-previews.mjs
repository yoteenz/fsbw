#!/usr/bin/env node
/**
 * Batch: for each manifest row, skip if object exists in Supabase Storage; else call fal or Replicate, upload WebP.
 *
 * Prerequisites (run on laptop / CI — not on phone):
 *   - Supabase project + bucket (default: `wig-preview`) with service role key
 *   - `FAL_KEY` OR `REPLICATE_API_TOKEN`
 *
 * Usage:
 *   PROVIDER=fal FAL_KEY=... SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/pregenerate-wig-previews.mjs scripts/wig-preview/manifests/noir-sanity-v1.json
 *   PROVIDER=replicate REPLICATE_API_TOKEN=... ... node scripts/pregenerate-wig-previews.mjs <manifest.json>
 *
 * Options (env):
 *   STORAGE_BUCKET=wig-preview
 *   DRY_RUN=1          — print only, no API calls
 *   LIMIT=10           — process at most N items (testing)
 *   SLEEP_MS=500       — pause between generations (rate limit courtesy)
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const manifestPath = process.argv[2] || join(__dirname, 'wig-preview', 'manifests', 'noir-sanity-v1.json');
const provider = (process.env.PROVIDER || 'fal').toLowerCase();
const bucket = process.env.STORAGE_BUCKET || 'wig-preview';
const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
const limit = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : 0;
const sleepMs = parseInt(process.env.SLEEP_MS || '800', 10);

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const falKey = process.env.FAL_KEY || '';
const replicateToken = process.env.REPLICATE_API_TOKEN || '';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function objectExists(supabase, path) {
  const { error } = await supabase.storage.from(bucket).download(path);
  return !error;
}

async function downloadUrlToBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Download image from URL failed ${res.status} ${res.statusText || ''} (fal/CDN may block some servers — try again or open URL in browser)`
    );
  }
  return Buffer.from(await res.arrayBuffer());
}

async function generateFal(prompt) {
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  const result = await fal.subscribe('fal-ai/nano-banana-pro', {
    input: {
      prompt,
      aspect_ratio: '3:4',
      output_format: 'webp',
      resolution: '1K',
      num_images: 1,
    },
    logs: false,
  });
  const url = result?.data?.images?.[0]?.url;
  if (!url) throw new Error(`fal: unexpected response: ${JSON.stringify(result?.data).slice(0, 500)}`);
  return downloadUrlToBuffer(url);
}

async function createReplicatePrediction(body) {
  const res = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${replicateToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Replicate create failed ${res.status}: ${t.slice(0, 800)}`);
  }
  return res.json();
}

async function getReplicatePrediction(id) {
  const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
    headers: { Authorization: `Token ${replicateToken}` },
  });
  if (!res.ok) throw new Error(`Replicate get ${id} failed ${res.status}`);
  return res.json();
}

async function generateReplicate(prompt) {
  const version = process.env.REPLICATE_MODEL_VERSION?.trim();
  if (!version) {
    throw new Error(
      'Set REPLICATE_MODEL_VERSION to the model version id from replicate.com (google/nano-banana-pro → API → version hash).'
    );
  }
  const createBody = { version, input: { prompt } };
  let pred = await createReplicatePrediction(createBody);
  const terminal = new Set(['succeeded', 'failed', 'canceled']);
  for (let i = 0; i < 360 && !terminal.has(pred.status); i++) {
    await sleep(2000);
    pred = await getReplicatePrediction(pred.id);
  }
  if (pred.status !== 'succeeded') {
    throw new Error(`Replicate ended ${pred.status}: ${JSON.stringify(pred.error || pred)}`);
  }
  const out = pred.output;
  const url = Array.isArray(out) ? out[0] : typeof out === 'string' ? out : out?.url;
  if (!url) throw new Error(`Replicate: no output URL: ${JSON.stringify(pred).slice(0, 600)}`);
  return downloadUrlToBuffer(url);
}

async function main() {
  if (!dryRun && (!supabaseUrl || !supabaseKey)) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (not required for DRY_RUN=1)');
    process.exit(1);
  }
  if (!dryRun && provider === 'fal' && !falKey) {
    console.error('PROVIDER=fal requires FAL_KEY');
    process.exit(1);
  }
  if (!dryRun && provider === 'replicate' && !replicateToken) {
    console.error('PROVIDER=replicate requires REPLICATE_API_TOKEN');
    process.exit(1);
  }

  const raw = readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(raw);
  const items = manifest.items || [];
  if (!items.length) {
    console.error('Manifest has no items:', manifestPath);
    process.exit(1);
  }

  const supabase = dryRun ? null : createClient(supabaseUrl, supabaseKey);
  let ok = 0;
  let skipped = 0;
  let failed = 0;
  const slice = limit > 0 ? items.slice(0, limit) : items;

  console.log(
    `Manifest: ${manifestPath} | rows=${items.length} processing=${slice.length} | provider=${provider} | bucket=${bucket} | dryRun=${dryRun}`
  );

  for (let i = 0; i < slice.length; i++) {
    const row = slice[i];
    const path = row.storagePath;
    const label = `${i + 1}/${slice.length} ${path}`;
    try {
      if (dryRun) {
        console.log(`[dry-run] ${label}`);
        continue;
      }
      const exists = await objectExists(supabase, path);
      if (exists) {
        skipped++;
        console.log(`[skip exists] ${label}`);
        continue;
      }
      let buf;
      if (provider === 'fal') buf = await generateFal(row.prompt);
      else if (provider === 'replicate') buf = await generateReplicate(row.prompt);
      else {
        console.error('PROVIDER must be fal or replicate');
        process.exit(1);
      }

      const { error: upErr } = await supabase.storage.from(bucket).upload(path, buf, {
        contentType: 'image/webp',
        upsert: true,
      });
      if (upErr) {
        throw new Error(
          `Supabase upload: ${upErr.message || 'unknown'}${upErr.statusCode != null ? ` (HTTP ${upErr.statusCode})` : ''}. Full: ${JSON.stringify(upErr)}`
        );
      }
      ok++;
      console.log(`[ok] ${label}`);
      if (sleepMs > 0) await sleep(sleepMs);
    } catch (e) {
      failed++;
      console.error(`[fail] ${label}`, e?.message || e);
    }
  }

  console.log(`Done. uploaded=${ok} skipped=${skipped} failed=${failed} dryRun=${dryRun}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
