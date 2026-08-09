import { useEffect, useRef } from 'react';

type UseLoungeTvKeyboardNavOptions = {
  enabled?: boolean;
  onEscape?: () => void;
  containerRef?: React.RefObject<HTMLElement | null>;
};

const FOCUSABLE_SELECTOR =
  '[data-lounge-tv-focusable]:not([disabled]), [data-lounge-tv-tab]:not([disabled]), button[data-lounge-tv-tab]';

function getFocusables(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null || el.getClientRects().length > 0
  );
}

function spatialSort(a: HTMLElement, b: HTMLElement): number {
  const ra = a.getBoundingClientRect();
  const rb = b.getBoundingClientRect();
  const rowDiff = ra.top - rb.top;
  if (Math.abs(rowDiff) > 8) return rowDiff;
  return ra.left - rb.left;
}

export function useLoungeTvKeyboardNav({
  enabled = true,
  onEscape,
  containerRef,
}: UseLoungeTvKeyboardNavOptions) {
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        onEscapeRef.current?.();
        return;
      }

      const root = containerRef?.current ?? document;
      const focusables = getFocusables(root).sort(spatialSort);
      if (!focusables.length) return;

      const currentIdx = focusables.findIndex((el) => el === document.activeElement);
      const dir =
        e.key === 'ArrowRight' || e.key === 'ArrowDown'
          ? 1
          : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
            ? -1
            : 0;

      if (dir !== 0) {
        e.preventDefault();
        const nextIdx =
          currentIdx === -1
            ? dir > 0
              ? 0
              : focusables.length - 1
            : (currentIdx + dir + focusables.length) % focusables.length;
        focusables[nextIdx]?.focus();
        return;
      }

      if (e.key === 'Enter' && currentIdx >= 0) {
        e.preventDefault();
        focusables[currentIdx]?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, containerRef]);
}
