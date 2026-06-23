import { useLayoutEffect, useState, type RefObject } from 'react';

export type ElementScreenRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function readElementScreenRect(el: HTMLElement | null): ElementScreenRect | null {
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

/** Live client rect for an element — updates on resize, scroll, and layout changes. */
export function useElementScreenRect(
  measureRef: RefObject<HTMLElement | null>,
): ElementScreenRect | null {
  const [box, setBox] = useState<ElementScreenRect | null>(() =>
    readElementScreenRect(measureRef.current),
  );

  useLayoutEffect(() => {
    const update = () => {
      const next = readElementScreenRect(measureRef.current);
      setBox((prev) => {
        if (!next) return prev;
        if (
          prev &&
          prev.left === next.left &&
          prev.top === next.top &&
          prev.width === next.width &&
          prev.height === next.height
        ) {
          return prev;
        }
        return next;
      });
    };

    update();

    const el = measureRef.current;
    let ro: ResizeObserver | null = null;
    if (el && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(update);
      ro.observe(el);
    }

    const scrollParent = el?.closest('.desktop-preview-scroll-shell');
    scrollParent?.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, { passive: true, capture: true });
    window.addEventListener('orientationchange', update);

    return () => {
      ro?.disconnect();
      scrollParent?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('orientationchange', update);
    };
  }, [measureRef]);

  return box;
}
