import type { XerRuntimeGraph } from '../types';

type CacheEntry = {
  key: string;
  graph: XerRuntimeGraph;
  createdAt: number;
};

const graphCache = new Map<string, CacheEntry>();
const MAX_ENTRIES = 48;

export function buildRuntimeCacheKey(input: {
  brandId: string;
  departmentId: string;
  sceneId: string;
  motionDnaId: string;
  platformVersion: string;
  stateVersion: string;
}): string {
  return [
    input.platformVersion,
    input.brandId,
    input.departmentId,
    input.sceneId,
    input.motionDnaId,
    input.stateVersion,
  ].join('::');
}

export function getCachedRuntimeGraph(key: string): XerRuntimeGraph | null {
  const entry = graphCache.get(key);
  if (!entry) return null;
  return entry.graph;
}

export function setCachedRuntimeGraph(key: string, graph: XerRuntimeGraph): void {
  if (graphCache.size >= MAX_ENTRIES) {
    const oldest = graphCache.keys().next().value;
    if (oldest) graphCache.delete(oldest);
  }
  graphCache.set(key, { key, graph, createdAt: Date.now() });
}

export function invalidateRuntimeCache(prefix?: string): void {
  if (!prefix) {
    graphCache.clear();
    return;
  }
  for (const key of graphCache.keys()) {
    if (key.startsWith(prefix)) graphCache.delete(key);
  }
}

export function getRuntimeCacheStats(): { hits: number; misses: number; entries: number } {
  return {
    hits: cacheHits,
    misses: cacheMisses,
    entries: graphCache.size,
  };
}

let cacheHits = 0;
let cacheMisses = 0;

export function recordCacheHit(): void {
  cacheHits += 1;
}

export function recordCacheMiss(): void {
  cacheMisses += 1;
}

export function resetCacheMetrics(): void {
  cacheHits = 0;
  cacheMisses = 0;
}
