/** Seedance 2 (ByteDance) — horizontal lobby → lounge room transition for `/lobby` carousel. */
export const LOBBY_LOUNGE_SEEDANCE_MODEL = 'seedance-2';

/** First frame — lobby (`landing-background.png` source). */
export const LOBBY_LOUNGE_SEEDANCE_START_FRAME_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/L3uOngFGJQ2LEM5npshed_sBBjoS6l.jpeg';

/** Last frame — lounge (`landing2-background.png` source). */
export const LOBBY_LOUNGE_SEEDANCE_END_FRAME_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/reC-MSzGPYe2PUbnVanQN_Kmj5vXBq.jpeg';

/**
 * NOT text-to-image. Use Seedance image-to-video / first-last-frame mode only.
 */
export const LOBBY_LOUNGE_SEEDANCE_SETTINGS_NOTE =
  'MODE: Image-to-video (NOT text-to-image). Upload your lobby photo as the FIRST / START frame and your lounge photo as the LAST / END frame — do not leave either slot empty. Lock first frame and lock last frame. Aspect 9:16 portrait. Duration 2–3s. Motion strength medium-low. The model must interpolate between the two photos; do not generate a new room from text alone.';

/** Motion-only prompt — scene content comes from the uploaded start/end photos. */
export const LOBBY_LOUNGE_SEEDANCE_TRANSITION_PROMPT = `Image-to-video between two locked reference photos. First frame = uploaded lobby image (exact pixels at start). Last frame = uploaded lounge image (exact pixels at end). Do not text-to-image a new interior.

Animate only the transition: smooth horizontal camera pan / dolly to the right, 2–3 seconds, ease-in-out. Interpolate naturally from the lobby photo into the lounge photo. Keep the marble floor horizon perfectly level with zero vertical drift. Keep the ceiling crown line level — no ceiling drop, no tilt. Same camera height and focal length throughout. No zoom, no roll, no whip-pan.

Preserve photoreal quality from the source photos. No people, no added text or logos. Do not redesign walls, furniture, or trim — only morph what is already in the two uploaded images.`;

export const LOBBY_LOUNGE_SEEDANCE_TRANSITION_NEGATIVE = `text to image, t2i, generating new room, ignoring reference frames, wrong start frame, wrong end frame, vertical camera shake, tilted horizon, floor line jumping, ceiling dropping, crown molding misaligned, morphing marble pattern, warped walls, fisheye, zoom, dutch angle, people, faces, hands, random new furniture, glitch, strobing, cartoon, low quality`;

/** Full copy block for Seedance UI or DOWNLOAD tooltip. */
export const LOBBY_LOUNGE_SEEDANCE_COPY_BLOCK = `[SEEDANCE 2 — IMAGE-TO-VIDEO, NOT T2I] ${LOBBY_LOUNGE_SEEDANCE_SETTINGS_NOTE}

START FRAME (upload this lobby photo): ${LOBBY_LOUNGE_SEEDANCE_START_FRAME_REMOTE}

END FRAME (upload this lounge photo): ${LOBBY_LOUNGE_SEEDANCE_END_FRAME_REMOTE}

PROMPT (motion only — scenes come from your two photos): ${LOBBY_LOUNGE_SEEDANCE_TRANSITION_PROMPT}

NEGATIVE: ${LOBBY_LOUNGE_SEEDANCE_TRANSITION_NEGATIVE}`;
