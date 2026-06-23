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

/** Live width/height of the desktop room scene layer (matches cover background box). */
export function useDesktopRoomCoverMeasure(
  measureRef: RefObject<HTMLElement | null>,
): { width: number; height: number } {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    let ro: ResizeObserver | null = null;

    const update = () => {
      const next = measureDesktopRoomCoverBox(measureRef.current);
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

    if (!attach()) {
      const raf = requestAnimationFrame(() => attach());
      window.addEventListener('resize', update);
      return () => {
        cancelAnimationFrame(raf);
        ro?.disconnect();
        window.removeEventListener('resize', update);
      };
    }

    window.addEventListener('resize', update);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [measureRef]);

  return size;
}
