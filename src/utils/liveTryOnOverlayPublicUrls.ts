import { wigPreviewManifestHashLiveColorTier, type WigPreviewSelectionsForHash } from './wigPreviewLiveColorTierHash';

function storageConfig(): { supabase: string; bucket: string; pv: string } | null {
  const supabase =
    (import.meta as unknown as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL?.trim() || '';
  if (!supabase) return null;
  const bucket =
    (import.meta as unknown as { env?: { VITE_WIG_PREVIEW_STORAGE_BUCKET?: string } }).env
      ?.VITE_WIG_PREVIEW_STORAGE_BUCKET?.trim() || 'live-preview';
  const pv =
    (import.meta as unknown as { env?: { VITE_WIG_PREVIEW_PROMPT_VERSION?: string } }).env
      ?.VITE_WIG_PREVIEW_PROMPT_VERSION?.trim() || 'v1';
  return { supabase, bucket, pv };
}

function overlayPath(pv: string, unitKey: string, hash: string, angle: 'left' | 'front' | 'right'): string {
  const u = String(unitKey || 'NOIR').toUpperCase();
  return `try-on-overlay/${pv}/${u}/${hash}/${angle}.png`;
}

export function liveTryOnOverlayTriplePublicUrls(
  unitKey: string,
  manifestHash: string
): [string, string, string] | null {
  const cfg = storageConfig();
  if (!cfg) return null;
  const base = `${cfg.supabase}/storage/v1/object/public/${cfg.bucket}`;
  const u = String(unitKey || 'NOIR').toUpperCase();
  return [
    `${base}/${overlayPath(cfg.pv, u, manifestHash, 'left')}`,
    `${base}/${overlayPath(cfg.pv, u, manifestHash, 'front')}`,
    `${base}/${overlayPath(cfg.pv, u, manifestHash, 'right')}`,
  ];
}

async function objectExistsAtPublicUrl(url: string): Promise<boolean> {
  try {
    const r = await fetch(url, { method: 'HEAD', mode: 'cors', cache: 'no-store' });
    if (r.ok) return true;
    const g = await fetch(url, { method: 'GET', mode: 'cors', cache: 'no-store' });
    return g.ok;
  } catch {
    return false;
  }
}

export async function resolveLiveTryOnOverlayTripleIfStored(
  sel: WigPreviewSelectionsForHash
): Promise<[string, string, string] | null> {
  const unitKey = String(sel.unitKey || 'NOIR').toUpperCase();
  const hash = await wigPreviewManifestHashLiveColorTier(sel);
  const triple = liveTryOnOverlayTriplePublicUrls(unitKey, hash);
  if (!triple) return null;
  const ok = await objectExistsAtPublicUrl(triple[1]);
  if (!ok) return null;
  const t = Date.now();
  return [`${triple[0]}?t=${t}`, `${triple[1]}?t=${t}`, `${triple[2]}?t=${t}`];
}
