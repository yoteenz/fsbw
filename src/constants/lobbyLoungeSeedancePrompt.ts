/** Seedance 2 (ByteDance) — horizontal lobby → lounge room transition for `/lobby` carousel. */
export const LOBBY_LOUNGE_SEEDANCE_MODEL = 'seedance-2';

/** First frame — lobby (`landing-background.png` source). */
export const LOBBY_LOUNGE_SEEDANCE_START_FRAME_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/L3uOngFGJQ2LEM5npshed_sBBjoS6l.jpeg';

/** Last frame — lounge (`landing2-background.png` source). */
export const LOBBY_LOUNGE_SEEDANCE_END_FRAME_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/reC-MSzGPYe2PUbnVanQN_Kmj5vXBq.jpeg';

/** Recommended: 9:16 vertical, 2–3s, image-to-video with start + end frame locked. */
export const LOBBY_LOUNGE_SEEDANCE_SETTINGS_NOTE =
  'Upload START = lobby JPEG, END = lounge JPEG. Aspect 9:16 (portrait). Duration 2–3s. Lock first/last frame if available. Motion strength medium-low so architecture stays stable.';

export const LOBBY_LOUNGE_SEEDANCE_TRANSITION_PROMPT = `Smooth horizontal camera pan to the right through a luxury wig boutique interior, seamless room transition for a mobile app carousel.

START FRAME (lobby): photoreal boutique lobby — center vertical wall of dense true-red and white roses with soft backlight, smooth burgundy side walls, thick white two-ridge architectural baseboard on white marble floor with grey veining, tall flat off-white ceiling with single white crown molding line, glass display case and neon accents softly glowing. No people.

END FRAME (lounge): same camera height and lens — lounge with smooth true-red matte walls, tall flat off-white ceiling at the identical crown-molding height as the lobby (no coffered ceiling panel, no second ceiling band), same marble floor horizon and two-ridge baseboard profile, white curved sofa, glass coffee table with wine bottle and roses, sheer white curtains at left, clear pedestal with flowers, center area open for TV. No people.

MOTION: continuous sideways dolly/pan right, 2–3 seconds, ease-in-out, no zoom, no roll, no whip-pan. Floor line and ceiling crown line stay perfectly level and locked — zero vertical drift. Walls and trim morph continuously; furniture cross-fades naturally as the pan reveals the lounge. Lighting stays warm boutique soft, photoreal, cinematic, stable exposure, no flicker, no text, no logos added.`;

export const LOBBY_LOUNGE_SEEDANCE_TRANSITION_NEGATIVE = `vertical camera shake, tilted horizon, floor line jumping, ceiling dropping, crown molding misaligned, coffered ceiling, ceiling soffit panel, three baseboard ridges, morphing marble pattern, warped walls, fisheye, zoom, dutch angle, people, faces, hands, new furniture popping in, glitch, strobing, cartoon, low quality`;

/** Full copy block for Seedance UI or DOWNLOAD tooltip. */
export const LOBBY_LOUNGE_SEEDANCE_COPY_BLOCK = `[SEEDANCE 2] ${LOBBY_LOUNGE_SEEDANCE_SETTINGS_NOTE}

START: ${LOBBY_LOUNGE_SEEDANCE_START_FRAME_REMOTE}

END: ${LOBBY_LOUNGE_SEEDANCE_END_FRAME_REMOTE}

PROMPT: ${LOBBY_LOUNGE_SEEDANCE_TRANSITION_PROMPT}

NEGATIVE: ${LOBBY_LOUNGE_SEEDANCE_TRANSITION_NEGATIVE}`;
