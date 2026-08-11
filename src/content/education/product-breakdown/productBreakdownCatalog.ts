import type { WigUnitSlug } from '../care/productCatalog';
import { getSignatureUnitEducationProfile } from '../signature-units/registry';
import {
  getUnitPdpDetailsConfig,
  type WigUnitKey,
} from '../../../utils/unitPdpDetailsConfig';
import type { ProductBreakdownPresentationEntry } from '../../../components/lounge/education/productBreakdownPresentation';
import type {
  ProductBreakdownAtAGlanceItem,
  ProductBreakdownEditorialContent,
  ProductBreakdownImage,
  ProductBreakdownInspectionPoint,
  ProductBreakdownInteriorCallout,
} from './types';
import { PRODUCT_BREAKDOWN_EDITORIAL_BLANCO } from './product-breakdown-blanco-editorial';
import {
  buildDefaultHeroMedia,
  buildDefaultInspectionPoints,
  getUnitMediaAssets,
} from './unitMediaAssets';
import { getWigUnitProductRoute } from '../../../utils/wigUnitProductRoutes';

const EDITORIAL_BY_UNIT: Partial<Record<WigUnitSlug, ProductBreakdownEditorialContent>> = {
  blanco: PRODUCT_BREAKDOWN_EDITORIAL_BLANCO,
};

const SHARED_LACE = '13×6 HD FILM LACE';
const SHARED_HAIRLINE = 'PRE-PLUCKED HAIRLINE';

function isWigUnitKey(unitId: string): unitId is WigUnitKey {
  return [
    'noir',
    'blanco',
    'soft-wave',
    'beach-wave',
    'soft-curl',
    'ocean-curl',
  ].includes(unitId);
}

function buildSpecLine(_unitId: WigUnitKey, origin: string, pattern: string, density: string): string {
  return `${SHARED_LACE} · RAW ${origin} ${pattern} · ${density}`;
}

function buildAtAGlance(unitId: WigUnitKey, origin: string, pattern: string, density: string): ProductBreakdownAtAGlanceItem[] {
  const hairLabel = pattern.charAt(0) + pattern.slice(1).toLowerCase();
  const items: ProductBreakdownAtAGlanceItem[] = [
    {
      id: 'lace',
      label: 'LACE',
      spec: '13×6 HD Film Lace',
      detail: 'Ultra-thin construction intended to melt seamlessly into the skin.',
    },
    {
      id: 'hair',
      label: 'HAIR',
      spec: `Raw ${origin} ${hairLabel}`,
      detail: 'Single-donor human hair selected for longevity and versatility.',
    },
    {
      id: 'density',
      label: 'DENSITY',
      spec: density,
      detail: 'Handmade fullness from root to tip for volume and styling flexibility.',
    },
    {
      id: 'length',
      label: 'LENGTH',
      spec: '16" – 30"',
      detail: 'True-to-length options available through Build-A-Wig customization.',
    },
    {
      id: 'hairline',
      label: 'HAIRLINE',
      spec: SHARED_HAIRLINE,
      detail:
        unitId === 'blanco'
          ? 'Ventilated single-strand knots for a ready-to-wear melt.'
          : 'Lightly bleached single-strand knots for a natural finish.',
    },
    {
      id: 'cap',
      label: 'CAP / FIT',
      spec: 'Breathable stretch cap',
      detail: 'Removable combs and adjustable elastic band for a secure fit.',
    },
  ];
  return items;
}

const DEFAULT_INTERIOR_CALLOUTS: ProductBreakdownInteriorCallout[] = [
  {
    number: '01',
    label: 'HD FILM LACE',
    body: 'Ultra-thin lace area designed for the most undetectable melt.',
  },
  {
    number: '02',
    label: 'ELASTIC BAND',
    body: 'Built-in band for added security without glue-only reliance.',
  },
  {
    number: '03',
    label: 'REMOVABLE COMBS',
    body: 'Strategically placed combs you can adjust to your install preference.',
  },
  {
    number: '04',
    label: 'ADJUSTABLE STRAP',
    body: 'Customize cap fit for comfort during long wear days.',
  },
];

function mergeImages(
  base: ProductBreakdownImage[],
  overlay?: ProductBreakdownImage[],
): ProductBreakdownImage[] {
  const map = new Map<string, ProductBreakdownImage>();
  for (const img of base) map.set(img.id, img);
  for (const img of overlay ?? []) map.set(img.id, img);
  return [...map.values()].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function resolveInspectionPoints(
  unitId: WigUnitSlug,
  displayName: string,
  heroMedia: ProductBreakdownImage[],
  authored?: ProductBreakdownInspectionPoint[],
): ProductBreakdownInspectionPoint[] {
  const imagePool = [...buildDefaultInspectionPoints(unitId, displayName), ...heroMedia];
  const imageById = new Map(imagePool.map((img) => [img.id, img]));

  if (authored?.length) {
    return authored.map((point) => {
      const img =
        point.image ??
        (point.imageId ? imageById.get(point.imageId) : undefined);
      return { ...point, image: img };
    }).filter((point) => point.image || point.caption);
  }

  return imagePool
    .filter((img) => img.role !== 'hero' || imagePool.length <= 2)
    .slice(0, 5)
    .map((img) => ({
      id: img.id,
      label: img.caption ?? img.alt ?? 'DETAIL',
      caption: img.alt ?? '',
      image: img,
    }));
}

export function resolveProductBreakdownEditorial(
  entry: ProductBreakdownPresentationEntry,
): ProductBreakdownEditorialContent {
  const profile = getSignatureUnitEducationProfile(entry.unitId);
  const authored = EDITORIAL_BY_UNIT[entry.unitId];
  const unitKey = entry.unitId;

  if (!profile || !isWigUnitKey(unitKey)) {
    return {
      id: entry.id,
      unitId: entry.unitId,
      productType: entry.productType,
      ...authored,
    };
  }

  const pdp = getUnitPdpDetailsConfig(unitKey);
  const spec = {
    origin: pdp.bullets[0]?.match(/RAW (\w+)/)?.[1] ?? profile.hairOrigin ?? 'PREMIUM',
    pattern: profile.textureFamily === 'straight' ? 'STRAIGHT' : profile.textureFamily === 'wavy' ? 'WAVY' : 'CURLY',
    density: profile.density ?? '200%',
  };

  const displayName = profile.displayName;
  const heroMedia = mergeImages(buildDefaultHeroMedia(unitKey, displayName), authored?.heroMedia);
  const media = getUnitMediaAssets(unitKey);

  const interiorImage: ProductBreakdownImage | undefined = media?.capInterior
    ? {
        id: `${unitKey}-cap-interior`,
        src: media.capInterior,
        alt: `${displayName} cap interior`,
        role: 'capInterior',
        order: 0,
      }
    : undefined;

  const includedImage: ProductBreakdownImage | undefined = media?.heroFront
    ? {
        id: `${unitKey}-included-hero`,
        src: media.thumb ?? media.heroFront,
        alt: `${displayName} unit`,
        role: 'includedItem',
        order: 0,
      }
    : undefined;

  const defaultBenefits = pdp.signatureFeatures.slice(0, 4).map((feature, index) => ({
    feature: feature.split(' ').slice(0, 3).join(' '),
    meaning: feature,
    whyItMatters:
      index === 0
        ? 'Supports a finer-looking hairline transition at the front.'
        : index === 1
          ? 'Delivers the fullness clients expect from a signature unit.'
          : index === 2
            ? 'Raw origin hair selected for movement and longevity.'
            : 'Construction details that support confident everyday wear.',
  }));

  return {
    id: entry.id,
    unitId: entry.unitId,
    productType: entry.productType,
    thesis: authored?.thesis ?? pdp.intro.split('.')[0] + '.',
    readTime: authored?.readTime ?? '4 MIN',
    heroMedia,
    atAGlance: authored?.atAGlance ?? buildAtAGlance(unitKey, spec.origin, spec.pattern, spec.density),
    inspectionPoints: resolveInspectionPoints(unitKey, displayName, heroMedia, authored?.inspectionPoints),
    interiorCallouts: authored?.interiorCallouts ?? DEFAULT_INTERIOR_CALLOUTS,
    interiorImage: authored?.interiorImage ?? interiorImage,
    productNote: authored?.productNote,
    benefitPoints: authored?.benefitPoints ?? defaultBenefits,
    includedItems: authored?.includedItems ?? [
      { label: '1 SIGNATURE UNIT', detail: 'Delivered in its natural, uncustomized state.' },
    ],
    includedImage: authored?.includedImage ?? includedImage,
    bestFor:
      authored?.bestFor ??
      `Clients seeking a ${spec.pattern.toLowerCase()} ${displayName} silhouette with ${spec.density} density and Build-A-Wig customization.`,
    careNotes:
      authored?.careNotes ??
      profile.educationNotes?.careConsiderations ?? [
        'Handle lace gently and avoid heavy product buildup at the hairline.',
        'Raw hair can be professionally colored when properly cared for.',
      ],
    relatedEducation: authored?.relatedEducation ?? [
      {
        id: `${unitKey}-lace-mastery`,
        label: 'GO DEEPER INTO LACE',
        description: 'Lace Mastery',
        targetType: 'mastery',
        targetId: 'mastery-lace',
      },
      {
        id: `${unitKey}-care-intro`,
        label: 'HOW TO CARE FOR THIS TEXTURE',
        description: 'Intro To Your Unit',
        targetType: 'season',
        targetId: 'season-care-mastery',
      },
    ],
    buildYoursPath: `/build-a-wig/${unitKey}/customize`,
    shopPath: getWigUnitProductRoute(displayName),
  };
}

export function productBreakdownCoreSpecLine(entry: ProductBreakdownPresentationEntry): string {
  const profile = getSignatureUnitEducationProfile(entry.unitId);
  if (!profile || !isWigUnitKey(entry.unitId)) return '';
  const pdp = getUnitPdpDetailsConfig(entry.unitId);
  const origin = profile.hairOrigin ?? pdp.bullets[0]?.match(/RAW (\w+)/)?.[1] ?? 'PREMIUM';
  const pattern =
    profile.textureFamily === 'straight'
      ? 'STRAIGHT'
      : profile.textureFamily === 'wavy'
        ? 'WAVY'
        : 'CURLY';
  const density = profile.density ?? '200%';
  return buildSpecLine(entry.unitId, origin, pattern, density);
}

export function getProductBreakdownEditorialByUnitId(
  unitId: WigUnitSlug,
): ProductBreakdownEditorialContent | undefined {
  return EDITORIAL_BY_UNIT[unitId];
}
