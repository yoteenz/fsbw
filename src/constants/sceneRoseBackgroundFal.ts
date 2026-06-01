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

/** @deprecated Combined lighting block — NBP ignores front fill when bundled with preserve text. */
export const LOBBY_ROSE_PANEL_LIGHTING = LOBBY_ROSE_PANEL_REAR_LIGHT;

export const LOBBY_ROSE_PANEL_BACKLIGHT = LOBBY_ROSE_PANEL_REAR_LIGHT;

export const SCENE_ROSE_BACKGROUND_FAL_NEGATIVE = SCENE_ROSE_BACKGROUND_FAL_NEGATIVE_PASS1;

export const SCENE_ROSE_BACKGROUND_FAL_ALIGNMENT = `When using the lobby panel as a reference for the lounge panel: match ceiling line, crown molding, side-wall dusty-rose plaster tone, center floral red saturation, and marble horizon so the horizontal swipe is seamless. Do not shift the floor line up or down.`;

/**
 * Unified smooth red walls (user preference) — NOT pink/mauve, NOT lobby wainscoting.
 */
export const SCENE_UNIFIED_TRUE_RED_WALL = `Wall color: deep saturated true red / burgundy / crimson (#8B0000–#B22222), matte plaster — NOT pink, NOT dusty rose, NOT mauve, NOT coral, NOT pastel. Smooth flat walls with NO wainscoting panels and NO rectangular molding on side walls.`;

/**
 * Alternate: lounge walls match lobby paneling (older carousel approach).
 */
export const SCENE_LOBBY_WAINSCOTING_MATCH = `WALLS — MATCH LOBBY PANELING: dusty-rose plaster + upper/lower wainscoting panels. NOT flat solid red paint. NOT full floral rose wall on lounge.`;

/**
 * Upload [landing-background.png, lounge PNG]. Lounge = color reference; lobby side walls lose panels.
 */
export const LOBBY_BACKGROUND_FAL_WALLS_FROM_LOUNGE_REF = `Use the lounge reference image for wall color and finish only. Change the lobby LEFT and RIGHT wall areas: remove all wainscoting panels and molding — smooth matte deep true red burgundy walls matching the lounge reference, NOT pink. Keep the CENTER vertical dense rose floral panel exactly (crimson roses, cream accents). Keep marble floor, baseboard, clear pedestals, urn vases, ceiling, camera crop, and layout unchanged.`;

export const LOBBY_BACKGROUND_FAL_WALLS_FROM_LOUNGE_NEGATIVE =
  'pink walls, dusty rose walls, mauve, wainscoting, wall panels, rectangular molding, flat lobby without rose panel, remove floral center, change floor horizon, extra furniture, people, logos';

/** Tooltip add-on for lobby DOWNLOAD — prepend to roseBackground when using lounge-led walls. */
export const LOBBY_BACKGROUND_FAL_WALLS_FROM_LOUNGE_NOTE =
  'LOUNGE-LED WALLS (2 images): upload landing-background.png + lounge render. Prompt LOBBY_BACKGROUND_FAL_WALLS_FROM_LOUNGE_REF.';

/** Tooltip / default: lounge-led wall sync + rose panel lighting passes. */
export const LOBBY_ROSE_BACKGROUND_FAL_EDIT = `${LOBBY_BACKGROUND_FAL_WALLS_FROM_LOUNGE_NOTE} WALL SYNC PROMPT: ${LOBBY_BACKGROUND_FAL_WALLS_FROM_LOUNGE_REF} WALL SYNC NEG: ${LOBBY_BACKGROUND_FAL_WALLS_FROM_LOUNGE_NEGATIVE} --- ROSE PANEL PASSES: ${LOBBY_ROSE_FAL_TWO_PASS_NOTE} PASS 2: ${LOBBY_ROSE_BACKGROUND_FAL_PASS2_FRONT_LIGHT} PASS 1: ${LOBBY_ROSE_BACKGROUND_FAL_PASS1}`;

/** @deprecated */
export const LOBBY_ROSE_BACKGROUND_FAL_BASE = LOBBY_ROSE_BACKGROUND_FAL_EDIT;

export function sceneRoseBackgroundFalWorkflowNote(assetLabel: string): string {
  return `[FAL] ${SCENE_FAL_EDIT_MODEL}. ${assetLabel}. ${SCENE_FAL_EDIT_CONTROLS_NOTE}`;
}
