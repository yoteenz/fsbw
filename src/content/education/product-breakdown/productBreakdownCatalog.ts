import type { WigUnitSlug } from '../care/productCatalog';
import type { ProductBreakdownPresentationEntry } from '../../../components/lounge/education/productBreakdownPresentation';
import type {
  ProductBreakdownAtAGlanceItem,
  ProductBreakdownEditorialContent,
  ProductBreakdownImage,
  ProductBreakdownInspectionPoint,
  ProductBreakdownInteriorCallout,
} from './types';
import { PRODUCT_BREAKDOWN_EDITORIAL_BLANCO } from './product-breakdown-blanco-editorial';
import { PRODUCT_BREAKDOWN_EDITORIAL_NOIR } from './product-breakdown-noir-editorial';
import {
  buildDefaultHeroMedia,
  buildDefaultInspectionImages,
  buildInteriorImage,
  getUnitMediaAssets,
} from './unitMediaAssets';
import {
  getSignatureUnitCanonicalSpecs,
  signatureUnitCoreSpecLine,
} from './signatureUnitSpecs';
import { getWigUnitProductRoute } from '../../../utils/wigUnitProductRoutes';

const EDITORIAL_BY_UNIT: Partial<Record<WigUnitSlug, Partial<ProductBreakdownEditorialContent>>> = {
  noir: PRODUCT_BREAKDOWN_EDITORIAL_NOIR,
  blanco: PRODUCT_BREAKDOWN_EDITORIAL_BLANCO,
};

function isWigUnitKey(unitId: string): unitId is import('../../../utils/unitPdpDetailsConfig').WigUnitKey {
  return ['noir', 'blanco', 'soft-wave', 'beach-wave', 'soft-curl', 'ocean-curl'].includes(unitId);
}

function buildDefaultAtAGlance(specs: NonNullable<ReturnType<typeof getSignatureUnitCanonicalSpecs>>): ProductBreakdownAtAGlanceItem[] {
  const hairLabel = specs.pattern.charAt(0) + specs.pattern.slice(1).toLowerCase();
  return [
    {
      id: 'lace',
      label: 'LACE',
      spec: specs.lace,
      detail: 'Ultra-thin construction intended to melt seamlessly into the skin.',
    },
    {
      id: 'hair',
      label: 'HAIR',
      spec: `Raw ${specs.origin} ${hairLabel}`,
      detail: 'Single-donor human hair selected for longevity and versatility.',
    },
    {
      id: 'density',
      label: 'DENSITY',
      spec: specs.density,
      detail: 'Handmade fullness from root to tip for volume and styling flexibility.',
    },
    {
      id: 'length',
      label: 'LENGTH',
      spec: specs.lengths,
      detail: 'True-to-length options available through Build-A-Wig customization.',
    },
    {
      id: 'hairline',
      label: 'HAIRLINE',
      spec: specs.hairline,
      detail:
        specs.unitId === 'blanco'
          ? 'Ventilated single-strand knots for a ready-to-wear melt.'
          : 'Lightly bleached single-strand knots for a natural finish.',
    },
    {
      id: 'cap',
      label: 'CAP / FIT',
      spec: specs.cap,
      detail: 'Removable combs and adjustable elastic band for a secure fit.',
    },
  ];
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
  const imagePool = [...buildDefaultInspectionImages(unitId, displayName), ...heroMedia];
  const imageById = new Map(imagePool.map((img) => [img.id, img]));

  if (authored?.length) {
    return authored
      .map((point) => {
        const img = point.image ?? (point.imageId ? imageById.get(point.imageId) : undefined);
        return { ...point, image: img };
      })
      .filter((point) => point.image || point.caption);
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

function buildDefaultBenefits(specs: NonNullable<ReturnType<typeof getSignatureUnitCanonicalSpecs>>) {
  return specs.signatureFeatures.slice(0, 4).map((feature, index) => ({
    feature,
    meaning: '',
    whyItMatters:
      index === 0
        ? 'Supports a finer-looking hairline transition at the front.'
        : index === 1
          ? 'Delivers the fullness clients expect from a signature unit.'
          : index === 2
            ? 'Raw origin hair selected for movement and longevity.'
            : 'Construction details that support confident everyday wear.',
  }));
}

export function resolveProductBreakdownEditorial(
  entry: ProductBreakdownPresentationEntry,
): ProductBreakdownEditorialContent {
  const authored = EDITORIAL_BY_UNIT[entry.unitId];
  const unitKey = entry.unitId;

  if (!isWigUnitKey(unitKey)) {
    return {
      id: entry.id,
      unitId: entry.unitId,
      productType: entry.productType,
      ...authored,
    };
  }

  const specs = getSignatureUnitCanonicalSpecs(unitKey);
  if (!specs) {
    return {
      id: entry.id,
      unitId: entry.unitId,
      productType: entry.productType,
      ...authored,
    };
  }

  const displayName = specs.displayName;
  const heroMedia = mergeImages(buildDefaultHeroMedia(unitKey, displayName), authored?.heroMedia);
  const media = getUnitMediaAssets(unitKey);
  const interiorImage = authored?.interiorImage ?? buildInteriorImage(unitKey, displayName);

  const includedImage: ProductBreakdownImage | undefined =
    authored?.includedImage ??
    (media?.heroFront
      ? {
          id: `${unitKey}-included-hero`,
          src: media.thumb ?? media.heroFront,
          alt: `${displayName} unit`,
          role: 'includedItem',
          order: 0,
        }
      : undefined);

  return {
    id: entry.id,
    unitId: entry.unitId,
    productType: entry.productType,
    thesis: authored?.thesis ?? `${displayName} signature unit — inspect construction, texture, and customization potential.`,
    readTime: authored?.readTime ?? '4 MIN',
    heroMedia,
    atAGlance: authored?.atAGlance ?? buildDefaultAtAGlance(specs),
    inspectionPoints: resolveInspectionPoints(unitKey, displayName, heroMedia, authored?.inspectionPoints),
    interiorCallouts: authored?.interiorCallouts ?? DEFAULT_INTERIOR_CALLOUTS,
    interiorImage,
    productNote: authored?.productNote,
    benefitPoints: authored?.benefitPoints ?? buildDefaultBenefits(specs),
    includedItems: authored?.includedItems ?? [
      { label: '1 SIGNATURE UNIT', detail: 'Delivered in its natural, uncustomized state.' },
    ],
    includedImage,
    bestFor:
      authored?.bestFor ??
      `Clients seeking a ${specs.pattern.toLowerCase()} ${displayName} silhouette with ${specs.density} density and Build-A-Wig customization.`,
    careNotes: authored?.careNotes ?? [
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
  if (!isWigUnitKey(entry.unitId)) return '';
  return signatureUnitCoreSpecLine(entry.unitId);
}

export function getProductBreakdownEditorialByUnitId(
  unitId: WigUnitSlug,
): Partial<ProductBreakdownEditorialContent> | undefined {
  return EDITORIAL_BY_UNIT[unitId];
}
