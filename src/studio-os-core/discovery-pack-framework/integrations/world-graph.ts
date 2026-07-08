/**
 * World Graph integration scaffold — packs become permanent civilization history on release.
 */

import type { WorldEdge, WorldNode } from '../../world-graph/types';
import type { DiscoveryPackRegistryEntry } from '../types';
import { getPublicReleases } from '../query';
import { DISCOVERY_STATE_ORDER, countByDiscoveryState, discoveryStateLabel, resolveDiscoveryState } from '../lifecycle';
import { DISCOVERY_PACK_REGISTRY } from '../registry';
import { DISCOVERY_CULTURE_VERSION } from '../categories';
import { buildUnknownFrontierWorldGraphNodes, defaultUnknownSlotCounts } from '../the-unknown/world-graph-lifecycle';

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
    tags: ['discovery-pack-reserved', entry.category, entry.tier ?? 'standard'],
    provenance: {
      source: 'ingestion',
      sourceRef: 'discovery-pack-registry',
      ingestedAt: new Date().toISOString(),
    },
    metadata: {
      packId: entry.packId,
      status: entry.status,
      discoveryState: resolveDiscoveryState(entry.discoveryState, entry.status),
      tier: entry.tier ?? 'standard',
    },
  };
}

/** Discovery Culture™ lifecycle scaffold — aggregate state nodes, no pack spoilers */
export function buildDiscoveryCultureWorldGraphNodes(): {
  nodes: WorldNode[];
  edges: WorldEdge[];
} {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];

  nodes.push({
    id: 'W-DC-culture-root',
    slug: 'discovery-culture',
    displayName: 'Discovery Culture™',
    nodeType: 'engine',
    summary: 'Studio World mythology — mysteries, milestones, and hidden discoveries',
    lifecycle: 'implemented',
    plane: 'canon',
    version: '1',
    tags: ['discovery-culture', 'mythology'],
    provenance: provenance('discovery-culture'),
    metadata: { cultureVersion: DISCOVERY_CULTURE_VERSION },
  });

  edges.push({
    id: 'WE-DC-framework-link',
    from: 'W-DPF-framework',
    to: 'W-DC-culture-root',
    type: 'references',
    label: 'culture-layer',
    provenance: provenance('discovery-culture-link'),
  });

  const stateCounts = countByDiscoveryState(DISCOVERY_PACK_REGISTRY);

  for (const state of DISCOVERY_STATE_ORDER) {
    const count = stateCounts[state];
    if (count === 0) continue;

    const nodeId = `W-DC-state-${state}`;
    nodes.push({
      id: nodeId,
      slug: `discovery-state-${state}`,
      displayName: discoveryStateLabel(state),
      nodeType: 'milestone',
      summary: `${count} discovery slot${count > 1 ? 's' : ''} in ${discoveryStateLabel(state)} — identities classified`,
      lifecycle: state === 'historical' ? 'legacy' : 'architecture',
      plane: 'canon',
      version: '1',
      tags: ['discovery-state', state],
      provenance: provenance('discovery-state-aggregate'),
      metadata: { state, count },
    });

    edges.push({
      id: `WE-DC-${state}`,
      from: 'W-DC-culture-root',
      to: nodeId,
      type: 'spawned-from',
      label: state,
      provenance: provenance('discovery-state-edge'),
    });
  }

  return { nodes, edges };
}

/** The Unknown™ World Graph extension — frontier lifecycle aggregates */
export function buildUnknownWorldGraphExtension(mysteryCount: number, releasedCount: number): {
  nodes: WorldNode[];
  edges: WorldEdge[];
} {
  const slotCounts = defaultUnknownSlotCounts(mysteryCount, releasedCount);
  return buildUnknownFrontierWorldGraphNodes(slotCounts);
}
