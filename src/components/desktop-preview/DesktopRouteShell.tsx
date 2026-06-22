import { useSyncExternalStore, type ReactNode } from 'react';
import { isDesktopPreviewActive, isMobileDesktopBypassActive } from '../../utils/desktopPreview';
import { ScaledDesktopViewport } from './ScaledDesktopViewport';

function subscribe(onChange: () => void): () => void {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
}

function getScaledShellSnapshot(): boolean {
  return isMobileDesktopBypassActive() && !isDesktopPreviewActive();
}

/**
 * On phone `/desktop/*`, scale the fixed 1920×1080 artboard to fit the screen
 * (same model as `/desktop-preview`) instead of a raw width=1920 viewport crop.
 */
export function DesktopRouteShell({ children }: { children: ReactNode }) {
  const useScaledShell = useSyncExternalStore(subscribe, getScaledShellSnapshot, () => false);

  if (useScaledShell) {
    return <ScaledDesktopViewport>{children}</ScaledDesktopViewport>;
  }

  return <>{children}</>;
}
