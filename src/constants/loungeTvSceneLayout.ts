import type { FinalSceneHitRect } from './finalLobbySceneAssets';
import {
  LOUNGE_TV_CONTENT_FRAME_PX,
  LOUNGE_TV_CONTENT_FRAME_SCREEN_RECT,
  LOUNGE_TV_CONTENT_FRAME_STILL_OFFSET_X_PX,
  LOUNGE_TV_CONTENT_FRAME_STILL_OFFSET_Y_PX,
  LOUNGE_TV_CONTENT_SCREEN_OFFSET_Y_PX,
  LOUNGE_TV_CONTENT_SCREEN_SCALE,
} from '../components/lounge/loungeTvAssets';

/** Scale a normalized rect from the top center (matches former `transformOrigin: center top`). */
export function scaleSceneRectFromTopCenter(
  rect: FinalSceneHitRect,
  scale: number,
): FinalSceneHitRect {
  if (scale === 1) return rect;
  const width = rect.width * scale;
  const height = rect.height * scale;
  return {
    left: rect.left + (rect.width - width) / 2,
    top: rect.top,
    width,
    height,
  };
}

/**
 * TV glass on the theater end-still (`lounge-tv-content-frame.png`), normalized 0–1.
 * Mapped with {@link LOUNGE_TV_MENU_SCREEN_IMAGE} on the lounge scene viewport (`cover` + `center top`).
 */
export const LOUNGE_TV_MENU_SCREEN_RECT = scaleSceneRectFromTopCenter(
  LOUNGE_TV_CONTENT_FRAME_SCREEN_RECT,
  LOUNGE_TV_CONTENT_SCREEN_SCALE,
);

export const LOUNGE_TV_MENU_SCREEN_IMAGE = LOUNGE_TV_CONTENT_FRAME_PX;

/** Fine-tune after cover map — same px nudge as legacy fullscreen shell. */
export const LOUNGE_TV_MENU_SCREEN_OFFSET = {
  x: 0,
  y: LOUNGE_TV_CONTENT_SCREEN_OFFSET_Y_PX,
} as const;

/** Production + QA — magenta TV content glass. */
export const LOUNGE_TV_MENU_SCREEN_LAYOUT = {
  layoutWidthExtraPx: 2,
  layoutHeightExtraPx: 8,
  layoutOffsetY: -10,
} as const;

/** Close chip inset as a fraction of the glass box (negative = overlap bezel). */
export const LOUNGE_TV_MENU_CLOSE_INSET_TOP_RATIO = -0.04;
export const LOUNGE_TV_MENU_CLOSE_INSET_RIGHT_RATIO = -0.04;
/** Extra px nudge after play — down / left from ratio anchor. */
export const LOUNGE_TV_MENU_CLOSE_INSET_TOP_PX = 4;
export const LOUNGE_TV_MENU_CLOSE_INSET_RIGHT_PX = 4;

/** End-still PNG nudge on the scene box (fraction of mapped viewport). */
export const LOUNGE_TV_MENU_FRAME_STILL_OFFSET_RATIO = {
  x: LOUNGE_TV_CONTENT_FRAME_STILL_OFFSET_X_PX / LOUNGE_TV_CONTENT_FRAME_PX.width,
  y: LOUNGE_TV_CONTENT_FRAME_STILL_OFFSET_Y_PX / LOUNGE_TV_CONTENT_FRAME_PX.height,
} as const;
