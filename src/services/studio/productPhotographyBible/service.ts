import type { StudioServiceStub } from '../types';
import {
  PHOTOGRAPHY_BIBLE_INHERITANCE_CHAIN,
  PHOTOGRAPHY_LOCKED_SPECIFICATIONS,
} from '../../../utils/adminStudioProductPhotographyBibleDemo';
import {
  getPhotographyBibleUnit,
  listPhotographyBibleUnits,
} from '../../../hooks/useAdminStudioProductPhotographyBibleState';
import {
  inheritPhotographyBibleForProduct,
  getCurrentPhotographyVersion,
  PHOTOGRAPHY_INHERITANCE_FIELDS,
} from '../../../studio-os/product-photography';

export type ProductPhotographyBibleSnapshot = {
  version: ReturnType<typeof getCurrentPhotographyVersion>;
  lockedSpecifications: typeof PHOTOGRAPHY_LOCKED_SPECIFICATIONS;
  inheritanceChain: readonly string[];
  inheritanceFields: typeof PHOTOGRAPHY_INHERITANCE_FIELDS;
  signatureUnits: ReturnType<typeof listPhotographyBibleUnits>;
};

export type ProductPhotographyInheritance = ReturnType<typeof inheritPhotographyBibleForProduct>;

export function getPhotographyBibleSnapshot(): ProductPhotographyBibleSnapshot {
  return {
    version: getCurrentPhotographyVersion(),
    lockedSpecifications: PHOTOGRAPHY_LOCKED_SPECIFICATIONS,
    inheritanceChain: PHOTOGRAPHY_BIBLE_INHERITANCE_CHAIN,
    inheritanceFields: PHOTOGRAPHY_INHERITANCE_FIELDS,
    signatureUnits: listPhotographyBibleUnits(),
  };
}

export function inheritPhotographyForNewProduct(productSlug: string): ProductPhotographyInheritance {
  return inheritPhotographyBibleForProduct(productSlug);
}

export function getUnitPhotographyRecord(slug: string) {
  return getPhotographyBibleUnit(slug) ?? null;
}

export const PHOTOGRAPHY_BIBLE_INHERITANCE_CHAIN_EXPORT = PHOTOGRAPHY_BIBLE_INHERITANCE_CHAIN;

export const productPhotographyBibleStudioService: StudioServiceStub & {
  getSnapshot(): ProductPhotographyBibleSnapshot;
  inheritForProduct(slug: string): ProductPhotographyInheritance;
} = {
  id: 'product-photography-bible',
  label: 'PHOTOGRAPHY BIBLE',
  phase: 2,
  enabled: true,
  description: 'PRODUCT PHOTOGRAPHY SPEC · SIGNATURE COLLECTION · MEDIA KIT ARCHITECTURE · V1.0 IMMUTABLE',
  getSnapshot: getPhotographyBibleSnapshot,
  inheritForProduct: inheritPhotographyForNewProduct,
};
