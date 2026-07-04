import {
  adminApiAuthErrorMessage,
  apiFetch,
  ensureApiAccessToken,
} from '../../../utils/api';
import type { GenerateStudioAssetRequest } from '../../../utils/adminStudioAssetGenerationPipeline';

export type StudioGenerateAssetResponse = {
  ok: boolean;
  publicUrl?: string;
  storagePath?: string;
  model?: string;
  error?: string;
  code?: string;
};

export type StudioReplaceAssetResponse = {
  ok: boolean;
  publicUrl?: string;
  storagePath?: string;
  error?: string;
  code?: string;
};

type StudioAssetApiErrorBody = {
  error?: string;
  code?: string;
};

function parseStudioAssetResponse<T extends StudioAssetApiErrorBody>(
  res: Response,
  text: string,
  fallback: string
): T | { ok: false; error: string; code?: string } {
  let data: T = {} as T;
  try {
    data = text ? (JSON.parse(text) as T) : ({} as T);
  } catch {
    data = {} as T;
  }
  if (!res.ok) {
    const code = typeof data.code === 'string' ? data.code : undefined;
    return {
      ok: false,
      error: adminApiAuthErrorMessage(res.status, data.error, code) || fallback,
      code,
    };
  }
  return data;
}

export async function requestStudioAssetGeneration(
  payload: GenerateStudioAssetRequest
): Promise<StudioGenerateAssetResponse> {
  const token = await ensureApiAccessToken();
  if (!token) {
    return {
      ok: false,
      error: adminApiAuthErrorMessage(401, 'Sign in required', 'MISSING_TOKEN'),
      code: 'MISSING_TOKEN',
    };
  }

  const res = await apiFetch('/api/admin/studio-generate-asset', {
    method: 'POST',
    body: payload,
  });
  const text = await res.text();
  const parsed = parseStudioAssetResponse<StudioGenerateAssetResponse>(
    res,
    text,
    `Generation failed (${res.status})`
  );
  if ('ok' in parsed && parsed.ok === false) return parsed;
  return parsed as StudioGenerateAssetResponse;
}

export async function requestStudioAssetReplace(payload: {
  studioId: string;
  variantId: string;
  imageDataUrl: string;
}): Promise<StudioReplaceAssetResponse> {
  const token = await ensureApiAccessToken();
  if (!token) {
    return {
      ok: false,
      error: adminApiAuthErrorMessage(401, 'Sign in required', 'MISSING_TOKEN'),
      code: 'MISSING_TOKEN',
    };
  }

  const res = await apiFetch('/api/admin/studio-replace-asset', {
    method: 'POST',
    body: payload,
  });
  const text = await res.text();
  const parsed = parseStudioAssetResponse<StudioReplaceAssetResponse>(
    res,
    text,
    `Replace failed (${res.status})`
  );
  if ('ok' in parsed && parsed.ok === false) return parsed;
  return parsed as StudioReplaceAssetResponse;
}

export async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read image file'));
    reader.readAsDataURL(file);
  });
}
