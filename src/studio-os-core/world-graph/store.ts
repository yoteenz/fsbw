import { readStudioOsJson, writeStudioOsJson } from '../../utils/studioOsBrowserStorage';
import { WORLD_GRAPH_STORAGE_KEY } from './constants';
import type { WorldGraph } from './types';

type WorldGraphStore = {
  version: string;
  graph: WorldGraph;
  cachedAt: string;
};

const EMPTY: WorldGraphStore = {
  version: 'world-graph.v1',
  graph: {
    graphId: 'studio-world-graph',
    version: 'world-graph.v1',
    compiledAt: '',
    nodeCount: 0,
    edgeCount: 0,
    nodes: [],
    edges: [],
    canonicalRule: 'world-graph-is-truth',
  },
  cachedAt: '',
};

export function readCachedWorldGraph(): WorldGraph | null {
  const store = readStudioOsJson(WORLD_GRAPH_STORAGE_KEY, () => EMPTY);
  return store.graph.nodeCount > 0 ? store.graph : null;
}

export function writeCachedWorldGraph(graph: WorldGraph): void {
  writeStudioOsJson(WORLD_GRAPH_STORAGE_KEY, {
    version: 'world-graph.v1',
    graph,
    cachedAt: new Date().toISOString(),
  });
}

export async function fetchCompiledWorldGraph(): Promise<WorldGraph | null> {
  try {
    const res = await fetch('/studio-os/world-graph/graph.json');
    if (!res.ok) return null;
    return (await res.json()) as WorldGraph;
  } catch {
    return null;
  }
}
