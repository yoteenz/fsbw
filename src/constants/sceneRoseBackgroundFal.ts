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

/**
 * When the horizontal ceiling/soffit reads as covering the top of the rose panel (roses “behind” ceiling).
 * Single short pass on `landing-background.png` — do not bundle with Pass 1 preserve block.
 */
export const LOBBY_ROSE_PANEL_CEILING_DEPTH_FIX = `Depth and layering fix only. The center rose floral wall is a built-in vertical panel on the same plane as the red walls — it sits IN FRONT of the ceiling opening, not tucked behind it. Extend the dense crimson and white roses upward so the top rows of flowers fill the area under the ceiling recess and overlap in front of the ceiling edge (roses in front, ceiling surface behind). Keep the ceiling architecture, crown line, soffit shape, and ceiling color exactly unchanged — only fix rose-panel layering at the top. Do not lower the ceiling onto the roses. Keep side walls, floor, baseboard, pedestals, and vases unchanged.`;

export const LOBBY_ROSE_PANEL_CEILING_DEPTH_FIX_NEGATIVE =
  'roses behind ceiling, ceiling covering roses, ceiling occluding floral panel, roses clipped under ceiling lip, lowering ceiling, compressed rose panel, shorter rose wall, change ceiling design, new ceiling, coffered ceiling, move floor horizon, pink roses, people, text, logos';

/** @deprecated Combined lighting block — NBP ignores front fill when bundled with preserve text. */

/** @deprecated Combined lighting block — NBP ignores front fill when bundled with preserve text. */
export const LOBBY_ROSE_PANEL_LIGHTING = LOBBY_ROSE_PANEL_REAR_LIGHT;

export const LOBBY_ROSE_PANEL_BACKLIGHT = LOBBY_ROSE_PANEL_REAR_LIGHT;

export const SCENE_ROSE_BACKGROUND_FAL_NEGATIVE = SCENE_ROSE_BACKGROUND_FAL_NEGATIVE_PASS1;

export const SCENE_ROSE_BACKGROUND_FAL_ALIGNMENT = `Carousel alignment with lobby (landing-background.png): match marble floor horizon and ceiling crown-molding line exactly — do not shift the floor up or down.`;

/**
 * Lounge `landing2-background.png` must share the lobby ceiling architecture for horizontal swipe.
 */
export const SCENE_LOUNGE_CEILING_MATCH_LOBBY = `CEILING OUTPAINT ONLY — IMAGE 1 = lounge. IMAGE 2 = lobby ceiling reference. LOCK RULE: the crown molding row in Image 1 must stay at the exact same pixel height — do not move it down or up. Do not compress the room. Only repaint pixels ABOVE the crown molding: remove the second horizontal ledge/panel/soffit and replace with one continuous flat off-white ceiling like Image 2, extending to the top edge. More white ceiling above the molding, never less red wall below it. Marble floor and all furniture unchanged.`;

/** Short crown-locked pass when long prompts keep lowering the ceiling. */
export const LOUNGE_BACKGROUND_FAL_CEILING_OUTPAINT_SHORT = `Outpaint upward only. Crown molding line is frozen — same pixel row as input. Delete the extra horizontal ceiling band above the molding. Flat cream ceiling to the top. Do not lower the molding. Do not move sofa, floor, or walls.`;

/**
 * Lobby thick white baseboard where red wall meets marble (not the thin lounge strip).
 */
export const SCENE_LOUNGE_BASEBOARD_MATCH_LOBBY = `BASEBOARD — MATCH LOBBY (Image 2): where red walls meet the marble floor, add the same thick white architectural baseboard as landing-background.png — exactly TWO horizontal ridge lines (two-step profile), bright clean white, same height and depth as the lobby. Not three ridges. Not a thin flat strip. Marble floor pattern and horizon unchanged; do not move sofa, table, pedestal, or plant.`;

/** Ceiling + baseboard pass on lounge (Image 1) using lobby trim reference (Image 2). */
export const LOUNGE_BACKGROUND_FAL_LOBBY_TRIM_MATCH = `IMAGE 1 = lounge to edit. IMAGE 2 = lobby (landing-background.png) — ceiling and baseboard reference only. ${SCENE_LOUNGE_CEILING_MATCH_LOBBY} ${SCENE_LOUNGE_BASEBOARD_MATCH_LOBBY} ${SCENE_ROSE_BACKGROUND_FAL_ALIGNMENT} Keep true red walls, sofa, glass table, wine, plant, white curtains, and furniture positions unchanged.`;

export const LOUNGE_BACKGROUND_FAL_LOBBY_TRIM_MATCH_NEGATIVE =
  'lowering crown molding, moving ceiling down, low ceiling, thin baseboard, flat shoe molding only, no baseboard, missing baseboard, coffered ceiling, ceiling panel, ceiling ledge, second horizontal ceiling line, pink walls, move furniture, shift floor horizon, people, text, logos';

/**
 * Fix pass for lounge output that has 3 baseboard ridges, ceiling soffit panel, and floor almost aligned.
 * Image 1 = current lounge render; Image 2 = lobby (landing-background.png).
 */
export const LOUNGE_BACKGROUND_FAL_FIX_TRIM_CURRENT_OUTPUT = `IMAGE 1 = lounge render to fix. IMAGE 2 = lobby (landing-background.png) — copy ceiling and floor trim only.

FLOOR LOCK: marble floor horizon and veining are almost correct — do not shift the floor line up or down. Do not move sofa, table, wine, plant, curtains, or pedestal.

CEILING — RAISE + REMOVE PANEL: delete the extra white horizontal ceiling band/soffit/panel between the flat ceiling and the crown molding (the tiered strip under the ceiling). Replace with one tall continuous flat off-white ceiling like Image 2, extending down to a single white crown molding line. Raise the visible ceiling (more flat white above the crown, same as lobby). Do not add a second ceiling step. Do not lower the crown molding row downward into the red wall.

BASEBOARD — EXACTLY TWO RIDGES: at the red wall + marble junction, match Image 2 baseboard profile — thick white architectural baseboard with exactly TWO horizontal ridge lines (two steps), same height and depth as lobby. Remove the third ridge line — not three steps, not four. Not a thin flat strip.

Keep true red walls and all furniture unchanged.`;

export const LOUNGE_BACKGROUND_FAL_FIX_TRIM_CURRENT_OUTPUT_NEGATIVE =
  'three baseboard ridges, third baseboard line, extra baseboard step, four baseboard lines, ceiling soffit, ceiling panel, tray ceiling, coffered ceiling, second horizontal ceiling line above crown, lowering crown molding, moving ceiling down, dropped ceiling, compressed room, shift floor horizon, move furniture, thin baseboard, pink walls, people, text, logos';

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
export const LOBBY_ROSE_BACKGROUND_FAL_EDIT = `${LOBBY_BACKGROUND_FAL_WALLS_FROM_LOUNGE_NOTE} WALL SYNC PROMPT: ${LOBBY_BACKGROUND_FAL_WALLS_FROM_LOUNGE_REF} WALL SYNC NEG: ${LOBBY_BACKGROUND_FAL_WALLS_FROM_LOUNGE_NEGATIVE} --- ROSE PANEL PASSES: ${LOBBY_ROSE_FAL_TWO_PASS_NOTE} ROSE CEILING DEPTH (short pass if roses behind ceiling): ${LOBBY_ROSE_PANEL_CEILING_DEPTH_FIX} ROSE CEILING DEPTH NEG: ${LOBBY_ROSE_PANEL_CEILING_DEPTH_FIX_NEGATIVE} PASS 2: ${LOBBY_ROSE_BACKGROUND_FAL_PASS2_FRONT_LIGHT} PASS 1: ${LOBBY_ROSE_BACKGROUND_FAL_PASS1}`;

/** @deprecated */
export const LOBBY_ROSE_BACKGROUND_FAL_BASE = LOBBY_ROSE_BACKGROUND_FAL_EDIT;

export function sceneRoseBackgroundFalWorkflowNote(assetLabel: string): string {
  return `[FAL] ${SCENE_FAL_EDIT_MODEL}. ${assetLabel}. ${SCENE_FAL_EDIT_CONTROLS_NOTE}`;
}
