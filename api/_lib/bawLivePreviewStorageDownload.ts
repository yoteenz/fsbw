import type { SupabaseClient } from '@supabase/supabase-js';
import { wigPreviewLiveLegacyWebpPath } from './bawLivePreviewOutputFormat.js';

export type LivePreviewStorageObjectHit = {
  storagePath: string;
  updatedAt: number | null;
  metadata: Record<string, unknown> | null;
};

function splitStorageObjectPath(path: string): { dir: string; name: string } | null {
  const parts = path.split('/');
  const name = parts.pop();
  if (!name) return null;
  return { dir: parts.join('/'), name };
}

/** Metadata-only Storage lookup — avoids full-object **download** (high Disk IO). */
export async function livePreviewStorageObjectHit(
  supabase: SupabaseClient,
  bucket: string,
  preferredPath: string
): Promise<LivePreviewStorageObjectHit | null> {
  const resolveAtPath = async (path: string): Promise<LivePreviewStorageObjectHit | null> => {
    const split = splitStorageObjectPath(path);
    if (!split) return null;
    const { data, error } = await supabase.storage.from(bucket).list(split.dir, {
      limit: 200,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error || !data?.length) return null;
    const obj = data.find((o) => o.name === split.name);
    if (!obj) return null;
    const rawMeta = obj.metadata;
    const metadata =
      rawMeta && typeof rawMeta === 'object' && !Array.isArray(rawMeta)
        ? (rawMeta as Record<string, unknown>)
        : null;
    const ts = obj.updated_at || obj.created_at;
    return {
      storagePath: path,
      updatedAt: ts ? new Date(ts).getTime() : null,
      metadata,
    };
  };

  const preferred = await resolveAtPath(preferredPath);
  if (preferred) return preferred;

  const legacy = wigPreviewLiveLegacyWebpPath(preferredPath);
  if (legacy) return resolveAtPath(legacy);
  return null;
}

/** Check preferred path, then legacy `.webp` when preferred is `.png`. */
export async function livePreviewObjectExists(
  supabase: SupabaseClient,
  bucket: string,
  preferredPath: string
): Promise<{ storagePath: string } | null> {
  const hit = await livePreviewStorageObjectHit(supabase, bucket, preferredPath);
  return hit ? { storagePath: hit.storagePath } : null;
}

/** Resolve a public URL for a Storage object (PNG preferred, legacy WebP fallback). */
export async function livePreviewPublicUrlIfExists(
  supabase: SupabaseClient,
  bucket: string,
  preferredPath: string
): Promise<string | null> {
  const hit = await livePreviewObjectExists(supabase, bucket, preferredPath);
  if (!hit) return null;
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(hit.storagePath);
  return pub?.publicUrl ?? null;
}
