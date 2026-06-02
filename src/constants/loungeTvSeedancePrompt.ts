/**
 * Seedance 2.0 (ByteDance) — lounge TV open / close overlay sequences.
 * Matches `LoungeTvOverlay.tsx` choreography (grow, curtains, hand, static, zap, shrink).
 *
 * Export still frames from the app or composite in Figma, then run I2V with locked start/end.
 */

import {
  FINAL_LOUNGE_BACKGROUND_SRC_REMOTE,
} from './finalLobbySceneAssets';

export const LOUNGE_TV_SEEDANCE_MODEL = 'seedance-2';

/**
 * NOT text-to-image. Use Seedance image-to-video / first-last-frame mode only.
 */
export const LOUNGE_TV_SEEDANCE_SETTINGS_NOTE =
  'MODE: Image-to-video (NOT text-to-image). Upload START and END stills; lock both frames. Aspect 9:16 portrait (match final-lounge.png 928×1680). Duration 4–5s open, 3–4s close. Motion strength medium. Camera locked — no pan, zoom, or roll. Interpolate between the two photos; do not invent a new room from text alone.';

/** Lounge slide before play — baked composite, small wall TV, curtains open, no hand. */
export const LOUNGE_TV_SEEDANCE_OPEN_START_FRAME_REMOTE = FINAL_LOUNGE_BACKGROUND_SRC_REMOTE;

/**
 * End of open sequence — export a still: gray theater curtains fully closed edge-to-edge,
 * large centered flatscreen (~90% width), matte black glass with CRT static/snow only,
 * photoreal hand + remote at bottom center pressing power. Same red lounge walls visible
 * only as soft bleed at curtain edges if any — prefer curtains filling the frame.
 */
export const LOUNGE_TV_SEEDANCE_OPEN_END_FRAME_REMOTE = '';

/** Start of close — same composition as open END (curtains closed, large TV, hand at remote). */
export const LOUNGE_TV_SEEDANCE_CLOSE_START_FRAME_REMOTE = LOUNGE_TV_SEEDANCE_OPEN_END_FRAME_REMOTE;

/** End of close — same as open START (small TV on lounge wall, curtains open, no hand). */
export const LOUNGE_TV_SEEDANCE_CLOSE_END_FRAME_REMOTE = LOUNGE_TV_SEEDANCE_OPEN_START_FRAME_REMOTE;

export const LOUNGE_TV_SEEDANCE_OPEN_PROMPT = `Image-to-video using two locked reference photos — NOT text-to-image. The first frame must match the uploaded lounge page photo exactly (small wall-mounted TV on the red boutique wall). The last frame must match the uploaded theater-overlay end photo exactly.

WHAT THE START PHOTO SHOWS (lounge page): photoreal Build-a-Wig lounge — smooth true-red matte walls, tall flat off-white ceiling, white marble floor with grey veining, white curved sofa, glass coffee table with wine and roses, sheer white curtains at left edge still OPEN (not covering the TV), clear pedestal with flowers. Center wall: one modest charcoal-black flatscreen TV, OFF — dark gray-black glass with subtle reflection, small relative to the wall (boutique scale). No human hand, no gray theater curtains in front of the TV, no CRT static, no on-screen menus or text.

WHAT THE END PHOTO SHOWS (TV open / theater mode): same room identity and lighting temperature — but the view is now the "cinema" overlay. Two panels of closed neutral medium-gray velvet theater curtains fill the frame left and right; they meet at a straight vertical center seam with only a narrow shadow (no gap, no black void). Between the curtains: one large front-facing flatscreen TV, charcoal plastic bezel, thin top/side frame and slightly thicker bottom chin. The glass shows analog CRT television static only — gray and white snow, scanlines, soft vignette — NOT a user interface, NOT thumbnails, NOT readable text. At the bottom center: a photoreal human hand holding a TV remote control, finger pressing the power button; soft studio key light from upper-left matching the curtains. The TV is much larger than in the start frame (grown toward the viewer), centered. Curtains are fully closed; sheer white side curtains from the lounge are hidden behind the gray theater drapes.

ANIMATION STYLE (open, ~4–5 seconds, ease-in-out): continuous single shot, camera fixed. (1) Gray velvet theater curtains slide inward from off-screen left and right, closing smoothly over the lounge until they meet at center — 10–12 vertical pleats per panel, matte gray velvet. (2) Simultaneously the wall TV scales up larger toward the viewer, staying centered between the closing curtains, until it matches the end frame size. (3) After curtains are shut and the TV is full size, the hand and remote fade/slide up from the bottom edge into position under the bezel; one subtle press on the power button. (4) The screen flashes once then fills with CRT static snow (no menu UI). Hold the end frame composition stable for the last 0.5s. No zoom on the whole room, no camera shake, no morphing furniture, no new objects. Photoreal, warm boutique lighting, stable exposure.`;

export const LOUNGE_TV_SEEDANCE_CLOSE_PROMPT = `Image-to-video using two locked reference photos — NOT text-to-image. The first frame must match the uploaded theater-overlay photo exactly (closed gray curtains, large TV, hand on remote). The last frame must match the uploaded lounge page photo exactly (small wall TV, open lounge, no hand).

WHAT THE START PHOTO SHOWS: closed neutral medium-gray velvet theater curtain pair edge-to-edge, large centered charcoal flatscreen TV, photoreal hand holding remote at bottom center. Screen is black or just finished power-off (no menu UI, no readable text).

WHAT THE END PHOTO SHOWS: same lounge composite as the boutique slide — small OFF TV on the red wall, sheer white left curtains open, sofa, table, roses, pedestal, marble floor. No gray theater curtains, no hand, no static on screen.

ANIMATION STYLE (close, ~3–4 seconds, ease-in-out) — reverse of the open sequence, same camera lock: (1) Hand already on remote: finger presses power; the TV glass does a fast CRT power-off — bright horizontal white zap line across the screen that collapses to a dot then black (classic tube shutdown, not static snow). (2) Hand and remote fade/slide down and out below frame. (3) The large TV scales down smaller back to its wall position on the lounge while (4) the gray velvet theater curtains slide outward left and right, opening to reveal the full lounge composition of the end photo. End on the small TV and open room exactly matching the last frame. No room redesign, no zoom, no people besides the exiting hand, no on-screen app UI.`;

export const LOUNGE_TV_SEEDANCE_OPEN_NEGATIVE = `text to image, t2i, generating new room from scratch, ignoring start frame, ignoring end frame, wrong lounge photo, wrong end frame, open curtains at end, closed curtains at start, TV same size in both frames, missing hand at end, hand visible at start, YouTube UI, Netflix UI, app interface, readable text, logos, watermarks, thumbnails on screen, bright colorful picture on TV instead of static, cartoon, low quality, fisheye, dutch angle, camera pan, camera zoom, rolling shutter, strobing, glitch, black void between curtain panels, mismatched curtain color, neon curtains, red theater curtains, extra TVs, duplicate hands, face visible, zoom on whole room, morphing sofa, warped walls`;

export const LOUNGE_TV_SEEDANCE_CLOSE_NEGATIVE = `${LOUNGE_TV_SEEDANCE_OPEN_NEGATIVE}, static snow on screen at end, large TV at end, hand at end, curtains closed at end, no power-off zap, slow fade to black only, menu UI on screen`;

export const LOUNGE_TV_SEEDANCE_OPEN_COPY_BLOCK = `[SEEDANCE 2 — LOUNGE TV OPEN — IMAGE-TO-VIDEO, NOT T2I]
${LOUNGE_TV_SEEDANCE_SETTINGS_NOTE}

START FRAME (lounge page, small TV): ${LOUNGE_TV_SEEDANCE_OPEN_START_FRAME_REMOTE || '(upload final-lounge.png — small wall TV, no theater curtains)'}

END FRAME (theater overlay — export still): ${LOUNGE_TV_SEEDANCE_OPEN_END_FRAME_REMOTE || '(upload composite: closed gray curtains + large TV + CRT static + hand on remote)'}

PROMPT:
${LOUNGE_TV_SEEDANCE_OPEN_PROMPT}

NEGATIVE:
${LOUNGE_TV_SEEDANCE_OPEN_NEGATIVE}`;

export const LOUNGE_TV_SEEDANCE_CLOSE_COPY_BLOCK = `[SEEDANCE 2 — LOUNGE TV CLOSE — IMAGE-TO-VIDEO, NOT T2I]
${LOUNGE_TV_SEEDANCE_SETTINGS_NOTE}

START FRAME (theater overlay): ${LOUNGE_TV_SEEDANCE_CLOSE_START_FRAME_REMOTE || '(same as OPEN end frame)'}

END FRAME (lounge page, small TV): ${LOUNGE_TV_SEEDANCE_CLOSE_END_FRAME_REMOTE || '(upload final-lounge.png)'}

PROMPT:
${LOUNGE_TV_SEEDANCE_CLOSE_PROMPT}

NEGATIVE:
${LOUNGE_TV_SEEDANCE_CLOSE_NEGATIVE}`;
