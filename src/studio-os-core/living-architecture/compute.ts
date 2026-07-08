/**
 * Living Architecture™ — compute district evolution from earned signals.
 */

import type { DistrictThemeId } from '../architectural-navigation/district-themes';
import { readCampusEvolutionStore } from '../campus-evolution-engine/store';
import type { CampusEvolutionStore } from '../campus-evolution-engine/types';
import { ARCHITECTURAL_MILESTONE_THRESHOLDS, TIER_LABELS } from './milestones';
import type {
  ArchitecturalMilestone,
  DistrictEvolutionState,
  LivingArchitectureExpansionNode,
  LivingArchitectureSignals,
  LivingArchitectureSnapshot,
  LivingArchitectureTier,
} from './types';

const ALL_DISTRICTS: DistrictThemeId[] = [
  'warehouse',
  'museum',
  'knowledge-library',
  'marketplace',
  'creative-direction',
  'command-center',
  'innovation-district',
  'atlas',
];

function worldGraphNodeId(milestoneId: string): string {
  return `W-ARCH-MS-${milestoneId}`;
}

export function buildLivingArchitectureSignals(input: {
  warehouseAssetCount: number;
  warehouseReuseTotal: number;
  warehouseGoldenBuildTotal: number;
  warehouseFavoriteCount: number;
  campus?: CampusEvolutionStore | null;
}): LivingArchitectureSignals {
  const campus = input.campus ?? readCampusEvolutionStore();
  const knowledgeTriggers = campus.organicEvolution.filter((e) =>
    /KNOWLEDGE|LIBRARY|BIBLE/i.test(e.category)
  ).length;
  const museumGalleries = campus.livingMuseum.length;

  return {
    warehouseAssetCount: input.warehouseAssetCount,
    warehouseReuseTotal: input.warehouseReuseTotal,
    warehouseGoldenBuildTotal: input.warehouseGoldenBuildTotal,
    warehouseFavoriteCount: input.warehouseFavoriteCount,
    campusOrganicEvolutionCount: campus.organicEvolution.length,
    campusEarnedSpacesActive: campus.earnedSpaces.filter((s) => s.status === 'active').length,
    campusMuseumGalleries: museumGalleries,
    campusKnowledgeTriggers: knowledgeTriggers,
    campusInnovationPct: campus.dashboard.innovationPct,
    campusActiveConstruction: campus.dashboard.activeConstruction,
  };
}

function evaluateMilestones(signals: LivingArchitectureSignals): ArchitecturalMilestone[] {
  const now = new Date().toISOString().slice(0, 10);
  return ARCHITECTURAL_MILESTONE_THRESHOLDS.filter((t) => t.test(signals)).map((t) => ({
    id: t.id,
    districtId: t.districtId,
    kind: 'company-achievement',
    title: t.title,
    architecturalChange: t.architecturalChange,
    earnedAt: now,
    tier: t.tier,
    causedBy: t.causedBy,
    worldGraphNodeId: worldGraphNodeId(t.id),
  }));
}

function districtTier(milestones: ArchitecturalMilestone[]): LivingArchitectureTier {
  if (milestones.length === 0) return 0;
  return Math.max(...milestones.map((m) => m.tier)) as LivingArchitectureTier;
}

function buildDistrictState(
  districtId: DistrictThemeId,
  milestones: ArchitecturalMilestone[],
  signals: LivingArchitectureSignals
): DistrictEvolutionState {
  const districtMilestones = milestones.filter((m) => m.districtId === districtId);
  const tier = districtTier(districtMilestones);
  const latest = districtMilestones.sort((a, b) => b.tier - a.tier)[0];

  const activeExpansions: string[] = [];
  if (signals.campusActiveConstruction > 0 && districtId === 'innovation-district') {
    activeExpansions.push('Experimental tower under construction');
  }
  if (signals.campusActiveConstruction > 0 && districtId === 'knowledge-library') {
    activeExpansions.push('Archive wing expansion in progress');
  }
  districtMilestones.forEach((m) => activeExpansions.push(m.architecturalChange));

  return {
    districtId,
    tier,
    tierLabel: TIER_LABELS[tier],
    visualClass: `sw-living--${districtId}-tier-${tier}`,
    activeExpansions: activeExpansions.slice(0, 4),
    unlockedFeatures: districtMilestones.map((m) => m.title),
    milestones: districtMilestones,
    latestMilestone: latest,
  };
}

function buildExpansionGraph(milestones: ArchitecturalMilestone[]): LivingArchitectureExpansionNode[] {
  return milestones.map((m) => ({
    id: m.worldGraphNodeId ?? m.id,
    label: m.title,
    districtId: m.districtId,
    causedBy: m.causedBy,
    earnedAt: m.earnedAt,
    edgeLabel: 'expanded-from',
  }));
}

function buildOrbHistorianLine(
  milestones: ArchitecturalMilestone[],
  campus: CampusEvolutionStore
): string | null {
  const latest = [...milestones].sort((a, b) => b.tier - a.tier)[0];
  if (latest) {
    return `Your ${latest.districtId.replace(/-/g, ' ')} expanded — ${latest.architecturalChange} Earned because: ${latest.causedBy}`;
  }
  const organic = campus.organicEvolution[campus.organicEvolution.length - 1];
  if (organic) {
    return `${organic.architecturalImpact} — earned after ${organic.achievement.toLowerCase()}.`;
  }
  const memory = campus.companyMemory[campus.companyMemory.length - 1];
  if (memory) {
    return `This wing commemorates ${memory.title.toLowerCase()} — ${memory.architecturalMemorial}.`;
  }
  return null;
}

function buildSkylineSummary(districts: Record<DistrictThemeId, DistrictEvolutionState>): string {
  const growing = ALL_DISTRICTS.filter((d) => districts[d].tier >= 2);
  if (growing.length === 0) return 'Campus foundational — first architectural milestones await.';
  const names = growing.map((d) => districts[d].tierLabel + ' ' + d.replace(/-/g, ' '));
  return `Living campus — ${names.slice(0, 3).join(' · ')}`;
}

export function computeLivingArchitecture(input: {
  warehouseAssetCount: number;
  warehouseReuseTotal: number;
  warehouseGoldenBuildTotal: number;
  warehouseFavoriteCount: number;
}): LivingArchitectureSnapshot {
  const campus = readCampusEvolutionStore();
  const signals = buildLivingArchitectureSignals({ ...input, campus });
  const milestones = evaluateMilestones(signals);

  const districts = {} as Record<DistrictThemeId, DistrictEvolutionState>;
  for (const id of ALL_DISTRICTS) {
    districts[id] = buildDistrictState(id, milestones, signals);
  }

  const recentMilestones = [...milestones].sort((a, b) => b.tier - a.tier).slice(0, 6);
  const currentStage = campus.stages.find((s) => s.current);

  return {
    computedAt: new Date().toISOString(),
    campusStageLabel: currentStage?.label ?? 'STARTUP STUDIO',
    activeConstruction: signals.campusActiveConstruction,
    districts,
    recentMilestones,
    expansionGraph: buildExpansionGraph(milestones),
    orbHistorianLine: buildOrbHistorianLine(milestones, campus),
    skylineSummary: buildSkylineSummary(districts),
  };
}

export function livingArchitectureClassForDistrict(
  districtId: DistrictThemeId,
  snapshot: LivingArchitectureSnapshot
): string {
  return snapshot.districts[districtId]?.visualClass ?? 'sw-living--tier-0';
}

export function prototypeVaultBayCount(snapshot: LivingArchitectureSnapshot): number {
  const wh = snapshot.districts.warehouse;
  return Math.min(6, 2 + wh.tier);
}

export function museumGalleryCount(snapshot: LivingArchitectureSnapshot): number {
  return Math.min(7, 2 + snapshot.districts.museum.tier);
}
