import {
  adminApiAuthErrorMessage,
  apiFetch,
  ensureApiAccessToken,
} from '../../../utils/api';

export type StudioBuilderGeneratePayload = {
  departmentId: string;
  packageId: string;
  projectId: string;
  productionGroupId: string;
  heroAssetId: string;
  prompt: string;
  aspectRatio: string;
  outputFormat: 'png' | 'webp';
};

export type StudioBuilderGenerateApiResponse = {
  ok: boolean;
  publicUrl?: string;
  storagePath?: string;
  model?: string;
  error?: string;
  code?: string;
};

export async function requestStudioBuilderGenerate(
  payload: StudioBuilderGeneratePayload
): Promise<StudioBuilderGenerateApiResponse> {
  const token = await ensureApiAccessToken();
  if (!token) {
    return {
      ok: false,
      error: adminApiAuthErrorMessage(401, 'Sign in required', 'MISSING_TOKEN'),
      code: 'MISSING_TOKEN',
    };
  }

  const res = await apiFetch('/api/admin/studio-builder-generate', {
    method: 'POST',
    body: payload,
  });
  const text = await res.text();
  let data: StudioBuilderGenerateApiResponse = { ok: false };
  try {
    data = text ? (JSON.parse(text) as StudioBuilderGenerateApiResponse) : { ok: false };
  } catch {
    data = { ok: false, error: `Generation failed (${res.status})` };
  }
  if (!res.ok) {
    return {
      ok: false,
      error: adminApiAuthErrorMessage(res.status, data.error, data.code) || data.error || `Generation failed (${res.status})`,
      code: data.code,
    };
  }
  return data;
}
