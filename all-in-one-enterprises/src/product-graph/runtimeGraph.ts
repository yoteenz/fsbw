import runtimeGraphJson from './generated/runtimeProductGraph.json';
import routeMetaJson from './generated/routeMetaRegistry.json';
import type { RouteMetaEntry, RuntimeProductGraphFile, RouteMetaRegistryFile } from './types';

const runtimeGraph = runtimeGraphJson as unknown as RuntimeProductGraphFile;
const routeMetaRegistry = routeMetaJson as unknown as RouteMetaRegistryFile;

const metaByPath = new Map<string, RouteMetaEntry>();
for (const entry of routeMetaRegistry.entries) {
  metaByPath.set(entry.path, entry);
}

export function getRuntimeProductGraph(): RuntimeProductGraphFile {
  return runtimeGraph;
}

export function getRouteMetaRegistry(): RouteMetaRegistryFile {
  return routeMetaRegistry;
}

export function getRouteMetaByPath(pathname: string): RouteMetaEntry | undefined {
  const normalized = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  return metaByPath.get(normalized) ?? metaByPath.get(`${normalized}/`);
}

export function getRouteMetaForLocation(pathname: string): RouteMetaEntry | undefined {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  let hit = getRouteMetaByPath(normalized);
  if (hit) return hit;
  const parts = normalized.split('/');
  while (parts.length > 1) {
    parts.pop();
    hit = getRouteMetaByPath(parts.join('/') || '/');
    if (hit) return hit;
  }
  return undefined;
}

export const AIO_PRODUCT_FAMILIES = runtimeGraph.families;
export const AIO_ROLE_PROJECTIONS = runtimeGraph.role_projections;
