#!/usr/bin/env node
/**
 * Generate Frontal Slayer transactional email hero scenes via Fal + upload to Supabase.
 *
 * Each template gets a purpose-specific immersive 3D hero tied to that email's intent.
 * Uses marble + official slayer-logo.png as Fal edit references.
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
 *   EMAIL_HERO_LOGO_REF=public/assets/email/slayer-logo.png — official logo Fal edit ref (always attached)
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
const logoRef = join(ROOT, process.env.EMAIL_HERO_LOGO_REF?.trim() || 'public/assets/email/slayer-logo.png');
const extraRef = process.env.REFERENCE_IMAGE?.trim()
  ? join(ROOT, process.env.REFERENCE_IMAGE.replace(/^\//, ''))
  : '';

const EMAIL_HERO_LOGO_AUTHENTICITY_PROMPT = `Logo authenticity (critical): A Frontal Slayer logo reference image is attached. If any brand mark, seal, wax stamp, shopping bag logo, monogram, or embossed mark appears in the scene, reproduce ONLY that exact logo — crimson red stylized FS monogram with FRONTAL SLAYER text fully legible. Do NOT invent, redraw, substitute, abbreviate, or stylize a different logo. No other logos or brand marks anywhere in the scene.`;

function loadEmailHeroPromptPack() {
  const scenes = JSON.parse(
    readFileSync(join(ROOT, 'api/_lib/email/emailHeroPrompts.data.json'), 'utf8')
  );
  const meta = JSON.parse(
    readFileSync(join(ROOT, 'api/_lib/email/emailHeroPromptMeta.json'), 'utf8')
  );
  return { purposeScenes: scenes.purposeScenes ?? scenes.prompts ?? {}, meta };
}

function buildEmailHeroPrompt(templateType, purposeScenes, meta) {
  const scene = purposeScenes[templateType] || purposeScenes.welcome;
  if (!scene) return null;
  return [
    meta.composition,
    meta.quality,
    meta.brandRules,
    `Email purpose & hero subject: ${scene}`,
    meta.logoAuthenticity || EMAIL_HERO_LOGO_AUTHENTICITY_PROMPT,
  ].join('\n\n');
}

const OUT_DIR = join(ROOT, 'public/assets/email/heroes');
const MANIFEST_PATH = join(OUT_DIR, 'manifest.json');

const FAL_MODEL = 'fal-ai/nano-banana-pro/edit';
const EMAIL_HERO_ASPECT_RATIO = '2:3';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function resolveTemplates(allTypes, filterCsv, category) {
  if (category?.trim()) {
    const cat = category.trim().toLowerCase();
    const map = {
      account: [
        'welcome', 'email_verification', 'email_confirmed', 'password_reset', 'password_reset_success',
        'password_changed', 'profile_updated', 'email_updated', 'account_login_alert', 'newsletter',
      ],
      orders: [
        'order_received', 'order_confirmed', 'order_processing', 'order_shipped', 'order_out_for_delivery',
        'order_delivered', 'order_delayed', 'order_canceled', 'payment_received', 'partially_shipped',
      ],
      rewards: [
        'points_earned', 'points_redeemed', 'points_expiring', 'voucher_expiring', 'referral_redeemed',
        'digital_cash_update', 'membership_welcome', 'tier_upgraded', 'birthday_reward', 'special_offer',
      ],
      affiliate: [
        'affiliate_content_received', 'affiliate_content_pending', 'affiliate_content_approved',
        'affiliate_content_denied', 'affiliate_points_earned', 'affiliate_payment_sent',
      ],
      shop: [
        'back_in_stock', 'wishlist_price_drop', 'consult_offer_sent', 'meeting_reschedule', 'meeting_cancel',
      ],
    };
    if (cat === 'all') {
      return Object.values(map).flat().filter((t) => allTypes.includes(t));
    }
    const list = map[cat];
    if (list) return list.filter((t) => allTypes.includes(t));
  }
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
  const { purposeScenes } = loadEmailHeroPromptPack();
  return purposeScenes;
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
      aspect_ratio: EMAIL_HERO_ASPECT_RATIO,
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
  const sorted = [...ready].sort();
  writeFileSync(
    MANIFEST_PATH,
    JSON.stringify({ ready: sorted, updatedAt: new Date().toISOString() }, null, 2)
  );
  const tsPath = join(ROOT, 'api/_lib/email/heroManifestReady.ts');
  const tsBody =
    '/** Auto-updated by email hero generation scripts. Do not edit by hand. */\n' +
    `export const EMAIL_HERO_MANIFEST_READY: readonly string[] = ${JSON.stringify(sorted, null, 2)};\n`;
  writeFileSync(tsPath, tsBody);
  console.log('Wrote manifest', MANIFEST_PATH, `(${ready.size} heroes)`);
}

async function main() {
  const { purposeScenes, meta } = loadEmailHeroPromptPack();
  const allTypes = Object.keys(purposeScenes);
  const types = resolveTemplates(allTypes, process.env.TEMPLATES, process.env.CATEGORY);

  if (!existsSync(marbleRef)) {
    console.error('Missing marble reference:', marbleRef);
    process.exit(1);
  }

  if (!existsSync(logoRef)) {
    console.error('Missing logo reference:', logoRef);
    process.exit(1);
  }

  if (dryRun) {
    console.log(`DRY_RUN — ${types.length} templates, model ${FAL_MODEL}`);
    for (const t of types) {
      const full = buildEmailHeroPrompt(t, purposeScenes, meta);
      console.log('\n---', t, '---\n', full?.slice(0, 320), '…');
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
  console.log('Uploading Frontal Slayer logo reference to Fal storage…');
  const logoUrl = await falUpload(fal, logoRef);
  let extraUrl = null;
  if (extraRef && existsSync(extraRef)) {
    console.log('Uploading extra reference', extraRef);
    extraUrl = await falUpload(fal, extraRef);
  }

  const imageUrls = extraUrl ? [marbleUrl, logoUrl, extraUrl] : [marbleUrl, logoUrl];

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

    const fullPrompt = buildEmailHeroPrompt(templateType, purposeScenes, meta);
    if (!fullPrompt) {
      console.warn('No purpose scene for', templateType);
      continue;
    }

    console.log(`Generating ${templateType}…`);
    try {
      const imageUrl = await generateHero(fal, fullPrompt, imageUrls);
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
