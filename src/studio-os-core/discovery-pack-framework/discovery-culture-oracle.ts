/**
 * Discovery Oracle™ — Orb voice for Discovery Culture™.
 * Builds anticipation around exploration — never software updates.
 */

import type { DiscoveryEligibilitySnapshot, PublicDiscoveryCultureSnapshot } from './types';
import { frameHiddenDiscovery, frameWorldExpansion } from './discovery-events-language';
import { selectLegendaryHint } from './legendary';

type OracleInsight = {
  priority: number;
  line: string;
};

export function buildDiscoveryOracleLine(
  culture: PublicDiscoveryCultureSnapshot,
  eligibility: Pick<
    DiscoveryEligibilitySnapshot,
    'frontierSignalsActive' | 'civilizationEventLinked' | 'collaborationEligible'
  > & { collaborationCapital: number }
): string {
  const insights: OracleInsight[] = [];

  if (culture.worldExpansionAmbient) {
    insights.push({
      priority: 99,
      line: culture.worldExpansionAmbient,
    });
    insights.push({
      priority: 98,
      line: frameWorldExpansion(),
    });
  }

  if (culture.hiddenActivationCount > 0 && !culture.worldExpansionAmbient) {
    insights.push({
      priority: 97,
      line: frameHiddenDiscovery(),
    });
  }

  if (culture.investigation.primaryThread && culture.investigation.advancingCount > 0) {
    const thread = culture.investigation.primaryThread;
    insights.push({
      priority: 94,
      line: `Community Investigation™ — "${thread.publicTitle}" is ${thread.communityProgressPct}% decoded. ${thread.publicHint}`,
    });
  }

  if (culture.approachingMilestoneCount > 0) {
    const approaching = culture.civilizationMilestones.find((m) => m.approaching);
    if (approaching) {
      insights.push({
        priority: 91,
        line: `${approaching.publicLabel} — ${approaching.progressPct}% toward a civilization milestone. When civilization advances, the world evolves.`,
      });
    }
  }

  if (culture.legendaryMysteryCount > 0) {
    insights.push({
      priority: 88,
      line: selectLegendaryHint(culture.mysteryCount + culture.legendaryMysteryCount),
    });
  }

  if (culture.rumoredFrontierCount > 0 || culture.teasedFrontierCount > 0) {
    const signals = culture.rumoredFrontierCount + culture.teasedFrontierCount;
    insights.push({
      priority: 86,
      line: `${signals} frontier signal${signals > 1 ? 's' : ''} detected beyond the Atlas — rumors, not release notes.`,
    });
  }

  if (eligibility.civilizationEventLinked > 0) {
    insights.push({
      priority: 84,
      line: `${eligibility.civilizationEventLinked} active civilization event${eligibility.civilizationEventLinked > 1 ? 's' : ''} may unlock discoveries the community has not mapped.`,
    });
  }

  if (culture.mysteryCount > 0) {
    insights.push({
      priority: 82,
      line: `${culture.mysteryCount} mysteries remain beyond what founders have uncovered. ${culture.curiosityPrompt}`,
    });
  }

  if (insights.length === 0) {
    return `${culture.lorePulse} ${culture.curiosityPrompt} Studio World is not complete — it is infinite.`;
  }

  insights.sort((a, b) => b.priority - a.priority);
  return insights[0]!.line;
}
