/**
 * Bump when photoreal / isolation prompt or path layout changes.
 * Must match `LIVE_TRY_ON_OVERLAY_CACHE_SEGMENT` in `src/constants/liveTryOnSpikeAssets.ts`.
 */
export const LIVE_TRY_ON_OVERLAY_CACHE_SEGMENT = 'hair-v5-photo-woman';

export type LiveTryOnAngle = 'left' | 'front' | 'right';

export type LiveTryOnPhotoModel = 'nbp' | 'gpt2';

export const LIVE_TRY_ON_PHOTO_MODELS: LiveTryOnPhotoModel[] = ['nbp', 'gpt2'];

export const LIVE_TRY_ON_FAL_NBP_EDIT = 'fal-ai/nano-banana-pro/edit';
export const LIVE_TRY_ON_FAL_GPT2_EDIT = 'openai/gpt-image-2/edit';

/** After NBP isolation pass: true alpha PNG (PSA stack). */
export const LIVE_TRY_ON_IDEOGRAM_MODEL = 'fal-ai/ideogram/remove-background';

/** Active model for live camera overlay after you pick a winner (`nbp` | `gpt2`). */
export function activeLiveTryOnPhotoModel(): LiveTryOnPhotoModel {
  const raw = (process.env.WIG_PREVIEW_TRYON_PHOTO_MODEL || 'nbp').trim().toLowerCase();
  return raw === 'gpt2' || raw === 'gpt' || raw === 'gpt-image-2' ? 'gpt2' : 'nbp';
}

export function parseLiveTryOnPhotoModel(value: string | undefined): LiveTryOnPhotoModel | null {
  const v = String(value || '').trim().toLowerCase();
  if (v === 'nbp' || v === 'nano-banana' || v === 'nano-banana-pro') return 'nbp';
  if (v === 'gpt2' || v === 'gpt' || v === 'gpt-image-2') return 'gpt2';
  return null;
}

function angleConstraint(angle: LiveTryOnAngle): string {
  if (angle === 'left') {
    return [
      '**Head + shoulder yaw: +40° from front** (subject turned 40° toward **their right**; **left cheek** nearest camera).',
      '**Match the mannequin reference yaw exactly** — not 0° front, not −40° (opposite side).',
      'Hair mass toward the **viewer’s right**; **same part direction and shoulder bias** as the reference — do not mirror.',
      'Keep the same **camera distance, crop, and shoulder line** as the mannequin frame.',
    ].join(' ');
  }
  if (angle === 'right') {
    return [
      '**Head + shoulder yaw: −40° from front** (subject turned 40° toward **their left**; **right cheek** nearest camera).',
      '**Match the mannequin reference yaw exactly at −40°** — **not** 0° (front), **not** +40° (mirrored left pose), **not** “eyes only” turned toward center while body stays front.',
      'Nose, chin, neck, and **both shoulders** stay locked to **−40°** like the reference — same body angle as the left view but on the **opposite** side.',
      'Hair mass toward the **viewer’s left**; **same part direction and shoulder bias** as the reference.',
      'Keep the same **camera distance, crop, and shoulder line** as the mannequin frame.',
    ].join(' ');
  }
  return [
    '**Head + shoulder yaw: 0°** — square to camera (true front; no turn).',
    '**Exact** center part line, length, volume, and one-sided shoulder sweep from the reference — do not symmetrically mirror hair.',
    'Keep the same **camera distance and crop** as the mannequin frame.',
  ].join(' ');
}

function isJetBlackOffBlack(label: string, hex: string): boolean {
  const h = hex.replace(/^#/, '').toUpperCase();
  if (h === '000000' || h === '00000') return true;
  const l = label.toLowerCase();
  return l.includes('jet black') || l.includes('off black');
}

/**
 * **Same prompt** for NBP and GPT Image 2 — mannequin color WebP in `image_urls[0]`.
 * Output: photorealistic woman wearing the same wig (color, length, part, silhouette).
 */
export function buildLiveTryOnPhotorealWomanPrompt(
  label: string,
  hex: string,
  angle: LiveTryOnAngle
): string {
  const nearBlack = isJetBlackOffBlack(label, hex);
  const colorLine = nearBlack
    ? `Wig hair color **${label}** (hex **#${hex}**) — match the reference silhouette; normalize tone/sheen only.`
    : `Wig hair color **${label}** (hex **#${hex}**) — salon-realistic dyed hair, not flat CGI.`;

  return [
    'Use the attached **mannequin wig reference** as the **only** source for hairstyle geometry.',
    'Create a **photorealistic** portrait of a beautiful woman wearing that **exact** lace-front wig:',
    colorLine,
    angleConstraint(angle),
    'Match **length, density, curl pattern, part, layers, and volume** from the mannequin — not a new cut.',
    '**Delete from output:** mannequin bust, gray skin, stand, FRONTAL SLAYER logo, bricks, studio props.',
    'Woman: photoreal editorial beauty — **neutral, elegant, mid-20s**, soft natural makeup, realistic eyes; **head pose and neck angle locked to the mannequin reference** (only swap mannequin for skin).',
    'Neutral blurred studio background, head and shoulders only — no jewelry, no dramatic styling.',
    'No text, no watermark, no extra jewelry unless subtle and realistic.',
    'Ultra sharp, photographic — not illustration or 3D render.',
  ].join(' ');
}

/** Extract hair + lace from photoreal portrait (white backdrop → Ideogram). */
export const LIVE_TRY_ON_HAIR_ISOLATION_NBP_PROMPT = [
  'Cut out **only** the lace-front wig for AR overlay — NOT a portrait.',
  'DELETE COMPLETELY: face, skin, eyes, ears, neck, shoulders, chest, clothing, hands, background.',
  'OUTPUT: ONLY the hair unit and visible lace band on solid flat #FFFFFF.',
  'KEEP: exact hair color, length, curl, part, volume, and silhouette from the reference.',
  'ZERO pixels of human skin or facial features may remain.',
].join(' ');

export function liveTryOnPortraitStoragePath(
  promptVersion: string,
  unitKey: string,
  manifestHash: string,
  photoModel: LiveTryOnPhotoModel,
  angle: LiveTryOnAngle
): string {
  const u = String(unitKey || 'NOIR').toUpperCase();
  return `try-on-portrait/${LIVE_TRY_ON_OVERLAY_CACHE_SEGMENT}/${promptVersion}/${u}/${manifestHash}/${photoModel}/${angle}.webp`;
}

export function liveTryOnOverlayStoragePath(
  promptVersion: string,
  unitKey: string,
  manifestHash: string,
  photoModel: LiveTryOnPhotoModel,
  angle: LiveTryOnAngle
): string {
  const u = String(unitKey || 'NOIR').toUpperCase();
  return `try-on-overlay/${LIVE_TRY_ON_OVERLAY_CACHE_SEGMENT}/${promptVersion}/${u}/${manifestHash}/${photoModel}/${angle}.png`;
}

/** NBP hair-isolation intermediate (white bg) before Ideogram alpha — one Fal job per HTTP call. */
export function liveTryOnOverlayWorkStoragePath(
  promptVersion: string,
  unitKey: string,
  manifestHash: string,
  photoModel: LiveTryOnPhotoModel,
  angle: LiveTryOnAngle
): string {
  const u = String(unitKey || 'NOIR').toUpperCase();
  return `try-on-work/${LIVE_TRY_ON_OVERLAY_CACHE_SEGMENT}/${promptVersion}/${u}/${manifestHash}/${photoModel}/${angle}/nbp-isolate.png`;
}

export type LiveTryOnAngleUrls = { left: string; front: string; right: string };

export function liveTryOnOverlayPublicUrlsForModel(
  supabaseUrl: string,
  bucket: string,
  promptVersion: string,
  unitKey: string,
  manifestHash: string,
  photoModel: LiveTryOnPhotoModel
): LiveTryOnAngleUrls {
  const base = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${bucket}`;
  const mk = (angle: LiveTryOnAngle) =>
    `${base}/${liveTryOnOverlayStoragePath(promptVersion, unitKey, manifestHash, photoModel, angle)}`;
  return { left: mk('left'), front: mk('front'), right: mk('right') };
}

export function liveTryOnPortraitPublicUrlsForModel(
  supabaseUrl: string,
  bucket: string,
  promptVersion: string,
  unitKey: string,
  manifestHash: string,
  photoModel: LiveTryOnPhotoModel
): LiveTryOnAngleUrls {
  const base = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${bucket}`;
  const mk = (angle: LiveTryOnAngle) =>
    `${base}/${liveTryOnPortraitStoragePath(promptVersion, unitKey, manifestHash, photoModel, angle)}`;
  return { left: mk('left'), front: mk('front'), right: mk('right') };
}

/** Overlays for the model selected via `WIG_PREVIEW_TRYON_PHOTO_MODEL`. */
export function liveTryOnOverlayPublicUrls(
  supabaseUrl: string,
  bucket: string,
  promptVersion: string,
  unitKey: string,
  manifestHash: string
): LiveTryOnAngleUrls {
  return liveTryOnOverlayPublicUrlsForModel(
    supabaseUrl,
    bucket,
    promptVersion,
    unitKey,
    manifestHash,
    activeLiveTryOnPhotoModel()
  );
}

export function falEditModelId(photoModel: LiveTryOnPhotoModel): string {
  return photoModel === 'gpt2' ? LIVE_TRY_ON_FAL_GPT2_EDIT : LIVE_TRY_ON_FAL_NBP_EDIT;
}
