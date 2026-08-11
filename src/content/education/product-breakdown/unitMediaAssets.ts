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

/** Public asset paths — encode spaces for reliable loading. */
const A = {
  noirFront: '/assets/NOIR/noir%20front.png',
  noirLeft: '/assets/NOIR/noir%20left.png',
  noirRight: '/assets/NOIR/noir%20right.png',
  noirThumb: '/assets/NOIR/noir-thumb.png',
  blancoFront: '/assets/2D%20BLANCO%20FRONT.png',
  blancoLeft: '/assets/2D%20BLANCO%20LEFT.png',
  blancoRight: '/assets/2D%20BLANCO%20RIGHT.png',
  blancoThumb: '/assets/NOIR/blanco-thumb.png',
  wavyFront: '/assets/2D%20WAVY%20FRONT.png',
  wavyLeft: '/assets/2D%20WAVY%20LEFT.png',
  wavyRight: '/assets/2D%20WAVY%20RIGHT.png',
  waveThumb: '/assets/NOIR/wave-thumb.png',
  curlyFront: '/assets/2D%20CURLY%20FRONT.png',
  curlyLeft: '/assets/2D%20CURLY%20LEFT.png',
  curlyRight: '/assets/2D%20CURLY%20RIGHT.png',
  curlThumb: '/assets/NOIR/curl-thumb.png',
  hairlineMacro: '/assets/BLANCO%20Hairline.png',
  laceMacro: '/assets/BLANCO%20LACE.png',
  capInterior: '/assets/NOIR/mannequin%20bottom.png',
};

const UNIT_MEDIA: Partial<Record<WigUnitSlug, UnitMediaSet>> = {
  noir: {
    thumb: A.noirThumb,
    heroFront: A.noirFront,
    heroLeft: A.noirLeft,
    heroRight: A.noirRight,
    hairlineMacro: A.hairlineMacro,
    laceMacro: A.laceMacro,
    capInterior: A.capInterior,
  },
  blanco: {
    thumb: A.blancoThumb,
    heroFront: A.blancoFront,
    heroLeft: A.blancoLeft,
    heroRight: A.blancoRight,
    hairlineMacro: A.hairlineMacro,
    laceMacro: A.laceMacro,
    capInterior: A.capInterior,
  },
  'soft-wave': {
    thumb: A.waveThumb,
    heroFront: A.wavyFront,
    heroLeft: A.wavyLeft,
    heroRight: A.wavyRight,
    hairlineMacro: A.hairlineMacro,
    laceMacro: A.laceMacro,
    capInterior: A.capInterior,
  },
  'beach-wave': {
    thumb: A.waveThumb,
    heroFront: A.wavyFront,
    heroLeft: A.wavyLeft,
    heroRight: A.wavyRight,
    hairlineMacro: A.hairlineMacro,
    laceMacro: A.laceMacro,
    capInterior: A.capInterior,
  },
  'soft-curl': {
    thumb: A.curlThumb,
    heroFront: A.curlyFront,
    heroLeft: A.curlyLeft,
    heroRight: A.curlyRight,
    hairlineMacro: A.hairlineMacro,
    laceMacro: A.laceMacro,
    capInterior: A.capInterior,
  },
  'ocean-curl': {
    thumb: A.curlThumb,
    heroFront: A.curlyFront,
    heroLeft: A.curlyLeft,
    heroRight: A.curlyRight,
    hairlineMacro: A.hairlineMacro,
    laceMacro: A.laceMacro,
    capInterior: A.capInterior,
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

export function buildDefaultInspectionImages(
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
      order: 0,
    });
  }
  if (media.laceMacro) {
    points.push({
      id: `${unitId}-inspect-lace`,
      src: media.laceMacro,
      alt: `${displayName} HD film lace`,
      role: 'laceMacro',
      order: 1,
    });
  }
  if (media.heroLeft) {
    points.push({
      id: `${unitId}-inspect-side`,
      src: media.heroLeft,
      alt: `${displayName} side profile`,
      role: 'sideProfile',
      order: 2,
    });
  }
  if (media.heroRight) {
    points.push({
      id: `${unitId}-inspect-right`,
      src: media.heroRight,
      alt: `${displayName} alternate angle`,
      role: 'supporting',
      order: 3,
    });
  }

  return points;
}

/** @deprecated Use buildDefaultInspectionImages */
export const buildDefaultInspectionPoints = buildDefaultInspectionImages;

export function buildInteriorImage(unitId: WigUnitSlug, displayName: string): ProductBreakdownImage | undefined {
  const media = getUnitMediaAssets(unitId);
  if (!media?.capInterior) return undefined;

  const annotations =
    unitId === 'noir'
      ? [
          { id: 'noir-ann-1', label: '01', x: 48, y: 18 },
          { id: 'noir-ann-2', label: '02', x: 72, y: 52 },
          { id: 'noir-ann-3', label: '03', x: 28, y: 62 },
          { id: 'noir-ann-4', label: '04', x: 55, y: 78 },
        ]
      : undefined;

  return {
    id: `${unitId}-cap-interior`,
    src: media.capInterior,
    alt: `${displayName} cap interior`,
    role: 'capInterior',
    order: 0,
    objectPosition: 'center center',
    annotations,
  };
}
