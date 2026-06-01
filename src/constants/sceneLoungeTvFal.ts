/**
 * Fal NBP prompts for lounge TV hardware design (`lounge-tv-design.png`).
 * Live UI uses CSS bezel in `loungeTvFrame.tsx`; PNG is the Fal/download reference.
 */

import { LOUNGE_TV_FAL_NEGATIVE } from '../components/lounge/loungeTvFalPrompts';

export const LOUNGE_TV_FAL_MODEL = 'fal-ai/nano-banana-pro/edit';

export const LOUNGE_TV_FAL_CONTROLS_NOTE =
  'resolution 2K or 4K, aspect_ratio auto, output_format png.';

export const LOUNGE_TV_DESIGN_FAL_PASS1 = `Treat the uploaded image as the exact lounge TV hardware to preserve — front-facing flat-panel television, symmetrical product shot.

Charcoal-black plastic bezel: thin uniform frame on top and left/right, slightly thicker bottom chin (typical TV). Bezel has soft gradient (#454545 highlight to #121212 shadow), 1px dark outline, subtle inset highlight — not flat gray cardboard.

Matte glass screen is OFF: uniform dark gray-black (#000–#1a1a1a), subtle glass reflection along the upper inner edge only. Inner screen aspect ratio width:height = 1:0.72 (slightly wider than tall). Square corners on bezel and screen. No on-screen UI, text, logos, or video content.

Soft studio lighting, no wall mount, no desk stand visible (or minimal cropped base). No room, curtains, sofa, or people. Photoreal enhancement only — same proportions and centered framing.`;

export const LOUNGE_TV_DESIGN_FAL_PASS1_NEGATIVE = `${LOUNGE_TV_FAL_NEGATIVE}, pink bezel, silver frame, white screen, bright picture on screen, youtube UI, smart TV menu`;

export const LOUNGE_TV_DESIGN_FAL_EDIT = `[FAL] ${LOUNGE_TV_FAL_MODEL}. lounge-tv-design.png. ${LOUNGE_TV_FAL_CONTROLS_NOTE} PASS 1: ${LOUNGE_TV_DESIGN_FAL_PASS1} NEG: ${LOUNGE_TV_DESIGN_FAL_PASS1_NEGATIVE}`;
