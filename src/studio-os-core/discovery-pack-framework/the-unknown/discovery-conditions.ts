/**
 * Discovery Conditions™ — unknown regions unlock through civilization evolution.
 * Never through time alone.
 */

import type { CivilizationMilestoneMetrics } from '../civilization-milestones';

export type DiscoveryConditionKind =
  | 'knowledge-milestone'
  | 'historic-collaboration'
  | 'industry-breakthrough'
  | 'grand-challenge'
  | 'world-graph-expansion'
  | 'marketplace-maturity'
  | 'education-milestone'
  | 'innovation-threshold'
  | 'profession-level';

export type DiscoveryConditionDefinition = {
  id: string;
  kind: DiscoveryConditionKind;
  publicLabel: string;
  publicDescription: string;
  metricKey: keyof CivilizationMilestoneMetrics;
  threshold: number;
  /** Internal — never exposed */
  linkedPackId?: string;
};

export const DISCOVERY_CONDITION_CATALOG: DiscoveryConditionDefinition[] = [
  {
    id: 'cond-knowledge-milestone',
    kind: 'knowledge-milestone',
    publicLabel: 'Knowledge Milestone',
    publicDescription: 'The Knowledge Library reaches institutional depth civilization has never recorded.',
    metricKey: 'knowledgeLibraryDepth',
    threshold: 400_000,
  },
  {
    id: 'cond-historic-collaboration',
    kind: 'historic-collaboration',
    publicLabel: 'Historic Collaboration',
    publicDescription: 'A cross-industry collaboration of historic scale shifts the World Graph™.',
    metricKey: 'successfulCollaborations',
    threshold: 750_000,
    linkedPackId: 'DP-CIV-002',
  },
  {
    id: 'cond-industry-breakthrough',
    kind: 'industry-breakthrough',
    publicLabel: 'Industry Breakthrough',
    publicDescription: 'An industry breakthrough propagates through every profession simultaneously.',
    metricKey: 'blueprintReuses',
    threshold: 50_000_000,
  },
  {
    id: 'cond-grand-challenge',
    kind: 'grand-challenge',
    publicLabel: 'Grand Challenge Completed',
    publicDescription: 'Civilization completes a Grand Challenge — the world responds permanently.',
    metricKey: 'grandChallengesSolved',
    threshold: 1,
    linkedPackId: 'DP-EXP-002',
  },
  {
    id: 'cond-world-graph',
    kind: 'world-graph-expansion',
    publicLabel: 'World Graph Expansion',
    publicDescription: 'The World Graph reaches a depth that reveals gaps in the Atlas.',
    metricKey: 'worldGraphNodes',
    threshold: 500_000,
    linkedPackId: 'DP-MECH-001',
  },
  {
    id: 'cond-marketplace-maturity',
    kind: 'marketplace-maturity',
    publicLabel: 'Marketplace Maturity',
    publicDescription: 'Marketplace ecosystems mature to a threshold that attracts new civilizations.',
    metricKey: 'publishedBlueprints',
    threshold: 750_000,
    linkedPackId: 'DP-CRE-001',
  },
  {
    id: 'cond-education-milestone',
    kind: 'education-milestone',
    publicLabel: 'Education Milestone',
    publicDescription: 'Educational contributions reach a global threshold — knowledge becomes geography.',
    metricKey: 'knowledgeLibraryDepth',
    threshold: 300_000,
    linkedPackId: 'DP-EVT-KNOWLEDGE-DEEP',
  },
  {
    id: 'cond-innovation-threshold',
    kind: 'innovation-threshold',
    publicLabel: 'Innovation Threshold',
    publicDescription: 'Innovation capital crosses a frontier the Prototype Vault has never seen.',
    metricKey: 'blueprintReuses',
    threshold: 25_000_000,
    linkedPackId: 'DP-EVT-INNOVATION-VAULT',
  },
  {
    id: 'cond-profession-level',
    kind: 'profession-level',
    publicLabel: 'Profession Ascension',
    publicDescription: 'Entire professions reach new levels — the Atlas suggests wings not yet built.',
    metricKey: 'headquartersBuilt',
    threshold: 75_000,
    linkedPackId: 'DP-DIST-001',
  },
];

export type PublicDiscoveryCondition = {
  id: string;
  publicLabel: string;
  publicDescription: string;
  progressPct: number;
  met: boolean;
  approaching: boolean;
};

export function evaluateDiscoveryConditions(
  metrics: CivilizationMilestoneMetrics
): PublicDiscoveryCondition[] {
  return DISCOVERY_CONDITION_CATALOG.map((cond) => {
    const current = metrics[cond.metricKey];
    const progressPct = Math.min(100, Math.round((current / cond.threshold) * 100));
    const met = current >= cond.threshold;
    const approaching = progressPct >= 70 && !met;

    return {
      id: cond.id,
      publicLabel: cond.publicLabel,
      publicDescription: cond.publicDescription,
      progressPct,
      met,
      approaching,
    };
  });
}

export function countActiveDiscoveryConditions(conditions: PublicDiscoveryCondition[]): number {
  return conditions.filter((c) => c.met || c.approaching).length;
}
