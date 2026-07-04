import { getSupabaseAdmin } from '../supabase.js';

export const PRODUCT_ASSETS_BUCKET =
  process.env.PRODUCT_ASSETS_BUCKET?.trim() ||
  process.env.STUDIO_ASSETS_BUCKET?.trim() ||
  'live-preview';

export function productAssetStoragePath(
  productLine: string,
  unitSlug: string,
  version: string,
  fileName: string
): string {
  return `products/${productLine}/${unitSlug}/${version}/${fileName}`;
}

export function productAssetPublicUrl(supabaseUrl: string, bucket: string, storagePath: string): string {
  const base = supabaseUrl.replace(/\/$/, '');
  const encoded = storagePath
    .split('/')
    .map((s) => encodeURIComponent(s))
    .join('/');
  return `${base}/storage/v1/object/public/${bucket}/${encoded}`;
}

export async function uploadProductAsset(
  storagePath: string,
  buffer: Buffer,
  contentType = 'image/png'
): Promise<{ publicUrl: string; storagePath: string }> {
  const supabase = getSupabaseAdmin();
  const url = process.env.SUPABASE_URL;
  if (!url) throw new Error('Missing SUPABASE_URL');

  const { error } = await supabase.storage.from(PRODUCT_ASSETS_BUCKET).upload(storagePath, buffer, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data } = supabase.storage.from(PRODUCT_ASSETS_BUCKET).getPublicUrl(storagePath);
  return { publicUrl: data.publicUrl, storagePath };
}
