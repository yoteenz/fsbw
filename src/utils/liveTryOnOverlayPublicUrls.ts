import {
  LIVE_TRY_ON_OVERLAY_CACHE_SEGMENT,
  type LiveTryOnPhotoModel,
} from '../constants/liveTryOnSpikeAssets';
import { wigPreviewManifestHashLiveColorTier, type WigPreviewSelectionsForHash } from './wigPreviewLiveColorTierHash';

const ANGLES = ['left', 'front', 'right'] as const;
type Angle = (typeof ANGLES)[number];

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

function overlayPath(
  pv: string,
  unitKey: string,
  hash: string,
  photoModel: LiveTryOnPhotoModel,
  angle: Angle
): string {
  const u = String(unitKey || 'NOIR').toUpperCase();
  return `try-on-overlay/${LIVE_TRY_ON_OVERLAY_CACHE_SEGMENT}/${pv}/${u}/${hash}/${photoModel}/${angle}.png`;
}

function portraitPath(
  pv: string,
  unitKey: string,
  hash: string,
  photoModel: LiveTryOnPhotoModel,
  angle: Angle
): string {
  const u = String(unitKey || 'NOIR').toUpperCase();
  return `try-on-portrait/${LIVE_TRY_ON_OVERLAY_CACHE_SEGMENT}/${pv}/${u}/${hash}/${photoModel}/${angle}.webp`;
}

export type LiveTryOnCompareAngleUrls = {
  left: string;
  front: string;
  right: string;
};

export function liveTryOnOverlayPublicUrlForAngle(
  unitKey: string,
  manifestHash: string,
  photoModel: LiveTryOnPhotoModel,
  angle: Angle
): string | null {
  const cfg = storageConfig();
  if (!cfg) return null;
  const base = `${cfg.supabase}/storage/v1/object/public/${cfg.bucket}`;
  const u = String(unitKey || 'NOIR').toUpperCase();
  return `${base}/${overlayPath(cfg.pv, u, manifestHash, photoModel, angle)}`;
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

/** Full L/F/R when all three overlays exist. */
export async function resolveLiveTryOnOverlayTripleIfStored(
  sel: WigPreviewSelectionsForHash,
  photoModel: LiveTryOnPhotoModel
): Promise<[string, string, string] | null> {
  const unitKey = String(sel.unitKey || 'NOIR').toUpperCase();
  const hash = await wigPreviewManifestHashLiveColorTier(sel);
  const t = Date.now();
  const urls: string[] = [];
  for (const angle of ANGLES) {
    const raw = liveTryOnOverlayPublicUrlForAngle(unitKey, hash, photoModel, angle);
    if (!raw) return null;
    const ok = await objectExistsAtPublicUrl(raw);
    if (!ok) return null;
    urls.push(`${raw}?t=${t}`);
  }
  return urls as [string, string, string];
}

/**
 * Opens live view as soon as **front** overlay exists; missing L/R reuse front until ready.
 */
export async function resolveLiveTryOnOverlayTripleBestEffort(
  sel: WigPreviewSelectionsForHash,
  photoModel: LiveTryOnPhotoModel
): Promise<[string, string, string] | null> {
  const unitKey = String(sel.unitKey || 'NOIR').toUpperCase();
  const hash = await wigPreviewManifestHashLiveColorTier(sel);
  const t = Date.now();
  const byAngle: Partial<Record<Angle, string>> = {};
  for (const angle of ANGLES) {
    const raw = liveTryOnOverlayPublicUrlForAngle(unitKey, hash, photoModel, angle);
    if (!raw) continue;
    if (await objectExistsAtPublicUrl(raw)) {
      byAngle[angle] = `${raw}?t=${t}`;
    }
  }
  const front = byAngle.front;
  if (!front) return null;
  return [byAngle.left ?? front, front, byAngle.right ?? front];
}

export async function resolveLiveTryOnPortraitTripleIfStored(
  sel: WigPreviewSelectionsForHash,
  photoModel: LiveTryOnPhotoModel
): Promise<[string, string, string] | null> {
  const cfg = storageConfig();
  if (!cfg) return null;
  const unitKey = String(sel.unitKey || 'NOIR').toUpperCase();
  const hash = await wigPreviewManifestHashLiveColorTier(sel);
  const base = `${cfg.supabase}/storage/v1/object/public/${cfg.bucket}`;
  const u = String(unitKey || 'NOIR').toUpperCase();
  const triple = ANGLES.map(
    (angle) => `${base}/${portraitPath(cfg.pv, u, hash, photoModel, angle)}`
  );
  const ok = await objectExistsAtPublicUrl(triple[1]);
  if (!ok) return null;
  const ts = Date.now();
  return triple.map((url) => `${url}?t=${ts}`) as [string, string, string];
}
