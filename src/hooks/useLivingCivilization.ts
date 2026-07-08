import { useMemo } from 'react';
import {
  computeLivingCivilization,
  civilizationLayerForDistrict,
  type LivingCivilizationSnapshot,
} from '../studio-os-core/living-civilization';
import type { DistrictThemeId } from '../studio-os-core/architectural-navigation/district-themes';
import type { WarehouseAsset } from '../studio-os-core/studio-warehouse';
import { aggregateLivingArchitectureMetrics } from './useLivingArchitecture';
import { useLivingDistrictEcology, type LivingCampusSnapshot } from './useLivingDistrictEcology';

export type LivingWorldSnapshot = LivingCampusSnapshot & {
  civilization: LivingCivilizationSnapshot;
};

/**
 * Living Civilization™ — architecture → ecology → self-balancing civilization.
 */
export function useLivingCivilization(catalog: WarehouseAsset[]): LivingWorldSnapshot {
  const campus = useLivingDistrictEcology(catalog);

  const civilization = useMemo(() => {
    const metrics = aggregateLivingArchitectureMetrics(catalog);
    return computeLivingCivilization(campus.architecture, campus.ecology, metrics);
  }, [campus.architecture, campus.ecology, catalog]);

  return { ...campus, civilization };
}

export function activeCivilizationLayer(
  districtId: DistrictThemeId,
  world: LivingWorldSnapshot
): import('../studio-os-core/living-civilization/types').CivilizationLayerState | null {
  const layerId = civilizationLayerForDistrict(districtId);
  return layerId ? world.civilization.layers[layerId] : null;
}

export {
  civilizationLayerForDistrict,
  type LivingCivilizationSnapshot,
};

export {
  effectiveCampusTier,
  livingArchitectureClassForDistrict,
  prototypeVaultBayCount,
  museumGalleryCount,
} from './useLivingDistrictEcology';
