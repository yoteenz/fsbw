import type { StudioServiceStub } from '../types';
import {
  DERIVATIVE_CROP_TEMPLATES,
  DERIVATIVE_SITE_BINDINGS,
  DERIVATIVE_SLOT_DEFINITIONS,
  prepareDerivativesOnHeroApproval,
  resolveDerivativeForSiteAsset,
  type PhotographyProductLine,
} from '../../../studio-os/product-photography';
import {
  getDerivativeEngineResult,
  listDerivativeEngineResults,
  prepareAndPersistDerivatives,
} from '../../../hooks/useAdminStudioPhotographyDerivativesState';

export type PhotographyDerivativeEngineSnapshot = {
  slotCount: number;
  cropTemplateCount: number;
  siteBindingCount: number;
  preparedUnits: ReturnType<typeof listDerivativeEngineResults>;
};

export function getPhotographyDerivativeEngineSnapshot(): PhotographyDerivativeEngineSnapshot {
  return {
    slotCount: DERIVATIVE_SLOT_DEFINITIONS.length,
    cropTemplateCount: DERIVATIVE_CROP_TEMPLATES.length,
    siteBindingCount: DERIVATIVE_SITE_BINDINGS.length,
    preparedUnits: listDerivativeEngineResults(),
  };
}

export function runHeroApprovalDerivativePipeline(productLine: PhotographyProductLine, unitSlug: string) {
  return prepareAndPersistDerivatives(productLine, unitSlug);
}

export function resolveSiteAssetFromDerivatives(assetKey: string, productLine: PhotographyProductLine, unitSlug: string) {
  const bundle = getDerivativeEngineResult(productLine, unitSlug);
  if (!bundle) return null;
  return resolveDerivativeForSiteAsset(assetKey, bundle.derivatives);
}

export const photographyDerivativeEngineStudioService: StudioServiceStub & {
  getSnapshot(): PhotographyDerivativeEngineSnapshot;
  prepareOnHeroApproval(productLine: PhotographyProductLine, unitSlug: string): ReturnType<typeof prepareDerivativesOnHeroApproval>;
  resolveSiteAsset(assetKey: string, productLine: PhotographyProductLine, unitSlug: string): ReturnType<typeof resolveSiteAssetFromDerivatives>;
} = {
  id: 'photography-derivative-engine',
  label: 'PHOTOGRAPHY DERIVATIVE ENGINE',
  phase: 2,
  enabled: true,
  description: 'AUTO DERIVATIVE SLOTS FROM APPROVED HERO · CROP TEMPLATES · SITE ASSET BINDINGS · NO IMAGE PROCESSING YET',
  getSnapshot: getPhotographyDerivativeEngineSnapshot,
  prepareOnHeroApproval: (productLine, unitSlug) => prepareAndPersistDerivatives(productLine, unitSlug),
  resolveSiteAsset: resolveSiteAssetFromDerivatives,
};
