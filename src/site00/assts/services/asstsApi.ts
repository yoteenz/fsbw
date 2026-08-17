import { apiFetch } from '../../../utils/api.js';

async function asstsFetch<T>(action: string, init?: RequestInit & { query?: Record<string, string> }): Promise<T> {
  const q = new URLSearchParams({ action, ...(init?.query ?? {}) });
  const res = await apiFetch(`/api/admin/site00-assts?${q}`, init);
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `ASSTS API ${res.status}`);
  return data;
}

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
  priorityBatch: AsstsBatchDetail | null;
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
  const res = await apiFetch('/api/admin/site00-assts?action=bootstrap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'bootstrap', batchKey }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Bootstrap failed');
  return data;
}

export async function generateAsstsBatch(batchKey = 'BATCH-ASSTS-ENV-001') {
  const res = await apiFetch('/api/admin/site00-assts?action=generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'generate', batchKey }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Generate failed');
  return data;
}

export async function approveAsstsAsset(assetId: string, versionId: string) {
  const res = await apiFetch('/api/admin/site00-assts?action=approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'approve', assetId, versionId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Approve failed');
  return data as { ok: boolean; nextAssetId: string | null };
}

export async function rejectAsstsAsset(assetId: string, versionId: string, note?: string, categories?: string[]) {
  const res = await apiFetch('/api/admin/site00-assts?action=reject', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'reject', assetId, versionId, note, categories }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Reject failed');
  return data;
}

export async function regenerateAsstsAsset(assetId: string, categories: string[], note?: string) {
  const res = await apiFetch('/api/admin/site00-assts?action=regenerate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'regenerate', assetId, categories, note }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Regenerate failed');
  return data;
}

export async function lockAsstsBatch(batchId: string) {
  const res = await apiFetch('/api/admin/site00-assts?action=lock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'lock', batchId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Lock failed');
  return data;
}

export async function pollAsstsJobs() {
  return asstsFetch<{ ok: boolean; completed: number }>('poll');
}
