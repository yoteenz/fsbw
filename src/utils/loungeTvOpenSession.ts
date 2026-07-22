/** Persists Lounge TV open state across refresh (tab session only). */
const LOUNGE_TV_SESSION_OPEN_KEY = 'loungeTvSessionOpen';

export function readLoungeTvSessionOpen(): boolean {
  try {
    return sessionStorage.getItem(LOUNGE_TV_SESSION_OPEN_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeLoungeTvSessionOpen(open: boolean): void {
  try {
    if (open) sessionStorage.setItem(LOUNGE_TV_SESSION_OPEN_KEY, '1');
    else sessionStorage.removeItem(LOUNGE_TV_SESSION_OPEN_KEY);
  } catch {
    /* ignore */
  }
}
