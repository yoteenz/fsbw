import { attachStockStatusToLineItem, isWigUnitProductName } from './productInventoryAvailability';

function mapLines<T extends Record<string, unknown>>(lines: T[]): { next: T[]; changed: boolean } {
  let changed = false;
  const next = lines.map((line) => {
    if (!isWigUnitProductName(String(line.name ?? line.productName ?? ''))) return line;
    const enriched = attachStockStatusToLineItem(line);
    if (line.stockStatus !== enriched.stockStatus) changed = true;
    return enriched as T;
  });
  return { next, changed };
}

function readJsonArray(key: string): unknown[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeIfChanged(key: string, next: unknown[], changed: boolean): void {
  if (!changed) return;
  localStorage.setItem(key, JSON.stringify(next));
}

/** Persist `stockStatus` on cart, wishlist, saved-for-later, and list items from admin inventory. */
export function syncStoredLinesStockStatus(): boolean {
  if (typeof window === 'undefined') return false;
  let anyChanged = false;

  const cartKey = 'cartItems';
  const cart = readJsonArray(cartKey) as Record<string, unknown>[];
  const cartMapped = mapLines(cart);
  writeIfChanged(cartKey, cartMapped.next, cartMapped.changed);
  anyChanged = anyChanged || cartMapped.changed;

  const wishlistKey = 'wishlistItems';
  const wishlist = readJsonArray(wishlistKey) as Record<string, unknown>[];
  const wishlistMapped = mapLines(wishlist);
  writeIfChanged(wishlistKey, wishlistMapped.next, wishlistMapped.changed);
  anyChanged = anyChanged || wishlistMapped.changed;

  const savedKey = 'savedForLater';
  const saved = readJsonArray(savedKey) as Record<string, unknown>[];
  const savedMapped = mapLines(saved);
  writeIfChanged(savedKey, savedMapped.next, savedMapped.changed);
  anyChanged = anyChanged || savedMapped.changed;

  try {
    const listsRaw = localStorage.getItem('userLists');
    if (listsRaw) {
      const lists = JSON.parse(listsRaw);
      if (Array.isArray(lists)) {
        let listsChanged = false;
        const nextLists = lists.map((list: { items?: Record<string, unknown>[] }) => {
          if (!list?.items?.length) return list;
          const mapped = mapLines(list.items);
          if (mapped.changed) listsChanged = true;
          return { ...list, items: mapped.next };
        });
        if (listsChanged) {
          localStorage.setItem('userLists', JSON.stringify(nextLists));
          anyChanged = true;
          window.dispatchEvent(new CustomEvent('userListsUpdated'));
        }
      }
    }
  } catch {
    /* ignore */
  }

  if (anyChanged) {
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }

  return anyChanged;
}
