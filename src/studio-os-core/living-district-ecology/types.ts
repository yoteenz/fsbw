/**
 * Living District Ecology™ — interconnected campus ecosystem.
 * ERA 2 — WORLD™ · District Synergy™ · World Health™
 */

import type { DistrictThemeId } from '../architectural-navigation/district-themes';
import type { LivingArchitectureTier } from '../living-architecture/types';

export type WorldHealthMetricId =
  | 'knowledge-flow'
  | 'innovation-velocity'
  | 'marketplace-energy'
  | 'community-collaboration'
  | 'production-capacity'
  | 'historical-preservation'
  | 'learning-growth'
  | 'creative-momentum';

export type WorldHealthTrend = 'rising' | 'stable' | 'stagnant';

export type WorldHealthMetric = {
  id: WorldHealthMetricId;
  label: string;
  value: number;
  trend: WorldHealthTrend;
  primaryDistrict: DistrictThemeId;
  influencedBy: DistrictThemeId[];
};

export type DistrictSynergyLink = {
  districtId: DistrictThemeId;
  label: string;
  strength: number;
  relationship: 'strong' | 'developing' | 'weak' | 'underserved';
};

export type EcologySpillover = {
  fromDistrict: DistrictThemeId;
  toDistrict: DistrictThemeId;
  contribution: string;
  influencePct: number;
};

export type DistrictEcologyState = {
  districtId: DistrictThemeId;
  baseTier: LivingArchitectureTier;
  ecologyInfluence: number;
  effectiveTier: LivingArchitectureTier;
  strongRelationships: DistrictSynergyLink[];
  weakRelationships: DistrictSynergyLink[];
  spilloverFrom: EcologySpillover[];
  naturalExpansions: string[];
};

export type ChainReactionConsequence = {
  districtId: DistrictThemeId;
  architecturalChange: string;
  causedBy: string;
};

export type ChainReaction = {
  id: string;
  trigger: string;
  sourceDistrict: DistrictThemeId;
  sourceEvent: string;
  consequences: ChainReactionConsequence[];
  worldGraphNodeId: string;
};

export type SynergyFlow = {
  from: DistrictThemeId;
  to: DistrictThemeId;
  label: string;
  strength: number;
  active: boolean;
};

export type LivingDistrictEcologySnapshot = {
  computedAt: string;
  worldHealth: WorldHealthMetric[];
  ecosystemBalance: number;
  balanceLabel: string;
  dominantDistrict: DistrictThemeId | null;
  underservedDistricts: DistrictThemeId[];
  districts: Record<DistrictThemeId, DistrictEcologyState>;
  chainReactions: ChainReaction[];
  activeSynergyFlows: SynergyFlow[];
  orbPlannerLine: string | null;
  ecosystemSummary: string;
};

export type EcologyInputSignals = {
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
};
