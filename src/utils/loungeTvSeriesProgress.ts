import { getStreamSeriesById, seriesEpisodeIds } from '../components/lounge/loungeTvStreamSeries';
import { getCompletedPackIds, getWatchProgressMap } from './loungeTvLibrary';

export type LoungeTvSeriesProgress = {
  seriesId: string;
  completedCount: number;
  totalEpisodes: number;
  percent: number;
  episodesRemaining: number;
};

export function computeSeriesProgress(seriesId: string): LoungeTvSeriesProgress {
  const episodeIds = seriesEpisodeIds(seriesId);
  const total = episodeIds.length || 1;
  const completed = new Set(getCompletedPackIds());
  let completedCount = episodeIds.filter((id) => completed.has(id)).length;
  if (completedCount === 0) {
    const map = getWatchProgressMap();
    completedCount = episodeIds.filter((id) => (map[id]?.percent ?? 0) >= 95).length;
  }
  const percent = Math.min(100, Math.round((completedCount / total) * 100));
  return {
    seriesId,
    completedCount,
    totalEpisodes: total,
    percent,
    episodesRemaining: Math.max(0, total - completedCount),
  };
}

export function courseCompletionLabel(seriesId: string): string | null {
  const series = getStreamSeriesById(seriesId);
  if (!series) return null;
  const prog = computeSeriesProgress(seriesId);
  if (prog.percent <= 0) return null;
  return `${prog.percent}% · ${prog.episodesRemaining} EP REMAINING`;
}
