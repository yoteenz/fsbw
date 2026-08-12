import { useEffect, useState, type RefObject } from 'react';
import { waitForPageLoadReadiness } from '../utils/pageLoadReadiness';

export type UsePageLoadGateOptions = {
  containerRef?: RefObject<HTMLElement | null>;
  imageUrls?: readonly string[];
  scanContainerImages?: boolean;
  minMs?: number;
  /** Must stay below LoadingScreen max (12s) so the gate dismisses before terminal recovery. */
  maxMs?: number;
  enabled?: boolean;
};

/** Keeps the loading GIF visible until fonts, explicit URLs, and container images settle. */
export function usePageLoadGate(options: UsePageLoadGateOptions = {}): boolean {
  const {
    containerRef,
    imageUrls,
    scanContainerImages = false,
    minMs,
    maxMs = 10_000,
    enabled = true,
  } = options;
  const [showLoading, setShowLoading] = useState(enabled);
  const imageUrlsKey = imageUrls?.join('\0') ?? '';

  useEffect(() => {
    if (!enabled) {
      setShowLoading(false);
      return;
    }

    let cancelled = false;
    setShowLoading(true);

    async function resolveContainer(): Promise<HTMLElement | null | undefined> {
      for (let i = 0; i < 60 && !cancelled; i++) {
        const el = containerRef?.current ?? document.getElementById('root');
        if (el) return el;
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      }
      return containerRef?.current ?? document.getElementById('root');
    }

    void (async () => {
      const container = await resolveContainer();
      await waitForPageLoadReadiness({ container, imageUrls, scanContainerImages, minMs, maxMs });
      if (!cancelled) setShowLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, containerRef, imageUrlsKey, scanContainerImages, minMs, maxMs]);

  return showLoading;
}
