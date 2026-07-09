import type { XpsProductionPackage } from '../../studio-production-system/types';
import { mutateCreativeOperatingSystemStore, readCreativeOperatingSystemStore } from '../persistence';
import type { XcosEconomyAsset } from '../types';
import type { XcosEconomyAssetType } from '../constants';

function assetId(type: string): string {
  return `econ-${type}-${Date.now()}`;
}

/** Creative Economy Registry™ — reusable company creative resources */
export function registerEconomyAsset(
  asset: Omit<XcosEconomyAsset, 'assetId' | 'createdAt' | 'version'>
): XcosEconomyAsset {
  const full: XcosEconomyAsset = {
    ...asset,
    assetId: assetId(asset.assetType),
    version: '1.0.0',
    createdAt: new Date().toISOString(),
  };

  mutateCreativeOperatingSystemStore((store) => ({
    ...store,
    orgState: store.orgState === 'learning-cycle' ? 'economy-update' : store.orgState,
    economyAssets: [full, ...store.economyAssets].slice(0, 150),
  }));

  return full;
}

export function registerEconomyAssetsFromProduction(pkg: XpsProductionPackage): XcosEconomyAsset[] {
  const assets: XcosEconomyAsset[] = [];

  assets.push(
    registerEconomyAsset({
      assetType: 'virtual-set',
      title: `${pkg.virtualSet.room} — ${pkg.brandId}`,
      description: `${pkg.virtualSet.environment} · ${pkg.virtualSet.atmosphere}`,
      brandId: pkg.brandId,
      sourcePackageId: pkg.packageId,
      sourceDepartment: 'production-design',
      status: 'reusable',
      performanceNotes: pkg.performance?.notes ?? [],
      reuseRecommendation: 'Reuse for similar narrative types on same brand',
    })
  );

  assets.push(
    registerEconomyAsset({
      assetType: 'production-blueprint',
      title: `Production blueprint: ${pkg.topic}`,
      description: `Department workflow for ${pkg.platform}`,
      brandId: pkg.brandId,
      sourcePackageId: pkg.packageId,
      sourceDepartment: 'production-director',
      status: 'reusable',
      performanceNotes: [],
      reuseRecommendation: 'Apply department sequencing to future packages',
    })
  );

  if (pkg.assets.length > 0) {
    assets.push(
      registerEconomyAsset({
        assetType: 'narrative-template',
        title: `Narrative template: ${pkg.topic}`,
        description: `${pkg.assets.length} tracked assets`,
        brandId: pkg.brandId,
        sourcePackageId: pkg.packageId,
        sourceDepartment: 'story-department',
        status: 'draft',
        performanceNotes: [],
        reuseRecommendation: 'Promote to preferred after performance validation',
      })
    );
  }

  return assets;
}

export function listEconomyAssets(brandId?: string): XcosEconomyAsset[] {
  const assets = readCreativeOperatingSystemStore().economyAssets;
  return brandId ? assets.filter((a) => a.brandId === brandId) : assets;
}

export function promoteEconomyAsset(assetId: string, status: XcosEconomyAsset['status']): void {
  mutateCreativeOperatingSystemStore((store) => ({
    ...store,
    economyAssets: store.economyAssets.map((a) => (a.assetId === assetId ? { ...a, status } : a)),
  }));
}

export function getEconomyAssetsByType(type: XcosEconomyAssetType): XcosEconomyAsset[] {
  return listEconomyAssets().filter((a) => a.assetType === type);
}

export function countEconomyAssets(): number {
  return readCreativeOperatingSystemStore().economyAssets.length;
}
