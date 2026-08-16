/** Standalone chunk load recovery (no Frontal Slayer dependencies). */

const RELOAD_FLAG_KEY = 'aio_stale_chunk_reload_at';
const RELOAD_COOLDOWN_MS = 60_000;

export function isDynamicImportChunkFailure(error: unknown): boolean {
  const msg = error instanceof Error ? error.message || '' : String(error || '');
  const name = error instanceof Error ? error.name || '' : '';
  const lower = msg.toLowerCase();
  if (name === 'ChunkLoadError') return true;
  if (lower.includes('loading chunk')) return true;
  if (lower.includes('importing a module script failed')) return true;
  if (lower.includes('dynamically imported module')) return true;
  return false;
}

export function reloadForStaleChunks(): boolean {
  if (import.meta.env.DEV) return false;
  if (typeof window === 'undefined') return false;
  try {
    const prev = sessionStorage.getItem(RELOAD_FLAG_KEY);
    if (prev) {
      const t = parseInt(prev, 10);
      if (!Number.isNaN(t) && Date.now() - t < RELOAD_COOLDOWN_MS) return false;
    }
    sessionStorage.setItem(RELOAD_FLAG_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
  window.location.reload();
  return true;
}
