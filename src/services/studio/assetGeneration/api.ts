import { apiFetch } from '../../../utils/api';
import type { GenerateStudioAssetRequest } from '../../../utils/adminStudioAssetGenerationPipeline';

export type StudioGenerateAssetResponse = {
  ok: boolean;
  publicUrl?: string;
  storagePath?: string;
  model?: string;
  error?: string;
};

export type StudioReplaceAssetResponse = {
  ok: boolean;
  publicUrl?: string;
  storagePath?: string;
  error?: string;
};

export async function requestStudioAssetGeneration(
  payload: GenerateStudioAssetRequest
): Promise<StudioGenerateAssetResponse> {
  const res = await apiFetch('/api/admin/studio-generate-asset', {
    method: 'POST',
    body: payload,
  });
  const data = (await res.json().catch(() => ({}))) as StudioGenerateAssetResponse;
  if (!res.ok) {
    return { ok: false, error: data.error || `Generation failed (${res.status})` };
  }
  return data;
}

export async function requestStudioAssetReplace(payload: {
  studioId: string;
  variantId: string;
  imageDataUrl: string;
}): Promise<StudioReplaceAssetResponse> {
  const res = await apiFetch('/api/admin/studio-replace-asset', {
    method: 'POST',
    body: payload,
  });
  const data = (await res.json().catch(() => ({}))) as StudioReplaceAssetResponse;
  if (!res.ok) {
    return { ok: false, error: data.error || `Replace failed (${res.status})` };
  }
  return data;
}

export async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read image file'));
    reader.readAsDataURL(file);
  });
}
