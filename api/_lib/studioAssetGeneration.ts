import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const STUDIO_ASSET_FAL_MODEL = 'fal-ai/nano-banana-pro/edit';
export const STUDIO_ASSETS_BUCKET = process.env.STUDIO_ASSETS_BUCKET?.trim() || 'live-preview';
export const STUDIO_ASSETS_PREFIX = 'studio-assets/frontal-slayer';

export type StudioAssetGenerateInput = {
  blueprintId: string;
  blueprintName: string;
  studioId: string;
  variantId: string;
  variantName: string;
  promptStack: string[];
  referenceImageUrl?: string;
};

export type StudioAssetGenerateResult = {
  ok: boolean;
  publicUrl?: string;
  storagePath?: string;
  model?: string;
  error?: string;
};

export type StudioAssetReplaceResult = {
  ok: boolean;
  publicUrl?: string;
  storagePath?: string;
  error?: string;
};

function repoRoot(): string {
  return process.cwd();
}

function marbleRefPath(): string {
  const custom = process.env.MARBLE_REF?.trim();
  if (custom) return join(repoRoot(), custom.replace(/^\//, ''));
  return join(repoRoot(), 'public/assets/marble-half.png');
}

function defaultStudioRefPath(): string {
  return join(repoRoot(), 'public/assets/NOIR/noir-thumb.png');
}

async function uploadLocalOrSiteRefToFal(
  fal: { storage: { upload: (f: File) => Promise<string> } },
  localPath: string,
  siteRelativePath: string,
  label: string
): Promise<string> {
  if (existsSync(localPath)) {
    return falUpload(fal, localPath);
  }

  const { resolveSiteOrigin } = await import('./email/brandAssets.js');
  const assetPath = siteRelativePath.replace(/^\//, '');
  const url = `${resolveSiteOrigin()}/${assetPath.startsWith('assets/') ? assetPath : `assets/${assetPath}`}`;
  try {
    return await falUploadFromUrl(fal, url);
  } catch {
    throw new Error(
      `${label} reference missing locally (${localPath}) and could not fetch ${url}`
    );
  }
}

async function falUpload(
  fal: { storage: { upload: (f: File) => Promise<string> } },
  filePath: string
): Promise<string> {
  const bytes = readFileSync(filePath);
  const name = filePath.split('/').pop() || 'ref.png';
  const lower = name.toLowerCase();
  const type = lower.endsWith('.webp')
    ? 'image/webp'
    : lower.endsWith('.jpg') || lower.endsWith('.jpeg')
      ? 'image/jpeg'
      : 'image/png';
  return fal.storage.upload(new File([bytes], name, { type }));
}

async function falUploadFromUrl(
  fal: { storage: { upload: (f: File) => Promise<string> } },
  url: string
): Promise<string> {
  const resolved = await resolveFetchableAssetUrl(url);
  const res = await fetch(resolved);
  if (!res.ok) throw new Error(`Reference download failed (${res.status})`);
  const bytes = Buffer.from(await res.arrayBuffer());
  const name = resolved.split('/').pop()?.split('?')[0] || 'ref.png';
  return fal.storage.upload(new File([bytes], name, { type: 'image/png' }));
}

async function resolveFetchableAssetUrl(url: string): Promise<string> {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  if (trimmed.startsWith('/')) {
    const { resolveSiteOrigin } = await import('./email/brandAssets.js');
    return `${resolveSiteOrigin()}${trimmed}`;
  }
  throw new Error(`Failed to parse URL from ${trimmed}`);
}

async function downloadImageToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

export function assembleStudioVariantPrompt(input: StudioAssetGenerateInput): string {
  const stack = input.promptStack.filter(Boolean).join(' · ');
  const variant = variantPromptLine(input.variantName);
  return [
    'FRONTAL SLAYER LUXURY EDITORIAL STUDIO ASSET — BROADCAST WEATHER-INSPIRED SET.',
    `BLUEPRINT: ${input.blueprintName} (${input.blueprintId}).`,
    `VARIANT: ${input.variantName.toUpperCase()} — ${variant}`,
    stack,
    'OUTPUT: 21:9 HERO STUDIO ENVIRONMENT · WHITE MARBLE · GLASS ACRYLIC · CHERRY RED #EB1C24 ACCENT.',
    'NO GENERIC STOCK · NO TEXT OVERLAY · NO WATERMARK · PHOTOREAL LUXURY BROADCAST SET.',
  ].join(' ');
}

function variantPromptLine(variantName: string): string {
  const key = variantName.trim().toUpperCase();
  const map: Record<string, string> = {
    DAY: 'LUXURY DAYLIGHT BROADCAST — soft morning key, marble glow, glass reflections.',
    NIGHT: 'LUXURY NIGHT BROADCAST — moody fill, cherry red accent lighting, glass nightscape.',
    HOLIDAY: 'HOLIDAY SEASONAL VARIANT — festive luxury accents, editorial forecast graphics.',
    SPRING: 'SPRING SEASONAL VARIANT — fresh airy clouds, soft pastel sky through glass walls.',
    SUMMER: 'SUMMER SEASONAL VARIANT — bright golden hour, airy clouds, premium forecast desk.',
    LUXURY: 'LUXURY EDITORIAL VARIANT — maximum marble, glass, cherry red accent, Vogue spacing.',
    LAUNCH: 'LAUNCH CAMPAIGN VARIANT — hero product framing, campaign energy, broadcast desk.',
    EDITORIAL: 'EDITORIAL VARIANT — magazine composition, negative space, luxury forecast graphics.',
    MASTER: 'MASTER ENVIRONMENT — canonical studio DNA for all downstream variants.',
  };
  return map[key] ?? `PRODUCTION VARIANT ${key} — maintain studio DNA and brand compliance.`;
}

export async function generateStudioAssetImage(
  input: StudioAssetGenerateInput
): Promise<StudioAssetGenerateResult> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) {
    return { ok: false, error: 'FAL_KEY not configured on server' };
  }

  const marbleRef = marbleRefPath();
  const studioRef = defaultStudioRefPath();

  try {
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: falKey });

    const imageUrls: string[] = [
      await uploadLocalOrSiteRefToFal(fal, marbleRef, 'assets/marble-half.png', 'Marble'),
      await uploadLocalOrSiteRefToFal(fal, studioRef, 'assets/NOIR/noir-thumb.png', 'Studio'),
    ];
    if (input.referenceImageUrl?.trim()) {
      imageUrls.push(await falUploadFromUrl(fal, input.referenceImageUrl.trim()));
    }

    const prompt = assembleStudioVariantPrompt(input);
    const result = await fal.subscribe(STUDIO_ASSET_FAL_MODEL, {
      input: {
        prompt,
        image_urls: imageUrls,
        num_images: 1,
        aspect_ratio: '21:9',
        output_format: 'png',
      },
      logs: false,
    });

    const imageUrl = (result as { data?: { images?: Array<{ url?: string }> } })?.data?.images?.[0]?.url;
    if (!imageUrl) {
      return { ok: false, error: 'Fal returned no image URL' };
    }

    const upload = await uploadStudioAssetBytes(
      await downloadImageToBuffer(imageUrl),
      input.studioId,
      input.variantId,
      'image/png'
    );
    if (!upload.ok) return { ok: false, error: upload.error };

    return {
      ok: true,
      publicUrl: upload.publicUrl,
      storagePath: upload.storagePath,
      model: STUDIO_ASSET_FAL_MODEL,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Studio asset generation failed' };
  }
}

export async function uploadStudioAssetBytes(
  bytes: Buffer,
  studioId: string,
  variantId: string,
  mime: string
): Promise<StudioAssetReplaceResult> {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    return { ok: false, error: 'Supabase credentials not configured for studio asset upload' };
  }

  const ext = mime === 'image/webp' ? 'webp' : mime === 'image/jpeg' ? 'jpg' : 'png';
  const safeStudio = studioId.replace(/[^a-zA-Z0-9-_]/g, '_');
  const safeVariant = variantId.replace(/[^a-zA-Z0-9-_]/g, '_');
  const storagePath = `${STUDIO_ASSETS_PREFIX}/${safeStudio}/${safeVariant}/${Date.now()}.${ext}`;

  try {
    const { getSupabaseAdminServiceRole } = await import('./supabase.js');
    const admin = getSupabaseAdminServiceRole();

    const { data: existingBucket } = await admin.storage.getBucket(STUDIO_ASSETS_BUCKET);
    if (!existingBucket) {
      const { error: createBucketError } = await admin.storage.createBucket(STUDIO_ASSETS_BUCKET, {
        public: true,
        fileSizeLimit: 12 * 1024 * 1024,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      });
      if (createBucketError && !/already exists/i.test(createBucketError.message || '')) {
        return { ok: false, error: createBucketError.message };
      }
    }

    const { error: uploadError } = await admin.storage.from(STUDIO_ASSETS_BUCKET).upload(storagePath, bytes, {
      upsert: true,
      contentType: mime,
    });
    if (uploadError) return { ok: false, error: uploadError.message };

    const { data: publicData } = admin.storage.from(STUDIO_ASSETS_BUCKET).getPublicUrl(storagePath);
    return { ok: true, publicUrl: publicData.publicUrl, storagePath };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Studio asset upload failed' };
  }
}

export function parseStudioImageDataUrl(dataUrl: string): { mime: string; bytes: Buffer } | null {
  const match = /^data:([^;]+);base64,(.+)$/i.exec(dataUrl || '');
  if (!match) return null;
  const mime = (match[1] || '').toLowerCase();
  if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(mime)) return null;
  try {
    return { mime, bytes: Buffer.from(match[2] || '', 'base64') };
  } catch {
    return null;
  }
}
