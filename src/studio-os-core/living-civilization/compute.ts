/**
 * Living Civilization™ — compute self-balancing civilization from architecture + ecology.
 */

import { readCampusEvolutionStore } from '../campus-evolution-engine/store';
import { buildEcologyInputSignals } from '../living-district-ecology/compute';
import type { LivingArchitectureSnapshot } from '../living-architecture/types';
import type { LivingDistrictEcologySnapshot } from '../living-district-ecology/types';
import { computeCulturalEvolution } from './cultural-evolution';
import { evaluateCivilizationConsequences } from './consequences';
import { buildEconomyFlows, computeEconomies } from './economies';
import { CIVILIZATION_LAYER_DEFS, layerVitalityFromEcology } from './layers';
import {
  buildCivilizationSummary,
  buildFounderExperienceLine,
  buildOrbArchitectLine,
} from './orb-civilization-architect';
import type {
  CivilizationHealth,
  CivilizationInputSignals,
  CivilizationLayerId,
  CivilizationLayerState,
  LivingCivilizationSnapshot,
} from './types';

function buildCivilizationSignals(input: {
  warehouseAssetCount: number;
  warehouseReuseTotal: number;
  warehouseGoldenBuildTotal: number;
  warehouseFavoriteCount: number;
}): CivilizationInputSignals {
  const campus = readCampusEvolutionStore();
  const ecologySignals = buildEcologyInputSignals(input);

  return {
    ...ecologySignals,
    campusOrganizationalHealthPct: campus.dashboard.organizationalHealthPct,
    companyName: campus.companyName,
  };
}

function computeCivilizationHealth(
  layers: Record<CivilizationLayerId, CivilizationLayerState>
): CivilizationHealth {
  const values = Object.values(layers).map((l) => l.vitality);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const overall = Math.round(Math.min(100, avg + (100 - stdDev) * 0.15));

  const sorted = [...Object.values(layers)].sort((a, b) => b.vitality - a.vitality);
  const dominant = sorted[0]?.vitality >= 65 ? sorted[0].id : null;
  const underserved = Object.values(layers)
    .filter((l) => l.vitality < 35)
    .map((l) => l.id);

  let label = 'Foundational civilization';
  if (overall >= 75) label = 'Self-balancing civilization';
  else if (overall >= 55) label = 'Maturing civilization';
  else if (overall >= 35) label = 'Emerging civilization';

  return {
    overall,
    label,
    selfBalancing: overall >= 70 && stdDev < 22,
    dominantLayer: dominant,
    underservedLayers: underserved,
  };
}

export function computeLivingCivilization(
  architecture: LivingArchitectureSnapshot,
  ecology: LivingDistrictEcologySnapshot,
  input: {
    warehouseAssetCount: number;
    warehouseReuseTotal: number;
    warehouseGoldenBuildTotal: number;
    warehouseFavoriteCount: number;
  }
): LivingCivilizationSnapshot {
  const signals = buildCivilizationSignals(input);
  const campus = readCampusEvolutionStore();
  const currentStage = campus.stages.find((s) => s.current);

  const economies = computeEconomies(signals, architecture, ecology);
  const economyFlows = buildEconomyFlows(economies);

  const layers = {} as Record<CivilizationLayerId, CivilizationLayerState>;
  for (const def of CIVILIZATION_LAYER_DEFS) {
    const { vitality, trend } = layerVitalityFromEcology(def.id, ecology);
    layers[def.id] = {
      id: def.id,
      label: def.label,
      vitality,
      trend,
      primaryDistrict: def.primaryDistrict,
      fueledBy: def.fueledBy,
      influences: def.influences,
    };
  }

  const health = computeCivilizationHealth(layers);
  const consequences = evaluateCivilizationConsequences(economies, ecology);
  const culture = computeCulturalEvolution(signals.companyName);
  const stageLabel = currentStage?.label ?? 'STARTUP STUDIO';

  const snapshot: LivingCivilizationSnapshot = {
    computedAt: new Date().toISOString(),
    stageLabel,
    civilizationSummary: '',
    health,
    layers,
    economies,
    economyFlows,
    culture,
    consequences,
    orbArchitectLine: buildOrbArchitectLine({ health, economies, consequences, stageLabel }),
    founderExperienceLine: buildFounderExperienceLine({
      health,
      dominantLayer: health.dominantLayer,
      companyName: signals.companyName,
    }),
  };

  snapshot.civilizationSummary = buildCivilizationSummary({
    health,
    stageLabel,
    consequenceCount: consequences.length,
  });

  return snapshot;
}

export function civilizationLayerForDistrict(
  districtId: import('../architectural-navigation/district-themes').DistrictThemeId
): CivilizationLayerId | null {
  return CIVILIZATION_LAYER_DEFS.find((l) => l.primaryDistrict === districtId)?.id ?? null;
}
