/**
 * Seedance 2.0 (ByteDance) — lounge TV open / close overlay sequences.
 * Matches `LoungeTvOverlay.tsx` choreography (grow, curtains, hand, static, zap, shrink).
 *
 * **Important:** Seedance must NOT invent gray theater drapes or a generic hand. Lock frames built
 * from bundled assets (`lounge-tv-remote-hand.png`, white curtains cropped from `final-lounge.png`).
 */

import {
  FINAL_LOUNGE_BACKGROUND_SRC_REMOTE,
} from './finalLobbySceneAssets';
import { LOUNGE_TV_REMOTE_HAND_SRC_REMOTE } from '../components/lounge/loungeTvAssets';

export const LOUNGE_TV_SEEDANCE_MODEL = 'seedance-2';

/**
 * NOT text-to-image. Use Seedance image-to-video / first-last-frame mode only.
 * If the UI offers extra reference slots, add HAND + (optional) white-curtain crop URLs below.
 */
export const LOUNGE_TV_SEEDANCE_SETTINGS_NOTE = `MODE: Image-to-video (NOT text-to-image). Upload START and END stills; lock both frames. Aspect 9:16 portrait (928×1680). Duration 4–5s open, 3–4s close. Motion strength medium-low. Camera locked — no pan, zoom, or roll.

REFERENCE ASSETS (composite into END frame and/or upload as Seedance reference images):
• Hand + remote (required — do not let the model invent a hand): ${LOUNGE_TV_REMOTE_HAND_SRC_REMOTE}
  Bundled: /assets/lounge-tv-remote-hand.png — chroma-keyed, bottom-center under TV.
• Curtains: use the SHEER WHITE / off-white drapes from the lounge page (left edge of final-lounge.png) — NOT gray theater velvet. Crop the left window curtains from the START photo; mirror for the right panel. Do NOT use gray overlay curtain assets (lounge-curtain-left/right.jpeg) for this Seedance job.
• END frame background: solid black theater void — lounge furniture, floor, ceiling, and walls must be fully hidden behind closed white curtains, not visible around them.

Build END frame in Figma/Photoshop from real PNGs before running Seedance; text prompts alone will drift to gray curtains and wrong hands.`;

/** Lounge slide before play — baked composite, small wall TV, curtains open, no hand. */
export const LOUNGE_TV_SEEDANCE_OPEN_START_FRAME_REMOTE = FINAL_LOUNGE_BACKGROUND_SRC_REMOTE;

/** Optional: upload as extra Seedance reference (same as composited hand in END frame). */
export const LOUNGE_TV_SEEDANCE_REF_HAND_REMOTE = LOUNGE_TV_REMOTE_HAND_SRC_REMOTE;

/**
 * End of open — export composite still (see {@link LOUNGE_TV_SEEDANCE_OPEN_END_FRAME_RECIPE}).
 * Set URL here after upload to Supabase.
 */
export const LOUNGE_TV_SEEDANCE_OPEN_END_FRAME_REMOTE = '';

export const LOUNGE_TV_SEEDANCE_OPEN_END_FRAME_RECIPE = `END FRAME RECIPE (lock this still as LAST frame):
1. Background: pure black (#000) theater void — NO red walls, NO marble floor, NO sofa, NO chairs, NO ceiling, NO pedestal visible anywhere.
2. Curtains: closed pair of SHEER WHITE / soft off-white lounge curtains (same fabric, pleating, and translucency as the left window drapes on final-lounge.png). Panels slide from left and right edges; meet at center with a narrow overlap shadow only — no gap, no gray velvet, no red room bleeding through except a faint warm glow through the sheer fabric if needed.
3. TV: the SAME flat-panel TV as the START frame — only larger/closer. Modern charcoal bezel, thin uniform frame on top and sides, one modest bottom chin only. NO second shelf, NO extra depth block, NO wood console, NO retro CRT box under the screen, NO duplicate bottom bezel.
4. Screen: analog CRT static — flat, even gray-white snow and fine scanlines across the entire glass. NO dark corner vignette, NO radial gradient, NO burned-in frame around the static.
5. Hand: paste lounge-tv-remote-hand.png exactly at bottom center — same crop, proportions, and remote as the asset; finger on power. Do not redraw or replace with a different hand.`;

/** Start of close — same composition as open END. */
export const LOUNGE_TV_SEEDANCE_CLOSE_START_FRAME_REMOTE = LOUNGE_TV_SEEDANCE_OPEN_END_FRAME_REMOTE;

/** End of close — same as open START. */
export const LOUNGE_TV_SEEDANCE_CLOSE_END_FRAME_REMOTE = LOUNGE_TV_SEEDANCE_OPEN_START_FRAME_REMOTE;

export const LOUNGE_TV_SEEDANCE_OPEN_PROMPT = `Image-to-video using two locked reference photos — NOT text-to-image. The first frame must match the uploaded lounge page photo exactly. The last frame must match the uploaded theater END composite exactly (built from real assets per recipe: black void, white lounge curtains, scaled flatscreen TV, bundled hand PNG, flat CRT static).

WHAT THE START PHOTO SHOWS (lounge page): photoreal Build-a-Wig lounge — smooth true-red matte walls, tall flat off-white ceiling, white marble floor with grey veining, white curved sofa, glass coffee table with wine and roses, sheer WHITE / off-white translucent curtains at the left window (still open along the left edge), clear pedestal with flowers. Center wall: one modest charcoal-black flatscreen TV, OFF — dark gray-black glass with subtle reflection, small on the wall. No human hand, no closed curtains across the TV, no CRT static, no menus or text.

WHAT THE END PHOTO SHOWS (cinema overlay — NOT the full lounge): a dark home-theater view. The entire boutique room is concealed: sofa, chairs, marble, ceiling, red walls, and pedestal are NOT visible — only pure black darkness behind the drapes. Two panels of closed SHEER WHITE / off-white lounge curtains (same material as the left drapes in the START photo, NOT gray theater velvet) fill the frame left and right; they meet at a straight vertical center seam with a narrow shadow only (no gap, no black slit). Between the curtains: one large front-facing flatscreen TV — the same model as START, only scaled larger toward the viewer. Charcoal bezel stays thin and modern: one bottom chin, no added base, no second horizontal lip, no retro TV cabinet, no boxy depth under the screen. Glass shows CRT static only: uniform gray-white snow and scanlines edge-to-edge, evenly lit — NO corner vignette, NO darkened edges, NO UI, NO text. Bottom center: the exact bundled hand-and-remote asset (lounge-tv-remote-hand.png) — do not substitute a different hand, skin tone, or remote. Finger presses power. Warm soft light; curtains may glow slightly where sheer.

ANIMATION STYLE (open, ~4–5 seconds, ease-in-out): single fixed camera. (1) The lounge dims to black as the same sheer WHITE curtain panels from the left window sweep inward from off-screen left and right, closing over the hidden room until the boutique is completely covered — furniture and architecture never remain visible; only black behind the white drapes. (2) The wall TV scales up smoothly toward the viewer, centered between the closing white curtains, until it matches END size — bezel design unchanged, no new base or CRT box appearing during the grow. (3) The bundled hand + remote rises from the bottom into the exact END position; one power press. (4) Screen flashes once, then even flat CRT static (no vignette). Hold END composition 0.5s. No whole-room zoom, no shake, no morphing furniture, no gray curtains, no visible lounge props at the end.`;

export const LOUNGE_TV_SEEDANCE_CLOSE_PROMPT = `Image-to-video using two locked reference photos — NOT text-to-image. FIRST frame = theater END composite (black void, closed white lounge curtains, large flatscreen, bundled hand PNG). LAST frame = lounge page with small TV exactly.

WHAT THE START PHOTO SHOWS: black theater background; closed sheer WHITE / off-white lounge curtain pair; large flat charcoal flatscreen (thin bezel only, no retro base); exact lounge-tv-remote-hand.png at bottom center; screen black or mid power-off (no app UI).

WHAT THE END PHOTO SHOWS: full lounge composite — small OFF TV on red wall, open sheer white left curtains, sofa, table, roses, pedestal, marble. No hand, no static, no black theater void, no closed drapes across the TV.

ANIMATION STYLE (close, ~3–4 seconds, ease-in-out) — reverse of open, camera locked: (1) Hand on bundled remote — power press; fast CRT shutdown zap (horizontal bright line collapsing to black), not static snow. (2) Hand exits downward with the same asset, unchanged. (3) TV scales down to small wall size without gaining a double bezel or console base. (4) White lounge curtains open outward, revealing the lounge END frame as the room returns from black — gray theater curtains must not appear. End exactly on the uploaded lounge photo.`;

export const LOUNGE_TV_SEEDANCE_OPEN_NEGATIVE = `text to image, t2i, generating new room from scratch, ignoring start frame, ignoring end frame, wrong lounge photo, wrong end frame, gray curtains, gray velvet theater curtains, charcoal drapes, medium-gray curtains, lounge-curtain-left gray panels, red walls visible at end, marble floor visible at end, sofa visible, salon chairs visible, ceiling visible at end, pedestal visible, furniture not hidden, open curtains at end, closed white curtains at start, TV same size in both frames, TV with extra bottom base, double bezel, second chin, retro CRT box, wood console under TV, tube TV cabinet, deep TV stand, missing hand at end, wrong hand, different remote, generic hand, hand visible at start, YouTube UI, Netflix UI, app interface, readable text, logos, watermarks, thumbnails on screen, bright picture on TV instead of static, static with dark corner vignette, radial vignette on screen, burned edges on static, cartoon, low quality, fisheye, dutch angle, camera pan, camera zoom, rolling shutter, strobing, glitch, black void between curtain panels, neon curtains, red theater curtains, extra TVs, duplicate hands, face visible, zoom on whole room, morphing sofa, warped walls`;

export const LOUNGE_TV_SEEDANCE_CLOSE_NEGATIVE = `${LOUNGE_TV_SEEDANCE_OPEN_NEGATIVE}, static snow on screen at end, large TV at end, hand at end, curtains closed at end, gray curtains, visible furniture at end, no power-off zap, slow fade to black only, menu UI on screen`;

export const LOUNGE_TV_SEEDANCE_OPEN_COPY_BLOCK = `[SEEDANCE 2 — LOUNGE TV OPEN — IMAGE-TO-VIDEO, NOT T2I]
${LOUNGE_TV_SEEDANCE_SETTINGS_NOTE}

START FRAME (lounge page, small TV): ${LOUNGE_TV_SEEDANCE_OPEN_START_FRAME_REMOTE}

END FRAME (theater composite — build before upload): ${LOUNGE_TV_SEEDANCE_OPEN_END_FRAME_REMOTE || '(export still per END FRAME RECIPE below)'}

HAND REFERENCE (upload if Seedance has a reference slot): ${LOUNGE_TV_SEEDANCE_REF_HAND_REMOTE}

END FRAME RECIPE:
${LOUNGE_TV_SEEDANCE_OPEN_END_FRAME_RECIPE}

PROMPT:
${LOUNGE_TV_SEEDANCE_OPEN_PROMPT}

NEGATIVE:
${LOUNGE_TV_SEEDANCE_OPEN_NEGATIVE}`;

export const LOUNGE_TV_SEEDANCE_CLOSE_COPY_BLOCK = `[SEEDANCE 2 — LOUNGE TV CLOSE — IMAGE-TO-VIDEO, NOT T2I]
${LOUNGE_TV_SEEDANCE_SETTINGS_NOTE}

START FRAME (theater composite): ${LOUNGE_TV_SEEDANCE_CLOSE_START_FRAME_REMOTE || '(same built END frame as OPEN)'}

END FRAME (lounge page, small TV): ${LOUNGE_TV_SEEDANCE_CLOSE_END_FRAME_REMOTE}

HAND REFERENCE: ${LOUNGE_TV_SEEDANCE_REF_HAND_REMOTE}

PROMPT:
${LOUNGE_TV_SEEDANCE_CLOSE_PROMPT}

NEGATIVE:
${LOUNGE_TV_SEEDANCE_CLOSE_NEGATIVE}`;
