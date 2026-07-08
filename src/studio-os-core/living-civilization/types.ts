/**
 * Living Civilization™ — self-balancing civilization atop architecture + ecology.
 * ERA 2 — WORLD™ · Knowledge Economy™ · Cultural Evolution™
 */

import type { DistrictThemeId } from '../architectural-navigation/district-themes';

export type CivilizationLayerId =
  | 'knowledge'
  | 'innovation'
  | 'production'
  | 'marketplace'
  | 'community'
  | 'historical'
  | 'intelligence';

export type EconomyId =
  | 'knowledge'
  | 'innovation'
  | 'market'
  | 'historical'
  | 'collaboration';

export type CivilizationLayerState = {
  id: CivilizationLayerId;
  label: string;
  vitality: number;
  trend: 'ascending' | 'stable' | 'declining';
  primaryDistrict: DistrictThemeId;
  fueledBy: EconomyId[];
  influences: CivilizationLayerId[];
};

export type EconomyFlow = {
  from: EconomyId | CivilizationLayerId;
  to: EconomyId | CivilizationLayerId;
  label: string;
  strength: number;
};

export type EconomyState = {
  id: EconomyId;
  label: string;
  capital: number;
  trend: 'growing' | 'stable' | 'contracting';
  outputs: string[];
  funds: string[];
  primaryLayer: CivilizationLayerId;
};

export type CulturalTrait = {
  id: string;
  category: 'architecture' | 'language' | 'design' | 'philosophy' | 'tradition' | 'ceremony';
  label: string;
  expression: string;
};

export type CivilizationConsequence = {
  id: string;
  order: 2 | 3;
  trigger: string;
  sourceLayer: CivilizationLayerId;
  ripple: string;
  affectedLayers: CivilizationLayerId[];
  affectedDistricts: DistrictThemeId[];
};

export type CivilizationHealth = {
  overall: number;
  label: string;
  selfBalancing: boolean;
  dominantLayer: CivilizationLayerId | null;
  underservedLayers: CivilizationLayerId[];
};

export type LivingCivilizationSnapshot = {
  computedAt: string;
  stageLabel: string;
  civilizationSummary: string;
  health: CivilizationHealth;
  layers: Record<CivilizationLayerId, CivilizationLayerState>;
  economies: Record<EconomyId, EconomyState>;
  economyFlows: EconomyFlow[];
  culture: CulturalTrait[];
  consequences: CivilizationConsequence[];
  orbArchitectLine: string | null;
  founderExperienceLine: string;
};

export type CivilizationInputSignals = {
  warehouseAssetCount: number;
  warehouseReuseTotal: number;
  warehouseGoldenBuildTotal: number;
  warehouseFavoriteCount: number;
  campusKnowledgeGrowthPct: number;
  campusInnovationPct: number;
  campusRelationshipGrowthPct: number;
  campusOrganicEvolutionCount: number;
  campusEarnedSpacesActive: number;
  campusMuseumGalleries: number;
  campusKnowledgeTriggers: number;
  campusOrganizationalHealthPct: number;
  companyName: string;
};
