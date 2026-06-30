import type { SupabaseClient } from '@supabase/supabase-js';
import { wigPreviewLiveLegacyWebpPath } from './bawLivePreviewOutputFormat.js';

/** Download preferred path, then legacy `.webp` when preferred is `.png`. */
export async function livePreviewObjectExists(
  supabase: SupabaseClient,
  bucket: string,
  preferredPath: string
): Promise<{ storagePath: string } | null> {
  const { error } = await supabase.storage.from(bucket).download(preferredPath);
  if (!error) return { storagePath: preferredPath };

  const legacy = wigPreviewLiveLegacyWebpPath(preferredPath);
  if (legacy) {
    const { error: legacyErr } = await supabase.storage.from(bucket).download(legacy);
    if (!legacyErr) return { storagePath: legacy };
  }
  return null;
}
