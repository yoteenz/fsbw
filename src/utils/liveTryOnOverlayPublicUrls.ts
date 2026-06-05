import {
  LIVE_TRY_ON_OVERLAY_CACHE_SEGMENT,
  type LiveTryOnPhotoModel,
} from '../constants/liveTryOnSpikeAssets';
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

function overlayPath(
  pv: string,
  unitKey: string,
  hash: string,
  photoModel: LiveTryOnPhotoModel,
  angle: 'left' | 'front' | 'right'
): string {
  const u = String(unitKey || 'NOIR').toUpperCase();
  return `try-on-overlay/${LIVE_TRY_ON_OVERLAY_CACHE_SEGMENT}/${pv}/${u}/${hash}/${photoModel}/${angle}.png`;
}

function portraitPath(
  pv: string,
  unitKey: string,
  hash: string,
  photoModel: LiveTryOnPhotoModel,
  angle: 'left' | 'front' | 'right'
): string {
  const u = String(unitKey || 'NOIR').toUpperCase();
  return `try-on-portrait/${LIVE_TRY_ON_OVERLAY_CACHE_SEGMENT}/${pv}/${u}/${hash}/${photoModel}/${angle}.webp`;
}

export type LiveTryOnCompareAngleUrls = {
  left: string;
  front: string;
  right: string;
};

export function liveTryOnOverlayTriplePublicUrls(
  unitKey: string,
  manifestHash: string,
  photoModel: LiveTryOnPhotoModel
): [string, string, string] | null {
  const cfg = storageConfig();
  if (!cfg) return null;
  const base = `${cfg.supabase}/storage/v1/object/public/${cfg.bucket}`;
  const u = String(unitKey || 'NOIR').toUpperCase();
  return [
    `${base}/${overlayPath(cfg.pv, u, manifestHash, photoModel, 'left')}`,
    `${base}/${overlayPath(cfg.pv, u, manifestHash, photoModel, 'front')}`,
    `${base}/${overlayPath(cfg.pv, u, manifestHash, photoModel, 'right')}`,
  ];
}

export function liveTryOnPortraitTriplePublicUrls(
  unitKey: string,
  manifestHash: string,
  photoModel: LiveTryOnPhotoModel
): [string, string, string] | null {
  const cfg = storageConfig();
  if (!cfg) return null;
  const base = `${cfg.supabase}/storage/v1/object/public/${cfg.bucket}`;
  const u = String(unitKey || 'NOIR').toUpperCase();
  return [
    `${base}/${portraitPath(cfg.pv, u, manifestHash, photoModel, 'left')}`,
    `${base}/${portraitPath(cfg.pv, u, manifestHash, photoModel, 'front')}`,
    `${base}/${portraitPath(cfg.pv, u, manifestHash, photoModel, 'right')}`,
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
  sel: WigPreviewSelectionsForHash,
  photoModel: LiveTryOnPhotoModel
): Promise<[string, string, string] | null> {
  const unitKey = String(sel.unitKey || 'NOIR').toUpperCase();
  const hash = await wigPreviewManifestHashLiveColorTier(sel);
  const triple = liveTryOnOverlayTriplePublicUrls(unitKey, hash, photoModel);
  if (!triple) return null;
  const ok = await objectExistsAtPublicUrl(triple[1]);
  if (!ok) return null;
  const t = Date.now();
  return [`${triple[0]}?t=${t}`, `${triple[1]}?t=${t}`, `${triple[2]}?t=${t}`];
}

export async function resolveLiveTryOnPortraitTripleIfStored(
  sel: WigPreviewSelectionsForHash,
  photoModel: LiveTryOnPhotoModel
): Promise<[string, string, string] | null> {
  const unitKey = String(sel.unitKey || 'NOIR').toUpperCase();
  const hash = await wigPreviewManifestHashLiveColorTier(sel);
  const triple = liveTryOnPortraitTriplePublicUrls(unitKey, hash, photoModel);
  if (!triple) return null;
  const ok = await objectExistsAtPublicUrl(triple[1]);
  if (!ok) return null;
  const t = Date.now();
  return [`${triple[0]}?t=${t}`, `${triple[1]}?t=${t}`, `${triple[2]}?t=${t}`];
}
