import { useSyncExternalStore, type ReactNode } from 'react';
import { Site00DesktopArtboardShell } from './Site00DesktopArtboardShell';
import {
  getSite00OriginWideViewportSnapshot,
  SITE00_ORIGIN_DESKTOP_BREAKPOINT_PX,
  subscribeSite00OriginWideViewport,
} from './site00OriginViewport';

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
  const wideViewport = useSyncExternalStore(
    subscribeSite00OriginWideViewport,
    getSite00OriginWideViewportSnapshot,
    () => false,
  );

  const useArtboard = forceArtboard || wideViewport;

  if (useArtboard) {
    return <Site00DesktopArtboardShell>{children}</Site00DesktopArtboardShell>;
  }

  return <>{children}</>;
}

export { SITE00_ORIGIN_DESKTOP_BREAKPOINT_PX };
