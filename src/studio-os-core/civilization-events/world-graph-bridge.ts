/**
 * Civilization Events™ → World Graph™ — permanent civilization history from events.
 * Only released Discovery Packs appear in graph — reserved slots stay internal.
 */

import type { WorldEdge, WorldNode } from '../world-graph/types';
import type { CivilizationEventsSnapshot } from './types';
import { buildDiscoveryCultureWorldGraphNodes } from '../discovery-pack-framework/integrations/world-graph';

function provenance(sourceRef: string) {
  return {
    source: 'ingestion' as const,
    sourceRef,
    ingestedAt: new Date().toISOString(),
  };
}

export function buildCivilizationEventsWorldGraphProjection(
  snapshot: CivilizationEventsSnapshot
): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];

  nodes.push({
    id: 'W-CIV-EVENTS-root',
    slug: 'civilization-events',
    displayName: 'Civilization Events™',
    nodeType: 'historical-event',
    summary: snapshot.eventsSummary,
    lifecycle: 'live',
    plane: 'canon',
    version: '1',
    tags: ['civilization-events', 'world-scale'],
    provenance: provenance('civilization-events'),
  });

  for (const event of [...snapshot.activeEvents, ...snapshot.upcomingEvents]) {
    nodes.push({
      id: event.worldGraphNodeId,
      slug: event.id,
      displayName: event.title,
      nodeType: 'historical-event',
      summary: event.worldImpactSummary,
      lifecycle: event.status === 'active' ? 'live' : 'architecture',
      plane: 'canon',
      version: '1',
      tags: ['civilization-event', event.category],
      provenance: provenance('civilization-event'),
      metadata: {
        collaborationRequired: event.collaborationRequired,
        professions: event.professions,
      },
    });

    edges.push({
      id: `WE-EVT-${event.id}`,
      from: 'W-CIV-EVENTS-root',
      to: event.worldGraphNodeId,
      type: 'spawned-from',
      label: event.category,
      provenance: provenance('event-edge'),
    });
  }

  if (snapshot.grandChallenge) {
    const gc = snapshot.grandChallenge;
    nodes.push({
      id: gc.worldGraphNodeId,
      slug: gc.id,
      displayName: `Grand Challenge™ ${gc.year}`,
      nodeType: 'milestone',
      summary: gc.permanentImpact,
      lifecycle: 'live',
      plane: 'canon',
      version: '1',
      tags: ['grand-challenge'],
      provenance: provenance('grand-challenge'),
    });
  }

  nodes.push({
    id: 'W-DPF-framework',
    slug: 'discovery-pack-framework',
    displayName: 'Discovery Pack Framework™',
    nodeType: 'engine',
    summary: snapshot.discoveryFramework.frontierSummary,
    lifecycle: 'implemented',
    plane: 'canon',
    version: '1',
    tags: ['discovery-pack-framework'],
    provenance: provenance('discovery-pack-framework'),
  });

  for (const release of snapshot.discoveryFramework.publicReleases) {
    nodes.push({
      id: `W-DP-${release.packId}`,
      slug: release.packId.toLowerCase(),
      displayName: release.publicName,
      nodeType: 'milestone',
      summary: `Discovery Pack — ${release.category}`,
      lifecycle: release.status === 'released' ? 'live' : 'approved',
      plane: 'canon',
      version: '1',
      tags: ['discovery-pack-released', release.category],
      provenance: provenance('discovery-pack-release'),
    });

    edges.push({
      id: `WE-DP-${release.packId}`,
      from: 'W-DPF-framework',
      to: `W-DP-${release.packId}`,
      type: 'evolved-into',
      label: 'discovery-released',
      provenance: provenance('discovery-release-edge'),
    });
  }

  const cultureGraph = buildDiscoveryCultureWorldGraphNodes();
  nodes.push(...cultureGraph.nodes);
  edges.push(...cultureGraph.edges);

  nodes.push({
    id: 'W-DC-culture-pulse',
    slug: 'discovery-culture-pulse',
    displayName: 'Discovery Culture Pulse',
    nodeType: 'milestone',
    summary: snapshot.discoveryCulture.lorePulse,
    lifecycle: 'live',
    plane: 'canon',
    version: '1',
    tags: ['discovery-culture', 'lore'],
    provenance: provenance('discovery-culture-pulse'),
    metadata: {
      mysteryCount: snapshot.discoveryCulture.mysteryCount,
      eraSummary: snapshot.discoveryCulture.eraSummary,
    },
  });

  edges.push({
    id: 'WE-DC-pulse',
    from: 'W-DC-culture-root',
    to: 'W-DC-culture-pulse',
    type: 'references',
    label: 'lore-pulse',
    provenance: provenance('discovery-culture-pulse-edge'),
  });

  for (const impact of snapshot.worldImpacts) {
    edges.push({
      id: `WE-IMPACT-${impact.id}`,
      from: impact.graphNodeId,
      to: 'W-CIV-living-civilization',
      type: 'references',
      label: impact.invented,
      provenance: provenance('event-impact'),
    });
  }

  for (const exhibit of snapshot.museumExhibits) {
    nodes.push({
      id: exhibit.worldGraphNodeId,
      slug: exhibit.id,
      displayName: exhibit.title,
      nodeType: 'golden-build',
      summary: exhibit.winnerLabel,
      lifecycle: 'legacy',
      plane: 'historical',
      version: '1',
      tags: ['living-museum', 'permanent-exhibit'],
      provenance: provenance('living-museum'),
    });
  }

  return { nodes, edges };
}
