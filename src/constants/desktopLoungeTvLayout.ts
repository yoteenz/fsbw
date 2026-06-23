import type { FinalSceneHitRect } from './finalLobbySceneAssets';

/** TV Lounge NO TEXT BG heroes — `0VpEgtJAr…jpeg` / `A2C48719-…png` (1915×821). */
export const DESKTOP_LOUNGE_ART_WIDTH = 1915;
export const DESKTOP_LOUNGE_ART_HEIGHT = 821;

/** Wall-mounted cinema screen on desktop lounge hero (image-normalized 0–1). */
export const DESKTOP_LOUNGE_TV_HIT_REGION: FinalSceneHitRect = {
  left: 0.378,
  top: 0.14,
  width: 0.244,
  height: 0.34,
};

/** Production nudge for TV frame after cover map (`center top`). */
export const DESKTOP_LOUNGE_TV_FRAME_LAYOUT = {
  layoutOffsetX: 0,
  layoutOffsetY: 0,
  layoutWidthExtraPx: 0,
  layoutHeightExtraPx: 0,
} as const;

export const DESKTOP_LOUNGE_TV_SCREEN_OFFSET_X_PX = 0;
export const DESKTOP_LOUNGE_TV_SCREEN_OFFSET_Y_PX = 0;

/** @deprecated Play cue uses full {@link DESKTOP_LOUNGE_TV_HIT_REGION} frame. */
export const DESKTOP_LOUNGE_TV_PLAY_TAP_RECT: FinalSceneHitRect = {
  left: 0.455,
  top: 0.26,
  width: 0.09,
  height: 0.08,
};

/** @deprecated */
export const DESKTOP_LOUNGE_TV_PLAY_TAP_LAYOUT = {
  layoutOffsetX: 0,
  layoutOffsetY: 0,
  layoutWidthExtraPx: 0,
  layoutHeightExtraPx: 0,
} as const;

/** @deprecated */
export const DESKTOP_LOUNGE_TV_PLAY_SCREEN_OFFSET_X_PX = 0;
export const DESKTOP_LOUNGE_TV_PLAY_SCREEN_OFFSET_Y_PX = 0;
