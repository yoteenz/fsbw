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
export const LOBBY_ROSE_PANEL_COLOR_LOCK = `COLOR LOCK — two different surfaces: (1) CENTER vertical rose panel: dense real roses in deep saturated true red and burgundy (#8B0000–#B22222 range), rich crimson petals with natural shadow variation — NOT pink, NOT coral, NOT dusty rose, NOT pastel, NOT desaturated or faint. Keep scattered cream/white roses and green leaves exactly as in the reference. Soft warm backlight glow from behind the floral panel only. (2) LEFT and RIGHT walls: muted dusty-rose / mauve-pink plaster wainscoting only — do NOT tint the side walls red and do NOT turn the center panel pink.`;

/**
 * Shared “do not repaint” block for scene plates (lobby wall, lounge wall, etc.).
 */
export const SCENE_ASSET_EDIT_PRESERVE_BLOCK = `Treat the uploaded image as the exact scene to preserve — a photograph to enhance, not a new room to invent. Keep the same camera angle, crop, framing, panel geometry, wainscoting layout, baseboard height, marble floor position, slab scale, vein direction, and empty center for UI. Do not add, remove, or move architectural elements. Only increase photoreal depth: subtle plaster grain, crisp molding edges, gentle ambient occlusion in corners, refined marble reflectivity. Preserve clear acrylic pedestals and white urn vases with small red/white bouquets if present. No people, products, text, or logos.`;

export const SCENE_ROSE_BACKGROUND_FAL_NEGATIVE =
  'pink roses, dusty-rose floral panel, coral roses, salmon roses, faded red, desaturated roses, pastel floral wall, wrong floral color, different room layout, redesigned wainscoting, side walls turned red, extra furniture, visible clutter, people, products, text, logos, fisheye, shifted horizon, new floor pattern, plastic CGI look, over-smoothed blur';

export const SCENE_ROSE_BACKGROUND_FAL_ALIGNMENT = `When using the lobby panel as a reference for the lounge panel: match ceiling line, crown molding, side-wall dusty-rose plaster tone, center floral red saturation, and marble horizon so the horizontal swipe is seamless. Do not shift the floor line up or down.`;

export const LOBBY_ROSE_BACKGROUND_FAL_EDIT = `${SCENE_ASSET_EDIT_PRESERVE_BLOCK} ${LOBBY_ROSE_PANEL_COLOR_LOCK} Enhance with warmer salon lighting on plaster walls only; soft neon-like rim glow behind the center rose panel; do not add new trim, brass strips, or side columns.`;

export const LOUNGE_ROSE_BACKGROUND_FAL_EDIT = `${SCENE_ASSET_EDIT_PRESERVE_BLOCK} ${LOBBY_ROSE_PANEL_COLOR_LOCK} Lounge continuation: preserve extra marble floor in the lower third and chair-zone framing exactly as the reference; enhance texture and lighting only. ${SCENE_ROSE_BACKGROUND_FAL_ALIGNMENT}`;

/** @deprecated */
export const LOBBY_ROSE_BACKGROUND_FAL_BASE = LOBBY_ROSE_BACKGROUND_FAL_EDIT;

/** @deprecated */
export const LOUNGE_ROSE_BACKGROUND_FAL_BASE = LOUNGE_ROSE_BACKGROUND_FAL_EDIT;

export function sceneRoseBackgroundFalWorkflowNote(assetLabel: string): string {
  return `[FAL EDIT] Model: ${SCENE_FAL_EDIT_MODEL}. Upload ${assetLabel} PNG. ${SCENE_FAL_EDIT_CONTROLS_NOTE}`;
}
