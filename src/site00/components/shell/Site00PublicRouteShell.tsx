import { useSyncExternalStore, type ReactNode } from 'react';
import { Site00DesktopArtboardShell } from './Site00DesktopArtboardShell';
import {
  getSite00OriginWideViewportSnapshot,
  subscribeSite00OriginWideViewport,
} from './site00OriginViewport';
import { Site00PublicWideDesktopRedirect } from './Site00PublicWideDesktopRedirect';
import { Site00PublicLayoutSwitch } from './Site00PublicLayoutSwitch';

type Site00PublicRouteShellProps = {
  children: ReactNode;
  /** Desktop artboard routes (path suffix /desktop) — always use fixed 1440px artboard. */
  forceArtboard?: boolean;
};

/**
 * Public Composer pages — canonical desktop = 1440px artboard (≥768px), same as Origin.
 */
export function Site00PublicRouteShell({ children, forceArtboard = false }: Site00PublicRouteShellProps) {
  const wideViewport = useSyncExternalStore(
    subscribeSite00OriginWideViewport,
    getSite00OriginWideViewportSnapshot,
    () => false,
  );

  const useArtboard = forceArtboard || wideViewport;

  return (
    <>
      <Site00PublicWideDesktopRedirect />
      <Site00PublicLayoutSwitch />
      {useArtboard ? (
        <Site00DesktopArtboardShell>{children}</Site00DesktopArtboardShell>
      ) : (
        children
      )}
    </>
  );
}
