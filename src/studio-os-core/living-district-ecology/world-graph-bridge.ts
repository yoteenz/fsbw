/**
 * Living District Ecology™ → World Graph™ — district relationships become queryable.
 */

import type { WorldEdge, WorldNode } from '../world-graph/types';
import type { LivingDistrictEcologySnapshot } from './types';
import { ECOSYSTEM_LOOP } from './relationships';

function provenance(sourceRef: string) {
  return {
    source: 'ingestion' as const,
    sourceRef,
    ingestedAt: new Date().toISOString(),
  };
}

export function buildEcologyWorldGraphProjection(
  snapshot: LivingDistrictEcologySnapshot
): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];

  nodes.push({
    id: 'W-ECO-campus-ecosystem',
    slug: 'campus-ecosystem',
    displayName: 'Living District Ecology™',
    nodeType: 'district',
    summary: snapshot.ecosystemSummary,
    lifecycle: 'live',
    plane: 'canon',
    version: '1',
    tags: ['ecosystem', 'world-health'],
    provenance: provenance('living-district-ecology'),
    metadata: {
      ecosystemBalance: snapshot.ecosystemBalance,
      balanceLabel: snapshot.balanceLabel,
    },
  });

  for (const edge of ECOSYSTEM_LOOP) {
    const flow = snapshot.activeSynergyFlows.find(
      (f) => f.from === edge.from && f.to === edge.to
    );
    edges.push({
      id: `WE-ECO-${edge.from}-${edge.to}`,
      from: `W-DIST-${edge.from}`,
      to: `W-DIST-${edge.to}`,
      type: 'evolved-into',
      label: `${edge.verb} · strength ${flow?.strength ?? 0}`,
      provenance: provenance('ecosystem-loop'),
    });
  }

  for (const reaction of snapshot.chainReactions) {
    nodes.push({
      id: reaction.worldGraphNodeId,
      slug: reaction.id,
      displayName: reaction.trigger,
      nodeType: 'historical-event',
      summary: reaction.sourceEvent,
      lifecycle: 'historical',
      plane: 'historical',
      version: '1',
      tags: ['chain-reaction', reaction.sourceDistrict],
      provenance: provenance('chain-reaction'),
    });

    for (const consequence of reaction.consequences) {
      edges.push({
        id: `WE-CR-${reaction.id}-${consequence.districtId}`,
        from: reaction.worldGraphNodeId,
        to: `W-DIST-${consequence.districtId}`,
        type: 'spawned-from',
        label: consequence.architecturalChange,
        provenance: provenance('chain-reaction-consequence'),
      });
    }
  }

  return { nodes, edges };
}
