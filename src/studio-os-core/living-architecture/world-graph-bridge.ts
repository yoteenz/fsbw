/**
 * Living Architecture™ → World Graph™ projection bridge.
 * Every architectural expansion becomes an explorable historical node.
 */

import type { WorldEdge, WorldNode } from '../world-graph/types';
import type { LivingArchitectureSnapshot } from './types';

function provenance(sourceRef: string) {
  return {
    source: 'ingestion' as const,
    sourceRef,
    ingestedAt: new Date().toISOString(),
  };
}

export function buildLivingArchitectureWorldGraphProjection(
  snapshot: LivingArchitectureSnapshot
): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];

  nodes.push({
    id: 'W-HQ-studio-archives',
    slug: 'studio-archives',
    displayName: 'Studio Archives™',
    nodeType: 'headquarters',
    summary: snapshot.skylineSummary,
    lifecycle: 'live',
    plane: 'canon',
    version: '1',
    tags: ['living-architecture', 'campus'],
    provenance: provenance('living-architecture'),
    metadata: { campusStage: snapshot.campusStageLabel },
  });

  for (const node of snapshot.expansionGraph) {
    nodes.push({
      id: node.id,
      slug: node.id.toLowerCase(),
      displayName: node.label,
      nodeType: 'milestone',
      summary: node.causedBy,
      lifecycle: 'historical',
      plane: 'historical',
      version: '1',
      tags: ['architectural-milestone', node.districtId],
      provenance: provenance('living-architecture-milestone'),
      metadata: { earnedAt: node.earnedAt, districtId: node.districtId },
    });

    edges.push({
      id: `WE-${node.id}-hq`,
      from: 'W-HQ-studio-archives',
      to: node.id,
      type: 'evolved-into',
      label: node.edgeLabel,
      provenance: provenance('living-architecture-expansion'),
    });
  }

  return { nodes, edges };
}
