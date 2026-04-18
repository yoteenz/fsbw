/**
 * Shared lines for `fal-ai/nano-banana-pro/edit` on NOIR mannequin refs.
 * Goal: reduce plastic/waxy retexture, logo smear, and “soft CGI” drift while still allowing hair edits.
 *
 * Keep in sync with the inlined copy in `api/wig-preview/live-noir-color.ts` (nested route bundles `_lib` poorly).
 */

export const BAW_FAL_EDIT_PRESERVE_REFERENCE_LINES = [
  'Treat the input as a **photograph to preserve**, not a scene to repaint: keep **the same effective resolution, sharpness, grain, and micro-detail** as the reference — do **not** downscale, blur, soften, over-smooth, or add a plastic / waxy / painterly CGI look.',
  'Lock **mannequin bust material**, **skin tone**, **facial features**, and **neck seam** to the reference — **no** melting, warping, retexturing, or “beauty filter” on the figure.',
  'Lock **background bricks**, **lighting**, **shadows**, and **camera perspective** to the reference unless the prompt explicitly asks to change them.',
  'Keep the **FRONTAL SLAYER** chest logo **sharp**, same **size** and **placement**, clean edges — **no** smeared, redrawn, or re-typed lettering.',
] as const;

/** Join for single-block prompts (color step, bangs-only, chain edits). */
export function bawFalEditPreserveReferenceBlock(): string {
  return BAW_FAL_EDIT_PRESERVE_REFERENCE_LINES.join(' ');
}
