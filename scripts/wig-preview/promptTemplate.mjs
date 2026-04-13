/**
 * Prompts for two different features — keep them separate:
 *
 * 1) **WIG CONSULT** — manual 3-step chain in fal (base mannequin → color → style). Stored here for copy/paste.
 * 2) **BAW (Build-a-wig)** — automated batch only: `buildWigPreviewPrompt` at the bottom (catalog combos, different backgrounds later).
 *
 * Step 1 for wig consult can change per feature (consult vs BAW); edit `WIG_CONSULT_STEP1_PROMPT` or add more exports.
 */

// =============================================================================
// WIG CONSULT — current 3-step (base mannequin → selections / color → style)
// Copy into fal. Step 1: attach base mannequin + logo ref (2nd attachment per your wording).
// =============================================================================

/** Wig consult Step 1 — logo on chest; background/room comes from YOUR base reference image. */
export const WIG_CONSULT_STEP1_PROMPT = [
  'Recreate this exact mannequin image. Use my logo from the 2nd reference attachment on the center of the mannequin’s chest for accuracy & consistency.',
  'The photo should be extremely high-quality, crisp & pixel perfect.',
  'Do not change anything else about the photo.',
].join(' ');

/**
 * Wig consult Step 2 — hair color only (attach: output of Step 1).
 * @param {string} hairHex - e.g. '#DA3063' or 'DA3063'
 */
export function WIG_CONSULT_STEP2_PROMPT(hairHex) {
  const hex = String(hairHex || '').replace(/^#/, '');
  return [
    'Recreate this exact mannequin image, but change the black hair color to pink hex code #' + hex + '.',
    'The photo should be extremely high-quality, crisp & pixel perfect.',
    'Do not change anything else about the photo.',
  ].join(' ');
}

/** Wig consult Step 3 — hair style only (attach: Step 2 output + style reference). */
export const WIG_CONSULT_STEP3_PROMPT = [
  'Recreate this exact same photo just change the hair to be styled like the second reference attachment ONLY.',
  'Don’t change the color of her hair or anything else in the photo.',
].join(' ');

// =============================================================================
// WIG CONSULT — legacy Step 1 (white/rose background + logo from 3rd ref) — keep for later
// =============================================================================

export const WIG_CONSULT_LEGACY_STEP1_PROMPT = [
  'Recreate this exact mannequin image, but swap out the gray brick background with a white backdrop background with the same rose detailing on the edge of the background like the 2nd attachment image.',
  'Use my logo from the 3rd reference attachment on the center of the mannequin’s chest for accuracy & consistency.',
  'The photo should be extremely high-quality, crisp & pixel perfect.',
  'Do not change anything else about the photo.',
].join(' ');

// =============================================================================
// Backward-compatible names (same as wig consult; old Step 1 = legacy)
// =============================================================================

/** @deprecated Use `WIG_CONSULT_LEGACY_STEP1_PROMPT` — kept so old notes still match. */
export const NBP_STEP1_PROMPT = WIG_CONSULT_LEGACY_STEP1_PROMPT;

export function NBP_STEP2_PROMPT(hairHex) {
  return WIG_CONSULT_STEP2_PROMPT(hairHex);
}

export const NBP_STEP3_PROMPT = WIG_CONSULT_STEP3_PROMPT;

// =============================================================================
// BAW — automated batch (one fal call per manifest row) — NOT wig consult 3-step
// =============================================================================

/**
 * Build-a-wig catalog previews — `pregenerate-wig-previews.mjs` only.
 * Different backgrounds / art direction than wig consult; edit here for bulk NOIR (etc.) runs.
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
