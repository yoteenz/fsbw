import type { WorldEdge, WorldGraph, WorldNode } from './types';

export function createEmptyWorldGraph(): WorldGraph {
  const now = new Date().toISOString();
  return {
    graphId: 'studio-world-graph',
    version: 'world-graph.v1',
    compiledAt: now,
    nodeCount: 0,
    edgeCount: 0,
    nodes: [],
    edges: [],
    canonicalRule: 'world-graph-is-truth',
  };
}

export function finalizeWorldGraph(
  nodes: WorldNode[],
  edges: WorldEdge[],
  compiledAt = new Date().toISOString()
): WorldGraph {
  const nodeIds = new Set(nodes.map((n) => n.id));
  const dedupedNodes = dedupeById(nodes);
  const dedupedEdges = dedupeEdges(edges.filter((e) => nodeIds.has(e.from) && nodeIds.has(e.to)));

  return {
    graphId: 'studio-world-graph',
    version: 'world-graph.v1',
    compiledAt,
    nodeCount: dedupedNodes.length,
    edgeCount: dedupedEdges.length,
    nodes: dedupedNodes.sort((a, b) => a.displayName.localeCompare(b.displayName)),
    edges: dedupedEdges,
    canonicalRule: 'world-graph-is-truth',
  };
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of items) map.set(item.id, item);
  return Array.from(map.values());
}

function dedupeEdges(edges: WorldEdge[]): WorldEdge[] {
  const map = new Map<string, WorldEdge>();
  for (const edge of edges) map.set(`${edge.type}:${edge.from}:${edge.to}`, edge);
  return Array.from(map.values());
}

export function getWorldNode(graph: WorldGraph, id: string): WorldNode | undefined {
  return graph.nodes.find((n) => n.id === id);
}

export function listWorldNodesByType(graph: WorldGraph, nodeType: WorldNode['nodeType']): WorldNode[] {
  return graph.nodes.filter((n) => n.nodeType === nodeType);
}

export function listOutgoingEdges(graph: WorldGraph, nodeId: string): WorldEdge[] {
  return graph.edges.filter((e) => e.from === nodeId);
}

export function listIncomingEdges(graph: WorldGraph, nodeId: string): WorldEdge[] {
  return graph.edges.filter((e) => e.to === nodeId);
}

export function listNeighbors(graph: WorldGraph, nodeId: string, edgeType?: WorldEdge['type']): WorldNode[] {
  const edges = listOutgoingEdges(graph, nodeId).filter((e) => !edgeType || e.type === edgeType);
  return edges
    .map((e) => getWorldNode(graph, e.to))
    .filter((n): n is WorldNode => Boolean(n));
}
