import type { SupabaseClient } from '@supabase/supabase-js';
import { SLAY_FORECAST_STORAGE_BUCKET, SLAY_FORECAST_STORAGE_PREFIX } from './constants.js';

export function continuityStoragePath(versionSlug: string, fileName: string): string {
  return `${SLAY_FORECAST_STORAGE_PREFIX}/continuity/${versionSlug}/${fileName}`;
}

export function editionSegmentStoragePath(
  editionSlug: string,
  segmentType: string,
  attemptNumber: number,
  ext: string,
): string {
  return `${SLAY_FORECAST_STORAGE_PREFIX}/editions/${editionSlug}/${segmentType}/attempt-${attemptNumber}.${ext}`;
}

export async function uploadBytesToStorage(
  supabase: SupabaseClient,
  storagePath: string,
  bytes: Buffer,
  contentType: string,
): Promise<{ publicUrl: string; storagePath: string }> {
  const { error } = await supabase.storage.from(SLAY_FORECAST_STORAGE_BUCKET).upload(storagePath, bytes, {
    upsert: true,
    contentType,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(SLAY_FORECAST_STORAGE_BUCKET).getPublicUrl(storagePath);
  return { publicUrl: data.publicUrl, storagePath };
}

export async function downloadUrlToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

export async function mirrorRemoteAssetToStorage(
  supabase: SupabaseClient,
  sourceUrl: string,
  storagePath: string,
): Promise<string> {
  const bytes = await downloadUrlToBuffer(sourceUrl);
  const upload = await uploadBytesToStorage(supabase, storagePath, bytes, 'video/mp4');
  return upload.publicUrl;
}
