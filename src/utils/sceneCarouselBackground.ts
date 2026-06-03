import type React from 'react';

import {
  FINAL_SCENE_ART_HEIGHT,
  FINAL_SCENE_ART_WIDTH,
} from '../constants/finalLobbySceneAssets';

/** Shared lobby + lounge slide art (`final-lobby.png`, `final-lounge.png`). */
export const SCENE_CAROUSEL_BG_WIDTH = FINAL_SCENE_ART_WIDTH;
export const SCENE_CAROUSEL_BG_HEIGHT = FINAL_SCENE_ART_HEIGHT;

/** Contain anchor for lobby, lounge, and Seedance transition — top-aligned with slide art. */
export function sceneCarouselCoverBackgroundPosition(): string {
  return 'center top';
}

/** `contain` + `center top` metrics for a viewport box (matches slide + transition overlay). */
export function sceneCarouselCoverMetrics(
  containerWidth: number,
  containerHeight: number,
): { scale: number; renderedWidth: number; renderedHeight: number } {
  if (containerWidth <= 0 || containerHeight <= 0) {
    return { scale: 1, renderedWidth: containerWidth, renderedHeight: containerHeight };
  }
  const scale = Math.min(
    containerWidth / SCENE_CAROUSEL_BG_WIDTH,
    containerHeight / SCENE_CAROUSEL_BG_HEIGHT,
  );
  return {
    scale,
    renderedWidth: SCENE_CAROUSEL_BG_WIDTH * scale,
    renderedHeight: SCENE_CAROUSEL_BG_HEIGHT * scale,
  };
}

/** @deprecated Final LP composites share geometry — both slides use {@link sceneCarouselCoverBackgroundPosition}. */
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

/** Carousel slides — one viewport tall (no extra shell height that shows white below the scene). */
export function sceneCarouselSlideMinHeightCss(): string {
  return '100dvh';
}

/** Carousel slide wrapper — matches visible lobby scrollport (`100dvh`). */
export function sceneSlideShellStyle(): React.CSSProperties {
  return {
    position: 'relative',
    width: '100vw',
    flexShrink: 0,
    minHeight: sceneCarouselSlideMinHeightCss(),
    height: sceneCarouselSlideMinHeightCss(),
    overflow: 'hidden',
    backgroundColor: '#e8e4e0',
  };
}

export type SceneCarouselBackgroundLayerOptions = {
  /** e.g. `center top` (lobby) or {@link loungeSceneBackgroundPositionY} (lounge crown align). */
  backgroundPosition?: string;
};

/** Scene box — fills the slide shell (`100dvh`); contain math uses this size. */
export function sceneCarouselViewportStageStyle(): React.CSSProperties {
  return {
    position: 'absolute',
    inset: 0,
    width: '100%',
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
    backgroundSize: 'contain',
    backgroundPosition: options?.backgroundPosition ?? sceneCarouselCoverBackgroundPosition(),
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#e8e4e0',
  };
}

/** Contain hit-map fallback — viewport size only (not full art-height slide). */
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
    backgroundSize: 'contain',
    backgroundPosition: options?.backgroundPosition ?? sceneCarouselCoverBackgroundPosition(),
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#e8e4e0',
  };
}
