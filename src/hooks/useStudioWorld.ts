import { useMemo } from 'react';
import {
  computeCivilizationEvents,
  type CivilizationEventsSnapshot,
} from '../studio-os-core/civilization-events';
import type { DistrictThemeId } from '../studio-os-core/architectural-navigation/district-themes';
import type { WarehouseAsset } from '../studio-os-core/studio-warehouse';
import { aggregateLivingArchitectureMetrics } from './useLivingArchitecture';
import {
  useLivingCivilization,
  civilizationLayerForDistrict,
  type LivingWorldSnapshot,
} from './useLivingCivilization';
import { effectiveCampusTier } from './useLivingDistrictEcology';
import {
  livingArchitectureClassForDistrict,
  prototypeVaultBayCount,
  museumGalleryCount,
} from './useLivingDistrictEcology';

export type StudioWorldSnapshot = LivingWorldSnapshot & {
  events: CivilizationEventsSnapshot;
};

/**
 * Studio World™ — full living stack:
 * Architecture → Ecology → Civilization → Events
 */
export function useStudioWorld(catalog: WarehouseAsset[]): StudioWorldSnapshot {
  const world = useLivingCivilization(catalog);

  const events = useMemo(() => {
    const metrics = aggregateLivingArchitectureMetrics(catalog);
    return computeCivilizationEvents(world.civilization, {
      warehouseAssetCount: metrics.warehouseAssetCount,
      warehouseGoldenBuildTotal: metrics.warehouseGoldenBuildTotal,
      warehouseFavoriteCount: metrics.warehouseFavoriteCount,
    });
  }, [world.civilization, catalog]);

  return { ...world, events };
}

export function effectiveCampusTierForDistrict(
  districtId: DistrictThemeId,
  world: StudioWorldSnapshot
): number {
  return effectiveCampusTier(districtId, world);
}

export {
  effectiveCampusTier,
  livingArchitectureClassForDistrict,
  prototypeVaultBayCount,
  museumGalleryCount,
  civilizationLayerForDistrict,
  type CivilizationEventsSnapshot,
};
