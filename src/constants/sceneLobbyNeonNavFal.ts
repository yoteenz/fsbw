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

/** Shared look for all three lobby nav word signs (see `LOBBY_NEON_NAV_HEIGHT_PX` on lobby slide). */
export const LOBBY_NEON_NAV_FAL_STYLE_LOCK = `STYLE LOCK (match lobby main neon logo — Frontal Slayer / FS sign):
Hot pink–red neon glass tubing (#EB1C24 core, deeper red in tube shadows), realistic bent-glass letterforms, visible tube thickness and mounting clips where appropriate.
Strong inner glow plus soft outer bloom/halo (not a flat sticker). Boutique luxury wig salon — Futura PT Medium weight, uppercase, wide letter spacing, clean geometric sans (same family feel as main logo nav).
Straight-on camera, horizontal wordmark, even baseline, no perspective skew.`;

/**
 * Source plate for Fal pass 1 — sign must NOT be baked on the rose wall JPEG.
 * Composite transparent PNG in the app over `landing-background.png`.
 */
export const LOBBY_NEON_NAV_FAL_SOURCE_PLATE = `SOURCE PLATE: Sign only on pure black #000000 (preferred) or dark charcoal #1a1a1a — no rose wall, no salon room, no wainscoting, no shelves. After Fal: cut out with npm run lobby:bake-neon-products|tools|booking (preserves halo better than BiRefNet alone).`;

/**
 * Legibility when the PNG is composited over the lit crimson rose panel (~21px tall on mobile).
 */
export const LOBBY_NEON_NAV_FAL_LEGIBILITY_ON_ROSE = `READABILITY ON BUSY RED ROSE WALL (required for lobby composite):
Keep brand neon pink-red (#EB1C24) but add a bright white-hot core inside each glass tube (40–60% of stroke width) so letters stay legible at small size — not flat pink fill.
Outer bloom: tight inner halo hot pink-red, then a pale pink-to-white rim 8–14px beyond the tubes (soft, not a hard sticker outline) so tubes separate from crimson petals behind them.
Increase tube stroke weight ~15–25% if the upload is hairline-thin; keep the same word, spacing, and rounded-rectangle frame if present.
Optional: faint dark smoke backing only directly behind the word (soft edges, ~25% opacity max) — never a solid white box, never gray matte plaque.
Do not place rose petals, hands, or room scene in front of the sign.`;

export const LOBBY_NEON_NAV_FAL_NEGATIVE =
  'flat neon, dull tubes, no bloom, no white core, thin hairline letters, low contrast on red, neon same color as roses, illegible at distance, wrong typeface, script font, serif, lowercase, extra words, subtitle, logo redesign, FS monogram, FRONTAL SLAYER text, people, hands, rose wall behind sign, salon interior, wainscoting, shelves, green screen spill, white void box, jpeg artifacts, cartoon, clip art';

/** Pass 2 (optional): run on Pass-1 output only — short prompt in Fal box, not bundled with Pass 1. */
export const LOBBY_NEON_NAV_FAL_PASS2_ROSE_SEPARATION = `Legibility pass only. Upload = Pass-1 neon on black. Strengthen white-hot tube cores and pale outer halo so the word reads clearly when overlaid on a dark crimson rose wall. Do not change spelling, layout, frame shape, or tube color family (#EB1C24). No background roses.`;

export const LOBBY_NEON_NAV_FAL_PASS2_ROSE_SEPARATION_NEGATIVE =
  'change wording, extra letters, remove rounded frame, flat sticker, gray neon, kill white core, shrink tubes, add room scene, rose petals covering sign';

export const LOBBY_NEON_NAV_FAL_TWO_PASS_NOTE = NEON_LOGO_FAL_TWO_PASS_NOTE;

function lobbyNeonNavFalEdit(
  assetFilename: string,
  pass1: string,
  pass1Negative: string = LOBBY_NEON_NAV_FAL_NEGATIVE
): string {
  return `[FAL] ${LOBBY_NEON_NAV_FAL_MODEL}. ${assetFilename}. ${LOBBY_NEON_NAV_FAL_TWO_PASS_NOTE} ${LOBBY_NEON_NAV_FAL_CONTROLS_NOTE} ${LOBBY_NEON_NAV_FAL_SOURCE_PLATE} ${LOBBY_NEON_NAV_FAL_STYLE_LOCK} ${LOBBY_NEON_NAV_FAL_LEGIBILITY_ON_ROSE} PASS 1: ${pass1} PASS 1 NEG: ${pass1Negative} PASS 2 (optional, short prompt only on Pass-1 output): ${LOBBY_NEON_NAV_FAL_PASS2_ROSE_SEPARATION} PASS 2 NEG: ${LOBBY_NEON_NAV_FAL_PASS2_ROSE_SEPARATION_NEGATIVE} CUTOUT MODEL: ${LOBBY_NEON_NAV_FAL_CUTOUT_MODEL}. ${NEON_LOGO_BIREFNET_CUTOUT_NOTE}`;
}

/** Pass 1 — horizontal nav sign reading PRODUCTS (or SHOP — match your upload spelling). */
export const LOBBY_NEON_PRODUCTS_FAL_PASS1 = `Treat the uploaded image as the neon nav sign to preserve — single word only (PRODUCTS or SHOP — do not change spelling), horizontal layout, same tube family as lobby Frontal Slayer main logo.

Enhance for lobby rose wall: brighter white-hot tube cores, stronger pale outer halo, +15–25% tube weight if thin. Hot pink-red glass (#EB1C24) with volumetric inner glow — not a flat pink label. Keep rounded-rectangle frame, letter spacing, and baseline if present. Black background only. No additional text or icons.`;

/** Pass 1 — horizontal nav sign reading TOOLS. */
export const LOBBY_NEON_TOOLS_FAL_PASS1 = `Treat the uploaded image as the neon nav sign to preserve — single word TOOLS only, horizontal layout, identical neon style to PRODUCTS/SHOP and BOOKING nav signs.

Enhance for lobby rose wall: white-hot tube cores, pale outer halo rim, thicker strokes if hairline. Match sibling nav signs in bloom strength and #EB1C24 color. Black background only. Typography and frame unchanged.`;

/** Pass 1 — horizontal nav sign reading BOOKING. */
export const LOBBY_NEON_BOOKING_FAL_PASS1 = `Treat the uploaded image as the neon nav sign to preserve — single word BOOKING only, horizontal layout, identical neon style to PRODUCTS/SHOP and TOOLS nav signs.

Enhance for lobby rose wall: white-hot tube cores, pale outer halo, thicker tubes if needed. Slightly longer word — keep even letter spacing and baseline. Black background only. Typography and frame unchanged.`;

export const LOBBY_NEON_PRODUCTS_FAL_EDIT = lobbyNeonNavFalEdit(
  'neon-products.png',
  LOBBY_NEON_PRODUCTS_FAL_PASS1
);

export const LOBBY_NEON_TOOLS_FAL_EDIT = lobbyNeonNavFalEdit('neon-tools.png', LOBBY_NEON_TOOLS_FAL_PASS1);

export const LOBBY_NEON_BOOKING_FAL_EDIT = lobbyNeonNavFalEdit(
  'neon-booking.png',
  LOBBY_NEON_BOOKING_FAL_PASS1
);
