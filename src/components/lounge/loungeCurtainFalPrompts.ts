/**
 * Fal prompts for lounge theater curtains (Flux 2 Max / Pro edit).
 * Replace `public/assets/lounge-curtain-*.png` after export.
 *
 * **Recommended:** Workflow B — generate LEFT, then RIGHT using the LEFT PNG as reference.
 */

export const LOUNGE_CURTAIN_FAL_NEGATIVE =
  'open curtains, parted curtains, gap between curtains, black void between panels, stage visible through center, letterbox black bar, solid black rectangle, different colored panels, mismatched lighting, asymmetric folds, wide pleats, giant folds, only 3 or 4 folds, stock photo zoom, macro velvet texture, window blinds, venetian blinds, horizontal slats, text, logo, furniture, neon sign, watermark';

/** Identical on every job — paste into both prompts or the single-image prompt. */
export const LOUNGE_CURTAIN_FAL_STYLE_LOCK = `STYLE LOCK (must match exactly on both sides): One continuous closed gray velvet theater curtain. Color: neutral medium-gray velvet, matte, no color cast. Lighting: single soft key light from upper-left, same contrast on both halves. Pleats: 14–18 narrow vertical ripples across the visible width (many thin folds, not 3–6 wide billboard pleats). Camera: medium distance — full-height drapes in frame, fabric edge-to-edge top and bottom, not cropped short. Soft shadow only in fold valleys — valleys must not read as black gaps. No screen, no black rectangle, no stage visible.`;

// —— Workflow A (best match): one image, split in half ———————————————————————

/** Fal: landscape or custom wide (e.g. 1536×1024). Then crop 50/50 → left + right PNGs. */
export const LOUNGE_CURTAIN_FAL_PROMPT_SINGLE_CLOSED_PAIR = `${LOUNGE_CURTAIN_FAL_STYLE_LOCK}

One symmetrical image of a fully CLOSED theater curtain pair for mobile UI. Two mirror-matched panels of the same fabric meet at a single straight vertical center seam with a narrow shadow only — NO gap, NO opening, NO black between panels. Left half and right half must be identical in narrow fold size, texture, lighting, and gray tone (perfect mirror symmetry). Portrait 9:16: velvet runs flush to top and bottom edges of the image with no letterboxing.`;

// —— Workflow B: generate LEFT, then RIGHT from LEFT output —————————————————

export const LOUNGE_CURTAIN_FAL_PROMPT_LEFT = `${LOUNGE_CURTAIN_FAL_STYLE_LOCK}

Transform the reference into the LEFT half only of that closed curtain. Fabric fills the frame from the left outer edge to one straight vertical seam on the RIGHT edge of the image. Many narrow pleats (not wide stock-photo folds). Velvet touches top and bottom of the canvas. Shut curtains — fabric touches the seam, no void.`;

/**
 * **Step 2 (required for matching halves):** Upload the exported LEFT PNG only — not the strip.
 * Strength ~0.35–0.45. Do not re-roll LEFT when generating RIGHT.
 */
export const LOUNGE_CURTAIN_FAL_PROMPT_RIGHT_MATCH_LEFT = `${LOUNGE_CURTAIN_FAL_STYLE_LOCK}

The reference image is the finished LEFT curtain panel (final output from step 1). Create the matching RIGHT half only: mirror the left panel so narrow pleat spacing, pleat count, gray color, texture grain, and lighting are identical — same camera distance, do not zoom in or widen pleats. Fabric from a straight vertical seam on the LEFT edge of this image to the right outer edge. Fabric flush to top and bottom of frame. Shut curtains, no gap, no black band.`;

// —— Workflow C (weaker): two edits on strip — use SAME seed + these prompts —————————

export const LOUNGE_CURTAIN_FAL_PROMPT_RIGHT = `${LOUNGE_CURTAIN_FAL_STYLE_LOCK}

Transform the reference into the RIGHT half only of the same closed curtain as the left panel. Fabric from one straight vertical seam on the LEFT edge to the right outer edge. Must use the same pleat width, count, lighting, and gray as the left panel — mirror pair, not a new curtain.`;

export const LOUNGE_CURTAIN_FAL_SETTINGS = {
  workflowA: {
    label: 'Best match',
    model: 'fal-ai/flux-2-max/edit or text-to-image',
    aspectRatio: 'landscape_4_3 or custom 3:2 wide',
    strength: '0.45–0.55',
    then: 'Crop exact vertical 50% split → lounge-curtain-left.png + lounge-curtain-right.png',
  },
  workflowB: {
    label: 'Recommended — two steps',
    step1: 'LEFT prompt on lounge strip → save PNG (narrow pleats, full height)',
    step2: 'RIGHT_MATCH_LEFT with step1 PNG as the only reference (not the strip), strength 0.35–0.45',
    seed: 'Same seed on step1 if possible; step2 inherits look from LEFT image',
    pleats: '14–18 narrow folds; avoid 3–6 wide “stock image” pleats',
  },
  workflowC: {
    label: 'Two strips (often mismatches)',
    note: 'Same seed on both jobs; strength within 0.02 of each other',
  },
} as const;
