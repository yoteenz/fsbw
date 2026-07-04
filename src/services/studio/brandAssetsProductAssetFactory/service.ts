import type { StudioServiceStub } from '../types';
import {
  FACTORY_CROP_TEMPLATES,
  FACTORY_POC_DERIVATIVE_OUTPUTS,
  PRODUCT_ASSET_FACTORY_POC_UNIT,
  PRODUCT_ASSET_FACTORY_STAGES,
  resolveCreativeDnaForAssetFactory,
} from '../../../studio-os/product-photography';
import {
  getLatestProductAssetFactoryJob,
  type ProductAssetFactoryStore,
} from '../../../hooks/useAdminStudioBrandAssetsProductAssetFactoryState';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson } from '../../../utils/adminStudioStorage';

export type BrandAssetsProductAssetFactorySnapshot = {
  pocUnit: typeof PRODUCT_ASSET_FACTORY_POC_UNIT;
  stages: typeof PRODUCT_ASSET_FACTORY_STAGES;
  cropTemplateCount: number;
  derivativeOutputCount: number;
  latestJob: ReturnType<typeof getLatestProductAssetFactoryJob>;
  registryCount: number;
  creativeDnaVersion: string;
  creativeDnaLockStatus: string;
};

function readStore(): ProductAssetFactoryStore {
  return (
    readStudioJson<ProductAssetFactoryStore>(ADMIN_STUDIO_STORAGE_KEYS.brandAssetsProductAssetFactory) ?? {
      jobs: [],
      registry: [],
      logs: [],
    }
  );
}

export function getBrandAssetsProductAssetFactorySnapshot(): BrandAssetsProductAssetFactorySnapshot {
  const store = readStore();
  const creativeDna = resolveCreativeDnaForAssetFactory(PRODUCT_ASSET_FACTORY_POC_UNIT.slug);
  return {
    pocUnit: PRODUCT_ASSET_FACTORY_POC_UNIT,
    stages: PRODUCT_ASSET_FACTORY_STAGES,
    cropTemplateCount: FACTORY_CROP_TEMPLATES.length,
    derivativeOutputCount: FACTORY_POC_DERIVATIVE_OUTPUTS.length,
    latestJob: getLatestProductAssetFactoryJob(PRODUCT_ASSET_FACTORY_POC_UNIT.slug),
    registryCount: store.registry.filter((r: { productSlug: string }) => r.productSlug === PRODUCT_ASSET_FACTORY_POC_UNIT.slug).length,
    creativeDnaVersion: creativeDna.dna.version,
    creativeDnaLockStatus: creativeDna.dna.lockStatus,
  };
}

export const brandAssetsProductAssetFactoryStudioService: StudioServiceStub & {
  getSnapshot(): BrandAssetsProductAssetFactorySnapshot;
} = {
  id: 'brand-assets-product-asset-factory',
  label: 'BRAND ASSETS · ASSET FACTORY',
  phase: 2,
  enabled: true,
  description: 'PHOTOGRAPHY BIBLE MASTER → IDEogram BG REMOVAL → CROP DERIVATIVES → SUPABASE · SOFT WAVE POC',
  getSnapshot: getBrandAssetsProductAssetFactorySnapshot,
};
