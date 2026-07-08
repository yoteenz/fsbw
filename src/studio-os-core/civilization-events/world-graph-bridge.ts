/**
 * Civilization Events™ → World Graph™ — permanent civilization history from events.
 */

import type { WorldEdge, WorldNode } from '../world-graph/types';
import type { CivilizationEventsSnapshot } from './types';

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

  for (const discovery of snapshot.unlockedDiscoveries) {
    nodes.push({
      id: discovery.worldGraphNodeId,
      slug: discovery.id,
      displayName: discovery.title,
      nodeType: 'milestone',
      summary: discovery.description,
      lifecycle: 'historical',
      plane: 'historical',
      version: '1',
      tags: ['civilization-discovery', discovery.kind],
      provenance: provenance('discovery-pack'),
    });

    edges.push({
      id: `WE-DISC-${discovery.id}`,
      from: 'W-CIV-EVENTS-root',
      to: discovery.worldGraphNodeId,
      type: 'evolved-into',
      label: 'discovery-unlocked',
      provenance: provenance('discovery-edge'),
    });
  }

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
