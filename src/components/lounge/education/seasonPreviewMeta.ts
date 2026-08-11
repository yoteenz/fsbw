import type { EducationSeason, SeasonCustomerReleaseState } from '../../../content/education/types';
import type { PSATodayEpisode } from '../psa-today/types';
import { getCurriculumBibleEntryById } from '../../../content/education/curriculum/registry';
import {
  formatEpisodeReleaseLabel,
  isEpisodeFullLessonReleased,
  isEpisodePreviewAvailable,
  resolveEpisodeTicketCost,
  resolveSlotPsaEpisode,
} from '../../../content/education/hierarchy/catalog';
import { getContentPackById } from '../loungeTvContentPack';
import { resolvePackArtwork } from '../loungeTvArtwork';
import { getWatchProgressMap, isPackCompleted } from '../../../utils/loungeTvLibrary';
import { getCompletedEpisodeIdsForSeason } from './seasonProgress';

export type SeasonEpisodePreviewState =
  | 'released'
  | 'in-progress'
  | 'completed'
  | 'coming-soon'
  | 'access-gated'
  | 'preview';

export type SeasonEpisodePreviewItem = {
  slotId: string;
  episodeNumber: number;
  title: string;
  artworkUrl?: string;
  state: SeasonEpisodePreviewState;
  /** Short label for overlay — COMING SOON, AUG 24, ticket count, etc. */
  statusLabel?: string;
  progressPercent?: number;
  ticketCost?: number;
  psaEpisodeId?: string;
  navigable: boolean;
  ariaLabel: string;
};

const PLACEHOLDER_POSTER = '/assets/NOIR/blanco-thumb.png';

function progressPackId(episode: PSATodayEpisode): string {
  return episode.linkedContentPackId ?? episode.id;
}

export function formatEpisodeComingSoonShort(releaseAt?: string, nowMs: number = Date.now()): string {
  if (!releaseAt) return 'COMING SOON';
  const t = Date.parse(releaseAt);
  if (!Number.isFinite(t) || t <= nowMs) return 'COMING SOON';
  try {
    return new Date(t)
      .toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      .toUpperCase()
      .replace('.', '');
  } catch {
    return 'COMING SOON';
  }
}

export function resolveSeasonEpisodeArtwork(
  season: EducationSeason,
  _slot: EducationSeason['episodeSlots'][number],
  episode?: PSATodayEpisode,
): string {
  if (episode) {
    const packId = episode.linkedContentPackId;
    const pack = packId ? getContentPackById(packId) : undefined;
    if (pack) {
      const fromPack = resolvePackArtwork(pack, 'card');
      if (fromPack) return fromPack;
    }
    return (
      episode.thumbnailUrl ??
      episode.heroPosterUrl ??
      episode.cameraB?.posterUrl ??
      episode.cameraA?.posterUrl ??
      PLACEHOLDER_POSTER
    );
  }
  return season.posterUrl ?? season.heroImageUrl ?? PLACEHOLDER_POSTER;
}

export function countTotalEpisodesForSeason(season: EducationSeason): number {
  return season.episodeSlots.length;
}

export function countReleasedEpisodesForSeason(season: EducationSeason, nowMs?: number): number {
  return season.episodeSlots.filter((slot) => {
    const ep = resolveSlotPsaEpisode(slot);
    return ep ? isEpisodeFullLessonReleased(ep, nowMs) : false;
  }).length;
}

export function countCompletedReleasedEpisodesForSeason(season: EducationSeason): number {
  const completedSet = new Set(getCompletedEpisodeIdsForSeason(season));
  let count = 0;
  for (const slot of season.episodeSlots) {
    const ep = resolveSlotPsaEpisode(slot);
    if (!ep || !isEpisodeFullLessonReleased(ep)) continue;
    const packId = progressPackId(ep);
    if (
      completedSet.has(ep.id) ||
      completedSet.has(slot.careLessonId ?? '') ||
      isPackCompleted(packId)
    ) {
      count += 1;
    }
  }
  return count;
}

export function resolveSeasonCustomerReleaseState(
  season: EducationSeason,
  nowMs?: number,
): SeasonCustomerReleaseState {
  const total = countTotalEpisodesForSeason(season);
  const released = countReleasedEpisodesForSeason(season, nowMs);

  if (total === 0 || season.status === 'planned' || season.status === 'announced') {
    return 'upcoming';
  }
  if (released <= 0) return 'upcoming';
  if (released >= total) return 'completed';
  return 'partially_released';
}

export function buildSeasonEpisodePreviewItems(input: {
  season: EducationSeason;
  hasSeasonPass: boolean;
  complimentaryIncluded: boolean;
  nowMs?: number;
}): SeasonEpisodePreviewItem[] {
  const { season, hasSeasonPass, complimentaryIncluded, nowMs } = input;
  const completedIds = new Set(getCompletedEpisodeIdsForSeason(season));
  const watchMap = getWatchProgressMap();

  return season.episodeSlots.map((slot) => {
    const bible = getCurriculumBibleEntryById(slot.curriculumBibleId);
    const ep = resolveSlotPsaEpisode(slot);
    const title = (ep?.title ?? bible?.title ?? slot.curriculumBibleId).toUpperCase();
    const episodeNumber = slot.seasonEpisodeNumber;
    const artworkUrl = resolveSeasonEpisodeArtwork(season, slot, ep);

    if (!ep) {
      const label = formatEpisodeComingSoonShort(undefined, nowMs);
      return {
        slotId: slot.slotId,
        episodeNumber,
        title,
        artworkUrl,
        state: 'coming-soon',
        statusLabel: label,
        navigable: false,
        ariaLabel: `Episode ${episodeNumber}, ${title}, coming soon`,
      };
    }

    const released = isEpisodeFullLessonReleased(ep, nowMs);
    const preview = isEpisodePreviewAvailable(ep, nowMs);
    const ticketCost = resolveEpisodeTicketCost(ep);
    const packId = progressPackId(ep);
    const watchRow = watchMap[packId];
    const progressPercent = watchRow?.percent ?? 0;
    const isCompleted =
      completedIds.has(ep.id) || completedIds.has(slot.careLessonId ?? '') || isPackCompleted(packId);
    const inProgress = !isCompleted && progressPercent > 0 && progressPercent < 95;

    const hasEntitlement = hasSeasonPass || complimentaryIncluded;
    const accessGated =
      released &&
      !hasEntitlement &&
      ticketCost > 0 &&
      season.allowEpisodePurchase;

    if (!released && !preview) {
      const shortDate = formatEpisodeComingSoonShort(ep.releaseAt, nowMs);
      const statusLabel = shortDate === 'COMING SOON' ? 'COMING SOON' : shortDate;
      return {
        slotId: slot.slotId,
        episodeNumber,
        title,
        artworkUrl,
        state: 'coming-soon',
        statusLabel,
        psaEpisodeId: ep.id,
        navigable: false,
        ariaLabel: `Episode ${episodeNumber}, ${title}, coming soon`,
      };
    }

    if (isCompleted) {
      return {
        slotId: slot.slotId,
        episodeNumber,
        title,
        artworkUrl,
        state: 'completed',
        statusLabel: 'COMPLETE',
        psaEpisodeId: ep.id,
        navigable: true,
        ariaLabel: `Episode ${episodeNumber}, ${title}, completed`,
      };
    }

    if (inProgress) {
      return {
        slotId: slot.slotId,
        episodeNumber,
        title,
        artworkUrl,
        state: 'in-progress',
        progressPercent: Math.round(progressPercent),
        psaEpisodeId: ep.id,
        navigable: true,
        ariaLabel: `Episode ${episodeNumber}, ${title}, in progress`,
      };
    }

    if (accessGated) {
      return {
        slotId: slot.slotId,
        episodeNumber,
        title,
        artworkUrl,
        state: 'access-gated',
        ticketCost,
        statusLabel: `${ticketCost} SLAY TICKET${ticketCost === 1 ? '' : 'S'}`,
        psaEpisodeId: ep.id,
        navigable: true,
        ariaLabel: `Episode ${episodeNumber}, ${title}, ${ticketCost} slay ticket${ticketCost === 1 ? '' : 's'} required`,
      };
    }

    if (preview && !released) {
      return {
        slotId: slot.slotId,
        episodeNumber,
        title,
        artworkUrl,
        state: 'preview',
        statusLabel: 'PREVIEW',
        psaEpisodeId: ep.id,
        navigable: true,
        ariaLabel: `Episode ${episodeNumber}, ${title}, preview available`,
      };
    }

    return {
      slotId: slot.slotId,
      episodeNumber,
      title,
      artworkUrl,
      state: 'released',
      psaEpisodeId: ep.id,
      navigable: true,
      ariaLabel: `Episode ${episodeNumber}, ${title}, available`,
    };
  });
}

export function seasonPreviewReleasedLabel(releasedCount: number, totalCount: number): string {
  if (totalCount <= 0) return 'NO EPISODES RELEASED YET';
  if (releasedCount <= 0) return 'NO EPISODES RELEASED YET';
  if (releasedCount >= totalCount) {
    return totalCount === 1 ? '1 EPISODE AVAILABLE' : `ALL ${totalCount} EPISODES AVAILABLE`;
  }
  return `${releasedCount} OF ${totalCount} EPISODE${totalCount === 1 ? '' : 'S'} AVAILABLE`;
}

export function seasonPreviewViewerCompletionLabel(
  completedReleased: number,
  releasedCount: number,
): string | null {
  if (releasedCount <= 0) return null;
  if (completedReleased <= 0) return null;
  return `${completedReleased} OF ${releasedCount} RELEASED EPISODE${releasedCount === 1 ? '' : 'S'} COMPLETE`;
}

/** @deprecated Use seasonPreviewViewerCompletionLabel for released-only completion copy. */
export function seasonPreviewCompletionLabel(completed: number, total: number): string {
  return `${completed} / ${total} COMPLETE`;
}

/** @deprecated Use formatEpisodeComingSoonShort — kept for tests referencing release label. */
export { formatEpisodeReleaseLabel };
