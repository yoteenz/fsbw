import type { LoungeContentPack } from './loungeTvContentPack';
import { contentPackRuntimeOrRead } from './loungeTvContentPack';
import type { LoungeTvContentFilterFacets } from './loungeTvStreamingTypes';
import { resolveContentAccessMethods } from './loungeTvAccessMethods';
import { resolveContentStatusFlags } from './loungeTvContentStatus';
import { contentPackToTile } from './loungeTvContent';

function runtimeBucket(pack: LoungeContentPack): LoungeTvContentFilterFacets['runtimeBucket'] {
  const sec = pack.streaming?.durationSec;
  if (sec != null) {
    if (sec <= 300) return 'short';
    if (sec <= 720) return 'medium';
    return 'long';
  }
  const label = contentPackRuntimeOrRead(pack);
  const minMatch = label.match(/(\d+)\s*MIN/i);
  if (minMatch) {
    const mins = Number(minMatch[1]);
    if (mins <= 5) return 'short';
    if (mins <= 12) return 'medium';
    return 'long';
  }
  return 'medium';
}

/** Flatten pack into future search/filter facets — no UI. */
export function buildContentFilterFacets(
  pack: LoungeContentPack,
  isUnlocked: (id: string) => boolean
): LoungeTvContentFilterFacets {
  const tile = contentPackToTile(pack);
  return {
    seriesId: pack.streaming?.seriesId ?? pack.streaming?.relationships?.seriesId,
    difficulty: pack.difficulty ?? pack.streaming?.relationships?.difficulty,
    runtimeBucket: runtimeBucket(pack),
    hairTexture: pack.streaming?.relationships?.hairTexture,
    category: pack.category ?? pack.streaming?.relationships?.category,
    host: pack.host ?? pack.streaming?.relationships?.host,
    flags: resolveContentStatusFlags(pack, tile, undefined, isUnlocked),
    accessMethods: resolveContentAccessMethods(pack, undefined, isUnlocked),
    lifecycle: pack.streaming?.lifecycle?.state ?? 'published',
  };
}

export function buildLoungeTvFilterIndex(
  packs: LoungeContentPack[],
  isUnlocked: (id: string) => boolean
): Record<string, LoungeTvContentFilterFacets> {
  return Object.fromEntries(packs.map((p) => [p.id, buildContentFilterFacets(p, isUnlocked)]));
}
