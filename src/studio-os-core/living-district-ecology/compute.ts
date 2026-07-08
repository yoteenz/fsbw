/**
 * Living District Ecology™ — compute interconnected campus ecosystem.
 */

import type { DistrictThemeId } from '../architectural-navigation/district-themes';
import { readCampusEvolutionStore } from '../campus-evolution-engine/store';
import { buildLivingArchitectureSignals } from '../living-architecture/compute';
import type { LivingArchitectureSnapshot, LivingArchitectureTier } from '../living-architecture/types';
import { evaluateChainReactions } from './chain-reactions';
import { buildEcosystemSummary, buildOrbPlannerLine } from './orb-planner';
import {
  DISTRICT_SYNERGY_MAP,
  ECOSYSTEM_LOOP,
  ecologyLoopNeighbors,
} from './relationships';
import type {
  DistrictEcologyState,
  DistrictSynergyLink,
  EcologyInputSignals,
  EcologySpillover,
  LivingDistrictEcologySnapshot,
  SynergyFlow,
  WorldHealthMetric,
} from './types';
import {
  computeEcosystemBalance,
  computeWorldHealth,
  dominantHealthDistrict,
  healthForDistrict,
} from './world-health';

const CORE_DISTRICTS: DistrictThemeId[] = [
  'warehouse',
  'museum',
  'knowledge-library',
  'marketplace',
  'innovation-district',
  'command-center',
  'creative-direction',
  'atlas',
];

function clampTier(tier: number): LivingArchitectureTier {
  return Math.min(4, Math.max(0, Math.round(tier))) as LivingArchitectureTier;
}

function balanceLabel(balance: number): string {
  if (balance >= 75) return 'Harmonious balance';
  if (balance >= 55) return 'Healthy diversity';
  if (balance >= 35) return 'Emerging imbalance';
  return 'Dominant district emerging';
}

function synergyStrength(
  from: DistrictThemeId,
  to: DistrictThemeId,
  health: WorldHealthMetric[],
  architecture: LivingArchitectureSnapshot
): number {
  const sourceHealth = healthForDistrict(health, from);
  const targetHealth = healthForDistrict(health, to);
  const sourceTier = architecture.districts[from]?.tier ?? 0;
  const edge = ECOSYSTEM_LOOP.find((e) => e.from === from && e.to === to);
  const metricBoost = edge ? (metricByIdLocal(health, edge.healthMetric)?.value ?? 0) * 0.3 : 0;
  return Math.min(100, sourceHealth * 0.4 + sourceTier * 10 + metricBoost - targetHealth * 0.15);
}

function metricByIdLocal(health: WorldHealthMetric[], id: WorldHealthMetric['id']) {
  return health.find((h) => h.id === id);
}

function classifySynergy(strength: number, isStrongLink: boolean): DistrictSynergyLink['relationship'] {
  if (strength >= 55) return 'strong';
  if (strength >= 35) return isStrongLink ? 'developing' : 'weak';
  return 'underserved';
}

function buildSpillover(
  districtId: DistrictThemeId,
  health: WorldHealthMetric[],
  architecture: LivingArchitectureSnapshot
): EcologySpillover[] {
  const neighbors = ecologyLoopNeighbors(districtId);
  return neighbors
    .map((from) => {
      const edge = ECOSYSTEM_LOOP.find((e) => e.from === from && e.to === districtId);
      if (!edge) return null;
      const strength = synergyStrength(from, districtId, health, architecture);
      if (strength < 25) return null;
      const influencePct = Math.min(35, Math.round(strength * 0.35));
      return {
        fromDistrict: from,
        toDistrict: districtId,
        contribution: `${edge.label} — +${influencePct}% ecology influence`,
        influencePct,
      };
    })
    .filter(Boolean) as EcologySpillover[];
}

function buildNaturalExpansions(
  districtId: DistrictThemeId,
  baseTier: LivingArchitectureTier,
  effectiveTier: LivingArchitectureTier,
  health: WorldHealthMetric[],
  spillover: EcologySpillover[]
): string[] {
  const expansions: string[] = [];
  const districtHealth = healthForDistrict(health, districtId);

  if (districtId === 'innovation-district' && districtHealth >= 60 && baseTier >= 2) {
    expansions.push('Research Annex constructed nearby — innovation overflow creates demand');
  }
  if (districtId === 'warehouse' && districtHealth >= 50 && spillover.some((s) => s.fromDistrict === 'marketplace')) {
    expansions.push('Fabrication hall opens — Marketplace demand exceeds production capacity');
  }
  if (districtId === 'museum' && districtHealth >= 45 && effectiveTier > baseTier) {
    expansions.push('Second exhibition wing commissioned — historic milestones accumulate');
  }
  if (districtId === 'knowledge-library' && spillover.some((s) => s.fromDistrict === 'warehouse')) {
    expansions.push('Archive wing grows — Archives teach new institutional knowledge');
  }
  if (districtId === 'marketplace' && spillover.some((s) => s.fromDistrict === 'innovation-district')) {
    expansions.push('Showcase pavilion extends — Innovation creates commerce opportunities');
  }

  return expansions.slice(0, 3);
}

function buildDistrictEcology(
  districtId: DistrictThemeId,
  architecture: LivingArchitectureSnapshot,
  health: WorldHealthMetric[]
): DistrictEcologyState {
  const baseTier = architecture.districts[districtId]?.tier ?? 0;
  const spilloverFrom = buildSpillover(districtId, health, architecture);
  const ecologyInfluence = Math.min(
    1,
    spilloverFrom.reduce((sum, s) => sum + s.influencePct, 0) / 100
  );
  const bonusTier = ecologyInfluence >= 0.25 ? 1 : ecologyInfluence >= 0.12 ? 0.5 : 0;
  const effectiveTier = clampTier(baseTier + bonusTier);

  const synergy = DISTRICT_SYNERGY_MAP[districtId] ?? { strong: [], weak: [] };

  const strongRelationships: DistrictSynergyLink[] = synergy.strong.map((id) => {
    const strength = synergyStrength(districtId, id, health, architecture);
    return {
      districtId: id,
      label: id.replace(/-/g, ' '),
      strength,
      relationship: classifySynergy(strength, true),
    };
  });

  const weakRelationships: DistrictSynergyLink[] = synergy.weak.map((id) => {
    const strength = synergyStrength(districtId, id, health, architecture);
    return {
      districtId: id,
      label: id.replace(/-/g, ' '),
      strength,
      relationship: classifySynergy(strength, false),
    };
  });

  return {
    districtId,
    baseTier,
    ecologyInfluence,
    effectiveTier,
    strongRelationships,
    weakRelationships,
    spilloverFrom,
    naturalExpansions: buildNaturalExpansions(
      districtId,
      baseTier,
      effectiveTier,
      health,
      spilloverFrom
    ),
  };
}

function buildSynergyFlows(
  health: WorldHealthMetric[],
  architecture: LivingArchitectureSnapshot
): SynergyFlow[] {
  return ECOSYSTEM_LOOP.map((edge) => {
    const strength = synergyStrength(edge.from, edge.to, health, architecture);
    return {
      from: edge.from,
      to: edge.to,
      label: edge.label,
      strength,
      active: strength >= 30,
    };
  });
}

function findUnderservedDistricts(
  districts: Record<DistrictThemeId, DistrictEcologyState>
): DistrictThemeId[] {
  return CORE_DISTRICTS.filter((id) => {
    const d = districts[id];
    if (!d) return false;
    const underservedLinks = [...d.strongRelationships, ...d.weakRelationships].filter(
      (r) => r.relationship === 'underserved'
    );
    return d.baseTier <= 1 && underservedLinks.length >= 2;
  });
}

export function buildEcologyInputSignals(input: {
  warehouseAssetCount: number;
  warehouseReuseTotal: number;
  warehouseGoldenBuildTotal: number;
  warehouseFavoriteCount: number;
}): EcologyInputSignals {
  const campus = readCampusEvolutionStore();
  const archSignals = buildLivingArchitectureSignals({ ...input, campus });

  return {
    warehouseAssetCount: input.warehouseAssetCount,
    warehouseReuseTotal: input.warehouseReuseTotal,
    warehouseGoldenBuildTotal: input.warehouseGoldenBuildTotal,
    warehouseFavoriteCount: input.warehouseFavoriteCount,
    campusKnowledgeGrowthPct: campus.dashboard.knowledgeGrowthPct,
    campusInnovationPct: campus.dashboard.innovationPct,
    campusRelationshipGrowthPct: campus.dashboard.relationshipGrowthPct,
    campusOrganicEvolutionCount: archSignals.campusOrganicEvolutionCount,
    campusEarnedSpacesActive: archSignals.campusEarnedSpacesActive,
    campusMuseumGalleries: archSignals.campusMuseumGalleries,
    campusKnowledgeTriggers: archSignals.campusKnowledgeTriggers,
  };
}

export function computeLivingDistrictEcology(
  architecture: LivingArchitectureSnapshot,
  input: {
    warehouseAssetCount: number;
    warehouseReuseTotal: number;
    warehouseGoldenBuildTotal: number;
    warehouseFavoriteCount: number;
  }
): LivingDistrictEcologySnapshot {
  const signals = buildEcologyInputSignals(input);
  const worldHealth = computeWorldHealth(signals, architecture);
  const ecosystemBalance = computeEcosystemBalance(worldHealth);
  const dominantDistrict = dominantHealthDistrict(worldHealth);
  const chainReactions = evaluateChainReactions(worldHealth, signals, architecture);
  const activeSynergyFlows = buildSynergyFlows(worldHealth, architecture);

  const districts = {} as Record<DistrictThemeId, DistrictEcologyState>;
  for (const id of CORE_DISTRICTS) {
    districts[id] = buildDistrictEcology(id, architecture, worldHealth);
  }

  const underservedDistricts = findUnderservedDistricts(districts);

  const snapshot: LivingDistrictEcologySnapshot = {
    computedAt: new Date().toISOString(),
    worldHealth,
    ecosystemBalance,
    balanceLabel: balanceLabel(ecosystemBalance),
    dominantDistrict,
    underservedDistricts,
    districts,
    chainReactions,
    activeSynergyFlows,
    orbPlannerLine: buildOrbPlannerLine({
      worldHealth,
      chainReactions,
      underservedDistricts,
      ecosystemBalance,
      dominantDistrict,
      districts,
    }),
    ecosystemSummary: '',
  };

  snapshot.ecosystemSummary = buildEcosystemSummary(snapshot);
  return snapshot;
}

export function effectiveTierForDistrict(
  districtId: DistrictThemeId,
  ecology: LivingDistrictEcologySnapshot
): LivingArchitectureTier {
  return ecology.districts[districtId]?.effectiveTier ?? 0;
}
