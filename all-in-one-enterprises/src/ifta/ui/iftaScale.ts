import { useEffect, useLayoutEffect, useState } from 'react';

/**
 * Authority scaling. Each IFTA surface is laid out in authority pixels: 1rem = 10 px of the approved screen it
 * reproduces (desktop 1440 · client / public tablet 834 · staff tablet 1024 · phone 402), so the live page is the
 * authority composition at any width inside a band. The root font-size per band lives in ifta-ui.css.
 */
export type IftaBand = 'mobile' | 'tablet' | 'desktop';

export const IFTA_BAND_QUERY = { desktop: '(min-width: 1200px)', tablet: '(min-width: 700px)' } as const;

function readBand(): IftaBand {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'desktop';
  if (window.matchMedia(IFTA_BAND_QUERY.desktop).matches) return 'desktop';
  if (window.matchMedia(IFTA_BAND_QUERY.tablet).matches) return 'tablet';
  return 'mobile';
}

/** The authority band for the current viewport (desktop ≥ 1200 · tablet 700–1199 · mobile < 700). */
export function useIftaBand(): IftaBand {
  const [band, setBand] = useState<IftaBand>(readBand);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const queries = [window.matchMedia(IFTA_BAND_QUERY.desktop), window.matchMedia(IFTA_BAND_QUERY.tablet)];
    const update = () => setBand(readBand());
    queries.forEach((q) => q.addEventListener('change', update));
    update();
    return () => queries.forEach((q) => q.removeEventListener('change', update));
  }, []);
  return band;
}

/** Puts the document on the actor's authority scale while the surface is mounted. */
export function useIftaAuthorityScale(actor: 'client' | 'staff' | 'public') {
  useLayoutEffect(() => {
    const html = document.documentElement;
    html.classList.add('ifta-scaled', `ifta-scaled--${actor}`);
    return () => html.classList.remove('ifta-scaled', `ifta-scaled--${actor}`);
  }, [actor]);
}
