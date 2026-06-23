import { useEffect, useState } from 'react';
import { isDesktopPreviewActive, isMobileDesktopBypassActive } from '../utils/desktopPreview';

const ARTBOARD_SELECTOR = '.desktop-artboard-stage';

/** Live phone `/desktop/*` scaled artboard — not the `/desktop-preview` designer tool. */
export function isPhoneDesktopArtboardActive(): boolean {
  return isMobileDesktopBypassActive() && !isDesktopPreviewActive();
}

/**
 * Portal target for overlays that must live inside the scaled 1920×1080 stage
 * (so `position: fixed` + % sizing resolve to the artboard, not the device viewport).
 */
export function useDesktopArtboardPortalTarget(): HTMLElement | null {
  const [useArtboard, setUseArtboard] = useState(isPhoneDesktopArtboardActive);
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const syncMode = () => setUseArtboard(isPhoneDesktopArtboardActive());
    syncMode();
    window.addEventListener('resize', syncMode);
    return () => window.removeEventListener('resize', syncMode);
  }, []);

  useEffect(() => {
    if (!useArtboard) {
      setTarget(null);
      return undefined;
    }

    const syncTarget = () => {
      setTarget(document.querySelector<HTMLElement>(ARTBOARD_SELECTOR));
    };

    syncTarget();

    const observer = new MutationObserver(syncTarget);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', syncTarget);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncTarget);
    };
  }, [useArtboard]);

  return useArtboard ? target : null;
}
