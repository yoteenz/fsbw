/**
 * Fal prompts for lobby/lounge rose backgrounds.
 *
 * **Lobby rose wall:** Nano Banana Pro edit needs **two passes**. Pass 1 = color + rear halo.
 * Pass 2 = **short relight prompt only** (long combined prompts skip front fill).
 */

export const SCENE_FAL_EDIT_MODEL = 'fal-ai/nano-banana-pro/edit';

export const SCENE_FAL_EDIT_CONTROLS_NOTE =
  'resolution 2K or 4K, aspect_ratio auto, output_format png.';

export const LOBBY_ROSE_FAL_TWO_PASS_NOTE =
  'TWO-PASS REQUIRED for front-lit roses: (1) Pass 1 on original PNG — color + rear halo. (2) Pass 2 upload Pass-1 output — use ONLY the short PASS 2 prompt below (not Pass 1 again).';

/**
 * Central rose wall vs side walls — prevents pink/washed floral panel.
 */
export const LOBBY_ROSE_PANEL_COLOR_LOCK = `COLOR LOCK — two different surfaces: (1) CENTER vertical rose panel: dense real roses in deep saturated true red and burgundy (#8B0000–#B22222 range), rich crimson petals — NOT pink, NOT coral, NOT pastel, NOT faint. Keep cream/white roses and green leaves as in reference. (2) LEFT and RIGHT walls: muted dusty-rose / mauve-pink plaster wainscoting only.`;

/** Pass 1 only — rear halo (NBP follows this; front light belongs in Pass 2). */
export const LOBBY_ROSE_PANEL_REAR_LIGHT = `Add warm backlight behind the full-height center rose panel — soft halo at crown, edges, and through petals top to bottom. Side walls: soft reflected fill only.`;

export const SCENE_ASSET_EDIT_PRESERVE_BLOCK = `Treat the uploaded image as the exact scene to preserve — same camera, crop, panel geometry, wainscoting, marble floor, pedestals and urn vases. Photoreal enhancement only. No people, products, text, or logos.`;

export const SCENE_ROSE_BACKGROUND_FAL_NEGATIVE_PASS1 =
  'pink roses, dusty-rose floral panel, coral roses, faded red, different room layout, redesigned wainscoting, extra furniture, people, text, logos, plastic CGI look';

/**
 * Pass 2 — photographer-style relight (Chase Jarvis / NBP pattern). **Only** this text in the prompt box.
 */
export const LOBBY_ROSE_BACKGROUND_FAL_PASS2_FRONT_LIGHT = `Add a large soft fill light to the scene. Fill light is placed in front of the camera, facing the center rose wall panel, warm white 3200K, medium-strong — brighten the front faces of the crimson roses so every petal is clearly visible, dimensional, and saturated. Keep the existing warm backlight halo behind the rose panel edges exactly as-is. Do not change walls, floor, vases, layout, panel shape, or rose colors.`;

export const SCENE_ROSE_BACKGROUND_FAL_NEGATIVE_PASS2 =
  'remove backlight, kill halo, silhouette roses, dark rose faces, underexposed petals, change room, move walls, pink roses, flat lighting';

/** Pass 1 full prompt (upload original landing-background.png). */
export const LOBBY_ROSE_BACKGROUND_FAL_PASS1 = `${SCENE_ASSET_EDIT_PRESERVE_BLOCK} ${LOBBY_ROSE_PANEL_COLOR_LOCK} ${LOBBY_ROSE_PANEL_REAR_LIGHT}`;

/** Tooltip / default: workflow + both passes. */
export const LOBBY_ROSE_BACKGROUND_FAL_EDIT = `${LOBBY_ROSE_FAL_TWO_PASS_NOTE} PASS 2 PROMPT: ${LOBBY_ROSE_BACKGROUND_FAL_PASS2_FRONT_LIGHT} PASS 2 NEGATIVE: ${SCENE_ROSE_BACKGROUND_FAL_NEGATIVE_PASS2} PASS 1 PROMPT: ${LOBBY_ROSE_BACKGROUND_FAL_PASS1} PASS 1 NEGATIVE: ${SCENE_ROSE_BACKGROUND_FAL_NEGATIVE_PASS1}`;

/** @deprecated Combined lighting block — NBP ignores front fill when bundled with preserve text. */
export const LOBBY_ROSE_PANEL_LIGHTING = LOBBY_ROSE_PANEL_REAR_LIGHT;

export const LOBBY_ROSE_PANEL_BACKLIGHT = LOBBY_ROSE_PANEL_REAR_LIGHT;

export const SCENE_ROSE_BACKGROUND_FAL_NEGATIVE = SCENE_ROSE_BACKGROUND_FAL_NEGATIVE_PASS1;

export const SCENE_ROSE_BACKGROUND_FAL_ALIGNMENT = `When using the lobby panel as a reference for the lounge panel: match ceiling line, crown molding, side-wall dusty-rose plaster tone, center floral red saturation, and marble horizon so the horizontal swipe is seamless. Do not shift the floor line up or down.`;

export const LOUNGE_ROSE_BACKGROUND_FAL_EDIT = `${SCENE_ASSET_EDIT_PRESERVE_BLOCK} ${LOBBY_ROSE_PANEL_COLOR_LOCK} ${LOBBY_ROSE_PANEL_REAR_LIGHT} Lounge: preserve extra marble floor in lower third. ${SCENE_ROSE_BACKGROUND_FAL_ALIGNMENT}`;

/** @deprecated */
export const LOBBY_ROSE_BACKGROUND_FAL_BASE = LOBBY_ROSE_BACKGROUND_FAL_EDIT;

/** @deprecated */
export const LOUNGE_ROSE_BACKGROUND_FAL_BASE = LOUNGE_ROSE_BACKGROUND_FAL_EDIT;

export function sceneRoseBackgroundFalWorkflowNote(assetLabel: string): string {
  return `[FAL] ${SCENE_FAL_EDIT_MODEL}. ${assetLabel}. ${SCENE_FAL_EDIT_CONTROLS_NOTE}`;
}
