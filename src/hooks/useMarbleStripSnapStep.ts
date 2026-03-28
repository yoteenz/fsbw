import { useCallback, useLayoutEffect, useState } from 'react';

function fallbackStripWidth(): number {
  if (typeof window === 'undefined') return 320;
  return Math.max(200, window.innerWidth - 32);
}

/**
 * Measured horizontal snap distance (px) for marble carousels (similar products, recently viewed).
 * Matches the overflow viewport's clientWidth so arrow / drag snap aligns with the strip, same as shop UNITS.
 */
export function useMarbleStripSnapStep(): [number, (el: HTMLDivElement | null) => void] {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [snapPx, setSnapPx] = useState(fallbackStripWidth);

  useLayoutEffect(() => {
    if (!node) return;
    const measure = () => {
      const w = node.clientWidth;
      if (w > 0) setSnapPx(w);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, [node]);

  const setRef = useCallback((el: HTMLDivElement | null) => {
    setNode(el);
  }, []);

  return [Math.max(200, snapPx), setRef];
}
