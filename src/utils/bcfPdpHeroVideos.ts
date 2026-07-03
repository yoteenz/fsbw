/**
 * BCF PDP hero video URLs — manifest-backed with legacy fallbacks.
 */

import { BUNDLE_PHOTO_BY_TEXTURE, type BcfPdpCategory, type BcfPdpTexture } from './bcfPdpHeroAssets';
import { BCF_PDP_HERO_VIDEOS } from './bcfPdpHeroVideos.generated';

export type BcfPdpHeroVideoSources = {
  mp4: string;
  webm?: string | null;
};

const LOCAL_BUNDLE_STRAIGHT_FALLBACK = '/assets/straight-bundle-video.MP4';

const LEGACY_BCF_VIDEO_STORAGE_PATH: Record<string, string> = {
  'bundles-straight-default': 'wig-preview-live/make_this_image_shake_the_hair_Kling_30__51488.mov',
  'bundles-wavy-default': 'wig-preview-live/make_this_image_shake_the_hair_Kling_30__98237.mov',
  'bundles-curly-default': 'wig-preview-live/make_this_image_shake_the_hair_Kling_30__24695.mov',
  'closures-straight-default': 'wig-preview-live/make_this_image_shake_the_hair_Kling_30__27854.mov',
  'closures-wavy-default': 'wig-preview-live/make_this_image_shake_the_hair_Kling_30__49906.mov',
  'closures-curly-default': 'wig-preview-live/make_this_image_shake_the_hair_Kling_30__28643.mov',
  'frontals-straight-default': 'wig-preview-live/make_this_image_shake_the_hair_Kling_30__79719.mov',
  'frontals-wavy-default': 'wig-preview-live/make_this_image_slowly_showcas_Kling_30__78091.mov',
  'frontals-curly-default': 'wig-preview-live/make_this_image_shake_the_hair_Kling_30__79392.mov',
};

function livePreviewPublicBase(): string | null {
  const sample = BUNDLE_PHOTO_BY_TEXTURE.straight;
  const marker = '/storage/v1/object/public/live-preview/';
  const idx = sample.indexOf(marker);
  if (idx === -1) return null;
  return sample.slice(0, idx + marker.length);
}

function publicStorageUrl(storagePath: string): string | null {
  const base = livePreviewPublicBase();
  if (!base) return null;
  return `${base}${storagePath
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')}`;
}

function slugifyColorId(colorId: string): string {
  return String(colorId || 'DEFAULT')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildProductKey(category: BcfPdpCategory, texture: BcfPdpTexture, colorId: string): string {
  const colorSlug = slugifyColorId(colorId);
  if (colorSlug === 'default') return `${category}-${texture}-default`;
  return `${category}-${texture}-${colorSlug}`;
}

function manifestEntry(productKey: string): BcfPdpHeroVideoSources | null {
  const videos = BCF_PDP_HERO_VIDEOS as Record<
    string,
    { mp4StoragePath?: string | null; webmStoragePath?: string | null }
  >;
  const hit = videos[productKey];
  const mp4Path = hit?.mp4StoragePath;
  if (!mp4Path) return null;
  const mp4 = publicStorageUrl(mp4Path);
  if (!mp4) return null;
  const webmPath = hit.webmStoragePath;
  const webm = webmPath ? publicStorageUrl(webmPath) : null;
  return { mp4, webm };
}

function legacyVideoForKey(productKey: string): BcfPdpHeroVideoSources | null {
  const storagePath = LEGACY_BCF_VIDEO_STORAGE_PATH[productKey];
  if (!storagePath) return null;
  const mp4 = publicStorageUrl(storagePath);
  if (!mp4) return null;
  return { mp4, webm: null };
}

/**
 * Resolve hero video for a BCF PDP row — prefers color-specific manifest entry,
 * then texture default, then legacy .mov map.
 */
export function bcfPdpHeroVideoSrc(
  category: BcfPdpCategory,
  texture: BcfPdpTexture,
  colorId: string,
): BcfPdpHeroVideoSources | null {
  const colorKey = buildProductKey(category, texture, colorId);
  const colorHit = manifestEntry(colorKey);
  if (colorHit) return colorHit;

  const defaultKey = buildProductKey(category, texture, 'DEFAULT');
  const defaultHit = manifestEntry(defaultKey) ?? legacyVideoForKey(defaultKey);
  if (defaultHit) return defaultHit;

  if (category === 'bundles' && texture === 'straight') {
    return { mp4: LOCAL_BUNDLE_STRAIGHT_FALLBACK, webm: null };
  }

  return null;
}

/** Primary `<video src>` — prefers WebM when available. */
export function bcfPdpHeroVideoPrimarySrc(sources: BcfPdpHeroVideoSources): string {
  return sources.webm || sources.mp4;
}

/** MP4 fallback when WebM fails in-browser. */
export function bcfPdpHeroVideoMp4Fallback(
  category: BcfPdpCategory,
  texture: BcfPdpTexture,
  sources: BcfPdpHeroVideoSources,
): string | null {
  if (sources.webm && sources.mp4) return sources.mp4;
  if (category === 'bundles' && texture === 'straight' && sources.mp4.includes('51488')) {
    return LOCAL_BUNDLE_STRAIGHT_FALLBACK;
  }
  return null;
}
