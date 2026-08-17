import { apiFetch } from '../../../utils/api.js';

type AsstsFetchInit = Omit<RequestInit, 'body'> & {
  query?: Record<string, string>;
  body?: Record<string, unknown>;
};

/** Safari/WebKit throws "The string did not match the expected pattern." on Response.json() when body is HTML. */
async function parseAsstsJson<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') ?? '';
  const raw = await res.text();
  const trimmed = raw.trim();

  if (!trimmed) {
    if (!res.ok) throw new Error(`ASSTS API ${res.status}`);
    return {} as T;
  }

  const looksJson =
    /application\/json/i.test(contentType) || trimmed.startsWith('{') || trimmed.startsWith('[');

  if (!looksJson) {
    if (/^<!DOCTYPE|^<html/i.test(trimmed)) {
      throw new Error(
        'ASSTS API is not reachable (received HTML instead of JSON). Deploy the latest build so /api/admin/site00-assts exists on the API host.',
      );
    }
    throw new Error(trimmed.slice(0, 160) || `ASSTS API ${res.status}`);
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    throw new Error('ASSTS API returned invalid JSON');
  }
}

async function asstsFetch<T>(action: string, init?: AsstsFetchInit): Promise<T> {
  const { query, body, ...fetchInit } = init ?? {};
  const q = new URLSearchParams({ action, ...(query ?? {}) });
  const res = await apiFetch(`/api/admin/site00-assts?${q}`, {
    ...fetchInit,
    ...(body !== undefined ? { body } : {}),
  });
  const data = await parseAsstsJson<T & { error?: string }>(res);
  if (!res.ok) throw new Error(data.error ?? `ASSTS API ${res.status}`);
  return data;
}

async function asstsPost<T>(action: string, body: Record<string, unknown>): Promise<T> {
  const res = await apiFetch(`/api/admin/site00-assts?action=${encodeURIComponent(action)}`, {
    method: 'POST',
    body: { action, ...body },
  });
  const data = await parseAsstsJson<T & { error?: string }>(res);
  if (!res.ok) throw new Error(data.error ?? `ASSTS API ${res.status}`);
  return data;
}

export type AsstsLibraryCategory = {
  id: string;
  label: string;
  count: number;
};

export type AsstsLibraryResponse = {
  ok: boolean;
  summary: {
    totalAssets: number;
    batches: number;
    needsReview: number;
    approved: number;
    locked: number;
    batchesList: Array<{ id: string; batch_key: string; display_name: string; status: string; category: string | null }>;
  };
  categories: AsstsLibraryCategory[];
  priorityBatch: AsstsBatchDetail | null;
  pipeline?: { autoQueued?: boolean; polled?: number };
};

export type AsstsBatchDetail = {
  id: string;
  batch_key: string;
  display_name: string;
  category: string | null;
  status: string;
  assets: AsstsAssetDetail[];
  counts: { total: number; approved: number; needsReview: number; regenerating: number; rejected: number };
};

export type AsstsAssetDetail = {
  id: string;
  asset_key: string;
  display_name: string;
  batch_id: string | null;
  status: string;
  required: boolean;
  approved_version_id: string | null;
  currentVersion: { id: string; version_number: number; previewUrl: string | null; status: string } | null;
  versions: Array<{ id: string; version_number: number; previewUrl: string | null; status: string }>;
};

export type SlotResolution = {
  ok: boolean;
  resolved: { slotKey: string; source: 'locked' | 'fallback'; url: string | null; thumbnailUrl?: string | null };
};

export async function fetchAsstsLibrary(): Promise<AsstsLibraryResponse> {
  return asstsFetch('library');
}

export async function fetchAsstsBatch(batchId: string): Promise<{ ok: boolean; batch: AsstsBatchDetail }> {
  return asstsFetch('batch', { query: { batchId } });
}

export async function fetchAsstsAsset(assetId: string): Promise<{ ok: boolean; asset: AsstsAssetDetail; history: unknown[] }> {
  return asstsFetch('asset', { query: { assetId } });
}

export async function resolveAsstsSlot(slotKey: string): Promise<SlotResolution> {
  return asstsFetch('slots', { query: { slotKey } });
}

export async function bootstrapAsstsBatch(batchKey = 'BATCH-ASSTS-ENV-001') {
  return asstsPost('bootstrap', { batchKey });
}

export async function generateAsstsBatch(batchKey = 'BATCH-ASSTS-ENV-001') {
  return asstsPost('generate', { batchKey });
}

export async function approveAsstsAsset(assetId: string, versionId: string) {
  return asstsPost('approve', { assetId, versionId }) as Promise<{ ok: boolean; nextAssetId: string | null }>;
}

export async function rejectAsstsAsset(assetId: string, versionId: string, note?: string, categories?: string[]) {
  return asstsPost('reject', { assetId, versionId, note, categories });
}

export async function regenerateAsstsAsset(assetId: string, categories: string[], note?: string) {
  return asstsPost('regenerate', { assetId, categories, note });
}

export async function requestAsstsVariant(assetId: string, note?: string) {
  return asstsPost('variant', { assetId, note });
}

export async function addAsstsNote(assetId: string, note: string) {
  return asstsPost('note', { assetId, note });
}

export async function lockAsstsBatch(batchId: string) {
  return asstsPost('lock', { batchId });
}

export async function resetAsstsBatchReview(batchId: string) {
  return asstsPost('reset-review', { batchId });
}

export async function pollAsstsJobs() {
  return asstsFetch<{ ok: boolean; completed: number }>('poll');
}
