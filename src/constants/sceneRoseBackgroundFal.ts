/**
 * Fal prompts for lobby/lounge rose backgrounds and other scene plates.
 *
 * **Recommended:** `fal-ai/nano-banana-pro/edit` — upload current PNG from
 * `/lobby?lobbyAssets=1` DOWNLOAD. Preserve layout via prompt (not a strength slider).
 */

export const SCENE_FAL_EDIT_MODEL = 'fal-ai/nano-banana-pro/edit';

export const SCENE_FAL_EDIT_CONTROLS_NOTE =
  'Upload your PNG. resolution 2K or 4K, aspect_ratio auto. No strength slider — color/layout locked in prompt.';

/**
 * Central rose wall vs side walls — prevents pink/washed floral panel.
 */
export const LOBBY_ROSE_PANEL_COLOR_LOCK = `COLOR LOCK — two different surfaces: (1) CENTER vertical rose panel: dense real roses in deep saturated true red and burgundy (#8B0000–#B22222 range), rich crimson petals with natural shadow variation — NOT pink, NOT coral, NOT dusty rose, NOT pastel, NOT desaturated or faint. Keep scattered cream/white roses and green leaves exactly as in the reference. (2) LEFT and RIGHT walls: muted dusty-rose / mauve-pink plaster wainscoting only — do NOT tint the side walls red and do NOT turn the center panel pink.`;

/**
 * Dual lighting on center panel: rear halo (keep) + front fill (lift dark rose faces).
 */
export const LOBBY_ROSE_PANEL_LIGHTING = `LIGHTING — center rose panel uses BOTH directions (not backlight-only):

(1) REAR (keep): continuous warm backlight behind the full-height floral wall, top to bottom — soft halo at crown and edges, gentle bloom through petals, subtle left/right rim. Same quality you already have; extend evenly through middle and lower center.

(2) FRONT (add): soft frontal key light from the camera / viewer side — large diffused salon fill illuminating the FACE of the roses across the entire panel height. Lift shadows on crimson petals so roses read bright, dimensional, and saturated (not a dark silhouette). Visible petal texture and highlight rolls; center column evenly lit for future floating shelves so props look front-lit AND wall-glows from behind.

Balance: rear glow + front fill together; front light must not kill the rear halo. Side plaster walls: softer reflected fill only.`;

/** @deprecated alias */
export const LOBBY_ROSE_PANEL_BACKLIGHT = LOBBY_ROSE_PANEL_LIGHTING;

/**
 * Shared “do not repaint” block for scene plates (lobby wall, lounge wall, etc.).
 */
export const SCENE_ASSET_EDIT_PRESERVE_BLOCK = `Treat the uploaded image as the exact scene to preserve — a photograph to enhance, not a new room to invent. Keep the same camera angle, crop, framing, panel geometry, wainscoting layout, baseboard height, marble floor position, slab scale, vein direction, and empty center for UI. Do not add, remove, or move architectural elements. Only increase photoreal depth: subtle plaster grain, crisp molding edges, gentle ambient occlusion in corners, refined marble reflectivity. Preserve clear acrylic pedestals and white urn vases with small red/white bouquets if present. No people, products, text, or logos.`;

export const SCENE_ROSE_BACKGROUND_FAL_NEGATIVE =
  'pink roses, dusty-rose floral panel, coral roses, salmon roses, faded red, desaturated roses, pastel floral wall, wrong floral color, backlight only, rear light only, roses in shadow, dark front of floral panel, silhouette roses, underexposed petals, flat black rose faces, rim light only, backlight only at top, dark lower rose panel, uneven panel lighting, black void in center, flat unlit floral wall, different room layout, redesigned wainscoting, side walls turned red, extra furniture, visible clutter, people, products, text, logos, fisheye, shifted horizon, new floor pattern, plastic CGI look, over-smoothed blur';

export const SCENE_ROSE_BACKGROUND_FAL_ALIGNMENT = `When using the lobby panel as a reference for the lounge panel: match ceiling line, crown molding, side-wall dusty-rose plaster tone, center floral red saturation, and marble horizon so the horizontal swipe is seamless. Do not shift the floor line up or down.`;

export const LOBBY_ROSE_BACKGROUND_FAL_EDIT = `${SCENE_ASSET_EDIT_PRESERVE_BLOCK} ${LOBBY_ROSE_PANEL_COLOR_LOCK} ${LOBBY_ROSE_PANEL_LIGHTING} Enhance plaster walls with warmer salon fill only; do not add new trim, brass strips, or side columns.`;

export const LOUNGE_ROSE_BACKGROUND_FAL_EDIT = `${SCENE_ASSET_EDIT_PRESERVE_BLOCK} ${LOBBY_ROSE_PANEL_COLOR_LOCK} Lounge continuation: preserve extra marble floor in the lower third and chair-zone framing exactly as the reference; enhance texture and lighting only. ${SCENE_ROSE_BACKGROUND_FAL_ALIGNMENT}`;

/** @deprecated */
export const LOBBY_ROSE_BACKGROUND_FAL_BASE = LOBBY_ROSE_BACKGROUND_FAL_EDIT;

/** @deprecated */
export const LOUNGE_ROSE_BACKGROUND_FAL_BASE = LOUNGE_ROSE_BACKGROUND_FAL_EDIT;

export function sceneRoseBackgroundFalWorkflowNote(assetLabel: string): string {
  return `[FAL EDIT] Model: ${SCENE_FAL_EDIT_MODEL}. Upload ${assetLabel} PNG. ${SCENE_FAL_EDIT_CONTROLS_NOTE}`;
}
