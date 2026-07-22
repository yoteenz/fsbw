import type { LoungeContentPack } from './loungeTvContentPack';
import { LOUNGE_TV_STREAM_SERIES } from './loungeTvStreamSeriesData';

/** Infer duration seconds from runtime label e.g. "8 MIN". */
export function parseRuntimeMinutes(pack: LoungeContentPack): number | undefined {
  const label = pack.runtime ?? pack.readTime;
  if (!label) return undefined;
  const m = label.match(/(\d+)\s*MIN/i);
  return m ? Number(m[1]) : undefined;
}

export function defaultDurationSec(pack: LoungeContentPack): number | undefined {
  if (pack.streaming?.durationSec) return pack.streaming.durationSec;
  const mins = parseRuntimeMinutes(pack);
  return mins != null ? mins * 60 : undefined;
}

function seriesEpisodeRef(packId: string) {
  for (const series of LOUNGE_TV_STREAM_SERIES) {
    const idx = series.episodes.findIndex((e) => e.contentPackId === packId);
    if (idx >= 0) {
      return { series, idx, ref: series.episodes[idx] };
    }
  }
  return null;
}

/** Apply series episode graph links when missing on pack. */
export function withStreamingEpisodeGraph(pack: LoungeContentPack): LoungeContentPack {
  const graph = seriesEpisodeRef(pack.id);
  const nextId = graph && graph.idx < graph.series.episodes.length - 1
    ? graph.series.episodes[graph.idx + 1].contentPackId
    : undefined;
  const prevId = graph && graph.idx > 0 ? graph.series.episodes[graph.idx - 1].contentPackId : undefined;
  const ref = graph?.ref;
  const episodeTitle = pack.episodeTitle ?? ref?.episodeTitle;
  const episode = pack.episode ?? ref?.episodeNumber;

  return {
    ...pack,
    episode,
    episodeTitle,
    streaming: {
      ...pack.streaming,
      seriesId: pack.streaming?.seriesId ?? graph?.series.id,
      durationSec: defaultDurationSec(pack),
      lifecycle: pack.streaming?.lifecycle ?? { state: 'published', launchDate: pack.releaseDate },
      episode: {
        ...pack.streaming?.episode,
        description: pack.streaming?.episode?.description ?? pack.subtitle,
        learningObjectives: pack.streaming?.episode?.learningObjectives ?? pack.article?.takeaways,
        productsMentioned: pack.streaming?.episode?.productsMentioned ?? pack.productsUsed?.map((p) => p.name),
        estimatedSkillLevel: pack.streaming?.episode?.estimatedSkillLevel ?? pack.difficulty,
        nextEpisodeId: pack.streaming?.episode?.nextEpisodeId ?? nextId,
        previousEpisodeId: pack.streaming?.episode?.previousEpisodeId ?? prevId,
        relatedEpisodeIds: pack.streaming?.episode?.relatedEpisodeIds ?? pack.relatedLessons,
        transcriptPlaceholder: pack.streaming?.episode?.transcriptPlaceholder ?? Boolean(pack.transcript),
        bookmarksPlaceholder: pack.streaming?.episode?.bookmarksPlaceholder ?? true,
        notesPlaceholder: pack.streaming?.episode?.notesPlaceholder ?? true,
        resourcesPlaceholder: pack.streaming?.episode?.resourcesPlaceholder ?? true,
        downloadsPlaceholder: pack.streaming?.episode?.downloadsPlaceholder ?? true,
      },
    },
  };
}

export function hydrateContentPack(pack: LoungeContentPack): LoungeContentPack {
  return withStreamingEpisodeGraph(pack);
}

export function hydrateAllContentPacks(packs: LoungeContentPack[]): LoungeContentPack[] {
  return packs.map(hydrateContentPack);
}
