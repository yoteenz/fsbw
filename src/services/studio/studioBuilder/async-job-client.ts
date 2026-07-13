import { apiFetch } from '../../../utils/api';
import type { GovernedGenerationJobStatusResponse } from '../../../studio-os-core/creative-production/governed-generation-job';
import { governedGenerationJobStorageKey } from '../../../studio-os-core/creative-production/governed-generation-job';

const JOB_STORAGE_PREFIX = 'studio-governed-gen-job:';
const DEFAULT_POLL_INTERVAL_MS = 2500;
const MAX_POLL_INTERVAL_MS = 12000;
const DEFAULT_MONITOR_TIMEOUT_MS = 20 * 60 * 1000;

export type PersistedGovernedGenerationJob = {
  jobId: string;
  statusUrl: string;
  traceId: string;
  compileRunId: string | null;
  stationId: string | null;
  layerKey: string;
  savedAt: number;
};

export function savePersistedGovernedGenerationJob(record: PersistedGovernedGenerationJob): void {
  try {
    localStorage.setItem(`${JOB_STORAGE_PREFIX}${record.layerKey}`, JSON.stringify(record));
  } catch {
    /* ignore quota */
  }
}

export function loadPersistedGovernedGenerationJob(layerKey: string): PersistedGovernedGenerationJob | null {
  try {
    const raw = localStorage.getItem(`${JOB_STORAGE_PREFIX}${layerKey}`);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedGovernedGenerationJob;
  } catch {
    return null;
  }
}

export function clearPersistedGovernedGenerationJob(layerKey: string): void {
  try {
    localStorage.removeItem(`${JOB_STORAGE_PREFIX}${layerKey}`);
  } catch {
    /* ignore */
  }
}

export function buildGovernedGenerationLayerKey(payload: {
  compileRunId?: string;
  stationId?: string;
  productionGroupId: string;
  heroAssetId: string;
}): string {
  return governedGenerationJobStorageKey(
    payload.compileRunId ?? null,
    payload.stationId ?? null,
    `${payload.productionGroupId}:${payload.heroAssetId}`
  );
}

export async function fetchGovernedGenerationJobStatus(jobId: string): Promise<GovernedGenerationJobStatusResponse> {
  const res = await apiFetch(`/api/admin/studio-generation-status?jobId=${encodeURIComponent(jobId)}`, {
    method: 'GET',
  });
  const text = await res.text();
  let data: GovernedGenerationJobStatusResponse;
  try {
    data = text
      ? (JSON.parse(text) as GovernedGenerationJobStatusResponse)
      : {
          ok: false,
          jobId,
          status: 'failed',
          progressPhase: 'failed',
          progressPct: 0,
          providerState: null,
          traceId: '',
          errorCategory: 'client-status-fetch-failed',
          errorMessage: 'Empty status response',
        };
  } catch {
    data = {
      ok: false,
      jobId,
      status: 'failed',
      progressPhase: 'failed',
      progressPct: 0,
      providerState: null,
      traceId: '',
      errorCategory: 'client-status-fetch-failed',
      errorMessage: 'Invalid status JSON',
    };
  }
  if (!res.ok) {
    return {
      ...data,
      ok: false,
      errorCategory: data.errorCategory ?? 'client-status-fetch-failed',
      errorMessage: data.errorMessage ?? `Status fetch failed (${res.status})`,
    };
  }
  return data;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function pollGovernedGenerationJobUntilComplete(
  jobId: string,
  options?: {
    maxMs?: number;
    onProgress?: (status: GovernedGenerationJobStatusResponse) => void;
    signal?: AbortSignal;
  }
): Promise<GovernedGenerationJobStatusResponse> {
  const deadline = Date.now() + (options?.maxMs ?? DEFAULT_MONITOR_TIMEOUT_MS);
  let interval = DEFAULT_POLL_INTERVAL_MS;

  while (Date.now() < deadline) {
    if (options?.signal?.aborted) {
      throw new Error('Generation monitoring cancelled');
    }
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      await sleep(Math.min(interval * 2, MAX_POLL_INTERVAL_MS));
    }

    const status = await fetchGovernedGenerationJobStatus(jobId);
    options?.onProgress?.(status);

    if (status.status === 'complete' && status.publicUrl) {
      return status;
    }
    if (status.status === 'failed' || status.status === 'expired') {
      throw new Error(status.errorMessage ?? 'Generation job failed');
    }

    await sleep(interval);
    interval = Math.min(Math.round(interval * 1.25), MAX_POLL_INTERVAL_MS);
  }

  throw new Error('Generation monitoring timed out — job continues server-side; reopen to resume');
}

export async function resumePersistedGovernedGenerationJob(
  layerKey: string,
  options?: {
    onProgress?: (status: GovernedGenerationJobStatusResponse) => void;
    signal?: AbortSignal;
  }
): Promise<GovernedGenerationJobStatusResponse | null> {
  const persisted = loadPersistedGovernedGenerationJob(layerKey);
  if (!persisted?.jobId) return null;
  const status = await fetchGovernedGenerationJobStatus(persisted.jobId);
  if (status.status === 'complete' && status.publicUrl) {
    clearPersistedGovernedGenerationJob(layerKey);
    return status;
  }
  if (status.status === 'failed' || status.status === 'expired') {
    clearPersistedGovernedGenerationJob(layerKey);
    throw new Error(status.errorMessage ?? 'Persisted generation job failed');
  }
  return pollGovernedGenerationJobUntilComplete(persisted.jobId, options);
}
