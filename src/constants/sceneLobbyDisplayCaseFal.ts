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

/**
 * Lobby hero composite — paint acrylic case into the scene (two-image Fal pass).
 * IMAGE 1 = full lobby frame; IMAGE 2 = `CASE.png`. Run `npm run lobby:fal-add-display-case`.
 */
export const LOBBY_DISPLAY_CASE_ON_SCENE_PLACEMENT = `PLACEMENT — match live lobby slide (\`src/pages/lobby/page.tsx\`): horizontally centered on the main neon logo with a slight shift to the right (~32px at mobile scale, ~1% of frame width on a full hero); vertically in the lower rose panel — directly below the bottom shelf row (CUSTOM UNITS / third shelf), above the marble floor, centered between the two pedestal urns without covering them. Case width ~24–28% of the rose column; straight-on front camera, same perspective as the scene.`;

export const LOBBY_DISPLAY_CASE_ON_SCENE_PRESERVE = `IMAGE 1 = lobby scene to edit. Preserve exactly: dense red/cream rose wall, FRONTAL SLAYER neon logo, PRODUCTS / TOOLS / BOOKING nav signs, all three wall-mounted shelf rows with wigs and shelf labels, pedestal floral urns left and right, marble floor, ceiling crown line, warm neon ambient light. Do not move, crop, relight, or redesign the room.`;

export const LOBBY_DISPLAY_CASE_ON_SCENE_ACRYLIC = `IMAGE 2 = acrylic display case reference (geometry, shelf tiers, labels, register, terminal).

Add a photorealistic clear-acrylic boutique counter IN IMAGE 1 at the placement above — integrated into the rose environment (no studio gray box behind the case).

ACRYLIC 3D / MATERIAL (critical):
- Clear PMMA panels with visible edge thickness: beveled top rails, vertical posts, base plinth — real-world depth (8–12mm apparent)
- Specular edge highlights and soft neon-orange/pink reflections from the scene on acrylic rims
- Optically transparent faces: roses, shelves, and floor visible through glass with subtle refraction and interior parallax — NOT frosted, milky, or white plastic
- Three interior shelf tiers with red label bars and crisp white uppercase sans-serif: SLAY TOOLS (top), LACE PRODUCTS (middle), HAIR PRODUCTS (bottom) — match IMAGE 2 text exactly
- Top deck: vintage cash register left, card payment terminal right (match IMAGE 2)
- Contact shadow and ambient occlusion where the base meets roses; subtle reflection of neon on the top deck`;

export const LOBBY_DISPLAY_CASE_ON_SCENE_NEGATIVE =
  'frosted acrylic, opaque white case, cartoon, flat 2D overlay, clip art, studio gray void behind case, green screen, wrong shelf labels, illegible type, missing register, case on top of shelves, case covering pedestal urns, duplicate case, extreme wide angle, perspective skew, plastic toy look, empty shelves inside case';

export const LOBBY_DISPLAY_CASE_ON_SCENE_FAL_EDIT = `[FAL] ${LOBBY_DISPLAY_CASE_FAL_MODEL}. Lobby hero — add acrylic display case in-app position. ${SCENE_FAL_EDIT_CONTROLS_NOTE}

${LOBBY_DISPLAY_CASE_ON_SCENE_PRESERVE}

${LOBBY_DISPLAY_CASE_ON_SCENE_ACRYLIC}

${LOBBY_DISPLAY_CASE_ON_SCENE_PLACEMENT}

Negative: ${LOBBY_DISPLAY_CASE_ON_SCENE_NEGATIVE}`;
