import { useEffect, useRef } from 'react';
import { restoreLoungeTvFocusWithRetry } from '../components/lounge/loungeTvFocusMemory';

type UseLoungeTvFocusNavOptions = {
  enabled?: boolean;
  onEscape?: () => void;
  onHome?: () => void;
  containerRef?: React.RefObject<HTMLElement | null>;
  restoreFocusId?: string | null;
  /** Re-run focus restore when navigation layer changes (e.g. slay-tip → browse). */
  restoreTrigger?: string;
};

const FOCUSABLE =
  '[data-lounge-tv-focusable]:not([disabled]), [data-lounge-tv-tab]:not([disabled])';

function isVisible(el: HTMLElement): boolean {
  return el.offsetParent !== null || el.getClientRects().length > 0;
}

function railIdFor(el: HTMLElement): string {
  const rail = el.closest<HTMLElement>('[data-lounge-tv-rail]');
  return rail?.dataset.loungeTvRail ?? 'default';
}

function focusablesInRail(root: ParentNode, rail: string): HTMLElement[] {
  const railEl = root.querySelector<HTMLElement>(`[data-lounge-tv-rail="${CSS.escape(rail)}"]`);
  if (!railEl) return [];
  return Array.from(railEl.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(isVisible);
}

function allRails(root: ParentNode): string[] {
  const ids: string[] = [];
  root.querySelectorAll<HTMLElement>('[data-lounge-tv-rail]').forEach((el) => {
    const id = el.dataset.loungeTvRail;
    if (id && !ids.includes(id)) ids.push(id);
  });
  return ids.sort((a, b) => {
    const ra = root.querySelector<HTMLElement>(`[data-lounge-tv-rail="${CSS.escape(a)}"]`);
    const rb = root.querySelector<HTMLElement>(`[data-lounge-tv-rail="${CSS.escape(b)}"]`);
    return (ra?.getBoundingClientRect().top ?? 0) - (rb?.getBoundingClientRect().top ?? 0);
  });
}

function scrollIntoRailView(el: HTMLElement): void {
  el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  const rail = el.closest<HTMLElement>('[data-lounge-tv-rail]');
  const scroller = rail?.querySelector<HTMLElement>('[data-lounge-tv-rail-scroll]') ?? rail;
  if (scroller && scroller !== el) {
    const style = getComputedStyle(scroller);
    const canScrollX =
      (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
      scroller.scrollWidth > scroller.clientWidth + 1;
    if (!canScrollX) return;
    const er = el.getBoundingClientRect();
    const sr = scroller.getBoundingClientRect();
    if (er.left < sr.left) scroller.scrollLeft -= sr.left - er.left + 16;
    if (er.right > sr.right) scroller.scrollLeft += er.right - sr.right + 16;
  }
}

export function useLoungeTvFocusNav({
  enabled = true,
  onEscape,
  onHome,
  containerRef,
  restoreFocusId,
  restoreTrigger,
}: UseLoungeTvFocusNavOptions) {
  const onEscapeRef = useRef(onEscape);
  const onHomeRef = useRef(onHome);
  onEscapeRef.current = onEscape;
  onHomeRef.current = onHome;

  useEffect(() => {
    if (!enabled || !restoreFocusId) return;
    const root = containerRef?.current ?? document;
    return restoreLoungeTvFocusWithRetry(root, restoreFocusId);
  }, [enabled, restoreFocusId, restoreTrigger, containerRef]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        onEscapeRef.current?.();
        return;
      }

      if (e.key === 'Home') {
        onHomeRef.current?.();
        return;
      }

      const root = containerRef?.current ?? document;
      const active = document.activeElement as HTMLElement | null;
      const rails = allRails(root);
      if (!rails.length) return;

      const currentRail = active ? railIdFor(active) : rails[0];
      const railFocusables = focusablesInRail(root, currentRail);
      const idx = active ? railFocusables.indexOf(active) : -1;

      const moveHorizontal = (dir: 1 | -1) => {
        if (!railFocusables.length) return;
        e.preventDefault();
        const next =
          idx === -1
            ? dir > 0
              ? 0
              : railFocusables.length - 1
            : (idx + dir + railFocusables.length) % railFocusables.length;
        const el = railFocusables[next];
        el?.focus();
        scrollIntoRailView(el);
      };

      const moveVertical = (dir: 1 | -1) => {
        const railIndex = rails.indexOf(currentRail);
        if (railIndex === -1) return;
        const nextRailIndex = railIndex + dir;
        if (nextRailIndex < 0 || nextRailIndex >= rails.length) return;
        e.preventDefault();
        const nextRail = rails[nextRailIndex];
        const nextFocusables = focusablesInRail(root, nextRail);
        if (!nextFocusables.length) return;
        const targetIdx = idx >= 0 ? Math.min(idx, nextFocusables.length - 1) : 0;
        const el = nextFocusables[targetIdx];
        el?.focus();
        scrollIntoRailView(el);
      };

      if (e.key === 'ArrowRight') moveHorizontal(1);
      else if (e.key === 'ArrowLeft') moveHorizontal(-1);
      else if (e.key === 'ArrowDown') moveVertical(1);
      else if (e.key === 'ArrowUp') moveVertical(-1);
      else if (e.key === 'Enter' && active?.matches(FOCUSABLE)) {
        e.preventDefault();
        active.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, containerRef]);
}
