/**
 * Prompts for two different features — keep them separate:
 *
 * 1) **WIG CONSULT** — manual 3-step chain in fal (base mannequin → color → style). Stored here for copy/paste.
 * 2) **BAW (Build-a-wig)** — automated batch only: `buildWigPreviewPrompt` at the bottom (catalog combos, different backgrounds later).
 *
 * Step 1 for wig consult can change per feature (consult vs BAW); edit `WIG_CONSULT_STEP1_PROMPT` or add more exports.
 */

// =============================================================================
// WIG CONSULT — Step 1 (proven in fal: 9:16 + proportionate logo)
// Attachments: (1) gray brick mannequin, (2) white/rose backdrop ref, (3) logo ref
// =============================================================================

/** Wig consult Step 1 — simple prompt that worked for you; use aspect ratio 9:16 in fal. */
export const WIG_CONSULT_STEP1_PROMPT = [
  'Recreate this exact mannequin image, but swap out the gray brick background with a white backdrop background with the same rose detailing on the edge of the background like the 2nd attachment image.',
  'Use my logo from the 3rd reference attachment on the center of the mannequin’s chest for accuracy & consistency.',
  'The photo should be extremely high-quality, crisp & pixel perfect.',
  'Do not change anything else about the photo.',
].join(' ');

/**
 * Wig consult Step 1 — **only 2 attachments** (no logo file): (1) gray brick mannequin, (2) white/rose backdrop ref.
 * Logo is described in text so fal does not rescale from a third image. Use **9:16** in fal. Try this if logo size was wrong with 3 refs.
 */
export const WIG_CONSULT_STEP1_PROMPT_TWO_ATTACHMENTS = [
  'Recreate this exact mannequin image, but swap out the gray brick background with a white backdrop background with the same rose detailing on the edge of the background like the 2nd attachment image.',
  'On the center of the mannequin’s chest, add the Frontal Slayer brand mark: a red stylized “F/S” monogram with the words FRONTAL SLAYER in small red sans-serif capital letters across the middle of the mark — compact and proportional, roughly one-quarter to one-third of the chest width at its widest point, sharp and legible, matching brand red, subtle stitched-on look, not oversized and not a huge banner.',
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

/** Same copy as Step 1 above — kept for older docs / imports. */
export const WIG_CONSULT_LEGACY_STEP1_PROMPT = WIG_CONSULT_STEP1_PROMPT;

// =============================================================================
// Backward-compatible names
// =============================================================================

export const NBP_STEP1_PROMPT = WIG_CONSULT_STEP1_PROMPT;

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
