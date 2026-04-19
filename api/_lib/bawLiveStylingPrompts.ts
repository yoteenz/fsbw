import { bawFalEditPreserveReferenceBlock } from './bawFalEditFidelityPrompt.js';

export type NoirLayersPartSelection = 'MIDDLE' | 'LEFT' | 'RIGHT';

/**
 * **Single HQ mannequin ref** (same URLs as color `WIG_PREVIEW_NOIR_MANNEQUIN_*`): preserve the whole photograph
 * like the color step — **only** restyle hair to **layered curls** with the chosen **part**; keep catalog hair color.
 * Replaces the old two-image flow (color WebP + separate LQ geometry refs).
 */
export function buildLayersStylePromptFromHqMannequinRef(
  angle: 'front' | 'left' | 'right',
  partSelection: NoirLayersPartSelection
): string {
  const layersLook =
    'Target look: **long** layered hair — extend **past the shoulders** (chest-length or longer), with **defined, uniform curls** (consistent spiral/ringlets, same curl size and pattern across the head — **salon-set**, not frizzy, not mixed textures). Layers should read **cohesive**, not stringy or uneven.';

  const angleConstraint =
    angle === 'left'
      ? 'This is the **LEFT 3/4 view**: keep curl mass biased toward the **viewer’s right** (mannequin’s left); do **not** add a second mirrored sweep on the opposite shoulder. Preserve camera angle and framing — **do not** rotate the head toward camera.'
      : angle === 'right'
        ? 'This is the **RIGHT 3/4 view**: keep curl mass biased toward the **viewer’s left** (mannequin’s right); do **not** mirror into a symmetric “both shoulders” wig. **Keep the same camera angle and framing as the reference** (true right 3/4); do **not** rotate the head toward camera.'
        : (() => {
            const oneShoulderFront =
              partSelection === 'MIDDLE'
                ? 'This is the **FRONT view** (same rule as NOIR **color** front): **one-sided shoulder sweep only** — **more hair on ONE shoulder**, **not** equal volume on both. Do **not** mirror hair onto the opposite shoulder, do **not** invent a second symmetric drape, and do **not** widen the style to “both shoulders.” For a **middle part**, still keep **asymmetric** bulk: pick **one** dominant shoulder for the longest curl drape; **never** a perfectly symmetric curtain on left and right.'
                : partSelection === 'LEFT'
                  ? 'This is the **FRONT view** (same rule as NOIR **color** front): **one-sided drape** — bulk and longest curls must fall toward the **viewer’s right** (mannequin’s **left** shoulder); the **opposite** shoulder must stay **lighter** — **no** matching curl mass on both sides.'
                  : 'This is the **FRONT view** (same rule as NOIR **color** front): **one-sided drape** — bulk and longest curls must fall toward the **viewer’s left** (mannequin’s **right** shoulder); the **opposite** shoulder must stay **lighter** — **no** matching curl mass on both sides.';
            return oneShoulderFront;
          })();

  const partLine =
    partSelection === 'MIDDLE'
      ? 'Use a **MIDDLE / center part** at the crown. **Layered curls** with face-framing layers; part line visible at the front hairline.'
      : partSelection === 'LEFT'
        ? 'Use a **LEFT side part** (part line on the viewer’s left / mannequin’s right side of the crown). **Layered curls** — sweep and volume follow that part; **do not** apply a center or right part.'
        : 'Use a **RIGHT side part** (part line on the viewer’s right / mannequin’s left side of the crown). **Layered curls** — sweep and volume follow that part; **do not** apply a center or left part.';

  return [
    'Recreate this **exact** mannequin photograph. **Only** change the **hairstyle** to **long layered curls** with the **part direction** specified below — same idea as the color step: preserve **mannequin**, **brick background**, **lighting**, **framing**, and **hair color** (catalog / customer color already in the reference).',
    layersLook,
    partLine,
    angleConstraint,
    'Do **not** recolor the hair; do **not** change skin, bust, neck seam, or background. Length may increase for the long-layered-curl look.',
    bawFalEditPreserveReferenceBlock(),
    'The **FRONTAL SLAYER** chest logo must stay fully legible — same position and sharpness as the reference.',
    'Output must be extremely high-quality, crisp, and pixel-perfect.',
    'Change **only** the **hair** to layered curls with the specified part; **everything** else must match the reference.',
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
