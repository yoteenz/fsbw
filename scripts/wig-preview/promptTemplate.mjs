/**
 * Prompts for two different features — keep them separate:
 *
 * 1) **WIG CONSULT** — manual 3-step chain in fal (base → color → style). `WIG_CONSULT_STEP*` only.
 * 2) **BAW (Build-a-wig)** — (a) **manual fal** base hero: `BAW_BASE_MANNEQUIN_PROMPT_*` below; (b) **bulk script**: `buildWigPreviewPrompt` at the bottom.
 */

// =============================================================================
// WIG CONSULT — Step 1 (1 ref only) + Steps 2–3. Not BAW.
// Step 1 attachment: **gray brick mannequin only** (no logo file, no separate backdrop file). fal **9:16** in playground unless you match Auto + 2K like Step 2.
// =============================================================================

/** Wig consult Step 1 — brick → white/rose backdrop + logo described in text (single base reference). */
export const WIG_CONSULT_STEP1_PROMPT = [
  'Recreate this exact mannequin image, but swap out the gray brick background with a white backdrop background with the same rose detailing on the edge of the background like your standard white/rose studio consult backdrop.',
  'On the center of the mannequin’s chest, the Frontal Slayer brand mark should be clear and fully legible — red F/S monogram with FRONTAL SLAYER in small red caps, proportional to the chest, stitched-on look, matching brand red.',
  'The photo should be extremely high-quality, crisp & pixel perfect.',
  'Do not change anything else about the photo.',
].join(' ');

/** Previous Step 1 (3 attachments: mannequin, backdrop, logo). Kept for copy-paste / older runs. */
export const WIG_CONSULT_STEP1_PROMPT_THREE_ATTACHMENTS = [
  'Recreate this exact mannequin image, but swap out the gray brick background with a white backdrop background with the same rose detailing on the edge of the background like the 2nd attachment image.',
  'Use my logo from the 3rd reference attachment on the center of the mannequin’s chest for accuracy & consistency.',
  'The photo should be extremely high-quality, crisp & pixel perfect.',
  'Do not change anything else about the photo.',
].join(' ');

/**
 * Generic Step 2 / Step 3 (and BAW chain edits): same wording for any “change A → B” on the mannequin.
 * fal: **aspect ratio Auto**, **resolution 2K**. Attach prior step image + **logo reference** so “reference image” = logo.
 * @param {string} fromDescription - what you are changing from (e.g. “black hair color”, “output from step 1”)
 * @param {string} toDescription - what you are changing to (e.g. “pink hair color (hex #DA3063)”, “PEAK hairline”)
 */
export function buildWigConsultChainEditPrompt(fromDescription, toDescription) {
  const fromD = String(fromDescription || '').trim() || 'previous state';
  const toD = String(toDescription || '').trim() || 'target state';
  return [
    'Recreate this exact mannequin image, but change the ' + fromD + ' to ' + toD + '.',
    'The logo on the center of the mannequin’s chest should look exactly like reference image with FRONTAL SLAYER fully legible for accuracy & consistency.',
    'The photo should be extremely high-quality, crisp & pixel perfect.',
    'Do not change anything else about the photo.',
  ].join(' ');
}

/** BAW / consult chain: same as `buildWigConsultChainEditPrompt` (hairline, styling, etc.). */
export const BAW_SELECTION_CHAIN_EDIT_PROMPT = buildWigConsultChainEditPrompt;

/**
 * Catalog hair colors for Step 2 (label + hex, no `#`). Jet/off black use **000000** (six zeros; corrects typo `#00000`).
 * Keys are UPPER_SNAKE; aliases: `PINK` → raspberry (legacy).
 */
export const BAW_CATALOG_HAIR_COLOR_HEX = {
  ESPRESSO: { label: 'espresso', hex: '361504' },
  CHESTNUT: { label: 'chestnut', hex: '643118' },
  HONEY: { label: 'honey', hex: 'BB883C' },
  AUBURN: { label: 'auburn', hex: '925927' },
  COPPER: { label: 'copper', hex: '763412' },
  GINGER: { label: 'ginger', hex: 'E35B2A' },
  SANGRIA: { label: 'sangria', hex: '731921' },
  CHERRY: { label: 'cherry', hex: 'C52C1F' },
  RASPBERRY: { label: 'raspberry', hex: 'DA3063' },
  PLUM: { label: 'plum', hex: '5B177C' },
  COBALT: { label: 'cobalt', hex: '25067B' },
  TEAL: { label: 'teal', hex: '7BE7CA' },
  SLIME: { label: 'slime', hex: '63D54B' },
  CITRINE: { label: 'citrine', hex: 'E3E851' },
  JET_BLACK_OFF_BLACK: { label: 'jet black/off black', hex: '000000' },
};

/** @deprecated Use `RASPBERRY` — same hex/label as raspberry */
BAW_CATALOG_HAIR_COLOR_HEX.PINK = BAW_CATALOG_HAIR_COLOR_HEX.RASPBERRY;

function normalizeCatalogColorKey(key) {
  return String(key || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/g, '_')
    .replace(/_+/g, '_');
}

/**
 * @param {string} catalogKey - e.g. `'RASPBERRY'`, `'SLIME'`, `'JET_BLACK_OFF_BLACK'`
 * @returns {{ label: string, hex: string } | undefined}
 */
export function getBawCatalogHairColor(catalogKey) {
  const k = normalizeCatalogColorKey(catalogKey);
  if (k === 'JET_BLACK' || k === 'OFF_BLACK' || k === 'JET_BLACK_OFF_BLACK') {
    return BAW_CATALOG_HAIR_COLOR_HEX.JET_BLACK_OFF_BLACK;
  }
  return BAW_CATALOG_HAIR_COLOR_HEX[k];
}

/**
 * Step 2 prompt for a catalog color key (e.g. `wigConsultStep2ForCatalogColor('HONEY')`).
 */
export function wigConsultStep2ForCatalogColor(catalogKey) {
  const row = getBawCatalogHairColor(catalogKey);
  if (!row) {
    throw new Error(
      `Unknown catalog color "${catalogKey}". Use one of: ${Object.keys(BAW_CATALOG_HAIR_COLOR_HEX).filter((x) => x !== 'PINK').join(', ')}`
    );
  }
  return WIG_CONSULT_STEP2_PROMPT(row.hex, row.label);
}

/**
 * Step 2 — hair color only (wig consult + BAW “base → color”). Attach Step 1 output + logo reference; fal **Auto** + **2K**.
 * @param {string} [hairHex='DA3063'] - e.g. `'DA3063'` or `'#DA3063'`
 * @param {string} [hairColorLabel='raspberry'] - catalog name shown in prompt (e.g. `'raspberry'`, `'slime'`)
 */
export function WIG_CONSULT_STEP2_PROMPT(hairHex = 'DA3063', hairColorLabel = 'raspberry') {
  const hex = String(hairHex || '').replace(/^#/, '');
  const label = String(hairColorLabel || 'raspberry').trim() || 'raspberry';
  return [
    'Recreate this exact mannequin image, but change the black hair color to ' +
      label +
      ' hex code #' +
      hex +
      ' & ensure this color looks as closely to authentically colored/dyed hair & not a weird unrealistic shade.',
    'The logo on the center of the mannequin’s chest should look exactly like reference image with FRONTAL SLAYER fully legible for accuracy & consistency.',
    'The photo should be extremely high-quality, crisp & pixel perfect.',
    'Do not change anything else about the photo.',
  ].join(' ');
}

/** Same as `WIG_CONSULT_STEP2_PROMPT` — BAW “base → color”; pass `hairHex` (+ optional label) or use `wigConsultStep2ForCatalogColor(key)`. */
export const BAW_SELECTION_COLOR_FROM_BASE_PROMPT = WIG_CONSULT_STEP2_PROMPT;

/**
 * Step 3 — same template as Step 2: change “input from step 2” → “input for step 3”.
 * Attach: Step 2 output + any extra refs (e.g. hair style reference as 2nd image); keep logo ref so “reference image” still resolves.
 * @param {string} fromDescription - e.g. `'hair as in the previous image'` or plain `'input from step 2'`
 * @param {string} toDescription - e.g. `'hair styled exactly like the second reference attachment'`
 */
export function WIG_CONSULT_STEP3_PROMPT(fromDescription, toDescription) {
  return buildWigConsultChainEditPrompt(fromDescription, toDescription);
}

/**
 * Wig consult Step 3 — common case: “input from step 2” → style from 2nd attachment (you still attach Step 2 + style ref + logo ref as needed).
 */
export function WIG_CONSULT_STEP3_PROMPT_STYLE_REFERENCE() {
  return WIG_CONSULT_STEP3_PROMPT(
    'input from step 2',
    'hair styled exactly like the second reference attachment, same hair color as in the image'
  );
}

/** Older Step 3 (style-only, second attachment wording). Kept for copy-paste / comparison. */
export const WIG_CONSULT_STEP3_PROMPT_LEGACY_STYLE_ATTACHMENT = [
  'Recreate this exact same photo just change the hair to be styled like the second reference attachment ONLY.',
  'Don’t change the color of her hair or anything else in the photo.',
].join(' ');

/** Same as legacy 3-ref Step 1 — kept for older docs and A/B testing. */
export const WIG_CONSULT_LEGACY_STEP1_PROMPT = WIG_CONSULT_STEP1_PROMPT_THREE_ATTACHMENTS;

// =============================================================================
// BAW — manual fal “base mannequin” hero (NOT wig consult; NOT the bulk script)
// **2 attachments** (no logo file): (1) **the mannequin shot to recreate** — for 3-angle batch work, use the **current angle’s** source (same as the hero/thumb for that view: front / left / right) per fal call; (2) white/rose backdrop.
// fal: **Aspect ratio Auto**, **Resolution 2K** (product owner–verified; keeps framing closer to source than forcing 9:16).
// =============================================================================

export const BAW_BASE_MANNEQUIN_PROMPT_TWO_ATTACHMENTS = [
  'Recreate this exact mannequin image.',
  'The logo on the center of the mannequin’s chest with FRONTAL SLAYER should be fully legible for accuracy & consistency.',
  'The photo should be extremely high-quality, crisp & pixel perfect.',
  'Do not change anything else about the photo.',
].join(' ');

/** @deprecated Wrong name — was under wig consult. Use `BAW_BASE_MANNEQUIN_PROMPT_TWO_ATTACHMENTS` for BAW base image. */
export const WIG_CONSULT_STEP1_PROMPT_TWO_ATTACHMENTS = BAW_BASE_MANNEQUIN_PROMPT_TWO_ATTACHMENTS;

// =============================================================================
// BAW — shared styling: **middle part / layers** (all 6 units; same look)
// Use after color (or on top of catalog color): one mannequin ref; fal Auto + 2K unless you tune.
// =============================================================================

/**
 * **Two attachments** (live / server fal): (1) colored mannequin from Storage, (2) geometry reference per angle — env `WIG_PREVIEW_NOIR_MIDDLE_LAYERS_STYLE_{LEFT|FRONT|RIGHT}_URL` (shape only; not hair color).
 * Keep in sync with `api/_lib/bawLiveStylingPrompts.ts` `buildMiddlePartLayersStylePromptTwoImages`.
 * @param {'front'|'left'|'right'} angle
 */
export function buildMiddlePartLayersStylePromptTwoImages(angle) {
  const angleConstraint =
    angle === 'left'
      ? 'Camera is **LEFT 3/4**: when taking hair **shape** from the geometry reference, keep bulk on the **correct shoulder for a left view** — do **not** mirror into a symmetric “both shoulders” wig unless the reference clearly shows that.'
      : angle === 'right'
        ? 'Camera is **RIGHT 3/4**: when taking hair **shape** from the geometry reference, keep bulk on the **correct shoulder for a right view** — do **not** mirror into a symmetric “both shoulders” wig unless the reference clearly shows that.'
        : 'Camera is **FRONT**: match the geometry reference’s **part line and outer silhouette** for the hair; do not invent a different cut.';

  return [
    'You get **two images in order**. **IMAGE 1** is the only **output canvas**: same mannequin, brick background, framing, chest logo, and **keep the hair color exactly as in image 1** (catalog / customer color).',
    '**IMAGE 2** is a **hair geometry reference only** (middle part, layers, face-framing, volume, silhouette). Copy **only** the **cut, layering, and part** from image 2 onto the head in image 1. **Do not** use image 2’s hair color, **do not** swap in image 2’s background, and **do not** treat image 2 as a full composite to paste over image 1.',
    angleConstraint,
    'The **FRONTAL SLAYER** chest logo must stay fully legible, same position as in image 1.',
    'Output must be extremely high-quality, crisp, and pixel-perfect.',
    'Change **only** the **hair mesh** in image 1 so its **shape** matches the geometry reference; everything else in image 1 stays the same, especially **hair color**.',
  ].join(' ');
}

/**
 * **Single attachment** (live fal): color WebP only — add curtain bangs. Keep in sync with `api/_lib/bawLiveStylingPrompts.ts` `buildBangsOnlyStylePrompt`.
 * @param {'front'|'left'|'right'} angle
 */
export function buildBangsOnlyStylePrompt(angle) {
  const angleConstraint =
    angle === 'left'
      ? 'This is the **LEFT 3/4 view**: keep hair mass and part direction consistent with the reference; only add bangs — do **not** mirror or restyle the length away from the left view.'
      : angle === 'right'
        ? 'This is the **RIGHT 3/4 view**: keep hair mass and part direction consistent with the reference; only add bangs — do **not** mirror or restyle the length away from the right view.'
        : 'This is the **FRONT view**: add bangs only; keep the rest of the hair layout and part as in the reference.';

  return [
    'Recreate this exact mannequin image, but add lightly feathered curtain bangs to the hairstyle only do NOT change the positioning of the rest of the hair.',
    angleConstraint,
    'The logo on the center of the mannequin’s chest with FRONTAL SLAYER should be fully legible for accuracy & consistency.',
    'The photo should be extremely high-quality, crisp & pixel perfect.',
    'Do not change anything else about the photo.',
  ].join(' ');
}

/** Default string for copy-paste (front angle constraint). */
export const BAW_MIDDLE_PART_LAYERS_STYLE_PROMPT_TWO_IMAGES = buildMiddlePartLayersStylePromptTwoImages('front');

/** One attachment only (manual fal on the inspo shot alone). */
export const BAW_MIDDLE_PART_LAYERS_STYLE_PROMPT_SINGLE_IMAGE = [
  'Recreate this exact mannequin image, but change the hair to black #000000.',
  'The logo on the center of the mannequin’s chest with FRONTAL SLAYER should be fully legible for accuracy & consistency.',
  'The photo should be extremely high-quality, crisp & pixel perfect.',
  'Do not change anything else about the photo.',
].join(' ');

/** Default export name: two-image flow for BAW live styling API. */
export const BAW_MIDDLE_PART_LAYERS_STYLE_PROMPT = BAW_MIDDLE_PART_LAYERS_STYLE_PROMPT_TWO_IMAGES;

/** Alias — same as `BAW_MIDDLE_PART_LAYERS_STYLE_PROMPT`. */
export const BAW_STYLING_MIDDLE_PART_LAYERS_PROMPT = BAW_MIDDLE_PART_LAYERS_STYLE_PROMPT;

// =============================================================================
// Backward-compatible names (wig consult)
// =============================================================================

export const NBP_STEP1_PROMPT = WIG_CONSULT_STEP1_PROMPT;

export function NBP_STEP2_PROMPT(hairHex, hairColorLabel) {
  return WIG_CONSULT_STEP2_PROMPT(hairHex, hairColorLabel);
}

export function NBP_STEP3_PROMPT(fromDescription, toDescription) {
  return WIG_CONSULT_STEP3_PROMPT(fromDescription, toDescription);
}

// =============================================================================
// BAW — automated batch (one fal call per manifest row)
// =============================================================================

/**
 * Build-a-wig catalog previews — `pregenerate-wig-previews.mjs` only.
 * @param {{ unitKey: string; length: string; density: string; texture: string; lace: string; hairline: string; color: string; styling: string; addOns: string[] }} s
 */
export function buildWigPreviewPrompt(s) {
  const addons =
    Array.isArray(s.addOns) && s.addOns.length
      ? s.addOns.map((a) => String(a).toUpperCase()).join(', ')
      : 'NONE';
  return [
    'Professional e-commerce product photograph, single forward-facing studio shot.',
    'Subject: high-end lace front wig on a neutral mannequin head (no real person, no identifiable face).',
    `Unit line: ${s.unitKey}.`,
    `Hair: ${s.texture} texture, color ${s.color}, length ${s.length}, density ${s.density}.`,
    `Lace: ${s.lace}. Hairline: ${s.hairline}. Styling: ${s.styling}. Add-ons: ${addons}.`,
    'Lighting: soft even studio light, subtle shadow, clean catalog look.',
    'Background: seamless light gray cyclorama, minimal props, sharp focus on hair.',
    'No text, no watermark, no logos.',
  ].join(' ');
}
