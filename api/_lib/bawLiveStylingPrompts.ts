/**
 * **Two-image** middle + layers (live API): first URL = colored mannequin to edit; second = style inspo (“this”).
 * Keep in sync with `scripts/wig-preview/promptTemplate.mjs` (`BAW_MIDDLE_PART_LAYERS_STYLE_PROMPT_TWO_IMAGES`).
 */
export function buildMiddlePartLayersStylePromptTwoImages(angle: 'front' | 'left' | 'right'): string {
  const angleConstraint =
    angle === 'left'
      ? 'The first image is **LEFT 3/4**: when copying hair shape from the second image, keep bulk on the **correct shoulder for a left view** — do **not** mirror into a symmetric “both shoulders” wig unless the second reference clearly shows that.'
      : angle === 'right'
        ? 'The first image is **RIGHT 3/4**: when copying hair shape from the second image, keep bulk on the **correct shoulder for a right view** — do **not** mirror into a symmetric “both shoulders” wig unless the second reference clearly shows that.'
        : 'The first image is **FRONT**: match the second reference’s part and silhouette in black; do not invent a different cut.';

  return [
    'Use the **first image** as the base: keep the same mannequin, background, catalog hair color, framing, and chest logo.',
    'Recreate the **hair from the second image** on that base — same middle part, layer shape, face-framing, volume, and silhouette as the second attachment — but the hair color must read as **jet black #000000**.',
    angleConstraint,
    'The logo on the center of the mannequin’s chest with FRONTAL SLAYER must remain fully legible for accuracy & consistency.',
    'The photo should be extremely high-quality, crisp & pixel perfect.',
    'Do not change anything else about the first image except the hair to match the second reference in black.',
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
