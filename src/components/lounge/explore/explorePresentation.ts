import { getActiveSignatureUnitEducationProfiles } from '../../../content/education';
import {
  contentPackPrimaryRuntimeForCard,
  contentPacksForExploreSection,
  getContentPackById,
  type LoungeContentPack,
} from '../loungeTvContentPack';
import type {
  ExploreBackstageTile,
  ExploreBrandFilmSlot,
  ExploreFeaturedStoryModel,
  ExplorePlaceholderTile,
  ExploreProductRevealSlot,
  ExploreSlayCamStoryTile,
  ExploreTrendTopicTile,
} from './exploreTypes';

const NOIR_ASSETS = {
  noir: '/assets/NOIR/noir-thumb.png',
  blanco: '/assets/NOIR/blanco-thumb.png',
  wave: '/assets/NOIR/wave-thumb.png',
  curl: '/assets/NOIR/curl-thumb.png',
} as const;

const SIGNATURE_UNIT_THUMBS: Record<string, string> = {
  noir: NOIR_ASSETS.noir,
  blanco: NOIR_ASSETS.blanco,
  'soft-wave': NOIR_ASSETS.wave,
  'beach-wave': NOIR_ASSETS.wave,
  'soft-curl': NOIR_ASSETS.curl,
  'ocean-curl': NOIR_ASSETS.curl,
};

function packRuntime(pack: LoungeContentPack): string | undefined {
  return contentPackPrimaryRuntimeForCard(pack) ?? undefined;
}

function truncateLine(text: string | undefined, max = 96): string | undefined {
  if (!text?.trim()) return undefined;
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  const cut = trimmed.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 32 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

/** Editorial spotlight — prefers brand film / behind-brand packs with cinematic copy. */
export function resolveExploreFeaturedStory(): ExploreFeaturedStoryModel | null {
  const brandFilm = getContentPackById('brand-film-noir');
  const behindBrand = getContentPackById('behind-brand-studio');
  const pack =
    brandFilm ??
    behindBrand ??
    contentPacksForExploreSection('brand-films')[0] ??
    contentPacksForExploreSection('behind-brand')[0];

  if (!pack) return null;

  if (pack.id === 'brand-film-noir') {
    return {
      pack,
      eyebrow: 'FEATURED STORY',
      headline: 'BEHIND FRONTAL SLAYER',
      subheadline: 'THE MAKING OF NOIR',
      description: truncateLine(
        pack.subtitle ??
          'A closer look at the details, decisions and craftsmanship behind a signature.'
      ),
      runtimeLabel: packRuntime(pack),
    };
  }

  return {
    pack,
    eyebrow: 'FEATURED STORY',
    headline: pack.category?.toUpperCase() ?? 'EXPLORE',
    subheadline: pack.title,
    description: truncateLine(pack.subtitle),
    runtimeLabel: packRuntime(pack),
  };
}

/** Cinematic poster shelf — real packs first, branded placeholders for unreleased films. */
export function exploreBrandFilmSlots(limit = 4): ExploreBrandFilmSlot[] {
  const packs = contentPacksForExploreSection('brand-films');
  const slots: ExploreBrandFilmSlot[] = packs.map((pack) => ({ kind: 'pack', pack }));

  const placeholderTitles: Array<{ id: string; title: string; imageSrc: string }> = [
    { id: 'brand-film-blanco-slot', title: 'BLANCO', imageSrc: NOIR_ASSETS.blanco },
    { id: 'brand-film-experience-slot', title: 'THE EXPERIENCE', imageSrc: NOIR_ASSETS.wave },
    { id: 'brand-film-movement-slot', title: 'THE MOVEMENT', imageSrc: NOIR_ASSETS.noir },
  ];

  for (const slot of placeholderTitles) {
    if (slots.length >= limit) break;
    if (packs.some((p) => p.title.toUpperCase().includes(slot.title.split(' ')[0] ?? ''))) continue;
    slots.push({
      kind: 'placeholder',
      id: slot.id,
      title: slot.title,
      imageSrc: slot.imageSrc,
      categoryLabel: 'BRAND FILM',
      comingSoon: true,
    });
  }

  return slots.slice(0, limit);
}

/** Backstage collage — pack-driven plus neutral development placeholders. */
export function exploreBackstageTiles(limit = 5): ExploreBackstageTile[] {
  const packs = contentPacksForExploreSection('behind-brand');
  const tiles: ExploreBackstageTile[] = packs.map((pack) => ({
    kind: 'pack',
    pack,
    tileTitle: pack.title.replace(/^BEHIND THE BRAND — /i, '').trim() || pack.title,
  }));

  const placeholders: ExplorePlaceholderTile[] = [
    {
      id: 'bts-design-sessions',
      title: 'DESIGN SESSIONS',
      imageSrc: NOIR_ASSETS.noir,
      runtimeLabel: '3 MIN',
      comingSoon: true,
    },
    {
      id: 'bts-shoot-day',
      title: 'SHOOT DAY DIARIES',
      imageSrc: NOIR_ASSETS.blanco,
      runtimeLabel: '4 MIN',
      comingSoon: true,
    },
    {
      id: 'bts-packaging',
      title: 'PACKAGING PROCESS',
      imageSrc: NOIR_ASSETS.wave,
      runtimeLabel: '2 MIN',
      comingSoon: true,
    },
    {
      id: 'bts-set-life',
      title: 'SET LIFE',
      imageSrc: NOIR_ASSETS.curl,
      runtimeLabel: '5 MIN',
      comingSoon: true,
    },
  ];

  for (const ph of placeholders) {
    if (tiles.length >= limit) break;
    tiles.push({ kind: 'placeholder', ...ph });
  }

  return tiles.slice(0, limit);
}

/** Editorial trend spread — one lead report + supporting topic columns. */
export function exploreTrendReportTiles(): ExploreTrendTopicTile[] {
  const packs = contentPacksForExploreSection('trend-reports');
  const lead = packs[0];
  const tiles: ExploreTrendTopicTile[] = [];

  if (lead) {
    tiles.push({ kind: 'pack', pack: lead, variant: 'lead' });
  }

  const topicPlaceholders = [
    { id: 'trend-color', title: 'COLOR TRENDS', imageSrc: NOIR_ASSETS.curl },
    { id: 'trend-texture', title: 'TEXTURE TRENDS', imageSrc: NOIR_ASSETS.wave },
    { id: 'trend-silhouette', title: 'SILHOUETTE TRENDS', imageSrc: NOIR_ASSETS.noir },
    { id: 'trend-install', title: 'INSTALL TRENDS', imageSrc: NOIR_ASSETS.blanco },
  ];

  for (const topic of topicPlaceholders) {
    tiles.push({
      kind: 'placeholder',
      id: topic.id,
      title: topic.title,
      imageSrc: topic.imageSrc,
      categoryLabel: 'TREND REPORT',
      comingSoon: true,
      variant: 'column',
    });
  }

  return tiles;
}

/** Archive restoration preview — no fabricated historical campaigns. */
export function exploreArchivePreviewYears(): number[] {
  const now = new Date().getFullYear();
  return [now, now - 1, now - 2, now - 3];
}

export function exploreArchiveHasContent(): boolean {
  return contentPacksForExploreSection('the-archive').length > 0;
}

/** Community contact sheet — canonical slay cam packs only. */
export function exploreSlayCamStories(limit = 4): ExploreSlayCamStoryTile[] {
  const packs = contentPacksForExploreSection('slay-cam');
  return packs.slice(0, limit).map((pack, index) => ({
    kind: 'pack',
    pack,
    note: index === 0 ? 'TRANSFORM' : undefined,
  }));
}

const PRODUCT_REVEAL_PACK_BY_UNIT: Partial<Record<string, string>> = {
  'soft-wave': 'product-reveal-soft-wave',
};

/** Premiere shelf — six signature units; reveal pack when available. */
export function exploreProductRevealSlots(limit = 4): ExploreProductRevealSlot[] {
  const profiles = getActiveSignatureUnitEducationProfiles();
  const slots: ExploreProductRevealSlot[] = [];

  for (const profile of profiles) {
    const revealPackId = PRODUCT_REVEAL_PACK_BY_UNIT[profile.unitId];
    const revealPack = revealPackId ? getContentPackById(revealPackId) : undefined;

    if (revealPack) {
      slots.push({
        kind: 'pack',
        pack: revealPack,
        unitName: profile.displayName,
      });
      continue;
    }

    slots.push({
      kind: 'placeholder',
      unitId: profile.unitId,
      unitName: profile.displayName,
      id: `product-reveal-${profile.unitId}`,
      title: `${profile.displayName} — THE REVEAL`,
      imageSrc: SIGNATURE_UNIT_THUMBS[profile.unitId] ?? NOIR_ASSETS.noir,
      runtimeLabel: '2 MIN',
      categoryLabel: 'PRODUCT REVEAL',
      comingSoon: true,
      premiere: false,
    });
  }

  return slots.slice(0, limit);
}

export function resolveExploreSelectablePack(
  tile:
    | ExploreBrandFilmSlot
    | ExploreBackstageTile
    | ExploreTrendTopicTile
    | ExploreSlayCamStoryTile
    | ExploreProductRevealSlot
): LoungeContentPack | null {
  if (tile.kind === 'pack') return tile.pack;
  return null;
}
