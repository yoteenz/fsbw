import type { AtlasNode } from '../studio-world-atlas/types';
import type { OrbExecutiveJourney, OrbRecommendation, OrbWorldSignal } from './types';

function signalKindFor(rec: OrbRecommendation): OrbWorldSignal['kind'] {
  if (rec.category === 'approve-generation') return 'beacon';
  if (rec.category === 'surprise-discovery') return 'pulse';
  if (rec.priority === 'critical') return 'beacon';
  if (rec.priority === 'high') return 'glow';
  return 'glow';
}

/** Map recommendations to Atlas world signals — buildings glow, destinations pulse, beacons appear. */
export function buildOrbWorldSignals(
  recommendations: OrbRecommendation[],
  nodes: AtlasNode[]
): OrbWorldSignal[] {
  const nodeIds = new Set(nodes.map((n) => n.id));
  const signals: OrbWorldSignal[] = [];

  for (const rec of recommendations.slice(0, 8)) {
    if (!rec.targetNodeId) continue;
    let nodeId = rec.targetNodeId;
    if (!nodeIds.has(nodeId)) {
      const partial = nodes.find(
        (n) => n.id.includes(nodeId) || n.flagshipId === nodeId.replace('atlas-flagship-', '')
      );
      if (partial) nodeId = partial.id;
      else continue;
    }
    signals.push({
      nodeId,
      kind: signalKindFor(rec),
      recommendationId: rec.id,
      priority: rec.priority,
    });
  }

  return signals;
}

export function orbSignalClass(kind: OrbWorldSignal['kind']): string {
  switch (kind) {
    case 'beacon':
      return 'has-orb-beacon';
    case 'pulse':
      return 'has-orb-pulse';
    case 'glow':
      return 'has-orb-glow';
    case 'route':
      return 'has-orb-route';
    default:
      return 'has-orb-glow';
  }
}

export function resolveOrbSignalForNode(
  nodeId: string,
  signals: OrbWorldSignal[]
): OrbWorldSignal | undefined {
  return signals.find((s) => s.nodeId === nodeId);
}

export function journeyNodePositions(
  nodes: AtlasNode[],
  journey: OrbExecutiveJourney
): Record<string, { x: number; y: number }> {
  const map: Record<string, { x: number; y: number }> = {};
  for (const stop of journey.stops) {
    if (!stop.nodeId) continue;
    const node =
      nodes.find((n) => n.id === stop.nodeId) ??
      nodes.find((n) => n.id.includes(stop.nodeId!)) ??
      nodes.find((n) => stop.nodeId!.includes(n.flagshipId ?? ''));
    if (node) map[stop.nodeId] = { x: node.mapX, y: node.mapY };
  }
  return map;
}
