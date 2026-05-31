/**
 * Fal prompts for lobby/lounge rose backgrounds and other scene plates.
 *
 * **Always use image-to-image edit**, not text-to-image: upload the current PNG from
 * `/lobby?lobbyAssets=1` DOWNLOAD links, then `fal-ai/flux-2-max/edit` at low strength.
 */

export const SCENE_FAL_EDIT_MODEL = 'fal-ai/flux-2-max/edit';

/** Typical strength for scene enhancement (lower = closer to your layout). */
export const SCENE_FAL_EDIT_STRENGTH_LOBBY = '0.28–0.38';
export const SCENE_FAL_EDIT_STRENGTH_LOUNGE = '0.30–0.42';

/**
 * Shared “do not repaint” block for scene plates (lobby wall, lounge wall, etc.).
 * Keep in sync with tooltip prompts in lobbySceneAssets / loungeSceneAssets.
 */
export const SCENE_ASSET_EDIT_PRESERVE_BLOCK = `Treat the uploaded image as the exact scene to preserve — a photograph to enhance, not a new room to invent. Keep the same camera angle, crop, framing, panel geometry, wainscoting layout, baseboard height, marble floor position, slab scale, vein direction, wall color family, and empty center for UI. Do not add, remove, or move architectural elements. Only increase photoreal depth: subtle plaster grain, crisp molding edges, soft natural window light from upper-left, gentle ambient occlusion in corners, refined marble reflectivity. No people, products, text, or logos.`;

export const SCENE_ROSE_BACKGROUND_FAL_NEGATIVE =
  'different room layout, redesigned wainscoting, wrong wall color, extra furniture, visible clutter, people, products, text, logos, fisheye, shifted horizon, new floor pattern, plastic CGI look, over-smoothed blur';

/**
 * For lounge ↔ lobby carousel: only when generating lounge FROM lobby reference
 * (second edit pass), not when enhancing lounge PNG alone.
 */
export const SCENE_ROSE_BACKGROUND_FAL_ALIGNMENT = `When using the lobby panel as a reference for the lounge panel: match ceiling line, crown molding, dusty-rose plaster tone, and marble horizon so the horizontal swipe is seamless. Do not shift the floor line up or down.`;

export const LOBBY_ROSE_BACKGROUND_FAL_EDIT = `${SCENE_ASSET_EDIT_PRESERVE_BLOCK} Lobby hero wall panel: enhance the existing dusty rose plaster and wainscoting with warmer natural salon light; keep brass or marble edge accents only where they already appear in the reference — do not add new trim or side columns.`;

export const LOUNGE_ROSE_BACKGROUND_FAL_EDIT = `${SCENE_ASSET_EDIT_PRESERVE_BLOCK} Lounge continuation panel: preserve the extra marble floor visible in the lower third and chair-zone framing exactly as the reference; enhance texture and lighting only. ${SCENE_ROSE_BACKGROUND_FAL_ALIGNMENT}`;

/** @deprecated Text-to-image wording — causes Flux to invent a new room. Use *_FAL_EDIT + upload PNG. */
export const LOBBY_ROSE_BACKGROUND_FAL_BASE = LOBBY_ROSE_BACKGROUND_FAL_EDIT;

/** @deprecated Use LOUNGE_ROSE_BACKGROUND_FAL_EDIT */
export const LOUNGE_ROSE_BACKGROUND_FAL_BASE = LOUNGE_ROSE_BACKGROUND_FAL_EDIT;

export function sceneRoseBackgroundFalWorkflowNote(assetLabel: string, strength: string): string {
  return `[FAL EDIT] Model: ${SCENE_FAL_EDIT_MODEL}. Upload your current ${assetLabel} PNG. Strength: ${strength}. Not text-to-image.`;
}
