import type { LoungeTvStreamSeries } from './loungeTvStreamingTypes';
import type { LoungeContentPack } from './loungeTvContentPack';
import { getContentPackById } from './loungeTvContentPack';
import { LOUNGE_TV_STREAM_SERIES } from './loungeTvStreamSeriesData';

export { LOUNGE_TV_STREAM_SERIES };

const seriesById = new Map(LOUNGE_TV_STREAM_SERIES.map((s) => [s.id, s]));

export function getStreamSeriesById(seriesId: string): LoungeTvStreamSeries | undefined {
  return seriesById.get(seriesId);
}

export function streamSeriesForPack(pack: LoungeContentPack): LoungeTvStreamSeries | undefined {
  const id = pack.streaming?.seriesId ?? pack.streaming?.relationships?.seriesId;
  if (id) return getStreamSeriesById(id);
  return LOUNGE_TV_STREAM_SERIES.find((s) => s.episodes.some((e) => e.contentPackId === pack.id));
}

export function episodeRefForPack(pack: LoungeContentPack): LoungeTvStreamSeries['episodes'][number] | undefined {
  const series = streamSeriesForPack(pack);
  if (!series) return undefined;
  return series.episodes.find((e) => e.contentPackId === pack.id);
}

export function packsInSeries(seriesId: string): LoungeContentPack[] {
  const series = getStreamSeriesById(seriesId);
  if (!series) return [];
  return series.episodes
    .map((e) => getContentPackById(e.contentPackId))
    .filter((p): p is LoungeContentPack => Boolean(p));
}

export function nextEpisodePack(pack: LoungeContentPack): LoungeContentPack | undefined {
  const nextId = pack.streaming?.episode?.nextEpisodeId;
  if (nextId) return getContentPackById(nextId);
  const series = streamSeriesForPack(pack);
  if (!series) return undefined;
  const idx = series.episodes.findIndex((e) => e.contentPackId === pack.id);
  if (idx < 0 || idx >= series.episodes.length - 1) return undefined;
  return getContentPackById(series.episodes[idx + 1].contentPackId);
}

export function previousEpisodePack(pack: LoungeContentPack): LoungeContentPack | undefined {
  const prevId = pack.streaming?.episode?.previousEpisodeId;
  if (prevId) return getContentPackById(prevId);
  const series = streamSeriesForPack(pack);
  if (!series) return undefined;
  const idx = series.episodes.findIndex((e) => e.contentPackId === pack.id);
  if (idx <= 0) return undefined;
  return getContentPackById(series.episodes[idx - 1].contentPackId);
}

export function seriesEpisodeIds(seriesId: string): string[] {
  return getStreamSeriesById(seriesId)?.episodes.map((e) => e.contentPackId) ?? [];
}

export function allStreamSeries(): LoungeTvStreamSeries[] {
  return LOUNGE_TV_STREAM_SERIES;
}
