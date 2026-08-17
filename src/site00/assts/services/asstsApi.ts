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
    if (/DEPLOYMENT_DISABLED|Payment required/i.test(trimmed)) {
      throw new Error(
        'Vercel API is unavailable (deployment disabled on the proxy target). Refresh after the dev server restarts — ASSTS now uses a local API on preview.',
      );
    }
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

function throwAsstsApiError(res: Response, data: { error?: string; code?: string }) {
  if (res.status === 401 || data.code === 'MISSING_TOKEN') {
    throw new Error('Sign in as an admin to access ASSTS.');
  }
  if (data.code === 'NOT_ADMIN') {
    throw new Error('Your account does not have ASSTS admin access.');
  }
  throw new Error(data.error ?? `ASSTS API ${res.status}`);
}

async function asstsFetch<T>(action: string, init?: AsstsFetchInit): Promise<T> {
  const { query, body, ...fetchInit } = init ?? {};
  const q = new URLSearchParams({ action, ...(query ?? {}) });
  const res = await apiFetch(`/api/admin/site00-assts?${q}`, {
    ...fetchInit,
    ...(body !== undefined ? { body } : {}),
  });
  const data = await parseAsstsJson<T & { error?: string; code?: string }>(res);
  if (!res.ok) throwAsstsApiError(res, data);
  return data;
}

async function asstsPost<T>(action: string, body: Record<string, unknown>): Promise<T> {
  const res = await apiFetch(`/api/admin/site00-assts?action=${encodeURIComponent(action)}`, {
    method: 'POST',
    body: { action, ...body },
  });
  const data = await parseAsstsJson<T & { error?: string; code?: string }>(res);
  if (!res.ok) throwAsstsApiError(res, data);
  return data;
}

export type AsstsBatchSummary = {
  id: string;
  batch_key: string;
  display_name: string;
  status: string;
  category: string | null;
  counts: { total: number; approved: number; needsReview: number };
  thumbnailUrl: string | null;
};

/** Tolerate legacy API rows (raw site00_batches) missing enriched `counts`. */
export function normalizeBatchSummary(raw: Record<string, unknown>): AsstsBatchSummary {
  const countsRaw = raw.counts as Partial<AsstsBatchSummary['counts']> | undefined;
  const totalFromRow = typeof raw.total_assets === 'number' ? raw.total_assets : undefined;
  return {
    id: String(raw.id ?? ''),
    batch_key: String(raw.batch_key ?? 'BATCH'),
    display_name: String(raw.display_name ?? raw.batch_key ?? 'Batch'),
    status: String(raw.status ?? 'DRAFT'),
    category: (raw.category as string | null) ?? null,
    counts: {
      total: countsRaw?.total ?? totalFromRow ?? 0,
      approved: countsRaw?.approved ?? 0,
      needsReview: countsRaw?.needsReview ?? 0,
    },
    thumbnailUrl: (raw.thumbnailUrl as string | null) ?? null,
  };
}

function normalizeBatchDetail(raw: Record<string, unknown>): AsstsBatchDetail {
  const countsRaw = raw.counts as Partial<AsstsBatchDetail['counts']> | undefined;
  const assets = Array.isArray(raw.assets) ? (raw.assets as AsstsAssetDetail[]) : [];
  const totalFallback = typeof raw.total_assets === 'number' ? raw.total_assets : assets.length;
  const counts = {
    total: countsRaw?.total ?? totalFallback,
    approved: countsRaw?.approved ?? 0,
    needsReview: countsRaw?.needsReview ?? 0,
    regenerating: countsRaw?.regenerating ?? 0,
    rejected: countsRaw?.rejected ?? 0,
  };
  const progressPercent =
    typeof raw.progressPercent === 'number'
      ? raw.progressPercent
      : counts.total > 0
        ? Math.round((counts.approved / counts.total) * 100)
        : 0;
  return {
    id: String(raw.id ?? ''),
    batch_key: String(raw.batch_key ?? 'BATCH'),
    display_name: String(raw.display_name ?? raw.batch_key ?? 'Batch'),
    category: (raw.category as string | null) ?? null,
    status: String(raw.status ?? 'DRAFT'),
    assets,
    counts,
    thumbnailUrl: (raw.thumbnailUrl as string | null) ?? null,
    progressPercent,
  };
}

function normalizeLibraryResponse(data: AsstsLibraryResponse): AsstsLibraryResponse {
  const summary = data.summary ?? {
    totalAssets: 0,
    batches: 0,
    needsReview: 0,
    approved: 0,
    locked: 0,
    batchesList: [],
  };
  return {
    ...data,
    summary: {
      ...summary,
      batchesList: (summary.batchesList ?? []).map((b) =>
        normalizeBatchSummary(b as unknown as Record<string, unknown>),
      ),
    },
    categories: (data.categories ?? []).map((c) => ({
      ...c,
      count: c.count ?? 0,
      coverUrl: c.coverUrl ?? null,
    })),
    priorityBatch: data.priorityBatch
      ? normalizeBatchDetail(data.priorityBatch as unknown as Record<string, unknown>)
      : null,
  };
}

export type AsstsLibraryCategory = {
  id: string;
  label: string;
  count: number;
  coverUrl?: string | null;
};

export type AsstsLibraryResponse = {
  ok: boolean;
  summary: {
    totalAssets: number;
    batches: number;
    needsReview: number;
    approved: number;
    locked: number;
    batchesList: AsstsBatchSummary[];
  };
  categories: AsstsLibraryCategory[];
  priorityBatch: AsstsBatchDetail | null;
  filteredAssets?: AsstsAssetDetail[] | null;
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
  thumbnailUrl?: string | null;
  progressPercent?: number;
};

export type AsstsAssetVersion = {
  id: string;
  version_number: number;
  previewUrl: string | null;
  fileUrl?: string | null;
  status: string;
  generation_provider?: string | null;
  generation_model?: string | null;
  prompt_version?: string | null;
  prompt_snapshot?: string | null;
  created_at?: string;
};

export type AsstsAssetDetail = {
  id: string;
  asset_key: string;
  display_name: string;
  asset_type?: string | null;
  batch_id: string | null;
  batch_key?: string | null;
  batch_display_name?: string | null;
  status: string;
  required: boolean;
  approved_version_id: string | null;
  semantic_slot_key?: string | null;
  currentVersion: AsstsAssetVersion | null;
  approvedVersion?: AsstsAssetVersion | null;
  versions: AsstsAssetVersion[];
};

export type AsstsAssetNavigation = {
  prevAssetId: string | null;
  nextAssetId: string | null;
  position: number;
  total: number;
};

export type SlotResolution = {
  ok: boolean;
  resolved: { slotKey: string; source: 'locked' | 'fallback'; url: string | null; thumbnailUrl?: string | null };
};

export async function fetchAsstsLibrary(params?: {
  status?: string;
  category?: string;
  view?: string;
}): Promise<AsstsLibraryResponse> {
  const query: Record<string, string> = {};
  if (params?.status) query.status = params.status;
  if (params?.category) query.category = params.category;
  if (params?.view) query.view = params.view;
  const data = await asstsFetch<AsstsLibraryResponse>('library', { query });
  return normalizeLibraryResponse(data);
}

export async function fetchAsstsAssets(params?: { status?: string; category?: string }) {
  const query: Record<string, string> = {};
  if (params?.status) query.status = params.status;
  if (params?.category) query.category = params.category;
  return asstsFetch<{ ok: boolean; assets: AsstsAssetDetail[] }>('assets', { query });
}

export async function fetchAsstsBatch(batchId: string): Promise<{ ok: boolean; batch: AsstsBatchDetail }> {
  const data = await asstsFetch<{ ok: boolean; batch: AsstsBatchDetail }>('batch', { query: { batchId } });
  return { ok: data.ok, batch: normalizeBatchDetail(data.batch as unknown as Record<string, unknown>) };
}

export async function fetchAsstsAsset(assetId: string): Promise<{
  ok: boolean;
  asset: AsstsAssetDetail;
  history: unknown[];
  navigation: AsstsAssetNavigation;
}> {
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
