/**
 * Legend Registry™ — internal whispers above Discovery Pack slots.
 * Public API exposes legend themes only — never codenames or pack linkage.
 */

import type { KnowledgeConfidence, LegendOutcome, LegendRegistryEntry, LegendTheme } from '../types';

export const LEGEND_REGISTRY: LegendRegistryEntry[] = [
  {
    legendId: 'LEG-DIST-001',
    internalWhisper: 'HORIZON-LEGEND',
    publicWhisper: 'Cartographers debate a district visible on damaged maps but absent from the current Atlas.',
    theme: 'forgotten-district',
    confidence: 'legend',
    outcome: 'unresolved',
    linkedPackId: 'DP-DIST-001',
  },
  {
    legendId: 'LEG-DIST-002',
    internalWhisper: 'RUNWAY-WHISPER',
    publicWhisper: 'Pilots in the Innovation District report runways that resolve to fog at certain coordinates.',
    theme: 'uncharted-region',
    confidence: 'rumored',
    outcome: 'possible-pack',
    linkedPackId: 'DP-DIST-002',
  },
  {
    legendId: 'LEG-CIV-001',
    internalWhisper: 'PROFESSION-MYTH',
    publicWhisper: 'Historical records mention a profession network that predates every living headquarters.',
    theme: 'forgotten-civilization',
    confidence: 'legend',
    outcome: 'unresolved',
    linkedPackId: 'DP-CIV-001',
  },
  {
    legendId: 'LEG-CIV-002',
    internalWhisper: 'SKYBRIDGE-SONG',
    publicWhisper: 'Founders crossing the Atrium sometimes hear collaboration described as happening on a bridge that does not exist.',
    theme: 'forgotten-civilization',
    confidence: 'rumored',
    outcome: 'possible-pack',
    linkedPackId: 'DP-CIV-002',
  },
  {
    legendId: 'LEG-INT-001',
    internalWhisper: 'ORB-DEEP-MURMUR',
    publicWhisper: 'Orb occasionally speaks in a voice no founder has prompted — as though another intelligence listens.',
    theme: 'dormant-intelligence',
    confidence: 'observed',
    outcome: 'possible-pack',
    linkedPackId: 'DP-INT-001',
  },
  {
    legendId: 'LEG-MECH-001',
    internalWhisper: 'PARALLEL-ECHO',
    publicWhisper: 'The World Graph contains references to futures that were never built — parallel pathways, unresolved.',
    theme: 'unexplained-technology',
    confidence: 'legend',
    outcome: 'evolved-different',
    linkedPackId: 'DP-MECH-001',
  },
  {
    legendId: 'LEG-CRE-001',
    internalWhisper: 'ATELIER-RUMOR',
    publicWhisper: 'Marketplace merchants whisper of partner ateliers that accept collaboration but have no listed address.',
    theme: 'missing-discovery',
    confidence: 'rumored',
    outcome: 'never-materialize',
  },
  {
    legendId: 'LEG-EXP-001',
    internalWhisper: 'EXPO-GHOST',
    publicWhisper: 'The Museum reserves pavilion space for an expo that historical records describe but no founder attended.',
    theme: 'forgotten-expedition',
    confidence: 'legend',
    outcome: 'possible-pack',
    linkedPackId: 'DP-EXP-001',
  },
  {
    legendId: 'LEG-KNOW-001',
    internalWhisper: 'LINEAGE-GAP',
    publicWhisper: 'Blueprint Archive contains lineage records with missing pages — workflows that end mid-sentence.',
    theme: 'blueprint-fragment',
    confidence: 'observed',
    outcome: 'unresolved',
    linkedPackId: 'DP-EVT-KNOWLEDGE-DEEP',
  },
  {
    legendId: 'LEG-VAULT-001',
    internalWhisper: 'SEALED-CHAMBER',
    publicWhisper: 'The Prototype Vault resonates at hours when no founder is present — as though something unfinished wakes.',
    theme: 'unfinished-prototype',
    confidence: 'rumored',
    outcome: 'possible-pack',
    linkedPackId: 'DP-EVT-INNOVATION-VAULT',
  },
  {
    legendId: 'LEG-ARCH-001',
    internalWhisper: 'SIGNATURE-BEYOND',
    publicWhisper: 'Architectural signatures appear beyond the mapped frontier — structures no expedition has verified.',
    theme: 'architectural-anomaly',
    confidence: 'observed',
    outcome: 'unresolved',
  },
  {
    legendId: 'LEG-GRAPH-001',
    internalWhisper: 'UNRESOLVED-NODE',
    publicWhisper: 'The World Graph holds references to nodes that resolve to empty coordinates — knowledge without location.',
    theme: 'world-graph-ghost',
    confidence: 'legend',
    outcome: 'never-materialize',
  },
];

export function countLegendsByConfidence(
  registry: readonly LegendRegistryEntry[] = LEGEND_REGISTRY
): Record<KnowledgeConfidence, number> {
  const counts: Record<KnowledgeConfidence, number> = {
    verified: 0,
    observed: 0,
    rumored: 0,
    legend: 0,
    unknown: 0,
    historical: 0,
  };

  for (const entry of registry) {
    counts[entry.confidence] += 1;
  }

  return counts;
}

export function countLegendsByOutcome(
  registry: readonly LegendRegistryEntry[] = LEGEND_REGISTRY
): Record<LegendOutcome, number> {
  const counts: Record<LegendOutcome, number> = {
    'possible-pack': 0,
    'never-materialize': 0,
    'evolved-different': 0,
    unresolved: 0,
  };

  for (const entry of registry) {
    counts[entry.outcome] += 1;
  }

  return counts;
}

export function selectPublicLegendWhisper(seed: number): string {
  const active = LEGEND_REGISTRY.filter((l) => l.outcome !== 'never-materialize');
  return active[Math.abs(seed) % active.length]!.publicWhisper;
}

export function legendThemeLabel(theme: LegendTheme): string {
  const labels: Record<LegendTheme, string> = {
    'forgotten-district': 'Forgotten District',
    'uncharted-region': 'Uncharted Region',
    'forgotten-civilization': 'Forgotten Civilization',
    'dormant-intelligence': 'Dormant Intelligence',
    'unexplained-technology': 'Unexplained Technology',
    'missing-discovery': 'Missing Discovery',
    'forgotten-expedition': 'Forgotten Expedition',
    'blueprint-fragment': 'Blueprint Fragment',
    'unfinished-prototype': 'Unfinished Prototype',
    'architectural-anomaly': 'Architectural Anomaly',
    'world-graph-ghost': 'World Graph Ghost',
  };
  return labels[theme];
}
