/**
 * Bump when isolation prompt/pipeline changes (invalidates bad cached full-mannequin PNGs).
 * Must match `LIVE_TRY_ON_OVERLAY_CACHE_SEGMENT` in `src/constants/liveTryOnSpikeAssets.ts`.
 */
export const LIVE_TRY_ON_OVERLAY_CACHE_SEGMENT = 'hair-v3';

/**
 * NBP pass: hair-only on flat white (no mannequin). Do **not** use `bawFalEditPreserveReferenceBlock` —
 * that block locks face, skin, and backdrop and causes the full mannequin to be kept.
 */
export const LIVE_TRY_ON_HAIR_ISOLATION_NBP_PROMPT = [
  'You are cutting out a lace-front wig for AR try-on — NOT editing the mannequin photo.',
  'DELETE COMPLETELY: mannequin face, facial features, skin, ears, neck, shoulders, chest, logo, backdrop, bricks.',
  'OUTPUT: ONLY the hair unit and visible lace frontal band — as if the wig is floating alone.',
  'Background must be solid flat #FFFFFF (full frame white).',
  'KEEP: exact hair color, length, curl pattern, part, volume, and silhouette from the reference.',
  'ZERO pixels of mannequin skin or eyes may remain.',
].join(' ');

/** After NBP: true alpha PNG (PSA stack). */
export const LIVE_TRY_ON_IDEOGRAM_MODEL = 'fal-ai/ideogram/remove-background';

export function liveTryOnOverlayStoragePath(
  promptVersion: string,
  unitKey: string,
  manifestHash: string,
  angle: 'left' | 'front' | 'right'
): string {
  const u = String(unitKey || 'NOIR').toUpperCase();
  return `try-on-overlay/${LIVE_TRY_ON_OVERLAY_CACHE_SEGMENT}/${promptVersion}/${u}/${manifestHash}/${angle}.png`;
}

export function liveTryOnOverlayPublicUrls(
  supabaseUrl: string,
  bucket: string,
  promptVersion: string,
  unitKey: string,
  manifestHash: string
): { left: string; front: string; right: string } {
  const base = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${bucket}`;
  return {
    left: `${base}/${liveTryOnOverlayStoragePath(promptVersion, unitKey, manifestHash, 'left')}`,
    front: `${base}/${liveTryOnOverlayStoragePath(promptVersion, unitKey, manifestHash, 'front')}`,
    right: `${base}/${liveTryOnOverlayStoragePath(promptVersion, unitKey, manifestHash, 'right')}`,
  };
}
