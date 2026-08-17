/**
 * Lazy App shell fallback — never show plain "Loading…" on ASSTS cold start;
 * the ultra-early boot shell paints the loader background before React hydrates.
 */
export function AppShellRouteFallback() {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname || '';
    if (path.startsWith('/assts')) {
      try {
        if (sessionStorage.getItem('site00-assts-immersive-complete') !== '1') {
          return null;
        }
      } catch {
        return null;
      }
    }
  }

  return (
    <div
      data-route-loading="app-shell"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        color: '#444',
      }}
    >
      Loading…
    </div>
  );
}
