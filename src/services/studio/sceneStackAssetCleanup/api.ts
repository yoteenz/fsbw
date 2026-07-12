import { getAccessToken } from '../../../utils/api';

export type SceneStackAssetCleanupPayload = {
  sourceUrl: string;
  assetCandidateId: string;
  layerId: string;
  stationId: string;
  projectId: string;
};

export type SceneStackAssetCleanupResult =
  | { ok: true; cleanedUrl: string; method: 'ideogram' | 'white-studio-fallback' }
  | { ok: false; error: string; code?: string };

export async function requestSceneStackAssetCleanup(
  payload: SceneStackAssetCleanupPayload
): Promise<SceneStackAssetCleanupResult> {
  const token = await getAccessToken();
  const apiBase = import.meta.env.VITE_API_BASE?.trim() || '';
  const url = `${apiBase}/api/admin/scene-stack-asset-cleanup`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    return {
      ok: false,
      error: String(data.error || `Cleanup failed (${res.status})`),
      code: typeof data.code === 'string' ? data.code : undefined,
    };
  }

  const cleanedUrl = String(data.cleanedUrl || '');
  if (!cleanedUrl) {
    return { ok: false, error: 'No cleaned URL returned', code: 'EMPTY_RESPONSE' };
  }

  const method = data.method === 'white-studio-fallback' ? 'white-studio-fallback' : 'ideogram';
  return { ok: true, cleanedUrl, method };
}
