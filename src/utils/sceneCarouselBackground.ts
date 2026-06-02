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

/** Carousel slide wrapper — tall enough for horizontal swipe parity; scene paints in viewport stage. */
export function sceneSlideShellStyle(): React.CSSProperties {
  return {
    position: 'relative',
    width: '100vw',
    flexShrink: 0,
    minHeight: sceneCarouselSlideMinHeightCss(),
    overflow: 'visible',
    backgroundColor: '#ffffff',
  };
}

export type SceneCarouselBackgroundLayerOptions = {
  /** e.g. `center top` (lobby) or {@link loungeSceneBackgroundPositionY} (lounge crown align). */
  backgroundPosition?: string;
};

/** Fixed scene box — what the user sees in the `100dvh` scroll shell (cover math uses this). */
export function sceneCarouselViewportStageStyle(): React.CSSProperties {
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100dvh',
    overflow: 'hidden',
    isolation: 'isolate',
  };
}

export function sceneCarouselViewportBackgroundStyle(
  backgroundSrc: string,
  options?: SceneCarouselBackgroundLayerOptions,
): React.CSSProperties {
  return {
    position: 'absolute',
    inset: 0,
    backgroundImage: `url(${backgroundSrc})`,
    backgroundSize: 'cover',
    backgroundPosition: options?.backgroundPosition ?? 'center top',
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#ffffff',
  };
}

/** Cover hit-map fallback — viewport size only (not full art-height slide). */
export function defaultSceneSlideMetricsFromViewport(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: SCENE_CAROUSEL_BG_WIDTH, height: SCENE_CAROUSEL_BG_HEIGHT };
  }
  const width = window.innerWidth;
  const height = window.visualViewport?.height ?? window.innerHeight;
  return { width, height };
}

/**
 * Full-bleed scene background on the tall slide shell.
 * Prefer {@link sceneCarouselViewportBackgroundStyle} inside {@link sceneCarouselViewportStageStyle}.
 */
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
