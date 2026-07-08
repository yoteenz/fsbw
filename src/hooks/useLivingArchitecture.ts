import { useMemo } from 'react';
import {
  computeLivingArchitecture,
  livingArchitectureClassForDistrict,
  prototypeVaultBayCount,
  museumGalleryCount,
  type LivingArchitectureSnapshot,
} from '../studio-os-core/living-architecture';
import type { WarehouseAsset } from '../studio-os-core/studio-warehouse';

export type LivingArchitectureMetrics = {
  warehouseAssetCount: number;
  warehouseReuseTotal: number;
  warehouseGoldenBuildTotal: number;
  warehouseFavoriteCount: number;
};

export function aggregateLivingArchitectureMetrics(
  catalog: WarehouseAsset[]
): LivingArchitectureMetrics {
  const active = catalog.filter((a) => !a.archived);
  return {
    warehouseAssetCount: active.length,
    warehouseReuseTotal: active.reduce((sum, a) => sum + a.reuseCount, 0),
    warehouseGoldenBuildTotal: active.reduce((sum, a) => sum + a.goldenBuildCount, 0),
    warehouseFavoriteCount: active.filter((a) => a.favorite).length,
  };
}

/**
 * Living Architecture™ — campus evolution derived from earned warehouse + campus signals.
 */
export function useLivingArchitecture(catalog: WarehouseAsset[]): LivingArchitectureSnapshot {
  return useMemo(() => {
    const metrics = aggregateLivingArchitectureMetrics(catalog);
    return computeLivingArchitecture(metrics);
  }, [catalog]);
}

export {
  livingArchitectureClassForDistrict,
  prototypeVaultBayCount,
  museumGalleryCount,
  type LivingArchitectureSnapshot,
};
