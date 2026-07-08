/**
 * Civilization Events™ — compute world-scale events from civilization state.
 */

import {
  computePublicDiscoveryFramework,
  computePublicDiscoveryCulture,
  computePublicUnknown,
  computePublicLegends,
  countEligibleRewardGrants,
  evaluateDiscoveryEligibility,
  getInternalRegistry,
  buildDiscoveryOracleLine,
} from '../discovery-pack-framework';
import { readCampusEvolutionStore } from '../campus-evolution-engine/store';
import type { LivingCivilizationSnapshot } from '../living-civilization/types';
import {
  CIVILIZATION_EVENT_CATALOG,
  COLLABORATION_HONORS,
  GRAND_CHALLENGE_2026,
  SEED_CROSS_DISCIPLINE_TEAMS,
  WORLD_EXPO_2026,
} from './catalog';
import { LIVING_MUSEUM_EXHIBITS } from './living-museum';
import { buildEventsSummary, buildOrbCuratorLine } from './orb-curator';
import type { CivilizationEventsInput, CivilizationEventsSnapshot } from './types';
import { buildEventWorldImpacts } from './world-impact';

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

  const activeEventIds = activeEvents.map((e) => e.id);
  const discoveryFramework = computePublicDiscoveryFramework();
  const discoveryEligibility = evaluateDiscoveryEligibility({
    innovationCapital: input.innovationCapital,
    knowledgeCapital: input.knowledgeCapital,
    collaborationCapital: input.collaborationCapital,
    civilizationHealth: input.civilizationHealth,
    activeEventIds,
  });
  const discoveryCulture = computePublicDiscoveryCulture({
    warehouseAssetCount: metrics.warehouseAssetCount,
    warehouseGoldenBuildTotal: metrics.warehouseGoldenBuildTotal,
    warehouseFavoriteCount: metrics.warehouseFavoriteCount,
    knowledgeCapital: input.knowledgeCapital,
    collaborationCapital: input.collaborationCapital,
    innovationCapital: input.innovationCapital,
    civilizationHealth: input.civilizationHealth,
    activeGrandChallengeCount: grandChallenge?.status === 'active' ? 1 : 0,
    completedGrandChallengeCount: 0,
    discoveryEligibility,
  });
  const theUnknown = computePublicUnknown({
    warehouseAssetCount: metrics.warehouseAssetCount,
    warehouseGoldenBuildTotal: metrics.warehouseGoldenBuildTotal,
    warehouseFavoriteCount: metrics.warehouseFavoriteCount,
    knowledgeCapital: input.knowledgeCapital,
    collaborationCapital: input.collaborationCapital,
    innovationCapital: input.innovationCapital,
    civilizationHealth: input.civilizationHealth,
    activeGrandChallengeCount: grandChallenge?.status === 'active' ? 1 : 0,
    completedGrandChallengeCount: 0,
    hiddenActivationCount: discoveryCulture.hiddenActivationCount,
    worldExpansionActive: discoveryCulture.worldExpansionAmbient != null,
  });
  discoveryCulture.discoveryOracleLine = buildDiscoveryOracleLine(
    discoveryCulture,
    {
      collaborationCapital: input.collaborationCapital,
      frontierSignalsActive: discoveryEligibility.frontierSignalsActive,
      civilizationEventLinked: discoveryEligibility.civilizationEventLinked,
      collaborationEligible: discoveryEligibility.collaborationEligible,
    },
    theUnknown
  );
  const legends = computePublicLegends({
    warehouseAssetCount: metrics.warehouseAssetCount,
    knowledgeCapital: input.knowledgeCapital,
    collaborationCapital: input.collaborationCapital,
    innovationCapital: input.innovationCapital,
    civilizationHealth: input.civilizationHealth,
    mysteryCount: discoveryCulture.mysteryCount,
    investigationActiveCount: discoveryCulture.investigation.activeCount,
  });
  const eligibleDiscoveryGrantCount = countEligibleRewardGrants(getInternalRegistry(), {
    innovationCapital: input.innovationCapital,
    knowledgeCapital: input.knowledgeCapital,
    collaborationCapital: input.collaborationCapital,
    civilizationHealth: input.civilizationHealth,
    activeEventIds,
  });

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
    discoveryFramework,
    discoveryCulture,
    theUnknown,
    legends,
    discoveryEligibility,
    eligibleDiscoveryGrantCount,
    museumExhibits: LIVING_MUSEUM_EXHIBITS,
    collaborationHonors: COLLABORATION_HONORS,
    worldImpacts,
    orbCuratorLine: buildOrbCuratorLine({
      activeEvents,
      grandChallenge,
      crossDisciplineTeams: SEED_CROSS_DISCIPLINE_TEAMS,
      participationEligible,
      collaborationCapital: input.collaborationCapital,
      discoveryEligibility,
      frontierSummary: discoveryFramework.frontierSummary,
    }),
    orbDiscoveryLine: discoveryCulture.discoveryOracleLine,
    orbUnknownHint: theUnknown.orbHint,
    orbLegendRumor: legends.orbRumorLine,
    participationEligible,
  };

  snapshot.eventsSummary = buildEventsSummary(snapshot);
  return snapshot;
}
