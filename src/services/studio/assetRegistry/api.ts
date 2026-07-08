import {
  adminApiAuthErrorMessage,
  apiFetch,
  ensureApiAccessToken,
} from '../../../utils/api';

export type RegistryAsset = {
  id: string;
  org_id: string;
  name: string;
  category: string;
  department_id: string | null;
  workspace_scene_id: string | null;
  scene_id: string | null;
  generation_pack_id: string | null;
  tags: string[];
  materials: string[];
  lighting_profile: string | null;
  camera_profile: string | null;
  resolution: string | null;
  aspect_ratio: string | null;
  generation_cost: number;
  generation_provider: string | null;
  generation_model: string | null;
  prompt_version: string | null;
  blueprint_version: string | null;
  usage_count: number;
  favorite: boolean;
  archived: boolean;
  artifact_url: string | null;
  reuse_category: string | null;
  similarity_traits: Record<string, unknown>;
  metadata: Record<string, unknown>;
  current_version: number;
  created_at: string;
  updated_at: string;
};

export type CreateAssetPayload = {
  org_id?: string;
  name: string;
  category: string;
  department_id?: string | null;
  workspace_scene_id?: string | null;
  scene_id?: string | null;
  generation_pack_id?: string | null;
  tags?: string[];
  materials?: string[];
  lighting_profile?: string | null;
  camera_profile?: string | null;
  resolution?: string | null;
  aspect_ratio?: string | null;
  generation_cost?: number;
  generation_provider?: string | null;
  generation_model?: string | null;
  prompt_version?: string | null;
  blueprint_version?: string | null;
  artifact_url?: string | null;
  reuse_category?: string | null;
  similarity_traits?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

export type AssetSearchParams = {
  org_id?: string;
  q?: string;
  category?: string;
  department_id?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
};

export type ReuseRecommendation = {
  asset_id: string;
  name: string;
  category: string;
  compatibility_score: number;
  match_type: 'exact' | 'close' | 'partial';
  estimated_savings: number;
  usage_count: number;
  reason: string;
};

type ApiError = { ok: false; error: string; code?: string };

async function registryFetch<T>(
  path: string,
  init?: { method?: string; body?: unknown }
): Promise<T | ApiError> {
  const token = await ensureApiAccessToken();
  if (!token) {
    return {
      ok: false,
      error: adminApiAuthErrorMessage(401, 'Sign in required', 'MISSING_TOKEN'),
      code: 'MISSING_TOKEN',
    };
  }

  const res = await apiFetch(path, {
    method: init?.method ?? 'GET',
    body: init?.body,
  });
  const text = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    return { ok: false, error: `Registry request failed (${res.status})` };
  }
  if (!res.ok) {
    return {
      ok: false,
      error:
        adminApiAuthErrorMessage(
          res.status,
          typeof data.error === 'string' ? data.error : undefined,
          typeof data.code === 'string' ? data.code : undefined
        ) ||
        (typeof data.error === 'string' ? data.error : undefined) ||
        `Registry request failed (${res.status})`,
      code: typeof data.code === 'string' ? data.code : undefined,
    };
  }
  return data as T;
}

export async function createRegistryAsset(
  payload: CreateAssetPayload
): Promise<{ ok: true; asset: RegistryAsset } | ApiError> {
  return registryFetch('/api/admin/studio-asset-registry', {
    method: 'POST',
    body: payload,
  });
}

export async function getRegistryAsset(
  assetId: string,
  orgId = 'frontal-slayer'
): Promise<{ ok: true; asset: RegistryAsset } | ApiError> {
  return registryFetch(
    `/api/admin/studio-asset-registry?action=get&id=${encodeURIComponent(assetId)}&org_id=${encodeURIComponent(orgId)}`
  );
}

export async function searchRegistryAssets(
  params: AssetSearchParams
): Promise<{ ok: true; assets: RegistryAsset[]; total: number } | ApiError> {
  const orgId = params.org_id ?? 'frontal-slayer';
  const qs = new URLSearchParams({ action: 'search', org_id: orgId });
  if (params.q) qs.set('q', params.q);
  if (params.category) qs.set('category', params.category);
  if (params.department_id) qs.set('department_id', params.department_id);
  if (params.tags?.length) qs.set('tags', params.tags.join(','));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.offset) qs.set('offset', String(params.offset));
  return registryFetch(`/api/admin/studio-asset-registry?${qs.toString()}`);
}

export async function getRelatedRegistryAssets(
  assetId: string,
  orgId = 'frontal-slayer'
): Promise<
  | {
      ok: true;
      outgoing: unknown[];
      incoming: unknown[];
      linked_assets: RegistryAsset[];
    }
  | ApiError
> {
  return registryFetch(
    `/api/admin/studio-asset-registry?action=related&asset_id=${encodeURIComponent(assetId)}&org_id=${encodeURIComponent(orgId)}`
  );
}

export async function getRegistryRecommendations(
  assetId: string,
  orgId = 'frontal-slayer'
): Promise<{ ok: true; recommendations: ReuseRecommendation[] } | ApiError> {
  return registryFetch(
    `/api/admin/studio-asset-registry?action=recommend&asset_id=${encodeURIComponent(assetId)}&org_id=${encodeURIComponent(orgId)}`
  );
}

export async function recordRegistryUsage(
  assetId: string,
  orgId = 'frontal-slayer',
  eventType = 'reuse',
  context: Record<string, unknown> = {}
): Promise<{ ok: true; event: unknown; asset: RegistryAsset } | ApiError> {
  return registryFetch('/api/admin/studio-asset-registry', {
    method: 'POST',
    body: { action: 'record_usage', asset_id: assetId, org_id: orgId, event_type: eventType, context },
  });
}

export async function getRegistryVersions(
  assetId: string,
  orgId = 'frontal-slayer'
): Promise<{ ok: true; versions: unknown[] } | ApiError> {
  return registryFetch(
    `/api/admin/studio-asset-registry?action=versions&asset_id=${encodeURIComponent(assetId)}&org_id=${encodeURIComponent(orgId)}`
  );
}

export async function getRegistryUsageEvents(
  assetId: string,
  orgId = 'frontal-slayer'
): Promise<{ ok: true; events: unknown[] } | ApiError> {
  return registryFetch(
    `/api/admin/studio-asset-registry?action=usage&asset_id=${encodeURIComponent(assetId)}&org_id=${encodeURIComponent(orgId)}`
  );
}
