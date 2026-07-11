import {
  adminApiAuthErrorMessage,
  apiFetch,
  ensureApiAccessToken,
} from '../../../utils/api';

import type { ProductionAuthorization } from '../../../studio-os-core/creative-production/types';

export type StudioBuilderGeneratePayload = {
  departmentId: string;
  packageId: string;
  projectId: string;
  productionGroupId: string;
  heroAssetId: string;
  prompt: string;
  aspectRatio: string;
  outputFormat: 'png' | 'webp';
  /** When true, bypass CIE reuse-only gate for explicit layer generation */
  forceGenerate?: boolean;
  /** Shell placement URL only — Scene Assembly Law: never prior generative layers */
  referenceImageUrls?: string[];
  /** Experience Lab validation compile — server-issued ephemeral authorization */
  validationMode?: boolean;
  productionAuthorizationId?: string;
  productionAuthorization?: ProductionAuthorization;
  compileRunId?: string;
  previewSessionId?: string;
  org_id?: string;
  stationId?: string;
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
