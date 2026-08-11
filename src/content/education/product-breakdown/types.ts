import type { WigUnitSlug } from '../care/productCatalog';
import type { SlayTipImageAnnotation } from '../types';

export type ProductBreakdownMediaRole =
  | 'hero'
  | 'hairline'
  | 'laceMacro'
  | 'parting'
  | 'capInterior'
  | 'sideProfile'
  | 'textureMacro'
  | 'ends'
  | 'comparison'
  | 'includedItem'
  | 'supporting';

export type ProductBreakdownImage = {
  id: string;
  src: string;
  alt?: string;
  caption?: string;
  role?: ProductBreakdownMediaRole;
  objectPosition?: string;
  order?: number;
  annotations?: SlayTipImageAnnotation[];
};

export type ProductBreakdownAtAGlanceItem = {
  id: string;
  label: string;
  spec: string;
  detail: string;
  /** Presentation tier — layouts decide visual hierarchy. */
  tier?: 'primary' | 'secondary';
};

export type ProductBreakdownInspectionPoint = {
  id: string;
  label: string;
  caption: string;
  imageId?: string;
  image?: ProductBreakdownImage;
};

export type ProductBreakdownInteriorCallout = {
  number: string;
  label: string;
  body: string;
};

export type ProductBreakdownBenefitPoint = {
  feature: string;
  meaning: string;
  whyItMatters: string;
};

export type ProductBreakdownIncludedItem = {
  label: string;
  detail?: string;
};

export type ProductBreakdownRelatedEducation = {
  id: string;
  label: string;
  description?: string;
  targetType: 'mastery' | 'season' | 'slay-tip' | 'psa-answer' | 'psa-episode';
  targetId: string;
};

export type ProductBreakdownEditorialContent = {
  id: string;
  unitId: WigUnitSlug;
  productType: string;
  thesis?: string;
  readTime?: string;
  heroMedia?: ProductBreakdownImage[];
  atAGlance?: ProductBreakdownAtAGlanceItem[];
  inspectionPoints?: ProductBreakdownInspectionPoint[];
  interiorCallouts?: ProductBreakdownInteriorCallout[];
  interiorImageId?: string;
  interiorImage?: ProductBreakdownImage;
  productNote?: { number?: string; body: string };
  benefitPoints?: ProductBreakdownBenefitPoint[];
  includedItems?: ProductBreakdownIncludedItem[];
  includedImageId?: string;
  includedImage?: ProductBreakdownImage;
  bestFor?: string;
  careNotes?: string[];
  relatedEducation?: ProductBreakdownRelatedEducation[];
  buildYoursPath?: string;
  shopPath?: string;
};
