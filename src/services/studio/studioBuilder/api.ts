import {
  adminApiAuthErrorMessage,
  apiFetch,
  ensureApiAccessToken,
} from '../../../utils/api';
import { recordGenerationRequestHttpForensic } from '../../../studio-os/diagnostics/world-compiler-investigation/generation-request-forensic';
import {
  recordGspuAuthorization,
  recordGspuAwait,
  recordGspuFetch,
  recordGspuSubStage,
  trackGspuInFlightRequest,
} from '../../../studio-os/diagnostics/world-compiler-investigation/generate-shell-dispatch-desk';
import { isWorldCompilerDiagnosticMode } from '../../../studio-os/diagnostics/world-compiler-investigation/diagnostic-mode';

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
  const diag = isWorldCompilerDiagnosticMode();
  const promiseKey = `studio-builder:${payload.compileRunId ?? payload.projectId}:${payload.departmentId}`;

  const runRequest = async (): Promise<StudioBuilderGenerateApiResponse> => {
    if (diag) {
      recordGspuFetch({ requestHelperEntered: true });
      recordGspuSubStage('GSPU-07-token-ensure-enter', 'running');
      recordGspuAuthorization({ tokenEnsureEntered: true });
      recordGspuAwait('ensureApiAccessToken');
    }

    const tokenStarted = Date.now();
    const token = await ensureApiAccessToken();

    if (diag) {
      recordGspuSubStage('GSPU-07-token-ensure-enter', 'success');
      recordGspuAuthorization({
        tokenEnsureReturned: true,
        tokenPresent: Boolean(token),
        authorizationWaitDurationMs: Date.now() - tokenStarted,
      });
      recordGspuSubStage('GSPU-11-token-ensure-return', token ? 'success' : 'failed', token ? 'token-present' : 'token-missing');
    }

    if (!token) {
      if (diag) {
        recordGspuSubStage('GSPU-11b-token-missing', 'success', 'early-return-no-fetch');
        recordGspuFetch({ fetchStarted: false, lastPreFetchStep: 'GSPU-11b-token-missing' });
      }
      return {
        ok: false,
        error: adminApiAuthErrorMessage(401, 'Sign in required', 'MISSING_TOKEN'),
        code: 'MISSING_TOKEN',
      };
    }

    const endpoint = '/api/admin/studio-builder-generate';
    if (diag) {
      recordGspuSubStage('GSPU-12-endpoint-resolve', 'success', endpoint);
      recordGspuFetch({ endpoint, method: 'POST' });
      recordGspuSubStage('GSPU-13-headers-body-prep', 'running');
      recordGspuFetch({ headersPrepared: true, bodySerialized: true });
      recordGspuSubStage('GSPU-13-headers-body-prep', 'success');
      recordGspuSubStage('GSPU-14-fetch-about-to-start', 'running');
      recordGspuFetch({ fetchAboutToStart: true });
      recordGspuAwait('apiFetch');
    }

    const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (diag) {
      recordGspuSubStage('GSPU-14-fetch-about-to-start', 'success');
      recordGspuSubStage('GSPU-15-fetch-started', 'running');
      recordGspuFetch({ fetchStarted: true });
    }

    let res: Response;
    try {
      res = await apiFetch(endpoint, {
        method: 'POST',
        body: payload,
      });
      if (diag) {
        recordGspuSubStage('GSPU-15-fetch-started', 'success');
        recordGspuSubStage('GSPU-16-fetch-response', 'success', String(res.status));
        recordGspuFetch({ fetchResolved: true, responseStatus: res.status });
      }
    } catch (fetchErr) {
      if (diag) {
        recordGspuFetch({
          fetchRejected: true,
          fetchStarted: true,
        });
        recordGspuSubStage('GSPU-15-fetch-started', 'failed', fetchErr instanceof Error ? fetchErr.message : 'fetch threw');
      }
      throw fetchErr;
    }

    if (diag) {
      recordGspuSubStage('GSPU-17-response-text', 'running');
      recordGspuFetch({ responseBodyParseStarted: true });
      recordGspuAwait('res.text()');
    }

    const text = await res.text();
    const elapsedMs = Math.round(
      (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt
    );
    const contentType = res.headers.get('content-type');

    if (diag) {
      recordGspuSubStage('GSPU-17-response-text', 'success', `${text.length}b`);
      recordGspuSubStage('GSPU-18-response-parse', 'running');
      recordGspuFetch({ contentType });
    }

    let data: StudioBuilderGenerateApiResponse = { ok: false };
    let jsonParseSucceeded = true;
    try {
      data = text ? (JSON.parse(text) as StudioBuilderGenerateApiResponse) : { ok: false };
      if (diag) {
        recordGspuSubStage('GSPU-18-response-parse', 'success');
        recordGspuFetch({ responseBodyParseCompleted: true });
      }
    } catch {
      jsonParseSucceeded = false;
      data = { ok: false, error: `Generation failed (${res.status})` };
      if (diag) {
        recordGspuSubStage('GSPU-18-response-parse', 'failed');
        recordGspuFetch({ responseBodyParseFailed: true });
      }
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
      if (diag) recordGspuSubStage('GSPU-19-forensic-record', 'running');
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
      if (diag) recordGspuSubStage('GSPU-19-forensic-record', 'success');
      return failure;
    }
    const success = data;
    if (diag) recordGspuSubStage('GSPU-19-forensic-record', 'running');
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
    if (diag) recordGspuSubStage('GSPU-19-forensic-record', 'success');
    return success;
  };

  if (!diag) return runRequest();

  const tracked = trackGspuInFlightRequest(promiseKey, runRequest(), 'requestStudioBuilderGenerate');
  return tracked.promise as Promise<StudioBuilderGenerateApiResponse>;
}
