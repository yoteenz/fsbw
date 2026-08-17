import type { BusinessNameCheckRequest, BusinessNameCheckResponse } from './types';
import { demoBusinessNameRegistryAdapter } from './adapters/demoAdapter';
import { createTopographAdapterFromEnv } from './adapters/topographAdapter';
import { unsupportedStateRegistryAdapter } from './adapters/unsupportedAdapter';
import { getStateRegistryCapability, resolveEffectiveLookupMethod } from './stateCapabilities';

const lookupCache = new Map<string, { expiresAt: number; response: BusinessNameCheckResponse }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function cacheKey(request: BusinessNameCheckRequest, normalized: string): string {
  return [request.state.toUpperCase(), normalized, request.entityType ?? ''].join('|');
}

function getCached(key: string): BusinessNameCheckResponse | null {
  const hit = lookupCache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    lookupCache.delete(key);
    return null;
  }
  return { ...hit.response, checkedAt: new Date().toISOString() };
}

function setCache(key: string, response: BusinessNameCheckResponse): void {
  lookupCache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, response });
}

export function resetBusinessNameLookupCache(): void {
  lookupCache.clear();
}

export async function checkBusinessNameAvailability(
  request: BusinessNameCheckRequest,
): Promise<BusinessNameCheckResponse> {
  const demoMode = Boolean(request.demoMode);
  const method = resolveEffectiveLookupMethod(request.state, demoMode);
  const cap = getStateRegistryCapability(request.state);

  if (demoMode) {
    return demoBusinessNameRegistryAdapter.check(request);
  }

  const normalized = request.businessName.trim();
  if (!normalized) {
    return demoBusinessNameRegistryAdapter.check(request);
  }

  const key = cacheKey(request, normalized);
  const cached = getCached(key);
  if (cached) return cached;

  if (method === 'topograph_api') {
    const adapter = createTopographAdapterFromEnv();
    if (adapter?.supports(request.state)) {
      const response = await adapter.check(request);
      if (response.status !== 'error') setCache(key, response);
      return response;
    }
  }

  if (!cap.automatedLookupSupported || method === 'none') {
    return unsupportedStateRegistryAdapter.check(request);
  }

  return unsupportedStateRegistryAdapter.check(request);
}

export function logNameCheckHealth(entry: {
  state: string;
  status: string;
  adapter: string;
  latencyMs: number;
  errorCode?: string;
}): void {
  const payload = {
    event: 'business_name_check',
    state: entry.state,
    status: entry.status,
    adapter: entry.adapter,
    latencyMs: entry.latencyMs,
    errorCode: entry.errorCode,
  };
  if (typeof console !== 'undefined') {
    console.info(JSON.stringify(payload));
  }
}
