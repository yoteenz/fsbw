import { useEffect, useState } from 'react';

/** Lounge TV theater overlay — hide chrome (e.g. PSA FAB, lobby/lounge arrows) while open or closing. */
export const LOUNGE_TV_THEATER_MODE_CHANGED_EVENT = 'loungeTvTheaterModeChanged';

let theaterActive = false;

export function isLoungeTvTheaterModeActive(): boolean {
  return theaterActive;
}

export function setLoungeTvTheaterMode(active: boolean): void {
  if (theaterActive === active) return;
  theaterActive = active;
  window.dispatchEvent(
    new CustomEvent(LOUNGE_TV_THEATER_MODE_CHANGED_EVENT, { detail: active }),
  );
}

/** Subscribe to theater mode (open animation through close complete). */
export function useLoungeTvTheaterMode(): boolean {
  const [active, setActive] = useState(() => isLoungeTvTheaterModeActive());

  useEffect(() => {
    const sync = () => setActive(isLoungeTvTheaterModeActive());
    sync();
    window.addEventListener(LOUNGE_TV_THEATER_MODE_CHANGED_EVENT, sync);
    return () => window.removeEventListener(LOUNGE_TV_THEATER_MODE_CHANGED_EVENT, sync);
  }, []);

  return active;
}
