/** Fal-generated theater curtains for lounge TV overlay (also in `public/assets/`). */
export const LOUNGE_CURTAIN_LEFT_SRC = '/assets/lounge-curtain-left.jpeg';
export const LOUNGE_CURTAIN_RIGHT_SRC = '/assets/lounge-curtain-right.jpeg';

/** Chroma-keyed hand + remote (bottom of lounge TV overlay). */
export const LOUNGE_TV_REMOTE_HAND_SRC = '/assets/lounge-tv-remote-hand.png';

/** End-of-open still — TV bezel + theater frame for overlay menu (`Final LP/ChatGPT Image…`). */
export const LOUNGE_TV_CONTENT_FRAME_ASSET_VERSION = 'final-lp-tv-frame-jun2';

export const LOUNGE_TV_CONTENT_FRAME_SRC_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Final%20LP/ChatGPT%20Image%20Jun%202,%202026%20at%2006_28_39%20PM.png';

export const LOUNGE_TV_CONTENT_FRAME_SRC = `/assets/lounge-tv-content-frame.png?v=${LOUNGE_TV_CONTENT_FRAME_ASSET_VERSION}`;

export const LOUNGE_TV_CONTENT_FRAME_PX = { width: 940, height: 1672 } as const;

export const LOUNGE_TV_CONTENT_FRAME_ASPECT =
  LOUNGE_TV_CONTENT_FRAME_PX.width / LOUNGE_TV_CONTENT_FRAME_PX.height;

/** TV glass inset on end-still PNG (px). */
export const LOUNGE_TV_CONTENT_FRAME_SCREEN_INSET_PX = {
  left: 75,
  top: 133,
  right: 863,
  bottom: 918,
} as const;

/**
 * Menu / static / video inset height vs measured glass (1 − 0.35 = 65% after new TV bezel).
 * Centered in the original glass box on {@link LOUNGE_TV_CONTENT_FRAME_SRC}.
 */
export const LOUNGE_TV_CONTENT_SCREEN_HEIGHT_SCALE = 0.65;

/** Wall-mounted TV glass on {@link LOUNGE_TV_CONTENT_FRAME_SRC} (normalized 0–1). */
export const LOUNGE_TV_CONTENT_FRAME_SCREEN_RECT = (() => {
  const { width: W, height: H } = LOUNGE_TV_CONTENT_FRAME_PX;
  const { left, top, right, bottom } = LOUNGE_TV_CONTENT_FRAME_SCREEN_INSET_PX;
  const fullH = bottom - top;
  const h = fullH * LOUNGE_TV_CONTENT_SCREEN_HEIGHT_SCALE;
  const centerY = top + fullH / 2;
  const newTop = centerY - h / 2;
  return {
    left: left / W,
    top: newTop / H,
    width: (right - left) / W,
    height: h / H,
  };
})();

/** @deprecated Full-frame bezel chip — close uses {@link LOUNGE_TV_CONTENT_SCREEN_CLOSE_INSET_*_PX} on glass rect. */
export const LOUNGE_TV_CONTENT_FRAME_CLOSE_ANCHOR = {
  top: 118 / LOUNGE_TV_CONTENT_FRAME_PX.height,
  right: 62 / LOUNGE_TV_CONTENT_FRAME_PX.width,
} as const;

/** Close X inset from top-right of mapped TV glass / content ({@link LoungeTvFullscreenShell}). */
export const LOUNGE_TV_CONTENT_SCREEN_CLOSE_INSET_TOP_PX = 8;
export const LOUNGE_TV_CONTENT_SCREEN_CLOSE_INSET_RIGHT_PX = 8;

/**
 * End-still PNG (`lounge-tv-content-frame.png`) after Seedance open — {@link LoungeTvFullscreenShell} only.
 * Positive X = right, positive Y = down. Tune independently from screen inset.
 */
export const LOUNGE_TV_CONTENT_FRAME_STILL_OFFSET_X_PX = 1;
export const LOUNGE_TV_CONTENT_FRAME_STILL_OFFSET_Y_PX = 13;

/**
 * TV glass + menu/static/video — {@link LoungeTvFullscreenShell} mapped screen inset only.
 * Scale and Y offset apply in tandem on the screen box (`transformOrigin: center top`).
 */
export const LOUNGE_TV_CONTENT_SCREEN_SCALE: number = 0.97;

/** Positive = down (applied with {@link LOUNGE_TV_CONTENT_SCREEN_SCALE}). */
export const LOUNGE_TV_CONTENT_SCREEN_OFFSET_Y_PX = 140;

/** @deprecated Use {@link LOUNGE_TV_CONTENT_FRAME_STILL_OFFSET_Y_PX} + {@link LOUNGE_TV_CONTENT_SCREEN_OFFSET_Y_PX}. */
export const LOUNGE_TV_CONTENT_FRAME_LAYER_OFFSET_Y_PX = LOUNGE_TV_CONTENT_FRAME_STILL_OFFSET_Y_PX;

/** Bump when replacing `public/assets/lounge-tv-design.png` (`npm run lounge:bake-tv-design`). */
export const LOUNGE_TV_DESIGN_ASSET_VERSION = 'kv6DR-v2';

export const LOUNGE_TV_DESIGN_SRC_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/kv6DR-SLYFfBb8V4UPFOr_WHgmeCou.jpeg';

/** Full TV bezel + off screen PNG; lounge slide renders this image (play overlay on top). */
export const LOUNGE_TV_DESIGN_SRC = `/assets/lounge-tv-design.png?v=${LOUNGE_TV_DESIGN_ASSET_VERSION}`;

/** Pixel size of bundled `lounge-tv-design.png` (keep in sync after re-bake). */
export const LOUNGE_TV_DESIGN_PX = { width: 820, height: 631 } as const;

/** Full-frame aspect (width ÷ height). */
export const LOUNGE_TV_DESIGN_ASPECT =
  LOUNGE_TV_DESIGN_PX.width / LOUNGE_TV_DESIGN_PX.height;

/**
 * Dark glass region inside `lounge-tv-design.png` (normalized 0–1).
 * Measured from baked asset; used to inset overlay UI on the PNG bezel.
 */
export const LOUNGE_TV_DESIGN_SCREEN_RECT = {
  left: 2 / LOUNGE_TV_DESIGN_PX.width,
  top: 1 / LOUNGE_TV_DESIGN_PX.height,
  width: (818 - 2) / LOUNGE_TV_DESIGN_PX.width,
  height: (528 - 1) / LOUNGE_TV_DESIGN_PX.height,
} as const;

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
