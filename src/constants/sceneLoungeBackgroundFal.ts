/**
 * Fal prompts for `landing2-background.png` — luxury lounge interior
 * (sofa, wine table, plant, white curtains). Walls must match lobby wainscoting for carousel swipe.
 */

import {
  SCENE_FAL_EDIT_CONTROLS_NOTE,
  SCENE_FAL_EDIT_MODEL,
  SCENE_LOBBY_WAINSCOTING_MATCH,
  SCENE_ROSE_BACKGROUND_FAL_ALIGNMENT,
} from './sceneRoseBackgroundFal';

export { SCENE_FAL_EDIT_MODEL, SCENE_FAL_EDIT_CONTROLS_NOTE };

export const LOUNGE_BACKGROUND_FAL_THREE_PASS_NOTE =
  'THREE-PASS on landing2-background.png. TIP: Pass 1 with TWO images — your lounge PNG + lobby landing-background.png — fixes flat red walls. Then Pass 2 + 3 as usual.';

export const LOUNGE_BACKGROUND_PRESERVE_BLOCK = `Treat the uploaded image as the exact lounge to preserve — photograph to enhance, not a new room. Keep the same camera, crop, and every object position: white sofa, glass coffee table with wine glass/bottle and small red flower arrangement, potted plant, floor-to-ceiling sheer white curtains on the left, clear pedestal with urn bouquet if present, marble floor, and open center for the TV. Do not add, remove, swap, or move furniture. No people, text, or logos.`;

export const LOUNGE_LOBBY_TRANSITION_ALIGNMENT = `${SCENE_LOBBY_WAINSCOTING_MATCH} ${SCENE_ROSE_BACKGROUND_FAL_ALIGNMENT} This lounge has sofa and curtains — no central floral rose wall.`;

export const LOUNGE_BACKGROUND_FAL_NEGATIVE_PASS1 =
  'flat red wall, solid crimson wall, smooth red paint, no wainscoting, plain red backdrop, full rose floral wall, dense roses on wall, different panel layout, different sofa, missing wine table, wrong curtains, extra furniture, people, text, logos, plastic CGI';

export const LOUNGE_BACKGROUND_FAL_PASS1 = `${LOUNGE_BACKGROUND_PRESERVE_BLOCK} ${LOUNGE_LOBBY_TRANSITION_ALIGNMENT} Photoreal polish: sofa fabric, glass and wine, plant leaves, soft window glow through white curtains.`;

/** Optional Pass 1b — upload [lounge render, lobby landing-background.png] with only this prompt. */
export const LOUNGE_BACKGROUND_FAL_PASS1_WALLS_FROM_LOBBY_REF = `Replace all visible wall surfaces with the exact same dusty-rose plaster and wainscoting panel layout as the lobby reference image (upper large panel + lower small panel, same molding). Remove any flat solid red painted wall. Keep sofa, table, wine, plant, curtains, pedestal, marble floor, and camera framing unchanged.`;

export const LOUNGE_BACKGROUND_FAL_PASS2_FRONT_LIGHT = `Add a large soft fill light in front of the camera, warm white 3200K, medium-strong — brighten sofa, table, wine, plant, and curtains. Keep window glow through curtains. Do not change wall paneling, layout, or colors.`;

export const LOUNGE_BACKGROUND_FAL_PASS2_NEGATIVE =
  'flat red wall, remove wainscoting, silhouette furniture, dark room, change layout, full floral wall, people';

export const LOUNGE_BACKGROUND_FAL_PASS3_MID_BRIGHTEN = `Increase fill light in the center of the frame only — slightly brighter mid-area for TV and salon chairs. Keep wainscoting walls, curtain glow, marble, and furniture positions unchanged.`;

export const LOUNGE_BACKGROUND_FAL_PASS3_NEGATIVE =
  'flat red wall, change wainscoting, move sofa, shift floor horizon, full rose wall, dark center';

export const LOUNGE_BACKGROUND_FAL_EDIT = `${LOUNGE_BACKGROUND_FAL_THREE_PASS_NOTE} WALL-FIX (2 refs): ${LOUNGE_BACKGROUND_FAL_PASS1_WALLS_FROM_LOBBY_REF} PASS 3: ${LOUNGE_BACKGROUND_FAL_PASS3_MID_BRIGHTEN} PASS 2: ${LOUNGE_BACKGROUND_FAL_PASS2_FRONT_LIGHT} PASS 1: ${LOUNGE_BACKGROUND_FAL_PASS1}`;

export function loungeBackgroundFalWorkflowNote(): string {
  return `[FAL] ${SCENE_FAL_EDIT_MODEL}. landing2-background.png. ${SCENE_FAL_EDIT_CONTROLS_NOTE}`;
}
