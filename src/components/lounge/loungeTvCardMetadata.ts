import type { LoungeContentPack } from './loungeTvContentPack';
import { contentPackRuntimeOrRead } from './loungeTvContentPack';
import type { LoungeTvVideoTile } from './loungeTvContent';
import {
  loungeTvContentIsAccessible,
  loungeTvTicketCostLabel,
  resolveLoungeTvTicketCost,
} from './loungeTvTicketAccess';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';
import { getCompletedPackIds } from '../../utils/loungeTvLibrary';
import { loungeTvTileShowsAsNew } from '../../utils/loungeTvViewedTiles';

export type LoungeTvCardMetaLine = {
  text: string;
  accent?: boolean;
};

function episodeLabel(pack: LoungeContentPack): string | null {
  if (pack.episode == null) return null;
  const title = pack.episodeTitle?.trim();
  if (title) return `EP ${pack.episode} · ${title}`;
  return `EP ${pack.episode}`;
}

/** Metadata-only lines for existing card chrome (no layout redesign). */
export function loungeTvCardMetaLines(
  pack: LoungeContentPack,
  tile: LoungeTvVideoTile,
  unlocks: LoungeContentUnlock[] | undefined,
  isUnlocked: (contentId: string) => boolean
): LoungeTvCardMetaLine[] {
  const lines: LoungeTvCardMetaLine[] = [];
  const completed = getCompletedPackIds().includes(pack.id);
  const accessible = loungeTvContentIsAccessible(tile, unlocks ?? isUnlocked);
  const ticketCost = resolveLoungeTvTicketCost(tile);

  if (pack.originalSeries || pack.series) {
    lines.push({ text: (pack.originalSeries ?? pack.series)! });
  }

  const ep = episodeLabel(pack);
  if (ep) lines.push({ text: ep });

  if (pack.season != null) {
    lines.push({ text: typeof pack.season === 'number' ? `SEASON ${pack.season}` : String(pack.season) });
  }

  if (pack.difficulty) {
    lines.push({ text: pack.difficulty });
  }

  const runtime = contentPackRuntimeOrRead(pack);
  if (runtime) lines.push({ text: runtime });

  const badges: string[] = [];
  if (pack.isFreePreview) badges.push('FREE PREVIEW');
  else if (ticketCost > 0 && !accessible) {
    badges.push(loungeTvTicketCostLabel(ticketCost));
  } else if (pack.membershipRequired || pack.isPremium) {
    badges.push('MEMBERS ONLY');
  }

  if (loungeTvTileShowsAsNew(tile) || pack.isNew) badges.push('NEW');
  if (pack.isTrending) badges.push('TRENDING');
  if (pack.justAdded) badges.push('JUST ADDED');
  if (pack.isRecommended) badges.push('PSA RECOMMENDS');
  if (completed) badges.push('COMPLETED');
  else if (accessible && getWatchProgressHint(pack.id)) badges.push('WATCHED');

  if (badges.length) {
    lines.push({ text: badges.join(' · '), accent: badges.includes('NEW') });
  }

  return lines;
}

function getWatchProgressHint(packId: string): boolean {
  try {
    const raw = localStorage.getItem('loungeTvWatchProgress');
    if (!raw) return false;
    const map = JSON.parse(raw) as Record<string, { positionSec?: number }>;
    const row = map[packId];
    return Boolean(row && (row.positionSec ?? 0) > 0);
  } catch {
    return false;
  }
}
