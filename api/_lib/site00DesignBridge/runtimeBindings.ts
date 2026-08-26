/** Runtime-safe binding schema validation + cache/fallback */

import { RUNTIME_BINDING_TYPES } from './types.js';
import type { Site00ProjectKey, Site00RuntimeBindingRow, Site00RuntimeBindingType } from './types.js';
import {
  ALLOWED_COMPONENT_VARIANTS,
  ALLOWED_DESIGN_TOKEN_KEYS,
  ALLOWED_SECTION_KEYS,
} from './constants.js';

export type RuntimeBindingCacheEntry = {
  version: string;
  fetchedAt: number;
  bindings: Site00RuntimeBindingRow[];
};

const cache = new Map<string, RuntimeBindingCacheEntry>();
const CACHE_TTL_MS = 60_000;

function cacheKey(projectId: Site00ProjectKey, route?: string, pageKey?: string): string {
  return `${projectId}:${route ?? '*'}:${pageKey ?? '*'}`;
}

export function validateRuntimeBindingRow(row: Site00RuntimeBindingRow): { ok: boolean; reason?: string } {
  if (!(RUNTIME_BINDING_TYPES as readonly string[]).includes(row.binding_type)) {
    return { ok: false, reason: `Invalid binding type: ${row.binding_type}` };
  }

  const value = row.binding_value;
  if (value === null || typeof value !== 'object') {
    if (row.binding_type === 'content' && typeof value === 'string') return { ok: true };
    return { ok: false, reason: 'Binding value must be object or content string' };
  }

  switch (row.binding_type) {
    case 'design_token': {
      if (!ALLOWED_DESIGN_TOKEN_KEYS.has(row.binding_key)) {
        return { ok: false, reason: `Token key not allowed: ${row.binding_key}` };
      }
      break;
    }
    case 'component_variant': {
      const allowed = ALLOWED_COMPONENT_VARIANTS[row.binding_key];
      const variant = String((value as { variant?: string }).variant ?? value);
      if (!allowed?.has(variant)) {
        return { ok: false, reason: `Variant not registered: ${row.binding_key}/${variant}` };
      }
      break;
    }
    case 'section_order': {
      const order = (value as { order?: string[] }).order ?? (Array.isArray(value) ? value : null);
      if (!Array.isArray(order) || order.some((k) => !ALLOWED_SECTION_KEYS.has(k))) {
        return { ok: false, reason: 'Invalid section order keys' };
      }
      break;
    }
    case 'asset_id': {
      const assetId = String((value as { assetId?: string }).assetId ?? value);
      if (!/^[a-zA-Z0-9/_-]+$/.test(assetId)) {
        return { ok: false, reason: 'Invalid asset id format' };
      }
      break;
    }
    default:
      break;
  }

  return { ok: true };
}

export function mergeBindingsWithFallback(
  fresh: Site00RuntimeBindingRow[],
  previous: Site00RuntimeBindingRow[],
): Site00RuntimeBindingRow[] {
  const map = new Map<string, Site00RuntimeBindingRow>();
  for (const row of previous) map.set(`${row.binding_type}:${row.binding_key}`, row);
  for (const row of fresh) {
    const v = validateRuntimeBindingRow(row);
    if (v.ok) map.set(`${row.binding_type}:${row.binding_key}`, row);
  }
  return [...map.values()];
}

export function getCachedRuntimeBindings(
  projectId: Site00ProjectKey,
  route?: string,
  pageKey?: string,
): Site00RuntimeBindingRow[] | null {
  const entry = cache.get(cacheKey(projectId, route, pageKey));
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null;
  return entry.bindings;
}

export function setCachedRuntimeBindings(
  projectId: Site00ProjectKey,
  bindings: Site00RuntimeBindingRow[],
  version: string,
  route?: string,
  pageKey?: string,
): void {
  cache.set(cacheKey(projectId, route, pageKey), {
    version,
    fetchedAt: Date.now(),
    bindings,
  });
}

export function clearRuntimeBindingCache(): void {
  cache.clear();
}

export type RuntimeBindingsFetchResult = {
  bindings: Site00RuntimeBindingRow[];
  source: 'supabase' | 'cache' | 'fallback' | 'default';
  version: string;
};

export async function resolveRuntimeBindings(
  projectId: Site00ProjectKey,
  fetchRows: () => Promise<Site00RuntimeBindingRow[]>,
  opts?: { route?: string; pageKey?: string; allowStaleCache?: boolean },
): Promise<RuntimeBindingsFetchResult> {
  const cached = getCachedRuntimeBindings(projectId, opts?.route, opts?.pageKey);
  if (cached) {
    return { bindings: cached, source: 'cache', version: 'cache' };
  }

  try {
    const rows = await fetchRows();
    const valid = rows.filter((r) => validateRuntimeBindingRow(r).ok);
    const version = valid[0]?.design_version ?? 'unknown';
    setCachedRuntimeBindings(projectId, valid, version, opts?.route, opts?.pageKey);
    return { bindings: valid, source: 'supabase', version };
  } catch {
    if (cached || opts?.allowStaleCache) {
      const stale = cache.get(cacheKey(projectId, opts?.route, opts?.pageKey));
      if (stale) {
        return { bindings: stale.bindings, source: 'fallback', version: stale.version };
      }
    }
    return { bindings: [], source: 'default', version: 'default' };
  }
}

export function bindingValueForType(
  type: Site00RuntimeBindingType,
  key: string,
  value: unknown,
): unknown {
  const check = validateRuntimeBindingRow({
    id: 'synthetic',
    project_id: 'FRONTAL_SLAYER',
    route: null,
    page_key: null,
    binding_type: type,
    binding_key: key,
    binding_value: value,
    schema_version: 'site00-runtime-binding@1',
    design_version: null,
    change_request_id: null,
    is_active: true,
  });
  return check.ok ? value : undefined;
}
