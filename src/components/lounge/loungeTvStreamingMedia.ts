import type { LoungeContentPack } from './loungeTvContentPack';
import {
  LOUNGE_TV_CONTENT_PACKS,
  getContentPackById,
} from './loungeTvContentPack';
import { resolvePackArtwork } from './loungeTvArtwork';
import { getWatchProgressMap, getSavedPackIds } from '../../utils/loungeTvLibrary';

/**
 * Lounge TV streaming content model — replace mock URLs with Supabase/production assets here.
 * @see public/assets/ for bundled placeholder MP4s
 * @see loungeTvAssets.ts for canonical path constants
 */
export type LoungeVideo = {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  eyebrow?: string;
  description?: string;
  duration?: string;
  videoUrl?: string;
  previewVideoUrl?: string;
  thumbnailUrl?: string;
  posterUrl?: string;
  featured?: boolean;
  live?: boolean;
  liveStartTime?: string;
  progress?: number;
  saved?: boolean;
  locked?: boolean;
  tags?: string[];
};

/** Featured hero rotation — editorial overrides on top of content packs. */
export type LoungeFeaturedHeroSlot = {
  packId: string;
  eyebrow?: string;
  displayTitle?: string;
  displayCategory?: string;
  displayDescription?: string;
};

import { LOUNGE_TV_MEDIA } from './loungeTvAssets';

/** Replace preview/full MP4 paths when production assets ship — see {@link LOUNGE_TV_MEDIA}. */
export { LOUNGE_TV_MEDIA };

/** ~3 featured hero items — rotates automatically on Featured tab. */
export const LOUNGE_TV_FEATURED_HERO_ROTATION: LoungeFeaturedHeroSlot[] = [
  {
    packId: 'cutting-lace',
    eyebrow: 'FEATURED PREMIERE · LACE MASTERY',
    displayTitle: 'CUTTING YOUR LACE',
    displayCategory: 'LACE MASTERY',
    displayDescription: 'TRIM AND SHAPE YOUR LACE FRONT FOR A CLEAN HAIRLINE BEFORE INSTALL.',
  },
  {
    packId: 'psa-answers-lace-faq',
    eyebrow: 'FEATURED PREMIERE · NEW THIS WEEK',
    displayTitle: 'TOP LACE QUESTIONS',
    displayCategory: 'PSA TODAY',
    displayDescription: 'YOUR MOST-ASKED LACE QUESTIONS, ANSWERED.',
  },
  {
    packId: 'brand-film-noir',
    eyebrow: 'FEATURED PREMIERE · BRAND FILM',
    displayTitle: 'NOIR — BRAND FILM',
    displayCategory: 'BRAND FILM',
    displayDescription: 'THE STORY BEHIND OUR SIGNATURE SILHOUETTE.',
  },
];

export const LOUNGE_TV_HERO_ROTATION_MS = 12_000;

export type LoungeTvMediaState = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'error';

export function packToLoungeVideo(pack: LoungeContentPack): LoungeVideo {
  const progressMap = getWatchProgressMap();
  const row = progressMap[pack.id];
  const durationSec = pack.streaming?.durationSec;
  const progress =
    row && durationSec && durationSec > 0
      ? Math.min(100, Math.round((row.positionSec / durationSec) * 100))
      : undefined;

  return {
    id: pack.id,
    title: pack.title,
    subtitle: pack.subtitle,
    category: pack.category ?? pack.series ?? 'LOUNGE TV',
    description: pack.subtitle ?? pack.article?.intro,
    duration: pack.runtime,
    videoUrl: pack.fullVideo,
    previewVideoUrl: pack.previewVideo ?? pack.fullVideo,
    thumbnailUrl: resolvePackArtwork(pack, 'card'),
    posterUrl: resolvePackArtwork(pack, 'hero'),
    featured: pack.isFeatured ?? pack.featuredRows?.includes('hero'),
    progress,
    saved: getSavedPackIds().includes(pack.id),
    tags: pack.tags,
  };
}

export function getFeaturedVideos(): LoungeVideo[] {
  const out: LoungeVideo[] = [];
  for (const slot of LOUNGE_TV_FEATURED_HERO_ROTATION) {
    const pack = getContentPackById(slot.packId);
    if (!pack) continue;
    const base = packToLoungeVideo(pack);
    out.push({
      ...base,
      featured: true,
      eyebrow: slot.eyebrow,
      title: slot.displayTitle ?? base.title,
      category: slot.displayCategory ?? base.category,
      description: slot.displayDescription ?? base.description,
    });
  }
  return out;
}

export function getFeaturedHeroSlots(): Array<LoungeFeaturedHeroSlot & { pack: LoungeContentPack }> {
  return LOUNGE_TV_FEATURED_HERO_ROTATION.map((slot) => {
    const pack = getContentPackById(slot.packId);
    if (!pack) return null;
    return { ...slot, pack };
  }).filter((s): s is LoungeFeaturedHeroSlot & { pack: LoungeContentPack } => Boolean(s));
}

export function getVideosByCategory(category: string): LoungeVideo[] {
  const needle = category.toUpperCase();
  return LOUNGE_TV_CONTENT_PACKS.filter(
    (p) =>
      (p.category ?? '').toUpperCase().includes(needle) ||
      (p.series ?? '').toUpperCase().includes(needle) ||
      (p.originalSeries ?? '').toUpperCase().includes(needle)
  ).map(packToLoungeVideo);
}

export function getContinueWatching(): LoungeVideo[] {
  const progress = getWatchProgressMap();
  return Object.values(progress)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((row) => getContentPackById(row.packId))
    .filter((p): p is LoungeContentPack => Boolean(p))
    .map(packToLoungeVideo);
}

export function getSavedVideos(): LoungeVideo[] {
  return getSavedPackIds()
    .map((id) => getContentPackById(id))
    .filter((p): p is LoungeContentPack => Boolean(p))
    .map(packToLoungeVideo);
}

export type LoungeLiveUpNextItem = {
  id: string;
  title: string;
  category: string;
  scheduledAt: string;
  duration?: string;
  posterUrl?: string;
};

/** Polished LIVE tab schedule — replace with Supabase/events when wired. */
export const LOUNGE_TV_LIVE_UP_NEXT: LoungeLiveUpNextItem[] = [
  {
    id: 'live-psa-qa',
    title: 'PSA LIVE Q&A: LACE & INSTALL',
    category: 'PSA LIVE Q&A',
    scheduledAt: 'FRI · 7:00 PM ET',
    duration: '45 MIN',
    posterUrl: '/assets/NOIR/noir-thumb.png',
  },
  {
    id: 'live-product-premiere',
    title: 'NOIR TEXTURE PREMIERE',
    category: 'PRODUCT PREMIERES',
    scheduledAt: 'SAT · 2:00 PM ET',
    duration: '30 MIN',
    posterUrl: '/assets/NOIR/blanco-thumb.png',
  },
  {
    id: 'live-member-workshop',
    title: 'MEMBER WORKSHOP: MELT MASTERCLASS',
    category: 'MEMBER WORKSHOPS',
    scheduledAt: 'SUN · 4:00 PM ET',
    duration: '60 MIN',
    posterUrl: '/assets/NOIR/wave-thumb.png',
  },
];

export function getLiveProgramming(): LoungeLiveUpNextItem[] {
  return LOUNGE_TV_LIVE_UP_NEXT;
}

export function resolvePreviewUrl(video: LoungeVideo): string | undefined {
  return video.previewVideoUrl ?? video.videoUrl;
}

export function resolvePosterUrl(video: LoungeVideo): string | undefined {
  return video.posterUrl ?? video.thumbnailUrl;
}
