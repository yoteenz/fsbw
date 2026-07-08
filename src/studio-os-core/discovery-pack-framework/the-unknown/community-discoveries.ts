/**
 * Community Discoveries™ — no single founder unlocks these.
 * Civilization itself must advance into unexplored territory.
 */

import type { PublicCommunityDiscovery } from '../types';
import type { CivilizationMilestoneMetrics } from '../civilization-milestones';

export type CommunityDiscoveryDefinition = {
  id: string;
  publicLabel: string;
  publicDescription: string;
  metricKey: keyof CivilizationMilestoneMetrics;
  threshold: number;
  foundersRequiredHint: string;
  /** Internal — never exposed */
  linkedPackId?: string;
};

export const COMMUNITY_DISCOVERY_CATALOG: CommunityDiscoveryDefinition[] = [
  {
    id: 'comm-blueprints-1m',
    publicLabel: 'One Million Reusable Blueprints',
    publicDescription: 'Thousands of founders must collectively publish one million reusable assets.',
    metricKey: 'publishedBlueprints',
    threshold: 1_000_000,
    foundersRequiredHint: 'No single founder can chart this frontier.',
  },
  {
    id: 'comm-hq-100k',
    publicLabel: 'One Hundred Thousand Headquarters',
    publicDescription: 'One hundred thousand headquarters built across the civilization.',
    metricKey: 'headquartersBuilt',
    threshold: 100_000,
    foundersRequiredHint: 'Civilization density reveals regions the Atlas never showed.',
    linkedPackId: 'DP-DIST-002',
  },
  {
    id: 'comm-cross-industry',
    publicLabel: 'Historic Cross-Industry Collaboration',
    publicDescription: 'Professions that never collaborated must meet at civilization scale.',
    metricKey: 'successfulCollaborations',
    threshold: 500_000,
    foundersRequiredHint: 'Collaboration at this scale pushes the map beyond its edge.',
    linkedPackId: 'DP-CIV-001',
  },
  {
    id: 'comm-global-knowledge',
    publicLabel: 'Global Knowledge Milestone',
    publicDescription: 'The Knowledge Library reaches a depth that rewrites cartography.',
    metricKey: 'knowledgeLibraryDepth',
    threshold: 450_000,
    foundersRequiredHint: 'Knowledge becomes geography when enough founders contribute.',
    linkedPackId: 'DP-EVT-KNOWLEDGE-DEEP',
  },
  {
    id: 'comm-innovation-milestone',
    publicLabel: 'Innovation Milestone',
    publicDescription: 'Innovation reuses cross a threshold that awakens sealed world mechanics.',
    metricKey: 'blueprintReuses',
    threshold: 100_000_000,
    foundersRequiredHint: 'The community literally pushes civilization into unexplored territory.',
    linkedPackId: 'DP-INT-001',
  },
];

export function evaluateCommunityDiscoveries(
  metrics: CivilizationMilestoneMetrics
): PublicCommunityDiscovery[] {
  return COMMUNITY_DISCOVERY_CATALOG.map((def) => {
    const current = metrics[def.metricKey];
    const progressPct = Math.min(100, Math.round((current / def.threshold) * 100));
    const unlocked = current >= def.threshold;

    return {
      id: def.id,
      publicLabel: def.publicLabel,
      publicDescription: def.publicDescription,
      progressPct,
      unlocked,
      foundersRequiredHint: def.foundersRequiredHint,
    };
  });
}

export function primaryCommunityDiscovery(
  discoveries: PublicCommunityDiscovery[]
): PublicCommunityDiscovery | null {
  const advancing = discoveries
    .filter((d) => !d.unlocked && d.progressPct >= 15)
    .sort((a, b) => b.progressPct - a.progressPct);
  return advancing[0] ?? null;
}
