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
  '**Cap + volume:** wig cap follows **IMAGE 1 head contour at IMAGE 1 yaw** — hair grows **from** the turned scalp and crown, close to the skull; **forbidden** hovering cap, inflated crown bubble, or wig sitting above the cranium.',
  '**Skull fit ≠ front-facing head:** lace sits flush on the **turned** scalp at IMAGE 1 yaw — **not** by squaring the face to 0° to “lower” the wig.',
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
      `**${yawLabel} positioned-left — realistic center part (3D midline on turned head):**`,
      'The part is a **fore–aft groove on the crown** along the skull midline — **rotated with the head**, **not** a vertical stripe down the **center of the 2D photo**.',
      'From this camera (**left cheek nearest**): the part ridge sits on the **far scalp (viewer’s RIGHT)** — usually only a **short crown segment** (1–3 cm) is visible; **no** part line drawn down the forehead on the turned face.',
      '**Near-side panel (viewer’s LEFT):** fuller hair mass frames the visible cheek; **far-side panel (viewer’s RIGHT):** thinner sweep tucks **behind the ear** — match **IMAGE 2** hair split at this **left 3/4** angle.',
      '**FORBIDDEN:** a centered part in the hair silhouette; a front-facing center line on the forehead while the face is turned; splitting the face down the middle in 2D.',
      '**Self-check:** if you see a vertical part in the horizontal center of the hair blob → **failed** — shift groove toward **image RIGHT** along the crown ridge only.',
    ].join(' ');
  }

  return [
    ...anchor,
    `**${yawLabel} positioned-right — realistic center part (3D midline on turned head):**`,
    'The part is a **fore–aft groove on the crown** along the skull midline — **rotated with the head**, **not** a vertical stripe down the **center of the 2D photo**.',
    'From this camera (**right cheek nearest**): the part ridge sits on the **far scalp (viewer’s LEFT)** — usually only a **short crown segment** (1–3 cm) is visible; **no** part line drawn down the forehead on the turned face.',
    '**Near-side panel (viewer’s RIGHT):** fuller hair mass frames the visible cheek; **far-side panel (viewer’s LEFT):** thinner sweep tucks **behind the ear** — match **IMAGE 2** hair split at this **right 3/4** angle.',
    '**FORBIDDEN:** a centered part in the hair silhouette; a front-facing center line on the forehead while the face is turned; a fake 2D center stripe on a profile-class pose.',
    '**Self-check:** if you see a vertical part in the horizontal center of the hair blob → **failed** — shift groove toward **image LEFT** along the crown ridge only.',
  ].join(' ');
}

function studioHeadBodyPoseLock(poseAngle: LiveTryOnAngle, headYawDeg?: number): string {
  const yaw = studioHeadYawDegrees(poseAngle, headYawDeg);
  const yawLabel = studioHeadYawLabel(yaw);
  const absYaw = Math.abs(yaw);

  if (absYaw <= 8) {
    return [
      '**HEAD + BODY POSE (mandatory):** Preserve **exact** head yaw, neck, chin, nose direction, and **both shoulders** from IMAGE 1 — **0°** square to camera.',
      '**FORBIDDEN:** rotating the customer to match the **front** mannequin (IMAGE 2) head angle.',
    ].join(' ');
  }

  if (yaw < 0) {
    return [
      '**HEAD + BODY POSE — POSITIONED RIGHT (mandatory — full rotation, not a glance):**',
      `IMAGE 1 head yaw is **${yawLabel}** — **right cheek** nearest camera; entire head and upper body turned toward **their left**.`,
      'Lock **nose tip, chin, neck, ears, and BOTH shoulders** to this **−40° class** rotation — **exactly as in IMAGE 1**, **not** the front mannequin.',
      '**FORBIDDEN:** front-facing torso/shoulders with eyes or face **only** glancing toward image RIGHT — that is **“looking right”**, **not** **positioned right**.',
      '**FORBIDDEN:** 0° front body, symmetric shoulders square to camera, or copying IMAGE 2’s **front-view** mannequin head angle.',
      `Draw lace front, part, and hair mass on the **turned skull** at **${yawLabel}** — not on a 0° face.`,
    ].join(' ');
  }

  return [
    '**HEAD + BODY POSE — POSITIONED LEFT (mandatory — full rotation, not a glance):**',
    `IMAGE 1 head yaw is **${yawLabel}** — **left cheek** nearest camera; entire head and upper body turned toward **their right**.`,
    'Lock **nose tip, chin, neck, ears, and BOTH shoulders** to this **+40° class** rotation — **exactly as in IMAGE 1**, **not** the front mannequin.',
    '**FORBIDDEN:** front-facing torso/shoulders with eyes or face **only** glancing toward image LEFT — that is a glance, **not** a positioned-left pose.',
    '**FORBIDDEN:** 0° front body or copying IMAGE 2’s **front-view** mannequin head angle.',
    `Draw lace front, part, and hair mass on the **turned skull** at **${yawLabel}** — not on a 0° face.`,
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
 * **Studio Try-On** — IMAGE 1 = shopper selfie; IMAGE 2 = angle-matched mannequin; optional IMAGE 3 = GPT portrait for drape.
 */
function studioMannequinRefBlock(poseAngle: LiveTryOnAngle, hasPortraitRef: boolean): string[] {
  const angleLabel =
    poseAngle === 'left' ? 'left 3/4 (+40°)' : poseAngle === 'right' ? 'right 3/4 (−40°)' : 'front (0°)';

  if (hasPortraitRef) {
    return [
      `**IMAGE 2** is the **${angleLabel}** mannequin — wig **color**, length, density, curl, and lace shape only (**not** vertical placement; **not** a reason to rotate IMAGE 1 to front).`,
      `**IMAGE 3** is the **${angleLabel}** GPT portrait — copy **shoulder sweep, length drape, and silhouette** onto IMAGE 1 — **not** hairline height, crown elevation, front-facing head angle, or helmet-hair elevation.`,
      'Replace **only** the hair on IMAGE 1; **face, neck, shoulders, and body pose stay from IMAGE 1**; drape geometry from IMAGE 3.',
    ];
  }

  return [
    `**IMAGE 2** is the **${angleLabel}** mannequin wig reference — use it for **length, density, curl, lace shape, color, and shoulder sweep** at this camera angle only.`,
    '**Do NOT** rotate IMAGE 1 to match a front mannequin — IMAGE 2 shows the **same head yaw class** as the capture for **hair geometry only**.',
    'Replace **only** the hair on IMAGE 1 — installed **flush on their turned skull**, not at mannequin bust display height.',
  ];
}

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

  return [
    '**IMAGE 1 (master pose — do not repose):** Customer selfie — keep **exact** face, skin tone, expression, **head yaw, neck, both shoulders, and torso rotation** from this image. **Never** square IMAGE 1 to front because IMAGE 2 exists.',
    ...studioMannequinRefBlock(poseAngle, hasPortraitRef),
    colorLine,
    studioHeadBodyPoseLock(poseAngle, headYawDeg),
    STUDIO_SKULL_FIT,
    studioCenterPartConstraint(poseAngle, headYawDeg),
    STUDIO_DRAPE_SIDE,
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
  const absYaw = Math.abs(yaw);
  const angleLabel =
    poseAngle === 'left' ? 'left 3/4' : poseAngle === 'right' ? 'right 3/4' : 'front';
  return [
    'IMAGE 1 = customer selfie (master pose — keep head+shoulder yaw).',
    `IMAGE 2 = ${angleLabel} mannequin wig reference — hair only, never repose face.`,
    `Keep face, skin, pose, and room from IMAGE 1. Head yaw ${yawLabel}.`,
    yaw < -8
      ? 'Positioned RIGHT: full head+shoulder turn (−40° class), not eyes-only looking right. Do not copy mannequin front angle.'
      : yaw > 8
        ? 'Positioned LEFT: full head+shoulder turn (+40° class), not eyes-only glance. Do not copy mannequin front angle.'
        : 'Preserve 0° front pose from selfie; do not copy mannequin head angle.',
    `Replace only hair with lace-front wig color ${label} (#${hex}) from IMAGE 2.`,
    'Wig flush on skull — natural hairline/part depth; not mannequin helmet height.',
    absYaw > 8
      ? 'Center part = 3D crown midline at this yaw; short crown groove only — match IMAGE 2 hair split, not 2D center stripe.'
      : 'Center part on skull midline. One-sided drape over viewer left shoulder.',
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
    '**IMAGE 1** is a finished studio portrait with lace-front wig — keep **everything identical**: wig, hair, lace, **part**, pose, expression, background, lighting, and outfit.',
    STUDIO_MAKEUP_FRAMING_LOCK,
    'Apply **polished IG baddie / babygirl glam** on **face skin only** — same person, still recognizable; photoreal editorial, **not** cartoon or plastic.',
    '**Jaw + cheeks (soft snatched sculpt):** **soft, diffused contour** under cheekbones and along the jaw — **heavily blended**, **no harsh stripe or muddy brown line** on the cheek.',
    '**Highlight (golden):** **warm golden/champagne highlight** on the **top of the cheekbones**, bridge of nose, and cupid’s bow — luminous, not grey or ashy.',
    '**Blush:** **flush of rosy pink blush** on the **apples of the cheeks** — healthy sun-kissed warmth, blended into skin (not clown circles).',
    '**Nose (slimmer):** gentle **soft side contour** on the alae + **highlight** down the bridge and tip — refined and slimmer, not harsh stripes.',
    '**Eyes:** shape reads more **almond**; **brighten undereyes** (concealer effect); **natural wispy lashes** (longer, fuller, curled — lash-extension look, not spidery strips).',
    '**Brows:** fill and define for **fuller, cleaner arches** — match natural brow color.',
    '**Lips (critical):** make the **upper lip visibly fuller** — plump **cupid’s bow** and center upper lip; soft satin nude-pink finish — not overlined clown lips.',
    '**Skin:** smooth evening with **soft glow** on cheekbones; keep believable texture (light freckles/moles OK) — airbrushed but still human. **Do not change forehead size or hairline.**',
    '**Overall:** soft contour + golden highlight + rosy blush balance — camera-ready glow, not heavy stage makeup.',
    '**Locked — do not change:** hair, wig, lace front, **part line**, room, depth of field, body pose, neck, or clothing.',
    'No text or watermark.',
  ].join(' ');
}

/** Shorter makeup pass for Fal retries. */
export function buildLiveTryOnStudioMakeupPassPromptCompact(): string {
  return [
    'IMAGE 1 is a finished studio portrait with wig — keep hair, part, pose, room, crop, and outfit pixel-identical.',
    'Face-skin glam only: soft blended cheek/jaw contour (no harsh stripe), golden highlight on cheek tops, rosy blush on apples, slimmer nose, fuller upper lip, almond eyes, bright undereyes, natural lashes.',
    'No forehead shrink. No pan/reframe. Same person, photoreal. No text.',
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
