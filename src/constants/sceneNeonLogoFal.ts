/**
 * Fal prompts for `neon-logo.png` — FS / FRONTAL SLAYER lobby + lounge neon.
 * Model: `fal-ai/nano-banana-pro/edit` (short passes; avoid long preserve + glow in one box).
 */

export const NEON_LOGO_FAL_MODEL = 'fal-ai/nano-banana-pro/edit';

export const NEON_LOGO_FAL_CONTROLS_NOTE = 'resolution 2K or 4K, aspect_ratio auto, output_format png.';

export const NEON_LOGO_FAL_TWO_PASS_NOTE =
  'TWO-PASS: (1) Upload your neon JPEG — glow pass only. (2) Upload Pass-1 PNG — transparent cutout pass only. Or use BiRefNet / remove-background after Pass 1.';

/** Pass 1 — depth + bloom on uploaded sign (wall can stay for now). */
export const LOBBY_NEON_LOGO_FAL_PASS1_GLOW = `Treat the uploaded image as the exact neon sign to preserve — same FS monogram, FRONTAL SLAYER letterforms, tube paths, mounting clips, and straight-on camera angle.

Add strong neon depth: bright hot pink-red bloom through the glass tubes, soft volumetric glow behind and around the sign, red light washing the dark wall. Rear halo plus gentle front fill so tubes look lit from inside, not flat stickers. Glow should spread 8–12 inches on the wall behind the sign. Keep wall and sign position unchanged — enhancement only.`;

export const LOBBY_NEON_LOGO_FAL_PASS1_GLOW_NEGATIVE =
  'flat neon, dull tubes, no bloom, no wall glow, changed typography, extra text, logo redesign, people, mockup frame, cartoon';

/** Pass 2 — transparent PNG for compositing over lobby scene (upload Pass-1 output). */
export const LOBBY_NEON_LOGO_FAL_PASS2_CUTOUT = `Remove the dark wall completely — export a PNG with fully transparent background (alpha). Keep the neon sign exactly: tubes, clips, wires, FS + FRONTAL SLAYER.

Preserve the soft red/pink glow aura hugging the tubes only — glow fades smoothly to transparent at the edges. No gray matte box, no white fringe, no floor shadow plate, no rectangular cutout halo.`;

export const LOBBY_NEON_LOGO_FAL_PASS2_CUTOUT_NEGATIVE =
  'solid background, white background, gray box, square matte, hard cutout edge, green screen fringe, removed glow, flat neon, changed letters, extra text, floor shadow';

/** Single-pass attempt if user prefers one step (less reliable on NBP). */
export const LOBBY_NEON_LOGO_FAL_SINGLE_PASS = `${LOBBY_NEON_LOGO_FAL_PASS1_GLOW} ${LOBBY_NEON_LOGO_FAL_PASS2_CUTOUT}`;

export const LOBBY_NEON_LOGO_FAL_EDIT = `${NEON_LOGO_FAL_TWO_PASS_NOTE} PASS 1 GLOW: ${LOBBY_NEON_LOGO_FAL_PASS1_GLOW} PASS 1 NEG: ${LOBBY_NEON_LOGO_FAL_PASS1_GLOW_NEGATIVE} PASS 2 CUTOUT: ${LOBBY_NEON_LOGO_FAL_PASS2_CUTOUT} PASS 2 NEG: ${LOBBY_NEON_LOGO_FAL_PASS2_CUTOUT_NEGATIVE}`;
