/**
 * Bump when isolation prompt/pipeline changes (invalidates bad cached full-mannequin PNGs).
 * Must match `LIVE_TRY_ON_OVERLAY_CACHE_SEGMENT` in `src/constants/liveTryOnSpikeAssets.ts`.
 */
export const LIVE_TRY_ON_OVERLAY_CACHE_SEGMENT = 'hair-v4-on-model';

export type LiveTryOnAngle = 'left' | 'front' | 'right';

/** After NBP: true alpha PNG (PSA stack). */
export const LIVE_TRY_ON_IDEOGRAM_MODEL = 'fal-ai/ideogram/remove-background';

function appOrigin(): string {
  const explicit = (process.env.WIG_PREVIEW_PUBLIC_APP_ORIGIN || process.env.SITE_URL || '').trim().replace(
    /\/$/,
    ''
  );
  return explicit || 'https://www.frontalslayer.com';
}

/**
 * On-model try-on references (real person wearing the unit), **not** gray-brick mannequins.
 * Set `WIG_PREVIEW_TRYON_MODEL_{LEFT|FRONT|RIGHT}_URL` per angle; until then all angles use
 * `client-photo.png` (NOIR PDP on-model shot).
 */
export function liveTryOnOnModelReferenceUrl(angle: LiveTryOnAngle): string {
  const origin = appOrigin();
  const defaultFront = `${origin}/assets/NOIR/client-photo.png`;
  const byAngle: Record<LiveTryOnAngle, string | undefined> = {
    front: process.env.WIG_PREVIEW_TRYON_MODEL_FRONT_URL?.trim(),
    left: process.env.WIG_PREVIEW_TRYON_MODEL_LEFT_URL?.trim(),
    right: process.env.WIG_PREVIEW_TRYON_MODEL_RIGHT_URL?.trim(),
  };
  return byAngle[angle] || defaultFront;
}

function angleConstraint(angle: LiveTryOnAngle): string {
  if (angle === 'left') {
    return 'Keep a **left 3/4** head turn: hair mass toward the viewer’s right; same framing as the reference.';
  }
  if (angle === 'right') {
    return 'Keep a **right 3/4** head turn: hair mass toward the viewer’s left; same framing as the reference.';
  }
  return 'Keep a **front** view: same head pose and framing as the reference.';
}

function isJetBlackOffBlack(label: string, hex: string): boolean {
  const h = hex.replace(/^#/, '').toUpperCase();
  if (h === '000000' || h === '00000') return true;
  const l = label.toLowerCase();
  return l.includes('jet black') || l.includes('off black');
}

/** Step 1: recolor hair on the on-model photo; preserve face, skin, outfit, background. */
export function buildLiveTryOnOnModelRecolorPrompt(
  label: string,
  hex: string,
  angle: LiveTryOnAngle
): string {
  const nearBlack = isJetBlackOffBlack(label, hex);
  const recolorLead = nearBlack
    ? `Match the model’s wig hair to **${label}** at hex **#${hex}** — lock silhouette, part, length, and volume; only normalize tone/sheen. Do **not** restyle or change which side hair falls.`
    : `Change **only** the wig hair color to **${label}** (hex **#${hex}**) so it looks like authentically dyed salon hair — not a flat CGI tint.`;

  return [
    'You are editing a **real person** product photo for AR wig try-on.',
    recolorLead,
    angleConstraint(angle),
    '**Preserve exactly:** face, skin, eyes, ears, neck, shoulders, clothing, jewelry, background, lighting, and camera perspective.',
    'Do **not** add mannequins, busts, stands, logos, or gray studio bricks.',
    'Do **not** blur, beautify, or replace the person’s identity.',
    'Hair should remain the same cut, length, curl, and part as the reference.',
  ].join(' ');
}

/**
 * Step 2: extract hair + lace only from the recolored on-model shot (white backdrop for Ideogram).
 */
export const LIVE_TRY_ON_HAIR_ISOLATION_NBP_PROMPT = [
  'Cut out **only** the lace-front wig for AR overlay — NOT a portrait.',
  'DELETE COMPLETELY: face, skin, eyes, ears, neck, shoulders, chest, clothing, hands, background, studio props.',
  'OUTPUT: ONLY the hair unit and visible lace band — floating alone on solid flat #FFFFFF.',
  'KEEP: exact hair color, length, curl, part, volume, and silhouette from the reference.',
  'ZERO pixels of human skin or facial features may remain.',
].join(' ');

export function liveTryOnOverlayStoragePath(
  promptVersion: string,
  unitKey: string,
  manifestHash: string,
  angle: LiveTryOnAngle
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
