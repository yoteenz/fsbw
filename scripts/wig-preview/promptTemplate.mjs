/**
 * Wig preview prompts
 *
 * ---------------------------------------------------------------------------
 * WHERE THINGS ARE (you have this file open — use this map)
 * ---------------------------------------------------------------------------
 *
 * **A) Automated batch (one fal call per catalog row)** — `npm run` / `node …pregenerate…`
 *    Scroll to **`export function buildWigPreviewPrompt`** (starts ~line 95 below).
 *    Edit only the **array of strings** inside `return [ ... ].join(' ')` to change how
 *    every combo is described. Selections like `${s.color}` are filled in from the manifest.
 *
 * **B) Manual 3-step NBP / fal (your inspo → base → color → style)** — copy/paste into the UI
 *    Use the **`NBP_STEP1_PROMPT`**, **`NBP_STEP2_PROMPT`**, **`NBP_STEP3_PROMPT`** constants
 *    exported below (scroll past `buildWigPreviewPrompt`). Attach refs as you already do:
 *      Step 1: base mannequin (brick) + white/rose ref + logo ref
 *      Step 2: output of Step 1 only
 *      Step 3: output of Step 2 + hair-style ref (waves/layers)
 *    For Step 2, call `NBP_STEP2_PROMPT('#DA3063')` or paste and replace the hex yourself.
 *
 * ---------------------------------------------------------------------------
 */

// =============================================================================
// MANUAL 3-STEP NBP — copy each block into fal (attach images as noted above)
// =============================================================================

/** Step 1 — scene + branding only (no hair change). */
export const NBP_STEP1_PROMPT = [
  'Recreate this exact mannequin image, but swap out the gray brick background with a white backdrop background with the same rose detailing on the edge of the background like the 2nd attachment image.',
  'Use my logo from the 3rd reference attachment on the center of the mannequin’s chest for accuracy & consistency.',
  'The photo should be extremely high-quality, crisp & pixel perfect.',
  'Do not change anything else about the photo.',
].join(' ');

/**
 * Step 2 — hair color only (use output of Step 1 as the image input).
 * @param {string} hairHex - e.g. '#DA3063' or 'DA3063'
 */
export function NBP_STEP2_PROMPT(hairHex) {
  const hex = String(hairHex || '').replace(/^#/, '');
  return [
    'Recreate this exact mannequin image, but change the black hair color to pink hex code #' + hex + '.',
    'The photo should be extremely high-quality, crisp & pixel perfect.',
    'Do not change anything else about the photo.',
  ].join(' ');
}

/** Step 3 — hair silhouette/style only; color stays from Step 2 (attach style ref as 2nd image). */
export const NBP_STEP3_PROMPT = [
  'Recreate this exact same photo just change the hair to be styled like the second reference attachment ONLY.',
  'Don’t change the color of her hair or anything else in the photo.',
].join(' ');

// =============================================================================
// BATCH (single prompt per selection row) — edit inside `return [ ... ]`
// =============================================================================

/**
 * Single source for T2I prompt text when running `pregenerate-wig-previews.mjs`.
 * Edit here when art direction changes; bump `PROMPT_VERSION` when regenerating the manifest.
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
