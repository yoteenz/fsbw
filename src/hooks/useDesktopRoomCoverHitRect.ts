import { useLayoutEffect, useState, type RefObject } from 'react';
import type { FinalSceneHitRect } from '../constants/finalLobbySceneAssets';
import {
  mapImageRectToContainContainerCenter,
  mapImageRectToCoverContainerCenter,
} from '../utils/sceneCoverHitMap';
import { isDesktopArtboardLayoutActive } from '../utils/desktopPreview';

function coverRectsEqual(a: FinalSceneHitRect | null, b: FinalSceneHitRect): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.left === b.left && a.top === b.top && a.width === b.width && a.height === b.height
  );
}

function measureSlideBox(el: HTMLElement | null): { width: number; height: number } {
  if (!el) return { width: 0, height: 0 };
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  if (width > 0 && height > 0) return { width, height };
  const rect = el.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
}

/** Map image-space hit rects onto desktop room heroes (`cover` + `center center`). */
export function useDesktopRoomCoverHitRect(
  imageRect: FinalSceneHitRect,
  measureRef: RefObject<HTMLElement | null>,
  imageWidth: number,
  imageHeight: number,
): FinalSceneHitRect | null {
  const [containerRect, setContainerRect] = useState<FinalSceneHitRect | null>(null);

  useLayoutEffect(() => {
    const el = measureRef.current;

    const update = () => {
      const { width, height } = measureSlideBox(el);
      if (width <= 0 || height <= 0) {
        setContainerRect(null);
        return;
      }
      const next = (isDesktopArtboardLayoutActive()
        ? mapImageRectToContainContainerCenter
        : mapImageRectToCoverContainerCenter)(
        imageRect,
        width,
        height,
        imageWidth,
        imageHeight,
      );
      setContainerRect((prev) => (coverRectsEqual(prev, next) ? prev : next));
    };

    update();
    const observer = new ResizeObserver(update);
    if (el) observer.observe(el);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [imageRect.left, imageRect.top, imageRect.width, imageRect.height, imageWidth, imageHeight]);

  return containerRect;
}
