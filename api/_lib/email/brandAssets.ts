const BRAND_RED = '#EB1C24';

/** Public bucket for email backgrounds and decorative PNGs (see scripts/upload-email-assets.mjs). */
export const EMAIL_ASSETS_BUCKET = process.env.EMAIL_ASSETS_BUCKET?.trim() || 'email-assets';

export function resolveSiteOrigin(): string {
  const site = process.env.SITE_URL?.trim();
  if (site) return site.replace(/\/$/, '');
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, '')}`;
  return 'https://fsbw.vercel.app';
}

function supabasePublicObjectUrl(objectPath: string): string | null {
  const base = process.env.SUPABASE_URL?.trim();
  if (!base) return null;
  const clean = objectPath.replace(/^\/+/, '');
  return `${base.replace(/\/$/, '')}/storage/v1/object/public/${EMAIL_ASSETS_BUCKET}/${clean}`;
}

/**
 * Resolve a reusable email asset URL.
 * Prefers Supabase Storage (`email-assets` bucket) when SUPABASE_URL is set; falls back to SITE_URL `/assets/`.
 */
export function emailAssetUrl(relativePath: string): string {
  const fromStorage = supabasePublicObjectUrl(relativePath);
  if (fromStorage && process.env.EMAIL_ASSETS_USE_SITE_FALLBACK !== '1') {
    return fromStorage;
  }
  const site = resolveSiteOrigin();
  const assetPath = relativePath.startsWith('assets/') ? relativePath : `assets/${relativePath}`;
  return `${site}/${assetPath}`;
}

export const EMAIL_BRAND = {
  red: BRAND_RED,
  black: '#111111',
  gray: '#808080',
  lightGray: '#f5f5f5',
  white: '#ffffff',
  marbleBackground: emailAssetUrl('marble-half.png'),
  roseAccent: emailAssetUrl('rose-alert.svg'),
  diamondAccent: emailAssetUrl('points-icon.svg'),
  fsMonogram: emailAssetUrl('hub-icon.svg'),
} as const;

export { BRAND_RED };
