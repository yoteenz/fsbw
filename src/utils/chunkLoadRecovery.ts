/**
 * After a new Vercel deploy, an old SPA tab may still reference hashed chunk URLs that no longer exist.
 * Safari often surfaces that as "Importing a module script failed." We recover with a single hard reload
 * (fresh index.html → new asset URLs), guarded so we do not loop if the network is actually down.
 */

const RELOAD_FLAG_KEY = 'fsbw_stale_chunk_reload_at';
const RELOAD_COOLDOWN_MS = 90_000;

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
    lower.includes('error loading dynamically imported module')
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
