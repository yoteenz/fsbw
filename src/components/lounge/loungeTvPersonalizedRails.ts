import type { LoungeContentPack } from './loungeTvContentPack';
import {
  LOUNGE_TV_CONTENT_PACKS,
  getContentPackById,
} from './loungeTvContentPack';
import type { LoungeTvPersonalizedRailKey } from './loungeTvStreamingTypes';
import {
  getCompletedPackIds,
  getRecentlyUnlockedPackIds,
  getWatchProgressMap,
} from '../../utils/loungeTvLibrary';
import { nextEpisodePack, streamSeriesForPack } from './loungeTvStreamSeries';
import { findLoungeContentUnlock, resolveLoungeTvTicketCost } from './loungeTvTicketAccess';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';
import { contentPackToTile } from './loungeTvContent';
import { computeSeriesProgress } from '../../utils/loungeTvSeriesProgress';

export const PERSONALIZED_RAIL_CATALOG: Array<{
  key: LoungeTvPersonalizedRailKey;
  title: string;
}> = [
  { key: 'psa-picks-for-you', title: 'PSA PICKS FOR YOU' },
  { key: 'continue-your-journey', title: 'CONTINUE YOUR JOURNEY' },
  { key: 'because-you-watched', title: 'BECAUSE YOU WATCHED…' },
  { key: 'recommended-next', title: 'RECOMMENDED NEXT' },
  { key: 'finish-what-you-started', title: 'FINISH WHAT YOU STARTED' },
  { key: 'recently-unlocked', title: 'RECENTLY UNLOCKED' },
  { key: 'recently-purchased', title: 'RECENTLY PURCHASED' },
  { key: 'based-on-favorites', title: 'BASED ON YOUR FAVORITES' },
  { key: 'complete-your-course', title: 'COMPLETE YOUR COURSE' },
  { key: 'member-exclusives', title: 'MEMBER EXCLUSIVES' },
  { key: 'keep-watching', title: 'KEEP WATCHING' },
  { key: 'trending-this-week', title: 'TRENDING THIS WEEK' },
];

function inProgressPacks(): LoungeContentPack[] {
  const completed = new Set(getCompletedPackIds());
  const map = getWatchProgressMap();
  return Object.values(map)
    .filter((row) => !completed.has(row.packId) && (row.percent ?? 0) < 100 && row.positionSec > 0)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((row) => getContentPackById(row.packId))
    .filter((p): p is LoungeContentPack => Boolean(p));
}

function continuePacks(): LoungeContentPack[] {
  const map = getWatchProgressMap();
  return Object.values(map)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((row) => getContentPackById(row.packId))
    .filter((p): p is LoungeContentPack => Boolean(p));
}

export function packsForPersonalizedRail(
  key: LoungeTvPersonalizedRailKey,
  unlocks?: LoungeContentUnlock[]
): LoungeContentPack[] {
  switch (key) {
    case 'psa-picks-for-you':
      return LOUNGE_TV_CONTENT_PACKS.filter((p) => p.isRecommended || p.membersFavorite).slice(0, 8);
    case 'continue-your-journey':
    case 'keep-watching':
      return continuePacks();
    case 'because-you-watched': {
      const last = continuePacks()[0];
      if (!last) return [];
      return LOUNGE_TV_CONTENT_PACKS.filter(
        (p) => p.id !== last.id && (p.learningPathId === last.learningPathId || p.series === last.series)
      ).slice(0, 8);
    }
    case 'recommended-next': {
      const last = inProgressPacks()[0] ?? continuePacks()[0];
      if (!last) return LOUNGE_TV_CONTENT_PACKS.filter((p) => p.isRecommended).slice(0, 6);
      const next = nextEpisodePack(last);
      return next ? [next] : [];
    }
    case 'finish-what-you-started':
      return inProgressPacks();
    case 'recently-unlocked':
      return getRecentlyUnlockedPackIds(unlocks)
        .map((id) => getContentPackById(id))
        .filter((p): p is LoungeContentPack => Boolean(p));
    case 'recently-purchased':
      return LOUNGE_TV_CONTENT_PACKS.filter((p) => {
        const cost = resolveLoungeTvTicketCost(contentPackToTile(p));
        return cost > 0 && Boolean(findLoungeContentUnlock(p.id, unlocks));
      }).slice(0, 8);
    case 'based-on-favorites':
      return LOUNGE_TV_CONTENT_PACKS.filter((p) => p.membersFavorite).slice(0, 8);
    case 'complete-your-course': {
      const series = streamSeriesForPack(continuePacks()[0] ?? LOUNGE_TV_CONTENT_PACKS[0]);
      if (!series) return [];
      const prog = computeSeriesProgress(series.id);
      if (prog.percent >= 100) return [];
      return LOUNGE_TV_CONTENT_PACKS.filter(
        (p) => p.streaming?.seriesId === series.id || series.episodes.some((e) => e.contentPackId === p.id)
      )
        .filter((p) => !getCompletedPackIds().includes(p.id))
        .slice(0, 6);
    }
    case 'member-exclusives':
      return LOUNGE_TV_CONTENT_PACKS.filter((p) => p.isPremium || p.membershipRequired).slice(0, 8);
    case 'trending-this-week':
      return LOUNGE_TV_CONTENT_PACKS.filter((p) => p.isTrending).slice(0, 8);
    default:
      return [];
  }
}
