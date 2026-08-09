import type { LoungeTvVideoTile } from '../loungeTvContent';
import type { LoungeContentUnlock } from '../../../utils/slayTicketHistoryDisplay';
import {
  loungeTvContentIsAccessible,
  resolveLoungeTvTicketCost,
  resolveLoungeTvUnlockCost,
} from '../loungeTvTicketAccess';
import { contentPackToTile } from '../loungeTvContent';
import { getContentPackById } from '../loungeTvContentPack';
import type { EpisodeAccessState, PSAEpisodeEntitlement, PSATodayEpisode } from './types';
import {
  psaEntitlementAllowsPaidPlayback,
  psaEntitlementNeedsRedemption,
} from './psaTodayEntitlementLogic';

export function resolvePsaEpisodeTicketCost(episode: PSATodayEpisode): number {
  if (episode.accessType === 'free') return 0;
  if (typeof episode.slayTicketCost === 'number') return Math.max(0, episode.slayTicketCost);
  if (episode.linkedContentPackId) {
    const pack = getContentPackById(episode.linkedContentPackId);
    if (pack) return resolveLoungeTvTicketCost(contentPackToTile(pack));
  }
  return 0;
}

export function resolvePsaEpisodeTile(episode: PSATodayEpisode): LoungeTvVideoTile | null {
  if (!episode.linkedContentPackId) {
    return {
      id: episode.id,
      title: episode.title,
      ticketCost: resolvePsaEpisodeTicketCost(episode),
      isFreePreview: episode.accessType === 'free',
    };
  }
  const pack = getContentPackById(episode.linkedContentPackId);
  if (!pack) return null;
  return contentPackToTile(pack);
}

export function psaEpisodeAccessGranted(
  episode: PSATodayEpisode,
  unlocks: LoungeContentUnlock[] | undefined,
  isUnlocked?: (contentId: string) => boolean
): boolean {
  if (episode.accessType === 'free') return true;
  const tile = resolvePsaEpisodeTile(episode);
  if (!tile) return false;
  return loungeTvContentIsAccessible(tile, unlocks ?? isUnlocked ?? (() => false));
}

export function psaEpisodeUnlockCost(
  episode: PSATodayEpisode,
  unlocks: LoungeContentUnlock[] | undefined
): number {
  const tile = resolvePsaEpisodeTile(episode);
  if (!tile) return resolvePsaEpisodeTicketCost(episode);
  return resolveLoungeTvUnlockCost(tile, unlocks);
}

export function buildEpisodeAccessState(
  episode: PSATodayEpisode,
  unlocks: LoungeContentUnlock[] | undefined,
  userId?: string
): EpisodeAccessState {
  const granted = psaEpisodeAccessGranted(episode, unlocks);
  let accessSource: EpisodeAccessState['accessSource'];
  if (episode.accessType === 'free') accessSource = 'free';
  else if (granted) accessSource = 'slay-ticket';

  return {
    episodeId: episode.id,
    userId,
    accessGranted: granted,
    accessSource,
  };
}

export function psaChapterIsAccessible(
  chapter: { gated?: boolean },
  paidLessonAllowed: boolean
): boolean {
  if (!chapter.gated) return true;
  return paidLessonAllowed;
}

export function psaEpisodePaidLessonAllowed(
  episode: PSATodayEpisode,
  entitlement: PSAEpisodeEntitlement | null | undefined,
  options?: { graceSessionOpen?: boolean }
): boolean {
  if (episode.accessType === 'free') return true;
  return psaEntitlementAllowsPaidPlayback(entitlement, options);
}

export function psaEpisodeNeedsRedemption(
  episode: PSATodayEpisode,
  entitlement: PSAEpisodeEntitlement | null | undefined
): boolean {
  if (episode.accessType === 'free') return false;
  return psaEntitlementNeedsRedemption(entitlement);
}

export function psaEpisodeContentIdForUnlock(episode: PSATodayEpisode): string {
  return episode.linkedContentPackId ?? episode.id;
}
