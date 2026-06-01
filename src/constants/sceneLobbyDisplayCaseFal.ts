/**
 * Fal prompts for lobby display-case source JPEG (`CASE.png` after `npm run lobby:bake-case`).
 *
 * **If Fal returns almost the same image:** expected when the upload already matches the reference
 * and you use `LOBBY_DISPLAY_CASE_FAL_EDIT` (heavy “preserve” language). That pass is for QA polish,
 * not redesign. To change only the backdrop for chroma key, use `LOBBY_DISPLAY_CASE_FAL_BACKGROUND_ONLY`.
 */

import { SCENE_FAL_EDIT_CONTROLS_NOTE, SCENE_FAL_EDIT_MODEL } from './sceneRoseBackgroundFal';

export const LOBBY_DISPLAY_CASE_FAL_MODEL = SCENE_FAL_EDIT_MODEL;

export const LOBBY_DISPLAY_CASE_FAL_MASTER = `[FAL] ${LOBBY_DISPLAY_CASE_FAL_MODEL}. CASE.png (lobby display counter). ${SCENE_FAL_EDIT_CONTROLS_NOTE} Deliver a photoreal source frame on a flat studio backdrop — not a cutout. Key to transparent PNG locally with npm run lobby:bake-case (prefers RGB ~140 gray; avoid red cyclorama or green screen behind acrylic).`;

export const LOBBY_DISPLAY_CASE_FAL_PRESERVE = `Treat the uploaded image as the exact display case to preserve — same straight-on front camera, crop, and aspect ratio.

Preserve: rectangular clear-acrylic boutique counter proportions; thick panel edges with realistic thickness highlights; three interior shelf tiers and spacing; red shelf-edge label bars with crisp white uppercase sans-serif text reading exactly SLAY TOOLS (top), LACE PRODUCTS (middle), HAIR PRODUCTS (bottom), centered on each bar; cash register on top left and card payment terminal on top right; optional small floral vases on the sides only if they appear in the reference. Keep acrylic optically transparent through panels (see interior depth, not frosted white plastic). All label text fully legible. Do not add products inside the shelves unless already in the reference.`;

export const LOBBY_DISPLAY_CASE_FAL_SUBJECT = `Subject: boutique clear acrylic display counter case, direct front view. White or very light acrylic frame and shelves, three labeled shelf fronts, register and terminal on the top deck as in reference.`;

export const LOBBY_DISPLAY_CASE_FAL_BACKGROUND = `Background: flat uniform neutral studio gray only (approximately RGB 140, 140, 140) — no gradient, no texture, no colored gel. Soft neutral key light from front/top on the case; subtle contact shadow under the base only. No red, pink, or magenta wash on the acrylic or backdrop.`;

export const LOBBY_DISPLAY_CASE_FAL_NEGATIVE =
  'green screen, red cyclorama, pink backdrop wash, colored fill lights, white void background, empty shelves, missing labels, wrong shelf text, illegible type, frosted acrylic, opaque panels, cartoon, clip art, perspective skew, wide angle, extra products in shelves, people, hands, logos on register, room interior, wall scene, duplicate case, cropped labels';

/** Full copy-paste prompt for Fal (single pass on reference upload). */
export const LOBBY_DISPLAY_CASE_FAL_EDIT = `${LOBBY_DISPLAY_CASE_FAL_MASTER}

${LOBBY_DISPLAY_CASE_FAL_PRESERVE}

${LOBBY_DISPLAY_CASE_FAL_SUBJECT}

${LOBBY_DISPLAY_CASE_FAL_BACKGROUND}

Negative: ${LOBBY_DISPLAY_CASE_FAL_NEGATIVE}`;

/**
 * Short pass when the case already matches the desired art — swap backdrop only (red/green → flat gray).
 * Use this instead of `LOBBY_DISPLAY_CASE_FAL_EDIT` if the full preserve prompt returns a duplicate.
 */
export const LOBBY_DISPLAY_CASE_FAL_BACKGROUND_ONLY = `[FAL] ${LOBBY_DISPLAY_CASE_FAL_MODEL}. CASE.png. ${SCENE_FAL_EDIT_CONTROLS_NOTE}

BACKGROUND SWAP ONLY: Replace every pixel behind the display case with a flat uniform neutral studio gray (RGB ~140, 140, 140). No gradient, texture, red cyclorama, green screen, or room.

Do not change the case, shelf labels (SLAY TOOLS, LACE PRODUCTS, HAIR PRODUCTS), register, terminal, vases, lighting on the case, crop, or camera angle — case and props must match the upload exactly.

Negative: ${LOBBY_DISPLAY_CASE_FAL_NEGATIVE}`;
