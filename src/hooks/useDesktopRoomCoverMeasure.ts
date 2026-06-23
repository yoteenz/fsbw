import { useLayoutEffect, useState, type RefObject } from 'react';

export function measureDesktopRoomCoverBox(el: HTMLElement | null): { width: number; height: number } {
  if (!el) return { width: 0, height: 0 };
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  if (width > 0 && height > 0) return { width, height };
  const rect = el.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    return { width: rect.width, height: rect.height };
  }
  return { width: 0, height: 0 };
}

export type DesktopRoomCoverMeasure = {
  width: number;
  height: number;
  /** True once the scene layer has a non-zero layout size. */
  isMeasured: boolean;
};

/** Live width/height of the desktop room scene layer (matches cover background box). */
export function useDesktopRoomCoverMeasure(
  measureRef: RefObject<HTMLElement | null>,
): DesktopRoomCoverMeasure {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    let ro: ResizeObserver | null = null;
    let raf = 0;

    const update = () => {
      const next = measureDesktopRoomCoverBox(measureRef.current);
      if (next.width <= 0 || next.height <= 0) return;
      setSize((prev) =>
        prev.width === next.width && prev.height === next.height ? prev : next,
      );
    };

    const attach = () => {
      const el = measureRef.current;
      if (!el) return false;
      update();
      ro?.disconnect();
      ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
      ro?.observe(el);
      return true;
    };

    update();
    if (!attach()) {
      raf = requestAnimationFrame(() => attach());
    }

    window.addEventListener('resize', update);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [measureRef]);

  return {
    ...size,
    isMeasured: size.width > 0 && size.height > 0,
  };
}
