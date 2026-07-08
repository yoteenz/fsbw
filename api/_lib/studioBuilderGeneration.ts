/**
 * Studio Builder™ — department-agnostic generation via existing FAL + Supabase stack.
 * Reuses patterns from studioAssetGeneration.ts without Weather Studio hardcoding.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const STUDIO_BUILDER_FAL_MODEL = 'fal-ai/nano-banana-pro/edit';
export const STUDIO_BUILDER_BUCKET = process.env.STUDIO_ASSETS_BUCKET?.trim() || 'live-preview';
export const STUDIO_BUILDER_PREFIX = 'studio-assets/departments';

export type StudioBuilderGenerateInput = {
  departmentId: string;
  packageId: string;
  projectId: string;
  productionGroupId: string;
  heroAssetId: string;
  prompt: string;
  aspectRatio: string;
  outputFormat: 'png' | 'webp';
  /** Shell placement URL only — never cumulative prior layers (see reference-chain.ts) */
  referenceImageUrls?: string[];
};

export type StudioBuilderGenerateResult = {
  ok: boolean;
  publicUrl?: string;
  storagePath?: string;
  model?: string;
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

async function uploadLocalOrSiteRefToFal(
  fal: { storage: { upload: (f: File) => Promise<string> } },
  localPath: string,
  siteRelativePath: string
): Promise<string> {
  if (existsSync(localPath)) {
    const bytes = readFileSync(localPath);
    const name = localPath.split('/').pop() || 'ref.png';
    return fal.storage.upload(new File([bytes], name, { type: 'image/png' }));
  }
  const { resolveSiteOrigin } = await import('./email/brandAssets.js');
  const assetPath = siteRelativePath.replace(/^\//, '');
  const url = `${resolveSiteOrigin()}/${assetPath.startsWith('assets/') ? assetPath : `assets/${assetPath}`}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Reference fetch failed (${res.status})`);
  const bytes = Buffer.from(await res.arrayBuffer());
  const name = url.split('/').pop()?.split('?')[0] || 'ref.png';
  return fal.storage.upload(new File([bytes], name, { type: 'image/png' }));
}

async function downloadImageToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

function storagePathFor(input: StudioBuilderGenerateInput): string {
  const safe = (s: string) => s.replace(/[^a-zA-Z0-9-_]/g, '_');
  const ext = input.outputFormat === 'webp' ? 'webp' : 'png';
  return `${STUDIO_BUILDER_PREFIX}/${safe(input.departmentId)}/${safe(input.packageId)}/${safe(input.projectId)}/${safe(input.productionGroupId)}/${safe(input.heroAssetId)}/${Date.now()}.${ext}`;
}

export async function uploadStudioBuilderAssetBytes(
  bytes: Buffer,
  storagePath: string,
  mime: string
): Promise<{ ok: boolean; publicUrl?: string; storagePath?: string; error?: string }> {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    return { ok: false, error: 'Supabase credentials not configured' };
  }

  try {
    const { getSupabaseAdminServiceRole } = await import('./supabase.js');
    const admin = getSupabaseAdminServiceRole();

    const { data: existingBucket } = await admin.storage.getBucket(STUDIO_BUILDER_BUCKET);
    if (!existingBucket) {
      await admin.storage.createBucket(STUDIO_BUILDER_BUCKET, {
        public: true,
        fileSizeLimit: 12 * 1024 * 1024,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      });
    }

    const { error: uploadError } = await admin.storage.from(STUDIO_BUILDER_BUCKET).upload(storagePath, bytes, {
      upsert: true,
      contentType: mime,
    });
    if (uploadError) return { ok: false, error: uploadError.message };

    const { data: publicData } = admin.storage.from(STUDIO_BUILDER_BUCKET).getPublicUrl(storagePath);
    return { ok: true, publicUrl: publicData.publicUrl, storagePath };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Upload failed' };
  }
}

export async function generateStudioBuilderAsset(
  input: StudioBuilderGenerateInput
): Promise<StudioBuilderGenerateResult> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) return { ok: false, error: 'FAL_KEY not configured on server' };

  const marbleRef = marbleRefPath();

  try {
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: falKey });

    const imageUrls: string[] = [];

    // Placement refs (shell only) — never pass cumulative prior layers; that re-encodes the stack.
    if (input.referenceImageUrls?.length) {
      const placementRef = input.referenceImageUrls.find((u) => u?.startsWith('http'));
      if (placementRef) imageUrls.push(placementRef);
    }

    // Marble brand anchor is for environment-shell genesis only — not layered passes.
    if (imageUrls.length === 0) {
      imageUrls.push(
        await uploadLocalOrSiteRefToFal(fal, marbleRef, 'assets/marble-half.png')
      );
    }

    const result = await fal.subscribe(STUDIO_BUILDER_FAL_MODEL, {
      input: {
        prompt: input.prompt,
        image_urls: imageUrls,
        num_images: 1,
        aspect_ratio: input.aspectRatio,
        output_format: input.outputFormat,
      },
      logs: false,
    });

    const imageUrl = (result as { data?: { images?: Array<{ url?: string }> } })?.data?.images?.[0]?.url;
    if (!imageUrl) return { ok: false, error: 'Fal returned no image URL' };

    const mime = input.outputFormat === 'webp' ? 'image/webp' : 'image/png';
    const path = storagePathFor(input);
    const upload = await uploadStudioBuilderAssetBytes(await downloadImageToBuffer(imageUrl), path, mime);
    if (!upload.ok) return { ok: false, error: upload.error };

    return {
      ok: true,
      publicUrl: upload.publicUrl,
      storagePath: upload.storagePath,
      model: STUDIO_BUILDER_FAL_MODEL,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Studio Builder generation failed' };
  }
}
