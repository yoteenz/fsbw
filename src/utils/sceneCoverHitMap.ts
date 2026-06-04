import type { FinalSceneHitRect } from '../constants/finalLobbySceneAssets';
import {
  SCENE_CAROUSEL_BG_HEIGHT,
  SCENE_CAROUSEL_BG_WIDTH,
} from './sceneCarouselBackground';

/**
 * Map a hit rect in normalized **source image** space (0–1) to normalized **container** space
 * when the image is painted with `background-size: cover` + `background-position: center top`
 * (same as lobby/lounge slides and transition video `object-fit: cover`).
 */
export function mapImageRectToCoverContainer(
  rect: FinalSceneHitRect,
  containerWidth: number,
  containerHeight: number,
  imageWidth: number = SCENE_CAROUSEL_BG_WIDTH,
  imageHeight: number = SCENE_CAROUSEL_BG_HEIGHT,
): FinalSceneHitRect {
  if (containerWidth <= 0 || containerHeight <= 0) return rect;

  const scale = Math.max(containerWidth / imageWidth, containerHeight / imageHeight);
  const renderedW = imageWidth * scale;
  const offsetX = (containerWidth - renderedW) / 2;
  const offsetY = 0;

  const x = offsetX + rect.left * imageWidth * scale;
  const y = offsetY + rect.top * imageHeight * scale;
  const w = rect.width * imageWidth * scale;
  const h = rect.height * imageHeight * scale;

  return {
    left: x / containerWidth,
    top: y / containerHeight,
    width: w / containerWidth,
    height: h / containerHeight,
  };
}

/** Map a normalized point on the source image into cover-container space (0–1). */
export function mapImagePointToCoverContainer(
  point: { x: number; y: number },
  containerWidth: number,
  containerHeight: number,
  imageWidth: number = SCENE_CAROUSEL_BG_WIDTH,
  imageHeight: number = SCENE_CAROUSEL_BG_HEIGHT,
): { left: number; top: number } {
  if (containerWidth <= 0 || containerHeight <= 0) {
    return { left: point.x, top: point.y };
  }

  const scale = Math.max(containerWidth / imageWidth, containerHeight / imageHeight);
  const renderedW = imageWidth * scale;
  const offsetX = (containerWidth - renderedW) / 2;
  const offsetY = 0;

  const x = offsetX + point.x * imageWidth * scale;
  const y = offsetY + point.y * imageHeight * scale;

  return { left: x / containerWidth, top: y / containerHeight };
}

/** Position a cover-mapped rect with a reliable screen-pixel nudge on the container box. */
export function coverMappedRectScreenOffsetStyle(
  rect: FinalSceneHitRect,
  offsetXPx: number,
  offsetYPx: number,
): {
  left: string;
  top: string;
  width: string;
  height: string;
} {
  return {
    left: `calc(${rect.left * 100}% + ${offsetXPx}px)`,
    top: `calc(${rect.top * 100}% + ${offsetYPx}px)`,
    width: `${rect.width * 100}%`,
    height: `${rect.height * 100}%`,
  };
}

/** Nudge a cover-mapped rect by screen pixels (stable across resize when container size is known). */
export function applyScreenOffsetToCoverRect(
  rect: FinalSceneHitRect,
  containerWidth: number,
  containerHeight: number,
  offsetXPx: number,
  offsetYPx: number,
): FinalSceneHitRect {
  if (containerWidth <= 0 || containerHeight <= 0) return rect;
  return {
    left: rect.left + offsetXPx / containerWidth,
    top: rect.top + offsetYPx / containerHeight,
    width: rect.width,
    height: rect.height,
  };
}
