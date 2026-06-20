import { SLAY_TICKET_CART_THUMBNAIL_SRC } from '../constants/slayTicketAssets';
import {
  getSlayTicketPackById,
  slayTicketPackCartLine,
  type SlayTicketPack,
} from './slayTicketPacks';
import { isSlayTicketPackCartLine } from './slayTicketCheckout';

export type WriteSlayTicketCheckoutOpts = {
  packId: string;
  /** Cart line image; PDP uses selected hero preview */
  image?: string;
};

/** Prior non–slay-ticket bag saved when entering isolated `/checkout/slay-tickets`. */
export const SLAY_TICKET_CHECKOUT_CART_BACKUP_KEY = 'slayTicketCheckoutCartBackup';

function parseStoredCartItems(): { type?: string; name?: string; quantity?: number; slayTicketProduct?: boolean }[] {
  try {
    const stored = localStorage.getItem('cartItems');
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function nonSlayTicketCartLines<T extends { type?: string; name?: string; slayTicketProduct?: boolean }>(
  items: T[]
): T[] {
  return (items || []).filter((i) => !isSlayTicketPackCartLine(i));
}

function persistCartItemsAndDispatch(items: { quantity?: number }[]): number {
  localStorage.setItem('cartItems', JSON.stringify(items));

  const newCartCount = items.reduce(
    (sum: number, row: { quantity?: number }) => sum + (row.quantity || 1),
    0
  );
  localStorage.setItem('cartCount', String(newCartCount));

  window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCartCount }));
  window.dispatchEvent(new CustomEvent('cartItemsChanged'));
  window.dispatchEvent(new Event('cartUpdated'));

  return newCartCount;
}

export function backupCartBeforeSlayTicketCheckoutSession(): void {
  const existing = parseStoredCartItems();
  const toBackup = nonSlayTicketCartLines(existing);
  if (toBackup.length === 0) return;
  if (localStorage.getItem(SLAY_TICKET_CHECKOUT_CART_BACKUP_KEY)) return;
  localStorage.setItem(SLAY_TICKET_CHECKOUT_CART_BACKUP_KEY, JSON.stringify(toBackup));
}

export function clearSlayTicketCheckoutCartBackup(): void {
  localStorage.removeItem(SLAY_TICKET_CHECKOUT_CART_BACKUP_KEY);
}

export function hasSlayTicketCheckoutCartBackup(): boolean {
  const raw = localStorage.getItem(SLAY_TICKET_CHECKOUT_CART_BACKUP_KEY);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

export function restoreSlayTicketCheckoutCartFromBackup(): number | null {
  const raw = localStorage.getItem(SLAY_TICKET_CHECKOUT_CART_BACKUP_KEY);
  if (!raw) return null;
  try {
    const backup = JSON.parse(raw);
    if (!Array.isArray(backup) || backup.length === 0) {
      clearSlayTicketCheckoutCartBackup();
      return null;
    }
    const count = persistCartItemsAndDispatch(backup);
    clearSlayTicketCheckoutCartBackup();
    return count;
  } catch {
    clearSlayTicketCheckoutCartBackup();
    return null;
  }
}

export function maybeRestoreSlayTicketCheckoutCartAfterAbandon(
  remainingItems: { type?: string; name?: string; slayTicketProduct?: boolean }[]
): number | null {
  if (!hasSlayTicketCheckoutCartBackup()) return null;
  if (remainingItems.some((i) => !isSlayTicketPackCartLine(i))) return null;
  return restoreSlayTicketCheckoutCartFromBackup();
}

/**
 * Isolated Slay Ticket checkout: replaces the bag with exactly one ticket-pack line.
 * Backs up any existing non–slay-ticket lines first.
 */
export function writeSlayTicketSelectionForCheckoutSession(opts: WriteSlayTicketCheckoutOpts): number {
  backupCartBeforeSlayTicketCheckoutSession();

  const pack = getSlayTicketPackById(opts.packId);
  if (!pack) {
    throw new Error('Invalid Slay Ticket pack');
  }

  const line = {
    ...slayTicketPackCartLine(pack),
    image: opts.image ?? SLAY_TICKET_CART_THUMBNAIL_SRC,
  };
  return persistCartItemsAndDispatch([line]);
}

export function resolveSlayTicketPackFromQuery(packId: string | null | undefined): SlayTicketPack {
  return getSlayTicketPackById(packId) ?? getSlayTicketPackById('slay-tickets-4')!;
}
