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
 * Step 2 — color from Step 1 output (wig consult + BAW “base → color”).
 * Same sentence shape as all chain steps; only the “from → to” phrases change.
 * @param {string} hairHex - e.g. '#DA3063' or 'DA3063'
 * @param {string} [hairColorLabel='pink'] - e.g. `'pink'` or `'honey blonde'`
 */
export function WIG_CONSULT_STEP2_PROMPT(hairHex, hairColorLabel = 'pink') {
  const hex = String(hairHex || '').replace(/^#/, '');
  const label = String(hairColorLabel || 'pink').trim() || 'pink';
  return buildWigConsultChainEditPrompt('output from step 1', label + ' hair color (hex #' + hex + ')');
}

/** Same as `WIG_CONSULT_STEP2_PROMPT` — BAW “base → color”; pass `hairHex` (+ optional label). */
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
// **2 attachments only** (no logo file): (1) gray brick mannequin, (2) white/rose backdrop.
// fal: **Aspect ratio Auto**, **Resolution 2K** (product owner–verified; keeps framing closer to source than forcing 9:16).
// =============================================================================

export const BAW_BASE_MANNEQUIN_PROMPT_TWO_ATTACHMENTS = [
  'Recreate this exact mannequin image.',
  'The logo on the center of the mannequin’s chest should be clear & legible for accuracy & consistency.',
  'The photo should be extremely high-quality, crisp & pixel perfect.',
  'Do not change anything else about the photo.',
].join(' ');

/** @deprecated Wrong name — was under wig consult. Use `BAW_BASE_MANNEQUIN_PROMPT_TWO_ATTACHMENTS` for BAW base image. */
export const WIG_CONSULT_STEP1_PROMPT_TWO_ATTACHMENTS = BAW_BASE_MANNEQUIN_PROMPT_TWO_ATTACHMENTS;

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
