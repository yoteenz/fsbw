import type { LoungeTvVideoTile } from './loungeTvContent';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';

/** Library access window after unlock or rewatch. */
export const LOUNGE_TV_LIBRARY_ACCESS_MS = 365 * 24 * 60 * 60 * 1000;

/** Ticket cost to rewatch after library access expires. */
export const LOUNGE_TV_REWATCH_TICKET_COST = 1;

export function resolveLoungeTvTicketCost(tile: Pick<LoungeTvVideoTile, 'ticketCost'>): number {
  const cost = tile.ticketCost;
  if (typeof cost === 'number' && Number.isFinite(cost)) return Math.max(0, Math.floor(cost));
  return 0;
}

export function findLoungeContentUnlock(
  contentId: string,
  unlocks: LoungeContentUnlock[] | undefined
): LoungeContentUnlock | undefined {
  if (!unlocks?.length) return undefined;
  return unlocks.find((u) => u.contentId === contentId);
}

export function loungeUnlockExpiresAtMs(unlock: LoungeContentUnlock): number | null {
  if (unlock.expiresAt) {
    const exp = new Date(unlock.expiresAt).getTime();
    if (!Number.isNaN(exp)) return exp;
  }
  if (unlock.unlockedAt) {
    const start = new Date(unlock.unlockedAt).getTime();
    if (!Number.isNaN(start)) return start + LOUNGE_TV_LIBRARY_ACCESS_MS;
  }
  return null;
}

export function loungeUnlockRowIsActive(unlock: LoungeContentUnlock | undefined): boolean {
  if (!unlock) return false;
  const expMs = loungeUnlockExpiresAtMs(unlock);
  if (expMs == null) return true;
  return expMs > Date.now();
}

export function loungeContentHadUnlock(
  contentId: string,
  unlocks: LoungeContentUnlock[] | undefined
): boolean {
  return Boolean(findLoungeContentUnlock(contentId, unlocks));
}

export function loungeContentIsExpired(
  contentId: string,
  unlocks: LoungeContentUnlock[] | undefined
): boolean {
  const row = findLoungeContentUnlock(contentId, unlocks);
  if (!row) return false;
  return !loungeUnlockRowIsActive(row);
}

export function resolveLoungeTvUnlockCost(
  tile: LoungeTvVideoTile,
  unlocks: LoungeContentUnlock[] | undefined
): number {
  const catalogCost = resolveLoungeTvTicketCost(tile);
  if (catalogCost === 0) return 0;
  const row = findLoungeContentUnlock(tile.id, unlocks);
  if (!row) return catalogCost;
  if (loungeUnlockRowIsActive(row)) return 0;
  return LOUNGE_TV_REWATCH_TICKET_COST;
}

export function resolveLoungeTvBadgeCost(
  tile: LoungeTvVideoTile,
  unlocks: LoungeContentUnlock[] | undefined
): number {
  const catalogCost = resolveLoungeTvTicketCost(tile);
  if (catalogCost === 0) return 0;
  if (loungeTvContentIsAccessible(tile, unlocks)) return catalogCost;
  return resolveLoungeTvUnlockCost(tile, unlocks);
}

export function loungeTvContentIsAccessible(
  tile: LoungeTvVideoTile,
  unlocksOrFn: LoungeContentUnlock[] | undefined | ((contentId: string) => boolean)
): boolean {
  const cost = resolveLoungeTvTicketCost(tile);
  if (cost === 0) return true;
  if (typeof unlocksOrFn === 'function') return unlocksOrFn(tile.id);
  return loungeUnlockRowIsActive(findLoungeContentUnlock(tile.id, unlocksOrFn));
}

export function loungeTvTileActionLabel(
  tile: LoungeTvVideoTile,
  unlocksOrFn: LoungeContentUnlock[] | undefined | ((contentId: string) => boolean)
): 'WATCH' | 'UNLOCK' | 'REWATCH' {
  if (loungeTvContentIsAccessible(tile, unlocksOrFn)) return 'WATCH';
  if (Array.isArray(unlocksOrFn) && loungeContentIsExpired(tile.id, unlocksOrFn)) return 'REWATCH';
  return 'UNLOCK';
}

export function loungeTvTicketCostLabel(cost: number): string {
  if (cost <= 0) return 'FREE';
  return cost === 1 ? '1 TICKET' : `${cost} TICKETS`;
}

export function loungeTvLibraryExpiresAtIso(): string {
  return new Date(Date.now() + LOUNGE_TV_LIBRARY_ACCESS_MS).toISOString();
}
