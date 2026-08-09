import type { LoungeContentUnlock } from '../../../utils/slayTicketHistoryDisplay';
import {
  loungeTvContentIsAccessible,
  resolveLoungeTvUnlockCost,
} from '../loungeTvTicketAccess';
import type { SlayTip } from '../../../content/education/types';

export function slayTipUnlockContentId(tip: SlayTip): string {
  return tip.linkedContentPackId ?? tip.id;
}

export function slayTipAccessGranted(
  tip: SlayTip,
  unlocks: LoungeContentUnlock[] | undefined,
  isUnlocked?: (contentId: string) => boolean
): boolean {
  if (tip.slayTicketCost <= 0) return true;
  const contentId = slayTipUnlockContentId(tip);
  const tile = {
    id: contentId,
    title: tip.title,
    ticketCost: tip.slayTicketCost,
    isFreePreview: false,
  };
  return loungeTvContentIsAccessible(tile, unlocks ?? isUnlocked ?? (() => false));
}

export function slayTipUnlockCost(tip: SlayTip, unlocks: LoungeContentUnlock[] | undefined): number {
  const contentId = slayTipUnlockContentId(tip);
  return resolveLoungeTvUnlockCost(
    { id: contentId, title: tip.title, ticketCost: tip.slayTicketCost },
    unlocks
  );
}
