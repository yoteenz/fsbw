export type {
  ProductBreakdownAtAGlanceItem,
  ProductBreakdownBenefitPoint,
  ProductBreakdownEditorialContent,
  ProductBreakdownImage,
  ProductBreakdownIncludedItem,
  ProductBreakdownInspectionPoint,
  ProductBreakdownInteriorCallout,
  ProductBreakdownRelatedEducation,
} from './types';

export {
  getProductBreakdownEditorialByUnitId,
  productBreakdownCoreSpecLine,
  resolveProductBreakdownEditorial,
} from './productBreakdownCatalog';

export { PRODUCT_BREAKDOWN_EDITORIAL_BLANCO } from './product-breakdown-blanco-editorial';
export { PRODUCT_BREAKDOWN_EDITORIAL_NOIR } from './product-breakdown-noir-editorial';
export {
  getProductBreakdownArchetype,
  PRODUCT_BREAKDOWN_ARCHETYPES,
  type ProductBreakdownArchetype,
  type ProductBreakdownArchetypeId,
} from './productBreakdownArchetypes';
export {
  getSignatureUnitCanonicalSpecs,
  signatureUnitCoreSpecLine,
  type SignatureUnitCanonicalSpecs,
} from './signatureUnitSpecs';
