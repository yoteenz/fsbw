/** First-party anonymous id for analytics (persists across sessions). */
const STORAGE_KEY = 'fsaVisitorId';

export function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing && existing.length >= 8) return existing;
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `v-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return `v-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  }
}
