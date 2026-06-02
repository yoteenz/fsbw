import { useLayoutEffect, useState, type RefObject } from 'react';
import type { FinalSceneHitRect } from '../constants/finalLobbySceneAssets';
import { mapImageRectToCoverContainer } from '../utils/sceneCoverHitMap';

/**
 * Map an image-normalized hit rect onto a slide that uses `cover` + `center top` backgrounds.
 * Returns `null` until the measure element has layout (avoids flashing wrong % from image coords).
 */
export function useSceneCoverHitRect(
  imageRect: FinalSceneHitRect,
  measureRef: RefObject<HTMLElement | null>,
): FinalSceneHitRect | null {
  const [containerRect, setContainerRect] = useState<FinalSceneHitRect | null>(null);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) {
      setContainerRect(null);
      return;
    }

    const update = () => {
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      if (width <= 0 || height <= 0) {
        setContainerRect(null);
        return;
      }
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
  }, [measureRef, imageRect.left, imageRect.top, imageRect.width, imageRect.height]);

  return containerRect;
}
