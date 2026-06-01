import type React from 'react';

/** Shared lobby + lounge slide art (`landing-background.png`, `landing2-background.png`). */
export const SCENE_CAROUSEL_BG_WIDTH = 3072;
export const SCENE_CAROUSEL_BG_HEIGHT = 5504;

/**
 * Crown molding row (center column sample on bundled PNGs). Used to align lounge under `cover`.
 * Re-measure after replacing either background asset.
 */
export const LOBBY_SCENE_BG_CROWN_Y_PX = 275;
export const LOUNGE_SCENE_BG_CROWN_Y_PX = 604;

export const LOBBY_SCENE_BG_CROWN_Y_RATIO = LOBBY_SCENE_BG_CROWN_Y_PX / SCENE_CAROUSEL_BG_HEIGHT;
export const LOUNGE_SCENE_BG_CROWN_Y_RATIO = LOUNGE_SCENE_BG_CROWN_Y_PX / SCENE_CAROUSEL_BG_HEIGHT;

/** Negative Y shifts lounge art up so crown meets lobby on carousel swipe (tune after new PNGs). */
export function loungeSceneBackgroundPositionY(): string {
  const deltaRatio = LOUNGE_SCENE_BG_CROWN_Y_RATIO - LOBBY_SCENE_BG_CROWN_Y_RATIO;
  return `calc(0% - ${(deltaRatio * 100).toFixed(2)}%)`;
}

/** Rendered height when background is `background-size: 100% auto` (no crop). */
export function sceneCarouselBackgroundArtHeightCss(): string {
  return `calc(100vw * ${SCENE_CAROUSEL_BG_HEIGHT} / ${SCENE_CAROUSEL_BG_WIDTH})`;
}

/** Slide/page shell — at least one viewport tall and full uncropped art height. */
export function sceneCarouselSlideMinHeightCss(): string {
  return `max(100dvh, ${sceneCarouselBackgroundArtHeightCss()})`;
}

/**
 * Full-bleed scene background for lobby/lounge carousel slides.
 * `cover` + top anchor fills the viewport (no ceiling/floor letterbox gaps) while
 * keeping both slides on the same scale/anchor for horizontal swipe alignment.
 */
export type SceneCarouselBackgroundLayerOptions = {
  /** e.g. `center top` (lobby) or {@link loungeSceneBackgroundPositionY} (lounge crown align). */
  backgroundPosition?: string;
};

export function sceneCarouselBackgroundLayerStyle(
  backgroundSrc: string,
  options?: SceneCarouselBackgroundLayerOptions
): React.CSSProperties {
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    minHeight: '100dvh',
    height: sceneCarouselSlideMinHeightCss(),
    backgroundImage: `url(${backgroundSrc})`,
    backgroundSize: 'cover',
    backgroundPosition: options?.backgroundPosition ?? 'center top',
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#ffffff',
  };
}
