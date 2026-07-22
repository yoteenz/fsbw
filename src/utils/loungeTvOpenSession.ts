/** Persists Lounge TV open across refresh on the lounge slide only (tab session). */
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

function navigationWasReload(): boolean {
  try {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    return nav?.type === 'reload';
  } catch {
    return false;
  }
}

/** Restore TV open only after a full reload while still on the lounge carousel route. */
export function readLoungeTvOpenRestoreAfterReload(onLoungeRoute: boolean): boolean {
  if (!onLoungeRoute) return false;
  if (!navigationWasReload()) return false;
  return readLoungeTvSessionOpen();
}
