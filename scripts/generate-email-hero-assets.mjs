#!/usr/bin/env node
/**
 * Generate Frontal Slayer transactional email hero scenes via Fal + upload to Supabase.
 *
 * Each template gets a photorealistic glass-cube hero matching the reference design boards
 * (Rewards, Affiliate, Account, Orders, Shop). Uses marble background as Fal edit reference.
 *
 * Env (required unless DRY_RUN=1):
 *   FAL_KEY
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — for upload (skip with UPLOAD=0)
 *
 * Optional:
 *   TEMPLATES=welcome,order_confirmed  — comma subset (default: all)
 *   DRY_RUN=1                          — print prompts only
 *   UPLOAD=0                           — save locally only
 *   SLEEP_MS=1500                      — delay between Fal calls
 *   EMAIL_ASSETS_BUCKET=email-assets
 *   MARBLE_REF=public/assets/marble-half.png
 *   REFERENCE_IMAGE=path/to/cropped-reference.png — optional extra Fal edit ref per run
 *
 * Usage:
 *   DRY_RUN=1 node scripts/generate-email-hero-assets.mjs
 *   FAL_KEY=... SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/generate-email-hero-assets.mjs
 *   npm run email:generate-heroes
 */
import { createClient } from '@supabase/supabase-js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const falKey = process.env.FAL_KEY?.trim() || '';
const supabaseUrl = process.env.SUPABASE_URL?.trim() || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';
const bucket = process.env.EMAIL_ASSETS_BUCKET?.trim() || 'email-assets';
const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
const uploadEnabled = process.env.UPLOAD !== '0';
const sleepMs = parseInt(process.env.SLEEP_MS || '1500', 10);
const marbleRef = join(ROOT, process.env.MARBLE_REF?.trim() || 'public/assets/marble-half.png');
const extraRef = process.env.REFERENCE_IMAGE?.trim()
  ? join(ROOT, process.env.REFERENCE_IMAGE.replace(/^\//, ''))
  : '';

const OUT_DIR = join(ROOT, 'public/assets/email/heroes');
const MANIFEST_PATH = join(OUT_DIR, 'manifest.json');

const FAL_MODEL = 'fal-ai/nano-banana-pro/edit';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function resolveTemplates(allTypes, filterCsv) {
  if (!filterCsv?.trim()) return allTypes;
  const want = new Set(
    filterCsv
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );
  return allTypes.filter((t) => want.has(t));
}

async function loadEmailHeroPrompts() {
  const raw = readFileSync(join(ROOT, 'api/_lib/email/emailHeroPrompts.data.json'), 'utf8');
  const data = JSON.parse(raw);
  return data.prompts;
}

async function falUpload(fal, filePath) {
  const bytes = readFileSync(filePath);
  const blob = new Blob([bytes]);
  const name = filePath.split('/').pop() || 'ref.png';
  return fal.storage.upload(new File([blob], name, { type: 'image/png' }));
}

async function downloadUrlToBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function generateHero(fal, prompt, imageUrls) {
  const result = await fal.subscribe(FAL_MODEL, {
    input: {
      prompt,
      image_urls: imageUrls,
      num_images: 1,
      aspect_ratio: '16:9',
      output_format: 'webp',
      resolution: '2K',
    },
    logs: false,
  });
  const url = result?.data?.images?.[0]?.url;
  if (!url) throw new Error('Fal returned no image URL');
  return url;
}

async function ensureBucket(supabase) {
  const { data: existing } = await supabase.storage.getBucket(bucket);
  if (!existing) {
    const { error } = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 8 * 1024 * 1024,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
    });
    if (error && !/already exists/i.test(error.message)) throw error;
  }
}

function writeManifest(ready) {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(
    MANIFEST_PATH,
    JSON.stringify({ ready: [...ready].sort(), updatedAt: new Date().toISOString() }, null, 2)
  );
  console.log('Wrote manifest', MANIFEST_PATH, `(${ready.size} heroes)`);
}

async function main() {
  const prompts = await loadEmailHeroPrompts();
  const allTypes = Object.keys(prompts);
  const types = resolveTemplates(allTypes, process.env.TEMPLATES);

  if (!existsSync(marbleRef)) {
    console.error('Missing marble reference:', marbleRef);
    process.exit(1);
  }

  if (dryRun) {
    console.log(`DRY_RUN — ${types.length} templates, model ${FAL_MODEL}`);
    for (const t of types) {
      console.log('\n---', t, '---\n', prompts[t]?.slice(0, 200), '…');
    }
    return;
  }

  if (!falKey) {
    console.error('Set FAL_KEY (or DRY_RUN=1)');
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  console.log('Uploading marble reference to Fal storage…');
  const marbleUrl = await falUpload(fal, marbleRef);
  let extraUrl = null;
  if (extraRef && existsSync(extraRef)) {
    console.log('Uploading extra reference', extraRef);
    extraUrl = await falUpload(fal, extraRef);
  }

  const imageUrls = extraUrl ? [marbleUrl, extraUrl] : [marbleUrl];

  let supabase = null;
  if (uploadEnabled && supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    await ensureBucket(supabase);
  } else if (uploadEnabled) {
    console.warn('SUPABASE_URL/SERVICE_ROLE_KEY missing — local save only');
  }

  const ready = new Set(loadExistingManifest());

  for (const templateType of types) {
    const localPath = join(OUT_DIR, `${templateType}.webp`);
    if (existsSync(localPath) && process.env.FORCE !== '1') {
      console.log('Skip existing', templateType);
      ready.add(templateType);
      continue;
    }

    const prompt = prompts[templateType];
    if (!prompt) {
      console.warn('No prompt for', templateType);
      continue;
    }

    console.log(`Generating ${templateType}…`);
    try {
      const imageUrl = await generateHero(fal, prompt, imageUrls);
      const bytes = await downloadUrlToBuffer(imageUrl);
      writeFileSync(localPath, bytes);
      ready.add(templateType);
      console.log('Saved', localPath);

      if (supabase) {
        const remote = `heroes/${templateType}.webp`;
        const { error } = await supabase.storage.from(bucket).upload(remote, bytes, {
          upsert: true,
          contentType: 'image/webp',
        });
        if (error) throw new Error(error.message);
        const { data } = supabase.storage.from(bucket).getPublicUrl(remote);
        console.log('Uploaded →', data.publicUrl);
      }
    } catch (err) {
      console.error('Failed', templateType, err instanceof Error ? err.message : err);
    }

    if (sleepMs > 0) await sleep(sleepMs);
  }

  writeManifest(ready);
  console.log('Done.');
}

function loadExistingManifest() {
  if (!existsSync(MANIFEST_PATH)) return [];
  try {
    const raw = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
    return Array.isArray(raw.ready) ? raw.ready : [];
  } catch {
    return [];
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
