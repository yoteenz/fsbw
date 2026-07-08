/**
 * Discovery Culture™ — public-safe mythology compute.
 * Reveals only what serves the current era. Never the full roadmap.
 */

import { DISCOVERY_CULTURE_VERSION, CURRENT_DISCOVERY_ERA } from './categories';
import { evaluateCommunityInvestigation } from './community-investigation';
import {
  countApproachingMilestones,
  deriveCivilizationMilestoneMetrics,
  evaluatePublicMilestoneProgress,
} from './civilization-milestones';
import {
  currentEraSummary,
  DISCOVERY_DESIGN_PRINCIPLE,
  selectCuriosityPrompt,
} from './discovery-events-language';
import { evaluateHiddenActivations } from './hidden-activations';
import { legendaryMysteryCount } from './legendary';
import { resolveDiscoveryState, isInternalOnlyState } from './lifecycle';
import { publicLorePulse } from './world-lore';
import { DISCOVERY_PACK_REGISTRY } from './registry';
import type { DiscoveryEligibilitySnapshot, PublicDiscoveryCultureSnapshot } from './types';
import { buildDiscoveryOracleLine } from './discovery-culture-oracle';

export function computePublicDiscoveryCulture(input: {
  warehouseAssetCount: number;
  warehouseGoldenBuildTotal: number;
  warehouseFavoriteCount: number;
  knowledgeCapital: number;
  collaborationCapital: number;
  innovationCapital: number;
  civilizationHealth: number;
  activeGrandChallengeCount: number;
  completedGrandChallengeCount: number;
  discoveryEligibility?: DiscoveryEligibilitySnapshot;
}): PublicDiscoveryCultureSnapshot {
  const metrics = deriveCivilizationMilestoneMetrics({
    ...input,
    activeGrandChallengeCount: input.activeGrandChallengeCount,
    completedGrandChallengeCount: input.completedGrandChallengeCount,
  });

  const hidden = evaluateHiddenActivations(metrics);
  const milestones = evaluatePublicMilestoneProgress(metrics);
  const investigation = evaluateCommunityInvestigation({
    collaborationCapital: input.collaborationCapital,
    knowledgeCapital: input.knowledgeCapital,
    civilizationHealth: input.civilizationHealth,
  });

  let mysteryCount = 0;
  let rumoredFrontierCount = 0;
  let teasedFrontierCount = 0;

  for (const entry of DISCOVERY_PACK_REGISTRY) {
    const state = resolveDiscoveryState(entry.discoveryState, entry.status);
    if (isInternalOnlyState(state)) mysteryCount += 1;
    if (state === 'rumored') rumoredFrontierCount += 1;
    if (state === 'teased') teasedFrontierCount += 1;
  }

  const seed =
    input.warehouseAssetCount +
    input.collaborationCapital +
    Math.round(input.knowledgeCapital);

  const lorePulse = publicLorePulse(DISCOVERY_PACK_REGISTRY);
  const legendaryCount = legendaryMysteryCount(DISCOVERY_PACK_REGISTRY);
  const approachingMilestoneCount = countApproachingMilestones(milestones);
  const curiosityPrompt = selectCuriosityPrompt(seed);

  const culture: PublicDiscoveryCultureSnapshot = {
    cultureVersion: DISCOVERY_CULTURE_VERSION,
    computedAt: new Date().toISOString(),
    eraSummary: currentEraSummary(CURRENT_DISCOVERY_ERA),
    curiosityPrompt,
    designPrinciple: DISCOVERY_DESIGN_PRINCIPLE,
    mysteryCount,
    rumoredFrontierCount,
    teasedFrontierCount,
    legendaryMysteryCount: legendaryCount,
    hiddenActivationCount: hidden.activatedCount,
    worldExpansionAmbient: hidden.worldExpansionAmbient,
    worldResponsesActive: hidden.respondingSystems,
    civilizationMilestones: milestones,
    approachingMilestoneCount,
    investigation,
    lorePulse,
    discoveryOracleLine: '',
  };

  culture.discoveryOracleLine = buildDiscoveryOracleLine(culture, {
    collaborationCapital: input.collaborationCapital,
    frontierSignalsActive: input.discoveryEligibility?.frontierSignalsActive ?? 0,
    civilizationEventLinked: input.discoveryEligibility?.civilizationEventLinked ?? 0,
    collaborationEligible: input.discoveryEligibility?.collaborationEligible ?? false,
  });

  return culture;
}
