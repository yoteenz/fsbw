/**
 * World Health™ — ecosystem balance metrics that influence one another.
 */

import type { DistrictThemeId } from '../architectural-navigation/district-themes';
import type { LivingArchitectureSnapshot } from '../living-architecture/types';
import type { EcologyInputSignals, WorldHealthMetric, WorldHealthMetricId } from './types';

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(n)));
}

function tierBoost(snapshot: LivingArchitectureSnapshot, districtId: DistrictThemeId): number {
  return (snapshot.districts[districtId]?.tier ?? 0) * 12;
}

export function computeWorldHealth(
  signals: EcologyInputSignals,
  architecture: LivingArchitectureSnapshot
): WorldHealthMetric[] {
  const knowledgeFlow = clamp(
    signals.campusKnowledgeGrowthPct * 0.45 +
      signals.campusKnowledgeTriggers * 14 +
      tierBoost(architecture, 'knowledge-library') +
      signals.campusOrganicEvolutionCount * 2
  );

  const innovationVelocity = clamp(
    signals.campusInnovationPct * 0.55 +
      tierBoost(architecture, 'innovation-district') +
      knowledgeFlow * 0.12
  );

  const marketplaceEnergy = clamp(
    signals.warehouseFavoriteCount * 8 +
      tierBoost(architecture, 'marketplace') +
      innovationVelocity * 0.1 +
      signals.campusEarnedSpacesActive * 3
  );

  const communityCollaboration = clamp(
    signals.campusRelationshipGrowthPct * 0.6 +
      signals.campusEarnedSpacesActive * 4 +
      marketplaceEnergy * 0.08
  );

  const productionCapacity = clamp(
    Math.min(100, signals.warehouseAssetCount * 3.5) +
      Math.min(30, signals.warehouseReuseTotal * 0.25) +
      tierBoost(architecture, 'warehouse') * 0.5
  );

  const historicalPreservation = clamp(
    signals.campusMuseumGalleries * 10 +
      Math.min(40, signals.warehouseGoldenBuildTotal * 3) +
      tierBoost(architecture, 'museum') +
      marketplaceEnergy * 0.06
  );

  const learningGrowth = clamp(
    knowledgeFlow * 0.55 +
      historicalPreservation * 0.15 +
      tierBoost(architecture, 'knowledge-library') * 0.8
  );

  const creativeMomentum = clamp(
    innovationVelocity * 0.4 +
      productionCapacity * 0.25 +
      marketplaceEnergy * 0.2 +
      tierBoost(architecture, 'creative-direction')
  );

  const metrics: Array<Omit<WorldHealthMetric, 'trend'>> = [
    {
      id: 'knowledge-flow',
      label: 'Knowledge Flow™',
      value: knowledgeFlow,
      primaryDistrict: 'knowledge-library',
      influencedBy: ['warehouse', 'museum'],
    },
    {
      id: 'innovation-velocity',
      label: 'Innovation Velocity™',
      value: innovationVelocity,
      primaryDistrict: 'innovation-district',
      influencedBy: ['knowledge-library', 'warehouse'],
    },
    {
      id: 'marketplace-energy',
      label: 'Marketplace Energy™',
      value: marketplaceEnergy,
      primaryDistrict: 'marketplace',
      influencedBy: ['innovation-district', 'command-center'],
    },
    {
      id: 'community-collaboration',
      label: 'Community Collaboration™',
      value: communityCollaboration,
      primaryDistrict: 'command-center',
      influencedBy: ['marketplace', 'innovation-district'],
    },
    {
      id: 'production-capacity',
      label: 'Production Capacity™',
      value: productionCapacity,
      primaryDistrict: 'warehouse',
      influencedBy: ['marketplace', 'innovation-district'],
    },
    {
      id: 'historical-preservation',
      label: 'Historical Preservation™',
      value: historicalPreservation,
      primaryDistrict: 'museum',
      influencedBy: ['marketplace', 'warehouse'],
    },
    {
      id: 'learning-growth',
      label: 'Learning Growth™',
      value: learningGrowth,
      primaryDistrict: 'knowledge-library',
      influencedBy: ['museum', 'warehouse'],
    },
    {
      id: 'creative-momentum',
      label: 'Creative Momentum™',
      value: creativeMomentum,
      primaryDistrict: 'creative-direction',
      influencedBy: ['innovation-district', 'marketplace'],
    },
  ];

  return metrics.map((m) => ({
    ...m,
    trend: trendFor(m.value, architecture.districts[m.primaryDistrict]?.tier ?? 0),
  }));
}

function trendFor(value: number, tier: number): WorldHealthMetric['trend'] {
  if (value >= 55 || tier >= 2) return 'rising';
  if (value >= 30) return 'stable';
  return 'stagnant';
}

export function healthForDistrict(
  health: WorldHealthMetric[],
  districtId: DistrictThemeId
): number {
  const primary = health.filter((h) => h.primaryDistrict === districtId);
  if (primary.length === 0) {
    const related = health.filter((h) => h.influencedBy.includes(districtId));
    if (related.length === 0) return 40;
    return related.reduce((s, h) => s + h.value, 0) / related.length;
  }
  return primary.reduce((s, h) => s + h.value, 0) / primary.length;
}

export function computeEcosystemBalance(health: WorldHealthMetric[]): number {
  if (health.length === 0) return 50;
  const values = health.map((h) => h.value);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  return clamp(100 - stdDev * 1.2);
}

export function dominantHealthDistrict(health: WorldHealthMetric[]): DistrictThemeId | null {
  if (health.length === 0) return null;
  const sorted = [...health].sort((a, b) => b.value - a.value);
  return sorted[0]?.value >= 60 ? sorted[0].primaryDistrict : null;
}

export function metricById(
  health: WorldHealthMetric[],
  id: WorldHealthMetricId
): WorldHealthMetric | undefined {
  return health.find((h) => h.id === id);
}
