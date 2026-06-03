import type { FinalSceneHitRect } from './finalLobbySceneAssets';
import { FINAL_SCENE_ART_HEIGHT, FINAL_SCENE_ART_WIDTH } from './finalLobbySceneAssets';

const FINAL_LP_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Final%20LP';

export const FINAL_LOBBY_REGISTER_OPEN_OVERLAY_VERSION = '524y401-v1';
export const FINAL_LOBBY_PHONE_OPEN_OVERLAY_VERSION = '8f5ce48-v1';

/** Open-state cash register — aligned to baked art on `final-lobby.png` (928×1680). */
export const FINAL_LOBBY_REGISTER_OPEN_OVERLAY_SRC_REMOTE = `${FINAL_LP_BASE}/524y401iPlVoR0f6uT0OP_AvC0J19z%20(1).png`;

export const FINAL_LOBBY_REGISTER_OPEN_OVERLAY_SRC = `/assets/final-lobby-register-open.png?v=${FINAL_LOBBY_REGISTER_OPEN_OVERLAY_VERSION}`;

/** Open-state phone — aligned to baked art on `final-lobby.png`. */
export const FINAL_LOBBY_PHONE_OPEN_OVERLAY_SRC_REMOTE = `${FINAL_LP_BASE}/8f5ce48Q8jlQ2BvEy5I-m_pkBqVvGQ-1.png`;

export const FINAL_LOBBY_PHONE_OPEN_OVERLAY_SRC = `/assets/final-lobby-phone-open.png?v=${FINAL_LOBBY_PHONE_OPEN_OVERLAY_VERSION}`;

/** Native pixel size of overlay PNGs (for aspect-preserving cover-map box). */
export const FINAL_LOBBY_REGISTER_OPEN_OVERLAY_PX = { width: 1200, height: 704 } as const;
export const FINAL_LOBBY_PHONE_OPEN_OVERLAY_PX = { width: 1536, height: 1136 } as const;

/** Build normalized rect with fixed width on source art and height from asset aspect. */
function openOverlayRect(
  left: number,
  top: number,
  width: number,
  assetPx: { width: number; height: number },
): FinalSceneHitRect {
  const height =
    (width * FINAL_SCENE_ART_WIDTH) / (assetPx.width / assetPx.height) / FINAL_SCENE_ART_HEIGHT;
  return { left, top, width, height };
}

/**
 * Placement on `final-lobby.png` — tuned via template match to baked open props.
 * Mapped with `cover` + `center top` on {@link SceneCarouselViewportStage}.
 */
export const FINAL_LOBBY_REGISTER_OPEN_OVERLAY_RECT = openOverlayRect(
  0.244,
  0.714,
  0.155,
  FINAL_LOBBY_REGISTER_OPEN_OVERLAY_PX,
);

export const FINAL_LOBBY_PHONE_OPEN_OVERLAY_RECT = openOverlayRect(
  0.535,
  0.705,
  0.198,
  FINAL_LOBBY_PHONE_OPEN_OVERLAY_PX,
);
