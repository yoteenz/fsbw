import { useLayoutEffect, useState, type RefObject } from 'react';
import type { FinalSceneHitRect } from '../constants/finalLobbySceneAssets';
import {
  defaultSceneSlideMetricsFromViewport,
  SCENE_CAROUSEL_BG_HEIGHT,
  SCENE_CAROUSEL_BG_WIDTH,
} from '../utils/sceneCarouselBackground';
import { applyScreenOffsetToCoverRect, mapImageRectToCoverContainer } from '../utils/sceneCoverHitMap';

export type SceneCoverHitRectOffset = { x: number; y: number };

export type SceneCoverImageSpace = {
  width: number;
  height: number;
};

function mapCoverHitRect(
  imageRect: FinalSceneHitRect,
  width: number,
  height: number,
  offset?: SceneCoverHitRectOffset,
  image?: SceneCoverImageSpace,
): FinalSceneHitRect {
  let rect = mapImageRectToCoverContainer(
    imageRect,
    width,
    height,
    image?.width ?? SCENE_CAROUSEL_BG_WIDTH,
    image?.height ?? SCENE_CAROUSEL_BG_HEIGHT,
  );
  if (offset) {
    rect = applyScreenOffsetToCoverRect(rect, width, height, offset.x, offset.y);
  }
  return rect;
}

function measureSlideBox(el: HTMLElement | null): { width: number; height: number } {
  if (!el) return defaultSceneSlideMetricsFromViewport();
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  if (width > 0 && height > 0) return { width, height };
  const rect = el.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) return { width: rect.width, height: rect.height };
  return defaultSceneSlideMetricsFromViewport();
}

/**
 * Map an image-normalized hit rect onto a slide that uses `cover` + `center top` backgrounds.
 * Uses viewport metrics when the measure node has no box yet (absolute-only slide shells).
 */
export function useSceneCoverHitRect(
  imageRect: FinalSceneHitRect,
  measureRef: RefObject<HTMLElement | null>,
  offset?: SceneCoverHitRectOffset,
  image?: SceneCoverImageSpace,
): FinalSceneHitRect | null {
  const [containerRect, setContainerRect] = useState<FinalSceneHitRect | null>(() => {
    const { width, height } = defaultSceneSlideMetricsFromViewport();
    return mapCoverHitRect(imageRect, width, height, offset, image);
  });

  useLayoutEffect(() => {
    const el = measureRef.current;

    const update = () => {
      const { width, height } = measureSlideBox(el);
      setContainerRect(mapCoverHitRect(imageRect, width, height, offset, image));
    };

    update();
    const observer = new ResizeObserver(update);
    if (el) observer.observe(el);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [
    measureRef,
    imageRect.left,
    imageRect.top,
    imageRect.width,
    imageRect.height,
    offset?.x,
    offset?.y,
    image?.width,
    image?.height,
  ]);

  return containerRect;
}
