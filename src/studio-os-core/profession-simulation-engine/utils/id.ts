/** Lightweight UUID for simulation sessions (browser-safe). */
export function randomUUID(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `sim-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
