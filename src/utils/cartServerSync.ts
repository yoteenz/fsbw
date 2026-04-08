/**
 * Merge local and server cart lines for cross-device sync (union by line id, higher quantity wins).
 * Used when hydrating from GET /api/cart and on 409 conflict retry.
 */

function lineId(line: unknown): string {
  const o = line as Record<string, unknown> | null | undefined;
  if (!o || typeof o !== 'object') return 'empty';
  const id = o.id;
  if (typeof id === 'string' && id.trim()) return id.trim();
  if (typeof id === 'number' && Number.isFinite(id)) return String(id);
  const name = String(o.name ?? '').trim().toUpperCase();
  const type = String(o.type ?? '').trim();
  const price = String(o.price ?? o.balance ?? '');
  return `k:${type}|${name}|${price}`;
}

function quantityOf(line: unknown): number {
  const o = line as { quantity?: unknown } | null | undefined;
  const q = Number(o?.quantity);
  return Number.isFinite(q) && q >= 1 ? Math.floor(q) : 1;
}

/** Union keys from server then local; same id keeps the line with greater quantity (then prefers local shape). */
export function mergeCartItemsUnion(local: unknown[] | null | undefined, server: unknown[] | null | undefined): unknown[] {
  const L = Array.isArray(local) ? local : [];
  const S = Array.isArray(server) ? server : [];
  const map = new Map<string, unknown>();

  for (const s of S) {
    const id = lineId(s);
    map.set(id, s);
  }
  for (const l of L) {
    const id = lineId(l);
    const existing = map.get(id);
    if (!existing) {
      map.set(id, l);
      continue;
    }
    const qL = quantityOf(l);
    const qS = quantityOf(existing);
    if (qL > qS) map.set(id, l);
    else if (qS > qL) map.set(id, existing);
    else map.set(id, l);
  }
  return Array.from(map.values());
}

export const SERVER_CART_VERSION_KEY = 'serverCartVersion';

export function readStoredCartVersion(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SERVER_CART_VERSION_KEY);
    if (raw == null || raw === '') return null;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export function writeStoredCartVersion(v: number | null | undefined): void {
  if (typeof window === 'undefined') return;
  try {
    if (v != null && Number.isFinite(v) && v > 0) {
      localStorage.setItem(SERVER_CART_VERSION_KEY, String(Math.floor(v)));
    } else {
      localStorage.removeItem(SERVER_CART_VERSION_KEY);
    }
  } catch {
    /* ignore */
  }
}
