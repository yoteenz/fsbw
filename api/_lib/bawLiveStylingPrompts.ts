import { bawFalEditPreserveReferenceBlock } from './bawFalEditFidelityPrompt.js';

export type NoirLayersPartSelection = 'MIDDLE' | 'LEFT' | 'RIGHT';

export type CatalogColorForLayersPrompt = { label: string; hex: string };

/**
 * **LAYERS** live styling: Fal `image_urls` = **color-tier WebP** from Storage (already tinted to the swatch).
 * Keeps **catalog hair color** while restyling to **voluminous layered S-waves** (blended barrel curls, not separated ringlets) + part — fixes black hair when input was HQ black refs.
 */
export function buildLayersStylePromptFromColorTierWebp(
  angle: 'front' | 'left' | 'right',
  partSelection: NoirLayersPartSelection,
  catalog: CatalogColorForLayersPrompt
): string {
  const hex = catalog.hex.replace(/^#/, '').toUpperCase();
  const colorLock =
    '**INPUT** is the live NOIR **color preview** image — hair is already tinted to **' +
    catalog.label +
    '** (target **#' +
    hex +
    '**). **Keep this exact hair color** in the output (same hue, depth, highlights) — do **not** revert to black, off-black, or a different shade. Only reshape/style the hair.';

  return buildLayersStylePromptShared(angle, partSelection, colorLock, 'layers');
}

/**
 * **CRIMPS** live styling: same inputs as LAYERS (color-tier WebP + part) but hairstyle = **crimps** (zig-zag / pressed texture), not layered curls.
 */
export function buildCrimpsStylePromptFromColorTierWebp(
  angle: 'front' | 'left' | 'right',
  partSelection: NoirLayersPartSelection,
  catalog: CatalogColorForLayersPrompt
): string {
  const hex = catalog.hex.replace(/^#/, '').toUpperCase();
  const colorLock =
    '**INPUT** is the live NOIR **color preview** image — hair is already tinted to **' +
    catalog.label +
    '** (target **#' +
    hex +
    '**). **Keep this exact hair color** in the output (same hue, depth, highlights) — do **not** revert to black, off-black, or a different shade. Only reshape/style the hair.';

  return buildLayersStylePromptShared(angle, partSelection, colorLock, 'crimps');
}

/**
 * @deprecated Prefer `buildLayersStylePromptFromColorTierWebp` — HQ black refs kept hair black.
 * Kept for script parity / manual tests with gray-brick refs only.
 */
export function buildLayersStylePromptFromHqMannequinRef(
  angle: 'front' | 'left' | 'right',
  partSelection: NoirLayersPartSelection
): string {
  const colorLock =
    '**INPUT** is the gray-brick mannequin reference — preserve **catalog hair color** from build (do not output jet black unless the catalog color is black).';
  return buildLayersStylePromptShared(angle, partSelection, colorLock, 'layers');
}

function buildLayersStylePromptShared(
  angle: 'front' | 'left' | 'right',
  partSelection: NoirLayersPartSelection,
  colorLockBlock: string,
  salon: 'layers' | 'crimps'
): string {
  const layersLook =
    'Target look: **long** layered hair — extend **past the shoulders** (chest-length or longer). Style = **voluminous layered waves** (full-bodied, glam): **large, soft S-shaped waves** and **brushed-out barrel curls** — **not** tight ringlets, **not** skinny spiral curls, **not** separated / clumpy / cord-like strands. Waves must **merge into one continuous, cohesive flow** — same wave scale and direction family across the head (**salon-set**, smooth, glossy). Shorter **face-framing layers** should **sweep away from the face** and blend smoothly into longer lengths. **No** piecey definition between strands; hair reads as **one blended shape**, not individual curls.';

  const crimpsLook =
    'Target look: **long** hair — extend **past the shoulders** (chest-length or longer), with **distinct crimped texture** (uniform zig-zag / pressed-crimp pattern along the length — **salon crimps**, not loose spiral curls, not beach waves). Crimps should read **even** and **consistent** from root to ends, not mixed with large barrel curls.';

  const lookBlock = salon === 'crimps' ? crimpsLook : layersLook;

  const styleNoun = salon === 'crimps' ? 'crimps' : 'voluminous layered S-waves';
  const partWordLayers =
    partSelection === 'MIDDLE'
      ? 'Use a **MIDDLE / center part** at the crown. **Face-framing layers** + **layered waves** swept away from the face (soft curtain flow); part line visible at the front hairline.'
      : partSelection === 'LEFT'
        ? 'Use a **LEFT side part** (part line on the viewer’s left / mannequin’s right side of the crown). **Layered waves** — sweep, volume, and wave direction follow that part; **do not** apply a center or right part.'
        : 'Use a **RIGHT side part** (part line on the viewer’s right / mannequin’s left side of the crown). **Layered waves** — sweep, volume, and wave direction follow that part; **do not** apply a center or left part.';

  const partWordCrimps =
    partSelection === 'MIDDLE'
      ? 'Use a **MIDDLE / center part** at the crown. **Crimps** with face-framing flow; part line visible at the front hairline.'
      : partSelection === 'LEFT'
        ? 'Use a **LEFT side part** (part line on the viewer’s left / mannequin’s right side of the crown). **Crimps** — sweep and volume follow that part; **do not** apply a center or right part.'
        : 'Use a **RIGHT side part** (part line on the viewer’s right / mannequin’s left side of the crown). **Crimps** — sweep and volume follow that part; **do not** apply a center or left part.';

  const partLine = salon === 'crimps' ? partWordCrimps : partWordLayers;

  const angleConstraint =
    angle === 'left'
      ? salon === 'crimps'
        ? 'This is the **LEFT 3/4 view**: keep crimp mass biased toward the **viewer’s right** (mannequin’s left); do **not** add a second mirrored sweep on the opposite shoulder. Preserve camera angle and framing — **do not** rotate the head toward camera.'
        : 'This is the **LEFT 3/4 view**: keep curl mass biased toward the **viewer’s right** (mannequin’s left); do **not** add a second mirrored sweep on the opposite shoulder. Preserve camera angle and framing — **do not** rotate the head toward camera.'
      : angle === 'right'
        ? salon === 'crimps'
          ? 'This is the **RIGHT 3/4 view**: keep crimp mass biased toward the **viewer’s left** (mannequin’s right); do **not** mirror into a symmetric “both shoulders” wig. **Keep the same camera angle and framing as the reference** (true right 3/4); do **not** rotate the head toward camera.'
          : 'This is the **RIGHT 3/4 view**: keep curl mass biased toward the **viewer’s left** (mannequin’s right); do **not** mirror into a symmetric “both shoulders” wig. **Keep the same camera angle and framing as the reference** (true right 3/4); do **not** rotate the head toward camera.'
        : (() => {
            const oneShoulderFrontLayers =
              partSelection === 'MIDDLE'
                ? 'This is the **FRONT view** (same rule as NOIR **color** front): **one-sided shoulder sweep only** — **more hair on ONE shoulder**, **not** equal volume on both. Do **not** mirror hair onto the opposite shoulder, do **not** invent a second symmetric drape, and do **not** widen the style to “both shoulders.” For a **middle part**, still keep **asymmetric** bulk: pick **one** dominant shoulder for the longest curl drape; **never** a perfectly symmetric curtain on left and right.'
                : partSelection === 'LEFT'
                  ? 'This is the **FRONT view** (same rule as NOIR **color** front): **one-sided drape** — bulk and longest curls must fall toward the **viewer’s right** (mannequin’s **left** shoulder); the **opposite** shoulder must stay **lighter** — **no** matching curl mass on both sides.'
                  : 'This is the **FRONT view** (same rule as NOIR **color** front): **one-sided drape** — bulk and longest curls must fall toward the **viewer’s left** (mannequin’s **right** shoulder); the **opposite** shoulder must stay **lighter** — **no** matching curl mass on both sides.';
            const oneShoulderFrontCrimps =
              partSelection === 'MIDDLE'
                ? 'This is the **FRONT view** (same rule as NOIR **color** front): **one-sided shoulder sweep only** — **more hair on ONE shoulder**, **not** equal volume on both. Do **not** mirror hair onto the opposite shoulder, do **not** invent a second symmetric drape, and do **not** widen the style to “both shoulders.” For a **middle part**, still keep **asymmetric** bulk: pick **one** dominant shoulder for the longest crimp drape; **never** a perfectly symmetric curtain on left and right.'
                : partSelection === 'LEFT'
                  ? 'This is the **FRONT view** (same rule as NOIR **color** front): **one-sided drape** — bulk and longest crimps must fall toward the **viewer’s right** (mannequin’s **left** shoulder); the **opposite** shoulder must stay **lighter** — **no** matching mass on both sides.'
                  : 'This is the **FRONT view** (same rule as NOIR **color** front): **one-sided drape** — bulk and longest crimps must fall toward the **viewer’s left** (mannequin’s **right** shoulder); the **opposite** shoulder must stay **lighter** — **no** matching mass on both sides.';
            return salon === 'crimps' ? oneShoulderFrontCrimps : oneShoulderFrontLayers;
          })();

  const lengthNote =
    salon === 'crimps'
      ? 'Do **not** change skin, bust, neck seam, or background except as needed for hair silhouette. Length may increase for the long crimped look.'
      : 'Do **not** change skin, bust, neck seam, or background except as needed for hair silhouette. Length may increase for the long layered **wave** look (full-bodied, blended — not stringy).';

  return [
    colorLockBlock,
    'Recreate this photograph. **Only** change the **hairstyle** to **' +
      styleNoun +
      '** with the **part direction** specified below. Preserve **mannequin**, **brick background**, **lighting**, **framing**, and the **hair color** rules above.',
    lookBlock,
    partLine,
    angleConstraint,
    lengthNote,
    bawFalEditPreserveReferenceBlock(),
    'The **FRONTAL SLAYER** chest logo must stay fully legible — same position and sharpness as the reference.',
    'Output must be extremely high-quality, crisp, and pixel-perfect.',
    'Change **only** the **hair** shape/style to ' +
      styleNoun +
      ' with the specified part; **everything** else must match the reference, including **hair color** per the lock above.',
  ].join(' ');
}

/**
 * **Two-image** middle + layers (live API):
 * - **First** `image_urls` entry = customer color preview (Storage WebP): full scene + **keep this hair color** in the output.
 * - **Second** entry = optional **geometry-only** reference (env URLs): same mannequin/brick type shot showing target **cut, part, layers, silhouette** — not a second “final” to paste; do **not** copy its hair color or replace the background from it.
 * Keep in sync with `scripts/wig-preview/promptTemplate.mjs` (`buildMiddlePartLayersStylePromptTwoImages`).
 */
export function buildMiddlePartLayersStylePromptTwoImages(angle: 'front' | 'left' | 'right'): string {
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
    bawFalEditPreserveReferenceBlock(),
    'The **FRONTAL SLAYER** chest logo must stay fully legible, same position as in image 1.',
    'Output must be extremely high-quality, crisp, and pixel-perfect.',
    'Change **only** the **hair mesh** in image 1 so its **shape** matches the geometry reference; everything else in image 1 stays the same, especially **hair color**.',
  ].join(' ');
}

/** @deprecated Use `buildMiddlePartLayersStylePromptTwoImages(angle)` for per-angle wording. */
export const BAW_MIDDLE_PART_LAYERS_STYLE_PROMPT_TWO_IMAGES = buildMiddlePartLayersStylePromptTwoImages('front');

/** Single-image manual fal (no color base attachment) — “this” = the only image. */
export const BAW_MIDDLE_PART_LAYERS_STYLE_PROMPT_SINGLE_IMAGE = [
  'Recreate this exact mannequin image, but change the hair to black #000000.',
  'The logo on the center of the mannequin’s chest with FRONTAL SLAYER should be fully legible for accuracy & consistency.',
  'The photo should be extremely high-quality, crisp & pixel perfect.',
  'Do not change anything else about the photo.',
].join(' ');

/** @deprecated Use `buildMiddlePartLayersStylePromptTwoImages(angle)`. */
export const BAW_MIDDLE_PART_LAYERS_STYLE_PROMPT_TEXT = BAW_MIDDLE_PART_LAYERS_STYLE_PROMPT_TWO_IMAGES;

/**
 * **Single-image** live API: edit the **color** WebP only — add curtain bangs; no style inspo URL.
 * Keep in sync with `scripts/wig-preview/promptTemplate.mjs` (`BAW_BANGS_ONLY_STYLE_PROMPT`).
 */
export function buildBangsOnlyStylePrompt(angle: 'front' | 'left' | 'right'): string {
  const angleConstraint =
    angle === 'left'
      ? 'This is the **LEFT 3/4 view**: keep hair mass and part direction consistent with the reference; only add bangs — do **not** mirror or restyle the length away from the left view.'
      : angle === 'right'
        ? 'This is the **RIGHT 3/4 view**: keep hair mass and part direction consistent with the reference; only add bangs — do **not** mirror or restyle the length away from the right view.'
        : 'This is the **FRONT view**: add bangs only; keep the rest of the hair layout and part as in the reference.';

  return [
    'Recreate this exact mannequin image, but add lightly feathered curtain bangs to the hairstyle only do NOT change the positioning of the rest of the hair.',
    angleConstraint,
    bawFalEditPreserveReferenceBlock(),
    'The logo on the center of the mannequin’s chest with FRONTAL SLAYER should be fully legible for accuracy & consistency.',
    'The photo should be extremely high-quality, crisp & pixel perfect.',
    'Do not change anything else about the photo except the bangs as specified.',
  ].join(' ');
}
