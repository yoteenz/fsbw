/**
 * Fal prompts for `landing2-background.png` — luxury lounge interior
 * (sofa, side table with wine, plant, white curtains). NOT the lobby rose wall.
 *
 * **Model:** `fal-ai/nano-banana-pro/edit` — three passes (same pattern as lobby rose wall).
 */

import { SCENE_FAL_EDIT_MODEL, SCENE_FAL_EDIT_CONTROLS_NOTE } from './sceneRoseBackgroundFal';

export { SCENE_FAL_EDIT_MODEL, SCENE_FAL_EDIT_CONTROLS_NOTE };

export const LOUNGE_BACKGROUND_FAL_THREE_PASS_NOTE =
  'THREE-PASS on landing2-background.png: Pass 1 = preserve layout + enhance. Pass 2 = front fill only. Pass 3 = brighter center (TV/chairs zone).';

export const LOUNGE_BACKGROUND_PRESERVE_BLOCK = `Treat the uploaded image as the exact lounge to preserve — photograph to enhance, not a new room. Keep the same camera, crop, and every object position: luxury sofa, side table with wine glass/bottle, potted plant, floor-to-ceiling white curtains, wall moldings, marble floor, and open center area for the TV. Do not add, remove, swap, or move furniture. No people, text, or logos.`;

/** Match lobby carousel — walls/floor/ceiling only; lounge has no rose panel. */
export const LOUNGE_LOBBY_TRANSITION_ALIGNMENT = `For horizontal swipe from lobby: match ceiling line, crown molding if visible, dusty-rose or mauve-pink side wall tone, and marble floor horizon/vein direction with the lobby panel — do not shift the floor line. This scene is a separate lounge with sofa and white curtains, not a floral rose wall.`;

export const LOUNGE_BACKGROUND_FAL_NEGATIVE_PASS1 =
  'rose wall, floral wall, dense red roses, different sofa, missing wine table, missing plant, wrong curtains, pink walls, different room layout, extra furniture, people, text, logos, plastic CGI';

export const LOUNGE_BACKGROUND_FAL_PASS1 = `${LOUNGE_BACKGROUND_PRESERVE_BLOCK} ${LOUNGE_LOBBY_TRANSITION_ALIGNMENT} Photoreal polish: fabric texture on sofa, glass and wine highlights on table, natural plant leaves, soft sheer white curtains with gentle window glow from behind curtains. Warm boutique salon mood.`;

export const LOUNGE_BACKGROUND_FAL_PASS2_FRONT_LIGHT = `Add a large soft fill light to the scene. Fill light is in front of the camera, warm white 3200K, medium-strong — brighten the front of the sofa, side table, wine, plant, and white curtains so they read clearly and dimensional. Keep existing soft backlight/window glow through the curtains unchanged. Do not change layout, objects, or colors.`;

export const LOUNGE_BACKGROUND_FAL_PASS2_NEGATIVE =
  'remove window glow, silhouette furniture, dark sofa, underexposed room, change layout, rose wall, floral panel, people';

export const LOUNGE_BACKGROUND_FAL_PASS3_MID_BRIGHTEN = `Increase fill light strength in the center of the frame only — slightly brighter mid-area where the TV and salon chairs sit (sofa and table stay natural). Keep curtain glow, walls, marble floor, and all object positions unchanged.`;

export const LOUNGE_BACKGROUND_FAL_PASS3_NEGATIVE =
  'change layout, move sofa, shift floor horizon, remove curtains, rose wall, dark center';

export const LOUNGE_BACKGROUND_FAL_EDIT = `${LOUNGE_BACKGROUND_FAL_THREE_PASS_NOTE} PASS 3: ${LOUNGE_BACKGROUND_FAL_PASS3_MID_BRIGHTEN} PASS 3 NEG: ${LOUNGE_BACKGROUND_FAL_PASS3_NEGATIVE} PASS 2: ${LOUNGE_BACKGROUND_FAL_PASS2_FRONT_LIGHT} PASS 2 NEG: ${LOUNGE_BACKGROUND_FAL_PASS2_NEGATIVE} PASS 1: ${LOUNGE_BACKGROUND_FAL_PASS1} PASS 1 NEG: ${LOUNGE_BACKGROUND_FAL_NEGATIVE_PASS1}`;

export function loungeBackgroundFalWorkflowNote(): string {
  return `[FAL] ${SCENE_FAL_EDIT_MODEL}. landing2-background.png. ${SCENE_FAL_EDIT_CONTROLS_NOTE}`;
}
