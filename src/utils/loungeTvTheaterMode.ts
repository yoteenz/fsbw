/** Lounge TV theater overlay — hide chrome (e.g. PSA FAB) while open or closing. */
export const LOUNGE_TV_THEATER_MODE_CHANGED_EVENT = 'loungeTvTheaterModeChanged';

let theaterActive = false;

export function isLoungeTvTheaterModeActive(): boolean {
  return theaterActive;
}

export function setLoungeTvTheaterMode(active: boolean): void {
  if (theaterActive === active) return;
  theaterActive = active;
  window.dispatchEvent(
    new CustomEvent(LOUNGE_TV_THEATER_MODE_CHANGED_EVENT, { detail: active })
  );
}
