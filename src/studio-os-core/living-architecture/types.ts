/**
 * Living Architecture™ — campus evolves from earned progress, not time.
 * ERA 2 — WORLD™ · World Graph™ · Immersion Over Dashboards™
 */

import type { DistrictThemeId } from '../architectural-navigation/district-themes';

export type LivingArchitectureTier = 0 | 1 | 2 | 3 | 4;

export type ArchitecturalMilestoneKind =
  | 'innovation-published'
  | 'knowledge-created'
  | 'marketplace-success'
  | 'community-collaboration'
  | 'historical-milestone'
  | 'company-achievement'
  | 'blueprint-breakthrough'
  | 'asset-production'
  | 'golden-build'
  | 'reuse-efficiency';

export type ArchitecturalMilestone = {
  id: string;
  districtId: DistrictThemeId;
  kind: ArchitecturalMilestoneKind;
  title: string;
  architecturalChange: string;
  earnedAt: string;
  tier: LivingArchitectureTier;
  causedBy: string;
  contributors?: string[];
  worldGraphNodeId?: string;
};

export type DistrictEvolutionState = {
  districtId: DistrictThemeId;
  tier: LivingArchitectureTier;
  tierLabel: string;
  visualClass: string;
  activeExpansions: string[];
  unlockedFeatures: string[];
  milestones: ArchitecturalMilestone[];
  latestMilestone?: ArchitecturalMilestone;
};

export type LivingArchitectureExpansionNode = {
  id: string;
  label: string;
  districtId: DistrictThemeId;
  causedBy: string;
  earnedAt: string;
  edgeLabel: string;
};

export type LivingArchitectureSnapshot = {
  computedAt: string;
  campusStageLabel: string;
  activeConstruction: number;
  districts: Record<DistrictThemeId, DistrictEvolutionState>;
  recentMilestones: ArchitecturalMilestone[];
  expansionGraph: LivingArchitectureExpansionNode[];
  orbHistorianLine: string | null;
  skylineSummary: string;
};

export type LivingArchitectureSignals = {
  warehouseAssetCount: number;
  warehouseReuseTotal: number;
  warehouseGoldenBuildTotal: number;
  warehouseFavoriteCount: number;
  campusOrganicEvolutionCount: number;
  campusEarnedSpacesActive: number;
  campusMuseumGalleries: number;
  campusKnowledgeTriggers: number;
  campusInnovationPct: number;
  campusActiveConstruction: number;
};
