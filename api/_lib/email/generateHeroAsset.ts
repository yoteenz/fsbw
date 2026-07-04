import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { EMAIL_HERO_ASPECT_RATIO } from './heroDimensions.js';
import {
  EMAIL_HERO_LOGO_REF_RELATIVE,
  emailHeroPromptFor,
} from './emailHeroPrompts.js';
import { emailHeroEditRefImageUrls } from './emailHeroEditRefs.js';
import { emailHeroStoragePath } from './heroImages.js';
import type { EmailTemplateType } from './types.js';

export const EMAIL_HERO_FAL_MODEL = 'fal-ai/nano-banana-pro/edit';

const BUCKET = process.env.EMAIL_ASSETS_BUCKET?.trim() || 'email-assets';

function repoRoot(): string {
  return process.cwd();
}

function marbleRefPath(): string {
  const custom = process.env.MARBLE_REF?.trim();
  if (custom) return join(repoRoot(), custom.replace(/^\//, ''));
  return join(repoRoot(), 'public/assets/marble-half.png');
}

function logoRefPath(): string {
  const custom = process.env.EMAIL_HERO_LOGO_REF?.trim();
  if (custom) return join(repoRoot(), custom.replace(/^\//, ''));
  return join(repoRoot(), EMAIL_HERO_LOGO_REF_RELATIVE);
}

async function falUpload(fal: { storage: { upload: (f: File) => Promise<string> } }, filePath: string) {
  const bytes = readFileSync(filePath);
  const name = filePath.split('/').pop() || 'ref.png';
  return fal.storage.upload(new File([bytes], name, { type: 'image/png' }));
}

async function falUploadFromUrl(fal: { storage: { upload: (f: File) => Promise<string> } }, url: string) {
  const bytes = await downloadUrlToBuffer(url);
  const name = url.split('/').pop()?.split('?')[0] || 'ref.png';
  return fal.storage.upload(new File([bytes], name, { type: 'image/png' }));
}

async function downloadUrlToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

export interface GenerateEmailHeroResult {
  ok: boolean;
  templateType: EmailTemplateType;
  localPath?: string;
  publicUrl?: string;
  error?: string;
}

/**
 * Generate one Fal hero WebP and optionally upload to Supabase Storage.
 * Requires FAL_KEY. Supabase upload when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY set.
 */
export async function generateAndUploadEmailHero(
  templateType: EmailTemplateType,
  options: { uploadToSupabase?: boolean; saveLocal?: boolean } = {}
): Promise<GenerateEmailHeroResult> {
  const uploadToSupabase = options.uploadToSupabase !== false;
  const saveLocal = options.saveLocal !== false;

  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) {
    return { ok: false, templateType, error: 'FAL_KEY not configured' };
  }

  const marbleRef = marbleRefPath();
  if (!existsSync(marbleRef)) {
    return { ok: false, templateType, error: `Marble reference missing: ${marbleRef}` };
  }

  const logoRef = logoRefPath();
  if (!existsSync(logoRef)) {
    return { ok: false, templateType, error: `Logo reference missing: ${logoRef}` };
  }

  const prompt = emailHeroPromptFor(templateType);
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const marbleUrl = await falUpload(fal, marbleRef);
  const imageUrls = [marbleUrl];

  const extraRef = process.env.REFERENCE_IMAGE?.trim();
  if (extraRef) {
    const abs = join(repoRoot(), extraRef.replace(/^\//, ''));
    if (existsSync(abs)) {
      imageUrls.push(await falUpload(fal, abs));
    }
  }

  for (const refUrl of emailHeroEditRefImageUrls(templateType)) {
    imageUrls.push(await falUploadFromUrl(fal, refUrl));
  }

  const result = await fal.subscribe(EMAIL_HERO_FAL_MODEL, {
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

  const imageUrl = result?.data?.images?.[0]?.url;
  if (!imageUrl) {
    return { ok: false, templateType, error: 'Fal returned no image URL' };
  }

  const bytes = await downloadUrlToBuffer(imageUrl);
  const { compositeEmailHeroLogo } = await import('./compositeEmailHeroLogo.js');
  const finalBytes = await compositeEmailHeroLogo(bytes, templateType);
  let publicUrl: string | undefined;
  let localPath: string | undefined;

  if (saveLocal) {
    const { mkdirSync, writeFileSync } = await import('node:fs');
    const outDir = join(repoRoot(), 'public/assets/email/heroes');
    mkdirSync(outDir, { recursive: true });
    localPath = join(outDir, `${templateType}.webp`);
    writeFileSync(localPath, finalBytes);
  }

  if (uploadToSupabase) {
    const url = process.env.SUPABASE_URL?.trim();
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!url || !key) {
      return { ok: false, templateType, error: 'Supabase credentials not configured for upload' };
    }
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, key);
    const remote = emailHeroStoragePath(templateType);
    const { error } = await supabase.storage.from(BUCKET).upload(remote, finalBytes, {
      upsert: true,
      contentType: 'image/webp',
    });
    if (error) {
      return { ok: false, templateType, error: error.message };
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(remote);
    publicUrl = data.publicUrl;
  }

  return { ok: true, templateType, localPath, publicUrl };
}

export async function appendEmailHeroManifestReady(templateType: EmailTemplateType): Promise<void> {
  const { readFileSync, writeFileSync, mkdirSync, existsSync: exists } = await import('node:fs');
  const manifestPath = join(repoRoot(), 'public/assets/email/heroes/manifest.json');
  mkdirSync(join(repoRoot(), 'public/assets/email/heroes'), { recursive: true });

  let ready: string[] = [];
  if (exists(manifestPath)) {
    try {
      const raw = JSON.parse(readFileSync(manifestPath, 'utf8')) as { ready?: string[] };
      ready = Array.isArray(raw.ready) ? raw.ready : [];
    } catch {
      ready = [];
    }
  }
  if (!ready.includes(templateType)) ready.push(templateType);
  ready.sort();
  writeFileSync(
    manifestPath,
    JSON.stringify({ ready, updatedAt: new Date().toISOString() }, null, 2)
  );
  const tsPath = join(repoRoot(), 'api/_lib/email/heroManifestReady.ts');
  writeFileSync(
    tsPath,
    '/** Auto-updated by email hero generation scripts. Do not edit by hand. */\n' +
      `export const EMAIL_HERO_MANIFEST_READY: readonly string[] = ${JSON.stringify(ready, null, 2)};\n`
  );
}
