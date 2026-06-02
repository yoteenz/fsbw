import type React from 'react';

import {
  FINAL_SCENE_ART_HEIGHT,
  FINAL_SCENE_ART_WIDTH,
} from '../constants/finalLobbySceneAssets';

/** Shared lobby + lounge slide art (`final-lobby.png`, `final-lounge.png`). */
export const SCENE_CAROUSEL_BG_WIDTH = FINAL_SCENE_ART_WIDTH;
export const SCENE_CAROUSEL_BG_HEIGHT = FINAL_SCENE_ART_HEIGHT;

/** @deprecated Final LP composites share geometry — both slides use `center top`. */
export const LOBBY_SCENE_BG_CROWN_Y_PX = 0;
export const LOUNGE_SCENE_BG_CROWN_Y_PX = 0;

/** @deprecated */
export function loungeSceneBackgroundPositionY(): string {
  return 'center top';
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
