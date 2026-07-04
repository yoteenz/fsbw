import { useCallback, useMemo, useState } from 'react';
import { getAccessToken } from '../utils/api';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';
import type {
  ProductAssetFactoryJobRecord,
  ProductAssetFactoryLogRecord,
  ProductAssetFactoryStage,
  ProductAssetRegistryRecord,
} from '../studio-os/product-photography/ProductAssetFactory';

export type ProductAssetFactoryStore = {
  jobs: ProductAssetFactoryJobRecord[];
  registry: ProductAssetRegistryRecord[];
  logs: ProductAssetFactoryLogRecord[];
};

function readStore(): ProductAssetFactoryStore {
  return (
    readStudioJson<ProductAssetFactoryStore>(ADMIN_STUDIO_STORAGE_KEYS.brandAssetsProductAssetFactory) ?? {
      jobs: [],
      registry: [],
      logs: [],
    }
  );
}

function writeStore(store: ProductAssetFactoryStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.brandAssetsProductAssetFactory, store);
}

export function getLatestProductAssetFactoryJob(unitSlug: string): ProductAssetFactoryJobRecord | undefined {
  return readStore()
    .jobs.filter((j) => j.unitSlug === unitSlug)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
}

export async function runProductAssetFactoryApi(opts: {
  action?: 'run' | 'retry';
  unitSlug?: string;
  fromStage?: ProductAssetFactoryStage;
  masterHeroSrc?: string;
}): Promise<{ ok: boolean; job?: ProductAssetFactoryJobRecord; registry?: ProductAssetRegistryRecord[]; logs?: ProductAssetFactoryLogRecord[]; error?: string }> {
  const token = await getAccessToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch('/api/admin/product-asset-factory-run', {
    method: 'POST',
    headers,
    body: JSON.stringify(opts),
  });
  const data = (await res.json()) as {
    ok?: boolean;
    job?: ProductAssetFactoryJobRecord;
    registry?: ProductAssetRegistryRecord[];
    logs?: ProductAssetFactoryLogRecord[];
    error?: string;
  };
  return {
    ok: Boolean(data.ok),
    job: data.job,
    registry: data.registry,
    logs: data.logs,
    error: data.error ?? (res.ok ? undefined : `HTTP ${res.status}`),
  };
}

export function persistProductAssetFactoryResult(result: {
  job: ProductAssetFactoryJobRecord;
  registry: ProductAssetRegistryRecord[];
  logs: ProductAssetFactoryLogRecord[];
}): ProductAssetFactoryStore {
  const prev = readStore();
  const registryById = new Map(prev.registry.map((r) => [r.id, r]));
  for (const r of result.registry) registryById.set(r.id, r);
  const next: ProductAssetFactoryStore = {
    jobs: [result.job, ...prev.jobs.filter((j) => j.id !== result.job.id)].slice(0, 20),
    registry: Array.from(registryById.values()),
    logs: [...result.logs, ...prev.logs].slice(0, 200),
  };
  writeStore(next);
  return next;
}

export function useAdminStudioBrandAssetsProductAssetFactory() {
  const [store, setStore] = useState<ProductAssetFactoryStore>(() => readStore());
  const [running, setRunning] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const latestJob = useMemo(
    () => store.jobs.find((j) => j.unitSlug === 'soft-wave'),
    [store.jobs]
  );

  const runPipeline = useCallback(async (opts?: { retryFrom?: ProductAssetFactoryStage; masterHeroSrc?: string }) => {
    setRunning(true);
    setLastError(null);
    try {
      const result = await runProductAssetFactoryApi({
        action: opts?.retryFrom ? 'retry' : 'run',
        unitSlug: 'soft-wave',
        fromStage: opts?.retryFrom,
        masterHeroSrc: opts?.masterHeroSrc,
      });
      if (result.job && result.registry && result.logs) {
        const next = persistProductAssetFactoryResult({
          job: result.job,
          registry: result.registry,
          logs: result.logs,
        });
        setStore(next);
      }
      if (!result.ok) setLastError(result.error ?? 'Pipeline failed');
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLastError(msg);
      return { ok: false, error: msg };
    } finally {
      setRunning(false);
    }
  }, []);

  const publishJob = useCallback((jobId: string) => {
    setStore((prev) => {
      const next = {
        ...prev,
        jobs: prev.jobs.map((j) =>
          j.id === jobId ? { ...j, stage: 'published' as ProductAssetFactoryStage, lastUpdated: new Date().toISOString() } : j
        ),
        registry: prev.registry.map((r) =>
          prev.jobs.find((j) => j.id === jobId)?.registryEntryIds.includes(r.id)
            ? { ...r, status: 'published' as const, lastUpdated: new Date().toISOString().slice(0, 10) }
            : r
        ),
      };
      writeStore(next);
      return next;
    });
  }, []);

  return { store, latestJob, running, lastError, runPipeline, publishJob };
}
