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

/** Studio Try-On always uses GPT Image 2 (override via env for A/B only). */
export function activeLiveTryOnStudioPhotoModel(): LiveTryOnPhotoModel {
  const raw = (process.env.WIG_PREVIEW_TRYON_STUDIO_PHOTO_MODEL || 'gpt2').trim().toLowerCase();
  if (raw === 'nbp' || raw === 'nano-banana' || raw === 'nano-banana-pro') return 'nbp';
  return 'gpt2';
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

/** Studio glam — NBP-style DOF on the customer’s real environment (no backdrop swap). */
const STUDIO_GLAM_COMPOSITION = [
  '**Background (required — preserve realism):** **Keep** the customer’s **actual room and environment** from IMAGE 1 — same walls, furniture, plants, doorways, and colors.',
  'Do **not** replace the room with a grey studio seamless, white backdrop, or a different location.',
  'Apply **shallow depth of field** only: background **softly out of focus** with natural **bokeh**, while **face, skin, and hair stay tack sharp**.',
  'Polished editorial color grade on the subject — subtle; do not flatten the real space into a fake studio set.',
].join(' ');

function studioHeadYawDegrees(poseAngle: LiveTryOnAngle, headYawDeg?: number): number {
  if (typeof headYawDeg === 'number' && Number.isFinite(headYawDeg)) {
    return Math.round(Math.max(-40, Math.min(40, headYawDeg)));
  }
  if (poseAngle === 'left') return 40;
  if (poseAngle === 'right') return -40;
  return 0;
}

function studioHeadYawLabel(deg: number): string {
  if (deg > 0) return `+${deg}°`;
  if (deg < 0) return `${deg}°`;
  return '0°';
}

/** Center part locked to skull midline at the measured head yaw — not the 2D image center. */
function studioCenterPartConstraint(poseAngle: LiveTryOnAngle, headYawDeg?: number): string {
  const yaw = studioHeadYawDegrees(poseAngle, headYawDeg);
  const yawLabel = studioHeadYawLabel(yaw);
  const absYaw = Math.abs(yaw);

  const anchor = [
    '**CENTER / MIDDLE PART (mandatory — cranial midline, not photo-frame center):**',
    `IMAGE 1 head yaw is **${yawLabel}** — the part must ride the **3D skull midline** (sagittal plane through nose bridge and crown), **rotated with the head**.`,
    '**Never** center the part in the horizontal middle of the visible hair silhouette when the face is turned — that is wrong.',
    '**Ignore** any off-center part in the mannequin — force a true **middle part** on this person’s head at this yaw.',
    '**Part line only** at crown — **do not** interpret as symmetric hair on **both shoulders** (see drape rules).',
  ];

  if (absYaw <= 8) {
    return [
      ...anchor,
      '**~0° front:** Part groove visible vertically at **center of forehead** between brows, continuing over crown — facial midline square to camera.',
    ].join(' ');
  }

  if (yaw > 0) {
    return [
      ...anchor,
      `**${yawLabel} yaw (left cheek toward camera):** Midline part runs **fore–aft along the crown ridge** — groove appears **offset toward the viewer’s RIGHT** (far / away-from-camera scalp), **not** the horizontal center of the hair blob.`,
      'Only a **short crown segment** of the part may show — **forbidden** to paint a full front-facing center line down the forehead while the face is turned.',
      'Near-side (left) panel frames the visible cheek; far-side panel wraps behind the ear toward the back of the head.',
      '**Self-check:** if the part sits in the horizontal center of the silhouette → **failed** — move it toward **image RIGHT** along the crown.',
    ].join(' ');
  }

  return [
    ...anchor,
    `**${yawLabel} yaw (right cheek toward camera):** Midline part on the **crown ridge**, groove **offset toward the viewer’s LEFT** (far scalp), **not** the center of visible hair.`,
    '**Forbidden:** a centered part in the frame with a profile pose; fake forehead center line while the face is turned.',
    'Near-side (right) panel frames the visible cheek; far-side panel wraps behind the ear.',
    '**Self-check:** part in horizontal center of silhouette → **failed** — move toward **image LEFT** along the crown.',
  ].join(' ');
}

function studioHeadPoseLine(poseAngle: LiveTryOnAngle, headYawDeg?: number): string {
  const yaw = studioHeadYawDegrees(poseAngle, headYawDeg);
  const yawLabel = studioHeadYawLabel(yaw);
  return [
    `**Head yaw from IMAGE 1: ${yawLabel}** — preserve exact face rotation, chin, neck, and shoulders from the selfie.`,
    'Do **not** rotate the customer to front-facing or to match the front mannequin.',
    `Draw the lace front, crown split, and part **as they appear on a head turned ${yawLabel}**, not on a 0° face.`,
  ].join(' ');
}

/** Match portrait / mannequin one-shoulder sweep (not a symmetrical curtain on both shoulders). */
const STUDIO_DRAPE_SIDE = [
  '**LENGTH DRAPE (mandatory — match portrait renders):** Copy the **one-sided shoulder sweep** from the references — **not** equal hair mass on both shoulders.',
  '**DRAPE SIDE:** Almost all long length falls **forward over the viewer’s LEFT shoulder only** (left edge of the image).',
  '**Viewer’s RIGHT shoulder:** only a thin tuck, hair behind the shoulder, or nothing crossing the collarbone — **never** a second heavy cascade.',
  '**FORBIDDEN:** symmetrical “curtain” on both shoulders, twin waterfalls, or matching thick panels on left and right.',
  '**Self-check:** if both shoulders have matching thick hair in front → **failed**.',
].join(' ');

/**
 * **Studio Try-On** — IMAGE 1 = shopper selfie; IMAGE 2 = front mannequin; optional IMAGE 3 = GPT portrait for drape.
 */
export function buildLiveTryOnStudioTryOnPrompt(
  label: string,
  hex: string,
  poseAngle: LiveTryOnAngle,
  opts?: { hasPortraitRef?: boolean; headYawDeg?: number }
): string {
  const hasPortraitRef = opts?.hasPortraitRef === true;
  const headYawDeg = opts?.headYawDeg;
  const nearBlack = isJetBlackOffBlack(label, hex);
  const colorLine = nearBlack
    ? `Wig hair color **${label}** (hex **#${hex}**) — match the mannequin reference silhouette; normalize tone/sheen only.`
    : `Wig hair color **${label}** (hex **#${hex}**) — salon-realistic dyed hair, not flat CGI.`;

  const poseLine = studioHeadPoseLine(poseAngle, headYawDeg);

  const refBlock = hasPortraitRef
    ? [
        '**IMAGE 2** is the **front mannequin** — wig **color**, length, density, curl, and lace.',
        '**IMAGE 3** is the **GPT portrait render** — copy its **exact** shoulder sweep, length drape, and hair silhouette onto IMAGE 1 (same as admin portrait thumbs).',
        'Replace **only** the hair on IMAGE 1; face stays from IMAGE 1; drape geometry from IMAGE 3.',
      ]
    : [
        '**IMAGE 2** is the **front-view** mannequin wig reference — use it for **length, density, curl, lace, color, and shoulder sweep** (not head angle).',
        'Replace **only** the hair on the person in IMAGE 1 with the lace-front wig from IMAGE 2.',
      ];

  return [
    '**IMAGE 1** is the customer selfie — keep their **exact** face, skin tone, expression, eyes, and head pose.',
    ...refBlock,
    colorLine,
    studioCenterPartConstraint(poseAngle, headYawDeg),
    STUDIO_DRAPE_SIDE,
    poseLine,
    hasPortraitRef
      ? 'Match **length, density, curl pattern, layers, and volume** from IMAGE 2 + **drape from IMAGE 3** — not a new cut.'
      : 'Match **length, density, curl pattern, layers, volume, and one-sided drape** from IMAGE 2 — not a new cut.',
    STUDIO_GLAM_COMPOSITION,
    '**No visible makeup** — bare natural skin as in the selfie; do not add lipstick, blush, or eye makeup.',
    'Realistic hairline blend at the lace front.',
    '**Delete from output only:** mannequin gray skin, bust, stand, bricks, FRONTAL SLAYER logo — never delete or swap the customer’s real room.',
    'No text or watermark.',
    'Ultra sharp, photographic — not illustration, sticker, or cutout overlay.',
  ].join(' ');
}

/** Second pass — light editorial makeup on the finished studio render (hair/pose/room locked). */
export function buildLiveTryOnStudioMakeupPassPrompt(): string {
  return [
    '**IMAGE 1** is a finished studio portrait with lace-front wig — keep **everything identical**: wig, hair, pose, expression, background, lighting, and skin tone.',
    'Add **very light, natural, photography-ready makeup** only — subtle skin evening, soft under-eye brightness, faint lip tint, gentle brow definition, barely-there blush.',
    'Style: soft editorial beauty / light social-photo filter aesthetic — **not** heavy glam, not obvious cosmetics, not changing face shape or features.',
    '**Do not** change hair, lace, outfit, room, depth of field, or body pose.',
    '**No makeup overload** — should look like the same person with a light touch-up for a photo shoot.',
    'No text or watermark.',
  ].join(' ');
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
