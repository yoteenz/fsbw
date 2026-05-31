/**
 * After a new Vercel deploy, an old SPA tab may still reference hashed chunk URLs that no longer exist.
 * Safari often surfaces that as "Importing a module script failed." Recover with reload + cache-bust fallbacks.
 */

const RELOAD_FLAG_KEY = 'fsbw_stale_chunk_reload_at';
const CACHE_BUST_FLAG_KEY = 'fsbw_stale_chunk_cache_bust_at';
const RELOAD_COOLDOWN_MS = 60_000;
const CACHE_BUST_COOLDOWN_MS = 15_000;

export function isDynamicImportChunkFailure(error: unknown): boolean {
  const msg = error instanceof Error ? error.message || '' : String(error || '');
  const name = error instanceof Error ? error.name || '' : '';
  const lower = msg.toLowerCase();
  return (
    name === 'ChunkLoadError' ||
    lower.includes('failed to fetch') ||
    lower.includes('loading chunk') ||
    lower.includes('loading css chunk') ||
    lower.includes('mime type') ||
    lower.includes('text/html') ||
    lower.includes('importing a module script failed') ||
    lower.includes('failed to load module script') ||
    lower.includes('error loading dynamically imported module') ||
    lower.includes('dynamically imported module') ||
    (lower.includes('failed to load') && lower.includes('module'))
  );
}

/** Hard reload at most once per cooldown window (sessionStorage). Returns true if reload was invoked. */
export function hardReloadOnceForStaleChunks(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const now = Date.now();
    const prev = sessionStorage.getItem(RELOAD_FLAG_KEY);
    if (prev) {
      const t = parseInt(prev, 10);
      if (!Number.isNaN(t) && now - t < RELOAD_COOLDOWN_MS) return false;
    }
    sessionStorage.setItem(RELOAD_FLAG_KEY, String(now));
  } catch {
    /* ignore */
  }
  window.location.reload();
  return true;
}

/** Full navigation with cache-bust query (fresh index.html + new chunk hashes). */
export function cacheBustReloadOnceForStaleChunks(): boolean {
  if (typeof window === 'undefined') return false;
  const now = Date.now();
  try {
    const prev = sessionStorage.getItem(CACHE_BUST_FLAG_KEY);
    if (prev) {
      const t = parseInt(prev, 10);
      if (!Number.isNaN(t) && now - t < CACHE_BUST_COOLDOWN_MS) return false;
    }
    sessionStorage.setItem(CACHE_BUST_FLAG_KEY, String(now));
  } catch {
    /* ignore */
  }
  const url = new URL(window.location.href);
  url.searchParams.set('_v', String(now));
  window.location.replace(url.toString());
  return true;
}

/** Try plain reload first, then cache-busted navigation (covers post-deploy stale tabs). */
export function reloadForStaleChunks(): boolean {
  if (hardReloadOnceForStaleChunks()) return true;
  return cacheBustReloadOnceForStaleChunks();
}

/** User tapped Reload — always attempt recovery even if auto-reload recently ran. */
export function forceReloadForStaleChunks(): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.set('_v', String(Date.now()));
  window.location.replace(url.toString());
}

let globalHandlersRegistered = false;

export function registerGlobalChunkLoadRecovery(): void {
  if (typeof window === 'undefined' || globalHandlersRegistered) return;
  globalHandlersRegistered = true;

  const tryRecover = (error: unknown) => {
    if (!isDynamicImportChunkFailure(error)) return;
    reloadForStaleChunks();
  };

  window.addEventListener(
    'error',
    (event) => {
      tryRecover(event.error ?? new Error(event.message || 'Script error'));
    },
    true
  );

  window.addEventListener('unhandledrejection', (event) => {
    tryRecover(event.reason);
  });

  window.addEventListener('vite:preloadError', ((event: Event) => {
    const detail = (event as CustomEvent<unknown>).detail;
    tryRecover(detail instanceof Error ? detail : new Error('Vite preload failed'));
  }) as EventListener);
}
