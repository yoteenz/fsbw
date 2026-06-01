/**
 * Fal prompts for `landing2-background.png` — sofa, wine, plant, white curtains.
 * Unified carousel: smooth true-red walls (not pink), no wainscoting — then sync lobby from lounge.
 */

import {
  LOBBY_BACKGROUND_FAL_WALLS_FROM_LOUNGE_REF,
  SCENE_FAL_EDIT_CONTROLS_NOTE,
  SCENE_FAL_EDIT_MODEL,
  SCENE_ROSE_BACKGROUND_FAL_ALIGNMENT,
  SCENE_UNIFIED_TRUE_RED_WALL,
} from './sceneRoseBackgroundFal';

export { SCENE_FAL_EDIT_MODEL, SCENE_FAL_EDIT_CONTROLS_NOTE };

export const LOUNGE_BACKGROUND_FAL_THREE_PASS_NOTE =
  'Order: (A) Fix lounge walls to true red, no panels. (B) Sync lobby walls FROM lounge (2 images). (C) Pass 2–3 lighting on lounge if needed.';

export const LOUNGE_BACKGROUND_PRESERVE_BLOCK = `Treat the uploaded image as the exact lounge to preserve — same camera, crop, white sofa, glass table with wine and small flower props, plant, white curtains, marble floor, center open for TV. Do not move furniture. No people, text, or logos.`;

/** Step A — fix pink/mauve paneled walls → true red smooth walls. */
export const LOUNGE_BACKGROUND_FAL_TRUE_RED_WALLS = `${LOUNGE_BACKGROUND_PRESERVE_BLOCK} ${SCENE_UNIFIED_TRUE_RED_WALL} Remove wainscoting panel rectangles and molding — smooth flat red plaster on all visible walls. ${SCENE_ROSE_BACKGROUND_FAL_ALIGNMENT}`;

export const LOUNGE_BACKGROUND_FAL_TRUE_RED_NEGATIVE =
  'pink walls, dusty rose, mauve, coral, pastel, wainscoting, wall panels, molding, full rose floral wall on wall surface, change layout, people';

/** Step B — lobby uses this lounge file as 2nd image; see LOBBY_BACKGROUND_FAL_WALLS_FROM_LOUNGE_REF in sceneRoseBackgroundFal.ts */

export const LOUNGE_BACKGROUND_FAL_PASS2_FRONT_LIGHT = `Add a large soft fill light in front of the camera, warm white 3200K, medium-strong — brighten sofa, table, wine, plant, and curtains. Keep true red walls and window glow unchanged.`;

export const LOUNGE_BACKGROUND_FAL_PASS2_NEGATIVE =
  'pink walls, mauve, silhouette furniture, change wall color, full floral wall, people';

export const LOUNGE_BACKGROUND_FAL_PASS3_MID_BRIGHTEN = `Increase fill light in the center only — brighter mid-area for TV and salon chairs. Keep true red walls, curtains, marble, furniture unchanged.`;

export const LOUNGE_BACKGROUND_FAL_PASS3_NEGATIVE =
  'pink walls, change layout, shift floor horizon, dark center';

export const LOUNGE_BACKGROUND_FAL_EDIT = `${LOUNGE_BACKGROUND_FAL_THREE_PASS_NOTE} STEP A TRUE RED: ${LOUNGE_BACKGROUND_FAL_TRUE_RED_WALLS} STEP A NEG: ${LOUNGE_BACKGROUND_FAL_TRUE_RED_NEGATIVE} LOBBY SYNC (upload lobby + lounge): ${LOBBY_BACKGROUND_FAL_WALLS_FROM_LOUNGE_REF} PASS 3: ${LOUNGE_BACKGROUND_FAL_PASS3_MID_BRIGHTEN} PASS 2: ${LOUNGE_BACKGROUND_FAL_PASS2_FRONT_LIGHT}`;

/** @deprecated — paneled dusty-rose walls; user prefers true red + lounge-led lobby sync. */
export const LOUNGE_BACKGROUND_FAL_PASS1_WALLS_FROM_LOBBY_REF =
  'Deprecated: use LOUNGE_BACKGROUND_FAL_TRUE_RED_WALLS then sync lobby from lounge instead.';

export function loungeBackgroundFalWorkflowNote(): string {
  return `[FAL] ${SCENE_FAL_EDIT_MODEL}. landing2-background.png. ${SCENE_FAL_EDIT_CONTROLS_NOTE}`;
}
