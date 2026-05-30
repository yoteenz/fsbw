/**
 * Fal prompts for lounge theater curtains (Flux 2 Max / Pro edit or Kontext).
 * Regenerate left + right panels; replace `public/assets/lounge-curtain-*.png`.
 *
 * Important: do NOT put a black “TV hole” in the PNG — the app draws the black TV on top.
 * Both panels should show fabric meeting at the center seam (closed), not parted with a gap.
 */

export const LOUNGE_CURTAIN_FAL_NEGATIVE =
  'open curtains, parted curtains, gap between curtains, black void between panels, stage visible through center, letterbox black bar, solid black rectangle, window blinds, venetian blinds, horizontal slats, macro fiber close-up, extreme zoom, text, logo, furniture, neon sign, watermark';

/** Upload left crop of reference; right job uses horizontally flipped reference. */
export const LOUNGE_CURTAIN_FAL_PROMPT_LEFT = `Transform the reference into the LEFT half of a fully CLOSED theater curtain pair for mobile portrait UI.

Photorealistic light gray velvet stage curtain with soft vertical pleats and natural 3D depth — rounded fold ridges, soft shadows in valleys.

CRITICAL — CLOSED: Fabric must extend all the way to a single straight vertical seam on the RIGHT edge of this image. The curtains are shut; there is NO opening, NO gap, NO black void, and NO visible stage between curtains. Only a narrow shadow along the seam. Do not add a black rectangle for a screen — the app overlays the TV separately.

CRITICAL — SCALE: Medium-wide camera, not macro texture. Show approximately 5–7 full vertical pleats across the image width so the curtain reads at UI scale beside a phone-sized screen, not an extreme close-up of fibers.

The LEFT outer edge of the image is the off-stage edge of the drape. Portrait 9:16, cinematic soft lighting from upper left, ultra sharp but not overscaled.`;

export const LOUNGE_CURTAIN_FAL_PROMPT_RIGHT = `Transform the reference into the RIGHT half of a fully CLOSED theater curtain pair for mobile portrait UI.

Photorealistic light gray velvet stage curtain with soft vertical pleats and natural 3D depth — rounded fold ridges, soft shadows in valleys.

CRITICAL — CLOSED: Fabric must extend all the way to a single straight vertical seam on the LEFT edge of this image. The curtains are shut; there is NO opening, NO gap, NO black void, and NO visible stage between curtains. Only a narrow shadow along the seam. Do not add a black rectangle for a screen — the app overlays the TV separately.

CRITICAL — SCALE: Medium-wide camera, not macro texture. Show approximately 5–7 full vertical pleats across the image width so the curtain reads at UI scale beside a phone-sized screen, not an extreme close-up of fibers.

The RIGHT outer edge of the image is the off-stage edge of the drape. Portrait 9:16, mirror-appropriate lighting, ultra sharp but not overscaled.`;

/** Suggested Fal settings */
export const LOUNGE_CURTAIN_FAL_SETTINGS = {
  model: 'fal-ai/flux-2-max/edit',
  aspectRatio: 'portrait_16_9',
  strength: '0.5–0.62 (lower keeps scale closer to reference)',
  note: 'After export, replace lounge-curtain-left.png and lounge-curtain-right.png; no black band on inner edges.',
} as const;
