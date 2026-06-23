import { useLayoutEffect, useState, type RefObject } from 'react';
import type { FinalSceneHitRect } from '../constants/finalLobbySceneAssets';
import { mapImageRectToCoverContainerCenter } from '../utils/sceneCoverHitMap';

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

function mapRoomHeroHitRect(
  imageRect: FinalSceneHitRect,
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number,
): FinalSceneHitRect {
  return mapImageRectToCoverContainerCenter(
    imageRect,
    containerWidth,
    containerHeight,
    imageWidth,
    imageHeight,
  );
}

export type DesktopViewportScreenHitRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function screenRectsEqual(
  a: DesktopViewportScreenHitRect | null,
  b: DesktopViewportScreenHitRect,
): boolean {
  if (a === b) return true;
  if (!a) return false;
  return a.left === b.left && a.top === b.top && a.width === b.width && a.height === b.height;
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
      const node = measureRef.current;
      if (!node) {
        setContainerRect(null);
        return;
      }
      const { width, height } = measureSlideBox(node);
      if (width <= 0 || height <= 0) {
        setContainerRect(null);
        return;
      }
      const next = mapRoomHeroHitRect(imageRect, width, height, imageWidth, imageHeight);
      setContainerRect((prev) => (coverRectsEqual(prev, next) ? prev : next));
    };

    update();
    const observer = new ResizeObserver(update);
    if (el) observer.observe(el);
    window.addEventListener('resize', update);
    document.addEventListener('scroll', update, true);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
      document.removeEventListener('scroll', update, true);
    };
  }, [imageRect.left, imageRect.top, imageRect.width, imageRect.height, imageWidth, imageHeight]);

  return containerRect;
}

/**
 * Map image-space hit rects to viewport pixels — survives scaled artboard transforms
 * when portaled to `document.body`.
 */
export function useDesktopViewportScreenHitRect(
  imageRect: FinalSceneHitRect,
  measureRef: RefObject<HTMLElement | null>,
  imageWidth: number,
  imageHeight: number,
): DesktopViewportScreenHitRect | null {
  const [screenRect, setScreenRect] = useState<DesktopViewportScreenHitRect | null>(null);

  useLayoutEffect(() => {
    const el = measureRef.current;

    const update = () => {
      const node = measureRef.current;
      if (!node) {
        setScreenRect(null);
        return;
      }
      const { width, height } = measureSlideBox(node);
      if (width <= 0 || height <= 0) {
        setScreenRect(null);
        return;
      }
      const normalized = mapRoomHeroHitRect(imageRect, width, height, imageWidth, imageHeight);
      const bounds = node.getBoundingClientRect();
      const next: DesktopViewportScreenHitRect = {
        left: bounds.left + normalized.left * bounds.width,
        top: bounds.top + normalized.top * bounds.height,
        width: normalized.width * bounds.width,
        height: normalized.height * bounds.height,
      };
      setScreenRect((prev) => (screenRectsEqual(prev, next) ? prev : next));
    };

    update();
    const observer = new ResizeObserver(update);
    if (el) observer.observe(el);
    window.addEventListener('resize', update);

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    document.addEventListener('scroll', onScroll, true);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
      document.removeEventListener('scroll', onScroll, true);
      cancelAnimationFrame(raf);
    };
  }, [imageRect.left, imageRect.top, imageRect.width, imageRect.height, imageWidth, imageHeight]);

  return screenRect;
}
