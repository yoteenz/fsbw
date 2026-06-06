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

/** Studio glam — NBP-style heavy DOF + subject pop on the customer’s real environment (no backdrop swap). */
const STUDIO_GLAM_COMPOSITION = [
  '**DEPTH OF FIELD — NBP portrait glam (critical):** Shot on a **fast portrait lens** (**f/1.4–f/2.8**). Keep the customer’s **real room** from IMAGE 1 (same general hues and shapes) — **do not** replace with grey seamless, white backdrop, or a different location.',
  '**Background blur:** Defocus the room **heavily** — **creamy circular bokeh**; walls, furniture, bed, and doorways **barely readable**, melted into soft color patches. Background must be **much blurrier** than a phone snapshot — match **NBP admin portrait** thumb depth.',
  '**Subject lighting:** **Brighten face, skin, hair, and lace** with soft flattering **key light** on the subject — subject reads **~1–2 stops brighter** with polished editorial grade and healthy sheen on skin and hair.',
  '**Background separation:** **Slightly darken** the defocused background (gentle exposure falloff / vignette behind subject) so the person **pops as center focus** — luminous sharp subject, soft darker backdrop.',
  '**Sharp zone:** **Face, eyes, skin, lace front, and hair** stay **tack sharp**; only the room falls off.',
  '**Forbidden:** sharp readable background; flat even lighting where background competes with the face; background as bright as the subject.',
].join(' ');

/** Keep the selfie environment literal — blur only, never invent scenery. */
const STUDIO_BACKGROUND_LOCK = [
  '**BACKGROUND (mandatory):** Preserve **only** what exists in IMAGE 1 — same walls, furniture, doors, and clutter positions.',
  'Apply **blur/defocus to existing pixels only** — do **not** repaint, replace, or “upgrade” the room.',
  '**FORBIDDEN:** adding plants, lamps, mirrors, art, shelves, beds, chairs, decor, windows, people, or any object **not visible** in the selfie.',
  '**FORBIDDEN:** swapping to a studio backdrop, grey seamless, or a “cleaner” invented room.',
].join(' ');

/** Prevent hallucinated edge frizz / baby hairs at the hairline. */
const STUDIO_HAIRLINE_LOCK = [
  '**HAIRLINE EDGE (mandatory):** Match the **natural hairline** at forehead and temples from IMAGE 1 — clean lace blend only where the wig meets skin.',
  '**FORBIDDEN:** baby hairs, wispy edge frizz, flyaways, or micro-strands on the forehead/temples **unless they clearly exist** in IMAGE 1 natural hair.',
  'Do **not** copy wispy edges, baby hairs, or skin-adjacent frizz from the mannequin or portrait reference onto the customer’s skin.',
].join(' ');

/**
 * Mannequin refs mount wigs high on a bust — real lace installs sit flush on the skull.
 * Without this, outputs mimic “helmet hair” floating above the forehead.
 */
const STUDIO_SKULL_FIT = [
  '**SKULL FIT — REAL HUMAN HEAD (critical — override mannequin display styling):**',
  'Display mannequins mount wigs **high and forward** on a rigid bust for retail — that reads as **helmet hair** on a real person. **Do NOT** copy mannequin **vertical placement**, cap elevation, or hairline height from IMAGE 2 (or IMAGE 3).',
  'From IMAGE 2 / mannequin refs use **only**: color, length, density, curl pattern, layer shape, lace width, and shoulder drape — **never** how high the wig sits on the bust.',
  '**Lace front + hairline:** sit **flush against IMAGE 1’s scalp** at a **natural human forehead hairline** (~one finger-width above brows, following IMAGE 1 skull curve) — lace band hugs skin, **not** floating above the forehead.',
  '**Part:** groove sits **in** the hair at **natural crown depth** on this person’s skull midline — **not** on a lifted hair mass or display-mannequin crown.',
  '**Cap + volume:** wig cap follows **IMAGE 1 head contour** — hair grows **from** the scalp and crown, close to the skull; **forbidden** hovering cap, inflated crown bubble, or wig sitting above the cranium.',
  '**Self-check:** if the hairline or part reads higher than a salon lace install on this face → **failed** — lower until flush on the skull.',
].join(' ');

/** Makeup pass must not reframe or pan the finished render. */
const STUDIO_MAKEUP_FRAMING_LOCK = [
  '**FRAMING LOCK (critical):** Output must be **pixel-aligned** with IMAGE 1 — **identical crop, scale, aspect ratio, head position, and horizontal center**.',
  '**FORBIDDEN:** pan right/left, zoom, reframe, subject drift, or any shift in composition.',
  'Treat IMAGE 1 as a **photograph to preserve** — edit **face-skin makeup pixels only**; **zero** changes to hair, wig, lace, neck, clothing, or background pixels.',
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
    'Part groove sits **in the hair at natural crown depth** on the scalp — **not** on lifted display-mannequin hair or a floating crown mass.',
    '**Never** center the part in the horizontal middle of the visible hair silhouette when the face is turned — that is wrong.',
    '**Ignore** any off-center part or **elevated crown placement** in the mannequin — force a true **middle part** on this person’s head at this yaw, **flush on the skull**.',
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
        '**IMAGE 2** is the **front mannequin** — wig **color**, length, density, curl, and lace shape only (**not** vertical placement on the bust).',
        '**IMAGE 3** is the **GPT portrait render** — copy its **shoulder sweep, length drape, and silhouette** onto IMAGE 1 — **not** its hairline height, crown elevation, or mannequin-style cap position.',
        'Replace **only** the hair on IMAGE 1; face stays from IMAGE 1; drape geometry from IMAGE 3 — **not** hairline baby hairs, skin wisps, or helmet-hair elevation from IMAGE 3.',
      ]
    : [
        '**IMAGE 2** is the **front-view** mannequin wig reference — use it for **length, density, curl, lace shape, color, and shoulder sweep** only (**not** head angle or how high the wig sits on the bust).',
        'Replace **only** the hair on the person in IMAGE 1 with the lace-front wig from IMAGE 2 — installed **flush on their skull**, not at mannequin display height.',
      ];

  return [
    '**IMAGE 1** is the customer selfie — keep their **exact** face, skin tone, expression, eyes, and head pose.',
    ...refBlock,
    colorLine,
    STUDIO_SKULL_FIT,
    studioCenterPartConstraint(poseAngle, headYawDeg),
    STUDIO_DRAPE_SIDE,
    poseLine,
    hasPortraitRef
      ? 'Match **length, density, curl pattern, layers, and volume** from IMAGE 2 + **drape from IMAGE 3** — not a new cut; **never** copy mannequin crown height.'
      : 'Match **length, density, curl pattern, layers, volume, and one-sided drape** from IMAGE 2 — not a new cut; **never** copy mannequin crown height.',
    STUDIO_GLAM_COMPOSITION,
    STUDIO_BACKGROUND_LOCK,
    STUDIO_HAIRLINE_LOCK,
    '**No visible makeup** — bare natural skin as in the selfie; do not add lipstick, blush, or eye makeup.',
    'Realistic lace-front blend: hairline **flush on scalp** at natural forehead position from IMAGE 1.',
    '**Delete from output only:** mannequin gray skin, bust, stand, bricks, FRONTAL SLAYER logo — never delete or swap the customer’s real room.',
    'No text or watermark.',
    'Ultra sharp, photographic — not illustration, sticker, or cutout overlay.',
  ].join(' ');
}

/** Shorter studio prompt for Fal retries when the full prompt is rejected (422). */
export function buildLiveTryOnStudioTryOnPromptCompact(
  label: string,
  hex: string,
  poseAngle: LiveTryOnAngle,
  headYawDeg?: number
): string {
  const yaw = studioHeadYawDegrees(poseAngle, headYawDeg);
  const yawLabel = studioHeadYawLabel(yaw);
  return [
    'IMAGE 1 = customer selfie. IMAGE 2 = front mannequin wig reference.',
    `Keep face, skin, pose, and room from IMAGE 1. Head yaw ${yawLabel}.`,
    `Replace only hair with lace-front wig color ${label} (#${hex}) from IMAGE 2.`,
    'Wig flush on skull — natural hairline/part depth; not mannequin helmet height.',
    'Center part on skull midline at this yaw. One-sided drape over viewer left shoulder.',
    'Heavy background bokeh on existing room only — do not add objects. No baby hairs on skin.',
    'No makeup. Photoreal. No text.',
  ].join(' ');
}

/**
 * Second pass — polished photo-ready glam on the finished studio render (hair/pose/room locked).
 * Aesthetic target: soft IG-style beauty filter (slim sculpt, contour, almond eyes, glow) — same person, not a new face.
 */
export function buildLiveTryOnStudioMakeupPassPrompt(): string {
  return [
    '**IMAGE 1** is a finished studio portrait with lace-front wig — keep **everything identical**: wig, hair, lace, part, pose, expression, background, lighting, and outfit.',
    STUDIO_MAKEUP_FRAMING_LOCK,
    'Apply **polished IG baddie / babygirl glam** on **face skin only** — same person, still recognizable; photoreal editorial, **not** cartoon or plastic.',
    '**Jaw + cheeks (snatched sculpt):** slim the **jawline** and lower face with **precise contour** under cheekbones and along the jaw — paired with **highlight** on chin and upper cheekbones so the face reads **snatched**, not muddy brown shadow.',
    '**Nose (slimmer):** **narrow the nose visually** with soft **side contour** on the alae + **highlight** down the bridge and tip — refined and slimmer, not just darker sides.',
    '**Forehead:** reads slightly **smaller** via soft hairline-adjacent shading — do not shrink the head.',
    '**Eyes:** shape reads more **almond**; **brighten undereyes** (concealer effect); **natural wispy lashes** (longer, fuller, curled — lash-extension look, not spidery strips).',
    '**Brows:** fill and define for **fuller, cleaner arches** — match natural brow color.',
    '**Lips (critical):** make the **upper lip visibly fuller** — plump **cupid’s bow** and center upper lip; soft satin nude-pink finish — not overlined clown lips.',
    '**Skin:** smooth evening with **soft glow** on forehead and cheekbones; keep believable texture (light freckles/moles OK) — airbrushed but still human.',
    '**Overall:** contour + highlight balance like a pro MUA — camera-ready glow, not flat grey shadow.',
    '**Locked — do not change:** hair, wig, lace front, room, depth of field, body pose, neck, or clothing.',
    'No text or watermark.',
  ].join(' ');
}

/** Shorter makeup pass for Fal retries. */
export function buildLiveTryOnStudioMakeupPassPromptCompact(): string {
  return [
    'IMAGE 1 is a finished studio portrait with wig — keep hair, pose, room, crop, and outfit pixel-identical.',
    'Face-skin glam only: snatched jaw contour + highlight, slimmer nose (contour sides + highlight bridge), fuller upper lip, almond eyes, bright undereyes, natural lashes, soft glow.',
    'No pan/reframe. Same person, photoreal. No text.',
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
    'Use the attached **mannequin wig reference** for **color, length, density, curl, lace shape, and drape** — **not** display-mannequin vertical placement.',
    'Create a **photorealistic** portrait of a beautiful woman wearing that lace-front wig installed **flush on a real human skull**:',
    colorLine,
    angleConstraint(angle),
    '**SKULL FIT (critical):** Mannequins mount wigs **high on the bust** for display — on a real woman the lace front sits at a **natural forehead hairline** (~finger-width above brows), cap hugs the scalp, part at **natural crown depth**. **Forbidden:** helmet hair, floating wig cap, or crown bubble above the cranium.',
    'Match **length, density, curl pattern, part direction, layers, and volume** from the mannequin — **not** how high the wig sits on the mannequin bust.',
    '**Delete from output:** mannequin bust, gray skin, stand, FRONTAL SLAYER logo, bricks, studio props.',
    'Woman: photoreal editorial beauty — **neutral, elegant, mid-20s**, soft natural makeup, realistic eyes; **head pose and neck angle locked to the mannequin reference** (only swap mannequin skin for real skin — **lower wig to human install height**).',
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
