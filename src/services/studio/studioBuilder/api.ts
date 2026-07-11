import {
  adminApiAuthErrorMessage,
  apiFetch,
  ensureApiAccessToken,
} from '../../../utils/api';
import { recordGenerationRequestHttpForensic } from '../../../studio-os/diagnostics/world-compiler-investigation/generation-request-forensic';

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

  const endpoint = '/api/admin/studio-builder-generate';
  const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const res = await apiFetch(endpoint, {
    method: 'POST',
    body: payload,
  });
  const text = await res.text();
  const elapsedMs = Math.round(
    (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt
  );
  const contentType = res.headers.get('content-type');
  let data: StudioBuilderGenerateApiResponse = { ok: false };
  let jsonParseSucceeded = true;
  try {
    data = text ? (JSON.parse(text) as StudioBuilderGenerateApiResponse) : { ok: false };
  } catch {
    jsonParseSucceeded = false;
    data = { ok: false, error: `Generation failed (${res.status})` };
  }
  if (!res.ok) {
    const failure: StudioBuilderGenerateApiResponse = {
      ok: false,
      error:
        adminApiAuthErrorMessage(res.status, data.error, data.code) ||
        data.error ||
        `Generation failed (${res.status})`,
      code: data.code,
    };
    recordGenerationRequestHttpForensic({
      endpoint,
      httpStatus: res.status,
      responseText: text,
      contentType,
      elapsedMs,
      jsonParseSucceeded,
      parsed: data,
      returnedToCaller: failure,
    });
    return failure;
  }
  const success = data;
  recordGenerationRequestHttpForensic({
    endpoint,
    httpStatus: res.status,
    responseText: text,
    contentType,
    elapsedMs,
    jsonParseSucceeded,
    parsed: data,
    returnedToCaller: success,
  });
  return success;
}
