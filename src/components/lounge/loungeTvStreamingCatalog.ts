import type { LoungeContentPack } from './loungeTvContentPack';
import {
  LOUNGE_TV_CONTENT_PACKS,
  contentPacksForExploreSection,
  contentPacksForFeaturedRow,
  contentPacksForLearningPath,
  getContentPackById,
} from './loungeTvContentPack';
import { getWatchProgressMap } from '../../utils/loungeTvLibrary';
import { relatedContentPacks } from './loungeTvContentPack';

import type { FeaturedPremiereKind } from './loungeTvContentPack';

export type { FeaturedPremiereKind };

export const FEATURED_PREMIERE_LABELS: Record<FeaturedPremiereKind, string> = {
  'psa-welcome': 'PSA WELCOME',
  'new-this-week': 'NEW THIS WEEK',
  'featured-lesson': 'FEATURED LESSON',
  'product-premiere': 'PRODUCT PREMIERE',
  'seasonal-collection': 'SEASONAL COLLECTION',
  'brand-film': 'BRAND FILM',
};

const PREMIERE_ROTATION: FeaturedPremiereKind[] = [
  'featured-lesson',
  'new-this-week',
  'psa-welcome',
  'product-premiere',
  'brand-film',
  'seasonal-collection',
];

export const FEATURED_RAIL_ORDER = [
  { key: 'new' as const, title: 'NEW THIS WEEK' },
  { key: 'continue' as const, title: 'CONTINUE WATCHING' },
  { key: 'trending' as const, title: 'TRENDING IN THE MANSION' },
  { key: 'psa-recommends' as const, title: 'PSA TODAY' },
  { key: 'members-favorites' as const, title: 'RECOMMENDED FOR YOU' },
  { key: 'recently-added' as const, title: 'RECENTLY ADDED' },
] as const;

export type FeaturedRailKey = (typeof FEATURED_RAIL_ORDER)[number]['key'];

export function featuredPremiereLabel(kind: FeaturedPremiereKind | undefined): string {
  if (!kind) return 'FEATURED PREMIERE';
  return FEATURED_PREMIERE_LABELS[kind];
}

/** Rotating featured premiere hero — metadata only, same hero player. */
export function resolveFeaturedPremiereHero(): LoungeContentPack | null {
  const weekSlot =
    typeof window !== 'undefined'
      ? Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) % PREMIERE_ROTATION.length
      : 0;
  const kind = PREMIERE_ROTATION[weekSlot];
  const byKind = LOUNGE_TV_CONTENT_PACKS.find((p) => p.featuredPremiere === kind);
  if (byKind) return byKind;
  return (
    contentPacksForFeaturedRow('hero')[0] ??
    contentPacksForFeaturedRow('new')[0] ??
    LOUNGE_TV_CONTENT_PACKS.find((p) => p.isFeatured) ??
    LOUNGE_TV_CONTENT_PACKS[0] ??
    null
  );
}

export function packsForFeaturedRail(key: FeaturedRailKey): LoungeContentPack[] {
  switch (key) {
    case 'continue':
      return continueWatchingPacks();
    case 'members-favorites': {
      const favorites = membersFavoritePacks();
      return favorites.length ? favorites : becauseYouWatchedPacks();
    }
    case 'recently-added':
      return recentlyAddedPacks();
    default:
      return contentPacksForFeaturedRow(key);
  }
}

function continueWatchingPacks(): LoungeContentPack[] {
  const progress = getWatchProgressMap();
  return Object.values(progress)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((row) => getContentPackById(row.packId))
    .filter((p): p is LoungeContentPack => Boolean(p));
}

function recentlyAddedPacks(): LoungeContentPack[] {
  const tagged = LOUNGE_TV_CONTENT_PACKS.filter(
    (p) => p.featuredRows?.includes('recently-added') || p.justAdded
  );
  const fallback = LOUNGE_TV_CONTENT_PACKS.filter((p) => p.isNew);
  const merged = [...tagged, ...fallback];
  const seen = new Set<string>();
  return merged.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

function membersFavoritePacks(): LoungeContentPack[] {
  return LOUNGE_TV_CONTENT_PACKS.filter(
    (p) => p.membersFavorite || p.featuredRows?.includes('members-favorites') || p.isRecommended
  );
}

function becauseYouWatchedPacks(): LoungeContentPack[] {
  const last = continueWatchingPacks()[0];
  if (!last) return contentPacksForFeaturedRow('psa-recommends').slice(0, 6);
  const related = relatedContentPacks(last);
  const samePath = last.learningPathId
    ? contentPacksForLearningPath(last.learningPathId).filter((p) => p.id !== last.id)
    : [];
  const seen = new Set<string>([last.id]);
  const out: LoungeContentPack[] = [];
  for (const p of [...related, ...samePath]) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
  }
  return out.slice(0, 8);
}

function sortCurriculumPacks(list: LoungeContentPack[]): LoungeContentPack[] {
  return [...list].sort((a, b) => {
    const ao = a.learningPathOrder ?? 999;
    const bo = b.learningPathOrder ?? 999;
    if (ao !== bo) return ao - bo;
    return (a.episode ?? 999) - (b.episode ?? 999);
  });
}

/** Academy curriculum row — ordered episodes within a learning path. */
export function academyPacksForLearningPath(pathId: string): LoungeContentPack[] {
  if (pathId === 'beginner-essentials') {
    return sortCurriculumPacks(
      LOUNGE_TV_CONTENT_PACKS.filter(
        (p) => p.difficulty === 'BEGINNER' && (p.fullVideo || p.previewVideo || p.article)
      )
    );
  }
  if (pathId === 'advanced-techniques') {
    return sortCurriculumPacks(
      LOUNGE_TV_CONTENT_PACKS.filter((p) => p.difficulty === 'ADVANCED')
    );
  }
  return sortCurriculumPacks(contentPacksForLearningPath(pathId));
}

export function explorePacksForSection(sectionId: string): LoungeContentPack[] {
  return contentPacksForExploreSection(sectionId);
}

export function buildPsaFeaturedIntro(pack: LoungeContentPack): string {
  const host = pack.host ?? 'PSA';
  const topic = pack.subtitle ?? pack.title;
  return `WELCOME BACK. I'M ${host}. TODAY'S FEATURED PREMIERE EXPLORES ${topic}`;
}
