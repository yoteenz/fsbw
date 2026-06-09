/**
 * Red Carpet Mode — premium event session (UI + tone, not a separate product surface).
 * Scoped to the open PSA chat: cleared when the panel closes, a new thread starts, or history switches threads.
 */
const STORAGE_KEY = 'psa_red_carpet_active_until';

/** TTL is a safety net only — the widget calls `deactivateRedCarpetMode` on chat exit. */
export function activateRedCarpetMode(durationMs = 45 * 60 * 1000): void {
  localStorage.setItem(STORAGE_KEY, String(Date.now() + durationMs));
}

export function deactivateRedCarpetMode(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function isRedCarpetModeActive(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const until = Number(raw);
    if (!Number.isFinite(until) || Date.now() > until) {
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function isRedCarpetTriggerMessage(text: string): boolean {
  const t = text.trim().toUpperCase();
  return (
    t === 'I HAVE AN EVENT' ||
    t === 'RED CARPET MODE' ||
    t.includes('RED CARPET') ||
    (t.includes('I HAVE AN') && t.includes('EVENT'))
  );
}
