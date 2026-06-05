import { bawFalEditPreserveReferenceBlock } from './bawFalEditFidelityPrompt.js';

/** Transparent hair-only cutout for live try-on compositing (from live color WebP). */
export const LIVE_TRY_ON_HAIR_ISOLATION_PROMPT = [
  'Extract ONLY the wig and hair from this photo.',
  'Output with a fully transparent background (true alpha channel).',
  'Remove the mannequin face, skin, neck, body, studio backdrop, brick wall, and chest logo.',
  'Preserve the exact hair color, length, texture, parting, and silhouette from the source image.',
  bawFalEditPreserveReferenceBlock(),
  'No text, no watermark, no checkerboard fake transparency.',
].join(' ');

export function liveTryOnOverlayStoragePath(
  promptVersion: string,
  unitKey: string,
  manifestHash: string,
  angle: 'left' | 'front' | 'right'
): string {
  const u = String(unitKey || 'NOIR').toUpperCase();
  return `try-on-overlay/${promptVersion}/${u}/${manifestHash}/${angle}.png`;
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
