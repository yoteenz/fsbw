/**
 * Bump when isolation prompt/pipeline changes (invalidates bad cached full-mannequin PNGs).
 * Must match `LIVE_TRY_ON_OVERLAY_CACHE_SEGMENT` in `src/constants/liveTryOnSpikeAssets.ts`.
 */
export const LIVE_TRY_ON_OVERLAY_CACHE_SEGMENT = 'hair-v2';

/**
 * NBP pass: hair-only on flat white (no mannequin). Do **not** use `bawFalEditPreserveReferenceBlock` —
 * that block locks face, skin, and backdrop and causes the full mannequin to be kept.
 */
export const LIVE_TRY_ON_HAIR_ISOLATION_NBP_PROMPT = [
  'TASK: Output ONLY the lace-front wig and hair from the input — nothing else.',
  'DELETE from the image: mannequin face, eyes, brows, nose, lips, skin, ears, neck, shoulders, chest, FRONTAL SLAYER logo, studio backdrop, rose border, and bricks.',
  'KEEP exactly: hair color, length, density, curl/straight texture, parting, hairline lace edge, and silhouette.',
  'Place the isolated wig on a solid flat pure white #FFFFFF background (no gradient, no vignette).',
  'The mannequin head must not appear — only the hair unit floating as it would sit above a real hairline.',
  'Photoreal hair strands; no cartoon, no plastic CGI skin, no checkerboard pattern.',
].join(' ');

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
