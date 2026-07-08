/**
 * Unknown Frontier Lifecycle™ — World Graph remembers every origin story.
 * Unknown → Discovered → Explored → Integrated → Historic
 */

import type { UnknownFrontierLifecycle } from '../types';
import type { WorldEdge, WorldNode } from '../../world-graph/types';
import { UNKNOWN_VERSION } from './constants';

export const UNKNOWN_FRONTIER_LIFECYCLE: readonly UnknownFrontierLifecycle[] = [
  'unknown',
  'discovered',
  'explored',
  'integrated',
  'historic',
] as const;

export function unknownFrontierLabel(state: UnknownFrontierLifecycle): string {
  const labels: Record<UnknownFrontierLifecycle, string> = {
    unknown: 'Unknown™',
    discovered: 'Discovered™',
    explored: 'Explored™',
    integrated: 'Integrated™',
    historic: 'Historic™',
  };
  return labels[state];
}

function provenance(sourceRef: string) {
  return {
    source: 'ingestion' as const,
    sourceRef,
    ingestedAt: new Date().toISOString(),
  };
}

/** Aggregate lifecycle nodes — slot counts only, no pack identity */
export function buildUnknownFrontierWorldGraphNodes(slotCounts: Record<UnknownFrontierLifecycle, number>): {
  nodes: WorldNode[];
  edges: WorldEdge[];
} {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];

  nodes.push({
    id: 'W-UNKNOWN-root',
    slug: 'the-unknown',
    displayName: 'The Unknown™',
    nodeType: 'engine',
    summary: 'Permanent design philosophy — Studio World always contains unexplored frontiers',
    lifecycle: 'implemented',
    plane: 'canon',
    version: '1',
    tags: ['the-unknown', 'philosophy'],
    provenance: provenance('the-unknown'),
    metadata: { unknownVersion: UNKNOWN_VERSION },
  });

  edges.push({
    id: 'WE-UNKNOWN-culture-link',
    from: 'W-DC-culture-root',
    to: 'W-UNKNOWN-root',
    type: 'references',
    label: 'unknown-philosophy',
    provenance: provenance('unknown-culture-link'),
  });

  for (const state of UNKNOWN_FRONTIER_LIFECYCLE) {
    const count = slotCounts[state];
    if (count === 0) continue;

    const nodeId = `W-UNKNOWN-${state}`;
    nodes.push({
      id: nodeId,
      slug: `unknown-frontier-${state}`,
      displayName: unknownFrontierLabel(state),
      nodeType: 'milestone',
      summary: `${count} frontier slot${count > 1 ? 's' : ''} in ${unknownFrontierLabel(state)} — identities classified`,
      lifecycle: state === 'historic' ? 'legacy' : 'architecture',
      plane: 'canon',
      version: '1',
      tags: ['unknown-frontier', state],
      provenance: provenance('unknown-frontier-aggregate'),
      metadata: { state, count },
    });

    edges.push({
      id: `WE-UNKNOWN-${state}`,
      from: 'W-UNKNOWN-root',
      to: nodeId,
      type: 'spawned-from',
      label: state,
      provenance: provenance('unknown-frontier-edge'),
    });
  }

  return { nodes, edges };
}

/** Map internal discovery maturity to unknown frontier lifecycle — aggregate use */
export function defaultUnknownSlotCounts(mysteryCount: number, releasedCount: number): Record<UnknownFrontierLifecycle, number> {
  return {
    unknown: Math.max(1, mysteryCount),
    discovered: Math.max(0, releasedCount),
    explored: 0,
    integrated: 0,
    historic: 0,
  };
}
