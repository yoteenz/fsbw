const ASSTS_SESSION_KEY = 'site00-assts-immersive-complete';

/** Full cinematic loader on cold start / hard refresh — not on ordinary in-session navigation. */
export function shouldShowAsstsImmersiveLoader(): boolean {
  if (typeof window === 'undefined') return true;

  try {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (nav?.type === 'reload') return true;
  } catch {
    /* ignore */
  }

  return sessionStorage.getItem(ASSTS_SESSION_KEY) !== '1';
}

export function markAsstsImmersiveComplete(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(ASSTS_SESSION_KEY, '1');
  } catch {
    /* ignore */
  }
}
