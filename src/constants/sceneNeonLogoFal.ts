/**
 * Fal prompts for `neon-logo.png` — FS / FRONTAL SLAYER lobby + lounge neon.
 * Glow: `fal-ai/nano-banana-pro/edit`. Transparent PNG: `fal-ai/birefnet/v2` (NBP cannot export alpha).
 */

export const NEON_LOGO_FAL_GLOW_MODEL = 'fal-ai/nano-banana-pro/edit';

/** Outputs real PNG/WebP with alpha — use after glow pass, not NBP. */
export const NEON_LOGO_FAL_CUTOUT_MODEL = 'fal-ai/birefnet/v2';

export const NEON_LOGO_FAL_GLOW_CONTROLS_NOTE = 'resolution 2K or 4K, aspect_ratio auto, output_format png.';

export const NEON_LOGO_BIREFNET_CUTOUT_NOTE =
  'CUTOUT: BiRefNet often strips neon glow — prefer npm run lobby:bake-neon-logo (dark-bg key preserves halo). If using birefnet/v2: Matting, refine_foreground OFF, png. NBP does NOT produce transparent backgrounds.';

export const NEON_LOGO_FAL_TWO_PASS_NOTE =
  'WORKFLOW: (1) NBP edit — glow pass. (2) birefnet/v2 — remove background to transparent PNG. Do not ask NBP for alpha.';

/** Pass 1 — depth + bloom on uploaded sign (wall can stay for now). */
export const LOBBY_NEON_LOGO_FAL_PASS1_GLOW = `Treat the uploaded image as the exact neon sign to preserve — same FS monogram, FRONTAL SLAYER letterforms, tube paths, mounting clips, and straight-on camera angle.

Add strong neon depth: bright hot pink-red bloom through the glass tubes, soft volumetric glow behind and around the sign, red light washing the dark wall. Rear halo plus gentle front fill so tubes look lit from inside, not flat stickers. Glow should spread 8–12 inches on the wall behind the sign. Keep wall and sign position unchanged — enhancement only.`;

export const LOBBY_NEON_LOGO_FAL_PASS1_GLOW_NEGATIVE =
  'flat neon, dull tubes, no bloom, no wall glow, changed typography, extra text, logo redesign, people, mockup frame, cartoon';

export const LOBBY_NEON_LOGO_FAL_EDIT = `${NEON_LOGO_FAL_TWO_PASS_NOTE} GLOW MODEL: ${NEON_LOGO_FAL_GLOW_MODEL}. ${NEON_LOGO_FAL_GLOW_CONTROLS_NOTE} PASS 1 GLOW: ${LOBBY_NEON_LOGO_FAL_PASS1_GLOW} PASS 1 NEG: ${LOBBY_NEON_LOGO_FAL_PASS1_GLOW_NEGATIVE} CUTOUT MODEL: ${NEON_LOGO_FAL_CUTOUT_MODEL}. ${NEON_LOGO_BIREFNET_CUTOUT_NOTE}`;
