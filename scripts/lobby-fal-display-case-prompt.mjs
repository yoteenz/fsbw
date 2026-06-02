/** Resolved Fal prompt for lobby scene + display case (kept in sync with sceneLobbyDisplayCaseFal.ts). */
export const LOBBY_DISPLAY_CASE_ON_SCENE_FAL_PROMPT = `[FAL] fal-ai/nano-banana-pro/edit. Lobby hero — add acrylic display case in-app position. resolution 2K or 4K, aspect_ratio auto, output_format png.

IMAGE 1 = lobby scene to edit. Preserve exactly: dense red/cream rose wall, FRONTAL SLAYER neon logo, PRODUCTS / TOOLS / BOOKING nav signs, all three wall-mounted shelf rows with wigs and shelf labels, pedestal floral urns left and right, marble floor, ceiling crown line, warm neon ambient light. Do not move, crop, relight, or redesign the room.

IMAGE 2 = acrylic display case reference (geometry, shelf tiers, labels, register, terminal).

Add a photorealistic clear-acrylic boutique counter IN IMAGE 1 at the placement above — integrated into the rose environment (no studio gray box behind the case).

ACRYLIC 3D / MATERIAL (critical):
- Clear PMMA panels with visible edge thickness: beveled top rails, vertical posts, base plinth — real-world depth (8–12mm apparent)
- Specular edge highlights and soft neon-orange/pink reflections from the scene on acrylic rims
- Optically transparent faces: roses, shelves, and floor visible through glass with subtle refraction and interior parallax — NOT frosted, milky, or white plastic
- Three interior shelf tiers with red label bars and crisp white uppercase sans-serif: SLAY TOOLS (top), LACE PRODUCTS (middle), HAIR PRODUCTS (bottom) — match IMAGE 2 text exactly
- Top deck: vintage cash register left, card payment terminal right (match IMAGE 2)
- Contact shadow and ambient occlusion where the base meets roses; subtle reflection of neon on the top deck

PLACEMENT — match live lobby slide (src/pages/lobby/page.tsx): horizontally centered on the main neon logo with a slight shift to the right (~32px at mobile scale, ~1% of frame width on a full hero); vertically in the lower rose panel — directly below the bottom shelf row (CUSTOM UNITS / third shelf), above the marble floor, centered between the two pedestal urns without covering them. Case width ~24–28% of the rose column; straight-on front camera, same perspective as the scene.

Negative: frosted acrylic, opaque white case, cartoon, flat 2D overlay, clip art, studio gray void behind case, green screen, wrong shelf labels, illegible type, missing register, case on top of shelves, case covering pedestal urns, duplicate case, extreme wide angle, perspective skew, plastic toy look, empty shelves inside case`;
