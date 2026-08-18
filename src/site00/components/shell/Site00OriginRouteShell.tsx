import { useEffect, useState, type ReactNode } from 'react';
import { Site00DesktopArtboardShell } from './Site00DesktopArtboardShell';

const SITE00_ORIGIN_DESKTOP_BREAKPOINT_PX = 768;

type Site00OriginRouteShellProps = {
  children: ReactNode;
  /** `/origin/desktop` — always use the fixed 1440px artboard (phone QA link). */
  forceArtboard?: boolean;
};

/**
 * Origin responsive shell — canonical desktop = 1440px artboard everywhere (≥768px).
 * Mobile (<768px): phone layout. There is no separate “native desktop” Origin CSS path.
 */
export function Site00OriginRouteShell({ children, forceArtboard = false }: Site00OriginRouteShellProps) {
  const [wideViewport, setWideViewport] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia(`(min-width: ${SITE00_ORIGIN_DESKTOP_BREAKPOINT_PX}px)`).matches
      : false,
  );

  useEffect(() => {
    if (forceArtboard) return;
    const mq = window.matchMedia(`(min-width: ${SITE00_ORIGIN_DESKTOP_BREAKPOINT_PX}px)`);
    const onChange = () => setWideViewport(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [forceArtboard]);

  const useArtboard = forceArtboard || wideViewport;

  if (useArtboard) {
    return <Site00DesktopArtboardShell>{children}</Site00DesktopArtboardShell>;
  }

  return <>{children}</>;
}
