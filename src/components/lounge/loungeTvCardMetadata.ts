import type { LoungeContentPack } from './loungeTvContentPack';
import { contentPackRuntimeOrRead } from './loungeTvContentPack';
import type { LoungeTvVideoTile } from './loungeTvContent';
import {
  loungeTvTicketCostLabel,
  resolveLoungeTvTicketCost,
  loungeTvContentIsAccessible,
} from './loungeTvTicketAccess';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';
import { resolveContentStatusFlags, statusFlagsToBadgeLabels } from './loungeTvContentStatus';
import { episodeRefForPack } from './loungeTvStreamSeries';

export type LoungeTvCardMetaLine = {
  text: string;
  accent?: boolean;
};

function episodeLabel(pack: LoungeContentPack): string | null {
  const ref = episodeRefForPack(pack);
  const num = pack.episode ?? ref?.episodeNumber;
  if (num == null) return null;
  const title = (pack.episodeTitle ?? ref?.episodeTitle)?.trim();
  if (title) return `EP ${num} · ${title}`;
  return `EP ${num}`;
}

/** Metadata-only lines for existing card chrome (no layout redesign). */
export function loungeTvCardMetaLines(
  pack: LoungeContentPack,
  tile: LoungeTvVideoTile,
  unlocks: LoungeContentUnlock[] | undefined,
  isUnlocked: (contentId: string) => boolean
): LoungeTvCardMetaLine[] {
  const lines: LoungeTvCardMetaLine[] = [];
  const accessible = loungeTvContentIsAccessible(tile, unlocks ?? isUnlocked);
  const ticketCost = resolveLoungeTvTicketCost(tile);
  const flags = resolveContentStatusFlags(pack, tile, unlocks, isUnlocked);

  const seriesLabel = pack.originalSeries ?? pack.series ?? pack.programSeries?.toUpperCase();
  if (seriesLabel) lines.push({ text: seriesLabel });

  const ep = episodeLabel(pack);
  if (ep) lines.push({ text: ep });

  if (pack.season != null) {
    lines.push({ text: typeof pack.season === 'number' ? `SEASON ${pack.season}` : String(pack.season) });
  }

  if (pack.host) lines.push({ text: `HOST · ${pack.host}` });

  if (pack.difficulty) lines.push({ text: pack.difficulty });

  const runtime = contentPackRuntimeOrRead(pack);
  if (runtime) lines.push({ text: runtime });

  const badges: string[] = [];
  if (pack.isFreePreview || flags.includes('free-preview')) badges.push('FREE PREVIEW');
  else if (ticketCost > 0 && !accessible) badges.push(loungeTvTicketCostLabel(ticketCost));
  else if (pack.membershipRequired || pack.isPremium || flags.includes('members-only')) {
    badges.push('MEMBERS ONLY');
  }

  const statusBadges = statusFlagsToBadgeLabels(
    flags.filter(
      (f) =>
        f !== 'free-preview' &&
        f !== 'members-only' &&
        f !== 'continue-watching'
    )
  );
  badges.push(...statusBadges);

  const unique = [...new Set(badges)];
  if (unique.length) {
    lines.push({ text: unique.join(' · '), accent: unique.some((b) => b === 'NEW' || b === 'PREMIERE') });
  }

  return lines;
}

/** Two-line caption under row thumbnails — detail line + badges. */
export function loungeTvCardCaptionLines(
  pack: LoungeContentPack,
  tile: LoungeTvVideoTile,
  unlocks: LoungeContentUnlock[] | undefined,
  isUnlocked: (contentId: string) => boolean
): LoungeTvCardMetaLine[] {
  const accessible = loungeTvContentIsAccessible(tile, unlocks ?? isUnlocked);
  const ticketCost = resolveLoungeTvTicketCost(tile);
  const flags = resolveContentStatusFlags(pack, tile, unlocks, isUnlocked);

  const detailParts: string[] = [];
  const seriesLabel = pack.originalSeries ?? pack.series;
  if (seriesLabel) detailParts.push(seriesLabel);
  const ep = episodeLabel(pack);
  if (ep) detailParts.push(ep);
  if (pack.season != null) {
    detailParts.push(typeof pack.season === 'number' ? `S${pack.season}` : String(pack.season));
  }
  const runtime = contentPackRuntimeOrRead(pack);
  if (runtime) detailParts.push(runtime);

  const badges: string[] = [];
  if (pack.isFreePreview || flags.includes('free-preview')) badges.push('FREE PREVIEW');
  else if (ticketCost > 0 && !accessible) badges.push(loungeTvTicketCostLabel(ticketCost));
  else if (pack.membershipRequired || pack.isPremium || flags.includes('members-only')) {
    badges.push('MEMBERS ONLY');
  }
  const statusBadges = statusFlagsToBadgeLabels(
    flags.filter((f) => f !== 'free-preview' && f !== 'members-only' && f !== 'continue-watching')
  );
  badges.push(...statusBadges);

  const out: LoungeTvCardMetaLine[] = [];
  if (detailParts.length) out.push({ text: detailParts.join(' · ') });
  const uniqueBadges = [...new Set(badges)];
  if (uniqueBadges.length) {
    out.push({
      text: uniqueBadges.slice(0, 4).join(' · '),
      accent: uniqueBadges.some((b) => b === 'NEW' || b === 'PREMIERE'),
    });
  }
  return out;
}
