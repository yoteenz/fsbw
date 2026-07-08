/**
 * Civilization Milestones™ — community-wide thresholds that evolve the world.
 * Public API exposes progress labels only — never linked pack identity.
 */

import type { PublicMilestoneProgress } from './types';

export type CivilizationMilestoneMetric =
  | 'publishedBlueprints'
  | 'successfulCollaborations'
  | 'grandChallengesSolved'
  | 'blueprintReuses'
  | 'headquartersBuilt'
  | 'knowledgeLibraryDepth'
  | 'worldGraphNodes';

export type CivilizationMilestoneDefinition = {
  id: string;
  /** Public-safe label — mythology framing */
  publicLabel: string;
  publicDescription: string;
  metric: CivilizationMilestoneMetric;
  threshold: number;
  /** Internal pack slot — never exposed */
  linkedPackId?: string;
  worldEvolutionHint: string;
};

export const CIVILIZATION_MILESTONE_CATALOG: CivilizationMilestoneDefinition[] = [
  {
    id: 'mil-assets-1m',
    publicLabel: 'The Million Asset Legacy',
    publicDescription: 'When civilization collectively publishes one million reusable assets, the world evolves.',
    metric: 'publishedBlueprints',
    threshold: 1_000_000,
    worldEvolutionHint: 'The Knowledge Library deepens — volumes appear that no founder has catalogued yet.',
  },
  {
    id: 'mil-collab-1m',
    publicLabel: 'The Collaboration Horizon',
    publicDescription: 'One million successful collaborations across professions.',
    metric: 'successfulCollaborations',
    threshold: 1_000_000,
    worldEvolutionHint: 'Cross-discipline pathways on the Atlas shift — new regions may become reachable.',
  },
  {
    id: 'mil-grand-10',
    publicLabel: 'Ten Grand Challenges Resolved',
    publicDescription: 'Ten Grand Challenges solved by the civilization.',
    metric: 'grandChallengesSolved',
    threshold: 10,
    worldEvolutionHint: 'The Museum prepares exhibits for innovations the community has not yet witnessed.',
  },
  {
    id: 'mil-reuse-1b',
    publicLabel: 'The Billion Reuse Threshold',
    publicDescription: 'One billion Blueprint reuses across Studio World.',
    metric: 'blueprintReuses',
    threshold: 1_000_000_000,
    worldEvolutionHint: 'Marketplace opportunities emerge from patterns no single founder could predict.',
  },
  {
    id: 'mil-hq-100k',
    publicLabel: 'One Hundred Thousand Headquarters',
    publicDescription: 'One hundred thousand headquarters built across the civilization.',
    metric: 'headquartersBuilt',
    threshold: 100_000,
    worldEvolutionHint: 'Districts on the Atlas gain density — the skyline suggests unexplored wings.',
  },
  {
    id: 'mil-knowledge-depth',
    publicLabel: 'The Deep Library',
    publicDescription: 'The Knowledge Library reaches institutional depth.',
    metric: 'knowledgeLibraryDepth',
    threshold: 500_000,
    worldEvolutionHint: 'Orb reports whispers of archives older than the campus itself.',
  },
  {
    id: 'mil-world-graph',
    publicLabel: 'The Living Graph',
    publicDescription: 'The World Graph reaches a major milestone of recorded history.',
    metric: 'worldGraphNodes',
    threshold: 10_000_000,
    worldEvolutionHint: 'Historical breadcrumbs appear — the community may need to investigate.',
  },
];

export type CivilizationMilestoneMetrics = Record<CivilizationMilestoneMetric, number>;

export type { PublicMilestoneProgress };

/** Derive proxy metrics from warehouse + civilization signals for milestone evaluation */
export function deriveCivilizationMilestoneMetrics(input: {
  warehouseAssetCount: number;
  warehouseGoldenBuildTotal: number;
  warehouseFavoriteCount: number;
  knowledgeCapital: number;
  collaborationCapital: number;
  innovationCapital: number;
  civilizationHealth: number;
  activeGrandChallengeCount: number;
  completedGrandChallengeCount: number;
}): CivilizationMilestoneMetrics {
  const assets = input.warehouseAssetCount;
  const golden = input.warehouseGoldenBuildTotal;

  return {
    publishedBlueprints: assets * 847 + golden * 1200,
    successfulCollaborations: Math.round(
      input.collaborationCapital * 1840 + input.warehouseFavoriteCount * 320
    ),
    grandChallengesSolved: input.completedGrandChallengeCount,
    blueprintReuses: assets * 12_400 + input.innovationCapital * 8900,
    headquartersBuilt: golden * 42 + Math.round(input.civilizationHealth * 18),
    knowledgeLibraryDepth: Math.round(
      input.knowledgeCapital * 2100 + assets * 560 + input.warehouseFavoriteCount * 90
    ),
    worldGraphNodes: Math.round(
      assets * 340 +
        golden * 520 +
        input.knowledgeCapital * 180 +
        input.collaborationCapital * 140
    ),
  };
}

export function evaluatePublicMilestoneProgress(
  metrics: CivilizationMilestoneMetrics
): PublicMilestoneProgress[] {
  return CIVILIZATION_MILESTONE_CATALOG.map((milestone) => {
    const current = metrics[milestone.metric];
    const progressPct = Math.min(100, Math.round((current / milestone.threshold) * 100));
    const approaching = progressPct >= 72 && progressPct < 100;

    return {
      id: milestone.id,
      publicLabel: milestone.publicLabel,
      publicDescription: milestone.publicDescription,
      progressPct,
      worldEvolutionHint: milestone.worldEvolutionHint,
      approaching,
    };
  });
}

export function countApproachingMilestones(progress: PublicMilestoneProgress[]): number {
  return progress.filter((m) => m.approaching).length;
}
