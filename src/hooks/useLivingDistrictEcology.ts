import { useMemo } from 'react';
import {
  computeLivingDistrictEcology,
  effectiveTierForDistrict,
  type LivingDistrictEcologySnapshot,
} from '../studio-os-core/living-district-ecology';
import type { DistrictThemeId } from '../studio-os-core/architectural-navigation/district-themes';
import type { WarehouseAsset } from '../studio-os-core/studio-warehouse';
import {
  aggregateLivingArchitectureMetrics,
  useLivingArchitecture,
  type LivingArchitectureSnapshot,
} from './useLivingArchitecture';

export type LivingCampusSnapshot = {
  architecture: LivingArchitectureSnapshot;
  ecology: LivingDistrictEcologySnapshot;
};

/**
 * Living District Ecology™ — interconnected ecosystem layered on Living Architecture™.
 */
export function useLivingDistrictEcology(catalog: WarehouseAsset[]): LivingCampusSnapshot {
  const architecture = useLivingArchitecture(catalog);

  const ecology = useMemo(() => {
    const metrics = aggregateLivingArchitectureMetrics(catalog);
    return computeLivingDistrictEcology(architecture, metrics);
  }, [architecture, catalog]);

  return { architecture, ecology };
}

export function effectiveCampusTier(
  districtId: DistrictThemeId,
  campus: LivingCampusSnapshot
): number {
  return effectiveTierForDistrict(districtId, campus.ecology);
}

export {
  livingArchitectureClassForDistrict,
  prototypeVaultBayCount,
  museumGalleryCount,
} from './useLivingArchitecture';

export { effectiveTierForDistrict, type LivingDistrictEcologySnapshot };
