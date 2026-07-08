/**
 * Knowledge Confidence™ — World Graph distinguishes certainty levels.
 * Verified™ · Observed™ · Rumored™ · Legend™ · Unknown™ · Historical™
 */

import type { KnowledgeConfidence } from '../types';
import type { WorldEdge, WorldNode } from '../../world-graph/types';
import { countLegendsByConfidence } from './legend-registry';
import { LEGENDS_VERSION } from './constants';

export const KNOWLEDGE_CONFIDENCE_ORDER: readonly KnowledgeConfidence[] = [
  'verified',
  'observed',
  'rumored',
  'legend',
  'unknown',
  'historical',
] as const;

export function knowledgeConfidenceLabel(confidence: KnowledgeConfidence): string {
  const labels: Record<KnowledgeConfidence, string> = {
    verified: 'Verified™',
    observed: 'Observed™',
    rumored: 'Rumored™',
    legend: 'Legend™',
    unknown: 'Unknown™',
    historical: 'Historical™',
  };
  return labels[confidence];
}

function provenance(sourceRef: string) {
  return {
    source: 'ingestion' as const,
    sourceRef,
    ingestedAt: new Date().toISOString(),
  };
}

/** Aggregate confidence tier nodes — counts only, no legend identity */
export function buildLegendsWorldGraphNodes(extraCounts?: Partial<Record<KnowledgeConfidence, number>>): {
  nodes: WorldNode[];
  edges: WorldEdge[];
} {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const legendCounts = countLegendsByConfidence();
  const counts = { ...legendCounts, ...extraCounts };

  nodes.push({
    id: 'W-LEGENDS-root',
    slug: 'legends',
    displayName: 'Legends™',
    nodeType: 'engine',
    summary: 'Possibilities above Discovery Packs — mythology cultivated intentionally',
    lifecycle: 'implemented',
    plane: 'canon',
    version: '1',
    tags: ['legends', 'mythology'],
    provenance: provenance('legends'),
    metadata: { legendsVersion: LEGENDS_VERSION },
  });

  edges.push({
    id: 'WE-LEGENDS-unknown-link',
    from: 'W-UNKNOWN-root',
    to: 'W-LEGENDS-root',
    type: 'references',
    label: 'legend-layer',
    provenance: provenance('legends-unknown-link'),
  });

  for (const confidence of KNOWLEDGE_CONFIDENCE_ORDER) {
    const count = counts[confidence];
    if (!count || count === 0) continue;

    const nodeId = `W-LEGENDS-confidence-${confidence}`;
    nodes.push({
      id: nodeId,
      slug: `knowledge-confidence-${confidence}`,
      displayName: knowledgeConfidenceLabel(confidence),
      nodeType: 'milestone',
      summary: `${count} knowledge fragment${count > 1 ? 's' : ''} at ${knowledgeConfidenceLabel(confidence)} confidence`,
      lifecycle: confidence === 'historical' ? 'legacy' : 'architecture',
      plane: 'canon',
      version: '1',
      tags: ['knowledge-confidence', confidence],
      provenance: provenance('legends-confidence-aggregate'),
      metadata: { confidence, count },
    });

    edges.push({
      id: `WE-LEGENDS-${confidence}`,
      from: 'W-LEGENDS-root',
      to: nodeId,
      type: 'spawned-from',
      label: confidence,
      provenance: provenance('legends-confidence-edge'),
    });
  }

  return { nodes, edges };
}
