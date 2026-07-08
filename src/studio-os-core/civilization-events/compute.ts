/**
 * Civilization Events™ — compute world-scale events from civilization state.
 */

import { readCampusEvolutionStore } from '../campus-evolution-engine/store';
import type { LivingCivilizationSnapshot } from '../living-civilization/types';
import {
  CIVILIZATION_EVENT_CATALOG,
  COLLABORATION_HONORS,
  GRAND_CHALLENGE_2026,
  SEED_CROSS_DISCIPLINE_TEAMS,
  WORLD_EXPO_2026,
} from './catalog';
import { CIVILIZATION_DISCOVERY_CATALOG, discoveryById } from './discovery-packs';
import { LIVING_MUSEUM_EXHIBITS } from './living-museum';
import { buildEventsSummary, buildOrbCuratorLine } from './orb-curator';
import type { CivilizationDiscovery, CivilizationEventsInput, CivilizationEventsSnapshot } from './types';
import { buildEventWorldImpacts } from './world-impact';

function evaluateUnlockedDiscoveries(input: CivilizationEventsInput): CivilizationDiscovery[] {
  const unlocked: CivilizationDiscovery[] = [];

  if (input.innovationCapital >= 55) {
    const d = discoveryById('disc-prototype-tech-vault');
    if (d) unlocked.push(d);
  }
  if (input.collaborationCapital >= 60) {
    const d = discoveryById('disc-orb-curator-mode');
    if (d) unlocked.push(d);
  }
  if (input.knowledgeCapital >= 58) {
    const d = discoveryById('disc-advanced-blueprint-system');
    if (d) unlocked.push(d);
  }
  if (input.civilizationHealth >= 70) {
    const d = discoveryById('disc-grand-challenge-district');
    if (d) unlocked.push(d);
  }

  return unlocked;
}

function evaluateParticipationEligible(input: CivilizationEventsInput): string[] {
  const eligible: string[] = [];

  if (input.innovationCapital >= 40) eligible.push('Innovation Challenge™');
  if (input.knowledgeCapital >= 35) eligible.push('Knowledge Tournament™');
  if (input.collaborationCapital >= 40) eligible.push('Cross-Discipline Championship™');
  if (input.warehouseAssetCount >= 8) eligible.push('Industry Olympics™');
  if (input.warehouseGoldenBuildTotal >= 4) eligible.push('Headquarters Showcase™');
  if (input.civilizationHealth >= 50) eligible.push('The Grand Challenge™');

  return eligible;
}

export function buildCivilizationEventsInput(input: {
  warehouseAssetCount: number;
  warehouseGoldenBuildTotal: number;
  warehouseFavoriteCount: number;
  civilization: LivingCivilizationSnapshot;
}): CivilizationEventsInput {
  const campus = readCampusEvolutionStore();
  return {
    warehouseAssetCount: input.warehouseAssetCount,
    warehouseGoldenBuildTotal: input.warehouseGoldenBuildTotal,
    warehouseFavoriteCount: input.warehouseFavoriteCount,
    civilizationHealth: input.civilization.health.overall,
    collaborationCapital: input.civilization.economies.collaboration.capital,
    knowledgeCapital: input.civilization.economies.knowledge.capital,
    innovationCapital: input.civilization.economies.innovation.capital,
    companyName: campus.companyName,
  };
}

export function computeCivilizationEvents(
  civilization: LivingCivilizationSnapshot,
  metrics: {
    warehouseAssetCount: number;
    warehouseGoldenBuildTotal: number;
    warehouseFavoriteCount: number;
  }
): CivilizationEventsSnapshot {
  const input = buildCivilizationEventsInput({ ...metrics, civilization });

  const activeEvents = CIVILIZATION_EVENT_CATALOG.filter((e) => e.status === 'active');
  const upcomingEvents = CIVILIZATION_EVENT_CATALOG.filter((e) => e.status === 'upcoming');

  const grandChallenge = GRAND_CHALLENGE_2026;
  const worldExpo = WORLD_EXPO_2026;

  const unlockedDiscoveries = evaluateUnlockedDiscoveries(input);
  const participationEligible = evaluateParticipationEligible(input);
  const worldImpacts = buildEventWorldImpacts(activeEvents, input.companyName);

  const snapshot: CivilizationEventsSnapshot = {
    computedAt: new Date().toISOString(),
    eventsSummary: '',
    activeEvents,
    upcomingEvents,
    grandChallenge,
    worldExpo,
    crossDisciplineTeams: SEED_CROSS_DISCIPLINE_TEAMS,
    discoveries: CIVILIZATION_DISCOVERY_CATALOG,
    unlockedDiscoveries,
    museumExhibits: LIVING_MUSEUM_EXHIBITS,
    collaborationHonors: COLLABORATION_HONORS,
    worldImpacts,
    orbCuratorLine: buildOrbCuratorLine({
      activeEvents,
      grandChallenge,
      crossDisciplineTeams: SEED_CROSS_DISCIPLINE_TEAMS,
      participationEligible,
      collaborationCapital: input.collaborationCapital,
      unlockedDiscoveryCount: unlockedDiscoveries.length,
    }),
    participationEligible,
  };

  snapshot.eventsSummary = buildEventsSummary(snapshot);
  return snapshot;
}
