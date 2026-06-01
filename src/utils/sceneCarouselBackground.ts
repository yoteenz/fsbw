import type React from 'react';

/** Shared lobby + lounge slide art (`landing-background.png`, `landing2-background.png`). */
export const SCENE_CAROUSEL_BG_WIDTH = 3072;
export const SCENE_CAROUSEL_BG_HEIGHT = 5504;

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
export function sceneCarouselBackgroundLayerStyle(backgroundSrc: string): React.CSSProperties {
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
    backgroundPosition: 'center top',
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#ffffff',
  };
}
