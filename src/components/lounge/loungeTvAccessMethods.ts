import type { LoungeContentPack } from './loungeTvContentPack';
import type { LoungeTvContentAccessMethod } from './loungeTvStreamingTypes';
import { contentPackToTile } from './loungeTvContent';
import {
  loungeTvContentIsAccessible,
  resolveLoungeTvTicketCost,
  findLoungeContentUnlock,
} from './loungeTvTicketAccess';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';

export function resolveContentAccessMethods(
  pack: LoungeContentPack,
  unlocks: LoungeContentUnlock[] | undefined,
  isUnlocked: (contentId: string) => boolean
): LoungeTvContentAccessMethod[] {
  const fromMeta = pack.streaming?.accessMethods ?? [];
  const methods = new Set<LoungeTvContentAccessMethod>(fromMeta);
  const tile = contentPackToTile(pack);
  const ticketCost = resolveLoungeTvTicketCost(tile);

  if (pack.isFreePreview || ticketCost === 0) methods.add('free');
  if (pack.isPremium || pack.membershipRequired) methods.add('member');
  if (ticketCost > 0) methods.add('slay-ticket');
  if (findLoungeContentUnlock(pack.id, unlocks)) methods.add('purchased');

  if (loungeTvContentIsAccessible(tile, unlocks ?? isUnlocked)) {
    if (ticketCost > 0 && findLoungeContentUnlock(pack.id, unlocks)) methods.add('purchased');
  }

  return [...methods];
}
