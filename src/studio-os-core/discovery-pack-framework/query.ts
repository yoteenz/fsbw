/**
 * Public-safe Discovery Pack queries — never expose reserved/classified pack identity.
 */

import {
  DISCOVERY_FRAMEWORK_VERSION,
  DISCOVERY_PACK_CATEGORY_PILLARS,
  FRONTIER_SUMMARY,
  HALL_OF_DISCOVERY_ID,
} from './categories';
import { DISCOVERY_PACK_REGISTRY } from './registry';
import type {
  DiscoveryEligibilitySnapshot,
  DiscoveryPackRegistryEntry,
  DiscoveryPackStatus,
  PublicDiscoveryFrameworkSnapshot,
  PublicDiscoveryRelease,
} from './types';

const PUBLIC_VISIBLE_STATUSES: DiscoveryPackStatus[] = ['revealed', 'released', 'archived'];

export function isPublicVisibleStatus(status: DiscoveryPackStatus): boolean {
  return PUBLIC_VISIBLE_STATUSES.includes(status);
}

export function getInternalRegistry(): readonly DiscoveryPackRegistryEntry[] {
  return DISCOVERY_PACK_REGISTRY;
}

export function getPublicReleases(): PublicDiscoveryRelease[] {
  return DISCOVERY_PACK_REGISTRY.filter(
    (e) => isPublicVisibleStatus(e.status) && e.publicName
  ).map((e) => ({
    packId: e.packId,
    publicName: e.publicName!,
    category: e.category,
    status: e.status === 'released' || e.status === 'archived' ? 'released' : 'revealed',
    releaseEra: e.releaseEra,
    revealedAt: e.canonicalHistory ? e.canonicalHistory : null,
  }));
}

export function computePublicDiscoveryFramework(): PublicDiscoveryFrameworkSnapshot {
  const released = DISCOVERY_PACK_REGISTRY.filter((e) => e.status === 'released').length;
  const revealed = DISCOVERY_PACK_REGISTRY.filter(
    (e) => e.status === 'revealed' || e.status === 'released'
  ).length;
  const reserved = DISCOVERY_PACK_REGISTRY.filter(
    (e) => e.status === 'reserved' || e.status === 'classified' || e.status === 'scheduled'
  ).length;

  const categoryPillars = Object.values(DISCOVERY_PACK_CATEGORY_PILLARS).map((pillar) => ({
    ...pillar,
    reservedCount: DISCOVERY_PACK_REGISTRY.filter((e) => e.category === pillar.category).length,
  }));

  return {
    frameworkVersion: DISCOVERY_FRAMEWORK_VERSION,
    computedAt: new Date().toISOString(),
    frontierSummary: FRONTIER_SUMMARY,
    releasedPackCount: released,
    revealedPackCount: revealed,
    reservedSlotCount: reserved,
    hallOfDiscoveryReady: true,
    categoryPillars,
    publicReleases: getPublicReleases(),
    integrationStatus: {
      worldGraph: true,
      atlas: true,
      museum: true,
      marketplace: true,
      knowledgeCore: true,
      rewards: true,
    },
  };
}

export function evaluateDiscoveryEligibility(input: {
  innovationCapital: number;
  knowledgeCapital: number;
  collaborationCapital: number;
  civilizationHealth: number;
  activeEventIds: string[];
}): DiscoveryEligibilitySnapshot {
  let frontierSignals = 0;
  let eventLinked = 0;

  if (input.innovationCapital >= 55) frontierSignals += 1;
  if (input.knowledgeCapital >= 58) frontierSignals += 1;
  if (input.collaborationCapital >= 60) frontierSignals += 1;
  if (input.civilizationHealth >= 70) frontierSignals += 1;

  for (const entry of DISCOVERY_PACK_REGISTRY) {
    if (entry.linkedEventId && input.activeEventIds.includes(entry.linkedEventId)) {
      eventLinked += 1;
    }
  }

  return {
    frontierSignalsActive: frontierSignals,
    civilizationEventLinked: eventLinked,
    collaborationEligible: input.collaborationCapital >= 40,
  };
}

export function hallOfDiscoveryId(): string {
  return HALL_OF_DISCOVERY_ID;
}
