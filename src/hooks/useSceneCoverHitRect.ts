import { useLayoutEffect, useState, type RefObject } from 'react';
import type { FinalSceneHitRect } from '../constants/finalLobbySceneAssets';
import { defaultSceneSlideMetricsFromViewport } from '../utils/sceneCarouselBackground';
import { mapImageRectToCoverContainer } from '../utils/sceneCoverHitMap';

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
): FinalSceneHitRect | null {
  const [containerRect, setContainerRect] = useState<FinalSceneHitRect | null>(() => {
    const { width, height } = defaultSceneSlideMetricsFromViewport();
    return mapImageRectToCoverContainer(imageRect, width, height);
  });

  useLayoutEffect(() => {
    const el = measureRef.current;

    const update = () => {
      const { width, height } = measureSlideBox(el);
      setContainerRect(mapImageRectToCoverContainer(imageRect, width, height));
    };

    update();
    const observer = new ResizeObserver(update);
    if (el) observer.observe(el);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [measureRef, imageRect.left, imageRect.top, imageRect.width, imageRect.height]);

  return containerRect;
}
