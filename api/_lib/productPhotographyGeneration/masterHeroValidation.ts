import { resolveSiteOrigin } from '../email/brandAssets.js';

export const CREATIVE_DNA_PROMPT_VERSION = 'v2.0';

const PLACEHOLDER_PATH_MARKERS = ['/assets/2D WAVY FRONT.png', '/assets/natural front.png'];

export function normalizeAssetPath(pathOrUrl: string): string {
  const t = pathOrUrl.trim();
  if (/^https?:\/\//i.test(t)) {
    try {
      return new URL(t).pathname;
    } catch {
      return t;
    }
  }
  return t.startsWith('/') ? t : `/${t}`;
}

export function isLocalPlaceholderAsset(pathOrUrl: string): boolean {
  const normalized = normalizeAssetPath(pathOrUrl);
  if (normalized.startsWith('/assets/') && !normalized.includes('generated-master')) {
    return PLACEHOLDER_PATH_MARKERS.some((m) => normalized.endsWith(m) || normalized.includes(m));
  }
  return normalized.startsWith('/assets/') && !normalized.includes('generated-master');
}

export function resolveAbsoluteAssetUrl(pathOrUrl: string): string {
  const t = pathOrUrl.trim();
  if (/^https?:\/\//i.test(t)) return t;
  const origin = resolveSiteOrigin();
  return `${origin}${t.startsWith('/') ? t : `/${t}`}`;
}

/** Master hero must be an HTTPS Supabase (or Fal CDN) URL — never a local /assets placeholder. */
export function assertCanonicalGeneratedMasterUrl(opts: {
  canonicalUrl: string;
  productReferenceSrc: string;
  falOriginalUrl: string;
  context: string;
}): void {
  const { canonicalUrl, productReferenceSrc, falOriginalUrl, context } = opts;

  if (!canonicalUrl?.trim()) {
    throw new Error(`${context}: canonical Master Hero URL is empty — FAL generation did not complete`);
  }
  if (isLocalPlaceholderAsset(canonicalUrl)) {
    throw new Error(
      `${context}: refusing local placeholder as Master Hero (${canonicalUrl}). Run FAL generation first.`
    );
  }
  if (!/^https?:\/\//i.test(canonicalUrl)) {
    throw new Error(`${context}: Master Hero must be an HTTPS URL, got ${canonicalUrl}`);
  }
  if (!/^https?:\/\//i.test(falOriginalUrl)) {
    throw new Error(`${context}: FAL must return an HTTPS image URL, got ${falOriginalUrl}`);
  }

  const canonicalPath = normalizeAssetPath(canonicalUrl);
  const refPath = normalizeAssetPath(productReferenceSrc);
  if (canonicalPath === refPath) {
    throw new Error(
      `${context}: canonical Master Hero path matches product reference — not a fresh FAL generation`
    );
  }

  const refFile = refPath.split('/').pop();
  if (
    refFile &&
    canonicalPath.endsWith(refFile) &&
    !canonicalUrl.includes('generated-master') &&
    !canonicalUrl.includes('supabase')
  ) {
    throw new Error(
      `${context}: canonical Master Hero appears to be the website product image (${refFile}), not FAL output`
    );
  }
}

export function logMasterHeroDebug(label: string, payload: Record<string, unknown>): void {
  console.log(`[master-hero-pipeline] ${label}`, JSON.stringify(payload, null, 2));
}
