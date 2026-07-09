import { appendIdentityAuditEntry } from '../audit/history';
import { getIdentityRecord, recomputeIdentityIndexes } from '../identity/registry';
import { mutateIdentityEngineStore, readIdentityEngineStore } from '../persistence';
import type { IdentityGraphEdgeType } from '../constants';
import type { IdentityGraphEdge, IdentityGraphView } from '../types';
import { IDENTITY_GRAPH_EDGE_TYPES } from '../constants';

function now(): string {
  return new Date().toISOString();
}

function createEdgeId(from: string, to: string, edgeType: string): string {
  return `EDG-${from.slice(-6)}-${to.slice(-6)}-${edgeType}-${Date.now().toString(36)}`;
}

/** Identity Graph™ */
export function addIdentityGraphEdge(
  fromIdentityId: string,
  toIdentityId: string,
  edgeType: IdentityGraphEdgeType,
  metadata?: Record<string, unknown>,
  actorIdentityId: string | null = null
): IdentityGraphEdge | undefined {
  if (!getIdentityRecord(fromIdentityId) || !getIdentityRecord(toIdentityId)) {
    return undefined;
  }
  if (!(IDENTITY_GRAPH_EDGE_TYPES as readonly string[]).includes(edgeType)) {
    return undefined;
  }

  const edge: IdentityGraphEdge = {
    edgeId: createEdgeId(fromIdentityId, toIdentityId, edgeType),
    fromIdentityId,
    toIdentityId,
    edgeType,
    metadata,
    createdAt: now(),
  };

  mutateIdentityEngineStore((store) => ({
    ...store,
    graphEdges: [...store.graphEdges, edge],
  }));

  appendIdentityAuditEntry({
    identityId: fromIdentityId,
    action: 'graph_edge_added',
    actorIdentityId,
    nextSnapshot: { edge },
  });

  recomputeIdentityIndexes();
  return edge;
}

export function removeIdentityGraphEdge(
  edgeId: string,
  actorIdentityId: string | null = null
): boolean {
  const store = readIdentityEngineStore();
  const edge = store.graphEdges.find((e) => e.edgeId === edgeId);
  if (!edge) return false;

  mutateIdentityEngineStore((current) => ({
    ...current,
    graphEdges: current.graphEdges.filter((e) => e.edgeId !== edgeId),
  }));

  appendIdentityAuditEntry({
    identityId: edge.fromIdentityId,
    action: 'graph_edge_removed',
    actorIdentityId,
    previousSnapshot: { edge },
  });

  recomputeIdentityIndexes();
  return true;
}

export function listIdentityGraphEdges(): IdentityGraphEdge[] {
  return [...readIdentityEngineStore().graphEdges];
}

export function listOutboundIdentityGraphEdges(identityId: string): IdentityGraphEdge[] {
  return listIdentityGraphEdges().filter((e) => e.fromIdentityId === identityId);
}

export function listInboundIdentityGraphEdges(identityId: string): IdentityGraphEdge[] {
  return listIdentityGraphEdges().filter((e) => e.toIdentityId === identityId);
}

export function getIdentityGraphView(): IdentityGraphView {
  const edges = listIdentityGraphEdges();
  const nodeSet = new Set<string>();
  for (const edge of edges) {
    nodeSet.add(edge.fromIdentityId);
    nodeSet.add(edge.toIdentityId);
  }
  return { nodes: [...nodeSet], edges };
}

export function listIdentityGraphDependents(identityId: string): string[] {
  return listInboundIdentityGraphEdges(identityId).map((e) => e.fromIdentityId);
}

export function listIdentityGraphDependencies(identityId: string): string[] {
  return listOutboundIdentityGraphEdges(identityId).map((e) => e.toIdentityId);
}

export function detectIdentityGraphCycles(): { hasCycles: boolean; cycles: string[][] } {
  const edges = listIdentityGraphEdges();
  const graph = new Map<string, string[]>();

  for (const edge of edges) {
    if (edge.edgeType === 'contains' || edge.edgeType === 'inherits_scope') {
      const list = graph.get(edge.fromIdentityId) ?? [];
      list.push(edge.toIdentityId);
      graph.set(edge.fromIdentityId, list);
    }
  }

  const cycles: string[][] = [];
  const visited = new Set<string>();
  const stack = new Set<string>();
  const path: string[] = [];

  function dfs(node: string): void {
    if (stack.has(node)) {
      const start = path.indexOf(node);
      if (start >= 0) cycles.push([...path.slice(start), node]);
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    stack.add(node);
    path.push(node);
    for (const next of graph.get(node) ?? []) dfs(next);
    path.pop();
    stack.delete(node);
  }

  for (const node of graph.keys()) dfs(node);
  return { hasCycles: cycles.length > 0, cycles };
}
