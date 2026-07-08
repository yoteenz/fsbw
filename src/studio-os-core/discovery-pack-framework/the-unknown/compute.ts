/**
 * The Unknown™ — public-safe compute.
 * Preserves mystery forever. Never exposes the full map.
 */

import {
  ATLAS_UNDERSTANDING_FRAMING,
  THE_UNKNOWN_PHILOSOPHY,
  THE_UNKNOWN_PROMISE,
  UNKNOWN_DESIGN_PRINCIPLE,
  UNKNOWN_VERSION,
} from './constants';
import { computePublicAtlasRegionSummary } from './known-world';
import { computeWorldFog } from './world-fog';
import {
  countActiveDiscoveryConditions,
  evaluateDiscoveryConditions,
} from './discovery-conditions';
import {
  evaluateCommunityDiscoveries,
  primaryCommunityDiscovery,
} from './community-discoveries';
import { buildOrbUnknownHint } from './orb-hints';
import { selectDiscoveryLanguageLine } from './discovery-language';
import {
  buildPublicUnknownMuseumExhibits,
  museumExhibitAmbientLine,
} from './museum-exhibits';
import { deriveCivilizationMilestoneMetrics } from '../civilization-milestones';
import type { PublicUnknownSnapshot } from '../types';

export function computePublicUnknown(input: {
  warehouseAssetCount: number;
  warehouseGoldenBuildTotal: number;
  warehouseFavoriteCount: number;
  knowledgeCapital: number;
  collaborationCapital: number;
  innovationCapital: number;
  civilizationHealth: number;
  activeGrandChallengeCount: number;
  completedGrandChallengeCount: number;
  hiddenActivationCount: number;
  worldExpansionActive: boolean;
}): PublicUnknownSnapshot {
  const metrics = deriveCivilizationMilestoneMetrics({
    warehouseAssetCount: input.warehouseAssetCount,
    warehouseGoldenBuildTotal: input.warehouseGoldenBuildTotal,
    warehouseFavoriteCount: input.warehouseFavoriteCount,
    knowledgeCapital: input.knowledgeCapital,
    collaborationCapital: input.collaborationCapital,
    innovationCapital: input.innovationCapital,
    civilizationHealth: input.civilizationHealth,
    activeGrandChallengeCount: input.activeGrandChallengeCount,
    completedGrandChallengeCount: input.completedGrandChallengeCount,
  });

  const regionSummary = computePublicAtlasRegionSummary();
  const worldFog = computeWorldFog({
    metrics,
    knowledgeCapital: input.knowledgeCapital,
    collaborationCapital: input.collaborationCapital,
    innovationCapital: input.innovationCapital,
    civilizationHealth: input.civilizationHealth,
  });

  const discoveryConditions = evaluateDiscoveryConditions(metrics);
  const conditionsMet = discoveryConditions.filter((c) => c.met).length;
  const approachingConditions = discoveryConditions.filter((c) => c.approaching).length;

  const communityDiscoveries = evaluateCommunityDiscoveries(metrics);
  const communityUnlocked = communityDiscoveries.filter((d) => d.unlocked).length;
  const primaryCommunity = primaryCommunityDiscovery(communityDiscoveries);

  const museumExhibits = buildPublicUnknownMuseumExhibits({
    hiddenActivationCount: input.hiddenActivationCount,
    conditionsMet,
  });

  const seed =
    input.warehouseAssetCount +
    Math.round(input.knowledgeCapital) +
    Math.round(input.collaborationCapital);

  return {
    unknownVersion: UNKNOWN_VERSION,
    computedAt: new Date().toISOString(),
    philosophy: THE_UNKNOWN_PHILOSOPHY,
    promise: THE_UNKNOWN_PROMISE,
    atlasUnderstanding: ATLAS_UNDERSTANDING_FRAMING,
    designPrinciple: UNKNOWN_DESIGN_PRINCIPLE,
    mapNeverComplete: true,
    regionSummary,
    worldFog,
    discoveryConditionsActive: countActiveDiscoveryConditions(discoveryConditions),
    approachingConditionCount: approachingConditions,
    communityDiscoveries,
    primaryCommunityDiscovery: primaryCommunity,
    museumExhibits,
    museumAmbientLine: museumExhibitAmbientLine(museumExhibits.length),
    orbHint: buildOrbUnknownHint({
      seed,
      signalsBeyondFrontier: worldFog.signalsBeyondFrontier,
      fogActivePct: worldFog.activeFogPct,
      approachingConditionCount: approachingConditions,
      communityDiscoveryProgressPct: primaryCommunity?.progressPct ?? 0,
    }),
    discoveryLanguageLine: selectDiscoveryLanguageLine({
      worldExpansionActive: input.worldExpansionActive,
      conditionsMet,
      communityUnlocked,
      seed,
    }),
  };
}
