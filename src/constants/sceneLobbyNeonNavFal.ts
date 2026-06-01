/**
 * Fal prompts for lobby nav neon PNGs — PRODUCTS, TOOLS, BOOKING (`neon-*.png`).
 * Style-locked to the main FRONTAL SLAYER sign (`neon-logo.png` / `sceneNeonLogoFal.ts`).
 */

import {
  NEON_LOGO_BIREFNET_CUTOUT_NOTE,
  NEON_LOGO_FAL_CUTOUT_MODEL,
  NEON_LOGO_FAL_GLOW_CONTROLS_NOTE,
  NEON_LOGO_FAL_GLOW_MODEL,
  NEON_LOGO_FAL_TWO_PASS_NOTE,
} from './sceneNeonLogoFal';

export const LOBBY_NEON_NAV_FAL_MODEL = NEON_LOGO_FAL_GLOW_MODEL;
export const LOBBY_NEON_NAV_FAL_CUTOUT_MODEL = NEON_LOGO_FAL_CUTOUT_MODEL;

export const LOBBY_NEON_NAV_FAL_CONTROLS_NOTE = NEON_LOGO_FAL_GLOW_CONTROLS_NOTE;

/** Shared look for all three lobby nav word signs (~41px rendered height on slide). */
export const LOBBY_NEON_NAV_FAL_STYLE_LOCK = `STYLE LOCK (match lobby main neon logo — Frontal Slayer / FS sign):
Hot pink–red neon glass tubing (#EB1C24 core, deeper red in tube shadows), realistic bent-glass letterforms, visible tube thickness and mounting clips where appropriate.
Strong inner glow plus soft outer bloom/halo (not a flat sticker). Boutique luxury wig salon — Futura PT Medium weight, uppercase, wide letter spacing, clean geometric sans (same family feel as main logo nav).
Straight-on camera, horizontal wordmark, even baseline, no perspective skew. Dark neutral wall or black behind sign for glow pass (cut out to transparent PNG after).`;

export const LOBBY_NEON_NAV_FAL_NEGATIVE =
  'flat neon, dull tubes, no bloom, wrong typeface, script font, serif, lowercase, extra words, subtitle, logo redesign, FS monogram, FRONTAL SLAYER text, people, hands, wall scene, room interior, green screen spill, white box, jpeg artifacts, cartoon, clip art';

export const LOBBY_NEON_NAV_FAL_TWO_PASS_NOTE = NEON_LOGO_FAL_TWO_PASS_NOTE;

function lobbyNeonNavFalEdit(
  assetFilename: string,
  pass1: string,
  pass1Negative: string = LOBBY_NEON_NAV_FAL_NEGATIVE
): string {
  return `[FAL] ${LOBBY_NEON_NAV_FAL_MODEL}. ${assetFilename}. ${LOBBY_NEON_NAV_FAL_TWO_PASS_NOTE} ${LOBBY_NEON_NAV_FAL_CONTROLS_NOTE} ${LOBBY_NEON_NAV_FAL_STYLE_LOCK} PASS 1: ${pass1} PASS 1 NEG: ${pass1Negative} CUTOUT MODEL: ${LOBBY_NEON_NAV_FAL_CUTOUT_MODEL}. ${NEON_LOGO_BIREFNET_CUTOUT_NOTE}`;
}

/** Pass 1 — horizontal nav sign reading PRODUCTS. */
export const LOBBY_NEON_PRODUCTS_FAL_PASS1 = `Treat the uploaded image as the exact neon sign to preserve — single word PRODUCTS only, horizontal layout, same tube style and glow as the lobby Frontal Slayer main logo.

Enhance neon depth: bright hot pink-red bloom through glass tubes, soft volumetric halo behind letters, gentle light spill on dark backing. Tubes look lit from inside with visible glass depth. Keep letterforms, spacing, and composition unchanged — glow enhancement only. No additional text or icons.`;

/** Pass 1 — horizontal nav sign reading TOOLS. */
export const LOBBY_NEON_TOOLS_FAL_PASS1 = `Treat the uploaded image as the exact neon sign to preserve — single word TOOLS only, horizontal layout, identical neon style to lobby PRODUCTS and BOOKING nav signs.

Enhance neon depth: bright hot pink-red bloom, soft halo behind letters, inner tube luminosity. Match PRODUCTS/BOOKING tube weight, color, and bloom strength. Keep typography and layout unchanged — enhancement only.`;

/** Pass 1 — horizontal nav sign reading BOOKING. */
export const LOBBY_NEON_BOOKING_FAL_PASS1 = `Treat the uploaded image as the exact neon sign to preserve — single word BOOKING only, horizontal layout, identical neon style to lobby PRODUCTS and TOOLS nav signs.

Enhance neon depth: bright hot pink-red bloom, soft halo behind letters, inner tube luminosity. Slightly longer word — maintain even letter spacing and baseline alignment. Keep typography and layout unchanged — enhancement only.`;

export const LOBBY_NEON_PRODUCTS_FAL_EDIT = lobbyNeonNavFalEdit(
  'neon-products.png',
  LOBBY_NEON_PRODUCTS_FAL_PASS1
);

export const LOBBY_NEON_TOOLS_FAL_EDIT = lobbyNeonNavFalEdit('neon-tools.png', LOBBY_NEON_TOOLS_FAL_PASS1);

export const LOBBY_NEON_BOOKING_FAL_EDIT = lobbyNeonNavFalEdit(
  'neon-booking.png',
  LOBBY_NEON_BOOKING_FAL_PASS1
);
