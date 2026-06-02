import { useLayoutEffect, useState, type RefObject } from 'react';
import type { FinalSceneHitRect } from '../constants/finalLobbySceneAssets';
import { mapImageRectToCoverContainer } from '../utils/sceneCoverHitMap';

/**
 * Re-map an image-normalized hit rect onto a slide that uses `cover` + `center top` backgrounds.
 */
export function useSceneCoverHitRect(
  imageRect: FinalSceneHitRect,
  containerRef: RefObject<HTMLElement | null>,
): FinalSceneHitRect {
  const [containerRect, setContainerRect] = useState(imageRect);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setContainerRect(mapImageRectToCoverContainer(imageRect, width, height));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [containerRef, imageRect]);

  return containerRect;
}
