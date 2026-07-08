/**
 * Hidden Discoveries™ — quiet activation when civilization reaches meaningful milestones.
 * No countdown. No marketing. The world simply grows.
 */

import type { CivilizationMilestoneMetrics } from './civilization-milestones';

export type HiddenActivationTrigger =
  | 'profession-blueprints'
  | 'historic-collaboration'
  | 'innovation-challenge-solved'
  | 'world-graph-milestone'
  | 'knowledge-library-depth'
  | 'district-emergence';

export type HiddenActivationDefinition = {
  id: string;
  trigger: HiddenActivationTrigger;
  threshold: number;
  metricKey: keyof CivilizationMilestoneMetrics;
  /** Internal — never surface to founder UI */
  linkedPackId: string;
  worldResponses: ('atlas' | 'orb' | 'museum' | 'knowledge' | 'marketplace')[];
  /** Public-safe ambient line when activation fires */
  publicAmbientLine: string;
  /** Category hint only — no pack name */
  discoveryCategoryHint: string;
};

export const HIDDEN_ACTIVATION_CATALOG: HiddenActivationDefinition[] = [
  {
    id: 'ha-profession-100k-blueprints',
    trigger: 'profession-blueprints',
    threshold: 100_000,
    metricKey: 'publishedBlueprints',
    linkedPackId: 'DP-DIST-001',
    worldResponses: ['atlas', 'orb', 'museum', 'knowledge'],
    publicAmbientLine:
      'Explorers report the Atlas™ has shifted — a region beyond the Innovation District may exist.',
    discoveryCategoryHint: 'district',
  },
  {
    id: 'ha-historic-collaboration',
    trigger: 'historic-collaboration',
    threshold: 50_000,
    metricKey: 'successfulCollaborations',
    linkedPackId: 'DP-CIV-002',
    worldResponses: ['orb', 'museum', 'marketplace'],
    publicAmbientLine:
      'A historic collaboration has been recorded. The World Graph™ suggests civilizations once met here.',
    discoveryCategoryHint: 'civilization',
  },
  {
    id: 'ha-innovation-challenge',
    trigger: 'innovation-challenge-solved',
    threshold: 250_000,
    metricKey: 'blueprintReuses',
    linkedPackId: 'DP-EVT-INNOVATION-VAULT',
    worldResponses: ['museum', 'knowledge', 'orb'],
    publicAmbientLine:
      'The Prototype Vault™ resonates — as though a sealed chamber has opened without announcement.',
    discoveryCategoryHint: 'world-mechanics',
  },
  {
    id: 'ha-world-graph-major',
    trigger: 'world-graph-milestone',
    threshold: 1_000_000,
    metricKey: 'worldGraphNodes',
    linkedPackId: 'DP-MECH-001',
    worldResponses: ['atlas', 'orb', 'knowledge'],
    publicAmbientLine:
      'The World Graph™ has reached a depth cartographers did not expect. Parallel pathways may exist.',
    discoveryCategoryHint: 'world-mechanics',
  },
  {
    id: 'ha-knowledge-depth',
    trigger: 'knowledge-library-depth',
    threshold: 200_000,
    metricKey: 'knowledgeLibraryDepth',
    linkedPackId: 'DP-EVT-KNOWLEDGE-DEEP',
    worldResponses: ['knowledge', 'museum', 'orb'],
    publicAmbientLine:
      'New volumes appear in the Knowledge Library — lineage records older than any living founder remembers.',
    discoveryCategoryHint: 'civilization',
  },
  {
    id: 'ha-district-emergence',
    trigger: 'district-emergence',
    threshold: 25_000,
    metricKey: 'headquartersBuilt',
    linkedPackId: 'DP-DIST-002',
    worldResponses: ['atlas', 'museum', 'marketplace', 'orb'],
    publicAmbientLine:
      'Founders report an unfamiliar skyline on the horizon. The world just got bigger.',
    discoveryCategoryHint: 'district',
  },
];

export type HiddenActivationEvaluation = {
  /** Count of activations whose thresholds are met — identity hidden */
  activatedCount: number;
  /** Highest-priority public ambient line, if any activation fired */
  worldExpansionAmbient: string | null;
  /** World systems responding — aggregate only */
  respondingSystems: string[];
};

export function evaluateHiddenActivations(
  metrics: CivilizationMilestoneMetrics
): HiddenActivationEvaluation {
  const activated = HIDDEN_ACTIVATION_CATALOG.filter(
    (def) => metrics[def.metricKey] >= def.threshold
  );

  if (activated.length === 0) {
    return {
      activatedCount: 0,
      worldExpansionAmbient: null,
      respondingSystems: [],
    };
  }

  const primary = activated[activated.length - 1]!;
  const systems = new Set<string>();
  for (const act of activated) {
    for (const sys of act.worldResponses) systems.add(sys);
  }

  return {
    activatedCount: activated.length,
    worldExpansionAmbient: primary.publicAmbientLine,
    respondingSystems: [...systems],
  };
}
