/**
 * Civilization Economies™ — Knowledge, Innovation, Market, Historical, Collaboration.
 */

import type { LivingArchitectureSnapshot } from '../living-architecture/types';
import type { LivingDistrictEcologySnapshot } from '../living-district-ecology/types';
import type { CivilizationInputSignals, EconomyId, EconomyState } from './types';

function clamp(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n)));
}

function trend(value: number, prior: number): EconomyState['trend'] {
  if (value >= prior + 5) return 'growing';
  if (value <= prior - 5) return 'contracting';
  return 'stable';
}

export function computeEconomies(
  signals: CivilizationInputSignals,
  architecture: LivingArchitectureSnapshot,
  ecology: LivingDistrictEcologySnapshot
): Record<EconomyId, EconomyState> {
  const knowledgeCapital = clamp(
    signals.campusKnowledgeGrowthPct * 0.5 +
      signals.campusKnowledgeTriggers * 12 +
      signals.campusOrganicEvolutionCount * 3 +
      (architecture.districts['knowledge-library']?.tier ?? 0) * 10
  );

  const innovationCapital = clamp(
    signals.campusInnovationPct * 0.55 +
      knowledgeCapital * 0.2 +
      (architecture.districts['innovation-district']?.tier ?? 0) * 12
  );

  const marketCapital = clamp(
    signals.warehouseFavoriteCount * 7 +
      innovationCapital * 0.25 +
      signals.campusEarnedSpacesActive * 4 +
      (architecture.districts.marketplace?.tier ?? 0) * 10
  );

  const historicalCapital = clamp(
    signals.campusMuseumGalleries * 11 +
      Math.min(35, signals.warehouseGoldenBuildTotal * 2.5) +
      marketCapital * 0.12 +
      (architecture.districts.museum?.tier ?? 0) * 10
  );

  const collaborationCapital = clamp(
    signals.campusRelationshipGrowthPct * 0.65 +
      marketCapital * 0.1 +
      signals.campusEarnedSpacesActive * 3 +
      ecology.ecosystemBalance * 0.2
  );

  return {
    knowledge: {
      id: 'knowledge',
      label: 'Knowledge Economy™',
      capital: knowledgeCapital,
      trend: trend(knowledgeCapital, signals.campusKnowledgeGrowthPct),
      primaryLayer: 'knowledge',
      outputs: [
        'Innovation fuel',
        'Collaboration intelligence',
        'Marketplace opportunities',
        'Orb intelligence',
        'Industry reputation',
      ],
      funds: ['Blueprint publishing', 'Teaching', 'Research', 'Documentation', 'Discoveries'],
    },
    innovation: {
      id: 'innovation',
      label: 'Innovation Economy™',
      capital: innovationCapital,
      trend: trend(innovationCapital, signals.campusInnovationPct),
      primaryLayer: 'innovation',
      outputs: [
        'New products',
        'New Blueprints',
        'New assets',
        'New departments',
        'Marketplace value',
      ],
      funds: ['Knowledge consumption', 'Prototype output', 'Blueprint breakthroughs'],
    },
    market: {
      id: 'market',
      label: 'Market Economy™',
      capital: marketCapital,
      trend: trend(marketCapital, signals.warehouseFavoriteCount * 8),
      primaryLayer: 'marketplace',
      outputs: [
        'Revenue',
        'Reputation',
        'Expansion budget',
        'Production funding',
        'Museum preservation',
        'Knowledge grants',
      ],
      funds: ['Marketplace success', 'Innovation products', 'Community advocacy'],
    },
    historical: {
      id: 'historical',
      label: 'Historical Economy™',
      capital: historicalCapital,
      trend: trend(historicalCapital, signals.campusMuseumGalleries * 10),
      primaryLayer: 'historical',
      outputs: [
        'Museum exhibitions',
        'Legacy monuments',
        'Historic districts',
        'Permanent civilization assets',
      ],
      funds: [
        'First Product™',
        'Golden Builds™',
        'Industry awards',
        'Historic collaborations',
        'Company milestones',
      ],
    },
    collaboration: {
      id: 'collaboration',
      label: 'Collaboration Economy™',
      capital: collaborationCapital,
      trend: trend(collaborationCapital, signals.campusRelationshipGrowthPct),
      primaryLayer: 'community',
      outputs: [
        'Innovation grants',
        'Shared campuses',
        'Research institutes',
        'Skybridges',
        'Joint museums',
        'Marketplace exposure',
      ],
      funds: ['Joint inventions', 'Shared Blueprints', 'Cross-company innovation'],
    },
  };
}

export function buildEconomyFlows(
  economies: Record<EconomyId, EconomyState>
): import('./types').EconomyFlow[] {
  const k = economies.knowledge.capital;
  const i = economies.innovation.capital;
  const m = economies.market.capital;
  const h = economies.historical.capital;
  const c = economies.collaboration.capital;

  return [
    { from: 'knowledge', to: 'innovation', label: 'Knowledge fuels innovation', strength: Math.min(100, k * 0.6 + i * 0.2) },
    { from: 'innovation', to: 'market', label: 'Innovation creates marketplace value', strength: Math.min(100, i * 0.55 + m * 0.25) },
    { from: 'market', to: 'historical', label: 'Market funds preservation', strength: Math.min(100, m * 0.5 + h * 0.3) },
    { from: 'historical', to: 'knowledge', label: 'History teaches knowledge', strength: Math.min(100, h * 0.45 + k * 0.2) },
    { from: 'collaboration', to: 'innovation', label: 'Collaboration strengthens invention', strength: Math.min(100, c * 0.5 + i * 0.2) },
    { from: 'market', to: 'production', label: 'Market funds production', strength: Math.min(100, m * 0.4) },
    { from: 'knowledge', to: 'intelligence', label: 'Knowledge powers Orb intelligence', strength: Math.min(100, k * 0.45) },
  ];
}
