/**
 * Living Civilization™ → World Graph™ — model civilization, not just objects.
 */

import type { WorldEdge, WorldNode } from '../world-graph/types';
import type { LivingCivilizationSnapshot } from './types';

function provenance(sourceRef: string) {
  return {
    source: 'ingestion' as const,
    sourceRef,
    ingestedAt: new Date().toISOString(),
  };
}

export function buildCivilizationWorldGraphProjection(
  snapshot: LivingCivilizationSnapshot
): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];

  nodes.push({
    id: 'W-CIV-living-civilization',
    slug: 'living-civilization',
    displayName: 'Living Civilization™',
    nodeType: 'organization',
    summary: snapshot.civilizationSummary,
    lifecycle: 'live',
    plane: 'canon',
    version: '1',
    tags: ['civilization', 'self-balancing'],
    provenance: provenance('living-civilization'),
    metadata: {
      health: snapshot.health.overall,
      stage: snapshot.stageLabel,
      selfBalancing: snapshot.health.selfBalancing,
    },
  });

  for (const [id, layer] of Object.entries(snapshot.layers)) {
    nodes.push({
      id: `W-CIV-LAYER-${id}`,
      slug: id,
      displayName: layer.label,
      nodeType: 'district',
      summary: `Vitality ${layer.vitality}% · ${layer.trend}`,
      lifecycle: 'live',
      plane: 'canon',
      version: '1',
      tags: ['civilization-layer', id],
      provenance: provenance('civilization-layer'),
    });

    edges.push({
      id: `WE-CIV-LAYER-${id}`,
      from: 'W-CIV-living-civilization',
      to: `W-CIV-LAYER-${id}`,
      type: 'owns',
      label: 'civilization-layer',
      provenance: provenance('civilization-layer-edge'),
    });
  }

  for (const [id, economy] of Object.entries(snapshot.economies)) {
    nodes.push({
      id: `W-CIV-ECO-${id}`,
      slug: id,
      displayName: economy.label,
      nodeType: 'milestone',
      summary: `Capital ${economy.capital} · ${economy.trend}`,
      lifecycle: 'live',
      plane: 'canon',
      version: '1',
      tags: ['civilization-economy', id],
      provenance: provenance('civilization-economy'),
    });
  }

  for (const flow of snapshot.economyFlows) {
    const fromId = snapshot.economies[flow.from as keyof typeof snapshot.economies]
      ? `W-CIV-ECO-${flow.from}`
      : `W-CIV-LAYER-${flow.from}`;
    const toId = snapshot.economies[flow.to as keyof typeof snapshot.economies]
      ? `W-CIV-ECO-${flow.to}`
      : `W-CIV-LAYER-${flow.to}`;

    edges.push({
      id: `WE-CIV-FLOW-${flow.from}-${flow.to}`,
      from: fromId,
      to: toId,
      type: 'evolved-into',
      label: flow.label,
      provenance: provenance('economy-flow'),
    });
  }

  for (const consequence of snapshot.consequences) {
    nodes.push({
      id: `W-CIV-CON-${consequence.id}`,
      slug: consequence.id,
      displayName: consequence.trigger,
      nodeType: 'historical-event',
      summary: consequence.ripple,
      lifecycle: 'historical',
      plane: 'historical',
      version: '1',
      tags: ['consequence', `order-${consequence.order}`],
      provenance: provenance('civilization-consequence'),
    });

    edges.push({
      id: `WE-CIV-CON-${consequence.id}`,
      from: `W-CIV-LAYER-${consequence.sourceLayer}`,
      to: `W-CIV-CON-${consequence.id}`,
      type: 'spawned-from',
      label: `order-${consequence.order}-consequence`,
      provenance: provenance('consequence-edge'),
    });
  }

  return { nodes, edges };
}
