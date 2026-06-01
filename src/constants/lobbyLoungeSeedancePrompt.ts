/** Seedance 2 (ByteDance) — horizontal lobby → lounge room transition for `/lobby` carousel. */
export const LOBBY_LOUNGE_SEEDANCE_MODEL = 'seedance-2';

/** First frame — lobby (`landing-background.png` source). */
export const LOBBY_LOUNGE_SEEDANCE_START_FRAME_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/dmdfZH_WdaOAJqCFVHi7K_jiWmVT0U.jpeg';

/** Last frame — lounge (`landing2-background.png` source). */
export const LOBBY_LOUNGE_SEEDANCE_END_FRAME_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/reC-MSzGPYe2PUbnVanQN_Kmj5vXBq.jpeg';

/**
 * NOT text-to-image. Use Seedance image-to-video / first-last-frame mode only.
 */
export const LOBBY_LOUNGE_SEEDANCE_SETTINGS_NOTE =
  'MODE: Image-to-video (NOT text-to-image). Upload your lobby photo as FIRST / START frame and your lounge photo as LAST / END frame. Lock both frames. Aspect 9:16 portrait. Duration 2–3s. Motion strength medium-low. Interpolate between the two photos — do not generate a new room from text alone.';

/**
 * Describes what is IN each uploaded photo and how to animate between them (carousel pan).
 */
export const LOBBY_LOUNGE_SEEDANCE_TRANSITION_PROMPT = `Image-to-video using two locked reference photos — NOT text-to-image. The first frame must match the uploaded lobby photo exactly; the last frame must match the uploaded lounge photo exactly.

WHAT THE START PHOTO SHOWS (lobby): photoreal boutique lobby — center vertical wall of dense true-red and white roses with soft backlight, smooth burgundy/red side walls, thick white two-ridge architectural baseboard on white marble floor with grey veining, tall flat off-white ceiling with a single white crown molding line, glass display case and neon accents. No people.

WHAT THE END PHOTO SHOWS (lounge): same camera height and lens — smooth true-red matte walls, tall flat off-white ceiling at the same crown-molding height as the lobby (no coffered ceiling panel, no second ceiling band), same marble floor horizon and two-ridge baseboard, white curved sofa, glass coffee table with wine and roses, sheer white curtains at left, clear pedestal with flowers, center open for TV. No people.

ANIMATION STYLE BETWEEN THE TWO PHOTOS: smooth horizontal camera pan / dolly to the right through the boutique, as if swiping the mobile app carousel from lobby into lounge — 2–3 seconds, ease-in-out. Continuous sideways motion only: no zoom, no roll, no whip-pan. Floor line and ceiling crown line stay perfectly level with zero vertical drift — marble horizon and trim must stay aligned like a seamless room transition. Walls, ceiling, and baseboard morph continuously from lobby composition into lounge composition; furniture and props cross-fade naturally as the pan reveals the sofa, table, curtains, and pedestal. Warm boutique soft lighting, photoreal, cinematic, stable exposure, no flicker. Do not redesign the rooms — only animate the in-between motion from photo A to photo B. No added text or logos.`;

export const LOBBY_LOUNGE_SEEDANCE_TRANSITION_NEGATIVE = `text to image, t2i, generating new room from scratch, ignoring start frame, ignoring end frame, wrong lobby photo, wrong lounge photo, vertical camera shake, tilted horizon, floor line jumping, ceiling dropping, crown molding misaligned, coffered ceiling, ceiling soffit panel, three baseboard ridges, morphing marble pattern, warped walls, fisheye, zoom, dutch angle, people, faces, hands, random new furniture popping in, glitch, strobing, cartoon, low quality`;

/** Full copy block for Seedance UI or DOWNLOAD tooltip. */
export const LOBBY_LOUNGE_SEEDANCE_COPY_BLOCK = `[SEEDANCE 2 — IMAGE-TO-VIDEO, NOT T2I] ${LOBBY_LOUNGE_SEEDANCE_SETTINGS_NOTE}

START FRAME (upload lobby photo): ${LOBBY_LOUNGE_SEEDANCE_START_FRAME_REMOTE}

END FRAME (upload lounge photo): ${LOBBY_LOUNGE_SEEDANCE_END_FRAME_REMOTE}

PROMPT: ${LOBBY_LOUNGE_SEEDANCE_TRANSITION_PROMPT}

NEGATIVE: ${LOBBY_LOUNGE_SEEDANCE_TRANSITION_NEGATIVE}`;
