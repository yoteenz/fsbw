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

function siteAssetUrl(relativePath: string): string {
  const site = resolveSiteOrigin();
  const assetPath = relativePath.startsWith('assets/') ? relativePath : `assets/${relativePath}`;
  return `${site}/${assetPath}`;
}

/**
 * Resolve a reusable email asset URL.
 * Decorative icons + PNGs use SITE_URL (email clients block SVG and Supabase may 404).
 * Marble/hero assets may use Supabase when configured.
 */
export function emailAssetUrl(relativePath: string, options?: { preferSite?: boolean }): string {
  const preferSite =
    options?.preferSite === true ||
    process.env.EMAIL_ASSETS_USE_SITE_FALLBACK === '1' ||
    relativePath.startsWith('email/icons/') ||
    relativePath.endsWith('.png');

  if (preferSite) return siteAssetUrl(relativePath);

  const fromStorage = supabasePublicObjectUrl(relativePath);
  if (fromStorage) return fromStorage;
  return siteAssetUrl(relativePath);
}

export const EMAIL_BRAND = {
  red: BRAND_RED,
  black: '#111111',
  gray: '#808080',
  lightGray: '#f5f5f5',
  white: '#ffffff',
  marbleBackground: emailAssetUrl('marble-half.png'),
  /** PNG raster icons — run npm run email:build-icons after SVG changes. */
  roseAccent: emailAssetUrl('email/icons/rose-accent.png', { preferSite: true }),
  diamondAccent: emailAssetUrl('email/icons/loyalty-points.png', { preferSite: true }),
  fsMonogram: emailAssetUrl('email/icons/hub-icon.png', { preferSite: true }),
  perksPoints: emailAssetUrl('email/icons/loyalty-points.png', { preferSite: true }),
  perksUnlock: emailAssetUrl('email/icons/rewards-icon.png', { preferSite: true }),
  perksMember: emailAssetUrl('email/icons/rose-accent.png', { preferSite: true }),
} as const;

export { BRAND_RED };
