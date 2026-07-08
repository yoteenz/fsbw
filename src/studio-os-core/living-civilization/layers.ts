/**
 * Civilization Layers™ — seven living systems that continuously influence one another.
 */

import type { DistrictThemeId } from '../architectural-navigation/district-themes';
import type { LivingDistrictEcologySnapshot } from '../living-district-ecology/types';
import type { CivilizationLayerId, CivilizationLayerState, EconomyId } from './types';

export const CIVILIZATION_LAYER_DEFS: Array<{
  id: CivilizationLayerId;
  label: string;
  primaryDistrict: DistrictThemeId;
  fueledBy: EconomyId[];
  influences: CivilizationLayerId[];
  healthMetricId?: string;
}> = [
  {
    id: 'knowledge',
    label: 'Knowledge Layer™',
    primaryDistrict: 'knowledge-library',
    fueledBy: ['knowledge', 'historical'],
    influences: ['innovation', 'intelligence', 'community'],
    healthMetricId: 'knowledge-flow',
  },
  {
    id: 'innovation',
    label: 'Innovation Layer™',
    primaryDistrict: 'innovation-district',
    fueledBy: ['knowledge', 'collaboration'],
    influences: ['production', 'marketplace', 'historical'],
    healthMetricId: 'innovation-velocity',
  },
  {
    id: 'production',
    label: 'Production Layer™',
    primaryDistrict: 'warehouse',
    fueledBy: ['innovation', 'market'],
    influences: ['marketplace', 'knowledge', 'historical'],
    healthMetricId: 'production-capacity',
  },
  {
    id: 'marketplace',
    label: 'Marketplace Layer™',
    primaryDistrict: 'marketplace',
    fueledBy: ['innovation', 'market'],
    influences: ['historical', 'community', 'knowledge'],
    healthMetricId: 'marketplace-energy',
  },
  {
    id: 'community',
    label: 'Community Layer™',
    primaryDistrict: 'command-center',
    fueledBy: ['collaboration', 'market'],
    influences: ['innovation', 'knowledge', 'intelligence'],
    healthMetricId: 'community-collaboration',
  },
  {
    id: 'historical',
    label: 'Historical Layer™',
    primaryDistrict: 'museum',
    fueledBy: ['market', 'historical', 'innovation'],
    influences: ['knowledge', 'community', 'intelligence'],
    healthMetricId: 'historical-preservation',
  },
  {
    id: 'intelligence',
    label: 'Intelligence Layer™',
    primaryDistrict: 'atlas',
    fueledBy: ['knowledge', 'collaboration', 'historical'],
    influences: ['innovation', 'production', 'marketplace'],
    healthMetricId: 'learning-growth',
  },
];

export function layerVitalityFromEcology(
  layerId: CivilizationLayerId,
  ecology: LivingDistrictEcologySnapshot
): { vitality: number; trend: CivilizationLayerState['trend'] } {
  const def = CIVILIZATION_LAYER_DEFS.find((l) => l.id === layerId)!;
  const metric = ecology.worldHealth.find((h) => h.id === def.healthMetricId);
  const district = ecology.districts[def.primaryDistrict];
  const vitality = Math.min(
    100,
    Math.round((metric?.value ?? 40) * 0.65 + (district?.effectiveTier ?? 0) * 8)
  );
  const trend: CivilizationLayerState['trend'] =
    metric?.trend === 'rising' ? 'ascending' : metric?.trend === 'stagnant' ? 'declining' : 'stable';
  return { vitality, trend };
}

export function layerForDistrict(districtId: DistrictThemeId): CivilizationLayerId | null {
  return CIVILIZATION_LAYER_DEFS.find((l) => l.primaryDistrict === districtId)?.id ?? null;
}
