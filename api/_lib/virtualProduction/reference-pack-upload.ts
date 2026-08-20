/**
 * Reference Pack V1 — upload images to Supabase Storage (live-preview bucket).
 */

import { parseStudioImageDataUrl } from '../studioAssetGeneration.js';

export const VP_REFERENCE_PACK_BUCKET =
  process.env.STUDIO_ASSETS_BUCKET?.trim() || 'live-preview';
export const VP_REFERENCE_PACK_PREFIX = 'studio-vp/reference-packs';

export type VpReferencePackUploadResult = {
  ok: boolean;
  publicUrl?: string;
  storagePath?: string;
  error?: string;
};

export async function uploadReferencePackImageBytes(input: {
  orgId: string;
  packId: string;
  slot: string;
  bytes: Buffer;
  mime: string;
}): Promise<VpReferencePackUploadResult> {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    return { ok: false, error: 'Supabase credentials not configured for reference pack upload' };
  }

  const ext = input.mime === 'image/webp' ? 'webp' : input.mime === 'image/jpeg' ? 'jpg' : 'png';
  const safeOrg = input.orgId.replace(/[^a-zA-Z0-9-_]/g, '_');
  const safePack = input.packId.replace(/[^a-zA-Z0-9-_]/g, '_');
  const safeSlot = input.slot.replace(/[^a-zA-Z0-9-_]/g, '_');
  const storagePath = `${VP_REFERENCE_PACK_PREFIX}/${safeOrg}/${safePack}/${safeSlot}/${Date.now()}.${ext}`;

  try {
    const { getSupabaseAdminServiceRole } = await import('../supabase.js');
    const admin = getSupabaseAdminServiceRole();

    const { data: existingBucket } = await admin.storage.getBucket(VP_REFERENCE_PACK_BUCKET);
    if (!existingBucket) {
      const { error: createBucketError } = await admin.storage.createBucket(VP_REFERENCE_PACK_BUCKET, {
        public: true,
        fileSizeLimit: 12 * 1024 * 1024,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      });
      if (createBucketError && !/already exists/i.test(createBucketError.message || '')) {
        return { ok: false, error: createBucketError.message };
      }
    }

    const { error: uploadError } = await admin.storage.from(VP_REFERENCE_PACK_BUCKET).upload(storagePath, input.bytes, {
      upsert: true,
      contentType: input.mime,
    });
    if (uploadError) return { ok: false, error: uploadError.message };

    const { data: publicData } = admin.storage.from(VP_REFERENCE_PACK_BUCKET).getPublicUrl(storagePath);
    return { ok: true, publicUrl: publicData.publicUrl, storagePath };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Reference pack upload failed' };
  }
}

export async function uploadReferencePackImageDataUrl(input: {
  orgId: string;
  packId: string;
  slot: string;
  imageDataUrl: string;
}): Promise<VpReferencePackUploadResult> {
  const parsed = parseStudioImageDataUrl(input.imageDataUrl);
  if (!parsed) {
    return { ok: false, error: 'Invalid image — use PNG, JPEG, or WebP (max 8MB)' };
  }
  if (parsed.bytes.length > 8 * 1024 * 1024) {
    return { ok: false, error: 'Image too large (max 8MB)' };
  }
  return uploadReferencePackImageBytes({
    orgId: input.orgId,
    packId: input.packId,
    slot: input.slot,
    bytes: parsed.bytes,
    mime: parsed.mime,
  });
}
