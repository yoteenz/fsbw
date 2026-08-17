import { Site00ImmersiveColdStartFallback } from '../site00/components/loader/Site00ImmersiveColdStartFallback';
import { isSite00ImmersivePath } from '../site00/components/loader/site00LoaderPaths';
import { shouldShowSite00ImmersiveLoader } from '../site00/components/loader/site00LoaderSession';

/**
 * Lazy App shell fallback — never show plain "Loading…" on SITE 00 cold start;
 * the ultra-early boot shell paints the loader background before React hydrates.
 */
export function AppShellRouteFallback() {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname || '';
    if (isSite00ImmersivePath(path) && shouldShowSite00ImmersiveLoader()) {
      return <Site00ImmersiveColdStartFallback />;
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
