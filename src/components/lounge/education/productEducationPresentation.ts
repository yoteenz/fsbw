import { getContentPackById } from '../loungeTvContentPack';
import { getActiveSignatureUnitEducationProfiles } from '../../../content/education';
import type { LoungeContentPack } from '../loungeTvContentPack';

export const PRODUCT_EDUCATION_SECTION_TAGLINE =
  'KNOW WHAT YOU\'RE WEARING. KNOW HOW TO USE IT.';

export type ProductEducationGuideId =
  | 'signature-units'
  | 'build-a-wig'
  | 'lace-cap-construction'
  | 'texture-origin'
  | 'care-included';

export type ProductEducationGuideEntry = {
  id: ProductEducationGuideId;
  title: string;
  descriptor: string;
  /** Primary content pack when guide opens watch/read detail. */
  packId?: string;
  /** Optional artwork source when different from destination pack. */
  artworkPackId?: string;
  /** Opens Care Library instead of a content pack. */
  opensCareLibrary?: boolean;
  hero?: boolean;
};

export type SignatureUnitGuideLink = {
  unitId: string;
  displayName: string;
  packId: string;
  descriptor: string;
};

const PRODUCT_EDUCATION_GUIDES: ProductEducationGuideEntry[] = [
  {
    id: 'signature-units',
    title: 'SIGNATURE UNITS',
    descriptor: 'CONSTRUCTION, LACE, DENSITY, TEXTURE, CAP FEATURES.',
    packId: 'brand-film-noir',
    artworkPackId: 'brand-film-noir',
    hero: true,
  },
  {
    id: 'build-a-wig',
    title: 'BUILD-A-WIG',
    descriptor: 'HOW CUSTOMIZATION WORKS.',
    packId: 'baw-academy-intro',
    artworkPackId: 'baw-academy-intro',
  },
  {
    id: 'lace-cap-construction',
    title: 'LACE & CAP CONSTRUCTION',
    descriptor: 'WHAT\'S INSIDE YOUR UNIT.',
    packId: 'plucking-lace',
    artworkPackId: 'cutting-lace',
  },
  {
    id: 'texture-origin',
    title: 'TEXTURE & ORIGIN',
    descriptor: 'UNDERSTAND WHAT YOU PURCHASED.',
    packId: 'texture-spotlight-ocean-curl',
    artworkPackId: 'luxury-hair-science-fiber-care',
  },
  {
    id: 'care-included',
    title: 'CARE INCLUDED WITH YOUR UNIT',
    descriptor: 'WHAT UNLOCKS AFTER PURCHASE.',
    opensCareLibrary: true,
    artworkPackId: 'cleaning-lace',
  },
];

/** Signature unit spotlight links — product breakdown packs. */
const SIGNATURE_UNIT_PACK_MAP: Partial<Record<string, string>> = {
  noir: 'product-breakdown-noir',
  blanco: 'product-breakdown-blanco',
  'soft-wave': 'product-breakdown-soft-wave',
  'beach-wave': 'product-breakdown-beach-wave',
  'soft-curl': 'product-breakdown-soft-curl',
  'ocean-curl': 'product-breakdown-ocean-curl',
};

export function listProductEducationGuides(): ProductEducationGuideEntry[] {
  return PRODUCT_EDUCATION_GUIDES.filter((guide) => {
    if (guide.opensCareLibrary) return true;
    if (!guide.packId) return false;
    return Boolean(getContentPackById(guide.packId));
  });
}

export function getProductEducationHeroGuide(): ProductEducationGuideEntry | undefined {
  return listProductEducationGuides().find((g) => g.hero);
}

export function getProductEducationSupportGuides(): ProductEducationGuideEntry[] {
  return listProductEducationGuides().filter((g) => !g.hero);
}

export function resolveProductEducationGuidePack(guide: ProductEducationGuideEntry): LoungeContentPack | undefined {
  if (!guide.packId) return undefined;
  return getContentPackById(guide.packId);
}

export function resolveProductEducationGuideArtworkPack(guide: ProductEducationGuideEntry): LoungeContentPack | undefined {
  const artId = guide.artworkPackId ?? guide.packId;
  if (!artId) return undefined;
  return getContentPackById(artId);
}

export function listSignatureUnitGuideLinks(): SignatureUnitGuideLink[] {
  const links: SignatureUnitGuideLink[] = [];
  for (const profile of getActiveSignatureUnitEducationProfiles()) {
    const packId = SIGNATURE_UNIT_PACK_MAP[profile.unitId];
    if (!packId || !getContentPackById(packId)) continue;
    links.push({
      unitId: profile.unitId,
      displayName: profile.displayName,
      packId,
      descriptor: `${profile.textureFamily} · ${profile.hairOrigin ?? 'PREMIUM ORIGIN'}`,
    });
  }
  return links;
}

export function guidesForExpandedCategory(guideId: ProductEducationGuideId): ProductEducationGuideEntry[] {
  if (guideId === 'signature-units') {
    return listProductEducationGuides().filter((g) => g.id === 'signature-units');
  }
  const guide = PRODUCT_EDUCATION_GUIDES.find((g) => g.id === guideId);
  return guide ? [guide] : [];
}
