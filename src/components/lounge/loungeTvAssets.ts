/** Fal-generated theater curtains for lounge TV overlay (also in `public/assets/`). */
export const LOUNGE_CURTAIN_LEFT_SRC = '/assets/lounge-curtain-left.jpeg';
export const LOUNGE_CURTAIN_RIGHT_SRC = '/assets/lounge-curtain-right.jpeg';

/** Chroma-keyed hand + remote (bottom of lounge TV overlay). */
export const LOUNGE_TV_REMOTE_HAND_SRC = '/assets/lounge-tv-remote-hand.png';

/** Bump when replacing `public/assets/lounge-tv-design.png` (`npm run lounge:bake-tv-design`). */
export const LOUNGE_TV_DESIGN_ASSET_VERSION = 'kv6DR-v2';

export const LOUNGE_TV_DESIGN_SRC_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/kv6DR-SLYFfBb8V4UPFOr_WHgmeCou.jpeg';

/** Full TV bezel + off screen PNG; lounge slide renders this image (play overlay on top). */
export const LOUNGE_TV_DESIGN_SRC = `/assets/lounge-tv-design.png?v=${LOUNGE_TV_DESIGN_ASSET_VERSION}`;

/**
 * Play control anchor on `lounge-tv-design.png` (fraction of image box).
 * Glass center is above geometric center because of the bottom chin in the asset.
 */
export const LOUNGE_TV_DESIGN_PLAY_ANCHOR = { x: 0.5, y: 0.419 } as const;

/** @deprecated Black screen plate only; use {@link LOUNGE_TV_DESIGN_SRC} for TV design downloads. */
export const LOUNGE_TV_SCREEN_SRC = '/assets/tv-screen.png';

/**
 * Plucking Your Lace / TV content clip — must be a real file at
 * `public/assets/tv-content-video.mp4` (not a symlink to another shop video).
 * Cache-bust query helps browsers pick up replacements after deploy.
 */
export const LOUNGE_TV_CONTENT_VIDEO_SRC = '/assets/tv-content-video.mp4?v=tv-content-1';

export const LOUNGE_TV_PLUCKING_LACE_TILE_ID = 'plucking-lace';

/** Supabase green-screen original (for re-baking `lounge-tv-remote-hand.png`). */
export const LOUNGE_TV_REMOTE_HAND_SRC_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/wig-preview-live/Untitled%20folder/DqaxvQ6qq4XteORiCsfiW_kPRRBKiq.jpeg';

/** Supabase originals (same files as bundled assets). */
export const LOUNGE_CURTAIN_LEFT_SRC_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/wig-preview-live/Untitled%20folder/1rmzkVKNKkP6hpLD9gOVF_41oSopA5.jpeg';
export const LOUNGE_CURTAIN_RIGHT_SRC_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/wig-preview-live/Untitled%20folder/rnAnKKGlJDhcNOHJZNbRC_ftDz6eCk.jpeg';
