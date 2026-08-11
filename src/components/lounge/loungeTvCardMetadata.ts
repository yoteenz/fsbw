import type { LoungeContentPack } from './loungeTvContentPack';
import { contentPackPrimaryRuntimeForCard } from './loungeTvContentPack';
import type { LoungeTvVideoTile } from './loungeTvContent';
import {
  loungeTvTicketCostLabel,
  resolveLoungeTvTicketCost,
  loungeTvContentIsAccessible,
} from './loungeTvTicketAccess';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';
import {
  resolveContentStatusFlags,
  statusFlagsToBadgeLabels,
} from './loungeTvContentStatus';
import type { LoungeTvContentStatusFlag } from './loungeTvStreamingTypes';
import { LOUNGE_TV_BRAND_RED, LOUNGE_TV_TEXT_GRAY, LOUNGE_TV_TEXT_WHITE } from './loungeTvTheme';
import { episodeRefForPack, streamSeriesForPack } from './loungeTvStreamSeries';
import { loungeTvFormatCardDate } from './loungeTvDisplayText';
import { getContentPackById } from './loungeTvContentPack';
import { getPsaTodayEpisodeForContentPack } from './psa-today';

const PSA_ACADEMY_S1_ANCHOR_PACK_ID = 'cutting-lace';
const SERIES_EPISODE_RELEASE_INTERVAL_DAYS = 7;

function isoDatePrefix(value: string): string | undefined {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1];
}

function addDaysToIsoDate(isoDate: string, days: number): string | undefined {
  const prefix = isoDatePrefix(isoDate);
  if (!prefix) return undefined;
  const [year, month, day] = prefix.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day));
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

/** Resolve a display release date from pack, streaming, PSA Today, or series cadence. */
export function resolveContentPackCardDate(pack: LoungeContentPack): string | undefined {
  if (pack.releaseDate) return pack.releaseDate;

  const launchDate = pack.streaming?.lifecycle?.launchDate;
  if (launchDate) return launchDate;

  const psaEpisode = getPsaTodayEpisodeForContentPack(pack.id);
  if (psaEpisode?.releaseDate) return psaEpisode.releaseDate;
  if (psaEpisode?.releaseAt) {
    const fromReleaseAt = isoDatePrefix(psaEpisode.releaseAt);
    if (fromReleaseAt) return fromReleaseAt;
  }

  const series = streamSeriesForPack(pack);
  const episodeRef = episodeRefForPack(pack);
  if (series?.id === 'psa-academy-s1' && episodeRef?.episodeNumber != null) {
    const anchorDate = getContentPackById(PSA_ACADEMY_S1_ANCHOR_PACK_ID)?.releaseDate;
    if (anchorDate) {
      return addDaysToIsoDate(
        anchorDate,
        (episodeRef.episodeNumber - 1) * SERIES_EPISODE_RELEASE_INTERVAL_DAYS
      );
    }
  }

  return undefined;
}

export type LoungeTvCardMetaSegment = {
  text: string;
  /** Red accent (NEW, PREMIERE). */
  accent?: boolean;
  /** White label (FREE PREVIEW, access lines). */
  white?: boolean;
};

/** Segment label color for card caption rows. */
export function loungeTvCardMetaSegmentColor(seg: LoungeTvCardMetaSegment): string {
  if (seg.accent) return LOUNGE_TV_BRAND_RED;
  if (seg.white) return LOUNGE_TV_TEXT_WHITE;
  return LOUNGE_TV_TEXT_GRAY;
}

/** Dot separator — matches the label before it; never matches the label after it. */
export function loungeTvCardMetaSeparatorColor(
  previous: LoungeTvCardMetaSegment,
  next: LoungeTvCardMetaSegment,
): string {
  const previousColor = loungeTvCardMetaSegmentColor(previous);
  const nextColor = loungeTvCardMetaSegmentColor(next);
  if (previousColor !== nextColor) return previousColor;
  return LOUNGE_TV_TEXT_WHITE;
}

export type LoungeTvCardMetaLine = {
  text: string;
  accent?: boolean;
  segments?: LoungeTvCardMetaSegment[];
};

function episodeNumberLabel(pack: LoungeContentPack): string | null {
  const ref = episodeRefForPack(pack);
  const num = pack.episode ?? ref?.episodeNumber;
  if (num == null) return null;
  return `EP ${String(num).padStart(2, '0')}`;
}

/** Root browse cards — access/status with per-segment colors. */
function accessBadgeLine(
  pack: LoungeContentPack,
  tile: LoungeTvVideoTile,
  unlocks: LoungeContentUnlock[] | undefined,
  isUnlocked: (contentId: string) => boolean,
): LoungeTvCardMetaLine | null {
  const accessible = loungeTvContentIsAccessible(tile, unlocks ?? isUnlocked);
  const ticketCost = resolveLoungeTvTicketCost(tile);
  const flags = resolveContentStatusFlags(pack, tile, unlocks, isUnlocked);

  const segments: LoungeTvCardMetaSegment[] = [];

  if (pack.isFreePreview || flags.includes('free-preview')) {
    segments.push({ text: 'FREE PREVIEW', white: true });
  } else if (ticketCost > 0 && !accessible) {
    segments.push({ text: loungeTvTicketCostLabel(ticketCost), accent: true });
  } else if (pack.membershipRequired || pack.isPremium || flags.includes('members-only')) {
    segments.push({ text: 'MEMBERS ONLY', white: true });
  }

  const editorialFlags = flags.filter((f) =>
    (['premiere', 'new', 'coming-soon'] as LoungeTvContentStatusFlag[]).includes(f),
  );
  const statusBadges = statusFlagsToBadgeLabels(editorialFlags);
  if (statusBadges.length) {
    const badge = statusBadges[0];
    segments.push({ text: badge, accent: badge === 'NEW' || badge === 'PREMIERE' });
  }

  if (!segments.length) return null;

  return {
    text: segments.map((s) => s.text).join(' · '),
    accent: segments.some((s) => s.accent),
    segments,
  };
}

/** Primary metadata — date · EP · runtime (date first when present). */
export function loungeTvCardPrimaryMetaLine(pack: LoungeContentPack): string | null {
  const parts: string[] = [];

  const cardDate = resolveContentPackCardDate(pack);
  if (cardDate) {
    parts.push(loungeTvFormatCardDate(cardDate));
  }

  const ep = episodeNumberLabel(pack);
  if (ep) parts.push(ep);

  const runtime = contentPackPrimaryRuntimeForCard(pack);
  if (runtime) parts.push(runtime);

  if (!parts.length && pack.season != null) {
    parts.push(typeof pack.season === 'number' ? `SEASON ${pack.season}` : String(pack.season));
  }
  return parts.length ? parts.join(' · ') : null;
}

/** Metadata-only lines for detail overlays. */
export function loungeTvCardMetaLines(
  pack: LoungeContentPack,
  tile: LoungeTvVideoTile,
  unlocks: LoungeContentUnlock[] | undefined,
  isUnlocked: (contentId: string) => boolean,
): LoungeTvCardMetaLine[] {
  const lines: LoungeTvCardMetaLine[] = [];
  const primary = loungeTvCardPrimaryMetaLine(pack);
  if (primary) lines.push({ text: primary });
  const access = accessBadgeLine(pack, tile, unlocks, isUnlocked);
  if (access) lines.push(access);
  return lines;
}

/** Two-line caption under row thumbnails — metadata + access/status. */
export function loungeTvCardCaptionLines(
  pack: LoungeContentPack,
  tile: LoungeTvVideoTile,
  unlocks: LoungeContentUnlock[] | undefined,
  isUnlocked: (contentId: string) => boolean,
): LoungeTvCardMetaLine[] {
  const out: LoungeTvCardMetaLine[] = [];
  const primary = loungeTvCardPrimaryMetaLine(pack);
  if (primary) out.push({ text: primary });
  const access = accessBadgeLine(pack, tile, unlocks, isUnlocked);
  if (access) out.push(access);
  return out;
}
