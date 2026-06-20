import type { LoungeTvVideoTile } from './loungeTvContent';

export function resolveLoungeTvTicketCost(tile: Pick<LoungeTvVideoTile, 'ticketCost'>): number {
  const cost = tile.ticketCost;
  if (typeof cost === 'number' && Number.isFinite(cost)) return Math.max(0, Math.floor(cost));
  return 0;
}

export function loungeTvContentIsAccessible(
  tile: LoungeTvVideoTile,
  isUnlocked: (contentId: string) => boolean
): boolean {
  const cost = resolveLoungeTvTicketCost(tile);
  if (cost === 0) return true;
  return isUnlocked(tile.id);
}

export function loungeTvTileActionLabel(
  tile: LoungeTvVideoTile,
  isUnlocked: (contentId: string) => boolean
): 'WATCH' | 'UNLOCK' {
  return loungeTvContentIsAccessible(tile, isUnlocked) ? 'WATCH' : 'UNLOCK';
}

export function loungeTvTicketCostLabel(cost: number): string {
  if (cost <= 0) return 'FREE';
  return cost === 1 ? '1 TICKET' : `${cost} TICKETS`;
}
