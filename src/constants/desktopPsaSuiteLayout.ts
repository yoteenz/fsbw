import type { FinalSceneHitRect } from './finalLobbySceneAssets';
import {
  DESKTOP_ROOM_HERO_ART_HEIGHT,
  DESKTOP_ROOM_HERO_ART_WIDTH,
} from './desktopRoomHeroArt';

/** PSA Suite NO TEXT BG hero — shared 1915×821 art with all desktop room heroes. */
export const DESKTOP_PSA_SUITE_ART_WIDTH = DESKTOP_ROOM_HERO_ART_WIDTH;
export const DESKTOP_PSA_SUITE_ART_HEIGHT = DESKTOP_ROOM_HERO_ART_HEIGHT;

/**
 * Standing hologram hit region on PSA Suite hero (image-normalized 0–1).
 * Tuned to legacy CSS: centered, ~bottom 18%, stage ~9.5vw × 24vh.
 */
export const DESKTOP_PSA_SUITE_HOLOGRAM_HIT_REGION: FinalSceneHitRect = {
  left: 0.4,
  top: 0.48,
  width: 0.2,
  height: 0.42,
};

export const DESKTOP_PSA_SUITE_HOLOGRAM_FRAME_LAYOUT = {
  layoutOffsetX: 0,
  layoutOffsetY: -40,
  layoutWidthExtraPx: 0,
  layoutHeightExtraPx: 0,
} as const;

export const DESKTOP_PSA_SUITE_HOLOGRAM_SCREEN_OFFSET_X_PX = 0;
export const DESKTOP_PSA_SUITE_HOLOGRAM_SCREEN_OFFSET_Y_PX = 0;
