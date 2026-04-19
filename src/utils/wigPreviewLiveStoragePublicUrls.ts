import { wigPreviewManifestHashLiveColorTier, type WigPreviewSelectionsForHash } from './wigPreviewLiveColorTierHash';

function getSupabasePublicStorageBase(): string | null {
  const base =
    (import.meta as unknown as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL?.trim() || '';
  if (!base) return null;
  return base.replace(/\/$/, '');
}

function liveColorAngleBaseUrl(manifestHash: string): string | null {
  const supabase = getSupabasePublicStorageBase();
  if (!supabase) return null;
  const bucket =
    (import.meta as unknown as { env?: { VITE_WIG_PREVIEW_STORAGE_BUCKET?: string } }).env
      ?.VITE_WIG_PREVIEW_STORAGE_BUCKET?.trim() || 'live-preview';
  const pv =
    (import.meta as unknown as { env?: { VITE_WIG_PREVIEW_PROMPT_VERSION?: string } }).env
      ?.VITE_WIG_PREVIEW_PROMPT_VERSION?.trim() || 'v1';
  return `${supabase}/storage/v1/object/public/${bucket}/wig-preview-live/${pv}/NOIR/${manifestHash}`;
}

/** Public URLs for L, F, R — same layout as `wigPreviewLiveAnglePaths` on the server. */
export function wigPreviewLiveColorTriplePublicUrls(manifestHash: string): [string, string, string] | null {
  const base = liveColorAngleBaseUrl(manifestHash);
  if (!base) return null;
  return [`${base}/left.webp`, `${base}/front.webp`, `${base}/right.webp`];
}

async function objectExistsAtPublicUrl(url: string): Promise<boolean> {
  try {
    const r = await fetch(url, { method: 'HEAD', mode: 'cors', cache: 'no-store' });
    if (r.ok) return true;
    if (r.status === 405 || r.status === 404) {
      const g = await fetch(url, { method: 'GET', mode: 'cors', cache: 'no-store' });
      return g.ok;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Public L/F/R URLs for a selection (hash + cache-bust). **No** Storage probe — use to show
 * optimistic `<img src>` while verifying or waiting for Fal (browser may 404 until files exist).
 */
export async function wigPreviewLiveColorTriplePublicUrlsForSelections(
  sel: WigPreviewSelectionsForHash
): Promise<[string, string, string] | null> {
  const hash = await wigPreviewManifestHashLiveColorTier(sel);
  const triple = wigPreviewLiveColorTriplePublicUrls(hash);
  if (!triple) return null;
  const t = Date.now();
  return [`${triple[0]}?t=${t}`, `${triple[1]}?t=${t}`, `${triple[2]}?t=${t}`];
}

/**
 * If live color WebPs already exist in Supabase, return public URLs so the founder color page can **skip** Fal.
 * Uses **one** `HEAD` on **front.webp** only (same upload batch as L/R — faster than three probes).
 */
export async function resolveWigPreviewLiveColorTripleIfStored(
  sel: WigPreviewSelectionsForHash
): Promise<[string, string, string] | null> {
  const hash = await wigPreviewManifestHashLiveColorTier(sel);
  const triple = wigPreviewLiveColorTriplePublicUrls(hash);
  if (!triple) return null;
  const [, front] = triple;
  const ok = await objectExistsAtPublicUrl(front);
  if (!ok) return null;
  const t = Date.now();
  return [`${triple[0]}?t=${t}`, `${triple[1]}?t=${t}`, `${triple[2]}?t=${t}`] as [string, string, string];
}
