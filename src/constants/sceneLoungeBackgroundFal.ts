/**
 * Fal prompts for `landing2-background.png` — sofa, wine, plant, white curtains.
 * Unified carousel: smooth true-red walls (not pink), no wainscoting — then sync lobby from lounge.
 */

import {
  LOBBY_BACKGROUND_FAL_WALLS_FROM_LOUNGE_REF,
  LOUNGE_BACKGROUND_FAL_CEILING_OUTPAINT_SHORT,
  LOUNGE_BACKGROUND_FAL_LOBBY_TRIM_MATCH,
  LOUNGE_BACKGROUND_FAL_LOBBY_TRIM_MATCH_NEGATIVE,
  SCENE_FAL_EDIT_CONTROLS_NOTE,
  SCENE_FAL_EDIT_MODEL,
  SCENE_LOUNGE_BASEBOARD_MATCH_LOBBY,
  SCENE_LOUNGE_CEILING_MATCH_LOBBY,
  SCENE_ROSE_BACKGROUND_FAL_ALIGNMENT,
  SCENE_UNIFIED_TRUE_RED_WALL,
} from './sceneRoseBackgroundFal';

export { SCENE_FAL_EDIT_MODEL, SCENE_FAL_EDIT_CONTROLS_NOTE };

export const LOUNGE_BACKGROUND_FAL_THREE_PASS_NOTE =
  'Order: (A) True red walls + lobby ceiling/baseboard (LOUNGE_BACKGROUND_FAL_LOBBY_TRIM_MATCH, 2 images). (B) Sync lobby walls FROM lounge. (C) Pass 2–3 lighting. Crown-only: CEILING_OUTPAINT_SHORT.';

export const LOUNGE_BACKGROUND_PRESERVE_BLOCK = `Treat the uploaded image as the exact lounge to preserve — same camera, crop, white sofa, glass table with wine and small flower props, plant, white curtains, marble floor, center open for TV. Do not move furniture. Keep the flat lobby-style ceiling once corrected. No people, text, or logos.`;

/** Step A — fix pink/mauve paneled walls → true red smooth walls + lobby flat ceiling. */
export const LOUNGE_BACKGROUND_FAL_TRUE_RED_WALLS = `${LOUNGE_BACKGROUND_PRESERVE_BLOCK} ${SCENE_UNIFIED_TRUE_RED_WALL} Remove wainscoting panel rectangles and molding — smooth flat red plaster on all visible walls. ${SCENE_LOUNGE_CEILING_MATCH_LOBBY} ${SCENE_LOUNGE_BASEBOARD_MATCH_LOBBY} ${SCENE_ROSE_BACKGROUND_FAL_ALIGNMENT}`;

export const LOUNGE_BACKGROUND_FAL_TRUE_RED_NEGATIVE =
  'pink walls, dusty rose, mauve, coral, pastel, wainscoting, wall panels, molding, thin baseboard, flat shoe molding only, missing baseboard, coffered ceiling, recessed ceiling panels, tray ceiling, paneled ceiling, drop ceiling, ceiling soffit, horizontal ceiling band, lowering crown molding, lower ceiling than lobby, full rose floral wall on wall surface, change layout, people';

/** Optional focused pass — ceiling only. Image 1 = lounge PNG; image 2 = lobby (ceiling ref). */
export const LOUNGE_BACKGROUND_FAL_CEILING_FLAT = `${LOUNGE_BACKGROUND_PRESERVE_BLOCK} ${SCENE_LOUNGE_CEILING_MATCH_LOBBY} Do not change wall red tone, sofa, table, wine, plant, curtains, or furniture scale.`;

export const LOUNGE_BACKGROUND_FAL_CEILING_FLAT_NEGATIVE =
  'low ceiling, dropped ceiling, lowering crown molding, moving molding down, compressed room, less headroom, less red wall, coffered ceiling, recessed ceiling panels, tray ceiling, paneled ceiling, second horizontal ceiling line, ceiling ledge, ceiling step, ceiling soffit, drop ceiling, ceiling grid, extra crown molding tiers, duplicate molding, change wall color, move furniture, shift floor horizon, crop furniture, people';

export const LOUNGE_BACKGROUND_FAL_CEILING_OUTPAINT_NEGATIVE =
  'lowering crown molding, moving molding down, dropped ceiling, compressed room, second horizontal ceiling line, ceiling ledge, ceiling panel, move furniture, shift floor horizon, people';

/** Step B — lobby uses this lounge file as 2nd image; see LOBBY_BACKGROUND_FAL_WALLS_FROM_LOUNGE_REF in sceneRoseBackgroundFal.ts */

export const LOUNGE_BACKGROUND_FAL_PASS2_FRONT_LIGHT = `Add a large soft fill light in front of the camera, warm white 3200K, medium-strong — brighten sofa, table, wine, plant, and curtains. Keep true red walls, flat white ceiling, crown molding line, and window glow unchanged.`;

export const LOUNGE_BACKGROUND_FAL_PASS2_NEGATIVE =
  'pink walls, mauve, silhouette furniture, change wall color, coffered ceiling, paneled ceiling, full floral wall, people';

export const LOUNGE_BACKGROUND_FAL_PASS3_MID_BRIGHTEN = `Increase fill light in the center only — brighter mid-area for TV and salon chairs. Keep true red walls, flat lobby-matched ceiling, curtains, marble, furniture unchanged.`;

export const LOUNGE_BACKGROUND_FAL_PASS3_NEGATIVE =
  'pink walls, change layout, shift floor horizon, coffered ceiling, paneled ceiling, dark center';

export const LOUNGE_BACKGROUND_FAL_EDIT = `${LOUNGE_BACKGROUND_FAL_THREE_PASS_NOTE} TRIM MATCH (recommended): ${LOUNGE_BACKGROUND_FAL_LOBBY_TRIM_MATCH} TRIM NEG: ${LOUNGE_BACKGROUND_FAL_LOBBY_TRIM_MATCH_NEGATIVE} STEP A TRUE RED+TRIM: ${LOUNGE_BACKGROUND_FAL_TRUE_RED_WALLS} STEP A NEG: ${LOUNGE_BACKGROUND_FAL_TRUE_RED_NEGATIVE} CEILING-ONLY: ${LOUNGE_BACKGROUND_FAL_CEILING_FLAT} CEILING SHORT: ${LOUNGE_BACKGROUND_FAL_CEILING_OUTPAINT_SHORT} LOBBY SYNC: ${LOBBY_BACKGROUND_FAL_WALLS_FROM_LOUNGE_REF} PASS 3: ${LOUNGE_BACKGROUND_FAL_PASS3_MID_BRIGHTEN} PASS 2: ${LOUNGE_BACKGROUND_FAL_PASS2_FRONT_LIGHT}`;

/** @deprecated — paneled dusty-rose walls; user prefers true red + lounge-led lobby sync. */
export const LOUNGE_BACKGROUND_FAL_PASS1_WALLS_FROM_LOBBY_REF =
  'Deprecated: use LOUNGE_BACKGROUND_FAL_TRUE_RED_WALLS then sync lobby from lounge instead.';

export function loungeBackgroundFalWorkflowNote(): string {
  return `[FAL] ${SCENE_FAL_EDIT_MODEL}. landing2-background.png. ${SCENE_FAL_EDIT_CONTROLS_NOTE}`;
}
