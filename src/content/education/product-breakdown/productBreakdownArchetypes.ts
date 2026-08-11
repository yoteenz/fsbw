import type { WigUnitSlug } from '../care/productCatalog';

export type ProductBreakdownArchetypeId =
  | 'anatomyPrecision'
  | 'colorTransformation'
  | 'movementSoftness'
  | 'effortlessTexture'
  | 'definitionVolume'
  | 'curlDepth';

export type ProductBreakdownArchetype = {
  id: ProductBreakdownArchetypeId;
  label: string;
  editorialIdentity: string;
};

export const PRODUCT_BREAKDOWN_ARCHETYPES: Record<
  WigUnitSlug,
  ProductBreakdownArchetype
> = {
  noir: {
    id: 'anatomyPrecision',
    label: 'NOIR',
    editorialIdentity: 'Anatomy / precision / construction',
  },
  blanco: {
    id: 'colorTransformation',
    label: 'BLANCO',
    editorialIdentity: 'Color canvas / transformation',
  },
  'soft-wave': {
    id: 'movementSoftness',
    label: 'SOFT WAVE',
    editorialIdentity: 'Movement / softness',
  },
  'beach-wave': {
    id: 'effortlessTexture',
    label: 'BEACH WAVE',
    editorialIdentity: 'Effortless texture / undone movement',
  },
  'soft-curl': {
    id: 'definitionVolume',
    label: 'SOFT CURL',
    editorialIdentity: 'Definition / volume',
  },
  'ocean-curl': {
    id: 'curlDepth',
    label: 'OCEAN CURL',
    editorialIdentity: 'Depth / dramatic curl pattern',
  },
};

export function getProductBreakdownArchetype(
  unitId: WigUnitSlug,
): ProductBreakdownArchetype | undefined {
  return PRODUCT_BREAKDOWN_ARCHETYPES[unitId];
}
