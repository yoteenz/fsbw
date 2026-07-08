import type { WorldEdgeType, WorldGraph, WorldGraphQueryFilter, WorldNode } from './types';

export function filterWorldNodes(graph: WorldGraph, filter: WorldGraphQueryFilter): WorldNode[] {
  let nodes = [...graph.nodes];

  if (filter.nodeType) {
    const types = Array.isArray(filter.nodeType) ? filter.nodeType : [filter.nodeType];
    nodes = nodes.filter((n) => types.includes(n.nodeType));
  }

  if (filter.lifecycle) {
    const stages = Array.isArray(filter.lifecycle) ? filter.lifecycle : [filter.lifecycle];
    nodes = nodes.filter((n) => stages.includes(n.lifecycle));
  }

  if (filter.plane) {
    nodes = nodes.filter((n) => n.plane === filter.plane);
  }

  if (filter.tag) {
    nodes = nodes.filter((n) => n.tags?.includes(filter.tag!));
  }

  if (filter.search) {
    const q = filter.search.toLowerCase();
    nodes = nodes.filter(
      (n) =>
        n.displayName.toLowerCase().includes(q) ||
        n.slug.includes(q) ||
        n.summary?.toLowerCase().includes(q) ||
        n.aliases?.some((a) => a.toLowerCase().includes(q))
    );
  }

  return nodes;
}

export function traverseWorldGraph(
  graph: WorldGraph,
  startId: string,
  edgeType?: WorldEdgeType,
  maxDepth = 4
): WorldNode[] {
  const visited = new Set<string>();
  const result: WorldNode[] = [];
  const queue: Array<{ id: string; depth: number }> = [{ id: startId, depth: 0 }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.id) || current.depth > maxDepth) continue;
    visited.add(current.id);

    const node = graph.nodes.find((n) => n.id === current.id);
    if (node && current.id !== startId) result.push(node);

    const edges = graph.edges.filter(
      (e) => e.from === current.id && (!edgeType || e.type === edgeType)
    );
    for (const edge of edges) {
      if (!visited.has(edge.to)) {
        queue.push({ id: edge.to, depth: current.depth + 1 });
      }
    }
  }

  return result;
}

/** Archivist-style queries — relationship-first, not document search */
export function queryNodesReusingAsset(graph: WorldGraph, assetNodeId: string): WorldNode[] {
  const edges = graph.edges.filter(
    (e) => e.to === assetNodeId && (e.type === 'reused-by' || e.type === 'references')
  );
  return edges
    .map((e) => graph.nodes.find((n) => n.id === e.from))
    .filter((n): n is WorldNode => Boolean(n));
}

export function queryNodesInLocation(graph: WorldGraph, locationNodeId: string): WorldNode[] {
  return graph.nodes.filter((n) =>
    graph.edges.some((e) => e.from === n.id && e.to === locationNodeId && e.type === 'located-in')
  );
}

export function queryFlagshipRooms(graph: WorldGraph, flagshipId: string): WorldNode[] {
  return graph.nodes.filter(
    (n) =>
      n.nodeType === 'room' &&
      graph.edges.some((e) => e.from === n.id && e.to === flagshipId && e.type === 'located-in')
  );
}

export function queryEvolutionChain(graph: WorldGraph, nodeId: string): WorldNode[] {
  const chain: WorldNode[] = [];
  let current = graph.nodes.find((n) => n.id === nodeId);
  const visited = new Set<string>();

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    chain.push(current);
    const next = graph.edges.find((e) => e.from === current!.id && e.type === 'supersedes');
    current = next ? graph.nodes.find((n) => n.id === next.to) : undefined;
  }

  return chain;
}
