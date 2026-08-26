/**
 * Client-safe runtime binding consumer — never uses service role or executes DB code.
 * Reads from in-memory cache populated by server/API; falls back to source defaults.
 */
import type { Site00ProjectKey, Site00RuntimeBindingRow } from '../../api/_lib/site00DesignBridge/types.js';
import {
  getCachedRuntimeBindings,
  mergeBindingsWithFallback,
  validateRuntimeBindingRow,
} from '../../api/_lib/site00DesignBridge/runtimeBindings.js';

const clientCache = new Map<string, Site00RuntimeBindingRow[]>();

export function hydrateSite00RuntimeBindings(
  projectId: Site00ProjectKey,
  bindings: Site00RuntimeBindingRow[],
  route?: string,
  pageKey?: string,
): void {
  const valid = bindings.filter((b) => validateRuntimeBindingRow(b).ok);
  clientCache.set(`${projectId}:${route ?? '*'}:${pageKey ?? '*'}`, valid);
}

export function getClientSite00RuntimeBindings(
  projectId: Site00ProjectKey,
  route?: string,
  pageKey?: string,
  defaults: Site00RuntimeBindingRow[] = [],
): Site00RuntimeBindingRow[] {
  const key = `${projectId}:${route ?? '*'}:${pageKey ?? '*'}`;
  const cached = clientCache.get(key) ?? getCachedRuntimeBindings(projectId, route, pageKey) ?? [];
  return mergeBindingsWithFallback(cached, defaults);
}

export function getClientBindingValue<T = unknown>(
  projectId: Site00ProjectKey,
  bindingType: Site00RuntimeBindingRow['binding_type'],
  bindingKey: string,
  route?: string,
  pageKey?: string,
  fallback?: T,
): T | undefined {
  const rows = getClientSite00RuntimeBindings(projectId, route, pageKey);
  const row = rows.find((r) => r.binding_type === bindingType && r.binding_key === bindingKey);
  if (!row) return fallback;
  const v = validateRuntimeBindingRow(row);
  return v.ok ? (row.binding_value as T) : fallback;
}
