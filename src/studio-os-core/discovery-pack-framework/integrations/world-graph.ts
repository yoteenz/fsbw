/**
 * World Graph integration scaffold — packs become permanent civilization history on release.
 */

import type { WorldEdge, WorldNode } from '../../world-graph/types';
import type { DiscoveryPackRegistryEntry } from '../types';
import { getPublicReleases } from '../query';

function provenance(sourceRef: string) {
  return {
    source: 'ingestion' as const,
    sourceRef,
    ingestedAt: new Date().toISOString(),
  };
}

export function buildDiscoveryPackFrameworkWorldGraphNodes(): {
  nodes: WorldNode[];
  edges: WorldEdge[];
} {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];

  nodes.push({
    id: 'W-DPF-framework',
    slug: 'discovery-pack-framework',
    displayName: 'Discovery Pack Framework™',
    nodeType: 'engine',
    summary: 'Internal registry and release infrastructure for civilization expansions',
    lifecycle: 'implemented',
    plane: 'canon',
    version: '1',
    tags: ['discovery-pack-framework', 'infrastructure'],
    provenance: provenance('discovery-pack-framework'),
  });

  for (const release of getPublicReleases()) {
    nodes.push({
      id: `W-DP-${release.packId}`,
      slug: release.packId.toLowerCase(),
      displayName: release.publicName,
      nodeType: 'milestone',
      summary: `Discovery Pack released — ${release.category}`,
      lifecycle: release.status === 'released' ? 'live' : 'approved',
      plane: 'canon',
      version: '1',
      tags: ['discovery-pack', release.category, 'released'],
      provenance: provenance('discovery-pack-release'),
    });

    edges.push({
      id: `WE-DP-${release.packId}`,
      from: 'W-DPF-framework',
      to: `W-DP-${release.packId}`,
      type: 'spawned-from',
      label: 'discovery-released',
      provenance: provenance('discovery-release-edge'),
    });
  }

  return { nodes, edges };
}

/** Reserved slot nodes — internal graph structure only, no public names */
export function buildReservedPackGraphScaffold(entry: DiscoveryPackRegistryEntry): WorldNode {
  return {
    id: entry.integrations.worldGraph.nodeId,
    slug: entry.internalCodename.toLowerCase(),
    displayName: `[Reserved] ${entry.internalCodename}`,
    nodeType: 'milestone',
    summary: `Discovery Pack slot — ${entry.category} · ${entry.status}`,
    lifecycle: 'architecture',
    plane: 'canon',
    version: '1',
    tags: ['discovery-pack-reserved', entry.category],
    provenance: {
      source: 'ingestion',
      sourceRef: 'discovery-pack-registry',
      ingestedAt: new Date().toISOString(),
    },
    metadata: { packId: entry.packId, status: entry.status },
  };
}
