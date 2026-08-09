import type { EpisodeReleaseState } from '../types';
import type { PSATodayEpisode } from '../../../components/lounge/psa-today/types';

function parseTs(iso?: string): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}

/** Resolve release state from scheduling metadata — manual override respected when set (non-scheduled). */
export function resolveEpisodeReleaseState(
  episode: Pick<
    PSATodayEpisode,
    | 'releaseState'
    | 'releaseAt'
    | 'announcementAt'
    | 'previewAvailableAt'
    | 'published'
    | 'comingSoon'
  >,
  nowMs: number = Date.now()
): EpisodeReleaseState {
  const manual = episode.releaseState;
  if (manual && manual !== 'scheduled' && manual !== 'planned') {
    return manual;
  }

  const releaseAt = parseTs(episode.releaseAt);
  const previewAt = parseTs(episode.previewAvailableAt);
  const announceAt = parseTs(episode.announcementAt);

  if (releaseAt != null && nowMs >= releaseAt) return 'released';
  if (previewAt != null && nowMs >= previewAt) return 'preview-available';
  if (announceAt != null && nowMs >= announceAt) return 'announced';
  if (releaseAt != null && nowMs < releaseAt) return 'scheduled';
  if (episode.published && episode.comingSoon) return 'scheduled';
  if (episode.published && !episode.comingSoon) return 'released';
  return manual ?? 'planned';
}

export function isEpisodeFullLessonReleased(
  episode: PSATodayEpisode,
  nowMs?: number
): boolean {
  const state = resolveEpisodeReleaseState(episode, nowMs);
  return state === 'released' && episode.published !== false;
}

export function isEpisodePreviewAvailable(
  episode: PSATodayEpisode,
  nowMs?: number
): boolean {
  const state = resolveEpisodeReleaseState(episode, nowMs);
  if (state === 'released' || state === 'preview-available') return Boolean(episode.cameraA);
  return false;
}

export function resolveEpisodeGrantDate(params: {
  seasonPassAcquiredAt: string;
  episodeReleaseAt?: string;
  nowIso?: string;
}): string {
  const acquired = Date.parse(params.seasonPassAcquiredAt);
  const release = params.episodeReleaseAt ? Date.parse(params.episodeReleaseAt) : NaN;
  const now = params.nowIso ? Date.parse(params.nowIso) : Date.now();
  const grantMs = Math.max(acquired, Number.isFinite(release) ? release : 0, now);
  return new Date(grantMs).toISOString();
}

export function formatEpisodeReleaseLabel(releaseAt?: string, nowMs: number = Date.now()): string {
  if (!releaseAt) return 'COMING SOON';
  const t = Date.parse(releaseAt);
  if (!Number.isFinite(t)) return 'COMING SOON';
  const diffDays = Math.ceil((t - nowMs) / (24 * 60 * 60 * 1000));
  if (diffDays <= 0) return 'AVAILABLE NOW';
  if (diffDays === 1) return 'TOMORROW';
  if (diffDays <= 7) return 'THIS WEEK';
  try {
    return `AVAILABLE ${new Date(t).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }).toUpperCase()}`;
  } catch {
    return 'COMING SOON';
  }
}

export function resolveEpisodeTicketCost(episode: PSATodayEpisode): number {
  return Math.max(0, episode.episodeTicketCost ?? episode.slayTicketCost ?? 0);
}
