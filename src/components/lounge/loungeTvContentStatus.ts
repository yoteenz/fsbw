import type { LoungeContentPack } from './loungeTvContentPack';
import type { LoungeTvContentStatusFlag } from './loungeTvStreamingTypes';
import type { LoungeTvVideoTile } from './loungeTvContent';
import {
  getCompletedPackIds,
  getWatchProgressMap,
  isPackInContinueWatching,
} from '../../utils/loungeTvLibrary';
import { loungeTvTileShowsAsNew } from '../../utils/loungeTvViewedTiles';
import {
  loungeTvContentIsAccessible,
  resolveLoungeTvTicketCost,
} from './loungeTvTicketAccess';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';

/** Resolve visual status flags from pack metadata + local library state. */
export function resolveContentStatusFlags(
  pack: LoungeContentPack,
  tile: LoungeTvVideoTile,
  unlocks: LoungeContentUnlock[] | undefined,
  isUnlocked: (contentId: string) => boolean
): LoungeTvContentStatusFlag[] {
  const flags = new Set<LoungeTvContentStatusFlag>(pack.streaming?.statusFlags ?? []);
  const progress = getWatchProgressMap()[pack.id];
  const completed = getCompletedPackIds().includes(pack.id);
  const accessible = loungeTvContentIsAccessible(tile, unlocks ?? isUnlocked);
  const ticketCost = resolveLoungeTvTicketCost(tile);

  if (pack.isNew || loungeTvTileShowsAsNew(tile)) flags.add('new');
  if (pack.justAdded) flags.add('just-added');
  if (pack.isTrending) flags.add('trending');
  if (pack.membersFavorite || pack.isRecommended) flags.add('popular');
  if (pack.isFeatured || pack.featuredPremiere) flags.add('featured');
  if (pack.isFreePreview) flags.add('free-preview');
  if (pack.membershipRequired || pack.isPremium) flags.add('members-only');
  if (pack.featuredPremiere) flags.add('premiere');
  if (pack.streaming?.lifecycle?.state === 'scheduled') flags.add('coming-soon');

  if (completed) flags.add('completed');
  else if (progress && (progress.positionSec ?? 0) > 0) {
    flags.add('watched');
    if (isPackInContinueWatching(pack.id)) flags.add('continue-watching');
  }

  if (ticketCost > 0 && !accessible) {
    /* locked — no flag; tile blur handles */
  }

  if (pack.streaming?.lifecycle?.state === 'seasonal') flags.add('limited-time');

  return [...flags];
}

export function statusFlagsToBadgeLabels(flags: LoungeTvContentStatusFlag[]): string[] {
  const label: Record<LoungeTvContentStatusFlag, string> = {
    new: 'NEW',
    'just-added': 'JUST ADDED',
    trending: 'TRENDING',
    popular: 'POPULAR',
    'continue-watching': 'CONTINUE',
    watched: 'WATCHED',
    completed: 'COMPLETED',
    updated: 'UPDATED',
    featured: 'FEATURED',
    'limited-time': 'LIMITED TIME',
    'members-only': 'MEMBERS ONLY',
    'free-preview': 'FREE PREVIEW',
    premiere: 'PREMIERE',
    'coming-soon': 'COMING SOON',
  };
  return flags.map((f) => label[f]);
}
