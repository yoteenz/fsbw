import type { WigUnitSlug } from '../care/productCatalog';
import type { ProductBreakdownImage } from './types';

type UnitMediaSet = {
  thumb: string;
  heroFront: string;
  heroLeft?: string;
  heroRight?: string;
  hairlineMacro?: string;
  laceMacro?: string;
  capInterior?: string;
};

const UNIT_MEDIA: Partial<Record<WigUnitSlug, UnitMediaSet>> = {
  noir: {
    thumb: '/assets/NOIR/noir-thumb.png',
    heroFront: '/assets/2D%20NOIR%20FRONT.png',
    heroLeft: '/assets/2D%20NOIR%20LEFT.png',
    heroRight: '/assets/2D%20NOIR%20RIGHT.png',
    hairlineMacro: '/assets/BLANCO%20Hairline.png',
    laceMacro: '/assets/BLANCO%20LACE.png',
    capInterior: '/assets/NOIR/mannequin%20bottom.png',
  },
  blanco: {
    thumb: '/assets/NOIR/blanco-thumb.png',
    heroFront: '/assets/2D%20BLANCO%20FRONT.png',
    heroLeft: '/assets/2D%20BLANCO%20LEFT.png',
    heroRight: '/assets/2D%20BLANCO%20RIGHT.png',
    hairlineMacro: '/assets/BLANCO%20Hairline.png',
    laceMacro: '/assets/BLANCO%20LACE.png',
    capInterior: '/assets/NOIR/mannequin%20bottom.png',
  },
  'soft-wave': {
    thumb: '/assets/NOIR/wave-thumb.png',
    heroFront: '/assets/NOIR/wave-thumb.png',
  },
  'beach-wave': {
    thumb: '/assets/NOIR/wave-thumb.png',
    heroFront: '/assets/NOIR/wave-thumb.png',
  },
  'soft-curl': {
    thumb: '/assets/NOIR/curl-thumb.png',
    heroFront: '/assets/NOIR/curl-thumb.png',
  },
  'ocean-curl': {
    thumb: '/assets/NOIR/curl-thumb.png',
    heroFront: '/assets/NOIR/curl-thumb.png',
  },
};

export function getUnitMediaAssets(unitId: WigUnitSlug): UnitMediaSet | undefined {
  return UNIT_MEDIA[unitId];
}

export function buildDefaultHeroMedia(unitId: WigUnitSlug, displayName: string): ProductBreakdownImage[] {
  const media = getUnitMediaAssets(unitId);
  if (!media) return [];

  const items: ProductBreakdownImage[] = [
    {
      id: `${unitId}-hero-front`,
      src: media.heroFront,
      alt: `${displayName} front view`,
      role: 'hero',
      order: 0,
      objectPosition: 'center 35%',
    },
  ];

  if (media.hairlineMacro) {
    items.push({
      id: `${unitId}-hairline-macro`,
      src: media.hairlineMacro,
      alt: `${displayName} hairline detail`,
      role: 'hairline',
      order: 1,
      objectPosition: 'center 42%',
    });
  }

  if (media.heroLeft) {
    items.push({
      id: `${unitId}-side-profile`,
      src: media.heroLeft,
      alt: `${displayName} side profile`,
      role: 'sideProfile',
      order: 2,
      objectPosition: 'center center',
    });
  }

  return items;
}

export function buildDefaultInspectionPoints(
  unitId: WigUnitSlug,
  displayName: string,
): ProductBreakdownImage[] {
  const media = getUnitMediaAssets(unitId);
  if (!media) return [];
  const points: ProductBreakdownImage[] = [];

  if (media.hairlineMacro) {
    points.push({
      id: `${unitId}-inspect-hairline`,
      src: media.hairlineMacro,
      alt: `${displayName} pre-plucked hairline`,
      role: 'hairline',
      caption: 'PRE-PLUCKED HAIRLINE',
      order: 0,
    });
  }
  if (media.laceMacro) {
    points.push({
      id: `${unitId}-inspect-lace`,
      src: media.laceMacro,
      alt: `${displayName} HD film lace`,
      role: 'laceMacro',
      caption: 'HD FILM LACE',
      order: 1,
    });
  }
  if (media.heroLeft) {
    points.push({
      id: `${unitId}-inspect-side`,
      src: media.heroLeft,
      alt: `${displayName} side profile`,
      role: 'sideProfile',
      caption: 'SIDE PROFILE',
      order: 2,
    });
  }
  if (media.heroRight) {
    points.push({
      id: `${unitId}-inspect-right`,
      src: media.heroRight,
      alt: `${displayName} alternate angle`,
      role: 'supporting',
      caption: 'CONSTRUCTION VIEW',
      order: 3,
    });
  }

  return points;
}
