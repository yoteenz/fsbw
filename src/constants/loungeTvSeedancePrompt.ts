/**
 * Seedance 2.0 (ByteDance) — lounge TV open / close overlay sequences.
 * Matches `LoungeTvOverlay.tsx` choreography (grow, curtains, hand, static, zap, shrink).
 */

import {
  FINAL_LOUNGE_BACKGROUND_SRC_REMOTE,
} from './finalLobbySceneAssets';

export const LOUNGE_TV_SEEDANCE_MODEL = 'seedance-2';

/** Canonical hand + remote description (matches lounge-tv-remote-hand source photo). */
export const LOUNGE_TV_SEEDANCE_HAND_DESCRIPTION = `At the bottom center of the frame: a photoreal right hand in three-quarter view from the lower right, medium-to-tan warm skin tone. Nails are long stiletto/almond acrylics in burnt orange / reddish-orange with intricate white and cream paisley or bandana swirl patterns; small silver rhinestone clusters sit near the cuticles on the thumb, ring finger, and pinky. The index finger wears a wide silver eternity band ring paved with small clear stones. The hand holds a slim matte-black TV remote with rounded corners: a small circular bright-red power button with a white power symbol at the top-left, a large circular directional pad in the center (thumb resting on or just above the UP arrow), and smaller white icons for menu, back, home, and mute. One finger presses or taps the red power button. No face, no second hand, no green-screen spill — hand and remote are cleanly integrated against the dark theater background below the TV.`;

/**
 * NOT text-to-image. Use Seedance image-to-video / first-last-frame mode only.
 */
export const LOUNGE_TV_SEEDANCE_SETTINGS_NOTE = `MODE: Image-to-video (NOT text-to-image). Upload START frame (final-lounge.png / small TV) and lock it. Upload or let Seedance infer END frame from the prompt below — lock END if your tool allows a still. Aspect 9:16 portrait (928×1680). Duration 4–5s open, 3–4s close. Motion strength medium-low. Camera locked — no pan, zoom, or roll.

CURTAINS: use the SHEER WHITE / off-white window drapes from the lounge START photo (left edge of final-lounge.png) — NOT gray theater velvet. Mirror the same fabric for left and right panels.

THEATER BACKGROUND: solid black void behind the curtains — hide sofa, chairs, marble, ceiling, red walls, and pedestal completely at the END of open.

HAND: describe exactly using the HAND block in the prompt — do not substitute a generic hand, bare nails, or a different remote.`;

/** Lounge slide before play — baked composite, small wall TV, curtains open, no hand. */
export const LOUNGE_TV_SEEDANCE_OPEN_START_FRAME_REMOTE = FINAL_LOUNGE_BACKGROUND_SRC_REMOTE;

/** Optional END still URL after upload (not required if prompt-driven END is used). */
export const LOUNGE_TV_SEEDANCE_OPEN_END_FRAME_REMOTE = '';

/** Start of close — same composition as open END. */
export const LOUNGE_TV_SEEDANCE_CLOSE_START_FRAME_REMOTE = LOUNGE_TV_SEEDANCE_OPEN_END_FRAME_REMOTE;

/** End of close — same as open START. */
export const LOUNGE_TV_SEEDANCE_CLOSE_END_FRAME_REMOTE = LOUNGE_TV_SEEDANCE_OPEN_START_FRAME_REMOTE;

export const LOUNGE_TV_SEEDANCE_OPEN_PROMPT = `Image-to-video using two locked reference photos — NOT text-to-image. The first frame must match the uploaded lounge page photo exactly (small wall-mounted TV on the red boutique wall). The last frame must match the theater END state described below.

WHAT THE START PHOTO SHOWS (lounge page): photoreal Build-a-Wig lounge — smooth true-red matte walls, tall flat off-white ceiling, white marble floor with grey veining, white curved sofa, glass coffee table with wine and roses, sheer WHITE / off-white translucent curtains at the left window (still open along the left edge), clear pedestal with flowers. Center wall: one modest charcoal-black flatscreen TV, OFF — dark gray-black glass with subtle reflection, small on the wall. No human hand, no closed curtains across the TV, no CRT static, no on-screen menus or text.

WHAT THE END PHOTO SHOWS (cinema overlay — NOT the full lounge): a dark home-theater view. The entire boutique room is concealed: sofa, chairs, marble, ceiling, red walls, and pedestal are NOT visible — only pure black darkness behind the drapes. Two panels of closed SHEER WHITE / off-white lounge curtains (same fabric and translucency as the left window drapes in the START photo — NOT gray theater velvet) fill the frame left and right; they meet at a straight vertical center seam with a narrow shadow only (no gap, no black slit). Between the curtains: one large front-facing flatscreen TV — the same flat panel as START, only scaled larger toward the viewer. Charcoal bezel stays thin and modern: uniform thin frame on top and sides, one modest bottom chin only — NO second shelf, NO extra depth block, NO wood console, NO retro CRT box under the screen, NO duplicate bottom bezel. Glass shows CRT static only: uniform gray-white snow and fine scanlines edge-to-edge, evenly lit — NO corner vignette, NO darkened edges, NO radial gradient, NO UI, NO text.

HAND AT END (must match this exactly):
${LOUNGE_TV_SEEDANCE_HAND_DESCRIPTION}

ANIMATION STYLE (open, ~4–5 seconds, ease-in-out): single fixed camera. (1) The lounge dims to black as the same sheer WHITE curtain panels from the left window sweep inward from off-screen left and right, closing until the room is fully hidden — furniture and architecture never stay visible; only black behind the white drapes. (2) The wall TV scales up smoothly toward the viewer, centered between the closing white curtains, until it matches END size — bezel unchanged, no new base or CRT box during the grow. (3) The described hand and remote rise from the bottom into position; one press on the red power button. (4) Screen flashes once, then even flat CRT static (no vignette). Hold END composition 0.5s. No whole-room zoom, no shake, no gray curtains, no visible lounge props at the end.`;

export const LOUNGE_TV_SEEDANCE_CLOSE_PROMPT = `Image-to-video using two locked reference photos — NOT text-to-image. FIRST frame = theater END state (black void, closed white lounge curtains, large flatscreen, hand on remote as described). LAST frame = lounge page with small TV exactly.

WHAT THE START PHOTO SHOWS: black theater background; closed sheer WHITE / off-white lounge curtain pair; large flat charcoal flatscreen (thin bezel only, no retro base); CRT static off or black glass; hand and remote at bottom center:

${LOUNGE_TV_SEEDANCE_HAND_DESCRIPTION}

WHAT THE END PHOTO SHOWS: full lounge composite — small OFF TV on red wall, open sheer white left curtains, sofa, table, roses, pedestal, marble. No hand, no static, no black theater void, no closed drapes across the TV.

ANIMATION STYLE (close, ~3–4 seconds, ease-in-out) — reverse of open, camera locked: (1) The same hand — burnt-orange paisley stiletto nails, silver eternity ring, black remote — finger presses the red power button; fast CRT shutdown zap (horizontal bright line collapsing to black), not static snow. (2) Hand and remote exit downward. (3) TV scales down to small wall size without gaining a double bezel or console base. (4) White lounge curtains open outward, revealing the lounge END frame — gray theater curtains must not appear. End exactly on the uploaded lounge photo.`;

export const LOUNGE_TV_SEEDANCE_OPEN_NEGATIVE = `text to image, t2i, generating new room from scratch, ignoring start frame, ignoring end frame, wrong lounge photo, wrong end frame, gray curtains, gray velvet theater curtains, charcoal drapes, medium-gray curtains, red walls visible at end, marble floor visible at end, sofa visible, salon chairs visible, ceiling visible at end, pedestal visible, furniture not hidden, open curtains at end, closed white curtains at start, TV same size in both frames, TV with extra bottom base, double bezel, second chin, retro CRT box, wood console under TV, tube TV cabinet, deep TV stand, missing hand at end, wrong hand, male hand, glove, short nails, natural bare nails, french tips, solid color nails without paisley, blue nails, pink nails, missing rhinestones on nails, gold ring, wedding band, missing eternity ring, wrong ring finger, white remote, silver remote, chunky remote, game controller, smartphone, generic remote, missing red power button, face visible, second hand, green screen spill, chroma key green on fingers, YouTube UI, Netflix UI, app interface, readable text, logos, watermarks, thumbnails on screen, bright picture on TV instead of static, static with dark corner vignette, radial vignette on screen, cartoon, low quality, fisheye, dutch angle, camera pan, camera zoom, strobing, glitch, black void between curtain panels, neon curtains, extra TVs, duplicate hands, zoom on whole room, morphing sofa, warped walls`;

export const LOUNGE_TV_SEEDANCE_CLOSE_NEGATIVE = `${LOUNGE_TV_SEEDANCE_OPEN_NEGATIVE}, static snow on screen at end, large TV at end, hand at end, curtains closed at end, gray curtains, visible furniture at end, no power-off zap, slow fade to black only, menu UI on screen`;

export const LOUNGE_TV_SEEDANCE_OPEN_COPY_BLOCK = `[SEEDANCE 2 — LOUNGE TV OPEN — IMAGE-TO-VIDEO, NOT T2I]
${LOUNGE_TV_SEEDANCE_SETTINGS_NOTE}

START FRAME (lounge page, small TV): ${LOUNGE_TV_SEEDANCE_OPEN_START_FRAME_REMOTE}

END FRAME (optional still URL): ${LOUNGE_TV_SEEDANCE_OPEN_END_FRAME_REMOTE || '(optional — END can be prompt-only)'}

PROMPT:
${LOUNGE_TV_SEEDANCE_OPEN_PROMPT}

NEGATIVE:
${LOUNGE_TV_SEEDANCE_OPEN_NEGATIVE}`;

export const LOUNGE_TV_SEEDANCE_CLOSE_COPY_BLOCK = `[SEEDANCE 2 — LOUNGE TV CLOSE — IMAGE-TO-VIDEO, NOT T2I]
${LOUNGE_TV_SEEDANCE_SETTINGS_NOTE}

START FRAME (theater END): ${LOUNGE_TV_SEEDANCE_CLOSE_START_FRAME_REMOTE || '(prompt-driven END from open)'}

END FRAME (lounge page, small TV): ${LOUNGE_TV_SEEDANCE_CLOSE_END_FRAME_REMOTE}

PROMPT:
${LOUNGE_TV_SEEDANCE_CLOSE_PROMPT}

NEGATIVE:
${LOUNGE_TV_SEEDANCE_CLOSE_NEGATIVE}`;
