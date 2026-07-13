import { useCallback, useEffect, useState } from 'react';
import {
  ELAB_V2_LAYOUT,
  type ElabBreakpoint,
  type ElabFocusMode,
  resolveElabBreakpoint,
} from './experience-lab-v2-layout';

type OverlayKey = 'status' | 'blockers' | 'inspector' | 'tools' | 'governance' | 'diagnostics' | null;

export function useExperienceLabAppShell() {
  const [breakpoint, setBreakpoint] = useState<ElabBreakpoint>(() =>
    typeof window !== 'undefined' ? resolveElabBreakpoint(window.innerWidth) : 'desktop'
  );
  const [focusMode, setFocusMode] = useState<ElabFocusMode>('none');
  const [overlay, setOverlay] = useState<OverlayKey>(null);

  useEffect(() => {
    const onResize = () => setBreakpoint(resolveElabBreakpoint(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const body = document.body;
    body.classList.add(ELAB_V2_LAYOUT.routeBodyClass);
    const portal = document.querySelector('.gb-immersive-portal') as HTMLElement | null;
    if (portal) portal.setAttribute(ELAB_V2_LAYOUT.portalDataAttr, 'true');
    return () => {
      body.classList.remove(ELAB_V2_LAYOUT.routeBodyClass);
      if (portal) portal.removeAttribute(ELAB_V2_LAYOUT.portalDataAttr);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (overlay) {
        setOverlay(null);
        return;
      }
      if (focusMode !== 'none') setFocusMode('none');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [overlay, focusMode]);

  const closeOverlay = useCallback(() => setOverlay(null), []);
  const toggleOverlay = useCallback((key: NonNullable<OverlayKey>) => {
    setOverlay((prev) => (prev === key ? null : key));
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isCompact: breakpoint === 'mobile' || breakpoint === 'tablet',
    focusMode,
    setFocusMode,
    overlay,
    setOverlay,
    closeOverlay,
    toggleOverlay,
  };
}
