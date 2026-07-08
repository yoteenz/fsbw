/**
 * Reward integration scaffold — earned, event, collaboration, milestone grants.
 */

import type { DiscoveryPackRegistryEntry, DiscoveryPackUnlockMethod } from '../types';

export type DiscoveryRewardGrant = {
  packId: string;
  grantType: string;
  unlockMethod: DiscoveryPackUnlockMethod;
  /** Never expose codename or public name for unreleased packs */
  eligible: boolean;
};

export function evaluateRewardEligibility(
  entry: DiscoveryPackRegistryEntry,
  signals: {
    innovationCapital: number;
    knowledgeCapital: number;
    collaborationCapital: number;
    civilizationHealth: number;
    activeEventIds: string[];
  }
): boolean {
  if (entry.status === 'released' || entry.status === 'revealed') return false;

  switch (entry.unlockMethod) {
    case 'civilization-event':
      return entry.linkedEventId ? signals.activeEventIds.includes(entry.linkedEventId) : false;
    case 'collaboration':
      return signals.collaborationCapital >= 60;
    case 'innovation-milestone':
      return signals.innovationCapital >= 55;
    case 'community-milestone':
      return signals.civilizationHealth >= 65;
    case 'historical-achievement':
      return signals.civilizationHealth >= 75;
    default:
      return false;
  }
}

export function countEligibleRewardGrants(
  registry: readonly DiscoveryPackRegistryEntry[],
  signals: Parameters<typeof evaluateRewardEligibility>[1]
): number {
  return registry.filter((e) => evaluateRewardEligibility(e, signals)).length;
}
